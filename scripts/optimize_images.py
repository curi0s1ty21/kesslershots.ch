#!/usr/bin/env python3
"""Create responsive AVIF and WebP versions of the site's images and use them.

Writes the versions to site/assets/img/ and wraps each <img> in site/ in a
<picture>, so browsers download only the size and format they need. Originals
stay in place as the fallback for browsers without AVIF or WebP.

Safe to run again: existing files are reused and finished tags are left alone.
Images are never enlarged, so an original's width is the sharpest version.
"""

import hashlib
import pathlib
import re
import unicodedata

from PIL import Image, ImageFilter, ImageOps
from PIL.IptcImagePlugin import getiptcinfo

ROOT = pathlib.Path(__file__).resolve().parent.parent / "site"
OUT = ROOT / "assets" / "img"
PHOTO_WIDTHS = [160, 320, 640, 960, 1280, 1600, 1920, 2560, 3200, 3840]
LOGO_WIDTHS = [96, 192, 288]
# Used by site/assets/site.css, not by an <img>.
CSS_IMAGES = ["Bruecke.jpeg"]

IMG = r"""<img\b(?:[^>"']|"[^"]*"|'[^']*')*>"""
# Comments and finished <picture> elements match first and are kept as they are.
TAG = re.compile(rf"<!--.*?-->|<picture>.*?</picture>|{IMG}", re.S)


def sizes_for(tag):
    """How wide an image is on screen, from its classes. Must follow the layout."""
    rules = [
        (r"\bh-24\b", "96px"),
        (r"\bh-20\b", "80px"),
        (r"\bh-16\b", "64px"),
        (r"\bh-72\b", "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"),
        (r"\bh-(44|48)\b", "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"),
        (r"\bh-auto\b", "(min-width: 1024px) 720px, 100vw"),
        (r"Hochzeit7", "(min-width: 1280px) 1248px, 100vw"),
        (r"Hochzeit[13]\.|Couple1", "(min-width: 768px) 50vw, 100vw"),
        (r"Aline2", "(min-width: 1024px) 40vw, 100vw"),
    ]
    for pattern, sizes in rules:
        if re.search(pattern, tag):
            return sizes
    return "100vw"


def slug(path):
    ascii_name = unicodedata.normalize("NFKD", path.stem).encode("ascii", "ignore")
    return re.sub(r"[^a-z0-9]+", "-", ascii_name.decode().lower()).strip("-")


def credits_exif(image):
    """Carry the original's photographer and copyright credit into the new files."""
    iptc = getiptcinfo(image) or {}
    exif = Image.Exif()
    by = iptc.get((2, 80))
    notice = [iptc[k] for k in ((2, 116), (2, 110)) if iptc.get(k)]
    if by:
        exif[0x013B] = by.decode("utf-8", "replace")
    if notice:
        exif[0x8298] = " / ".join(n.decode("utf-8", "replace") for n in notice)
    return exif


class Library:
    def __init__(self):
        self.by_hash = {}
        self.names = {}

    def versions(self, source):
        """Create the versions of one file. Identical files share one set."""
        digest = hashlib.sha256(source.read_bytes()).hexdigest()
        if digest not in self.by_hash:
            self.by_hash[digest] = self._build(source)
        return self.by_hash[digest]

    def _build(self, source):
        name = slug(source)
        if self.names.setdefault(name, source) != source:
            raise SystemExit(f"Two images would be named {name}: {source}")

        with Image.open(source) as opened:
            exif = credits_exif(opened)
            icc = opened.info.get("icc_profile")
            image = ImageOps.exif_transpose(opened)
            image.load()
        is_logo = source.suffix.lower() == ".png"
        image = image.convert("RGBA" if is_logo else "RGB")

        full = image.width
        candidates = LOGO_WIDTHS if is_logo else PHOTO_WIDTHS
        widths = [w for w in candidates if w < full]
        if not is_logo:
            widths.append(full)

        for width in widths:
            for ext, options in (
                # 4:4:4 keeps fine colour detail. It costs little and photos are the product.
                ("avif", {"quality": 74, "speed": 4, "subsampling": "4:4:4"}),
                ("webp", {"quality": 86, "method": 6}),
            ):
                target = OUT / f"{name}-{width}.{ext}"
                if target.exists():
                    continue
                resized = image
                if width < full:
                    height = round(image.height * width / full)
                    resized = image.resize((width, height), Image.Resampling.LANCZOS)
                    if not is_logo:
                        # Downscaling softens edges. This restores them.
                        resized = resized.filter(
                            ImageFilter.UnsharpMask(radius=0.6, percent=70, threshold=2)
                        )
                resized.save(target, exif=exif, icc_profile=icc, **options)

        fallback = None
        if is_logo:
            # The original logo is too large to be anyone's fallback, or a favicon.
            fallback = f"/assets/img/{name}-192.png"
            target = OUT / f"{name}-192.png"
            if not target.exists():
                height = round(image.height * 192 / full)
                image.resize((192, height), Image.Resampling.LANCZOS).save(
                    target, optimize=True
                )
        return {
            "name": name,
            "widths": widths,
            "size": image.size,
            "fallback": fallback,
        }


def find(page, src):
    """Find the file a reference means, repairing wrong case in the path."""
    base = pathlib.PurePosixPath("/" + page.relative_to(ROOT).parent.as_posix())
    parts = (ROOT / str(base / src).lstrip("/")).relative_to(ROOT).parts
    current = ROOT
    for part in parts:
        matches = [
            c
            for c in (current.iterdir() if current.is_dir() else [])
            if c.name.lower() == part.lower()
        ]
        if not matches:
            return None
        current = matches[0]
    return current if current.is_file() else None


def picture(page, tag, library):
    src = re.search(r"""\bsrc=["']([^"']+)["']""", tag).group(1)
    if re.match(r"(https?:)?//|/assets/|data:", src):
        return tag

    file = find(page, src)
    # Some pages reference a copy of the logo that their folder does not have.
    if file is None and pathlib.PurePosixPath(src).name == "Logo neu.png":
        file = ROOT / "Logo neu.png"
    if file is None:
        print(f"Skipped, file not found: {src} in {page.relative_to(ROOT)}")
        return tag

    info = library.versions(file)
    sizes = sizes_for(tag)
    new_src = info["fallback"] or "/" + file.relative_to(ROOT).as_posix()
    width, height = info["size"]
    eager = re.search(r"\bh-(24|20)\b|Couple1", tag)
    attrs = f'width="{width}" height="{height}" decoding="async"'
    attrs += ' fetchpriority="high"' if "Couple1" in tag else ""
    attrs += "" if eager else ' loading="lazy"'

    img = tag.replace(f'src="{src}"', f'src="{new_src}"')
    img = re.sub(r"\s*/?>$", f" {attrs}>", img)

    def source(ext):
        srcset = ", ".join(
            f"/assets/img/{info['name']}-{w}.{ext} {w}w" for w in info["widths"]
        )
        return f'<source type="image/{ext}" srcset="{srcset}" sizes="{sizes}">'

    return f"<picture>{source('avif')}{source('webp')}{img}</picture>"


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    library = Library()
    for name in CSS_IMAGES:
        library.versions(ROOT / name)

    for page in sorted(ROOT.rglob("*.html")):
        text = page.read_text()
        new = TAG.sub(
            lambda m: picture(page, m.group(0), library)
            if m.group(0).startswith("<img")
            else m.group(0),
            text,
        )
        if new != text:
            page.write_text(new)

    files = list(OUT.iterdir())
    total = sum(f.stat().st_size for f in files)
    print(f"{len(files)} image versions, {total / 1024 / 1024:.1f} MB in assets/img/")


if __name__ == "__main__":
    main()
