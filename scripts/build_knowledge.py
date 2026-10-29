#!/usr/bin/env python3
"""Build the AI assistant's knowledge base from the built site.

Reads the pages in docs/ (after build_pages.py and build_nx_pages.py have run),
keeps the readable content (headings, paragraphs, list items, table cells),
drops navigation, footers, scripts and the chat widget, and writes:

  docs/ai/knowledge.md    plain text the chat Worker puts in the model's prompt

Each page starts with "# <title> (<url>)" so the model can cite where a fact came from.
Run it last:  python3 scripts/build_knowledge.py
"""
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
OUT = DOCS / "ai" / "knowledge.md"
SITE = "https://mehedi.pro.bd"

# (path in docs/, public url, title). Home first: it is the broadest overview.
PAGES = [
    ("index.html", "/", "Home"),
    ("profile/index.html", "/profile/", "Profile: experience, education, skills, tools"),
    ("projects/index.html", "/projects/", "Projects and experiments"),
    ("architecture/index.html", "/architecture/", "Architecture"),
    ("people/index.html", "/people/", "People"),
    ("contact/index.html", "/contact/", "Contact"),
    ("library/index.html", "/library/", "Library"),
]

# (pre: the sample code on Profile > Tools; its comments would read as headings here)
SKIP_TAGS = {"script", "style", "noscript", "svg", "nav", "footer", "header", "template", "button", "form", "select", "iframe", "pre"}
SKIP_IDS = {"ai-chat-widget", "ai-orb-speech-bubble", "terminal", "cli-terminal"}
SKIP_CLASS = re.compile(r"\b(bottom-nav|mobile-menu|drawer|sr-only|visually-hidden|marquee|ticker|telemetry|sys-monitor|radar)\b")
BLOCK = {"p", "li", "h1", "h2", "h3", "h4", "h5", "h6", "td", "th", "dt", "dd", "figcaption", "blockquote", "summary", "div", "section", "article", "tr", "br"}
HEAD = {"h1": "##", "h2": "##", "h3": "###", "h4": "####"}
VOID = {"br", "img", "input", "meta", "link", "hr", "source", "wbr", "area", "col", "embed", "track", "param"}


class Extract(HTMLParser):
    def __init__(self, scoped):
        super().__init__(convert_charrefs=True)
        self.scoped = scoped          # only read inside <main> / <section> when the page has them
        self.depth_in = 0
        self.skip = []                # stack of booleans, one per open element
        self.lines, self.buf, self.prefix = [], [], ""

    def _skipping(self):
        return any(self.skip)

    def _flush(self):
        text = re.sub(r"\s+", " ", "".join(self.buf)).strip()
        if text:
            self.lines.append(f"{self.prefix} {text}".strip() if self.prefix else text)
        self.buf, self.prefix = [], ""

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        hidden = ("hidden" in a or a.get("aria-hidden") == "true"
                  or a.get("id") in SKIP_IDS or SKIP_CLASS.search(a.get("class") or ""))
        if tag in ("main", "section", "article") and not self._skipping():
            self.depth_in += 1
        if tag in VOID:
            if tag == "br":
                self._flush()
            return
        self.skip.append(tag in SKIP_TAGS or bool(hidden))
        if tag not in BLOCK:
            self.buf.append(" ")      # keep neighbouring chips/tags from gluing together
        if tag in BLOCK:
            self._flush()
            if tag in HEAD:
                self.prefix = HEAD[tag]
            elif tag == "li":
                self.prefix = "-"

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if tag in BLOCK:
            self._flush()
        if self.skip:
            self.skip.pop()
        if tag in ("main", "section", "article") and self.depth_in:
            self.depth_in -= 1

    def handle_data(self, data):
        if self._skipping() or (self.scoped and not self.depth_in):
            return
        self.buf.append(data)


def page_text(html):
    scoped = bool(re.search(r"<(main|section)\b", html))
    p = Extract(scoped)
    p.feed(html)
    p._flush()
    out, seen = [], set()
    for ln in p.lines:
        key = ln.lower().lstrip("#- ").strip()
        if len(key) < 3 or key in seen:          # drop crumbs and repeated labels
            continue
        seen.add(key)
        out.append(ln)
    return out


def library_text():
    """The library pages are long lists; summarise them from their data file instead."""
    path = ROOT / "scripts" / "library_data.json"
    if not path.exists():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    lines = []

    def names(items, key="name"):
        return ", ".join(str(i.get(key) or i.get("title") or "") for i in items if isinstance(i, dict) and (i.get(key) or i.get("title")))

    def walk(node, label):
        if isinstance(node, dict):
            for k, v in node.items():
                walk(v, f"{label} > {k}" if label else k)
        elif isinstance(node, list) and node and isinstance(node[0], dict):
            joined = names(node)
            if joined:
                lines.append(f"- {label}: {joined}")
            for item in node:
                for k, v in item.items():
                    if isinstance(v, list) and v and isinstance(v[0], dict):
                        walk(v, f"{label} > {item.get('name') or item.get('title') or k}")

    walk(data, "")
    return lines


def main():
    parts = [
        f"Knowledge base for Mehedi Hasan's portfolio ({SITE}). Generated from the site; each section names its page.",
        "",
    ]
    for rel, url, title in PAGES:
        f = DOCS / rel
        if not f.exists():
            continue
        lines = page_text(f.read_text(encoding="utf-8"))
        if not lines:
            continue
        parts += [f"# {title} ({url})", *lines, ""]
    lib = library_text()
    if lib:
        parts += ["# Library details: bookmarks, AI skills, channels (/library/)", *lib, ""]
    text = "\n".join(parts).strip() + "\n"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(text, encoding="utf-8")
    print(f"knowledge: {OUT.relative_to(ROOT)}  {len(text):,} chars  ~{len(text) // 4:,} tokens")


if __name__ == "__main__":
    main()
