#!/usr/bin/env python3
"""Serve site/ locally, behaving like the production nginx.

Paths are case-sensitive, a directory without index.html answers 403 instead of
a file listing, and nothing is cached, so an edit shows on the next reload.
"""

import argparse
import http.server
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent / "site"


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

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
