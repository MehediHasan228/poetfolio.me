#!/usr/bin/env python3
"""Self-hosted Font Awesome 6.4.0 that holds only the icons this site uses.

The full icon fonts are ~280 KB; the subset is ~25 KB. Re-run this after adding an icon anywhere
(an icon missing from the subset shows as a blank square).

Source : Font Awesome Free 6.4.0 from cdnjs (downloaded to a temp folder)
Output : docs/vendor/fa/css/all.min.css and docs/vendor/fa/webfonts/*.woff2

Icons kept (over-inclusive on purpose): every fa-NAME token, every quoted 'NAME' that is an icon
name (focus.js builds icons as fa('play')), and every \\fXXX / &#xfXXX; escape in docs/ and scripts/.

Run: pip install fonttools brotli && python3 scripts/build_fa_subset.py
"""
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs/vendor/fa"
CDN = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/"
FONTS = ("fa-solid-900", "fa-regular-400", "fa-brands-400")


def fetch(path, dest):
    # curl uses the system's certificates (python.org builds on macOS often have none)
    subprocess.run(["curl", "-sSfL", "-o", str(dest), CDN + path], check=True)


def used_codepoints(name_cp):
    exts = {".html", ".js", ".css", ".json", ".md", ".py", ".ts"}
    skip = ("node_modules", "/vendor/", "butterchurn")
    names, cps = set(), set()
    for d in ("docs", "scripts", "chat-worker/src"):
        for p in (ROOT / d).rglob("*"):
            if not p.is_file() or p.suffix not in exts or any(s in str(p) for s in skip):
                continue
            t = p.read_text(encoding="utf-8", errors="ignore")
            names.update(n for n in re.findall(r"fa-([a-z0-9]+(?:-[a-z0-9]+)*)", t) if n in name_cp)
            names.update(n for n in re.findall(r"['\"`]([a-z0-9]+(?:-[a-z0-9]+)*)['\"`]", t) if n in name_cp)
            cps.update(int(h, 16) for h in re.findall(r"\\(f[0-9a-f]{3})\b", t))
            cps.update(int(h, 16) for h in re.findall(r"&#x(f[0-9a-f]{3});", t, re.I))
    return names, cps | {name_cp[n] for n in names}


def main():
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        fetch("css/all.min.css", tmp / "all.min.css")
        for f in FONTS:
            fetch(f"webfonts/{f}.ttf", tmp / f"{f}.ttf")
        fetch("webfonts/fa-v4compatibility.woff2", tmp / "fa-v4compatibility.woff2")

        css = (tmp / "all.min.css").read_text(encoding="utf-8")
        name_cp = {}
        for sels, cp in re.findall(r'((?:\.fa-[a-z0-9-]+:+before,?)+)\{content:"\\([0-9a-f]+)"\}', css):
            for n in re.findall(r"\.fa-([a-z0-9-]+):+before", sels):
                name_cp[n] = int(cp, 16)
        names, cps = used_codepoints(name_cp)
        print(f"{len(names)} icon names, {len(cps)} glyphs")

        (OUT / "css").mkdir(parents=True, exist_ok=True)
        (OUT / "webfonts").mkdir(parents=True, exist_ok=True)
        for f in FONTS:
            font = TTFont(tmp / f"{f}.ttf")
            keep = sorted(cps & set(font.getBestCmap()))
            opts = subset.Options()
            opts.flavor = "woff2"
            opts.layout_features = []
            opts.name_IDs = ["*"]
            opts.notdef_outline = True
            s = subset.Subsetter(opts)
            s.populate(unicodes=keep)
            s.subset(font)
            font.flavor = "woff2"
            font.save(OUT / "webfonts" / f"{f}.woff2")
            print(f"wrote docs/vendor/fa/webfonts/{f}.woff2  {len(keep)} glyphs")
        shutil.copy(tmp / "fa-v4compatibility.woff2", OUT / "webfonts" / "fa-v4compatibility.woff2")
        # woff2 only: every browser that runs this site reads it
        css = re.sub(r',url\(\.\./webfonts/[a-z0-9-]+\.ttf\) format\("truetype"\)', "", css)
        (OUT / "css" / "all.min.css").write_text(css, encoding="utf-8")
        print("wrote docs/vendor/fa/css/all.min.css")


if __name__ == "__main__":
    main()
