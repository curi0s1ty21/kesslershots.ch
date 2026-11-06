#!/usr/bin/env python3
"""Receives the website's contact form.

Each message is saved to submissions.jsonl first. Only then is it sent to Telegram,
so a Telegram outage cannot lose a message. Uses only the standard library.

Settings come from the environment: CONTACT_PORT, CONTACT_DATA_DIR, and optionally
TELEGRAM_BOT_TOKEN with TELEGRAM_CHAT_ID. Without those two, messages are only saved.
"""

import collections
import http.server
import json
import os
import pathlib
import re
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid

PATH = "/api/contact"
SENT = "/kontakt.html?sent=1"
FAILED = "/kontakt.html?error=1"
MAX_BODY = 64 * 1024
# Field name -> (label in the Telegram message, longest accepted value, required)
FIELDS = {
    "firstname": ("Vorname", 200, True),
    "lastname": ("Nachname", 200, True),
    "email": ("E-Mail", 320, True),
    "phone": ("Telefon", 100, False),
    "subject": ("Titel", 300, False),
    "package": ("Paket", 100, True),
    "intent": ("Anliegen", 100, True),
    "message": ("Nachricht", 10000, True),
}
EMAIL = re.compile(r"[^@\s]+@[^@\s]+\.[^@\s]+")
PER_IP_LIMIT = (5, 600)  # 5 messages per IP address in 10 minutes
TOTAL_LIMIT = (100, 3600)  # 100 messages in an hour, so spam cannot fill the disk
TELEGRAM_MAX = 4096


def log(text):
    # Never log form contents or the bot token.
    print(text, file=sys.stderr, flush=True)


class ContactForm:
    def __init__(self, data_dir, bot_token="", chat_id="", api_base=None):
        self.file = pathlib.Path(data_dir) / "submissions.jsonl"
        self.bot_token = bot_token
        self.chat_id = chat_id
        self.api_base = api_base or "https://api.telegram.org"
        self.lock = threading.Lock()
        self.recent = collections.defaultdict(collections.deque)

    def submit(self, body, ip):
        """Handle a form body. Returns the page to send the visitor to."""
        try:
            form = urllib.parse.parse_qs(body.decode("utf-8"), max_num_fields=50)
        except (UnicodeDecodeError, ValueError):
            return FAILED
        # Bots fill in this hidden field. Pretend it worked so they do not adapt.
        if form.get("_honey", [""])[0]:
            return SENT

        fields = {}
        for name, (_, longest, required) in FIELDS.items():
            value = form.get(name, [""])[0].strip()
            if len(value) > longest or (required and not value):
                return FAILED
            fields[name] = value
        if not EMAIL.fullmatch(fields["email"]) or "privacy" not in form:
            return FAILED
        if not self._allowed(ip):
            log("Rate limit reached, message rejected")
            return FAILED

        entry = {
            "id": uuid.uuid4().hex,
            "time": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
            "ip": ip,
            **fields,
        }
        try:
            self._save(entry)
        except OSError as error:
            log(f"Could not save message: {error.strerror}")
            return FAILED
        log(f"Saved message {entry['id']}")

        if self.bot_token and self.chat_id:
            threading.Thread(target=self._notify, args=(entry,), daemon=True).start()
        return SENT

    def _allowed(self, ip):
        now = time.monotonic()
        with self.lock:
            limits = ((ip, PER_IP_LIMIT), ("", TOTAL_LIMIT))
            for key, (count, window) in limits:
                times = self.recent[key]
                while times and now - times[0] > window:
                    times.popleft()
                if not times:
                    del self.recent[key]
                elif len(times) >= count:
                    return False
            for key, _ in limits:
                self.recent[key].append(now)
        return True

    def _save(self, entry):
        line = json.dumps(entry, ensure_ascii=False) + "\n"
        with self.lock:
            self.file.parent.mkdir(parents=True, exist_ok=True)
            # Personal data: only the service's own user may read it.
            fd = os.open(self.file, os.O_WRONLY | os.O_CREAT | os.O_APPEND, 0o600)
            with os.fdopen(fd, "w", encoding="utf-8") as out:
                out.write(line)
                out.flush()
                os.fsync(out.fileno())

    def _notify(self, entry):
        lines = ["Neue Anfrage über das Kontaktformular", ""]
        for name, (label, _, _) in FIELDS.items():
            if entry[name] and name != "message":
                lines.append(f"{label}: {entry[name]}")
        lines += ["", entry["message"]]
        # Plain text: no parse_mode, so visitors cannot inject formatting or links.
        payload = urllib.parse.urlencode(
            {"chat_id": self.chat_id, "text": "\n".join(lines)[:TELEGRAM_MAX]}
        ).encode()
        url = f"{self.api_base}/bot{self.bot_token}/sendMessage"

        for attempt in range(3):
            try:
                urllib.request.urlopen(url, data=payload, timeout=15).close()
                log(f"Sent message {entry['id']} to Telegram")
                return
            except urllib.error.HTTPError as error:
                # Do not log the exception's URL: it contains the bot token.
                reason = f"HTTP {error.code}"
            except OSError as error:
                reason = type(error).__name__
            if attempt < 2:
                time.sleep(5 * (attempt + 1))
        log(f"Could not send message {entry['id']} to Telegram ({reason}). It is saved.")


def client_ip(handler):
    """The visitor's address, set by the reverse proxy in front of this service."""
    forwarded = handler.headers.get("X-Real-IP") or handler.headers.get(
        "X-Forwarded-For", ""
    )
    return forwarded.split(",")[0].strip() or handler.client_address[0]


def handle_post(handler, form):
    """Answer a POST to the form's address. Also used by ./dev serve."""
    location = FAILED
    try:
        length = int(handler.headers.get("Content-Length", ""))
    except ValueError:
        length = -1
    kind = handler.headers.get("Content-Type", "").split(";")[0].strip().lower()
    if 0 <= length <= MAX_BODY and kind == "application/x-www-form-urlencoded":
        location = form.submit(handler.rfile.read(length), client_ip(handler))
    else:
        # The rest of the request was not read, so the connection cannot be reused.
        handler.close_connection = True
    handler.send_response(303)
    handler.send_header("Location", location)
    handler.send_header("Content-Length", "0")
    handler.end_headers()


def main():
    form = ContactForm(
        os.environ["CONTACT_DATA_DIR"],
        os.environ.get("TELEGRAM_BOT_TOKEN", ""),
        os.environ.get("TELEGRAM_CHAT_ID", ""),
        os.environ.get("TELEGRAM_API_BASE"),
    )

    class Handler(http.server.BaseHTTPRequestHandler):
        timeout = 15

        def do_POST(self):
            if self.path == PATH:
                handle_post(self, form)
            else:
                self.send_error(404)

        def log_message(self, *args):
            pass

    port = int(os.environ.get("CONTACT_PORT", "7980"))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), Handler)
    telegram = "on" if form.bot_token and form.chat_id else "off"
    log(f"Contact form listening on 127.0.0.1:{port}, Telegram {telegram}")
    server.serve_forever()


if __name__ == "__main__":
    main()
