#!/usr/bin/env python3
"""List every reference in site/ that points at a file site/ does not have.

Links to the site's own domain count as local. Matching is case-sensitive, like
the server. Exits 1 if anything is broken.
"""

import html.parser
import pathlib
import re
import sys
import urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent.parent / "site"
HOSTS = {"kesslershots.ch", "www.kesslershots.ch"}
ABSOLUTE = re.compile(r"""https?://(?:www\.)?kesslershots\.ch[^\s"'<>\\)]*""")
CSS_URL = re.compile(r"""url\(\s*["']?([^"')]+)""")


class Refs(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.refs = []
        self.template_depth = 0

    def handle_endtag(self, tag):
        if tag == "template":
            self.template_depth -= 1

    def handle_starttag(self, tag, attrs):
        # <template> content is not rendered, like the offline blog.
        if tag == "template":
            self.template_depth += 1
        if self.template_depth:
            return
        for key, value in attrs:
            if not value:
                continue
            if key in ("href", "src", "poster", "data-src"):
                self.refs.append(value)
            elif key == "srcset":
                self.refs += [p.split()[0] for p in value.split(",") if p.strip()]
            elif key == "style":
                self.refs += CSS_URL.findall(value)
            elif key == "content" or key == "value":
                self.refs += ABSOLUTE.findall(value)

    def handle_data(self, data):
        if self.template_depth:
            return
        # Inline CSS and JSON-LD.
        self.refs += CSS_URL.findall(data)
        self.refs += ABSOLUTE.findall(data)


def target(page, ref):
    """Return the path a reference resolves to, or None if it is not local."""
    base = "https://kesslershots.ch/" + urllib.parse.quote(page)
    url = urllib.parse.urlsplit(urllib.parse.urljoin(base, ref.strip()))
    if url.scheme not in ("http", "https") or url.hostname not in HOSTS:
        return None
    return urllib.parse.unquote(url.path)


def exists(path):
    file = ROOT / path.lstrip("/")
    return (file / "index.html").is_file() if file.is_dir() else file.is_file()


def main():
    broken = {}
    pages = sorted(ROOT.rglob("*.html"))
    for file in pages:
        page = file.relative_to(ROOT).as_posix()
        parser = Refs()
        parser.feed(file.read_text(errors="replace"))
        for ref in parser.refs:
            path = target(page, ref)
            if path is not None and not exists(path):
                broken.setdefault(path, set()).add(page)

    for path, sources in sorted(broken.items()):
        print(f"{path}\n    linked from: {', '.join(sorted(sources))}")
    print(f"\n{len(pages)} pages checked, {len(broken)} broken targets")
    sys.exit(1 if broken else 0)


if __name__ == "__main__":
    main()
