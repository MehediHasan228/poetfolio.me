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
    "about": ("architecture", "Architecture", "Architecture",
              "How I design systems: clean-architecture NestJS services, event streaming with Kafka, "
              "Redis-backed consistency and agentic AI layers on top. Four-plus years of freelance delivery "
              "across ERP, NGO and AI automation products.",
              ["Clean-architecture NestJS + PostgreSQL + Redis backends",
               "Event-driven design with Kafka and gRPC between services",
               "Agentic layer: LangGraph, MCP and RAG over PGVector"]),
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
    html = html.replace('href="./ai-insights/index.html"', f'href="{prefix}ai-insights/"')
    if prefix == "../":
        html = html.replace('href="./index.html" class="logo-link', 'href="../" class="logo-link')
        html = re.sub(r'(src|href|srcset|content)="\./', r'\1="../', html)
    return html


NAV_ITEMS = [("profile", "Profile"), ("projects", "Projects"), ("writing", "Writing"),
             ("people", "People"), ("contact", "Contact")]


def swap_nav(html: str, prefix: str) -> str:
    """Top nav = Profile, Projects, Writing, People, Contact, AI Insights (+ terminal toggle)."""
    m = re.search(r'<ul class="nav-links">(.*?)</ul>', html, re.S)
    cli = re.search(r'<li><a href="[^"]*" id="cli-toggle".*?</li>', m.group(1), re.S).group(0)
    cls = 'class="magnetic-element hover-sound nav-link-item"'
    items = "".join(f'<li><a href="{prefix}{k}/" {cls}>{ico(k)} <span>{l}</span></a></li>\n            ' for k, l in NAV_ITEMS)
    items += f'<li><a href="{prefix}ai-insights/index.html" {cls}>{ico("library")} <span>AI Insights</span></a></li>\n            '
    nav_inner = "\n            " + items + cli + "\n        "
    return re.sub(r'<ul class="nav-links">.*?</ul>', f'<ul class="nav-links">{nav_inner}</ul>', html, flags=re.S)


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


def set_meta(head: str, slug: str, title: str, desc: str, prefix: str) -> str:
    url = f"{SITE}/{slug}/" if slug else f"{SITE}/"
    head = re.sub(r"<title>.*?</title>", f"<title>{title} | Mehedi Hasan</title>", head, flags=re.S)
    head = re.sub(r'(<meta name="description" content=")[^"]*', rf"\g<1>{desc}", head)
    head = re.sub(r'(<link rel="canonical" href=")[^"]*', rf"\g<1>{url}", head)
    head = re.sub(r'(property="(?:og|twitter):url" content=")[^"]*', rf"\g<1>{url}", head)
    head = re.sub(r'(property="(?:og|twitter):title" content=")[^"]*', rf"\g<1>{title} | Mehedi Hasan", head)
    return head


def main() -> None:
    src = SRC.read_text(encoding="utf-8").replace("\r\n", "\n")
    head_end = src.index("<body>")
    head = src[:head_end]
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
        doc = set_meta(head, slug, title, intro, "../") + body_open + page_hero + sec + "\n\n" + bottom_nav(slug, prefix="../") + "\n" + tail
        doc = swap_nav(rewrite(doc, "../"), "../")
        doc = doc.replace("<body>", f'<body class="subpage" data-page="{slug}">', 1)
        out = DOCS / slug / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(doc, encoding="utf-8")
        print("wrote", out.relative_to(ROOT))

    # ---- home: unchanged full page, only the top nav is swapped ----
    home = swap_nav(src, "./")
    tail_idx = home.index('<div style="text-align: center; padding-bottom: 2rem;">')
    home = home[:tail_idx] + bottom_nav(None, prefix="./") + "\n" + home[tail_idx:]
    (DOCS / "index.html").write_text(home, encoding="utf-8")
    print("wrote docs/index.html")


if __name__ == "__main__":
    main()
