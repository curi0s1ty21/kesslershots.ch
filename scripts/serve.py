#!/usr/bin/env python3
"""Serve site/ locally, behaving like production.

Paths are case-sensitive, a directory without index.html answers 403 instead of
a file listing, and nothing is cached, so an edit shows on the next reload.

The contact form works too. Messages are saved in .data/contact/ and go to Telegram
only if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are set in the environment.
"""

import argparse
import http.server
import os
import pathlib
import sys

PROJECT = pathlib.Path(__file__).resolve().parent.parent
ROOT = PROJECT / "site"
sys.path.insert(0, str(PROJECT / "server"))
sys.dont_write_bytecode = True

import contact_server  # noqa: E402

FORM = contact_server.ContactForm(
    PROJECT / ".data" / "contact",
    os.environ.get("TELEGRAM_BOT_TOKEN", ""),
    os.environ.get("TELEGRAM_CHAT_ID", ""),
    os.environ.get("TELEGRAM_API_BASE"),
)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_POST(self):
        if self.path == contact_server.PATH:
            contact_server.handle_post(self, FORM)
        else:
            self.send_error(404)

    def list_directory(self, path):
        self.send_error(403, "Directory listing is disabled")
        return None

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=7979)
    parser.add_argument("--bind", default="127.0.0.1")
    args = parser.parse_args()

    server = http.server.ThreadingHTTPServer((args.bind, args.port), Handler)
    print(f"Serving {ROOT} on http://localhost:{args.port}/", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
