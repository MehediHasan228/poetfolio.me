#!/usr/bin/env python3
"""Split the one-page portfolio into separate pages with their own URLs.

Source : scripts/site_src/index.full.html  (the full one-page site)
Output : docs/index.html (home) and docs/<page>/index.html

Run: python3 scripts/build_pages.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "scripts/site_src/index.full.html"
DOCS = ROOT / "docs"
SITE = "https://mehedi.pro.bd"

# section id in source -> (url slug, nav label, meta title, intro, highlights)
PAGES = {
    "about": ("architecture", "How I Build", "How I Build",
              "The kinds of systems I build and the work behind each: ERP and HR platforms, LLM features inside "
              "business software, attendance from biometric devices and phones, and Bangladesh tax and grant rules "
              "kept in code.",
              ["SAWAB NGO ERP on Frappe and ERPNext, with a live demo",
               "OpenAI, Claude and Gemini inside Jibika's HR modules, ~50% less manual work",
               "NBR VAT, TDS and payroll gazettes kept current in code"]),
    "skills": ("stack", "Stack", "Technology Stack",
               "The tools I reach for in production, grouped by what they are used for: AI and agents, "
               "full-stack web, data and vector search, and cloud/DevOps.",
               ["TypeScript, NestJS, Next.js and Laravel (Filament)",
                "PostgreSQL, PGVector and Redis for data and retrieval",
                "OpenAI, Claude, Gemini and local models via Ollama"]),
    "archives": ("sandbox", "Sandbox", "Deep Tech & Creative Sandbox",
                 "Where I experiment: local LLM clusters, edge inference, autonomous swarms and creative "
                 "side projects that later feed into client work.",
                 ["Ollama, DeepSeek and Llama 3 quantized pipelines",
                  "Autonomous multi-agent swarms",
                  "Edge hardware inference experiments"]),
}
NAV_TARGETS = {  # in-page anchor -> slug
    "about": "architecture", "skills": "stack", "projects": "projects",
    "archives": "sandbox", "people": "people", "contact": "contact",
}
EXPLORE_ICONS = {"architecture": "fa-cubes", "stack": "fa-layer-group", "projects": "fa-rocket",
                 "sandbox": "fa-flask", "people": "fa-users", "contact": "fa-envelope"}


def rewrite(html: str, prefix: str) -> str:
    """Point anchors/asset paths at the right place for a page `prefix` levels deep."""
    for anchor, slug in NAV_TARGETS.items():
        html = html.replace(f'href="#{anchor}"', f'href="{prefix}{slug}/"')
    if prefix == "../":
        html = html.replace('href="./index.html" class="logo-link', 'href="../" class="logo-link')
        html = re.sub(r'(src|href|srcset|content)="\./', r'\1="../', html)
    return html


NAV_ITEMS = [("profile", "Profile"), ("projects", "Projects"), ("people", "People"), ("contact", "Contact")]


def swap_nav(html: str, prefix: str) -> str:
    """Top nav = Profile, Projects, People, Contact, Library (+ terminal toggle)."""
    m = re.search(r'<ul class="nav-links">(.*?)</ul>', html, re.S)
    cli = re.search(r'<li><a href="[^"]*" id="cli-toggle".*?</li>', m.group(1), re.S).group(0)
    cls = 'class="magnetic-element hover-sound nav-link-item"'
    items = "".join(f'<li><a href="{prefix}{k}/" {cls}>{ico(k)} <span>{l}</span></a></li>\n            ' for k, l in NAV_ITEMS)
    # Library sits in its own group below a divider (shown in the mobile drawer)
    items += '<li class="nav-sep" aria-hidden="true"></li>\n            '
    items += f'<li><a href="{prefix}library/" {cls}>{ico("books")} <span>Library</span></a></li>\n            '

    nav_inner = "\n            " + items + cli + "\n        "
    return dedupe_cli(re.sub(r'<ul class="nav-links">.*?</ul>', f'<ul class="nav-links">{nav_inner}</ul>', html, flags=re.S))


def section(src: str, sid: str) -> str:
    if sid == "people":
        a = src.index("<!-- People section")
        b = src.index("</script>", a) + len("</script>")
        return src[a:b]
    m = re.search(rf'<section id="{sid}".*?</section>', src, re.S)
    return m.group(0)

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


def dedupe_cli(html: str) -> str:
    """Keep only the first #cli-toggle (the drawer copy is hidden by CSS and duplicated the id)."""
    pat = re.compile(r'<li><a href="[^"]*" id="cli-toggle".*?</li>\s*', re.S)
    hits = list(pat.finditer(html))
    for m in reversed(hits[1:]):
        html = html[:m.start()] + html[m.end():]
    return html


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
    head_end = src.index("<body>")
    head = src[:head_end]
    # the hero's particle canvas is on the home page only, so is the script that draws its first frame
    head = re.sub(r'\s*<script id="hero-net">.*?</script>', "", head, flags=re.S)
    # and so are the desktop font preloads for the hero
    head = re.sub(r'\n\s*<!-- Home, desktop:.*?-->', "", head, flags=re.S)
    head = re.sub(r'\n\s*<link[^>]*\bdata-home\b[^>]*>', "", head)
    body_open = src[head_end:src.index('<header class="hero"')]
    hero = src[src.index('<header class="hero"'):src.index("</header>") + len("</header>")]
    tail = src[src.index('<div style="text-align: center; padding-bottom: 2rem;">'):]
    tail = tail.replace('</html>', '</html>')

    # ---- sub pages ----
    for sid, (slug, label, title, intro, points) in PAGES.items():
        sec = section(src, sid)
        lis = "".join(f"<li><i class=\"fa-solid fa-check\"></i> {p}</li>" for p in points)
        page_hero = (
            '<div class="page-hero">'
            '<div class="page-crumb" aria-label="Breadcrumb"><a href="../">Home</a> / '
            f'<span>{label}</span></div>'
            f'<h1>{title}</h1><p>{intro}</p><ul class="page-points">{lis}</ul></div>\n'
        )
        # drop the section's own h2 title to avoid two headings competing
        sec = re.sub(r'<div class="section-title[^"]*">.*?</div>\s*', "", sec, count=1, flags=re.S)
        doc = (set_meta(head, slug, title, intro, "../") + body_open + '<main id="main-content">\n' + page_hero
               + f'<h2 class="sr-only">{label}</h2>\n' + sec + "\n</main>\n\n"
               + bottom_nav(slug, prefix="../") + "\n" + tail)
        doc = swap_nav(rewrite(doc, "../"), "../")
        doc = doc.replace("<body>", f'<body class="subpage" data-page="{slug}">', 1)
        out = DOCS / slug / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(doc, encoding="utf-8")
        print("wrote", out.relative_to(ROOT))

    # ---- home: unchanged full page, only the top nav is swapped ----
    home = swap_nav(src, "./")
    # the sandbox has its own page; the home page links to it instead of repeating it
    home = re.sub(r'\s*<section id="archives".*?</section>', '', home, count=1, flags=re.S)
    tail_idx = home.index('<div style="text-align: center; padding-bottom: 2rem;">')
    home = home[:tail_idx] + "</main>\n\n    " + bottom_nav(None, prefix="./") + "\n" + home[tail_idx:]
    # the architecture tags' small logos sit just below the first screen, where Chrome's lazy loading (about 1250 px
    # ahead) fetched them with the first screen; here they wait for script~ to load them as the section comes near
    home = re.sub(r'<img src="(\./uploads/brand-icons/[^"]+)"([^>]*class="arch-tag-icon")',
                  r'<img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" data-src="\1"\2', home)
    # the page content (hero to contact) is the main landmark; the source keeps no <main>, since its parts are reused
    home = home.replace('<header class="hero"', '<main id="main-content">\n    <header class="hero"', 1)
    (DOCS / "index.html").write_text(home, encoding="utf-8")
    print("wrote docs/index.html")


if __name__ == "__main__":
    main()
