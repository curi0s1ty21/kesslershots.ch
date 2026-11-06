#!/usr/bin/env bash
# Downloads the live site into site/ without changing a byte of it.
#
# The extra start URLs are needed: the live pages link to /blog/... but the posts
# are under /Blog/..., and the host is case-sensitive, so a crawl from / alone
# misses them.
set -uo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
origin="${ORIGIN:-https://kesslershots.ch}"
dest="$root/site"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

wget \
  --recursive --level=inf --page-requisites --no-parent \
  --no-host-directories --directory-prefix="$tmp" \
  --restrict-file-names=nocontrol \
  --wait=0.3 --random-wait --tries=3 --timeout=30 \
  --no-verbose \
  "$origin/" \
  "$origin/kontakt.html" \
  "$origin/blog.html" \
  "$origin/Datenschutzerkl%C3%A4rung.html" \
  "$origin/favicon.png" \
  "$origin/Blog/5%20Fehler/index.html" \
  "$origin/Blog/Golden%20Hour/index.html" \
  "$origin/Blog/hochzeitslocations-ostschweiz/index.html"
status=$?

# wget exits 8 when any URL returned an error. The live site has broken links,
# so that alone is not a failure. Anything else is (network, disk, ...).
if [ "$status" -ne 0 ] && [ "$status" -ne 8 ]; then
  echo "wget failed with exit code $status; site/ left unchanged" >&2
  exit "$status"
fi
if [ ! -s "$tmp/index.html" ]; then
  echo "no index.html downloaded; site/ left unchanged" >&2
  exit 1
fi

rm -rf "$dest"
mv "$tmp" "$dest"
trap - EXIT
chmod -R u=rwX,go=rX "$dest"
echo "Mirrored $(find "$dest" -type f | wc -l) files into site/"
