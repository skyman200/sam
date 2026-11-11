#!/bin/sh
# site/ 내용을 gh-pages 브랜치 루트로 올린다 (https://skyman200.github.io/sam/)
set -e
cd "$(dirname "$0")"
python3 build_site.py
T=$(mktemp -d)
cp -R site/. "$T"/
touch "$T/.nojekyll"
git -C "$T" init -q -b gh-pages
git -C "$T" add -A
git -C "$T" -c user.name=skyman200 -c user.email=skyman200@users.noreply.github.com commit -q -m "deploy site"
git -C "$T" push -q -f "$(git remote get-url origin)" gh-pages
rm -rf "$T"
