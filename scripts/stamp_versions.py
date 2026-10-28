#!/usr/bin/env python3
"""Stamp every CSS/JS reference in docs/ with its file's content hash (style~1f83e8.css?v=1ce0c2905c).

A browser or nginx (which caches CSS/JS for a week) then never keeps an old copy once a file changes, and nobody has to
remember to bump a ?v= number. Runs at the end of `npm run build`; after editing a file in docs/ by hand, run it alone
with `npm run stamp`. `npm run check` fails while any stamp is out of date.

Only references that already carry ?v= are touched, in HTML, JS and CSS (focus.js names focus.css this way). A path is
resolved from the file that names it, as the browser does.

Run: python3 scripts/stamp_versions.py
"""
import hashlib
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
REF = re.compile(r"""(["'`(])((?:\.{1,2}/|/(?!/))?[\w~\-./]+\.(?:css|js|mjs))\?v=([\w.-]*)""")   # not //cdn… URLs


def digest(path: Path) -> str:
    return hashlib.md5(path.read_bytes()).hexdigest()[:10]


def target(file: Path, ref: str) -> Path:
    return DOCS / ref.lstrip("/") if ref.startswith("/") else (file.parent / ref).resolve()


def stamp(file: Path) -> bool:
    """Rewrite the file's ?v= stamps; True when anything changed. A reference to a missing file is left alone."""
    with open(file, encoding="utf-8", errors="surrogateescape", newline="") as f:
        text = f.read()

    def sub(m):
        t = target(file, m.group(2))
        return f"{m.group(1)}{m.group(2)}?v={digest(t)}" if t.is_file() else m.group(0)

    new = REF.sub(sub, text)
    if new == text:
        return False
    with open(file, "w", encoding="utf-8", errors="surrogateescape", newline="") as f:
        f.write(new)
    return True


def files(*suffixes):
    return sorted(p for p in DOCS.rglob("*")
                  if p.suffix in suffixes and p.is_file() and "vendor" not in p.relative_to(DOCS).parts)


def main():
    # scripts and stylesheets first, until none changes: one that loads another (focus.js loads focus.css) gets a new
    # hash of its own when its stamp changes, and the pages must name that one
    assets = []
    for _ in range(5):
        changed = [p for p in files(".js", ".mjs", ".css") if stamp(p)]
        if not changed:
            break
        assets += changed
    else:
        # two files that name each other never settle; stop the build rather than ship stamps that are already stale
        sys.exit("stamp_versions: these files keep changing each other's stamps: "
                 + ", ".join(str(p.relative_to(DOCS)) for p in changed))
    pages = [p for p in files(".html") if stamp(p)]
    names = sorted({str(p.relative_to(DOCS)) for p in assets})
    print(f"stamp_versions: {len(pages)} pages restamped" + (f"; assets: {', '.join(names)}" if names else ""))


if __name__ == "__main__":
    main()
