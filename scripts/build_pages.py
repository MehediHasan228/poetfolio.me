#!/usr/bin/env python3
"""Build the home page from the one-page source, and the pages that only forward to another.

Source : scripts/site_src/index.full.html  (the home page and the shared chrome: head, nav, chat, footer)
Output : docs/index.html (home), and docs/stack/ and docs/sandbox/, which forward to the pages that took them in.
         The other pages (/profile/, /projects/, /architecture/, /library/ …) are built by build_nx_pages.py.

Run: python3 scripts/build_pages.py
"""
import html as html_mod
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "scripts/site_src/index.full.html"
DOCS = ROOT / "docs"
SITE = "https://mehedi.pro.bd"

# the source's in-page anchors -> where that content lives now, from the site root
NAV_TARGETS = {
    "about": "architecture/", "skills": "profile/#tools", "projects": "projects/",
    "archives": "projects/#experiments", "people": "people/", "contact": "contact/",
}
# old page -> (where it went, from the old page; the canonical address; what the visitor is told it is now)
REDIRECTS = {
    "stack": ("../profile/#tools", f"{SITE}/profile/", "Profile: Tools I use"),
    "sandbox": ("../projects/#experiments", f"{SITE}/projects/", "Projects: Experiments"),
}


def redirect_page(to: str, canonical: str, title: str) -> str:
    """A page that has moved: it forwards at once (meta refresh, and location.replace so Back skips it), tells search
    engines where the page is now (canonical, noindex), and shows the link for anyone it doesn't forward."""
    t = html_mod.escape(title)
    return (f'<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8">\n'
            f'<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            f'<title>{t} | Mehedi Hasan</title>\n<meta name="robots" content="noindex">\n'
            f'<link rel="canonical" href="{canonical}">\n<meta http-equiv="refresh" content="0; url={to}">\n'
            f'<script>location.replace("{to}");</script>\n'
            f'<style>html{{background:#0b1120;color:#e2e8f0;font:16px/1.6 system-ui,sans-serif}}body{{margin:0;padding:48px 20px}}'
            f'a{{color:#00f2fe}}</style></head>\n'
            f'<body><p>This page has moved to <a href="{to}">{t}</a>.</p></body></html>\n')


def rewrite(html: str, prefix: str) -> str:
    """Point anchors/asset paths at the right place for a page `prefix` levels deep."""
    for anchor, target in NAV_TARGETS.items():
        html = html.replace(f'href="#{anchor}"', f'href="{prefix}{target}"')
    if prefix == "../":
        html = html.replace('href="./index.html" class="logo-link', 'href="../" class="logo-link')
        html = re.sub(r'(src|href|srcset|content)="\./', r'\1="../', html)
    return html


NAV_ITEMS = [("profile", "Profile"), ("projects", "Projects"), ("people", "People"), ("contact", "Contact")]


def swap_nav(html: str, prefix: str) -> str:
    """Top nav = Profile, Projects, People, Contact, Library."""
    cls = 'class="hover-sound nav-link-item"'
    items = "".join(f'<li><a href="{prefix}{k}/" {cls}>{ico(k)} <span>{l}</span></a></li>\n            ' for k, l in NAV_ITEMS)
    # Library sits in its own group below a divider (shown in the mobile drawer)
    items += '<li class="nav-sep" aria-hidden="true"></li>\n            '
    items += f'<li><a href="{prefix}library/" {cls}>{ico("books")} <span>Library</span></a></li>\n            '

    nav_inner = "\n            " + items.rstrip() + "\n        "
    return re.sub(r'<ul class="nav-links">.*?</ul>', f'<ul class="nav-links">{nav_inner}</ul>', html, flags=re.S)


import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from icons import BOTTOM_NAV, ico, bottom_nav


PERSON_LD = """<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Person","name":"Mehedi Hasan","url":"https://mehedi.pro.bd/",
"image":"https://mehedi.pro.bd/uploads/hero_profile_1771668518.webp",
"jobTitle":"AI-Native Software Engineer",
"sameAs":["https://github.com/MehediHasan228"],"email":"mehedihasan228.cse@gmail.com",
"address":{"@type":"PostalAddress","addressLocality":"Dhaka","addressCountry":"BD"}}
</script>
"""


def set_meta(head: str, slug: str, title: str, desc: str, prefix: str) -> str:
    url = f"{SITE}/{slug}/" if slug else f"{SITE}/"
    head = re.sub(r"<title>.*?</title>", f"<title>{title} | Mehedi Hasan</title>", head, flags=re.S)
    head = re.sub(r'(<meta name="description" content=")[^"]*', rf"\g<1>{desc}", head)
    head = re.sub(r'(<link rel="canonical" href=")[^"]*', rf"\g<1>{url}", head)
    head = re.sub(r'(property="(?:og|twitter):url" content=")[^"]*', rf"\g<1>{url}", head)
    head = re.sub(r'(property="(?:og|twitter):title" content=")[^"]*', rf"\g<1>{title} | Mehedi Hasan", head)
    if slug in ("profile", "contact") and "application/ld+json" not in head:
        head = head.replace("</head>", PERSON_LD + "</head>", 1)
    return head


def main() -> None:
    src = SRC.read_text(encoding="utf-8").replace("\r\n", "\n")

    # ---- pages that moved: /stack/ is Profile's Tools now, /sandbox/ the Experiments on Projects ----
    for slug, (to, canonical, title) in REDIRECTS.items():
        out = DOCS / slug / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(redirect_page(to, canonical, title), encoding="utf-8")
        print("wrote", out.relative_to(ROOT), "(redirect)")

    # ---- home: unchanged full page, only the top nav is swapped ----
    home = swap_nav(src, "./")
    # the home page is a dashboard: under the hero, one tile per page in place of the pages' full sections
    # (those pages are built by build_nx_pages)
    import build_nx_pages
    for sid in ("projects", "contact"):
        home = re.sub(rf'\s*<section id="{sid}".*?</section>', '', home, count=1, flags=re.S)
    home = home.replace("</header>", "</header>\n" + build_nx_pages.home_dashboard(), 1)
    tail_idx = home.index('<div style="text-align: center; padding-bottom: 2rem;">')
    home = home[:tail_idx] + "</main>\n\n    " + bottom_nav(None, prefix="./") + "\n" + home[tail_idx:]
    # the page content (hero to contact) is the main landmark; the source keeps no <main>, since its parts are reused
    home = home.replace('<header class="hero"', '<main id="main-content">\n    <header class="hero"', 1)
    (DOCS / "index.html").write_text(home, encoding="utf-8")
    print("wrote docs/index.html")


if __name__ == "__main__":
    main()
