#!/usr/bin/env python3
"""Compare every file in site/ with what the live site serves, byte for byte,
apart from JPEG IPTC metadata, which the CDN does not serve consistently.

Exits 1 if any file differs or is missing online. Once improvements start, site/
is meant to differ; until then this proves the clone is exact.
"""

import pathlib
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent / "site"
ORIGIN = "https://kesslershots.ch/"


def without_jpeg_iptc(data):
    """Drop the APP13 segment of a JPEG; other data is returned unchanged.

    The live CDN's edge servers reorder IPTC fields in this segment, so the same
    URL returns different bytes from request to request. The image data is the same.
    """
    if not data.startswith(b"\xff\xd8"):
        return data
    pos = 2
    while pos + 4 <= len(data) and data[pos] == 0xFF and data[pos + 1] != 0xDA:
        end = pos + 2 + int.from_bytes(data[pos + 2 : pos + 4], "big")
        if data[pos + 1] == 0xED:
            return data[:pos] + data[end:]
        pos = end
    return data


def main():
    files = sorted(p for p in ROOT.rglob("*") if p.is_file())
    bad = 0
    for file in files:
        rel = file.relative_to(ROOT).as_posix()
        url = ORIGIN + urllib.parse.quote(rel)
        request = urllib.request.Request(url, headers={"User-Agent": "site-migration"})
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                same = without_jpeg_iptc(response.read()) == without_jpeg_iptc(
                    file.read_bytes()
                )
                result = "same" if same else "DIFFERENT"
        except urllib.error.HTTPError as error:
            same, result = False, f"HTTP {error.code}"
        if not same:
            bad += 1
            print(f"{result}: {rel}")
        time.sleep(0.2)
    print(f"{len(files)} files compared, {bad} differ")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
