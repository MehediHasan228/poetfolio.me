#!/usr/bin/env python3
"""Generate the nahian.bd-style pages: /profile /projects /writing /people /contact.

Run: python3 scripts/build_nx_pages.py
Edit the DATA section below to change content.
"""
import hashlib
import html
import json
import re
import sys
from collections import Counter
from datetime import date
from pathlib import Path
from urllib.parse import quote

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_pages  # noqa: E402  (shared home-page shell helpers)

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
SITE = "https://mehedi.pro.bd"
GH = "https://github.com/MehediHasan228"
LI = "https://linkedin.com/in/mehedi-hasan-2859383b4"
MAIL = "mehedihasan228.cse@gmail.com"
WA = "https://wa.me/8801799447594"
NAME = "Mehedi Hasan"

# ------------------------------------------------------------------ DATA
TAGLINE = "AI-Native Software Engineer"
ROLE_NOW = "Software Developer at SAWAB Bangladesh"
ABOUT = [
    "Full-Stack Software Engineer with 4+ years of hands-on experience architecting high-performance web applications "
    "and scalable APIs. Core expertise spans modern TypeScript, React, and Next.js on the frontend, paired with robust "
    "NestJS, Python (FastAPI), and event-driven distributed architectures. Also familiar and extensively experienced "
    "with PHP / Laravel backend microservices, custom web platforms, and WordPress / WooCommerce solutions.",
    "An AI-native engineer who leverages state-of-the-art LLM workflows (Claude, OpenAI, Antigravity, OpenCode, Ollama) to accelerate engineering "
    "velocity without sacrificing code hygiene. Actively building multi-agent automation systems using LangGraph, MCP, and "
    "retrieval-augmented workflows (PGVector), backed by Kafka event streaming, Docker containerisation, and Kubernetes.",
    "Currently leading development for SAWAB Bangladesh's digital web platforms and building SAWAB's multi-organisation NGO ERP "
    "and HRM system on Frappe and Next.js. Strong grasp of enterprise IT, VAPT security, and clean documentation—driven to build reliable software fast.",
]
AI_TOOLS = [("Claude", "claude", "#d97757"), ("OpenAI", "openai", "#10a37f"),
            ("Ollama", "ollama", "#475569"), ("Antigravity", "antigravity", "#3b82f6"),
            ("OpenCode", "opencode", "#64748b")]
STACK = [("LangGraph", "langgraph"), ("NestJS", "nestjs"), ("TypeScript", "typescript"), ("Next.js", "nextjs"),
         ("React", "react"), ("Python", "python"), ("FastAPI", "fastapi"), ("PostgreSQL", "postgresql"),
         ("Redis", "redis"), ("Kafka", "apachekafka"), ("Docker", "docker"), ("Kubernetes", "kubernetes"),
         ("n8n", "n8n"), ("Tailwind CSS", "tailwind")]
# (row label, [(label, icon, brand colour or None, where I use it)], how many show before "+N")
HERO_STACK = [
    ("AI", [("Claude", "claude", "#d97757", "LLM behind HR reports and appraisal drafts at Jibika"),
            ("OpenAI", "openai", "#10a37f", "LLM APIs in Jibika's Reports, Appraisal and Leave modules"),
            ("LangGraph", "langgraph", None, "Multi-agent workflows"),
            ("Ollama", "ollama", "#475569", "Local LLMs for private, on-device AI"),
            ("Antigravity", "antigravity", "#3b82f6", "AI coding agent in my daily workflow"),
            ("OpenCode", "opencode", None, "Terminal coding agent I use every day")], 4),
    ("Build", [("NestJS", "nestjs", None, "Microservices and REST APIs"),
               ("TypeScript", "typescript", None, "My default across frontend and backend"),
               ("Python", "python", None, "AI pipelines and automation"),
               ("FastAPI", "fastapi", None, "Backend of the AI Video Making Engine"),
               ("Next.js", "nextjs", None, "Frontend of the AI Video Making Engine"),
               ("React", "react", None, "SAWAB platform and Foundation portal"),
               ("Tailwind CSS", "tailwind", None, "Styling for the SAWAB Foundation portal")], 4),
    ("Data & Ops", [("PostgreSQL", "postgresql", None, "Data layer of the SAWAB platform"),
                    ("Redis", "redis", None, "Cache and background-job queues in the NGO ERP"),
                    ("Kafka", "apachekafka", None, "Event streaming"),
                    ("Docker", "docker", None, "Containerised deploys for the SAWAB platform"),
                    ("Kubernetes", "kubernetes", None, "Orchestration for distributed services"),
                    ("n8n", "n8n", None, "Workflow automations")], 4),
]
# (title, company, place, period, kind: Full-time|Volunteer, [bullets], [chips])
JOBS = [
    ("Software Developer", "SAWAB Bangladesh", "Dhaka, Bangladesh", "Jul 2026 - Present", "Full-time",
     ["Build and maintain SAWAB Bangladesh's public web platforms (sawabbd.org, sawabfoundation.org.bd) on Node.js / "
      "React: donation pipelines, bilingual (Bangla/English) content, and program pages for education, healthcare and WASH initiatives.",
      "Design and develop SAWAB's multi-organisation NGO ERP and HRM on Frappe, ERPNext and HRMS with a Next.js 15 portal: "
      "HR, ZKTeco biometric attendance, multi-project payroll, NGOAB and donor grants, micro-investment, accounts and "
      "procurement, for SAWAB and SAWAB Foundation; in active development, with a live demo."],
     ["Node.js", "React", "Frappe", "ERPNext", "Next.js", "MariaDB"]),
    ("Software Developer & AI Specialist", "Jibika Intelligic Ltd.", "Dhaka, Bangladesh",
     "Jan 2025 - Jun 2026", "Full-time",
     ["Worked on Jibika Plexus, a web-based HR & payroll platform used by 300+ companies, covering personnel, leave, "
      "attendance, payroll, loans and performance appraisal.",
      "Integrated OpenAI, Claude and Gemini APIs into Reports, Appraisal, Leave and Personnel modules to automate "
      "report narratives, appraisal drafts, leave-policy answers and HR documents, cutting manual effort by ~50%.",
      "Delivered attendance processing with device and GPS tracking, multi-layer approvals and auto leave "
      "calculation. Built the Flutter mobile app, with NID OCR onboarding and GPS duty tracking.",
      "Supported client implementation, training and maintenance, keeping payroll current with government gazette updates."],
     [".NET", "Oracle", "Flutter", "LLM APIs", "HR & Payroll"]),
    ("ERP Developer", "Smart Software Limited", "Dhaka, Bangladesh", "Jan 2024 - Dec 2024", "Full-time",
     ["Designed and built PHP & JavaScript ERP modules for institutional clients: HRIS & Payroll, School Management "
      "and Hospital Management.",
      "Turned client requirements into SRS / BRD and UAT documents, then drove module testing, defect tracking and fixes "
      "through every SDLC phase.",
      "Led client onboarding, configuration and end-user training, and kept the system stable for 20+ concurrent users "
      "with day-to-day debugging and hardware support."],
     ["PHP", "JavaScript", "ERP", "SRS / BRD", "UAT"]),
    ("Documentation & IT Executive", "HBIZZ Group Company", "Karwan Bazar, Dhaka", "Aug 2022 - Dec 2023", "Full-time",
     ["Provided IT support across hardware, software, networking and connectivity; maintained IT assets, user accounts and system documentation.",
      "Enforced data security through access control, secure document handling and scheduled system backups.",
      "Developed and maintained the corporate website (hbizz.com) on WordPress with cPanel hosting configuration and performance monitoring."],
     ["WordPress", "cPanel", "IT support", "Security"]),
    ("Voluntary Web Developer", "Tafseerul Quran Foundation (TQF)", "Bangladesh", "2024 - Present", "Volunteer",
     ["Build and maintain the official TQF website (tqfbd.org) on WordPress: custom theme configuration, plugin management, "
      "security patching, performance optimisation and a mobile-responsive layout for a national non-profit audience.",
      "Collaborate with the TQF team on digital-outreach strategy and social-media integration."],
     ["WordPress", "Volunteer", "Non-profit"]),
]
# Per-role headline numbers shown as a stat strip (figures taken from the bullets above)
JOB_STATS = {
    "SAWAB Bangladesh": [("Scope", "10", "module areas in the NGO ERP", "layers"),
                         ("Delivery", "2", "public web platforms maintained", "globe")],
    "Jibika Intelligic Ltd.": [("Efficiency", "~50%", "less manual effort on HRM content, research and reporting, with humans approving every output", "zap")],
    "Smart Software Limited": [("Scope", "3", "ERP modules built for institutional clients", "layers"),
                               ("Reach", "20+", "concurrent users supported day to day", "users")],
}
# Company logo tiles for experience cards (official logos saved under docs/uploads/company-logos/)
COMPANY_LOGOS = {
    "SAWAB Bangladesh": "uploads/company-logos/sawab.png",
    "Jibika Intelligic Ltd.": "uploads/company-logos/jibika.png",
    "Smart Software Limited": "uploads/company-logos/smart-software.png",
    "Tafseerul Quran Foundation (TQF)": "uploads/company-logos/tqf.png",
}
STAT_ICONS = {
    "layers": '<path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
    "globe": '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/>',
    "zap": '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    "users": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>'
             '<path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
}
EDUCATION = [("B.Sc. in Computer Science & Engineering", "Daffodil International University (DIU), Dhaka",
              "Graduated 2022", "uploads/company-logos/diu.png")]
CERTS = [("Web Development: HTML, CSS, JavaScript & Advanced React (6 months)", "SR Institute of Design"),
         ("Cybersecurity Training: VAPT", "Security Mind Pro"),
         ("Google AI Essentials: Generative AI, Prompt Engineering & Responsible AI", "Google / Coursera"),
         ("AI Tools & Automation: ChatGPT, Gemini, Claude, OpenClaw", "Professional Development"),
         ("B2B Lead Generation", "BITM")]
# (group, one-line use, core [(label, brand-icon slug)], also [(label, slug)]); "core" = used daily
SKILLS = [
    ("Core stack", "Web platforms, APIs and backend services",
     [("TypeScript", "typescript"), ("React", "react"), ("Next.js", "nextjs"), ("Tailwind", "tailwind"),
      ("NestJS", "nestjs"), ("FastAPI", "fastapi"), ("Python", "python")],
     [("PHP", "php"), ("Laravel", "laravel")]),
    ("AI & agents", "LLM features, multi-agent workflows and RAG",
     [("OpenAI", "openai"), ("Claude", "claude"), ("Gemini", "gemini"), ("LangGraph", "langgraph"), ("MCP", "mcp")],
     [("PydanticAI", "pydantic"), ("Ollama", "ollama"), ("vLLM", "vllm"), ("Qwen", "qwen"), ("DeepSeek", "deepseek"),
      ("Vercel AI SDK", "vercel"), ("Function Calling", None), ("n8n", "n8n"), ("Zapier", "zapier")]),
    ("AI-assisted development", "Coding and design with AI tools",
     [("Claude Code", "claudecode"), ("Antigravity", "antigravity")],
     [("Cursor", "cursor"), ("Aider", "aider"), ("v0", "v0"), ("Google Stitch", "stitch"), ("Hermes Agent", "hermis")]),
    ("Data & streaming", "Storage, vector search and event pipelines",
     [("PostgreSQL", "postgresql"), ("pgvector", "pgvector"), ("Kafka", "apachekafka"), ("Redis Pub/Sub", "redis")],
     [("Qdrant", "qdrant"), ("Supabase", "supabase"), ("RabbitMQ", "rabbitmq")]),
    ("Infra & observability", "Containers, cloud and monitoring",
     [("Docker", "docker"), ("GitHub Actions", "githubactions")],
     [("Cloudflare", "cloudflare"), ("AWS", "aws"), ("Google Cloud", "googlecloud"), ("Namecheap", "namecheap"),
      ("Langfuse", None), ("OpenTelemetry", "opentelemetry"), ("Grafana", "grafana")]),
]
EXTRA = [("Leadership & Community", "President, Gobindopur Rising Tigers Club: led a 100+ member community organisation across "
                                    "social-development, youth mentorship, and public communications initiatives."),
         ("Philosophy & R&D", "Passionate about autonomous agent architectures, local LLM inference, and building "
                              "developer tools that maximize flow state and engineering velocity."),
         ("Voluntary Work", "Technical contributor for community websites and open-source non-profit initiatives.")]
# (title, description, tags, icon, badge, [links])
PROJECTS = [
    ("SAWAB NGO ERP", "Multi-organisation ERP and HRM for SAWAB and SAWAB Foundation: HR, ZKTeco attendance, payroll, "
     "NGOAB and donor grants, micro-investment, accounts and procurement.",
     ["Frappe", "ERPNext", "Next.js"], "fa-sitemap", "Live demo",
     # the demo is live; sign-in details are given on request over WhatsApp
     [("link", "https://sawab-erp-demo.tail5e47fb.ts.net/"),
      ("whatsapp", WA + "?text=" + quote("Hi Mehedi, I'd like demo access to the SAWAB NGO ERP."))],
     "../sawab_erp_dashboard.webp"),
    ("Karbar ERP", "Business suite for Bangladesh: accounting, NBR VAT (Mushak 6.3, 6.5, 6.6, 9.1), payroll with TDS and "
     "tax slabs, inventory, sales, purchases and project tracking.",
     ["Laravel", "Filament", "ERP", "VAT"], "fa-building-columns", None, [("github", GH + "/karbar-erp")],
     "../karbar_erp_preview.webp"),
    ("SAWAB Bangladesh Platform", "Production NGO portal for education, healthcare, WASH and humanitarian aid, with donation "
     "pipelines and a bilingual (Bangla/English) architecture on Node.js 22, PostgreSQL and Docker.",
     ["Node.js", "PostgreSQL", "Docker"], "fa-globe", "Live", [("link", "https://sawabbd.org/")],
     "../sawabbd_preview.webp"),
    ("SAWAB Foundation Portal", "Charity and zakat platform (React 18, TypeScript, Tailwind CSS) with an automated zakat "
     "calculator, relief tracking and instant donation integration.",
     ["React", "TypeScript", "Tailwind"], "fa-hand-holding-heart", "Live", [("link", "https://sawabfoundation.org.bd/")],
     "../sawabfoundation_preview.webp"),
    ("AI Video Making Engine", "FastAPI + Next.js pipeline that turns long-form video and podcasts into 9:16 short clips "
     "using Whisper speech-to-text, Bengali NLP, a virality-scoring model and FFmpeg rendering.",
     ["FastAPI", "Next.js", "Whisper"], "fa-clapperboard", None, [("github", GH + "/ai-video-making-engine")],
     "../video_making_engine_preview.webp"),
    ("AI Chat Web App", "Conversational AI web interface built with React, NestJS and WebSockets, with streaming LLM "
     "completions and low-latency message pipelines.",
     ["React", "NestJS", "WebSockets"], "fa-comments", None, [],
     "../ai_chat_webapp_preview.webp"),
    ("HR & Payroll System", "Web-based platform for employee master records, payroll processing, tax deductions, "
     "attendance tracking and compliance reporting.",
     ["Payroll", "HR", "Compliance"], "fa-users-gear", None, [("github", GH)],
     "../hr_payroll_dashboard.webp"),
    ("Savora: AI Hostel Management", "Hostel mess-management app (React 19, Vite, Firebase, Capacitor) for meal planning, "
     "pantry inventory tracking, recipe suggestions and grocery optimisation.",
     ["React", "Firebase", "AI"], "fa-utensils", None,
     [("link", "https://mehedihasan228.github.io/Savora-AI-Powered-Meal-Planning-Grocery-Management/"),
      ("github", GH + "/Savora-AI-Powered-Meal-Planning-Grocery-Management")],
     "../savora_hostel_preview.webp"),
    ("Tafseerul Quran Foundation", "Official website for a national non-profit on WordPress: custom theme, plugin "
     "management, security patching and performance optimisation.",
     ["WordPress", "Volunteer"], "fa-book-quran", "Volunteer", [("link", "https://tqfbd.org/")],
     "../tqf_preview.webp"),
    ("HBIZZ Corporate Website", "Corporate website for a freight and logistics company on WordPress with cPanel hosting "
     "configuration and performance monitoring.",
     ["WordPress", "cPanel"], "fa-truck-fast", None, [("link", "https://hbizz.com/")],
     "../hbizz_preview.webp"),
]
# (initials, name, handle, platform, url, bio, why, tags)
PEOPLE = [
    ('../uploads/people/ahmed-shamim-hassan-shaon.webp', 'Ahmed Shamim Hassan Shaon', '@me_shaon', 'X', 'https://x.com/me_shaon', 'CEO of Megaminds Learning, software architect and Laravel contributor', 'Software architect and Laravel contributor; clear thinking on building and leading teams.', ['Tech']),
    ('../uploads/people/mohammad-emran-hasan.webp', 'Mohammad Emran Hasan', '@phpfour', 'X', 'https://x.com/phpfour', 'Building SaaS at klasio.com and helping teams ship Laravel products at figlab.io', 'Decades of real-world experience in building and shipping SaaS products.', ['Tech']),
    ('../uploads/people/hm-nayem.webp', 'HM Nayem', '@mrhm-dev', 'GitHub', 'https://github.com/mrhm-dev', 'Founder of Stack Learner, full-stack developer and trainer', 'Founder of Stack Learner, full-stack developer and trainer', ['Tech']),
    ('../uploads/people/sumit-saha.jpg', 'Sumit Saha', '/sumit.analyzen', 'Facebook', 'https://www.facebook.com/sumit.analyzen', 'Founder of Learn with Sumit: JavaScript, React and Node.js in Bangla', 'Clear, practical Bangla lessons on the JavaScript stack I use every day.', ['Tech']),
    ('../uploads/people/jhankar-mahbub.jpg', 'Jhankar Mahbub', '/JhankarMahbub', 'Facebook', 'https://www.facebook.com/JhankarMahbub', 'Founder of Programming Hero', 'Made programming approachable for a whole generation of Bangladeshi developers.', ['Tech']),
    ('../uploads/people/karpathy.jpg', 'Andrej Karpathy', '@karpathy', 'X', 'https://x.com/karpathy', 'AI researcher, founding member of OpenAI, former head of AI at Tesla', 'The clearest teacher of how LLMs actually work.', ['Tech']),
    ('../uploads/people/harrison-chase.jpg', 'Harrison Chase', '@hwchase17', 'X', 'https://x.com/hwchase17', 'Co-founder and CEO of LangChain', 'Creator of LangChain and LangGraph, the agent tools at the heart of my AI work.', ['Tech']),
    ('../uploads/people/kamil-mysliwiec.jpg', 'Kamil Mysliwiec', '@kammysliwiec', 'X', 'https://x.com/kammysliwiec', 'Creator of NestJS, co-founder of Trilon', 'NestJS is the backbone of my microservices.', ['Tech']),
    ('../uploads/people/jeffrey-way.webp', 'Jeffrey Way', '@jeffrey_way', 'X', 'https://x.com/jeffrey_way', 'Founder of Laracasts', 'A great person to follow', ['Tech']),
    ('../uploads/people/povilas-korop.webp', 'Povilas Korop', '@PovilasKorop', 'X', 'https://x.com/PovilasKorop', 'Founder of Laravel Daily: practical Laravel tips every day', 'A great person to follow', ['Tech']),
    ('../uploads/people/taylor-otwell.webp', 'Taylor Otwell', '@taylorotwell', 'X', 'https://x.com/taylorotwell', 'Creator of Laravel', 'A great person to follow', ['Tech']),
]



PLATFORM_ICON = {"X": "fa-brands fa-twitter", "Website": "fa-solid fa-globe", "GitHub": "fa-brands fa-github",
                 "Mentor": "fa-solid fa-graduation-cap", "Facebook": "fa-brands fa-facebook", "YouTube": "fa-brands fa-youtube"}

from icons import P, ico, BOTTOM_NAV, bottom_nav
NAV = [("profile", "Profile"), ("projects", "Projects"), ("people", "People"), ("contact", "Contact")]
e = html.escape


def badge_svg(plat):
    if plat == "X":
        return '<svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>'
    elif plat == "GitHub":
        return '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>'
    elif plat == "Facebook":
        return '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.597 0 9 1.583 9 4.615V8z"/></svg>'
    elif plat == "YouTube":
        return '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>'
    else:
        return f'<i class="{PLATFORM_ICON.get(plat, "fa-solid fa-link")}"></i>'


def follow_rows(n=3):
    rows = ""
    for ini, name, handle, plat, url, bio, why, *_ in PEOPLE[:n]:
        rows += (f'<div class="f-row">'
                 f'<span class="av p-img" style="background-image:url({ini})">'
                 f'<span class="plat">{badge_svg(plat)}</span></span>'
                 f'<div class="p-id" title="{e(why)}"><b title="{e(why)}">{e(name)}</b><small>{e(bio)}</small></div>'
                 f'<a class="f-btn" href="{url}" target="_blank" rel="noopener noreferrer">Follow</a></div>')
    return rows


def nahian_aurora_html():
    return '''<div class="halo-glow" aria-hidden="true"></div>
<div class="cover" aria-hidden="true">
  <span class="cover-blob" style="--blob: var(--cover-3); top: -45%; left: -12%; --dur: 24s; --delay: 0s;"></span>
  <span class="cover-blob" style="--blob: var(--cover-4); top: 15%; left: 8%; --dur: 27s; --delay: -4s;"></span>
  <span class="cover-blob" style="--blob: var(--cover-5); top: -35%; left: 32%; --dur: 29s; --delay: -8s;"></span>
  <span class="cover-blob" style="--blob: var(--cover-6); top: 5%; left: 55%; --dur: 23s; --delay: -12s;"></span>
  <span class="cover-blob" style="--blob: var(--cover-1); top: -30%; left: 76%; --dur: 31s; --delay: -6s;"></span>
  <span class="cover-blob" style="--blob: var(--cover-2); top: 45%; left: 38%; --dur: 33s; --delay: -16s; width: 45%;"></span>
</div>
<div class="cover-frost" aria-hidden="true"></div>
<div class="halo-spot" aria-hidden="true"></div>'''


GLOW_JS = """<script>
function glowTrack(card, x, y) {
  card._tx = x; card._ty = y;
  if (card._x === undefined) { card._x = x; card._y = y; }
  if (card._raf) return;
  (function step() {
    card._x += (card._tx - card._x) * 0.2; card._y += (card._ty - card._y) * 0.2;
    card.style.setProperty("--mx", card._x + "px"); card.style.setProperty("--my", card._y + "px");
    card._raf = (Math.abs(card._tx - card._x) > 0.5 || Math.abs(card._ty - card._y) > 0.5) ? requestAnimationFrame(step) : null;
  })();
}
document.addEventListener("pointermove", function (ev) {
  var card = ev.target.closest && ev.target.closest(".glow-tile");
  if (!card) return;
  var r = card.getBoundingClientRect();
  glowTrack(card, ev.clientX - r.left, ev.clientY - r.top);
});
</script>"""


def rail(show_open=True, show_top=False):
    openc = (f'''<div class="r-card r-card-open glow-tile">
      <span class="glow-tile-face" aria-hidden="true"></span>
      <div class="r-status-pill">
        <span class="live-dot-wrap">
          <span class="live-dot-ping"></span>
          <span class="live-dot-core"></span>
        </span>
        <span class="r-status-label">Available for work</span>
      </div>
      <h3 class="r-card-title">Open to new conversations</h3>
      <p class="r-card-desc">AI-native software engineer. Always happy to talk products, collaborations and consultations.</p>
      <a class="r-cta-btn" href="../contact/">
        <span>Let's talk</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="r-btn-arrow"><path d="M5 12h14m-6-6l6 6-6 6"/></svg>
      </a>
    </div>
    {GLOW_JS}''' if show_open else "")

    avs = "".join(f'<span class="av p-img" style="width:26px;height:26px;border-radius:50%;margin-left:-8px;box-shadow:0 0 0 2px var(--surface);background-image:url({p[0]});background-size:cover;background-position:center;display:inline-block;"></span>' for p in PEOPLE[3:6])
    more_count = max(0, len(PEOPLE) - 6)
    if more_count > 0:
        avs += f'<span class="av-more" style="width:26px;height:26px;border-radius:50%;background:var(--surface-2);color:var(--ink-2);font-size:11px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px var(--surface);border:1px solid var(--line);margin-left:-8px;">+{more_count}</span>'

    arr_svg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="find-arr"><path d="M7 17L17 7M7 7h10v10"/></svg>'

    socials = [
        ("GitHub", "@MehediHasan228", GH,
         '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>'),
        ("LinkedIn", "in/mehedi-hasan-2859383b4", LI,
         '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>'),
        ("WhatsApp", "+880 1799-447594", WA,
         '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>'),
        ("Email", MAIL, f"mailto:{MAIL}",
         '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>'),
        ("Portfolio", "mehedi.pro.bd", SITE,
         '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>')
    ]

    find_rows = ""
    for label, handle, url, ico_svg in socials:
        find_rows += (f'<a href="{url}" target="_blank" rel="noopener noreferrer" class="find-item">'
                      f'<span class="find-ico">{ico_svg}</span>'
                      f'<span class="find-info"><b>{label}</b><small>{handle}</small></span>{arr_svg}</a>')

    rail_top_html = (f'<div class="rail-top">{SHARE_BTN}<a class="btn-rail-top" href="{GH}" target="_blank" rel="noopener noreferrer" title="Follow on GitHub" aria-label="Follow Mehedi on GitHub">'
                     f'<span class="git-icon-wrap"><i class="fa-brands fa-github"></i></span>'
                     f'<span>Follow</span>'
                     f'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="git-arr"><path d="M7 17L17 7M7 7h10v10"/></svg>'
                     f'</a></div>') if show_top else ''

    return (f'<aside class="rail">'
            f'{rail_top_html}'
            f'<div class="rail-body">{openc}'
            f'<div class="r-card">'
            f'<div class="r-card-head">'
            f'<div class="r-head-title"><span class="r-head-ico">'
            f'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
            f'</span><span>Who to follow</span></div>'
            f'</div>'
            f'<div class="follow-list">{follow_rows()}</div>'
            f'<a class="see-all-people" href="../people/">'
            f'<span class="see-all-label">See all {len(PEOPLE)} people <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-6-6l6 6-6 6"/></svg></span>'
            f'<span class="see-all-avs">{avs}</span></a></div>'
            f'<div class="r-card">'
            f'<div class="r-card-head">'
            f'<div class="r-head-title"><span class="r-head-ico">'
            f'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>'
            f'</span><span>Find me on</span></div>'
            f'</div>'
            f'<div class="find-list">{find_rows}</div>'
            f'<div class="find-foot"><a class="see-all-profiles" href="../contact/"><span>See all contact channels</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-6-6l6 6-6 6"/></svg></a></div>'
            f'</div>'
            f'</aside>')


def cover_banner():
    return ('<div class="relative overflow-hidden cover-banner-wrap" data-slats style="position:relative;overflow:hidden;width:100%;">'
            '<div class="cover absolute inset-0" aria-hidden="true" style="position:absolute;inset:0;overflow:hidden;pointer-events:none;">'
            '<span class="cover-blob" style="--blob: var(--cover-1); top: -45%; left: -12%; --dur: 24s; --delay: 0s;"></span>'
            '<span class="cover-blob" style="--blob: var(--cover-2); top: 15%; left: 8%; --dur: 27s; --delay: -4s;"></span>'
            '<span class="cover-blob" style="--blob: var(--cover-3); top: -35%; left: 32%; --dur: 29s; --delay: -8s;"></span>'
            '<span class="cover-blob" style="--blob: var(--cover-4); top: 5%; left: 55%; --dur: 23s; --delay: -12s;"></span>'
            '<span class="cover-blob" style="--blob: var(--cover-5); top: -30%; left: 76%; --dur: 31s; --delay: -6s;"></span>'
            '<span class="cover-blob" style="--blob: var(--cover-6); top: 45%; left: 38%; --dur: 33s; --delay: -16s; width: 45%;"></span>'
            '</div>'
            '<div class="absolute inset-0" data-slats-canvas style="position:absolute;inset:0;opacity:0;transition:opacity .25s;"></div>'
            '<div class="cover-gradient-vignette" aria-hidden="true"></div>'
            '</div>')


SCOPED_FIX = """
/* Subpage Layout & Header Geometry */
body.nx-page .nx {
  padding-top: 98px !important;
  padding-bottom: 96px;
  position: relative;
  z-index: 1;
}
body.nx-page[data-page="profile"] .nx {
  padding-top: 0 !important;
}

@media (max-width: 767px) {
  body.nx-page .nx {
    padding-top: 60px !important;
    padding-bottom: 96px;
  }
  body.nx-page[data-page="profile"] .nx {
    padding-top: 0 !important;
  }
}

/* Mobile App Native Flush Bottom Nav */
@media (max-width: 767px) {
  .nx .bottom-nav,
  .bottom-nav {
    position: fixed !important;
    z-index: 9999 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    display: flex !important;
    justify-content: space-around !important;
    align-items: center !important;
    padding: 6px 6px calc(6px + env(safe-area-inset-bottom, 8px)) 6px !important;
    border-radius: 0 !important;
    border-top: 1px solid var(--line, rgba(255, 255, 255, 0.12)) !important;
    background: color-mix(in srgb, var(--card-bg, var(--surface, #0b1120)) 88%, transparent) !important;
    backdrop-filter: blur(20px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.22) !important;
  }
  .nx .bottom-nav a,
  .bottom-nav a {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    flex: 1 !important;
    min-width: 0 !important;
    gap: 3px !important;
    padding: 6px 4px !important;
    border-radius: 12px !important;
    font-size: 11px !important;
    font-weight: 500 !important;
    color: var(--text-color, var(--ink-3)) !important;
    text-decoration: none !important;
    transition: background 0.2s, color 0.2s, transform 0.15s !important;
  }
  .nx .bottom-nav a svg,
  .bottom-nav a svg {
    width: 22px !important;
    height: 22px !important;
    flex-shrink: 0 !important;
    /* every icon gets the same pill box, so selecting one never shifts the layout */
    padding: 4px 16px !important;
    box-sizing: content-box !important;
    border-radius: 999px !important;
    transition: background 0.2s ease !important;
  }
  /* selected tab: tinted pill behind the icon, icon and label in the theme accent (no filled block) */
  .nx .bottom-nav a[aria-current="page"],
  .bottom-nav a[aria-current="page"] {
    background: transparent !important;
    color: var(--accent-1, #2563eb) !important;
    font-weight: 600 !important;
  }
  .nx .bottom-nav a[aria-current="page"] svg,
  .bottom-nav a[aria-current="page"] svg {
    background: color-mix(in srgb, var(--accent-1, #2563eb) 18%, transparent) !important;
  }
  .nx .bottom-nav a:active,
  .bottom-nav a:active {
    transform: scale(0.94) !important;
  }

  html[data-theme="light"] .nx .bottom-nav,
  html[data-theme="light"] .bottom-nav,
  [data-theme="light"] .nx .bottom-nav,
  [data-theme="light"] .bottom-nav,
  html.light-mode .bottom-nav,
  body.light-mode .bottom-nav {
    background: rgba(255, 255, 255, 0.92) !important;
    border-top: 1px solid rgba(0, 0, 0, 0.08) !important;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06) !important;
  }
  html[data-theme="light"] .nx .bottom-nav a,
  html[data-theme="light"] .bottom-nav a,
  [data-theme="light"] .nx .bottom-nav a,
  [data-theme="light"] .bottom-nav a,
  body.light-mode .bottom-nav a {
    color: #475569 !important;
  }
  html[data-theme="light"] .nx .bottom-nav a[aria-current="page"],
  html[data-theme="light"] .bottom-nav a[aria-current="page"],
  [data-theme="light"] .nx .bottom-nav a[aria-current="page"],
  [data-theme="light"] .bottom-nav a[aria-current="page"],
  body.light-mode .bottom-nav a[aria-current="page"] {
    background: transparent !important;
    color: var(--accent-1, #2563eb) !important;
  }
}

/* Hide telemetry cockpit clutter on subpages */
body.nx-page .sys-monitor {
  display: none !important;
}
body.nx-page #sys-monitor-dock {
  display: none !important;
}

/* Active Nav Links */
.nav-links a.active,
.nav-links a[aria-current="page"] {
  color: var(--accent-1, #00f2fe) !important;
  position: relative;
}
.nav-links a.active::after,
.nav-links a[aria-current="page"]::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -6px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, #00f2fe, #4facfe);
}

/* Unified Subpage Header Bar */
.sub-header-bar {
  position: sticky;
  top: 98px;
  z-index: 40;
  width: 100%;
  border-bottom: 1px solid color-mix(in srgb, var(--line) 70%, transparent);
  background: color-mix(in srgb, var(--bg) 42%, transparent);
  backdrop-filter: blur(18px) saturate(1.4);
  -webkit-backdrop-filter: blur(18px) saturate(1.4);
}
.sub-header-shell {
  max-width: 1180px;
  margin: 0 auto;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
}
.sub-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.sub-header-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--ink);
  margin: 0;
  line-height: 1;
}
.sub-header-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 11px;
  border-radius: 9999px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--brand, #00f2fe);
  background: rgba(var(--brand-rgb, 0, 242, 254), 0.1);
  border: 1px solid rgba(var(--brand-rgb, 0, 242, 254), 0.25);
}
.sub-header-pill i {
  font-size: 11px;
}
.sub-header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

@media (max-width: 1239px) {
  .sub-header-shell {
    padding: 0 24px;
  }
}

@media (max-width: 767px) {
  .sub-header-bar {
    top: 60px;
  }
  .sub-header-shell {
    height: 52px;
    padding: 0 16px;
  }
  .sub-header-title {
    font-size: 18px;
  }
  .sub-header-pill {
    display: none;
  }
}

/* Right Rail Alignment & Sticky */
.nx .rail {
  top: 162px !important;
  max-height: calc(100dvh - 162px) !important;
  position: sticky !important;
}
body.nx-page[data-page="profile"] .nx .rail {
  top: 98px !important;
  max-height: calc(100dvh - 98px) !important;
}
.nx .rail-top {
  display: flex !important;
  height: 64px !important;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px !important;
  gap: 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--line) 70%, transparent);
  background: color-mix(in srgb, var(--bg) 42%, transparent) !important;
  backdrop-filter: blur(18px) saturate(1.4) !important;
  -webkit-backdrop-filter: blur(18px) saturate(1.4) !important;
  position: sticky !important;
  top: 0 !important;
  z-index: 40 !important;
}
.nx .rail-body {
  padding: 20px 20px 80px !important;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.nx .btn-rail-top,
.nx .rail-top .btn-rail-top {
  display: inline-flex !important;
  align-items: center !important;
  gap: 9px !important;
  height: 38px !important;
  padding: 0 16px 0 10px !important;
  border-radius: 9999px !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  letter-spacing: -0.01em !important;
  color: var(--ink) !important;
  background: color-mix(in srgb, var(--surface-2, #17223a) 85%, rgba(var(--brand-rgb, 0, 242, 254), 0.08)) !important;
  border: 1px solid color-mix(in srgb, var(--line) 65%, rgba(var(--brand-rgb, 0, 242, 254), 0.45)) !important;
  box-shadow: 0 4px 14px -3px rgba(0, 0, 0, 0.4), 0 0 12px -3px rgba(var(--brand-rgb, 0, 242, 254), 0.22) !important;
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
  text-decoration: none !important;
  transition: all .25s cubic-bezier(0.16, 1, 0.3, 1) !important;
  cursor: pointer !important;
}
.nx .btn-rail-top:hover,
.nx .rail-top .btn-rail-top:hover {
  background: color-mix(in srgb, var(--surface-3, #202d49) 80%, rgba(var(--brand-rgb, 0, 242, 254), 0.2)) !important;
  border-color: var(--brand, #00f2fe) !important;
  color: #ffffff !important;
  box-shadow: 0 6px 20px -3px rgba(0, 0, 0, 0.55), 0 0 20px 0 rgba(var(--brand-rgb, 0, 242, 254), 0.42) !important;
  transform: translateY(-1.5px) !important;
}
.nx .btn-rail-top .git-icon-wrap {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(var(--brand-rgb, 0, 242, 254), 0.16);
  border: 1px solid rgba(var(--brand-rgb, 0, 242, 254), 0.35);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--brand, #00f2fe);
  font-size: 13px;
  transition: transform .25s ease, background .25s ease, color .25s ease, border-color .25s ease;
  flex-shrink: 0;
}
.nx .btn-rail-top:hover .git-icon-wrap {
  background: var(--brand, #00f2fe);
  color: #050a14;
  border-color: var(--brand, #00f2fe);
  transform: scale(1.06);
}
.nx .btn-rail-top .git-arr {
  color: var(--ink-3, #94a3b8);
  transition: transform .25s ease, color .25s ease;
  flex-shrink: 0;
  margin-left: -2px;
}
.nx .btn-rail-top:hover .git-arr {
  color: var(--brand, #00f2fe);
  transform: translate(2px, -2px);
}
@media (max-width: 1239px) {
  .nx .rail {
    display: none !important;
  }
}

/* Content Area Polish */
.nx .pad {
  padding: 28px 32px 56px !important;
  max-width: 860px;
  margin-inline: auto;
}
@media (max-width: 767px) {
  .nx .pad {
    padding: 20px 16px 40px !important;
  }
}

/* Lead Text - Clean Left Aligned matching Reference */
.nx .pad > .lead {
  text-align: left !important;
  max-width: none !important;
  margin: 0 0 28px 0 !important;
  font-size: 16px;
  line-height: 1.6;
  color: var(--ink-2);
}

/* Theme variables and slats cover */
:root, [data-theme="dark"] {
  --bg: #0b1120;
  --surface: #101a2e;
  --surface-2: #17223a;
  --surface-3: #202d49;
  --ink: #f8fafc;
  --ink-2: #cbd5e1;
  --ink-3: #94a3b8;
  --line: #1d2a45;
  --line-strong: #2b3b5e;
  --cover-1: #00f2fe;
  --cover-2: #4facfe;
  --cover-3: #0284c7;
  --cover-4: #38bdf8;
  --cover-5: #0369a1;
  --cover-6: #00c6ff;
  --slats-bg: #0b1120;
  --slats-color: #00f2fe;
  --slats-glint: #e0f9ff;
}
[data-theme="light"], .light {
  --bg: #f8fafc;
  --surface: #ffffff;
  --surface-2: #f1f5f9;
  --surface-3: #e2e8f0;
  --ink: #0f172a;
  --ink-2: #334155;
  --ink-3: #64748b;
  --line: #e2e8f0;
  --line-strong: #cbd5e1;
  --cover-1: #93c5fd;
  --cover-2: #60a5fa;
  --cover-3: #3b82f6;
  --cover-4: #2563eb;
  --cover-5: #bfdbfe;
  --cover-6: #1d4ed8;
  --slats-bg: #f8fafc;
  --slats-color: #2563eb;
  --slats-glint: #ffffff;
}
[data-theme="cyberpunk"] {
  --bg: #09090b;
  --surface: #130a10;
  --surface-2: #1e0f18;
  --surface-3: #2b1521;
  --ink: #fbbf24;
  --ink-2: #dcbf86;
  --ink-3: #a1a1aa;
  --line: #3a1824;
  --line-strong: #52202f;
  --cover-1: #f43f5e;
  --cover-2: #eab308;
  --cover-3: #ec4899;
  --cover-4: #fb7185;
  --cover-5: #f59e0b;
  --cover-6: #e11d48;
  --slats-bg: #09090b;
  --slats-color: #f43f5e;
  --slats-glint: #fef08a;
}
[data-theme="mint"] {
  --bg: #f4faf7;
  --surface: #ffffff;
  --surface-2: #eaf6f0;
  --surface-3: #d8ece2;
  --ink: #0f172a;
  --ink-2: #2d3748;
  --ink-3: #64748b;
  --line: #d1fae5;
  --line-strong: #a7f3d0;
  --brand-rgb: 16, 185, 129;
  --brand: #10b981;
  --link: #059669;
  --cover-1: #a7f3d0;
  --cover-2: #6ee7b7;
  --cover-3: #34d399;
  --cover-4: #10b981;
  --cover-5: #059669;
  --cover-6: #047857;
  --slats-bg: #f4faf7;
  --slats-color: #10b981;
  --slats-glint: #ffffff;
}
[data-theme="god-mode"] {
  --cover-1: #00ff00;
  --cover-2: #22c55e;
  --cover-3: #16a34a;
  --cover-4: #4ade80;
  --cover-5: #15803d;
  --cover-6: #86efac;
  --slats-bg: #000000;
  --slats-color: #00ff00;
  --slats-glint: #dcfce7;
}
[data-slats], .cover-banner-wrap {
  position: relative;
  overflow: hidden;
  height: 230px !important;
  width: 100%;
  border-bottom: 1px solid var(--line);
  background: var(--slats-bg, var(--bg));
}
@media (max-width: 767px) {
  [data-slats], .cover-banner-wrap {
    height: 170px !important;
  }
}
.cover {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.cover-blob {
  aspect-ratio: 1;
  background: radial-gradient(closest-side, var(--blob), transparent);
  opacity: .85;
  will-change: transform;
  width: 70%;
  animation: cover-drift var(--dur, 22s) ease-in-out infinite alternate;
  animation-delay: var(--delay, 0s);
  border-radius: 9999px;
  position: absolute;
  filter: blur(40px);
}
.dark .cover-blob, [data-theme="dark"] .cover-blob { opacity: .7; }
@keyframes cover-drift {
  0% { transform: translate(0) scale(1) rotate(0deg); }
  50% { transform: translate(12%, -10%) scale(1.15) rotate(20deg); }
  100% { transform: translate(-10%, 8%) scale(.95) rotate(-15deg); }
}
.cover-gradient-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, transparent 55%, color-mix(in srgb, var(--bg) 40%, transparent) 80%, var(--bg) 100%);
  z-index: 2;
}
[data-slats-canvas] {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: auto;
}
[data-slats-canvas] canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

/* Post Cards Contrast & Surface across Subpages */
.nx .post {
  background: var(--surface) !important;
  border: 1px solid var(--line) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
  transition: background .2s ease, border-color .2s ease, transform .2s ease !important;
}
.nx .post:hover {
  background: var(--surface-2) !important;
  border-color: var(--brand) !important;
  transform: translateY(-2px);
}
.nx .post h3 {
  color: var(--ink) !important;
}
.nx .post small {
  color: var(--ink-3) !important;
}

/* Profile Avatar & Hero Optimization */
.nx .nx-hero {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  text-align: center !important;
  padding: 0 24px 0 !important;
  position: relative;
  z-index: 10;
}
.nx .avatar,
.nx-hero .avatar {
  width: 136px !important;
  height: 136px !important;
  margin-top: -68px !important;
  border-radius: 50% !important;
  object-fit: cover !important;
  background: var(--surface) !important;
  box-shadow: 0 0 0 4px var(--surface), 0 0 0 6px color-mix(in srgb, var(--brand) 45%, transparent), 0 16px 36px -6px rgba(0, 0, 0, 0.32) !important;
  position: relative !important;
  z-index: 10 !important;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease !important;
}
.nx .avatar:hover,
.nx-hero .avatar:hover {
  transform: translateY(-2px) scale(1.02) !important;
  box-shadow: 0 0 0 4px var(--surface), 0 0 0 7px var(--brand), 0 20px 42px -6px rgba(0, 0, 0, 0.4) !important;
}
@media (max-width: 767px) {
  .nx .avatar,
  .nx-hero .avatar {
    width: 112px !important;
    height: 112px !important;
    margin-top: -56px !important;
  }
}

/* Profile Name & Verified Badge SEO Hierarchy */
.nx-hero .nx-name {
  margin-top: 14px !important;
  margin-bottom: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  font-size: 30px !important;
  font-weight: 700 !important;
  letter-spacing: -0.025em !important;
  color: var(--ink) !important;
  line-height: 1.2 !important;
}
.nx-hero .verified-badge {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  vertical-align: middle !important;
  flex-shrink: 0 !important;
}
.nx-hero .verified-badge svg,
.nx-hero .verified-badge .verified {
  width: 26px !important;
  height: 26px !important;
  color: var(--brand) !important;
  display: block !important;
}
@media (max-width: 767px) {
  .nx-hero .nx-name {
    font-size: 24px !important;
  }
  .nx-hero .verified-badge svg,
  .nx-hero .verified-badge .verified {
    width: 22px !important;
    height: 22px !important;
  }
}
.nx .main { border-left: 1px solid var(--line); }
.av.p-img { background-size: cover !important; background-position: center !important; }

/* Experience timeline on profile */
.exp-modern { display: flex; flex-direction: column; gap: 0; margin-top: 16px; }
.exp-item-modern { display: flex; gap: 24px; position: relative; text-align: left; }
.exp-timeline { display: flex; flex-direction: column; align-items: center; width: 48px; flex-shrink: 0; }
.exp-logo-box { width: 48px; height: 48px; background: var(--surface-2); border: 1px solid var(--line); color: var(--ink); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px; position: relative; z-index: 2; }
.status-dot { position: absolute; bottom: -2px; right: -2px; width: 14px; height: 14px; background: var(--brand); border: 2px solid var(--bg); border-radius: 50%; }
.exp-line { flex: 1; width: 2px; background: var(--line); margin-top: 8px; margin-bottom: 8px; min-height: 40px; }
.exp-item-modern:last-child .exp-line { display: none; }
.exp-content { flex: 1; padding-bottom: 40px; }
.exp-item-modern:last-child .exp-content { padding-bottom: 0; }
.exp-header-row { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; margin-bottom: 6px; flex-wrap: wrap; }
.exp-header-row h3 { font-size: 19px; font-weight: 700; color: var(--ink); margin: 0; }
.exp-when { font-size: 15px; color: var(--ink-3); font-weight: 500; white-space: nowrap; }
.exp-sub { font-size: 16px; color: var(--ink-2); margin-bottom: 16px; font-weight: 500; }
.exp-bullets { list-style: disc; padding-left: 20px; margin: 0 0 16px 0; display: flex; flex-direction: column; gap: 10px; }
.exp-bullets li { font-size: 15px; color: var(--ink-2); line-height: 1.6; }
.exp-tech { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.exp-title-group { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.exp-now { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--brand); background: color-mix(in srgb, var(--brand) 14%, transparent); border-radius: 999px; padding: 2px 9px; }
.exp-now::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: var(--brand); }
.exp-bullets { position: relative; list-style: none; padding-left: 0; gap: 12px; }
.exp-bullets::before { content: ""; position: absolute; left: 8px; top: 10px; bottom: 10px; width: 2px; border-radius: 2px; background: linear-gradient(to bottom, color-mix(in srgb, var(--brand) 55%, transparent), color-mix(in srgb, var(--brand) 12%, transparent)); }
.exp-bullets li { position: relative; padding-left: 28px; }
.xb-ico { position: absolute; left: 0; top: 3px; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--bg); color: var(--brand); border: 1.5px solid var(--brand); box-sizing: border-box; }
.exp-bullets li b { color: var(--ink); font-weight: 700; }
.exp-more-li { display: none; padding-left: 0; }
.exp-more-btn { display: none; }
.exp-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin: 4px 0 16px; }
.exp-stat-card { min-height: 150px; padding: 18px 20px; }
.exp-stat-card .exp-stat-num { font-size: 40px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.05; color: #ffffff; margin: 6px 0 8px; }
.exp-stat-card .exp-stat-cap { font-size: 14px; color: #cbd5e1; line-height: 1.4; margin: 0; }
.nx .widget-location.exp-stat-card .exp-stat-num { color: var(--ink) !important; text-shadow: none; }
/* same pastel brand gradient as the Based-in card, theme-adaptive; the dark frost layer is hidden so the tint shows */
/* stat tiles: standard surface like the cards below, with a faint brand tint; light theme gets the white-mint look */
.nx .widget-location.exp-stat-card { background: linear-gradient(120deg, color-mix(in srgb, var(--brand) 6%, var(--surface)) 0%, color-mix(in srgb, var(--brand) 12%, var(--surface)) 100%) !important; border: 1px solid color-mix(in srgb, var(--brand) 25%, transparent) !important; box-shadow: 0 10px 28px -12px rgba(0, 0, 0, 0.25) !important; }
.exp-stat-card .cover, .exp-stat-card .cover-frost, .exp-stat-card .halo-spot, .exp-stat-card .halo-glow { display: none !important; }
.nx .widget-location.exp-stat-card .widget-icon { color: var(--brand) !important; width: 26px; height: 26px; border-radius: 50%; background: color-mix(in srgb, var(--brand) 16%, transparent); }
.nx .widget-location.exp-stat-card .widget-label { color: var(--ink-2) !important; }
.nx .widget-location.exp-stat-card .exp-stat-cap { color: color-mix(in srgb, var(--ink) 80%, transparent) !important; }
.exp-stat-num { transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1); transform-origin: left center; }
.exp-stat-card::before { content: ""; position: absolute; left: 20px; right: 20px; top: 0; height: 2px; border-radius: 0 0 2px 2px; background: linear-gradient(90deg, transparent, var(--brand), transparent); opacity: 0.8; pointer-events: none; }
.exp-stat-card::after { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; opacity: 0; transition: opacity 0.35s ease;
  background: radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--brand) 22%, transparent), transparent 65%); }
.nx .widget-location.exp-stat-card:hover { transform: translateY(-5px) !important; border-color: color-mix(in srgb, var(--brand) 60%, transparent) !important;
  box-shadow: 0 22px 44px -14px color-mix(in srgb, var(--brand) 50%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.15) !important; }
.nx .widget-location.exp-stat-card:hover::after { opacity: 1; }
.nx .widget-location.exp-stat-card:hover .exp-stat-num { transform: scale(1.06); }
/* same pointer-following glow as the Open-to-conversations card, painted on the tile's own background */
.chip-logo { display: inline-flex; align-items: center; gap: 6px; }
.chip-core { font-weight: 600; color: var(--ink); }
.chip-more { opacity: 0.7; }
.sk-desc { font-size: 13px; color: var(--ink-3); margin: 2px 0 10px; line-height: 1.45; }
.chip-logo img { width: 16px; height: 16px; flex-shrink: 0; object-fit: contain; }
.exp-logo-box img { width: 100%; height: 100%; display: block; object-fit: cover; border-radius: inherit; }
.edu-logo { flex-shrink: 0; width: 48px; height: 48px; object-fit: contain; background: transparent; border: 0; padding: 0; }
.exp-summary { font-size: 14px; color: var(--ink-3); margin: 6px 0 0; }
.exp-dur { color: var(--ink-3); opacity: 0.85; }
.exp-kind { font-weight: 600; color: var(--ink-2); }
.exp-kind.is-volunteer { color: #d97706; }   /* 5.9:1 on the dark page */
[data-theme="light"] .exp-kind.is-volunteer, [data-theme="mint"] .exp-kind.is-volunteer { color: #b45309; }
.exp-sep { color: var(--ink-3); margin: 0 6px; }
@media (max-width: 767px) {
  .exp-item-modern { gap: 14px; }
  .exp-timeline { width: 40px; }
  .exp-logo-box { width: 40px; height: 40px; font-size: 16px; border-radius: 10px; }
  .exp-content { padding-bottom: 28px; }
  .exp-header-row h3 { font-size: 17px; }
  .exp-header-row { flex-direction: column; align-items: flex-start; gap: 4px; }
  .exp-when { display: block; white-space: normal; font-size: 13px; line-height: 1.4; padding: 0; text-align: left; }
  .exp-stat-card:only-child { grid-column: 1 / -1; }
  .exp-sub { font-size: 14px; line-height: 1.5; margin-bottom: 12px; }
  .exp-sep { margin: 0 4px; }
  .exp-bullets li { font-size: 14px; }
  .exp-stats { grid-template-columns: 1fr 1fr; gap: 10px; }
  .exp-stat-card { min-height: 0; padding: 14px 16px; }
  .exp-stat-card .exp-stat-num { font-size: 30px; }
  .exp-stat-card .exp-stat-cap { font-size: 13px; }
  .exp-more-li { display: block; }
  .exp-more-btn { display: inline-flex; align-items: center; gap: 6px; background: none; border: 0; padding: 0; margin: 0; color: var(--brand); font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; }
  .exp-more-btn svg { transition: transform 0.2s ease; }
  .exp-item-modern.is-expanded .exp-more-btn svg { transform: rotate(180deg); }
  .bullet-rest { display: none; }
  .exp-item-modern.is-expanded .bullet-rest { display: list-item; }
}
/* Open-to-conversations card: white at rest in the light theme only; dark and other themes keep their own standard look.
   The pointer glow works in every theme. */
/* same standard card surface as the cards below in every theme; light theme gets the white look */
.nx .glow-tile.r-card { background-color: var(--surface) !important; border: 1px solid var(--line) !important; box-shadow: 0 12px 30px -14px rgba(0, 0, 0, 0.18) !important; }
:is([data-theme="light"], [data-theme="mint"]) .nx .glow-tile.r-card { background-color: #ffffff !important; border: 1px solid color-mix(in srgb, var(--brand) 25%, transparent) !important; }
.glow-tile .cover, .glow-tile .cover-frost, .glow-tile .halo-spot, .glow-tile .halo-glow { display: none !important; }
.nx .glow-tile.r-card { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease !important; }
.glow-tile-face { position: absolute; inset: 0; border-radius: inherit; pointer-events: none; opacity: 0; transition: opacity 0.35s ease;
  z-index: 0; background: radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--brand) 40%, transparent), transparent 70%); }
.glow-tile > *:not(.glow-tile-face) { position: relative; z-index: 1; }
.nx .glow-tile.r-card:hover { transform: translateY(-4px) !important; border-color: color-mix(in srgb, var(--brand) 60%, transparent) !important; box-shadow: 0 22px 44px -14px color-mix(in srgb, var(--brand) 50%, transparent) !important; }
.nx .glow-tile.r-card:hover .glow-tile-face { opacity: 1; }
/* glow painted on the card's own background, so it does not depend on the overlay element */
.nx .glow-tile .r-cta-btn { transition: box-shadow 0.3s ease, transform 0.3s ease; }
.nx .glow-tile .r-cta-btn:hover { box-shadow: 0 0 0 1px color-mix(in srgb, var(--brand) 55%, transparent), 0 10px 28px -6px color-mix(in srgb, var(--brand) 60%, transparent) !important; }
:is([data-theme="light"], [data-theme="mint"]) .nx .glow-tile.r-card .r-card-title { color: #0f172a !important; }
:is([data-theme="light"], [data-theme="mint"]) .nx .glow-tile.r-card .r-card-desc { color: #334155 !important; }
:is([data-theme="light"], [data-theme="mint"]) .nx .glow-tile.r-card .r-status-label { color: var(--link) !important; }
:is([data-theme="light"], [data-theme="mint"]) .nx .glow-tile.r-card .r-status-pill { background: color-mix(in srgb, var(--brand) 12%, #ffffff) !important; border-color: color-mix(in srgb, var(--brand) 35%, transparent) !important; }
/* pointer glow: soft ellipse that fades in/out and eases toward the pointer */
@property --glow { syntax: "<number>"; inherits: true; initial-value: 0; }
.nx .glow-tile.r-card, .nx .widget-location.exp-stat-card { transition: --glow 0.5s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease !important; }
.nx .glow-tile.r-card, .nx .widget-location.exp-stat-card {
  background-image: radial-gradient(ellipse 260px 190px at var(--mx, 50%) var(--my, 50%),
    color-mix(in srgb, var(--brand) calc(var(--glow) * 20%), transparent) 0%,
    color-mix(in srgb, var(--brand) calc(var(--glow) * 7%), transparent) 45%,
    transparent 78%), var(--tile-base, linear-gradient(#ffffff, #ffffff)) !important; }
/* base surface: standard tint on dark themes, plain white in light and mint */
.nx .glow-tile.r-card, .nx .widget-location.exp-stat-card { --tile-base: linear-gradient(120deg, color-mix(in srgb, var(--brand) 6%, var(--surface)) 0%, color-mix(in srgb, var(--brand) 12%, var(--surface)) 100%); }
:is([data-theme="light"], [data-theme="mint"]) .nx .glow-tile.r-card, :is([data-theme="light"], [data-theme="mint"]) .nx .widget-location.exp-stat-card { --tile-base: linear-gradient(#ffffff, #ffffff); }
.nx .glow-tile.r-card:hover, .nx .widget-location.exp-stat-card:hover { --glow: 1; }
/* certifications: theme-coloured cards in a responsive grid */
.cert-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; margin-top: 16px; }
.cert-card { display: flex; gap: 14px; align-items: flex-start; padding: 16px 18px; border-radius: 16px; background: var(--surface); border: 1px solid var(--line); transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease; }
.cert-card:hover { transform: translateY(-3px); border-color: color-mix(in srgb, var(--brand) 55%, transparent); box-shadow: 0 14px 30px -14px color-mix(in srgb, var(--brand) 45%, transparent); }
.cert-ico { flex-shrink: 0; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--brand) 14%, transparent); color: var(--brand); }
.cert-card h4 { margin: 0 0 4px; font-size: 15px; font-weight: 700; line-height: 1.35; color: var(--ink); }
.cert-card p { margin: 0; font-size: 13px; color: var(--ink-3); }
/* additional: same card language as certifications, with a headline stat and tags */
.extra-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-top: 16px; }
.extra-card { display: flex; flex-direction: column; gap: 12px; padding: 18px; border-radius: 16px; background: var(--surface); border: 1px solid var(--line); transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease; }
.extra-card:hover { transform: translateY(-3px); border-color: color-mix(in srgb, var(--brand) 55%, transparent); box-shadow: 0 14px 30px -14px color-mix(in srgb, var(--brand) 45%, transparent); }
.extra-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; min-height: 40px; }
.extra-kicker { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--brand); padding-top: 4px; }
.extra-stat { text-align: right; white-space: nowrap; flex-shrink: 0; }
.extra-stat b { display: block; font-size: 22px; font-weight: 800; line-height: 1.1; color: var(--ink); }
.extra-stat span { font-size: 12px; color: var(--ink-3); }
.extra-card h4 { margin: 0; font-size: 15px; font-weight: 700; color: var(--ink); }
.extra-card p { margin: 0; font-size: 13.5px; line-height: 1.5; color: var(--ink-2); }
.extra-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; }
/* sidebar: no inner scroller; it stays sticky while the page scrolls and reaches its full height at the page end */
body.nx-page[data-page] .nx .rail { max-height: none !important; overflow: visible !important; }
/* the sidebar comes after the page in the HTML, and long pages paint before it arrives: its 392px is kept from the first paint,
   so the page column never jumps sideways */
@media (min-width: 1240px) { .nx .shell.has-rail > .main { max-width: calc(100% - 392px); } }
body.nx-page[data-page="profile"] .nx .rail {
  scrollbar-width: thin !important;
  scrollbar-color: color-mix(in srgb, var(--brand) 45%, transparent) transparent !important;
  -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 36px), transparent 100%);
          mask-image: linear-gradient(to bottom, #000 calc(100% - 36px), transparent 100%);
  padding-bottom: 24px;
}
body.nx-page[data-page="profile"] .nx .rail::-webkit-scrollbar { display: block !important; width: 6px; }
body.nx-page[data-page="profile"] .nx .rail::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--brand) 45%, transparent); border-radius: 6px; }
/* library (overview + /library/<section>/), laid out like nahian.bd/library; colours come from theme variables */
.nl-page { display: flex; flex-direction: column; gap: 48px; }
.nl-page [hidden] { display: none !important; }
.nl-tile { flex-shrink: 0; width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center;
  color: var(--brand); background: var(--surface-2); border: 1px solid var(--line); }
.nl-head { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
.nl-head-text { min-width: 0; }
.nl-head-text h2, .nl-head-text h1 { margin: 0; font-size: 21px; font-weight: 700; letter-spacing: -0.01em; color: var(--ink); }
.nl-head-text p { margin: 3px 0 0; font-size: 14px; line-height: 1.5; color: var(--ink-3); }
.nl-seeall { margin-left: auto; flex-shrink: 0; display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600;
  color: var(--ink-2); text-decoration: none; white-space: nowrap; transition: color 0.2s ease; }
.nl-seeall:hover { color: var(--brand); }
.nl-more { align-self: center; margin-top: 18px; display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 999px;
  font-size: 14px; font-weight: 600; color: var(--ink); text-decoration: none; background: var(--surface); border: 1px solid var(--line);
  transition: border-color 0.2s ease, color 0.2s ease; }
.nl-more:hover { color: var(--brand); border-color: color-mix(in srgb, var(--brand) 55%, transparent); }
.nl-section { display: flex; flex-direction: column; }
.nl-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }

/* hero */
.nl-hero { padding: 30px; border-radius: 28px; border: 1px solid color-mix(in srgb, var(--brand) 28%, transparent);
  background: radial-gradient(120% 120% at 0% 0%, color-mix(in srgb, var(--brand) 16%, var(--surface)) 0%, var(--surface) 65%);
  box-shadow: 0 24px 50px -30px color-mix(in srgb, var(--brand) 55%, transparent); }
.nl-pill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px; font-size: 13px; color: var(--ink-2);
  border: 1px solid var(--line); background: color-mix(in srgb, var(--surface) 70%, transparent); }
.nl-pill i { width: 7px; height: 7px; border-radius: 50%; background: var(--brand); }
.nl-hero-title { margin: 16px 0 10px; font-size: 34px; font-weight: 800; letter-spacing: -0.02em; color: var(--ink); }
.nl-hero > p { margin: 0 0 24px; max-width: 560px; font-size: 16px; line-height: 1.6; color: var(--ink-2); }
.nl-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.nl-stat { display: flex; flex-direction: column; gap: 4px; padding: 16px; border-radius: 18px; border: 1px solid var(--line); text-decoration: none;
  background: color-mix(in srgb, var(--surface) 75%, transparent); transition: transform 0.25s ease, border-color 0.25s ease; }
.nl-stat:hover { transform: translateY(-3px); border-color: color-mix(in srgb, var(--brand) 55%, transparent); }
.nl-stat-ico { color: var(--brand); display: inline-flex; margin-bottom: 6px; }
.nl-stat b { font-size: 24px; font-weight: 800; line-height: 1.1; color: var(--ink); }
.nl-stat > span:last-child { font-size: 13.5px; line-height: 1.35; color: var(--ink-2); }

/* tabs on the section pages */
.nl-tabs ul { position: relative; display: flex; gap: 8px; margin: 0; padding: 0 0 4px; list-style: none; overflow-x: auto; scrollbar-width: none; scroll-behavior: smooth; }
.nl-tabs ul::-webkit-scrollbar { display: none; }
.nl-tabs a { display: inline-flex; align-items: center; gap: 8px; padding: 9px 16px; border-radius: 999px; white-space: nowrap; text-decoration: none;
  font-size: 14px; font-weight: 600; color: var(--ink-2); background: var(--surface); border: 1px solid var(--line); transition: all 0.2s ease; }
.nl-tabs a b { font-weight: 600; color: var(--ink-3); }
.nl-tabs a:hover { color: var(--ink); border-color: color-mix(in srgb, var(--brand) 45%, transparent); }
.nl-tabs a.is-active { color: var(--bg); background: var(--ink); border-color: var(--ink); }
.nl-tabs a.is-active b { color: color-mix(in srgb, var(--bg) 70%, transparent); }
.nl-page > .nl-tabs + .nl-section { margin-top: -20px; }

/* skill cards */
.nl-card { display: flex; flex-direction: column; gap: 14px; padding: 20px; border-radius: 24px; background: var(--surface); border: 1px solid var(--line);
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease; }
.nl-card:hover, .nl-bm:hover { transform: translateY(-3px); border-color: color-mix(in srgb, var(--brand) 50%, transparent);
  box-shadow: 0 18px 36px -20px color-mix(in srgb, var(--brand) 50%, transparent); }
.nl-card-head { display: flex; align-items: flex-start; gap: 12px; }
.nl-card-title { min-width: 0; flex: 1; }
.nl-card-title h3 { margin: 0; font-size: 17px; line-height: 1.35; overflow-wrap: anywhere; }
.nl-card-title h3 a { color: var(--ink); text-decoration: none; }
.nl-card-title code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-weight: 600; }
.nl-card-title code span { color: var(--brand); }
.nl-by { display: flex; align-items: center; gap: 6px; margin-top: 5px; font-size: 13.5px; color: var(--ink-3); }
.nl-by img { width: 20px; height: 20px; border-radius: 50%; object-fit: cover; }
.nl-count { flex-shrink: 0; display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: 12.5px; font-weight: 600;
  color: var(--ink-2); border: 1px solid var(--line); background: var(--surface-2); }
.nl-count i { width: 6px; height: 6px; border-radius: 50%; background: var(--brand); }
.nl-open { flex-shrink: 0; color: var(--ink-3); display: inline-flex; transition: color 0.2s ease; }
.nl-open:hover { color: var(--brand); }
.nl-card > p { margin: 0; font-size: 14.5px; line-height: 1.6; color: var(--ink-2); }
.nl-cmd { margin-top: auto; display: flex; align-items: center; gap: 10px; padding: 10px 10px 10px 14px; border-radius: 16px; border: 1px solid var(--line);
  background: color-mix(in srgb, var(--ink) 5%, var(--surface)); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12.5px; }
.nl-cmd code { flex: 1; min-width: 0; overflow-wrap: anywhere; font: inherit; line-height: 1.5; color: var(--ink-2); }
.nl-cmd code span { color: var(--brand); }
.nl-copy { flex-shrink: 0; width: 36px; height: 36px; border-radius: 11px; border: 1px solid var(--line); background: var(--surface); color: var(--ink-2);
  display: grid; place-items: center; cursor: pointer; transition: color 0.2s ease, border-color 0.2s ease; }
.nl-copy svg { grid-area: 1 / 1; transition: opacity 0.2s ease, transform 0.2s ease; }
.nl-copy svg:last-child { opacity: 0; transform: scale(0.6); }
.nl-copy:hover { color: var(--brand); border-color: color-mix(in srgb, var(--brand) 55%, transparent); }
.nl-copy.is-copied { color: var(--brand); }
.nl-copy.is-copied svg:first-child { opacity: 0; transform: scale(0.6); }
.nl-copy.is-copied svg:last-child { opacity: 1; transform: none; }
.nl-group + .nl-group { margin-top: 36px; }
.nl-group-head { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
.nl-group-head img { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 1px solid var(--line); }
.nl-group-head h3 { margin: 0; font-size: 17px; font-weight: 700; color: var(--ink); }
.nl-group-head p { margin: 2px 0 0; font-size: 13.5px; color: var(--ink-3); }
.nl-group-head p a { color: inherit; text-decoration: none; }
.nl-group-head p a:hover { color: var(--brand); }

/* bookmarks */
.nl-chips { position: relative; display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 20px; scrollbar-width: none; scroll-behavior: smooth; }
.nl-chips.fade-r, .nl-tabs ul.fade-r { -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 56px), transparent); mask-image: linear-gradient(to right, #000 calc(100% - 56px), transparent); }
.nl-chips.fade-l, .nl-tabs ul.fade-l { -webkit-mask-image: linear-gradient(to right, transparent, #000 56px); mask-image: linear-gradient(to right, transparent, #000 56px); }
.nl-chips.fade-l.fade-r, .nl-tabs ul.fade-l.fade-r { -webkit-mask-image: linear-gradient(to right, transparent, #000 56px, #000 calc(100% - 56px), transparent); mask-image: linear-gradient(to right, transparent, #000 56px, #000 calc(100% - 56px), transparent); }
.nl-chips::-webkit-scrollbar { display: none; }
.nl-chips button { display: inline-flex; align-items: center; gap: 7px; padding: 8px 14px; border-radius: 999px; white-space: nowrap; cursor: pointer;
  font: inherit; font-size: 13.5px; font-weight: 600; color: var(--ink-2); background: var(--surface); border: 1px solid var(--line); transition: all 0.2s ease; }
.nl-chips button b { font-weight: 600; color: var(--ink-3); }
.nl-chips button.is-active { color: var(--bg); background: var(--ink); border-color: var(--ink); }
.nl-chips button.is-active b { color: color-mix(in srgb, var(--bg) 70%, transparent); }
.nl-feature { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; align-items: center; padding: 10px 26px 10px 10px; margin-bottom: 20px;
  border-radius: 28px; border: 1px solid color-mix(in srgb, var(--brand) 30%, transparent);
  background: radial-gradient(120% 140% at 100% 0%, color-mix(in srgb, var(--brand) 18%, var(--surface)) 0%, var(--surface) 70%); }
.nl-feature-img img { display: block; width: 100%; aspect-ratio: 960 / 504; object-fit: cover; border-radius: 20px; }
.nl-badges { display: flex; flex-wrap: wrap; gap: 8px; margin: 0; }
.nl-badges span, .nl-bm-badges span { display: inline-flex; align-items: center; gap: 5px; padding: 4px 11px; border-radius: 999px; font-size: 12.5px; font-weight: 600;
  color: var(--ink); background: color-mix(in srgb, var(--surface) 80%, transparent); border: 1px solid var(--line); }
.nl-badges .nl-top, .nl-bm-badges .nl-top { color: var(--brand); }
.nl-feature-body h3 { margin: 14px 0 4px; font-size: 26px; font-weight: 800; line-height: 1.2; letter-spacing: -0.01em; color: var(--ink); }
.nl-feature-by { margin: 0 0 10px; font-size: 14px; color: var(--ink-3); }
.nl-feature-body > p:not(.nl-badges):not(.nl-feature-by) { margin: 0 0 18px; font-size: 16px; line-height: 1.6; color: var(--ink-2); }
.nl-cta { display: inline-flex; align-items: center; gap: 8px; padding: 11px 18px; border-radius: 14px; font-size: 14px; font-weight: 700; text-decoration: none;
  background: var(--brand); color: color-mix(in srgb, var(--bg) 92%, #000); transition: transform 0.2s ease, box-shadow 0.2s ease; }
.nl-cta:hover { transform: translateY(-2px); box-shadow: 0 12px 24px -10px color-mix(in srgb, var(--brand) 70%, transparent); }
.nl-ghost { display: inline-flex; align-items: center; gap: 8px; padding: 9px 16px; border-radius: 12px; font-size: 14px; font-weight: 600; text-decoration: none;
  color: var(--ink); background: var(--surface); border: 1px solid var(--line); transition: border-color 0.2s ease, color 0.2s ease; }
.nl-ghost:hover { color: var(--brand); border-color: color-mix(in srgb, var(--brand) 55%, transparent); }
.nl-bm { display: flex; flex-direction: column; padding: 6px; border-radius: 24px; background: var(--surface); border: 1px solid var(--line);
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease; }
.nl-bm-thumb { position: relative; display: block; overflow: hidden; border-radius: 19px; background: var(--surface-2); }
.nl-bm-thumb img { display: block; width: 100%; aspect-ratio: 960 / 504; object-fit: cover; transition: transform 0.4s ease; }
.nl-bm:hover .nl-bm-thumb img { transform: scale(1.03); }
.nl-bm-badges { position: absolute; left: 10px; top: 10px; display: flex; gap: 6px; }
.nl-bm-badges span { color: #fff; background: rgba(15, 23, 42, 0.78); border-color: transparent; -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }
.nl-bm-badges .nl-top { color: #fff; }
.nl-bm-badges .nl-top svg { color: #34d399; }
.nl-bm-body { display: flex; flex-direction: column; gap: 6px; padding: 14px 14px 12px; flex: 1; }
.nl-bm-body h3 { margin: 0; font-size: 16.5px; font-weight: 700; }
.nl-bm-body h3 a { color: var(--ink); text-decoration: none; }
.nl-bm-body > p { margin: 0; font-size: 14px; line-height: 1.55; color: var(--ink-2); }
.nl-domain { display: flex; align-items: center; gap: 8px; margin-top: auto !important; padding-top: 8px; font-size: 13px !important; color: var(--ink-3) !important; }
.nl-domain span { flex: 1; }
.nl-bm-sec { margin-top: 28px; }
.nl-bm-sec-head { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
.nl-bm-sec-head h3 { display: inline-flex; align-items: center; gap: 8px; margin: 0; font-size: 17px; font-weight: 700; color: var(--ink); }
.nl-bm-sec-head h3 svg { color: var(--brand); }
.nl-bm-sec-head p { margin: 0; font-size: 14px; color: var(--ink-3); }
.nl-ext { margin-top: 36px; }
.nl-ext-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; color: var(--brand); }
.nl-ext-head h3 { margin: 0; font-size: 17px; font-weight: 700; color: var(--ink); }
.nl-tag { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; color: var(--ink-2);
  background: var(--surface-2); border: 1px solid var(--line); }
.nl-ext-feature { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 20px; align-items: center; padding: 20px; border-radius: 24px;
  background: var(--surface); border: 1px solid var(--line); }
.nl-ext-id { display: flex; align-items: center; gap: 12px; }
.nl-ext-id img { width: 48px; height: 48px; border-radius: 12px; }
.nl-ext-id h4 { margin: 0 0 4px; font-size: 18px; font-weight: 700; color: var(--ink); }
.nl-ext-feature-body > p { margin: 14px 0 16px; font-size: 14.5px; line-height: 1.6; color: var(--ink-2); }
.nl-ext-links { display: flex; flex-wrap: wrap; gap: 10px; }
.nl-ext-shot img { display: block; width: 100%; aspect-ratio: 960 / 504; object-fit: cover; border-radius: 16px; border: 1px solid var(--line); }
.nl-ext-list { list-style: none; margin: 14px 0 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.nl-ext-list a { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 18px; text-decoration: none; color: var(--ink-3);
  background: var(--surface); border: 1px solid var(--line); transition: border-color 0.2s ease; }
.nl-ext-list a:hover { border-color: color-mix(in srgb, var(--brand) 50%, transparent); }
.nl-ext-ico img { display: block; width: 40px; height: 40px; border-radius: 10px; }
.nl-ext-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.nl-ext-meta span:first-child { font-size: 15px; font-weight: 700; color: var(--ink); }
.nl-ext-meta span:last-child { font-size: 13px; line-height: 1.45; color: var(--ink-2); }

/* music */
.nl-player { padding: 8px; border-radius: 28px; background: var(--surface); border: 1px solid color-mix(in srgb, var(--brand) 25%, transparent);
  box-shadow: 0 24px 50px -32px color-mix(in srgb, var(--brand) 60%, transparent); }
.nl-screen, .nl-ep-screen { position: relative; overflow: hidden; border-radius: 22px; background: #000; aspect-ratio: 16 / 9; }
.nl-screen { width: 100%; min-height: 200px; }   /* YouTube's smallest player, on a phone too; the set width keeps the box from widening */
.nl-screen-thumb, .nl-ep-screen img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.nl-page .nl-play { position: absolute; left: 50%; top: 50%; translate: -50% -50%; width: 68px; height: 68px; border-radius: 50%; border: 0; cursor: pointer;
  display: grid; place-items: center; color: #fff !important; background: #ef233c !important; box-shadow: 0 10px 30px rgba(239, 35, 60, 0.45); transition: transform 0.2s ease; padding: 0; }
.nl-page .nl-play:hover { transform: scale(1.06); }
.nl-page .nl-play svg { margin-left: 4px; }
.nl-frame, .nl-frame iframe, .nl-ep-screen iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.nl-frame { display: none; }
.nl-player.is-playing .nl-frame { display: block; }
.nl-player.is-playing .nl-play, .nl-player.is-playing .nl-screen-thumb { display: none !important; }
.nl-player-bar { display: flex; align-items: center; gap: 14px; padding: 14px 10px 8px; }
.nl-player-av { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.nl-player-meta { flex: 1; min-width: 0; }
.nl-player-meta p { margin: 0; }
.nl-upnext { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: var(--brand); }
.nl-eq { display: none; align-items: flex-end; gap: 2px; height: 10px; }
.nl-eq i { width: 2px; background: var(--brand); animation: nl-eq 0.9s ease-in-out infinite; }
.nl-eq i:nth-child(2) { animation-delay: 0.2s; } .nl-eq i:nth-child(3) { animation-delay: 0.4s; } .nl-eq i:nth-child(4) { animation-delay: 0.1s; }
.nl-player.is-playing .nl-eq { display: inline-flex; }
/* the track plays in the site's dock (TubeDock in focus/focus.js), which sits in this screen while the page is in view */
.nl-player.is-docked.is-dock-playing .nl-eq { display: inline-flex; }
@keyframes nl-eq { 0%, 100% { height: 3px; } 50% { height: 10px; } }
.nl-player-title { font-size: 16.5px; font-weight: 700; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nl-player-sub { display: flex; gap: 10px; font-size: 13.5px; color: var(--ink-3); }
.nl-player-ctrl { display: flex; gap: 8px; flex-shrink: 0; }
.nl-player-ctrl button { width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: grid; place-items: center; color: var(--ink);
  background: var(--surface-2); border: 1px solid var(--line); transition: border-color 0.2s ease, color 0.2s ease; }
.nl-player-ctrl button:hover { color: var(--brand); border-color: color-mix(in srgb, var(--brand) 55%, transparent); }
.nl-tracks { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.nl-tracks button { width: 100%; display: flex; align-items: center; gap: 12px; padding: 8px 12px 8px 8px; border-radius: 18px; cursor: pointer; text-align: left;
  font: inherit; color: inherit; background: transparent; border: 1px solid transparent; transition: background 0.2s ease, border-color 0.2s ease; }
.nl-tracks button:hover { background: var(--surface); }
.nl-tracks button.is-current { background: var(--surface); border-color: var(--line); }
.nl-n { width: 24px; text-align: center; font-size: 13px; color: var(--ink-3); flex-shrink: 0; }
.nl-tthumb { position: relative; flex-shrink: 0; width: 80px; aspect-ratio: 16 / 9; overflow: hidden; border-radius: 10px; background: #000; }
.nl-tthumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.nl-tthumb span { position: absolute; inset: 0; display: grid; place-items: center; color: #fff; background: rgba(0, 0, 0, 0.35); opacity: 0; transition: opacity 0.2s ease; }
.nl-tracks button:hover .nl-tthumb span { opacity: 1; }
.nl-tmeta { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.nl-tmeta span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nl-tmeta span:first-child { font-size: 14.5px; font-weight: 600; color: var(--ink); }
.nl-tmeta span:last-child { font-size: 12.5px; color: var(--ink-3); }
.nl-tracks button.is-current .nl-tmeta span:first-child { color: var(--brand); }
.nl-ar { flex-shrink: 0; font-size: 13.5px; color: var(--ink-3); }
.nl-artist { margin-top: 26px; }
.nl-block { margin-top: 8px; }
.nl-block + .nl-block { margin-top: 26px; }
.nl-block-title { margin: 0 0 12px; font-size: 15px; font-weight: 700; letter-spacing: 0.02em; color: var(--ink-2); }
.nl-gap { margin-top: 36px; }
.nl-block .nl-artist-head { margin-bottom: 12px; }
/* the channel up on the stage leaves the cards below; the category filter cannot bring it back */
.nl-page .is-up { display: none !important; }
.nl-stage:focus:not(:focus-visible) { outline: none; }
.nl-feat { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 16px; align-items: start; padding: 14px; margin-bottom: 14px;
  border-radius: 24px; background: var(--surface); border: 1px solid var(--line); }
.nl-vids { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.nl-vid p { margin: 8px 2px 0; font-size: 13px; font-weight: 600; line-height: 1.4; color: var(--ink);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.nl-vid-screen { position: relative; overflow: hidden; aspect-ratio: 16 / 9; border-radius: 14px; background: #000; }
.nl-vid-screen img, .nl-vid-screen iframe { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border: 0; }
.nl-page .nl-play.nl-play-sm { width: 44px; height: 44px; }
.nl-ch { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 18px; text-decoration: none; color: var(--ink-3);
  background: var(--surface); border: 1px solid var(--line); transition: border-color 0.2s ease, transform 0.2s ease; }
a.nl-ch:hover { border-color: color-mix(in srgb, var(--brand) 50%, transparent); transform: translateY(-2px); }
.nl-ch img { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.nl-ch-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.nl-ch-meta b { font-size: 14.5px; font-weight: 700; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nl-ch-meta small { font-size: 12px; color: var(--ink-3); }
.nl-ch-meta span { font-size: 12.5px; line-height: 1.4; color: var(--ink-2); }
.nl-ch-big { flex-direction: column; align-items: flex-start; height: 100%; padding: 6px; border: 0; background: transparent; }
a.nl-ch-big:hover { transform: none; }
.nl-ch-big img { width: 56px; height: 56px; }
.nl-ch-big .nl-ch-meta b { font-size: 17px; white-space: normal; }
.nl-ch-big .nl-ch-meta span { font-size: 13.5px; margin-top: 6px; }
.nl-ch-visit { margin-top: auto; font-size: 13px; padding: 7px 12px; }
.nl-ch-visit svg { color: #ef233c; }
.nl-learn { margin-top: 44px !important; }
.nl-more-head { margin-top: 48px; margin-bottom: 6px; }
.nl-learn-head.nl-more-head h3 { margin: 0; font-size: 19px; font-weight: 700; color: var(--ink); }
.nl-learn-head.nl-more-head p { margin: 3px 0 0; font-size: 13.5px; color: var(--ink-3); }
.nl-block.nl-cat { margin-top: 22px; }
.nl-cat-label { display: flex; align-items: center; gap: 8px; margin: 0 0 10px; font-size: 12.5px; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--ink-2); }
.nl-cat-label b { font-size: 11.5px; font-weight: 700; letter-spacing: 0; padding: 1px 8px; border-radius: 999px; color: var(--ink-3);
  background: var(--surface-2); border: 1px solid var(--line); }

.nl-learn-head { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
.nl-learn-head h3 { margin: 0; font-size: 19px; font-weight: 700; color: var(--ink); }
.nl-learn-head p { margin: 3px 0 0; font-size: 13.5px; color: var(--ink-3); }
.nl-shelf { padding: 16px; border-radius: 22px; background: var(--surface); border: 1px solid var(--line); }
.nl-shelf + .nl-shelf { margin-top: 14px; }
.nl-shelf-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.nl-shelf-head img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.nl-shelf-id { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.nl-shelf-id b { font-size: 15.5px; font-weight: 700; color: var(--ink); }
.nl-shelf-id span { font-size: 13px; line-height: 1.45; color: var(--ink-3); }
.nl-shelf-visit { flex-shrink: 0; margin-left: auto; display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 12px;
  font-size: 13px; font-weight: 600; color: var(--ink); text-decoration: none; background: var(--surface-2); border: 1px solid var(--line); transition: border-color 0.2s ease, color 0.2s ease; }
.nl-shelf-visit svg { color: #ef233c; }
.nl-shelf-visit:hover { color: var(--brand); border-color: color-mix(in srgb, var(--brand) 55%, transparent); }
.nl-shelf-row { position: relative; display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x proximity; scrollbar-width: none; scroll-behavior: smooth; }
.nl-shelf-row::-webkit-scrollbar { display: none; }
.nl-shelf-row .nl-vid { flex: 0 0 190px; scroll-snap-align: start; }
.nl-shelf-row .nl-vid p { font-size: 12.5px; }
.nl-shelf-row.fade-r { -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 48px), transparent); mask-image: linear-gradient(to right, #000 calc(100% - 48px), transparent); }
.nl-shelf-row.fade-l { -webkit-mask-image: linear-gradient(to right, transparent, #000 48px); mask-image: linear-gradient(to right, transparent, #000 48px); }
.nl-shelf-row.fade-l.fade-r { -webkit-mask-image: linear-gradient(to right, transparent, #000 48px, #000 calc(100% - 48px), transparent); mask-image: linear-gradient(to right, transparent, #000 48px, #000 calc(100% - 48px), transparent); }
@media (max-width: 767px) {
  .nl-shelf { padding: 14px; }
  .nl-shelf-id span { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .nl-shelf-visit { padding: 7px 9px; }
  .nl-shelf-visit span { display: none; }
  .nl-shelf-row .nl-vid { flex-basis: 62%; }
}
.nl-ch-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.nl-ch-strip { margin-top: 16px; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
.nl-ch-strip .nl-ch-meta span { display: none; }
@media (max-width: 767px) {
  .nl-feat { grid-template-columns: 1fr; }
  .nl-ch-big { flex-direction: row; flex-wrap: wrap; align-items: center; }
  .nl-ch-big .nl-ch-meta { flex-basis: calc(100% - 70px); }
  .nl-ch-visit { margin-top: 4px; }
  .nl-vids { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; }
  .nl-vids::-webkit-scrollbar { display: none; }
  .nl-vid { flex: 0 0 78%; scroll-snap-align: start; }
  .nl-ch-grid { grid-template-columns: 1fr; }
}
.nl-artist-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 8px; }
.nl-artist-head h3 { display: flex; align-items: center; gap: 10px; margin: 0; font-size: 16px; font-weight: 700; color: var(--ink); }
.nl-artist-head h3 img { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
.nl-artist-head h3 span { font-size: 13px; font-weight: 500; color: var(--ink-3); }
.nl-artist-head a { display: inline-flex; align-items: center; gap: 6px; font-size: 13.5px; font-weight: 600; color: var(--ink-2); text-decoration: none; }
.nl-artist-head a:hover { color: var(--brand); }

@media (max-width: 767px) {
  .nl-page { gap: 40px; }
  .nl-hero { padding: 20px; border-radius: 22px; }
  .nl-hero-title { font-size: 28px; }
  .nl-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .nl-grid, .nl-ext-list { grid-template-columns: 1fr; }
  .nl-feature, .nl-ext-feature { grid-template-columns: 1fr; padding: 8px 8px 18px; gap: 14px; }
  .nl-feature-body, .nl-ext-feature-body { padding: 0 10px; }
  .nl-feature-body h3 { font-size: 21px; }
  .nl-head { flex-wrap: wrap; }
  .nl-head-text { flex: 1; min-width: 0; }
  .nl-ar { display: none; }
}
/* ================= button system: one primary and one secondary style, theme-aware ================= */
html body :is(.mobile-contact-btn, .btn.btn-primary, .nl-cta, .r-cta-btn, .lib-cta):not(#_btn) {
  display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important;
  padding: 10px 20px !important; border-radius: 999px !important; border: 1px solid transparent !important;
  font-weight: 700 !important; font-size: 14px !important; letter-spacing: 0.01em !important; text-transform: none !important; text-decoration: none !important;
  color: var(--accent-active-color, #0b1120) !important;
  background: linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0) 55%), var(--gradient-accent, var(--accent-1)) !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.45), 0 6px 18px -6px var(--accent-glow, rgba(0,0,0,0.35)) !important;
  transition: transform .2s cubic-bezier(.16,1,.3,1), box-shadow .2s ease, filter .2s ease !important;
}
html body :is(.mobile-contact-btn, .btn.btn-primary, .nl-cta, .r-cta-btn, .lib-cta):not(#_btn):hover {
  transform: translateY(-2px) !important; filter: brightness(1.06) !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), 0 12px 26px -8px var(--accent-glow, rgba(0,0,0,0.4)) !important;
}
html body :is(.mobile-contact-btn, .btn.btn-primary, .nl-cta, .r-cta-btn, .lib-cta):not(#_btn) * { color: inherit !important; }
html body :is(.mobile-contact-btn, .btn.btn-primary, .nl-cta, .r-cta-btn, .lib-cta):not(#_btn) svg { stroke: currentColor !important; }
html body :is(.btn-rail-top, .btn.btn-secondary, .btn.secondary-btn, .nl-more, .nl-shelf-visit, .nl-ghost, .f-btn):not(#_btn) {
  display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important;
  border-radius: 999px !important; border: 1px solid transparent !important;
  font-weight: 600 !important; text-transform: none !important; letter-spacing: 0.01em !important; text-decoration: none !important;
  color: var(--text-primary, inherit) !important;
  background:
    linear-gradient(color-mix(in srgb, var(--bg-color, #0b1120) 82%, transparent), color-mix(in srgb, var(--bg-color, #0b1120) 82%, transparent)) padding-box,
    linear-gradient(135deg, color-mix(in srgb, var(--accent-1) 75%, transparent), color-mix(in srgb, var(--accent-1) 12%, transparent) 55%, color-mix(in srgb, var(--accent-2, var(--accent-1)) 55%, transparent)) border-box !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08) !important;
  -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
  transition: transform .2s cubic-bezier(.16,1,.3,1), box-shadow .2s ease, color .2s ease !important;
}
html body :is(.btn.btn-secondary, .btn.secondary-btn, .nl-more):not(#_btn) { padding: 10px 20px !important; font-size: 14px !important; }
html body :is(.btn-rail-top, .nl-shelf-visit, .nl-ghost, .f-btn):not(#_btn) { padding: 7px 14px !important; font-size: 13px !important; }
html body :is(.btn-rail-top, .btn.btn-secondary, .btn.secondary-btn, .nl-more, .nl-shelf-visit, .nl-ghost, .f-btn):not(#_btn):hover {
  transform: translateY(-1px) !important; color: var(--accent-1) !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 0 0 3px color-mix(in srgb, var(--accent-1) 14%, transparent), 0 8px 20px -10px var(--accent-glow, rgba(0,0,0,0.4)) !important;
}
html body :is(.mobile-contact-btn, .btn, .nl-cta, .r-cta-btn, .lib-cta, .btn-rail-top, .nl-more, .nl-shelf-visit, .nl-ghost, .f-btn):not(#_btn):active { transform: scale(0.97) !important; }
html body :is(.mobile-contact-btn, .btn, .nl-cta, .r-cta-btn, .btn-rail-top, .nl-more, .nl-shelf-visit, .nl-ghost, .f-btn):not(#_btn):focus-visible {
  outline: 2px solid var(--accent-1) !important; outline-offset: 3px !important;
}
/* ================= bottom tab bar: 64px glass bar, sliding pill, muted inactive tabs ================= */
@media (max-width: 1023px) {
  html body .bottom-nav:not(#_bn) {
    height: calc(64px + env(safe-area-inset-bottom)) !important; padding: 0 6px env(safe-area-inset-bottom) !important; box-sizing: border-box !important;
    align-items: center !important; border-radius: 0 !important;
    background: color-mix(in srgb, var(--bg-color, #0b1120) 80%, transparent) !important;
    -webkit-backdrop-filter: blur(18px) saturate(160%) !important; backdrop-filter: blur(18px) saturate(160%) !important;
    border-top: 1px solid color-mix(in srgb, var(--text-primary, #fff) 9%, transparent) !important; box-shadow: none !important;
  }
  html body .bottom-nav:not(#_bn) a {
    position: relative; z-index: 1; height: 56px !important; min-width: 44px; gap: 4px !important; padding: 0 !important; background: transparent !important;
    font-size: 11px !important; font-weight: 500 !important; letter-spacing: 0.01em;
    color: color-mix(in srgb, var(--text-primary, #fff) 72%, transparent) !important; transition: color .2s ease, transform .15s ease !important;
  }
  html body .bottom-nav:not(#_bn) a svg { width: 24px !important; height: 24px !important; padding: 0 !important; background: none !important; box-sizing: content-box !important; }
  html body .bottom-nav:not(#_bn) a.is-pending { color: var(--accent-1) !important; }
  html body .bottom-nav:not(#_bn) a[aria-current="page"] { color: var(--accent-1) !important; font-weight: 700 !important; background: transparent !important; }
  html body .bottom-nav:not(#_bn) a[aria-current="page"] svg { background: none !important; }
  html body .bottom-nav:not(#_bn) a:active { transform: scale(0.92) !important; }
  .bottom-nav .bn-pill { position: absolute; left: 0; top: 0; width: 56px; height: 32px; border-radius: 999px; pointer-events: none; opacity: 0;
    background: color-mix(in srgb, var(--accent-1) 18%, transparent); transition: transform .35s cubic-bezier(.16,1,.3,1), opacity .2s ease; }
  /* mint: the brand green is too light for text on the pale bar */
  [data-theme="mint"] body .bottom-nav:not(#_bn) a:is([aria-current="page"], .is-pending) { color: #047857 !important; }
}
/* tablets (768-1023px): same tab bar as phones, fixed to the bottom, with room reserved below the content */
/* (portrait-height only: phones held sideways already show the desktop menu) */
@media (min-width: 768px) and (max-width: 1023px) and (min-height: 600px) {
  html body .bottom-nav:not(#_bn) { display: flex !important; position: fixed !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
    z-index: 9990 !important; justify-content: space-around !important; }
  html body .bottom-nav:not(#_bn) a { flex: 0 1 120px !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; }
  html body:not(#_bn) { padding-bottom: calc(64px + env(safe-area-inset-bottom)) !important; }
  html body.drawer-open .bottom-nav:not(#_bn):not(#_bn2) { display: none !important; }
}
/* tab press feedback: no grey browser flash; ripple and a small icon squeeze, like a native tab bar */
@media (max-width: 1023px) {
  html body .bottom-nav:not(#_bn) a { -webkit-tap-highlight-color: transparent !important; -webkit-touch-callout: none; user-select: none; }
  html body .bottom-nav:not(#_bn) a:active { transform: none !important; }
  .bottom-nav .bn-ico { position: relative; display: grid; place-items: center; width: 56px; height: 32px; border-radius: 999px; overflow: hidden; isolation: isolate;
    transition: transform .18s cubic-bezier(.2,.8,.2,1); }
  .bottom-nav a.is-pressed .bn-ico { transform: scale(.88); }
  .bottom-nav .bn-ico svg { position: relative; z-index: 1; }
  .bottom-nav .bn-ripple { position: absolute; z-index: 0; border-radius: 50%; pointer-events: none;
    background: color-mix(in srgb, var(--accent-1) 30%, transparent); transform: scale(0); opacity: 1;
    animation: bn-ripple .5s cubic-bezier(.2,.8,.2,1) forwards; }
  @keyframes bn-ripple { to { transform: scale(1); opacity: 0; } }
  .bottom-nav .bn-label { line-height: 1.1; }
}
@media (prefers-reduced-motion: reduce) {
  .bottom-nav .bn-ico, .bottom-nav a.is-pressed .bn-ico { transition: none; transform: none; }
}
/* phones: featured channels as compact shelves (one-row header, swipeable videos with dots) */
.nl-dots { display: none; }
@media (max-width: 767px) {
  .nl-feat { display: block; padding: 14px; }
  .nl-feat .nl-ch-big { display: grid; grid-template-columns: 40px minmax(0, 1fr) auto; grid-template-areas: "img name visit" "img handle visit" "desc desc desc";
    column-gap: 12px; row-gap: 0; align-items: center; padding: 0 0 12px; height: auto; }
  .nl-feat .nl-ch-big img { grid-area: img; width: 40px; height: 40px; }
  .nl-feat .nl-ch-big .nl-ch-meta { display: contents; }
  .nl-feat .nl-ch-big .nl-ch-meta b { grid-area: name; font-size: 15.5px; align-self: end; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .nl-feat .nl-ch-big .nl-ch-meta small { grid-area: handle; align-self: start; }
  .nl-feat .nl-ch-big .nl-ch-meta span { grid-area: desc; margin-top: 8px; font-size: 13px; line-height: 1.45;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  html body .nl-feat .nl-ch-visit:not(#_btn) { grid-area: visit; margin: 0 !important; padding: 6px 11px !important; font-size: 0 !important; gap: 0 !important; }
  .nl-feat .nl-ch-visit svg { width: 15px; height: 15px; }
  .nl-feat .nl-ch-visit::after { content: "Visit"; font-size: 12.5px; font-weight: 600; margin-left: 5px; }
  .nl-feat .nl-vids { gap: 12px; scroll-snap-type: x mandatory; }
  .nl-feat .nl-vid { flex: 0 0 75%; }
  .nl-vids.fade-r { -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 40px), transparent); mask-image: linear-gradient(to right, #000 calc(100% - 40px), transparent); }
  .nl-vids.fade-l { -webkit-mask-image: linear-gradient(to right, transparent, #000 40px); mask-image: linear-gradient(to right, transparent, #000 40px); }
  .nl-vids.fade-l.fade-r { -webkit-mask-image: linear-gradient(to right, transparent, #000 40px, #000 calc(100% - 40px), transparent); mask-image: linear-gradient(to right, transparent, #000 40px, #000 calc(100% - 40px), transparent); }
  .nl-dots { display: flex; justify-content: center; gap: 6px; margin-top: 12px; }
  .nl-dots button { width: 6px; height: 6px; padding: 0; border: 0; border-radius: 999px; cursor: pointer;
    background: color-mix(in srgb, var(--ink) 22%, transparent); transition: width .25s ease, background .25s ease; }
  .nl-dots button.is-on { width: 18px; background: var(--brand); }
}
.chip-solid { background: var(--surface-2); color: var(--ink-2); padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; border: 1px solid var(--line); }

/* Floating Controls (Theme, Sound, WhatsApp) & AI Widget: the AI leaderboard tab shows on every page */

@media (max-width: 767px) {
  .nx .filters {
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 6px;
    gap: 8px;
    scrollbar-width: none;
  }
  .nx .filters::-webkit-scrollbar {
    display: none;
  }
}

/* Project Cards with Visual Image Covers & Matrix Halftone Dot Animation */
.nx .proj {
  display: flex;
  flex-direction: column;
  padding: 8px;
  border-radius: 28px;
  background: var(--surface);
  box-shadow: inset 0 0 0 1px var(--line);
  transition: transform .25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow .25s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  cursor: pointer;
}
.nx .proj-cover {
  position: relative;
  height: 195px;
  border-radius: 20px;
  overflow: hidden;
  background: #090e17;
  display: block;
  text-decoration: none;
  cursor: pointer;
}
.nx .proj-cover::after {
  display: none !important;
}
.nx .proj-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  transition: transform .5s cubic-bezier(0.16, 1, 0.3, 1), filter .4s ease;
  z-index: 1;
  filter: brightness(1);
}
.nx .proj-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(6, 11, 20, 0.5) 0%, rgba(6, 11, 20, 0.82) 100%);
  z-index: 2;
  pointer-events: none;
  opacity: 0;
  transition: opacity .4s ease;
}
.nx .proj-dots-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
  mix-blend-mode: screen;
  opacity: 0;
  transition: opacity .4s ease;
}
.nx .proj-cover .badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 4;
}
.nx .proj-center-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.86);
  z-index: 10;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 18px 8px 12px;
  border-radius: 9999px;
  background: rgba(8, 14, 26, 0.88);
  border: 1px solid rgba(var(--brand-rgb, 0, 242, 254), 0.5);
  box-shadow: 0 12px 30px -4px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 24px -2px rgba(var(--brand-rgb, 0, 242, 254), 0.35);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  color: #ffffff;
  text-decoration: none !important;
  pointer-events: none;
  opacity: 0;
  cursor: pointer;
  transition: opacity .18s cubic-bezier(0.16, 1, 0.3, 1), transform .18s cubic-bezier(0.16, 1, 0.3, 1), border-color .2s ease, box-shadow .2s ease, background .2s ease;
}
.nx .proj-center-btn .btn-ico {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(var(--brand-rgb, 0, 242, 254), 0.2);
  border: 1px solid rgba(var(--brand-rgb, 0, 242, 254), 0.45);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-1, #00f2fe);
  font-size: 11px;
  transition: transform .25s ease, background .25s ease, color .25s ease;
  flex-shrink: 0;
}
.nx .proj-center-btn .btn-text {
  font-size: 13px;
  font-weight: 600;
  color: #f8fafc;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

/* Universal Hover & Active Animation (Desktop Mouse + Mobile Touch & Tap) */
.nx .proj:hover,
.nx .proj:active,
.nx .proj:focus-within,
.nx .proj.is-active,
.nx .proj.is-touch-active {
  transform: translateY(-4px);
  box-shadow: inset 0 0 0 1px rgba(var(--brand-rgb, 0, 242, 254), .85), 0 20px 40px -20px rgba(var(--brand-rgb, 0, 242, 254), .5);
}
.nx .proj:hover .proj-img,
.nx .proj:active .proj-img,
.nx .proj:focus-within .proj-img,
.nx .proj.is-active .proj-img,
.nx .proj.is-touch-active .proj-img {
  transform: scale(1.05);
  filter: brightness(0.4);
}
.nx .proj:hover .proj-overlay,
.nx .proj:active .proj-overlay,
.nx .proj:focus-within .proj-overlay,
.nx .proj.is-active .proj-overlay,
.nx .proj.is-touch-active .proj-overlay {
  display: block !important;
  opacity: 1 !important;
  visibility: visible !important;
}
.nx .proj:hover .proj-dots-canvas,
.nx .proj:active .proj-dots-canvas,
.nx .proj:focus-within .proj-dots-canvas,
.nx .proj.is-active .proj-dots-canvas,
.nx .proj.is-touch-active .proj-dots-canvas {
  display: block !important;
  opacity: 1 !important;
  visibility: visible !important;
}
.nx .proj:hover .proj-center-btn,
.nx .proj:active .proj-center-btn,
.nx .proj:focus-within .proj-center-btn,
.nx .proj.is-active .proj-center-btn,
.nx .proj.is-touch-active .proj-center-btn {
  display: inline-flex !important;
  opacity: 1 !important;
  visibility: visible !important;
  pointer-events: auto !important;
  transform: translate(-50%, -50%) scale(1);
}
.nx .proj-center-btn:hover {
  background: rgba(10, 18, 34, 0.98) !important;
  border-color: rgba(var(--brand-rgb, 0, 242, 254), 0.9) !important;
  transform: translate(-50%, -50%) scale(1.08) !important;
  box-shadow: 0 16px 36px -4px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(var(--brand-rgb, 0, 242, 254), 0.8), 0 0 36px 4px rgba(var(--brand-rgb, 0, 242, 254), 0.6) !important;
}
.nx .proj-center-btn:hover .btn-ico {
  transform: translate(1px, -1px);
  background: rgba(var(--brand-rgb, 0, 242, 254), 0.45) !important;
  color: #ffffff;
}

/* AI Tools and Tech Stack Pills (Design Specified Soft Gradient Badges) */
.nx .pills {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  max-width: 640px;
}
.nx .pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 550;
  line-height: 1.2;
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
  user-select: none;
  background: var(--surface-2);
  box-shadow: inset 0 0 0 1px var(--line);
  color: var(--ink-1);
}
.nx .pill img,
.nx .pill svg,
.nx .pill i {
  width: 16px;
  height: 16px;
  object-fit: contain;
  flex-shrink: 0;
  display: block;
}
.nx .pill.ai {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  background: var(--surface-2);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c) 35%, var(--line)), 0 2px 8px -2px color-mix(in srgb, var(--c) 16%, transparent);
  color: var(--ink-1);
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, background 0.3s ease;
  animation: ai-pill-breathe 4.5s ease-in-out infinite alternate;
}
.nx .pill.ai:nth-child(1) { animation-delay: 0s; }
.nx .pill.ai:nth-child(2) { animation-delay: 0.8s; }
.nx .pill.ai:nth-child(3) { animation-delay: 1.6s; }
.nx .pill.ai:nth-child(4) { animation-delay: 2.4s; }
.nx .pill.ai:nth-child(5) { animation-delay: 3.2s; }

:is([data-theme="dark"], [data-theme="cyberpunk"], [data-theme="god-mode"]) .nx .pill.ai {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, color-mix(in srgb, var(--c) 16%, rgba(15, 23, 42, 0.78)) 100%);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c) 46%, transparent), 0 2px 10px -2px color-mix(in srgb, var(--c) 25%, transparent);
  color: #f8fafc;
}

:is([data-theme="light"], [data-theme="mint"], .light) .nx .pill.ai {
  background: var(--surface-2);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c) 35%, var(--line)), 0 2px 8px -2px color-mix(in srgb, var(--c) 16%, transparent);
  color: var(--ink-1);
}

/* Glass Shimmer Sheen Light Reflection */
.nx .pill.ai::after {
  content: '';
  position: absolute;
  top: 0;
  left: -130%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.32) 50%, transparent 100%);
  transform: skewX(-20deg);
  pointer-events: none;
  transition: left 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
  z-index: 1;
}
:is([data-theme="light"], [data-theme="mint"], .light) .nx .pill.ai::after {
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%);
}
.nx .pill.ai:hover::after {
  left: 170%;
}

/* Hover: Elevation, Brand Glow Aura & Expansion */
.nx .pill.ai:hover {
  transform: translateY(-2.5px) scale(1.04);
  box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--c) 80%, transparent),
              0 10px 24px -3px color-mix(in srgb, var(--c) 45%, transparent),
              0 0 18px 2px color-mix(in srgb, var(--c) 28%, transparent);
}
.nx .pill.ai:active {
  transform: translateY(0) scale(0.96);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c) 60%, transparent),
              0 2px 6px color-mix(in srgb, var(--c) 25%, transparent);
}

/* Icon Micro-Spring Interaction */
.nx .pill.ai img,
.nx .pill.ai svg {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  z-index: 2;
}
.nx .pill.ai:hover img,
.nx .pill.ai:hover svg {
  transform: scale(1.18) rotate(5deg);
}

/* Ambient Breathing Glow Keyframes */
@keyframes ai-pill-breathe {
  0% {
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c) 35%, var(--line)),
                0 2px 6px -2px color-mix(in srgb, var(--c) 16%, transparent);
  }
  100% {
    box-shadow: inset 0 0 0 1.2px color-mix(in srgb, var(--c) 55%, var(--line)),
                0 4px 12px 0px color-mix(in srgb, var(--c) 26%, transparent);
  }
}

/* Modern Profile Meta Widgets (Location, Works, Languages - Theme Adaptive) */
.meta-widgets {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 28px;
}
.meta-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: stretch;
}
@media (max-width: 768px) {
  .meta-grid-2 {
    grid-template-columns: 1fr;
  }
}

.widget-card {
  border-radius: 22px;
  padding: 22px 24px;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
}

/* 1. Location Card (Theme Adaptive Pastel Gradient) */
.widget-location {
  background: linear-gradient(120deg, 
    color-mix(in srgb, var(--brand) 4%, var(--surface)) 0%, 
    color-mix(in srgb, var(--brand) 12%, var(--surface)) 45%, 
    color-mix(in srgb, var(--brand) 22%, var(--surface)) 100%
  );
  border: 1px solid color-mix(in srgb, var(--brand) 28%, transparent);
  box-shadow: 0 8px 24px -6px color-mix(in srgb, var(--brand) 16%, transparent);
  color: var(--ink);
  transition: all .25s ease;
}
.widget-location:hover {
  border-color: color-mix(in srgb, var(--brand) 48%, transparent);
  box-shadow: 0 12px 28px -6px color-mix(in srgb, var(--brand) 26%, transparent);
}
.widget-location .location-ico {
  color: var(--brand);
}
.widget-location .widget-label {
  color: var(--ink-2);
  font-weight: 600;
  opacity: 1;
}
.widget-location .widget-title {
  color: var(--ink);
}
.widget-location .clock-time {
  color: var(--ink);
}
.widget-location .clock-tz {
  color: var(--ink-2);
}
.widget-location .daypart-svg {
  color: #f59e0b;
}
.widget-location .daypart-text {
  color: var(--ink-2);
  font-weight: 500;
}

.widget-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.widget-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--brand);
}
.widget-label {
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: .01em;
  color: var(--ink-2);
}

.widget-title {
  font-size: 21px;
  font-weight: 700;
  letter-spacing: -0.015em;
  margin: 0 0 12px;
  color: var(--ink);
}

.clock-display {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 6px;
}
.clock-time {
  font-size: 38px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--ink);
}
.clock-tz {
  font-size: 15px;
  font-weight: 600;
  color: var(--ink-2);
  margin-left: 2px;
}

.clock-daypart {
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ink-2);
  margin-top: auto;
  padding-top: 10px;
}
.daypart-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.daypart-svg {
  color: #f59e0b;
  width: 16px;
  height: 16px;
}
.daypart-text {
  color: var(--ink-2);
  font-weight: 500;
}

/* 2. Works Card */
.widget-works {
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.04);
}
[data-theme="dark"] .widget-works {
  box-shadow: 0 4px 24px -4px rgba(0, 0, 0, 0.35);
}
.widget-works .widget-title {
  color: var(--ink);
  margin-bottom: 6px;
}
.widget-desc {
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--ink-2);
  margin: 0 0 14px;
}
.works-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
}
.work-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8.5px;
  border-radius: 7px;
  font-size: 11.5px;
  font-weight: 500;
  background: var(--surface-2);
  border: 1px solid var(--line);
  color: var(--ink);
  text-decoration: none;
  white-space: nowrap;
  transition: all .18s ease;
}
.work-chip svg {
  color: #10b981;
  flex-shrink: 0;
}
.work-chip:hover {
  background: var(--surface-3, var(--surface-2));
  border-color: rgba(var(--brand-rgb), 0.45);
}
.work-chip-cv {
  background: rgba(var(--brand-rgb), 0.1);
  border-color: rgba(var(--brand-rgb), 0.3);
  color: var(--link);
  font-weight: 600;
}
.work-chip-cv:hover {
  background: rgba(var(--brand-rgb), 0.18);
  border-color: var(--brand);
}
.work-chip-cv svg {
  color: var(--link);
}

/* 3. Languages Card */
.widget-languages {
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.04);
}
[data-theme="dark"] .widget-languages {
  box-shadow: 0 4px 24px -4px rgba(0, 0, 0, 0.35);
}
.widget-languages .widget-head {
  margin-bottom: 20px;
}
.lang-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}
@media (max-width: 768px) {
  .lang-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
.lang-col {
  display: flex;
  flex-direction: column;
}
.lang-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.lang-name {
  font-size: 19px;
  font-weight: 700;
  margin: 0;
  color: var(--ink);
}
.lang-audio-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--ink-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: all .2s ease;
}
.lang-audio-btn:hover {
  background: rgba(var(--brand-rgb), 0.14);
  border-color: var(--brand);
  color: var(--link);
  transform: scale(1.08);
}
.lang-audio-btn.playing {
  animation: pulse-audio .6s ease infinite alternate;
  background: var(--brand);
  color: var(--on-brand, #ffffff);
  border-color: var(--brand);
}
@keyframes pulse-audio {
  from { transform: scale(1); }
  to { transform: scale(1.15); box-shadow: 0 0 12px rgba(var(--brand-rgb), 0.5); }
}

.lang-bars {
  display: flex;
  gap: 5px;
  margin-bottom: 12px;
}
.bar-seg {
  height: 6px;
  flex: 1;
  border-radius: 999px;
  background: var(--line);
  transition: background .3s;
}
.bar-seg.active {
  background: var(--brand);
}

.lang-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--ink);
  width: fit-content;
  margin-bottom: 10px;
}
.lang-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--brand);
}

.lang-legend { margin: 14px 0 0; font-size: 12px; color: var(--ink-3); }
.lang-sub {
  font-size: 13px;
  color: var(--ink-3);
  margin: 0;
  line-height: 1.4;
}

/* ==========================================================================
   Theme-Adaptive Emerald/Cyan/Rose/Matrix Aurora Glass & Spotlight
   Applied ONLY to the 4 Screenshot Cards:
   1. Location Card (.widget-location)
   2. Open to Work Card (.r-card-open)
   3. People Hero (.people-hero)
   4. Contact Heroes (.cta-hero, .svc-card.wide)
   ========================================================================== */

/* --- 1. DARK THEME (Default: Deep Midnight Navy & Electric Cyan / Blue) --- */
:root,
[data-theme="dark"],
:root[data-theme="dark"] {
  --color-brand-300: #38bdf8;
  --color-brand-400: #00f2fe;
  --cover-base-1: #071326;
  --cover-base-2: #0a1931;
  --cover-1: #00f2fe;
  --cover-2: #38bdf8;
  --cover-3: #2563eb;
  --cover-4: #0ea5e9;
  --cover-5: #818cf8;
  --cover-6: #06b6d4;
  --aurora-frost: rgba(7, 19, 38, 0.55);
  --aurora-border: linear-gradient(150deg, rgba(255, 255, 255, 0.28), color-mix(in srgb, #00f2fe 50%, transparent) 30%, transparent 55%, color-mix(in srgb, #2563eb 55%, transparent));
  --aurora-title: #ffffff;
  --aurora-label: #7dd3fc;
  --aurora-ico: #00f2fe;
  --aurora-tz: #94a3b8;
  --aurora-daypart: #cbd5e1;
}

/* --- 2. LIGHT THEME (Clean Royal Sapphire Blue & Ice Sky) --- */
[data-theme="light"],
:root[data-theme="light"] {
  --color-brand-300: #60a5fa;
  --color-brand-400: #2563eb;
  --cover-base-1: #eff6ff;
  --cover-base-2: #f0fdf4;
  --cover-1: #3b82f6;
  --cover-2: #60a5fa;
  --cover-3: #2563eb;
  --cover-4: #93c5fd;
  --cover-5: #a5f3fc;
  --cover-6: #1d4ed8;
  --aurora-frost: rgba(255, 255, 255, 0.65);
  --aurora-border: linear-gradient(150deg, rgba(255, 255, 255, 0.85), color-mix(in srgb, #2563eb 45%, transparent) 30%, transparent 55%, color-mix(in srgb, #38bdf8 45%, transparent));
  --aurora-title: #0f172a;
  --aurora-label: #1e40af;
  --aurora-ico: #2563eb;
  --aurora-tz: #475569;
  --aurora-daypart: #334155;
}

/* --- 3. CYBERPUNK THEME (Neon Rose Pink, Magenta & Cyber Gold) --- */
[data-theme="cyberpunk"],
:root[data-theme="cyberpunk"] {
  --color-brand-300: #fb7185;
  --color-brand-400: #f43f5e;
  --cover-base-1: #16060f;
  --cover-base-2: #120409;
  --cover-1: #f43f5e;
  --cover-2: #eab308;
  --cover-3: #ec4899;
  --cover-4: #fb7185;
  --cover-5: #f59e0b;
  --cover-6: #be123c;
  --aurora-frost: rgba(22, 6, 15, 0.55);
  --aurora-border: linear-gradient(150deg, rgba(255, 255, 255, 0.28), color-mix(in srgb, #f43f5e 50%, transparent) 30%, transparent 55%, color-mix(in srgb, #eab308 50%, transparent));
  --aurora-title: #fbbf24;
  --aurora-label: #fda4af;
  --aurora-ico: #f43f5e;
  --aurora-tz: #a1a1aa;
  --aurora-daypart: #dcbf86;
}

/* --- 4. MINT THEME (Nahian.bd Emerald & Pine Signature) --- */
[data-theme="mint"],
:root[data-theme="mint"] {
  --color-brand-300: #34d399;
  --color-brand-400: #10b981;
  --cover-base-1: #ecfdf5;
  --cover-base-2: #f0fdfa;
  --cover-1: #10b981;
  --cover-2: #34d399;
  --cover-3: #059669;
  --cover-4: #6ee7b7;
  --cover-5: #99f6e4;
  --cover-6: #047857;
  --aurora-frost: rgba(255, 255, 255, 0.65);
  --aurora-border: linear-gradient(150deg, rgba(255, 255, 255, 0.85), color-mix(in srgb, #10b981 45%, transparent) 30%, transparent 55%, color-mix(in srgb, #2dd4bf 45%, transparent));
  --aurora-title: #0f172a;
  --aurora-label: #047857;
  --aurora-ico: #059669;
  --aurora-tz: #475569;
  --aurora-daypart: #334155;
}

/* --- 5. GOD-MODE THEME (Matrix Phosphor Green & Pure Cyber Black) --- */
[data-theme="god-mode"],
:root[data-theme="god-mode"] {
  --color-brand-300: #4ade80;
  --color-brand-400: #00ff00;
  --cover-base-1: #020a02;
  --cover-base-2: #010601;
  --cover-1: #00ff00;
  --cover-2: #00cc00;
  --cover-3: #008800;
  --cover-4: #22c55e;
  --cover-5: #15803d;
  --cover-6: #16a34a;
  --aurora-frost: rgba(2, 10, 2, 0.58);
  --aurora-border: linear-gradient(150deg, rgba(255, 255, 255, 0.35), color-mix(in srgb, #00ff00 55%, transparent) 30%, transparent 55%, color-mix(in srgb, #008800 60%, transparent));
  --aurora-title: #00ff00;
  --aurora-label: #86efac;
  --aurora-ico: #00ff00;
  --aurora-tz: #00aa00;
  --aurora-daypart: #4ade80;
}

@property --halo-angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

@keyframes halo-spin {
  to {
    --halo-angle: 360deg;
  }
}

@keyframes cover-drift {
  0% {
    transform: translate(0) scale(1) rotate(0);
  }
  50% {
    transform: translate(12%, -10%) scale(1.15) rotate(20deg);
  }
  to {
    transform: translate(-10%, 8%) scale(.95) rotate(-15deg);
  }
}

/* Base Card Shell matching Nahian.bd */
.nx .widget-location,
.nx .r-card-open,
.nx .people-hero,
.nx .cta-hero,
.nx .svc-card.wide {
  position: relative !important;
  isolation: isolate !important;
  overflow: hidden !important;
  background: transparent !important;
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.3),
              inset 0 -1px 0 0 rgba(255, 255, 255, 0.05),
              0 18px 40px -24px rgba(0, 0, 0, 0.35) !important;
  transition: transform .28s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow .28s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.nx .widget-location { border-radius: 24px !important; }
.nx .r-card-open { border-radius: 22px !important; }
.nx .people-hero { border-radius: 28px !important; }
.nx .cta-hero { border-radius: 28px !important; }
.nx .svc-card.wide { border-radius: 24px !important; }

/* Hairline Glass Border with theme-adaptive light reflection */
.nx .widget-location::after,
.nx .r-card-open::after,
.nx .people-hero::after,
.nx .cta-hero::after,
.nx .svc-card.wide::after {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  border-radius: inherit !important;
  padding: 1px !important;
  background: var(--aurora-border) !important;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0) !important;
  -webkit-mask-composite: xor !important;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0) !important;
  mask-composite: exclude !important;
  pointer-events: none !important;
  z-index: 3 !important;
}

/* Ambient Edge Aura behind card */
.halo-glow {
  position: absolute !important;
  inset: 2px !important;
  z-index: 0 !important;
  border-radius: inherit !important;
  background: conic-gradient(
    from var(--halo-angle, 0deg),
    var(--color-brand-400),
    transparent 22%,
    var(--cover-3) 38%,
    transparent 55%,
    var(--cover-4) 72%,
    transparent 88%,
    var(--color-brand-400)
  ) !important;
  filter: blur(22px) !important;
  opacity: .25 !important;
  pointer-events: none !important;
  transition: opacity .4s ease !important;
  animation: 9s linear infinite halo-spin !important;
}

.nx .widget-location:hover .halo-glow,
.nx .r-card-open:hover .halo-glow,
.nx .people-hero:hover .halo-glow,
.nx .cta-hero:hover .halo-glow,
.nx .svc-card.wide:hover .halo-glow {
  opacity: .55 !important;
}

/* Aurora Cover Layer */
.cover {
  position: absolute !important;
  inset: 0 !important;
  z-index: 0 !important;
  border-radius: inherit !important;
  isolation: isolate !important;
  background: linear-gradient(120deg, var(--cover-base-1), var(--cover-base-2)) !important;
  overflow: hidden !important;
  pointer-events: none !important;
  opacity: .85 !important;
}

/* Drifting Aurora Blobs */
.cover-blob {
  aspect-ratio: 1 !important;
  background: radial-gradient(closest-side, var(--blob), transparent) !important;
  opacity: .75 !important;
  will-change: transform !important;
  width: 70% !important;
  animation: cover-drift var(--dur, 22s) ease-in-out infinite alternate !important;
  animation-delay: var(--delay, 0s) !important;
  border-radius: 9999px !important;
  position: absolute !important;
  pointer-events: none !important;
}

/* Frosted Glass Blur Overlay */
.cover-frost {
  position: absolute !important;
  inset: 0 !important;
  z-index: 1 !important;
  border-radius: inherit !important;
  background: var(--aurora-frost) !important;
  -webkit-backdrop-filter: blur(24px) saturate(1.5) !important;
  backdrop-filter: blur(24px) saturate(1.5) !important;
  pointer-events: none !important;
}

/* Cursor Tracking Spotlight */
.halo-spot {
  position: absolute !important;
  inset: 0 !important;
  z-index: 2 !important;
  border-radius: inherit !important;
  background: radial-gradient(
    26rem circle at var(--mx, 50%) var(--my, -20%),
    color-mix(in srgb, var(--color-brand-300) 24%, transparent),
    transparent 60%
  ) !important;
  opacity: 0 !important;
  pointer-events: none !important;
  transition: opacity .35s ease !important;
}

.nx .widget-location:hover .halo-spot,
.nx .r-card-open:hover .halo-spot,
.nx .people-hero:hover .halo-spot,
.nx .cta-hero:hover .halo-spot,
.nx .svc-card.wide:hover .halo-spot {
  opacity: 1 !important;
}

/* Foreground content stays crisp, vibrant & clickable */
.nx .widget-location > *:not(.halo-glow):not(.cover):not(.cover-frost):not(.halo-spot),
.nx .r-card-open > *:not(.halo-glow):not(.cover):not(.cover-frost):not(.halo-spot),
.nx .people-hero > *:not(.halo-glow):not(.cover):not(.cover-frost):not(.halo-spot),
.nx .cta-hero > *:not(.halo-glow):not(.cover):not(.cover-frost):not(.halo-spot),
.nx .svc-card.wide > *:not(.halo-glow):not(.cover):not(.cover-frost):not(.halo-spot) {
  position: relative !important;
  z-index: 4 !important;
}

/* Typography auto-updates with current theme */
.nx .widget-location .widget-title,
.nx .widget-location .clock-time {
  color: var(--aurora-title) !important;
}
.nx .widget-location .widget-label {
  color: var(--aurora-label) !important;
}
.nx .widget-location .location-ico {
  color: var(--aurora-ico) !important;
}
.nx .widget-location .clock-tz {
  color: var(--aurora-tz) !important;
}
.nx .widget-location .daypart-text {
  color: var(--aurora-daypart) !important;
}

.nx .r-card-open .r-card-title,
.nx .people-hero h2,
.nx .cta-hero h2,
.nx .svc-card.wide h3 {
  color: var(--aurora-title) !important;
}

.nx .r-card-open .r-status-label {
  color: var(--aurora-label) !important;
}

.nx .r-card-open .r-card-desc,
.nx .people-hero p,
.nx .cta-hero p,
.nx .svc-card.wide p {
  color: var(--aurora-daypart) !important;
}

/* CTA Buttons in Aurora Cards: Both Sidebar "Let's talk" (.r-card-open .r-cta-btn) and Contact Page "Let's talk" (.svc-card.wide .btn-primary) */
.nx .r-card-open .r-cta-btn,
.nx .svc-card.wide .btn-primary {
  background: color-mix(in srgb, var(--color-brand-400) 22%, var(--cover-base-1)) !important;
  color: var(--aurora-title) !important;
  border: 1px solid color-mix(in srgb, var(--color-brand-400) 45%, transparent) !important;
  box-shadow: 0 4px 14px -2px color-mix(in srgb, var(--color-brand-400) 25%, transparent) !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
}
.nx .r-card-open .r-cta-btn span,
.nx .svc-card.wide .btn-primary span {
  color: var(--aurora-title) !important;
  font-weight: 600 !important;
}
.nx .r-card-open .r-cta-btn svg,
.nx .svc-card.wide .btn-primary i,
.nx .svc-card.wide .btn-primary svg {
  color: var(--aurora-title) !important;
  stroke: var(--aurora-title) !important;
  transition: transform 0.2s ease !important;
}
.nx .r-card-open .r-cta-btn:hover,
.nx .svc-card.wide .btn-primary:hover {
  background: var(--color-brand-400) !important;
  color: var(--on-brand, #ffffff) !important;
  border-color: var(--color-brand-400) !important;
  box-shadow: 0 8px 22px -3px color-mix(in srgb, var(--color-brand-400) 50%, transparent) !important;
  transform: translateY(-1.5px) !important;
}
.nx .r-card-open .r-cta-btn:hover span,
.nx .svc-card.wide .btn-primary:hover span {
  color: var(--on-brand, #ffffff) !important;
}
.nx .r-card-open .r-cta-btn:hover svg,
.nx .svc-card.wide .btn-primary:hover i,
.nx .svc-card.wide .btn-primary:hover svg {
  color: var(--on-brand, #ffffff) !important;
  stroke: var(--on-brand, #ffffff) !important;
  transform: translateX(3px) !important;
}

/* Light Theme: Vibrant Royal Blue CTA Button with Crisp White Text (Standard Primary Button) */
:is([data-theme="light"], :root[data-theme="light"]) .nx .r-card-open .r-cta-btn,
:is([data-theme="light"], :root[data-theme="light"]) .nx .svc-card.wide .btn-primary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  box-shadow: 0 4px 14px -2px rgba(37, 99, 235, 0.42), 0 2px 6px -1px rgba(0, 0, 0, 0.08) !important;
}
:is([data-theme="light"], :root[data-theme="light"]) .nx .r-card-open .r-cta-btn span,
:is([data-theme="light"], :root[data-theme="light"]) .nx .svc-card.wide .btn-primary span {
  color: #ffffff !important;
  font-weight: 600 !important;
}
:is([data-theme="light"], :root[data-theme="light"]) .nx .r-card-open .r-cta-btn svg,
:is([data-theme="light"], :root[data-theme="light"]) .nx .svc-card.wide .btn-primary i,
:is([data-theme="light"], :root[data-theme="light"]) .nx .svc-card.wide .btn-primary svg {
  color: #ffffff !important;
  stroke: #ffffff !important;
}
:is([data-theme="light"], :root[data-theme="light"]) .nx .r-card-open .r-cta-btn:hover,
:is([data-theme="light"], :root[data-theme="light"]) .nx .svc-card.wide .btn-primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%) !important;
  box-shadow: 0 8px 22px -3px rgba(37, 99, 235, 0.58) !important;
  transform: translateY(-2px) !important;
}

/* Hover elevation */
.nx .widget-location:hover,
.nx .r-card-open:hover,
.nx .people-hero:hover,
.nx .cta-hero:hover,
.nx .svc-card.wide:hover {
  transform: translateY(-2px) !important;
}

/* About Bio Read More / Clamp Across Mobile, Tablet & Web */
.nx .about-bio-wrap {
  position: relative;
  margin-bottom: 24px;
}

.nx .about-prose {
  position: relative;
  max-height: 84px;
  overflow: hidden;
  transition: max-height 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.nx .about-prose::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 44px;
  background: linear-gradient(to bottom, transparent, var(--bg));
  pointer-events: none;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.nx .about-bio-wrap.is-expanded .about-prose {
  max-height: 1400px;
}

.nx .about-bio-wrap.is-expanded .about-prose::after {
  opacity: 0;
}

.nx .about-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 10px;
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 13.5px;
  font-weight: 600;
  font-family: inherit;
  color: var(--brand);
  background: color-mix(in srgb, var(--brand) 10%, var(--surface-2, transparent));
  border: 1px solid color-mix(in srgb, var(--brand) 28%, var(--line, transparent));
  cursor: pointer;
  box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.08);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.nx .about-toggle-btn:hover {
  background: var(--brand);
  color: var(--on-brand, #ffffff);
  border-color: var(--brand);
  transform: translateY(-1.5px);
  box-shadow: 0 4px 14px -2px rgba(var(--brand-rgb), 0.4);
}

.nx .about-toggle-btn .about-btn-icon {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  stroke: currentColor;
}

.nx .about-bio-wrap.is-expanded .about-toggle-btn .about-btn-icon {
  transform: rotate(180deg);
}

/* Light Theme Button Tuning */
:is([data-theme="light"], :root[data-theme="light"]) .nx .about-toggle-btn {
  background: #eff6ff !important;
  border-color: #bfdbfe !important;
  color: #2563eb !important;
}
:is([data-theme="light"], :root[data-theme="light"]) .nx .about-toggle-btn:hover {
  background: #2563eb !important;
  color: #ffffff !important;
  border-color: #2563eb !important;
}
/* ===== Profile hero: name, role, status, two actions, one row of tools ===== */
.nx .nx-hero .pill-status { margin-top: 14px; }
.nx .nx-hero .facts { margin-top: 12px; font-size: 15px; }
.nx .nx-hero .stack-rows { margin: 22px auto 0; max-width: 680px; }
.nx .nx-hero .stack-row { margin: 0; justify-content: center; gap: 8px; }
.nx .nx-hero button.pill { border: 0; font: inherit; font-size: 14px; font-weight: 500; color: var(--ink); cursor: pointer; position: relative;
  transition: transform .2s ease, box-shadow .2s ease, background .2s ease; }
.nx .nx-hero button.pill:hover { transform: translateY(-1px); }
.nx .nx-hero button.pill:not(.ai):hover { box-shadow: inset 0 0 0 1px rgba(var(--brand-rgb), .5); }
.nx .nx-hero button.pill:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
.nx .nx-hero .ask-chip.is-extra { display: none; }
.nx .nx-hero .stack-row.is-open .ask-chip.is-extra { display: inline-flex; animation: chipIn .3s ease both; }
@keyframes chipIn { from { opacity: 0; transform: scale(.9); } to { opacity: 1; transform: none; } }
/* "Ultra" chips: the soft brand-tinted pill, with a streak of brand light running round its edge */
@property --ultra-a { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
.nx .nx-hero .ask-chip.ultra {
  --soft: color-mix(in srgb, var(--c) 22%, transparent);
  color: var(--ink); font-weight: 600;
  border: 1.5px solid transparent;
  background:
    linear-gradient(color-mix(in srgb, var(--c) 10%, var(--bg, #fff)), color-mix(in srgb, var(--c) 10%, var(--bg, #fff))) padding-box,
    conic-gradient(from var(--ultra-a), var(--soft) 0deg, var(--soft) 200deg, var(--c) 270deg, color-mix(in srgb, var(--c) 55%, #fff) 300deg, var(--soft) 360deg) border-box;
  box-shadow: 0 2px 10px -4px color-mix(in srgb, var(--c) 55%, transparent);
  animation: ultraTurn 4.5s linear infinite;
}
.nx .nx-hero .ask-chip.ultra:nth-child(2) { animation-delay: -1.1s; }
.nx .nx-hero .ask-chip.ultra:nth-child(3) { animation-delay: -2.2s; }
.nx .nx-hero .ask-chip.ultra:nth-child(4) { animation-delay: -3.3s; }
.nx .nx-hero .ask-chip.ultra:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px -6px color-mix(in srgb, var(--c) 75%, transparent), 0 0 0 3px color-mix(in srgb, var(--c) 12%, transparent);
  animation-duration: 1.6s;
}
@keyframes ultraTurn { to { --ultra-a: 360deg; } }
:is([data-theme="dark"], [data-theme="cyberpunk"], [data-theme="god-mode"]) .nx .nx-hero .ask-chip.ultra {
  background:
    linear-gradient(color-mix(in srgb, var(--c) 16%, #0b1120), color-mix(in srgb, var(--c) 16%, #0b1120)) padding-box,
    conic-gradient(from var(--ultra-a), var(--soft) 0deg, var(--soft) 200deg, var(--c) 270deg, color-mix(in srgb, var(--c) 45%, #fff) 300deg, var(--soft) 360deg) border-box;
}
:is([data-theme="dark"], [data-theme="cyberpunk"], [data-theme="god-mode"]) .nx .nx-hero .ask-chip.ultra img[src*="ollama"] { filter: invert(1); }
@media (prefers-reduced-motion: reduce) { .nx .nx-hero .ask-chip.ultra { animation: none; } }
.nx .nx-hero .pill-more { color: var(--link) !important; font-weight: 600 !important; background: transparent !important; box-shadow: inset 0 0 0 1px var(--line) !important; }
/* where I use it: one floating tip shared by all chips (pointer devices) */
.hero-tip { position: fixed; z-index: 100000; max-width: 240px; padding: 7px 10px; border-radius: 10px; pointer-events: none;
  font: 500 12px/1.4 var(--font, inherit); text-align: center; color: var(--bg, #fff); background: var(--ink, #0f172a);
  box-shadow: 0 10px 24px -10px rgba(0,0,0,.45); opacity: 0; transform: translateY(4px); transition: opacity .16s ease, transform .16s ease; }
.hero-tip.is-on { opacity: 1; transform: none; }
.hero-tip-cue { display: block; margin-top: 3px; font-size: 11px; font-weight: 600; opacity: .7; }
@media (max-width: 640px) {
  .nx .nx-hero .facts { font-size: 13.5px; gap: 4px 12px; }
  .nx .nx-hero .facts li { text-align: center; }
  .nx .nx-hero .facts li:first-child svg { display: none; }
          .nx .nx-hero .stack-row { gap: 6px; }
}
@media (prefers-reduced-motion: reduce) { .nx .nx-hero .stack-row.is-open .ask-chip.is-extra { animation: none; } }

/* ===== Share button and panel (top bar) ===== */
.nx .share-wrap { position: relative; }
.nx .btn-share { width: 40px; height: 40px; border: 0; border-radius: 50%; display: grid; place-items: center; cursor: pointer; color: var(--link);
  background: var(--brand-soft); box-shadow: inset 0 0 0 1px rgba(var(--brand-rgb), .3); transition: transform .2s ease, box-shadow .2s ease; }
.nx .btn-share:hover, .nx .btn-share[aria-expanded="true"] { transform: translateY(-1px); box-shadow: inset 0 0 0 1px rgba(var(--brand-rgb), .6), 0 8px 18px -10px rgba(var(--brand-rgb), .8); }
.nx .btn-share:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
.share-panel { position: fixed; z-index: 100004; width: 300px; padding: 14px; border-radius: 18px;
  background: color-mix(in srgb, var(--bg) 94%, transparent); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  box-shadow: inset 0 0 0 1px var(--line), 0 24px 48px -20px rgba(0, 0, 0, .55); animation: shareIn .18s ease both; }
.share-panel[hidden] { display: none; }
@keyframes shareIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
body .share-title { margin: 0 0 10px; font-size: 13px; font-weight: 700; color: var(--ink); }
body .share-link { display: flex; align-items: center; gap: 8px; padding: 6px 6px 6px 10px; border-radius: 12px; background: var(--surface-2); box-shadow: inset 0 0 0 1px var(--line); }
body .share-link span { flex: 1; min-width: 0; font-size: 12.5px; color: var(--ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
body .share-copy { flex-shrink: 0; border: 0; border-radius: 9px; padding: 6px 10px; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; color: #fff; background: var(--accent-1, #2563eb); }
:is([data-theme="dark"], [data-theme="cyberpunk"], [data-theme="god-mode"]) body .share-copy { color: #04121a; }
body .share-copy.is-done { background: #10b981; }
body .share-nets { margin-top: 10px; display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; }
body .share-nets a { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 2px; border-radius: 12px; font-size: 11px; color: var(--ink-2); text-decoration: none; transition: background .2s ease, color .2s ease; }
body .share-nets a i, body .share-nets a svg { font-size: 18px; color: var(--text-primary); }
body .share-nets a:hover { background: var(--surface-2); color: var(--ink); }
.nx .sub-header-right, .nx .rail-top { display: flex; align-items: center; gap: 10px; }

/* status dot follows the theme in god-mode too */
html[data-theme="god-mode"] .nx .live-dot-core { background: #00ff00 !important; box-shadow: 0 0 8px #00ff00 !important; }
html[data-theme="god-mode"] .nx .live-dot-ping { background: #00ff00 !important; border-color: #00ff00 !important; }

/* no stray divider beside the content column now that the page background shows through */
html body .nx .main:not(#_m) { border-left: 0 !important; border-right: 0 !important; }

/* ===== Profile WORK tab ===== */
.nx .work2-summary { margin: -4px 0 12px; font-size: 14px; color: var(--ink-3); }
.nx .work2-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.nx .work2-chip { border: 0; cursor: pointer; padding: 6px 14px; border-radius: 999px; font: inherit; font-size: 13.5px; font-weight: 600;
  color: var(--ink-2); background: var(--surface-2); box-shadow: inset 0 0 0 1px var(--line); transition: background .2s ease, color .2s ease; }
.nx .work2-chip:hover { color: var(--ink); }
.nx .work2-chip[aria-pressed="true"] { color: #fff; background: var(--brand); box-shadow: none; }
.nx .work2-list { display: flex; flex-direction: column; gap: 12px; }
.nx .work2-row { display: flex; gap: 16px; padding: 14px; border-radius: 20px; background: var(--surface); box-shadow: inset 0 0 0 1px var(--line);
  transition: box-shadow .2s ease, transform .2s ease; }
.nx .work2-row[hidden] { display: none; }
.nx .work2-row:hover { transform: translateY(-2px); box-shadow: inset 0 0 0 1px rgba(var(--brand-rgb), .45), 0 14px 30px -20px rgba(var(--brand-rgb), .7); }
.nx .work2-thumb { flex-shrink: 0; width: 132px; height: 88px; object-fit: cover; object-position: top; border-radius: 12px; box-shadow: inset 0 0 0 1px var(--line); background: var(--surface-2); }
.nx .work2-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.nx .work2-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.nx .work2-top h3 { margin: 0; font-size: 16.5px; font-weight: 600; }
.nx .work2-status { display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600;
  --s: var(--link); color: var(--s); background: color-mix(in srgb, var(--s) 12%, transparent); }
.nx .work2-status i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.nx .work2-status.is-live { --s: #16a34a; }
.nx .work2-status.is-dev { --s: #d97706; }
.nx .work2-status.is-vol { --s: #db2777; }
:is([data-theme="dark"], [data-theme="cyberpunk"], [data-theme="god-mode"]) .nx .work2-status.is-live { --s: #4ade80; }
:is([data-theme="dark"], [data-theme="cyberpunk"], [data-theme="god-mode"]) .nx .work2-status.is-dev { --s: #fbbf24; }
:is([data-theme="dark"], [data-theme="cyberpunk"], [data-theme="god-mode"]) .nx .work2-status.is-vol { --s: #f472b6; }
.nx .work2-impact { margin: 0; color: var(--ink-2); font-size: 14.5px; line-height: 1.5; }
.nx .work2-foot { margin-top: auto; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
.nx .work2-acts { display: flex; gap: 6px; }
.nx .work2-btn { display: inline-flex; align-items: center; gap: 4px; padding: 5px 11px; border: 0; border-radius: 999px; cursor: pointer; font: inherit; font-size: 12.5px; font-weight: 600;
  text-decoration: none; color: var(--ink); background: var(--surface-2); box-shadow: inset 0 0 0 1px var(--line); transition: background .2s ease, color .2s ease; }
.nx .work2-btn:hover { color: var(--link); box-shadow: inset 0 0 0 1px rgba(var(--brand-rgb), .5); }
.nx .work2-btn.is-ai { color: var(--link); background: var(--brand-soft); box-shadow: inset 0 0 0 1px rgba(var(--brand-rgb), .3); }
@media (max-width: 640px) {
  .nx .work2-row { flex-direction: column; gap: 10px; }
  .nx .work2-thumb { width: 100%; height: 140px; }
  .nx .work2-top { flex-wrap: wrap; }
}

/* ===== Library cards: pointer glow and lift, matching the other cards ===== */
.nx :is(.nl-hero, .nl-feature, .nl-stat, .nl-card, .nl-bm, .nl-tile, .nl-ch) { position: relative; isolation: isolate; overflow: hidden;
  transition: transform .3s cubic-bezier(.16,1,.3,1), box-shadow .3s ease, border-color .3s ease; }
.nx :is(.nl-hero, .nl-feature, .nl-stat, .nl-card, .nl-bm, .nl-tile, .nl-ch)::after {
  content: ""; position: absolute; inset: 0; z-index: 3; pointer-events: none; border-radius: inherit; opacity: 0; transition: opacity .35s ease;
  background: radial-gradient(400px circle at var(--gx, 50%) var(--gy, 50%), color-mix(in srgb, var(--brand) 14%, transparent), transparent 65%);
}
/* a ring of light that slides along the border with the pointer */
.nx :is(.nl-hero, .nl-feature, .nl-stat, .nl-card, .nl-bm, .nl-tile, .nl-ch)::before {
  content: ""; position: absolute; inset: 0; z-index: 4; pointer-events: none; border-radius: inherit; padding: 1.5px; opacity: 0; transition: opacity .35s ease;
  background: radial-gradient(260px circle at var(--gx, 50%) var(--gy, 50%), color-mix(in srgb, var(--brand) 85%, transparent), color-mix(in srgb, var(--brand) 25%, transparent) 45%, transparent 75%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
}
.nx :is(.nl-hero, .nl-feature, .nl-stat, .nl-card, .nl-bm, .nl-tile, .nl-ch):hover::before { opacity: 1; }
.nx :is(.nl-hero, .nl-feature, .nl-stat, .nl-card, .nl-bm, .nl-tile, .nl-ch):hover::after { opacity: 1; }
.nx :is(.nl-hero, .nl-feature):hover { border-color: color-mix(in srgb, var(--brand) 55%, transparent) !important;
  box-shadow: 0 22px 46px -18px color-mix(in srgb, var(--brand) 55%, transparent) !important; }
.nx :is(.nl-stat, .nl-card, .nl-bm, .nl-tile, .nl-ch):hover { box-shadow: 0 16px 34px -16px color-mix(in srgb, var(--brand) 55%, transparent) !important; }
@media (hover: none) { .nx :is(.nl-hero, .nl-feature, .nl-stat, .nl-card, .nl-bm, .nl-tile, .nl-ch)::after, .nx :is(.nl-hero, .nl-feature, .nl-stat, .nl-card, .nl-bm, .nl-tile, .nl-ch)::before { display: none; } }

/* the slat pattern is painted at once, so the cover is never empty before the animation starts */
.nx .cover-banner-wrap {
  background-color: var(--slats-bg, var(--bg)) !important;
  background-image:
    linear-gradient(180deg, transparent 0 20px, var(--slats-bg, var(--bg)) 20px 23px),
    linear-gradient(90deg, color-mix(in srgb, var(--slats-color, var(--brand)) 26%, transparent) 0 8px, transparent 8px 11px) !important;
  background-size: 11px 23px, 11px 23px !important;
}
.nx [data-slats-canvas] { transition: opacity .2s ease !important; }

/* the bar above the right column: no slab of its own, just the two buttons resting on the page */
body.nx-page[data-page="profile"] .nx .rail-top {
  background: transparent !important; border-bottom: 0 !important;
  backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
  height: auto !important; padding: 12px 20px 6px !important; position: static !important;
}

/* profile cover: one simple layer — the slat animation on its own theme colour, no fade, no blending */
html body.nx-page[data-page="profile"] .nx .cover-banner-wrap { background: var(--bg) !important; }
html[data-theme="light"] body.nx-page .nx .cover-banner-wrap { background: #f8fafc !important; }
html[data-theme="mint"] body.nx-page .nx .cover-banner-wrap { background: #f4faf7 !important; }
html[data-theme="cyberpunk"] body.nx-page .nx .cover-banner-wrap { background: #09090b !important; }
html[data-theme="god-mode"] body.nx-page .nx .cover-banner-wrap { background: #000 !important; }
html body.nx-page[data-page="profile"] .nx .cover-banner-wrap .cover,
html body.nx-page[data-page="profile"] .nx .cover-banner-wrap .cover-gradient-vignette { display: none !important; }

/* Follow on GitHub lines up with the right-column cards on every page */
@media (min-width: 1024px) { .nx .sub-header-right { margin-right: -12px; } }

/* before the slat animation loads, the cover already shows a gradient in the theme's colours; the animation then fades in over it */
html body.nx-page .nx .cover-banner-wrap:not(#_cv) {
  background:
    radial-gradient(60% 120% at 18% 30%, color-mix(in srgb, var(--accent-1, var(--brand)) 55%, transparent), transparent 70%),
    radial-gradient(55% 120% at 82% 70%, color-mix(in srgb, var(--accent-2, var(--brand)) 50%, transparent), transparent 70%),
    radial-gradient(45% 100% at 50% 10%, rgba(var(--leak-3, 129, 140, 248), .35), transparent 70%),
    var(--bg) !important;
}
html body.nx-page .nx .cover-banner-wrap [data-slats-canvas] { transition: opacity .6s ease !important; }

/* About: fade the text itself instead of laying a block of page colour over it, so no shade shows on the aurora background */
.nx .about-prose::after { display: none !important; }
.nx .about-bio-wrap:not(.is-expanded) .about-prose {
  -webkit-mask-image: linear-gradient(to bottom, #000 45%, transparent 100%);
          mask-image: linear-gradient(to bottom, #000 45%, transparent 100%);
}

/* phones: tools sit in an even grid, at least three across, scaling with the screen */
@media (max-width: 640px) {
  .nx .nx-hero .stack-rows { width: 100%; max-width: 100%; box-sizing: border-box; padding: 0; }
  .nx .nx-hero .stack-row { display: flex !important; flex-wrap: wrap; justify-content: center; width: 100%; gap: 5px !important; --cols: 3; }
  .nx .nx-hero .stack-row > .pill { flex: 0 0 calc((100% - (var(--cols) - 1) * 5px) / var(--cols)); box-sizing: border-box; }
  .nx .nx-hero .stack-row .pill { justify-content: center; min-width: 0; padding: 5px 4px !important; font-size: clamp(10px, 3.15vw, 13px) !important; gap: 3px !important; letter-spacing: -.01em; }
  .nx .nx-hero .stack-row .pill > span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
  .nx .nx-hero .stack-row .pill img { width: 12px; height: 12px; flex-shrink: 0; }
}

@media (min-width: 480px) and (max-width: 640px) { .nx .nx-hero .stack-row { --cols: 4; } }

@media (max-width: 339px) {
  .nx .nx-hero .stack-rows { width: calc(100% + 16px); max-width: none; margin-left: -8px; margin-right: -8px; }
  .nx .nx-hero .stack-row .pill img { display: none; }
  .nx .nx-hero .stack-row .pill { padding: 5px 3px !important; font-size: 10px !important; letter-spacing: -.02em; }
}

/* an AI chip revealed by "+N" keeps its turning light after the reveal animation */
.nx .nx-hero .stack-row.is-open .ask-chip.ultra.is-extra { animation: chipIn .3s ease both, ultraTurn 4.5s linear infinite; }
@media (prefers-reduced-motion: reduce) { .nx .nx-hero .stack-row.is-open .ask-chip.ultra.is-extra { animation: none; } }

/* phones: the page title and the two buttons always stay on one line */
@media (max-width: 767px) {
  .nx .sub-header-shell { gap: 10px; }
  .nx .sub-header-left { min-width: 0; flex: 1 1 auto; }
  .nx .sub-header-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: clamp(16px, 5vw, 20px) !important; line-height: 1.2; }
  .nx .sub-header-right { flex: 0 0 auto; gap: 8px; margin-right: 0 !important; }
  .nx .sub-header-right .btn-share { width: 36px; height: 36px; }
  .nx .sub-header-right .btn-rail-top { white-space: nowrap; padding: 0 12px !important; height: 36px; gap: 7px; }
  .nx .sub-header-right .btn-rail-top .git-arr { display: none; }
}

/* phones: just enough space at the bottom to clear the tab bar (the footer is empty here) */
@media (max-width: 767px) {
  html body.nx-page .nx:not(#_pb) { padding-bottom: calc(64px + 20px + env(safe-area-inset-bottom)) !important; }
  html body.nx-page .nx .main:not(#_pb) { padding-bottom: 0 !important; }
  html body.nx-page footer:not(#_pb) { display: none !important; }
}

/* library hero: the Focus tile stands apart from the counts */
.nx .nl-stat.nl-stat-focus { border-color: color-mix(in srgb, var(--brand) 45%, transparent);
  background: radial-gradient(120% 140% at 100% 0%, color-mix(in srgb, var(--brand) 22%, var(--surface)) 0%, color-mix(in srgb, var(--surface) 80%, transparent) 70%); }
.nx .nl-stat-focus b { display: inline-flex; align-items: center; gap: 8px; }
.nx .fx-live { display: none; width: 8px; height: 8px; border-radius: 50%; background: var(--brand); box-shadow: 0 0 0 0 rgba(var(--brand-rgb), .6); animation: fx-live 1.6s ease-out infinite; }
html.fp-playing .nx .fx-live { display: inline-block; }
@keyframes fx-live { 70% { box-shadow: 0 0 0 8px rgba(var(--brand-rgb), 0); } 100% { box-shadow: 0 0 0 0 rgba(var(--brand-rgb), 0); } }

/* Focus page (library/focus): drives window.FocusPlayer from focus/focus.js. No right rail here, so the page takes the width */
.nx .pad.fx-page { max-width: 1120px; }
.nx .fx-page [hidden], .nx.fx-view[hidden], .nx.fx-view [hidden] { display: none !important; }
.nx .fx-page :where(button), .nx.fx-view :where(button) { font: inherit; }
.nx [data-tint="rain"] { --tint: #38bdf8; --a1: #38bdf8; --a2: #6366f1; --a3: #67e8f9; }
.nx [data-tint="nature"] { --tint: #34d399; --a1: #34d399; --a2: #bef264; --a3: #0d9488; }
.nx [data-tint="animals"] { --tint: #fbbf24; --a1: #fcd34d; --a2: #fb923c; --a3: #bef264; }
.nx [data-tint="places"] { --tint: #fb923c; --a1: #fdba74; --a2: #fb7185; --a3: #fde68a; }
.nx [data-tint="transport"] { --tint: #818cf8; --a1: #818cf8; --a2: #8b5cf6; --a3: #7dd3fc; }
.nx [data-tint="things"] { --tint: #a78bfa; --a1: #a78bfa; --a2: #e879f9; --a3: #fbcfe8; }
.nx [data-tint="city"] { --tint: #94a3b8; --a1: #3b82f6; --a2: #94a3b8; --a3: #fcd34d; }
.nx [data-tint="noise"] { --tint: #22d3ee; --a1: #67e8f9; --a2: #14b8a6; --a3: #a78bfa; }
:is([data-theme="light"], [data-theme="mint"]) .nx [data-tint="rain"] { --tint: #0284c7; }
:is([data-theme="light"], [data-theme="mint"]) .nx [data-tint="nature"] { --tint: #059669; }
:is([data-theme="light"], [data-theme="mint"]) .nx [data-tint="animals"] { --tint: #d97706; }
:is([data-theme="light"], [data-theme="mint"]) .nx [data-tint="places"] { --tint: #ea580c; }
:is([data-theme="light"], [data-theme="mint"]) .nx [data-tint="transport"] { --tint: #4f46e5; }
:is([data-theme="light"], [data-theme="mint"]) .nx [data-tint="things"] { --tint: #7c3aed; }
:is([data-theme="light"], [data-theme="mint"]) .nx [data-tint="city"] { --tint: #475569; }
:is([data-theme="light"], [data-theme="mint"]) .nx [data-tint="noise"] { --tint: #0891b2; }

/* scene photos cross-fade; the one on screen drifts slowly while something plays */
.nx .fx-scenes { position: absolute; inset: 0; z-index: -2; overflow: hidden; background: #0b1120; }
.nx .fx-scenes img { position: absolute; inset: 0; width: 100%; height: 100%; max-width: none; object-fit: cover; opacity: 0; transform: scale(1.04); transition: opacity .8s ease, transform 1.6s cubic-bezier(.2, .8, .2, 1); }
.nx .fx-scenes img.is-on { opacity: 1; transform: none; }
.nx .fx-page[data-live] .fx-stage .fx-scenes img.is-on, .nx.fx-view[data-live] .fx-scenes img.is-on { animation: fx-drift 48s ease-in-out infinite alternate; }
@keyframes fx-drift { to { transform: scale(1.09) translate(-1.5%, -1%); } }

/* the stage */
.nx .fx-stage { position: relative; isolation: isolate; overflow: hidden; min-height: 520px; display: flex; align-items: stretch; border-radius: 28px; color: #fff;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, .06), 0 30px 60px -32px rgba(0, 0, 0, .7); }
.nx .fx-stage::before { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: linear-gradient(90deg, rgba(3, 7, 18, .82) 0%, rgba(3, 7, 18, .5) 55%, rgba(3, 7, 18, .18) 100%), linear-gradient(0deg, rgba(3, 7, 18, .7) 0%, rgba(3, 7, 18, 0) 50%, rgba(3, 7, 18, .35) 100%); }
.nx .fx-stage-in { display: flex; flex-direction: column; width: 100%; padding: 56px 44px 30px; }
.nx .fx-state { font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: rgba(255, 255, 255, .78); text-shadow: 0 1px 3px rgba(0, 0, 0, .5); }
.nx .fx-title { margin-top: 10px; max-width: 620px; font-size: 58px; line-height: 1.05; font-weight: 800; letter-spacing: -.035em; color: #fff; text-shadow: 0 4px 26px rgba(0, 0, 0, .45); }
.nx .fx-title > span { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-wrap: balance; }
.nx .fx-quote { margin: 14px 0 auto; display: flex; align-items: flex-start; gap: 10px; max-width: 560px; min-height: 3em; font-size: 15.5px; line-height: 1.5; font-style: italic; color: rgba(255, 255, 255, .86); text-shadow: 0 1px 3px rgba(0, 0, 0, .5); }
.nx .fx-quote > i { margin-top: 5px; font-size: 11px; opacity: .7; }
.nx .fx-quote-next { flex-shrink: 0; width: 28px; height: 28px; margin-top: -2px; display: grid; place-items: center; border-radius: 50%; font-size: 12px; font-style: normal; color: rgba(255, 255, 255, .8); transition: background .2s ease, color .2s ease, transform .3s ease; }
.nx .fx-quote-next:hover { color: #fff; background: rgba(255, 255, 255, .16); transform: rotate(90deg); }
.nx .fx-ctrls { margin-top: 22px; display: flex; align-items: center; gap: 12px; }
.nx .fx-state { display: flex; align-items: center; gap: 8px; }
.nx .fx-page[data-live] .fx-state::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: #34d399; animation: fx-ping 1.8s ease-out infinite; }
@keyframes fx-ping { 0% { box-shadow: 0 0 0 0 rgba(52, 211, 153, .6); } 70%, 100% { box-shadow: 0 0 0 7px rgba(52, 211, 153, 0); } }
.nx .fx-about { margin-top: 8px; max-width: 560px; font-size: 15px; font-weight: 500; line-height: 1.45; color: rgba(255, 255, 255, .84); text-shadow: 0 1px 3px rgba(0, 0, 0, .5); }
.nx .fx-about:empty, .nx .fx-now-chips:empty { display: none; }
/* a station and a mix together: two chips like tabs, each with its own ✕; the lit one is what the big buttons control */
.nx .fx-layer { display: inline-flex; border-radius: 999px; }
.nx .fx-layer .fx-layer-pick { border-radius: 999px 0 0 999px; padding-right: 8px; }
.nx .fx-now-chip.fx-layer-x { width: 28px; padding: 0 2px 0 0; justify-content: center; border-radius: 0 999px 999px 0; margin-left: -1px; font-size: 10px; color: rgba(255, 255, 255, .65); }
.nx .fx-now-chip.fx-layer-x:hover { color: #fff; background: rgba(239, 68, 68, .6); }
.nx .fx-layer.is-on .fx-now-chip { color: #0b1120; background: #fff; box-shadow: none; }
.nx .fx-layer.is-on .fx-layer-x { color: rgba(11, 17, 32, .55); box-shadow: inset 1px 0 0 rgba(11, 17, 32, .12); }
.nx .fx-layer.is-on .fx-layer-x:hover { color: #fff; background: #ef4444; }
.nx .fx-layer.is-on .fx-layer-pick { cursor: default; }
.nx .fx-now-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.nx .fx-now-chip { display: inline-flex; align-items: center; gap: 6px; max-width: 100%; height: 30px; padding: 0 11px; border-radius: 999px; font-size: 12.5px; font-weight: 600;
  color: #fff; font-variant-numeric: tabular-nums; background: rgba(255, 255, 255, .14); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .22);
  -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); transition: background .2s ease; }
.nx .fx-now-chip span { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.nx .fx-now-chip i { font-size: 11px; opacity: .85; }
.nx .fx-now-chip:hover { background: rgba(255, 255, 255, .24); }
/* Quran radio: a random live reciter in one tap; once one plays, a round shuffle beside it picks another */
.nx .fx-now-chip.fx-qr { color: #0b1120; background: #fbbf24; box-shadow: 0 6px 16px -8px rgba(251, 191, 36, .8); }
.nx .fx-now-chip.fx-qr:hover { background: #fcd34d; }
.nx .fx-now-chip.fx-qr i { opacity: 1; }
.nx .fx-now-chip:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
/* the AI orb and the player bar take turns: wherever the bar would meet the orb (phones, tablets), the orb slides away;
   nor does the orb cover a stage button, it fades in place (no movement, so the check that hides it stays true) */
html.fx-orb-yields body #ai-chat-widget.chat-collapsed:not(#_ai):not(#_fx) { transform: translateY(160%) !important; opacity: 0 !important; pointer-events: none !important; }
html.fx-orb-away body #ai-chat-widget.chat-collapsed:not(#_ai):not(#_fx) { opacity: 0 !important; pointer-events: none !important; }
.nx .fx-stage-mix { margin-left: auto; display: flex; align-items: center; gap: 10px; }
.nx .fx-glass.fx-mixbtn { display: inline-flex; align-items: center; gap: 7px; width: auto; min-width: 44px; padding: 0 14px; border-radius: 999px; }
.nx .fx-mixbtn b { font-size: 13px; font-weight: 700; font-variant-numeric: tabular-nums; }
.nx .fx-mixbtn[aria-expanded="true"] { color: #0b1120; background: #fff; }
.nx .fx-more { display: none; }
.nx .fx-play { flex-shrink: 0; width: 68px; height: 68px; display: grid; place-items: center; border-radius: 50%; font-size: 22px; color: var(--on-brand); background: var(--grad); box-shadow: var(--shadow-btn); transition: transform .2s ease, box-shadow .2s ease; }
.nx .fx-play .fa-play { margin-left: 3px; }
.nx .fx-play:hover { transform: translateY(-1px) scale(1.04); }
.nx .fx-play:active { transform: scale(.95); }
.nx .fx-play.fx-play-sm { width: 48px; height: 48px; font-size: 16px; box-shadow: 0 0 0 3px rgba(var(--brand-rgb), .14), 0 8px 18px -8px rgba(var(--brand-rgb), .7); }
.nx .fx-glass { flex-shrink: 0; width: 44px; height: 44px; display: grid; place-items: center; border-radius: 50%; font-size: 15px; color: #fff; background: rgba(255, 255, 255, .14);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .24); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); transition: background .2s ease, transform .15s ease, box-shadow .2s ease; }
.nx .fx-glass:hover { background: rgba(255, 255, 255, .26); }
.nx .fx-glass:active { transform: scale(.94); }
.nx .fx-glass.fx-glass-lg { width: 64px; height: 64px; font-size: 20px; }
.nx .fx-glass.is-active { color: #0b1120; background: #fff; box-shadow: 0 0 16px rgba(255, 255, 255, .5); }

/* shortcuts popover */
/* keyboard shortcuts: a quiet "Shortcuts ›" at the end of the presets row that opens into one line; no keyboard, no shortcuts */
.nx .fx-keys { margin-left: auto; display: flex; align-items: center; gap: 12px; min-width: 0; }
.nx .fx-keys-btn { flex-shrink: 0; display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 8px; border-radius: 999px; font-size: 12px; font-weight: 600;
  color: rgba(255, 255, 255, .6); transition: color .2s ease, background .2s ease; }
.nx .fx-keys-btn:hover, .nx .fx-keys-btn[aria-expanded="true"] { color: #fff; background: rgba(255, 255, 255, .1); }
.nx .fx-keys-btn i { font-size: 11px; }
.nx .fx-keys-arr { font-size: 9px !important; transition: transform .25s ease; }
.nx .fx-keys-btn[aria-expanded="true"] .fx-keys-arr { transform: rotate(180deg); }
.nx .fx-keys-list { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 4px 11px; font-size: 11.5px; color: rgba(255, 255, 255, .72); animation: fx-keys-in .25s ease both; }
.nx .fx-keys-list[hidden] { display: none; }
.nx .fx-keys-list > span { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
.nx .fx-keys-list kbd { display: inline-grid; place-items: center; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 5px; font: 600 10.5px/1 var(--font, sans-serif);
  color: #fff; background: rgba(255, 255, 255, .14); box-shadow: inset 0 -1px 0 rgba(255, 255, 255, .2); }
@keyframes fx-keys-in { from { opacity: 0; transform: translateX(8px); } }
@media (hover: none) { .nx .fx-keys { display: none; } }

/* presets hover wrap & pill */
.nx .fx-presets-wrap { position: relative; margin-top: 22px; display: flex; flex-direction: column; align-items: flex-start; }
.nx .fx-presets-bar { align-self: stretch; display: flex; align-items: center; gap: 12px; }
.nx .fx-presets-pill {
  flex-shrink: 0; display: inline-flex; align-items: center; gap: 7px; height: 32px; padding: 0 13px; border-radius: 999px;
  font-size: 12.5px; font-weight: 600; color: #fff; background: rgba(255, 255, 255, .12);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .22); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
  cursor: pointer; transition: background .2s ease, box-shadow .2s ease, transform .15s ease;
  border: 0; outline: none;
}
.nx .fx-presets-pill:hover,
.nx .fx-presets-wrap.is-open .fx-presets-pill {
  background: rgba(255, 255, 255, .22);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .32), 0 8px 20px -6px rgba(0, 0, 0, .4);
}
.nx .fx-presets-pill:active { transform: scale(.96); }
.nx .fx-presets-pill i.fa-layer-group { font-size: 11px; color: var(--brand, #00f2fe); }
.nx .fx-presets-pill:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.nx .fx-presets-lbl { font-weight: 700; }
.nx .fx-presets-dot { opacity: .45; }
.nx .fx-presets-cur { font-weight: 500; opacity: .92; }
.nx .fx-presets-pill.is-plain :is(.fx-presets-dot, .fx-presets-cur) { display: none; }
.nx .fx-presets-arr { font-size: 10px; opacity: .75; margin-left: 2px; transition: transform .25s ease; }
.nx .fx-presets-wrap.is-open .fx-presets-arr {
  transform: rotate(180deg);
}

.nx .fx-presets-wrap .fx-chips {
  position: relative; margin-top: 0; display: flex; flex-wrap: wrap; gap: 6px;
  opacity: 0; max-height: 0; overflow: hidden; pointer-events: none; visibility: hidden;
  transform: translateY(-8px);
  transition: opacity .25s ease, max-height .35s cubic-bezier(.16, 1, .3, 1), transform .25s ease, margin .25s ease, visibility 0s linear .35s;
}
.nx .fx-presets-wrap.is-open .fx-chips {
  opacity: 1; max-height: 320px; overflow: visible; pointer-events: auto; visibility: visible;
  transform: translateY(0); margin-top: 12px; transition-delay: 0s;
}
.nx .fx-chip { position: relative; display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 11px; border-radius: 999px; font-size: 12px; font-weight: 600; white-space: nowrap;
  color: #fff; background: rgba(255, 255, 255, .12); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .22); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
  transition: background .2s ease, color .2s ease, transform .15s ease; }
.nx .fx-chip i { font-size: 10.5px; opacity: .85; }
.nx .fx-chip:hover { background: rgba(255, 255, 255, .24); }
.nx .fx-chip:active { transform: scale(.96); }
.nx .fx-chip[aria-pressed="true"] { color: #0b1120; background: #fff; box-shadow: 0 6px 16px -8px rgba(0, 0, 0, .6); }
.nx .fx-chip:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

/* the timer strip */
.nx .fx-timer { margin-top: 16px; display: flex; align-items: center; gap: 14px; padding: 10px 14px 10px 10px; border-radius: 24px; background: var(--surface); box-shadow: inset 0 0 0 1px var(--line); }
.nx .fx-clock { position: relative; flex-shrink: 0; width: 58px; height: 58px; display: grid; place-items: center; }
.nx .fx-clock svg { position: absolute; inset: 0; transform: rotate(-90deg); }
.nx .fx-clock circle { fill: none; stroke-width: 9; }
.nx .fx-ring-bg { stroke: var(--surface-3); }
.nx .fx-ring-fg { stroke: var(--brand); stroke-linecap: round; stroke-dasharray: 339.3; transition: stroke-dashoffset .9s linear; }
.nx .fx-tgo { position: relative; width: 38px; height: 38px; display: grid; place-items: center; border-radius: 50%; font-size: 13px; color: var(--ink); background: var(--surface-2); transition: background .2s ease, color .2s ease; }
.nx .fx-tgo .fa-play { margin-left: 2px; }
.nx .fx-tgo:hover, .nx .fx-timer.is-running .fx-tgo { color: var(--on-brand); background: var(--brand); }
.nx .fx-timer-text { min-width: 0; display: flex; flex-direction: column; }
.nx .fx-timer-text b { font-size: 26px; font-weight: 800; line-height: 1.1; letter-spacing: -.02em; color: var(--ink); font-variant-numeric: tabular-nums; }
.nx .fx-timer-text small { font-size: 12.5px; color: var(--ink-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nx .fx-phases { margin-left: auto; display: flex; gap: 4px; padding: 4px; border-radius: 999px; background: var(--surface-2); }
.nx .fx-phases button { padding: 7px 12px; border-radius: 999px; font-size: 12.5px; font-weight: 600; white-space: nowrap; color: var(--ink-2); transition: background .2s ease, color .2s ease; }
.nx .fx-phases button b { font-weight: 700; opacity: .72; }   /* .72 keeps the minutes at 4.5:1 on the lit pill */
.nx .fx-phases button:hover { color: var(--ink); }
.nx .fx-phases button[aria-pressed="true"] { color: var(--bg); background: var(--ink); }
.nx .fx-icon { flex-shrink: 0; width: 40px; height: 40px; display: grid; place-items: center; border-radius: 50%; font-size: 14px; color: var(--ink-2); background: var(--surface-2);
  box-shadow: inset 0 0 0 1px var(--line); transition: background .2s ease, color .2s ease, transform .15s ease; }
.nx .fx-icon:hover { color: var(--ink); background: var(--surface-3); }
.nx .fx-icon:active { transform: scale(.94); }
.nx .fx-icon.fx-ghost { color: var(--ink-3); background: transparent; box-shadow: none; }
.nx .fx-icon.fx-ghost:hover { color: var(--ink); background: var(--surface-2); }
.nx .fx-icon.is-done { color: var(--on-brand); background: var(--brand); box-shadow: none; }

/* volume: a pill that fills from the left */
.nx .fx-vol { --h: 30px; position: relative; isolation: isolate; overflow: hidden; height: var(--h); min-width: 64px; border-radius: 999px; cursor: pointer; touch-action: pan-y;
  -webkit-user-select: none; user-select: none; background: color-mix(in srgb, var(--surface-2) 80%, transparent); box-shadow: inset 0 0 0 1px var(--line-strong), inset 0 1px 2px rgba(0, 0, 0, .12); }
.nx .fx-vol.fx-vol-lg { --h: 44px; }
.nx .fx-vol-fill { position: absolute; inset: 0 auto 0 0; width: max(var(--fill, 50%), var(--h)); border-radius: inherit; background: var(--grad); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .35); transition: width .12s ease, background .3s ease; }
.nx .fx-vol[data-dragging] .fx-vol-fill { transition: none; }
.nx .fx-vol-ico { position: absolute; inset: 0; display: flex; align-items: center; padding-left: calc(var(--h) / 2 - 7px); font-size: 12px; color: var(--ink-3); pointer-events: none; }
.nx .fx-vol-on { color: var(--on-brand); clip-path: inset(0 calc(100% - max(var(--fill, 50%), var(--h))) 0 0); }
.nx .fx-vol.is-muted .fx-vol-ico i::before { content: "\\f6a9"; }
.nx .fx-vol:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
.nx .fx-tile:not(.is-on) .fx-vol-fill { background: color-mix(in srgb, var(--ink-3) 30%, transparent); box-shadow: none; }
.nx .fx-tile:not(.is-on) .fx-vol-on { color: var(--ink-2); }
.nx .fx-vol.fx-vol-dark { background: rgba(255, 255, 255, .14); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .26); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); }
.nx .fx-vol-dark .fx-vol-fill { background: rgba(255, 255, 255, .92); box-shadow: none; }
.nx .fx-vol-dark .fx-vol-ico { color: rgba(255, 255, 255, .85); }
.nx .fx-vol-dark .fx-vol-on { color: #0b1120; }
.nx .fx-vol-dark:focus-visible { outline-color: #fff; }

/* level bars, shown while a sound plays */
.nx .fx-eq { display: none; flex-shrink: 0; align-items: flex-end; gap: 2px; width: 14px; height: 12px; }
.nx .fx-eq i { flex: 1; height: 30%; border-radius: 1px; background: var(--brand); animation: fx-eq .9s ease-in-out infinite; }
.nx .fx-eq i:nth-child(2) { animation-delay: -.35s; }
.nx .fx-eq i:nth-child(3) { animation-delay: -.6s; }
.nx .fx-eq i:nth-child(4) { animation-delay: -.15s; }
@keyframes fx-eq { 0%, 100% { height: 25%; } 50% { height: 100%; } }
.nx .fx-tile.is-playing .fx-eq, .nx .fx-page[data-live] .fx-bar .fx-eq { display: inline-flex; }
@keyframes fx-spin { to { transform: rotate(360deg); } }

/* the sound board */
.nx .fx-tools { display: flex; align-items: center; gap: 12px; }
.nx .fx-rail { flex: 1; min-width: 0; display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; padding: 4px 2px; margin: -4px -2px;
  -webkit-mask-image: linear-gradient(90deg, #000 calc(100% - 36px), transparent); mask-image: linear-gradient(90deg, #000 calc(100% - 36px), transparent); }
.nx .fx-rail::-webkit-scrollbar { display: none; }
.nx .fx-cat { flex-shrink: 0; display: inline-flex; align-items: center; gap: 7px; height: 36px; padding: 0 13px; border-radius: 999px; font-size: 13px; font-weight: 600; white-space: nowrap;
  color: var(--ink); background: var(--surface); box-shadow: inset 0 0 0 1px var(--line); transition: background .2s ease, box-shadow .2s ease; }
.nx .fx-cat i { font-size: 12px; color: var(--tint); }
.nx .fx-cat b { font-weight: 600; color: var(--ink-3); font-variant-numeric: tabular-nums; }
.nx .fx-cat:hover { background: var(--surface-2); box-shadow: inset 0 0 0 1px var(--line-strong); }
.nx .fx-search { display: flex; align-items: center; gap: 10px; padding: 0 14px; border-radius: 14px; color: var(--ink-3); background: var(--surface); box-shadow: inset 0 0 0 1px var(--line); transition: box-shadow .2s ease; }
.nx .fx-search:focus-within { box-shadow: inset 0 0 0 2px var(--brand); }
.nx .fx-search input { flex: 1; min-width: 0; height: 40px; border: 0; outline: 0; font: inherit; font-size: 14px; color: var(--ink); background: transparent; }
.nx .fx-tools .fx-search { flex-shrink: 0; width: 210px; }
/* the add-a-stream row: the link field takes the width, the Play button sits beside it */
.nx .fx-paste { display: flex; align-items: center; gap: 10px; }
.nx .fx-paste .fx-search { flex: 1; min-width: 0; }
.nx .fx-paste .fx-btn { flex-shrink: 0; height: 40px; }
.nx .fx-groups { display: flex; flex-direction: column; gap: 28px; margin-top: 18px; }
.nx .fx-group { scroll-margin-top: 96px; }
.nx .fx-group h3 { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 15px; font-weight: 700; color: var(--ink); }
.nx .fx-group h3 i { font-size: 14px; color: var(--tint); }
.nx .fx-tiles { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.nx .fx-tile { position: relative; isolation: isolate; overflow: hidden; min-width: 0; padding: 11px; border-radius: 18px;
  background: color-mix(in srgb, var(--surface) 72%, transparent); box-shadow: inset 0 0 0 1px var(--line); transition: background .25s ease, box-shadow .25s ease; }
.nx .fx-tile::before { content: ""; position: absolute; inset: -30%; z-index: -1; pointer-events: none; opacity: .16; filter: blur(20px) saturate(1.15); transition: opacity .6s ease;
  background: radial-gradient(38% 42% at var(--x1) var(--y1), var(--a1), transparent 70%), radial-gradient(34% 40% at var(--x2) var(--y2), var(--a2), transparent 70%), radial-gradient(42% 36% at var(--x3) var(--y3), var(--a3), transparent 70%); }
.nx .fx-tile:hover::before { opacity: .3; }
.nx .fx-tile.is-on { background: var(--surface); box-shadow: inset 0 0 0 2px var(--brand), 0 12px 28px -16px rgba(var(--brand-rgb), .6); }
.nx .fx-tile.is-on::before { opacity: .5; animation: fx-glow 18s ease-in-out infinite alternate; }
@keyframes fx-glow { to { transform: translate(6%, -4%) rotate(8deg) scale(1.08); } }
.nx .fx-tile-btn { width: 100%; min-width: 0; display: flex; align-items: center; gap: 10px; text-align: left; color: var(--ink); }
.nx .fx-tile-ico { flex-shrink: 0; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 12px; font-size: 14px; color: var(--tint);
  background: color-mix(in srgb, var(--surface) 60%, transparent); box-shadow: inset 0 0 0 1px var(--line-strong); transition: background .2s ease, color .2s ease; }
.nx .fx-tile.is-on .fx-tile-ico { color: var(--on-brand); background: var(--brand); box-shadow: none; }
.nx .fx-tile.is-loading .fx-tile-ico i::before, .nx .fx-layers li.is-loading .fx-layer-ico i::before { content: "\\f110"; display: inline-block; animation: fx-spin 1s linear infinite; }
.nx .fx-tile-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.nx .fx-tile-text b { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 13.5px; font-weight: 650; line-height: 1.25; }
.nx .fx-tile-text small { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 11.5px; color: var(--ink-3); }
.nx .fx-tile .fx-vol { margin-top: 10px; }
.nx .fx-empty { margin-top: 18px; font-size: 14px; color: var(--ink-3); }

/* small notes under a field */
.nx .fx-msg { margin-top: -6px; font-size: 12.5px; color: var(--ink-3); }
.nx .fx-msg.is-err { color: #f87171; }

/* sounds and the Quran radio as tabs; on desktop the tab row stays in reach below the header while the sounds scroll by */
.nx .fx-lib { display: flex; flex-direction: column; gap: 18px; scroll-margin-top: calc(var(--fx-stick, 170px) + 4px); }
.nx .fx-libtabs-wrap { position: sticky; top: var(--fx-stick, 170px); z-index: 30; margin: -8px -10px 0; padding: 8px 10px;
  background: color-mix(in srgb, var(--bg) 86%, transparent); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); }
.nx .fx-libtabs { display: flex; gap: 4px; padding: 4px; border-radius: 18px; background: var(--surface); box-shadow: inset 0 0 0 1px var(--line); }
.nx .fx-libtab { position: relative; flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 44px; padding: 0 14px; border-radius: 14px;
  font-size: 14px; font-weight: 650; color: var(--ink-2); transition: background .2s ease, color .2s ease; }
.nx .fx-libtab svg { width: 16px; height: 16px; flex-shrink: 0; overflow: visible; }
.nx .fx-libtab > span { white-space: nowrap; }
.nx .fx-libtab b { font-size: 12.5px; font-weight: 600; color: var(--ink-3); font-variant-numeric: tabular-nums; }
.nx .fx-libtab:hover { color: var(--ink); background: var(--surface-2); }
.nx .fx-libtab:not([aria-selected="true"]) .fx-tab-ico { color: var(--link); }
.nx .fx-libtab[aria-selected="true"] { color: var(--on-brand); background: var(--grad); box-shadow: 0 0 0 3px rgba(var(--brand-rgb), .12), 0 8px 20px -10px rgba(var(--brand-rgb), .8); }
.nx .fx-libtab[aria-selected="true"] b { color: color-mix(in srgb, var(--on-brand) 70%, transparent); }
.nx .fx-libtab:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
/* a tab whose sound plays says so with its icon: the bars bounce, the radio's waves go out; still while paused */
.nx .fx-ico-bars line { transform-box: fill-box; transform-origin: center; }
.nx .fx-libtab.is-live .fx-ico-bars line { animation: fx-bar .9s ease-in-out infinite; }
.nx .fx-libtab.is-live .fx-ico-bars line:nth-child(2) { animation-delay: -.3s; }
.nx .fx-libtab.is-live .fx-ico-bars line:nth-child(3) { animation-delay: -.6s; }
.nx .fx-libtab.is-live .fx-ico-bars line:nth-child(4) { animation-delay: -.15s; }
.nx .fx-libtab.is-live .fx-ico-bars line:nth-child(5) { animation-delay: -.45s; }
@keyframes fx-bar { 0%, 100% { transform: scaleY(.45); } 50% { transform: scaleY(1); } }
.nx .fx-libtab.is-live .fx-ico-radio .fx-w1 { animation: fx-wave 1.6s ease-out infinite; }
.nx .fx-libtab.is-live .fx-ico-radio .fx-w2 { animation: fx-wave 1.6s ease-out .3s infinite; }
@keyframes fx-wave { 0%, 100% { opacity: .2; } 35% { opacity: 1; } }
.nx .fx-panel { display: flex; flex-direction: column; gap: 16px; animation: fx-fade .2s ease both; }
.nx .fx-panel[hidden] { display: none; }
.nx .fx-panel-lead { margin: 0 2px; font-size: 13.5px; color: var(--ink-3); }

/* the page ends on one quiet row: backup on the left, credits on the right */
.nx .fx-foot { margin-top: 4px; border-top: 1px solid var(--line); }
.nx .fx-foot-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 16px; padding: 14px 2px 0; }
.nx .fx-foot-backup { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 6px; font-size: 12.5px; color: var(--ink-3); }
.nx .fx-foot-backup > i { margin-right: 2px; }
.nx .fx-foot-backup label { cursor: pointer; }
.nx .fx-foot-backup label:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
.nx #fx-backup-msg { font-size: 12px; color: var(--link); }
.nx #fx-backup-msg.is-err { color: #f87171; }
.nx #fx-backup-msg:empty { display: none; }
.nx .fx-credits-arr { font-size: 10px; transition: transform .25s ease; }
.nx #fx-credits-btn[aria-expanded="true"] .fx-credits-arr { transform: rotate(180deg); }
.nx .fx-credits-body { margin-top: 10px; padding: 14px 16px; border-radius: 16px; background: var(--surface); box-shadow: inset 0 0 0 1px var(--line);
  display: flex; flex-direction: column; gap: 10px; font-size: 13px; line-height: 1.6; color: var(--ink-3); }
.nx .fx-credits-body[hidden] { display: none; }
.nx .fx-credits-body a { color: var(--link); }
.nx .fx-credits-body a:hover { text-decoration: underline; }
.nx .fx-credits-body ul { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2px 18px; }

/* the player bar, sticky at the bottom while there is a mix, and the mixer above it */
.nx .fx-dock { position: sticky; bottom: 18px; z-index: 40; width: 100%; max-width: 880px; margin: 36px auto 0; pointer-events: none; }
.nx .fx-bar { display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: 26px; pointer-events: none; opacity: 0; transform: translateY(16px);
  background: color-mix(in srgb, var(--surface) 86%, transparent); box-shadow: inset 0 0 0 1px var(--line-strong), 0 24px 50px -20px rgba(0, 0, 0, .6);
  -webkit-backdrop-filter: blur(18px) saturate(1.4); backdrop-filter: blur(18px) saturate(1.4); transition: opacity .3s ease, transform .3s ease; }
.nx .fx-page[data-mixed][data-bar] .fx-bar { pointer-events: auto; opacity: 1; transform: none; }
.nx .fx-thumb { position: relative; isolation: isolate; flex-shrink: 0; width: 52px; height: 52px; overflow: hidden; border-radius: 18px; box-shadow: inset 0 0 0 1px var(--line); }
.nx .fx-thumb-over { position: absolute; inset: 0; display: grid; place-items: center; font-size: 14px; color: #fff; background: rgba(0, 0, 0, .42); opacity: 0; transition: opacity .2s ease; }
.nx .fx-thumb:hover .fx-thumb-over, .nx .fx-thumb:focus-visible .fx-thumb-over { opacity: 1; }
.nx .fx-now { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 16px; text-align: left; transition: background .2s ease; }
.nx .fx-now:hover { background: var(--surface-2); }
.nx .fx-now-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.nx .fx-now-text b { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 15px; font-weight: 700; color: var(--ink); }
.nx .fx-now-text small { display: flex; align-items: center; gap: 6px; overflow: hidden; white-space: nowrap; font-size: 12px; color: var(--ink-3); font-variant-numeric: tabular-nums; }
.nx .fx-chev { font-size: 12px; color: var(--ink-3); transition: transform .25s ease; }
.nx .fx-bar.is-open .fx-chev { transform: rotate(180deg); }
.nx .fx-vol.fx-bar-vol { --h: 36px; flex-shrink: 0; width: 150px; }
.nx .fx-scrim { position: fixed; inset: 0; z-index: -1; pointer-events: auto; background: rgba(2, 6, 23, .42); -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px); animation: fx-fade .2s ease both; }
.nx .fx-mixer { position: absolute; left: 0; right: 0; bottom: calc(100% + 10px); max-height: min(420px, 55dvh); overflow-y: auto; overscroll-behavior: contain; padding: 12px; border-radius: 24px; pointer-events: auto;
  background: var(--surface); box-shadow: inset 0 0 0 1px var(--line-strong), 0 24px 64px -16px rgba(0, 0, 0, .6); transform-origin: bottom center; animation: fx-pop .22s cubic-bezier(.2, .9, .3, 1.1) both; }
@keyframes fx-pop { from { opacity: 0; transform: translateY(10px) scale(.97); } }
@keyframes fx-fade { from { opacity: 0; } }
.nx .fx-mixer-head { display: flex; align-items: center; gap: 2px; padding: 2px 2px 10px 6px; }
.nx .fx-mixer-head b { flex: 1; font-size: 14px; font-weight: 700; color: var(--ink); }
.nx .fx-text-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 999px; font-size: 13px; color: var(--ink-3); transition: background .2s ease, color .2s ease; }
.nx .fx-text-btn:hover { color: var(--ink); background: var(--surface-2); }
.nx .fx-text-btn.is-done { color: var(--link); }
.nx .fx-layers { display: flex; flex-direction: column; gap: 6px; }
.nx .fx-layers li { display: flex; align-items: center; gap: 10px; padding: 4px; border-radius: 14px; animation: fx-fade .2s ease both; }
.nx .fx-layer-ico { flex-shrink: 0; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 12px; font-size: 13px; color: var(--tint); background: var(--surface-2); box-shadow: inset 0 0 0 1px var(--line); }
.nx .fx-layer-name { flex-shrink: 0; width: 140px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 13.5px; font-weight: 600; color: var(--ink); }
.nx .fx-layers .fx-vol { flex: 1; }
.nx .fx-layers .fx-icon { width: 36px; height: 36px; }

/* the focus view: its own .nx root on <body>, so it covers the header and the floating buttons */
.nx.fx-view { position: fixed; inset: 0; z-index: 2147482000; isolation: isolate; display: flex; overflow: hidden; color: #fff; background: #000; animation: fx-fade .35s ease both; }
/* Ensure native cursor is ALWAYS clearly visible and clickable in focus view and fullscreen mode */
html.fx-view-on .cursor-dot,
html.fx-view-on .cursor-outline {
  display: none !important;
}
html.fx-view-on,
html.fx-view-on body,
html.fx-view-on body *,
html body .nx.fx-view,
html body .nx.fx-view *,
html body :fullscreen,
html body :fullscreen *,
html body :-webkit-full-screen,
html body :-webkit-full-screen * {
  cursor: default !important;
}
html body .nx.fx-view button,
html body .nx.fx-view a,
html body .nx.fx-view [role="button"],
html body .nx.fx-view .fx-vol,
html body .nx.fx-view .fx-glass,
html body .nx.fx-view input,
html body .nx.fx-view select,
html body :fullscreen button,
html body :fullscreen a,
html body :fullscreen [role="button"],
html body :fullscreen .fx-vol,
html body :fullscreen .fx-glass,
html body :fullscreen input,
html body :fullscreen select,
html body :-webkit-full-screen button,
html body :-webkit-full-screen a,
html body :-webkit-full-screen [role="button"],
html body :-webkit-full-screen .fx-vol,
html body :-webkit-full-screen .fx-glass,
html body :-webkit-full-screen input,
html body :-webkit-full-screen select {
  cursor: pointer !important;
}
/* every page .nx sits at z-index 1, see-through, with room for the header; the view must not */
html body .nx.fx-view:not(#_v) { position: fixed; z-index: 2147482000; margin: 0; padding: 0 !important; min-height: 0; background: #000 !important; }
.nx .fx-view-shade { position: absolute; inset: 0; z-index: 1; pointer-events: none; background: linear-gradient(0deg, rgba(0, 0, 0, .8) 0%, rgba(0, 0, 0, .22) 45%, rgba(0, 0, 0, .45) 100%); }
.nx .fx-view-in { position: relative; z-index: 2; flex: 1; min-width: 0; display: flex; flex-direction: column; padding: max(20px, env(safe-area-inset-top)) 32px max(22px, env(safe-area-inset-bottom)); }
.nx .fx-view-top { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 12px; }
.nx .fx-view-top > p { grid-column: 1; justify-self: start; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: rgba(255, 255, 255, .82); }
.nx.fx-view:focus { outline: none; }
.nx .fx-view-timer { grid-column: 2; white-space: nowrap; padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums;
  background: rgba(255, 255, 255, .12); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .2); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); }
.nx .fx-view-tools { grid-column: 3; justify-self: end; display: flex; gap: 8px; }
.nx .fx-view-mid { flex: 1; display: grid; place-items: center; padding: 32px 8px; }
.nx .fx-view-quote { max-width: 880px; text-align: center; text-wrap: balance; font-size: clamp(24px, 3.6vw, 42px); font-weight: 500; line-height: 1.25; letter-spacing: -.02em;
  color: rgba(255, 255, 255, .92); text-shadow: 0 4px 30px rgba(0, 0, 0, .55); transition: opacity 1s ease; }
.nx .fx-view-quote.is-fading { opacity: 0; }
.nx .fx-view-foot { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 20px; }
.nx .fx-view-name { min-width: 0; max-width: 100%; }
.nx .fx-view-name p { color: #fff; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: clamp(30px, 5vw, 56px); font-weight: 800; line-height: 1.08; letter-spacing: -.035em; text-shadow: 0 4px 24px rgba(0, 0, 0, .5); }
.nx .fx-view-name small { display: block; margin-top: 6px; font-size: 13px; color: rgba(255, 255, 255, .72); font-variant-numeric: tabular-nums; }
.nx .fx-view-ctrls { display: flex; align-items: center; gap: 12px; }
.nx .fx-view-ctrls .fx-vol { width: 200px; }
.nx .fx-view-credit { margin-top: 16px; font-size: 11.5px; color: rgba(255, 255, 255, .5); }
.nx .fx-view-credit a { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
.nx .fx-fades { transition: opacity .7s ease; }
.nx.fx-view[data-idle] .fx-fades { opacity: 0; }
html.fx-view-on, html.fx-view-on body { overflow: hidden !important; }
/* the site's round cursor stays visible over the focus view, and rests with the controls when the view goes idle */
html.fx-view-on body .cursor-dot, html.fx-view-on body .cursor-outline { z-index: 2147483647 !important; }
html.fx-view-on:has(.fx-view[data-idle]) body :is(.cursor-dot, .cursor-outline) { opacity: 0 !important; }

/* sleep timer, in the timer strip */
.nx .fx-sleep { display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 12px; border-radius: 999px; font-size: 13px; color: var(--ink-2);
  background: var(--surface-2); box-shadow: inset 0 0 0 1px var(--line); cursor: pointer; }
.nx .fx-sleep select { appearance: none; -webkit-appearance: none; border: 0; outline: 0; padding: 0; font: inherit; font-weight: 600; color: var(--ink); background: transparent; cursor: pointer; }
.nx .fx-sleep select option { color: #0b1120; }
.nx .fx-sleep:focus-within { box-shadow: inset 0 0 0 2px var(--brand); }
.nx .fx-sleep b { font-weight: 600; color: var(--link); font-variant-numeric: tabular-nums; }
.nx .fx-sleep b:empty { display: none; }
.nx .fx-timer.is-sleeping .fx-sleep { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--brand) 55%, transparent); }
.nx .fx-timer.is-sleeping .fx-sleep > i { color: var(--brand); }

/* radio */
.nx .fx-radio { display: flex; flex-direction: column; gap: 14px; }
.nx .fx-stations { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }      /* eight in sight: two full rows */
.nx .fx-stations li[hidden] { display: none; }
/* station cards take the theme's colours: the glow from its cover palette, the Bangla ones from its accent pair */
.nx [data-tint="quran"] { --tint: var(--link); --a1: var(--cov-1); --a2: var(--cov-2); --a3: var(--cov-3); }
.nx [data-tint="bn"] { --tint: var(--link); --a1: var(--pc-1); --a2: var(--cov-3); --a3: var(--pc-2); }
.nx .fx-station { position: relative; isolation: isolate; overflow: hidden; display: flex; align-items: center; gap: 10px; width: 100%; min-width: 0; min-height: 60px; padding: 11px;
  border-radius: 18px; text-align: left; color: var(--ink); background: color-mix(in srgb, var(--surface) 72%, transparent); box-shadow: inset 0 0 0 1px var(--line);
  transition: background .25s ease, box-shadow .25s ease, transform .15s ease; }
.nx .fx-station::before { content: ""; position: absolute; inset: -30%; z-index: -1; pointer-events: none; opacity: .18; filter: blur(20px) saturate(1.15); transition: opacity .6s ease;
  background: radial-gradient(38% 42% at var(--x1) var(--y1), var(--a1), transparent 70%), radial-gradient(34% 40% at var(--x2) var(--y2), var(--a2), transparent 70%), radial-gradient(42% 36% at var(--x3) var(--y3), var(--a3), transparent 70%); }
.nx .fx-station:hover::before { opacity: .34; }
.nx .fx-station:active { transform: scale(.98); }
.nx .fx-station:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
.nx .fx-station-ico { flex-shrink: 0; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 12px; font-size: 14px; color: var(--tint);
  background: color-mix(in srgb, var(--surface) 60%, transparent); box-shadow: inset 0 0 0 1px var(--line-strong); transition: background .2s ease, color .2s ease; }
.nx .fx-station-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.nx .fx-station-text b { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 13.5px; font-weight: 650; line-height: 1.25; }
.nx .fx-station-text small { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 11.5px; font-weight: 600; color: var(--tint); }
.nx .fx-station-text small:empty { display: none; }
.nx .fx-station.is-on { background: var(--surface); box-shadow: inset 0 0 0 2px var(--brand), 0 12px 28px -16px rgba(var(--brand-rgb), .6); }
.nx .fx-station.is-on::before { opacity: .55; animation: fx-glow 18s ease-in-out infinite alternate; }
.nx .fx-station.is-on .fx-station-ico { color: var(--on-brand); background: var(--brand); box-shadow: none; }
/* a face: round, the photo filling it; initials on the theme's gradient; playing adds a ring in the theme colour */
.nx .fx-station-ico.fx-face, .nx .fx-station-ico.fx-glyph { position: relative; border-radius: 50%; overflow: visible; }
.nx .fx-face img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; }
/* an emblem: the theme's gradient, a fine inner ring, the emblem in the colour that reads on it */
.nx .fx-station-ico.fx-glyph { --glyph-bg: var(--brand); font-size: 14px; color: var(--on-brand); background: var(--grad); box-shadow: inset 0 0 0 1.5px rgba(255, 255, 255, .28), 0 4px 10px -4px rgba(var(--brand-rgb), .7); }
.nx .fx-station.is-on .fx-station-ico.fx-face { background: none; box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--brand); }
.nx .fx-station.is-on .fx-station-ico.fx-glyph { box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--brand); }
.nx .fx-station.is-loading .fx-station-ico:is(.fx-face, .fx-glyph)::after { content: ""; position: absolute; inset: -4px; border-radius: 50%;
  border: 2px solid transparent; border-top-color: var(--brand); animation: fx-spin .9s linear infinite; }
.nx .fx-face-badge { position: absolute; right: -5px; bottom: -4px; padding: 0 3px; border-radius: 6px; font-size: 8.5px; font-weight: 700; line-height: 13px;
  color: var(--on-brand); background: var(--brand); box-shadow: 0 0 0 2px var(--surface); }
.nx .fx-station.is-loading .fx-station-ico i::before { content: "\\f110"; display: inline-block; animation: fx-spin 1s linear infinite; }
.nx .fx-station.is-playing .fx-eq { display: inline-flex; }
.nx .fx-station .fx-del { position: absolute; top: 4px; right: 4px; width: 24px; height: 24px; display: grid; place-items: center; border-radius: 50%; color: var(--ink-3); background: var(--surface); }
@media (min-width: 768px) and (max-width: 1100px) {      /* tablets: four across, a little more compact */
  .nx .fx-station { gap: 8px; padding: 9px; }
  .nx .fx-station-ico { width: 30px; height: 30px; border-radius: 10px; font-size: 12px; }
  .nx .fx-station-text b { font-size: 12.5px; }
  .nx .fx-station .fx-eq { display: none !important; }
}
.nx .fx-layers li[data-radio].is-loading .fx-layer-ico i::before { content: "\\f110"; display: inline-block; animation: fx-spin 1s linear infinite; }

/* backup */
/* radio: groups behind "Show more", a picker while a Bangla set plays, a hidden add-a-stream */
.nx .fx-st-group { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 8px; margin: 10px 2px -2px; font-size: 13px; font-weight: 700; color: var(--ink-2); }
.nx .fx-st-group > i { font-size: 12px; color: var(--link); }
.nx .fx-st-group > i { color: var(--link); }
.nx .fx-st-more-item:not([hidden]) { animation: fx-fade .25s ease both; }
.nx .fx-radio-foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
.nx .fx-showmore { display: inline-flex; align-items: center; gap: 8px; height: 38px; padding: 0 16px; border-radius: 999px; font-size: 13px; font-weight: 650; color: var(--ink);
  background: var(--surface); box-shadow: inset 0 0 0 1px var(--line); transition: box-shadow .2s ease, background .2s ease; }
.nx .fx-showmore:hover { background: var(--surface-2); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--brand) 45%, transparent); }
.nx .fx-showmore:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
.nx .fx-showmore > i { font-size: 11px; color: var(--ink-3); }
.nx .fx-addst-panel { display: flex; flex-direction: column; gap: 8px; animation: fx-fade .2s ease both; }
.nx .fx-addst-panel[hidden] { display: none; }
.nx .fx-tuned { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 6px 8px; border-radius: 16px;
  background: color-mix(in srgb, var(--brand) 8%, var(--surface)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--brand) 28%, transparent); }
.nx .fx-tuned[hidden] { display: none; }
.nx .fx-surah select { max-width: 200px; }
.nx .fx-tuned .fx-icon { width: 36px; height: 36px; }
.nx .fx-radio-err { margin: 0; font-size: 12.5px; color: #f87171; }
.nx .fx-radio-err[hidden] { display: none; }

/* the visualizer and the previous/next buttons in the focus view & stage */
.nx .fx-viz { position: absolute; inset: 0; z-index: 0; width: 100%; height: 100%; display: block; background: #000; }
.nx .fx-stage .fx-viz { border-radius: 28px; }
.nx .fx-stage[data-viz] .fx-scenes { opacity: 0; pointer-events: none; }
.nx .fx-stage[data-viz]::before {
  z-index: 1; pointer-events: none;
  background: linear-gradient(0deg, rgba(0, 0, 0, .55) 0%, rgba(0, 0, 0, 0) 35%, rgba(0, 0, 0, 0) 75%, rgba(0, 0, 0, .35) 100%);
}
.nx .fx-stage-in { position: relative; z-index: 2; }

.nx.fx-view .fx-viz { z-index: 0; }
.nx.fx-view[data-viz] .fx-view-quote, .nx.fx-view[data-viz] .fx-view-credit { opacity: 0; }
.nx.fx-view[data-viz] .fx-view-shade { background: linear-gradient(0deg, rgba(0, 0, 0, .55) 0%, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0) 80%, rgba(0, 0, 0, .35) 100%); }
.nx .fx-view-mid { position: relative; }
.nx .fx-viz-name { position: absolute; left: 50%; bottom: 16px; max-width: min(90%, 640px); translate: -50% 0; padding: 7px 14px; border-radius: 999px; text-align: center;
  font-size: 12.5px; font-weight: 600; color: rgba(255, 255, 255, .9); background: rgba(0, 0, 0, .45); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
  opacity: 0; transition: opacity .5s ease; pointer-events: none; z-index: 10; }
.nx .fx-stage #fx-stage-viz-name { position: absolute; top: 20px; right: 24px; left: auto; bottom: auto; translate: none; }
.nx .fx-viz-name.is-on { opacity: 1; }
.nx .fx-viz-name.is-err { color: #fecaca; }
.nx #fx-viz[aria-pressed="true"], .nx #fx-stage-viz[aria-pressed="true"] { color: #0b1120; background: #fff; box-shadow: 0 0 16px rgba(255, 255, 255, .5); }

/* timer: where you are in the four rounds, a nudge when the break is over, a calmer look on breaks */
.nx .fx-timer { margin-top: 28px; }
.nx .fx-timer-text small { display: flex; align-items: center; gap: 8px; }
.nx .fx-dots { display: inline-flex; gap: 4px; }
.nx .fx-dots i { width: 6px; height: 6px; border-radius: 50%; background: var(--surface-3); transition: background .3s ease; }
.nx .fx-dots i.is-on { background: var(--brand); }
.nx .fx-dots i.is-now { background: transparent; box-shadow: inset 0 0 0 1.5px var(--brand); }
.nx .fx-timer.is-waiting .fx-tgo { color: var(--on-brand); background: var(--brand); animation: fx-ready 1.8s ease-out infinite; }
@keyframes fx-ready { 0% { box-shadow: 0 0 0 0 rgba(var(--brand-rgb), .55); } 70%, 100% { box-shadow: 0 0 0 12px rgba(var(--brand-rgb), 0); } }
.nx .fx-timer.is-break .fx-ring-fg { stroke: #34d399; }
.nx .fx-timer.is-break .fx-tgo { color: #0b1120; background: #34d399; }
.nx .fx-plan select { max-width: 150px; }
/* the visual answers double-clicks, double-taps, swipes and a long press; a kept one shows a small pin on its button */
.nx .fx-stage[data-viz], .nx.fx-view[data-viz] { touch-action: pan-y pinch-zoom; -webkit-user-select: none; user-select: none; }
.nx .is-pinned { position: relative; }
.nx .is-pinned::after { content: "\f08d"; position: absolute; top: -3px; right: -3px; width: 16px; height: 16px; display: grid; place-items: center; border-radius: 50%;
  font: 900 8px/1 "Font Awesome 6 Free"; color: #0b1120; background: var(--brand); box-shadow: 0 0 0 2px rgba(3, 7, 18, .6); }


@media (min-width: 1200px) { .nx .fx-tiles { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (max-width: 900px) { .nx .fx-tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 767px) {
  /* the site-wide phone h2 size would shrink the library hero titles to body size */
  html body .nx .nl-hero-title:not(#_x) { font-size: 28px !important; margin: 14px 0 10px !important; }
  html body .nx .fx-title:not(#_x) { font-size: 38px !important; margin: 8px 0 0 !important; }
  .nx .fx-stage { min-height: 0; border-radius: 22px; }
  /* the stage fills the first screen from the first paint (fit() in focus-page.js sets the same height): 213px above it, the 64px tab bar, 14px gap */
  .nx .fx-stage { min-height: max(460px, calc(100svh - 291px - env(safe-area-inset-bottom, 0px))); }
  .nx .fx-stage::before { background: linear-gradient(0deg, rgba(3, 7, 18, .85) 0%, rgba(3, 7, 18, .45) 60%, rgba(3, 7, 18, .4) 100%); }
  .nx .fx-stage-in { padding: 36px 20px 30px; }      /* the bottom band (the scroll cue and the orb beside it) stays clear of buttons */
  /* the first screen is a player, laid out like any music app: one transport row (shuffle, previous, play, next, the mix),
     then the presets with the focus view and the visualizer beside them (focus-page.js moves those two there on phones) */
  .nx .fx-ctrls { justify-content: space-between; flex-wrap: wrap; gap: 10px; }
  /* arrange() (focus-page.js) moves these two beside the presets on phones; until then they stay out of the row, so it never changes height */
  .nx .fx-ctrls > :is(#fx-expand, #fx-stage-viz) { display: none; }
  .nx #fx-shuffle { order: 1; } .nx #fx-prev { order: 2; } .nx #fx-play { order: 3; } .nx #fx-next { order: 4; } .nx .fx-stage-mix { order: 5; margin: 0; }
  .nx .fx-glass.fx-side, .nx .fx-glass.fx-step { width: 44px; height: 44px; font-size: 15px; }
  /* the mix button: round, its count as a badge; it keeps its place while empty so the row stays balanced */
  .nx .fx-glass.fx-mixbtn { position: relative; justify-content: center; width: 44px; min-width: 0; height: 44px; padding: 0; }
  .nx .fx-mixbtn b { position: absolute; top: -4px; right: -4px; min-width: 18px; height: 18px; padding: 0 5px; display: grid; place-items: center; border-radius: 999px;
    font-size: 10.5px; color: var(--on-brand); background: var(--brand); box-shadow: 0 0 0 2px rgba(3, 7, 18, .6); }
  html body .nx .fx-page .fx-stage-mix .fx-mixbtn[hidden] { display: inline-flex !important; visibility: hidden; }
  .nx .fx-presets-wrap { width: 100%; }
  .nx .fx-presets-bar { justify-content: flex-start; gap: 10px; }
  .nx .fx-presets-pill { min-width: 0; flex-shrink: 1; height: 40px; }
  .nx .fx-presets-cur { min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  .nx .fx-bar-tools { margin-left: auto; display: flex; gap: 10px; }
  .nx .fx-bar-tools .fx-glass { width: 40px; height: 40px; font-size: 14px; }
  .nx .fx-keys { display: none; }
  /* library tabs: a touch smaller on phones */
  .nx .nl-tabs a { padding: 7px 13px; gap: 6px; font-size: 13px; }
  .nx .nl-tabs a svg { width: 15px; height: 15px; }
  /* the row spans the stage and scrolls sideways (centred, it would grow past both edges and could not scroll) */
  .nx .fx-presets-wrap .fx-chips { align-self: stretch; }
  .nx .fx-presets-wrap.is-open .fx-chips { max-height: 220px; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; margin-inline: -20px; padding: 2px 20px; }
  .nx .fx-presets-wrap.is-open .fx-chips::-webkit-scrollbar { display: none; }
  /* the cue to scroll sits left: the bottom-right corner of the first screen is the AI orb's */
  .nx .fx-more { display: flex; align-items: center; justify-content: center; gap: 8px; align-self: flex-start; margin: 12px 0 0 -10px; padding: 6px 10px; border-radius: 999px;
    font-size: 12.5px; font-weight: 600; color: rgba(255, 255, 255, .78); }
  .nx .fx-more i { font-size: 11px; animation: fx-nudge 2s ease-in-out infinite; }
  @keyframes fx-nudge { 50% { transform: translateY(3px); } }
  .nx .fx-quote { font-size: 14.5px; }
  .nx .fx-play { width: 64px; height: 64px; font-size: 21px; }
  /* short phones: the first screen drops the quote and tightens, so the player fits above the orb */
  @media (max-height: 760px) {
    .nx .fx-stage-in { padding-top: 22px; }
    .nx .fx-quote { display: none; }
    html body .nx .fx-title:not(#_x) { font-size: 32px !important; }
  }
  @media (max-width: 360px) {
    .nx .fx-ctrls { gap: 6px; }
    .nx .fx-play { width: 56px; height: 56px; font-size: 19px; }
    .nx .fx-glass.fx-side, .nx .fx-glass.fx-step, .nx .fx-glass.fx-mixbtn { width: 40px; height: 40px; font-size: 14px; }
  }
  .nx .fx-chips { margin-top: 18px; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; margin-inline: -20px; padding: 2px 20px; }
  .nx .fx-chips::-webkit-scrollbar { display: none; }
  /* phones: ring, time and reset on the first row (the line under the time may wrap, the reset never drops),
     the three modes on the second, round length and sleep sharing the third */
  .nx .fx-timer { flex-wrap: wrap; gap: 12px; padding: 12px; }
  .nx .fx-timer-text { flex: 1; min-width: 0; }
  .nx .fx-timer-text small { white-space: normal; flex-wrap: wrap; row-gap: 3px; line-height: 1.35; }
  .nx #fx-treset { margin-left: 0; }
  .nx .fx-phases { order: 5; width: 100%; margin-left: 0; }
  .nx .fx-phases button { flex: 1; min-width: 0; padding: 8px 4px; font-size: 12.5px; }
  .nx .fx-timer .fx-sleep { flex: 1 1 auto; min-width: 0; justify-content: center; }
  .nx .fx-sleep select { min-width: 0; max-width: 100%; text-overflow: ellipsis; }
  @media (max-width: 400px) { .nx .fx-ph-word { display: none; } }
  .nx .fx-tools { flex-direction: column-reverse; align-items: stretch; }
  .nx .fx-tools .fx-search { width: auto; }
  .nx .fx-tiles { gap: 8px; }
  .nx .fx-tile { padding: 9px; }
  .nx .fx-tile-ico { width: 32px; height: 32px; border-radius: 10px; font-size: 13px; }
  .nx .fx-tile-text small { display: none; }
  .nx .fx-credits-body ul { grid-template-columns: 1fr; }
  /* phones scroll with overflow set on html and body, where sticky never sticks, so the bar is fixed above the tab bar */
  .nx .fx-dock { position: fixed; left: 16px; right: 16px; bottom: calc(84px + env(safe-area-inset-bottom, 0px)); width: auto; margin: 0; }
  .nx .fx-page[data-mixed] { padding-bottom: 110px !important; }
  .nx .fx-bar #fx-full { display: none; }
  .nx .fx-bar { gap: 6px; border-radius: 22px; }
  .nx .fx-vol.fx-bar-vol, .nx .fx-wide { display: none; }
  .nx .fx-thumb { width: 46px; height: 46px; border-radius: 15px; }
  .nx .fx-layer-name { width: 92px; }
  .nx .fx-sleep { order: 6; }
  .nx .fx-stations { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .nx .fx-station { gap: 8px; padding: 9px; min-height: 56px; border-radius: 16px; }
  .nx .fx-station-ico { width: 32px; height: 32px; border-radius: 10px; font-size: 13px; }
  .nx .fx-station-text b { font-size: 13px; }
  .nx .fx-station .fx-eq { display: none !important; }

  /* phones: the tab row scrolls with the page (sticky doesn't hold there), three equal tabs, no counts */
  .nx .fx-libtabs-wrap { position: static; margin: 0; padding: 0; background: none; -webkit-backdrop-filter: none; backdrop-filter: none; }
  .nx .fx-libtab { gap: 6px; padding: 0 6px; font-size: 13px; height: 42px; }
  .nx .fx-libtab b { display: none; }
  .nx .fx-tab-q { display: none; }
  .nx .fx-libtab[data-tab="radio"] > span::first-letter { text-transform: uppercase; }
  .nx .fx-tuned .fx-surah { order: 0; flex: 1; } .nx .fx-surah select { max-width: none; width: 100%; }
  .nx .fx-view-in { padding-inline: 18px; }
  /* the top of the focus view on a phone: one row, the timer when it runs (else the "Focus" label), the tools at the right */
  .nx .fx-view-top { display: flex; align-items: center; gap: 8px; }
  .nx .fx-view-top:has(.fx-view-timer:not([hidden])) > p { display: none; }
  .nx .fx-view-timer { padding: 5px 11px; font-size: 12px; }
  .nx .fx-view-tools { margin-left: auto; gap: 6px; }
  .nx .fx-view-tools .fx-glass { width: 38px; height: 38px; font-size: 13px; }
  .nx .fx-view-ctrls .fx-glass:not(.fx-glass-lg) { width: 40px; height: 40px; }
  .nx .fx-view-ctrls { width: 100%; }
  .nx .fx-view-ctrls .fx-vol { flex: 1; width: auto; }
}
@media (prefers-reduced-motion: reduce) {
  .nx .fx-ico-bars line, .nx .fx-ico-radio path, .nx .fx-live, .nx .fx-eq i, .nx .fx-scenes img.is-on, .nx .fx-tile.is-on::before, .nx .fx-more i, .nx .fx-page[data-live] .fx-state::before, .nx .fx-timer.is-waiting .fx-tgo { animation: none !important; }
  .nx .fx-scenes img { transition: opacity .3s ease; transform: none; }
}

"""


def scope_css(css):
    """Prefix every nx rule with .nx so it cannot leak into the shared site stylesheet."""
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    drop = re.compile(r"\.(topnav|side|mobile-bar|nav-links|brand-text)(?![\w-])|data-sidebar")
    out, i = [], 0
    while True:
        j = css.find("{", i)
        if j < 0:
            break
        sel, d, k = css[i:j].strip(), 1, j + 1
        while d:
            d += (css[k] == "{") - (css[k] == "}")
            k += 1
        body = css[j + 1:k - 1]
        i = k
        if sel.startswith("@media"):
            out.append(sel + "{" + scope_css(body) + "}")
        elif sel.startswith("@"):
            out.append(sel + "{" + body + "}")
        else:
            res = []
            for t in (x.strip() for x in sel.split(",")):
                if drop.search(t):
                    continue
                m = re.match(r':root\[data-theme="(\w+)"\]$', t)
                if m:
                    res.append(f'[data-theme="{m.group(1)}"] .nx')
                elif t in (":root", "html", "body"):
                    res.append(".nx")
                else:
                    res.append(".nx " + t)
            if res:
                out.append(", ".join(res) + " {" + body + "}")
    return "\n".join(out)


# the shell below is what makes the page the same as the home page: shared stylesheet,
# shared nav bar, SYS_MONITOR, WhatsApp / sound / theme buttons, Ask-My-AI widget and script
_src = (ROOT / "scripts/site_src/index.full.html").read_text(encoding="utf-8").replace("\r\n", "\n")
_head = _src[:_src.index("<body>")]
_head = re.sub(r'<script type="application/ld\+json">.*?</script>', "", _head, flags=re.S)
_head = re.sub(r'\s*<script id="hero-net">.*?</script>', "", _head, flags=re.S)  # draws the home hero's particles
_head = re.sub(r'\n\s*<!-- Home, desktop:.*?-->', "", _head, flags=re.S)  # the hero's desktop font preloads
_head = re.sub(r'\n\s*<link[^>]*\bdata-home\b[^>]*>', "", _head)
_open = _src[_src.index("<body>") + 6:_src.index('<header class="hero"')]
_tail = _src[_src.index('<div style="text-align: center; padding-bottom: 2rem;">'):]
_tail = _tail.replace('<div style="text-align: center; padding-bottom: 2rem;">',
                      '<div style="text-align: center; padding-bottom: 2rem; display: none;">', 1)


def global_top_nav(cur):
    links = [("profile", "Profile"), ("projects", "Projects"), ("people", "People"),
             ("library", "Library"), ("contact", "Contact")]
    links_html = "".join([f'<a href="../{k}/" class="{"active" if k==cur else ""}">{l}</a>' for k, l in links])
    return (f'<header class="nx-global-nav"><div class="nx-nav-container">'
            f'<a href="../" class="nx-logo" style="text-decoration: none;"><span style="font-weight: 900; font-size: 24px; letter-spacing: -1.5px; background: linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">MH</span></a>'
            f'<div class="nx-nav-right"><nav class="nx-nav-links">{links_html}</nav>'
            f'<a href="../" title="Terminal" class="nx-cli">&gt;_</a></div>'
            f'</div></header>')


def swap_nav_active(html: str, prefix: str, cur: str) -> str:
    cli = '<li><a href="../" id="cli-toggle" class="magnetic-element hover-sound" title="Open Terminal"><i class="fa-solid fa-terminal" style="color: var(--accent-1);"></i></a></li>'
    items = ""
    for k, l in NAV:
        is_cur = (k == cur)
        cls = 'class="active magnetic-element hover-sound nav-link-item"' if is_cur else 'class="magnetic-element hover-sound nav-link-item"'
        cur_attr = ' aria-current="page"' if is_cur else ''
        items += f'<li><a href="{prefix}{k}/" {cls}{cur_attr}>{ico(k)} <span>{l}</span></a></li>\n            '
    # Library sits in its own group below a divider (shown in the mobile drawer)
    lib_cur = cur == "library"
    items += '<li class="nav-sep" aria-hidden="true"></li>\n            '
    lib_attrs = ' class="active magnetic-element hover-sound nav-link-item" aria-current="page"' if lib_cur \
        else ' class="magnetic-element hover-sound nav-link-item"'
    items += f'<li><a href="{prefix}library/"{lib_attrs}>{ico("books")} <span>Library</span></a></li>\n            '
    nav_inner = "\n            " + items + cli + "\n        "
    return build_pages.dedupe_cli(re.sub(r'<ul class="nav-links">.*?</ul>', f'<ul class="nav-links">{nav_inner}</ul>', html, flags=re.S))


def shell(slug, title, desc, cur):
    head = build_pages.set_meta(_head, slug, title.replace(f"{NAME} · ", ""), desc, "../")
    head = head.replace("</head>", '<link rel="stylesheet" href="../nx/nx.scoped.css?v=' + CSS_VER + '">\n</head>')
    opening = swap_nav_active(_open, "../", cur)
    return build_pages.rewrite(head, "../"), build_pages.rewrite(opening, "../"), build_pages.rewrite(_tail, "../")


SHARE_BTN = '''      <div class="share-wrap">
        <button type="button" class="btn-share" data-share aria-haspopup="dialog" aria-expanded="false" aria-label="Share this page" title="Share this page">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>
        </button>
        <div class="share-panel" role="dialog" aria-label="Share this page" hidden>
          <p class="share-title">Share this page</p>
          <div class="share-link"><span data-share-url></span><button type="button" class="share-copy" data-share-copy>Copy link</button></div>
          <div class="share-nets">
            <a data-net="linkedin" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-linkedin"></i><span>LinkedIn</span></a>
            <a data-net="x" target="_blank" rel="noopener noreferrer"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23 22h-6.2l-4.9-6.4L6.3 22H3.2l7.3-8.3L1 2h6.3l4.4 5.9L18.9 2Zm-1.1 18.1h1.7L6.3 3.8H4.5l13.3 16.3Z"/></svg><span>X</span></a>
            <a data-net="facebook" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-facebook"></i><span>Facebook</span></a>
            <a data-net="whatsapp" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-whatsapp"></i><span>WhatsApp</span></a>
            <a data-net="email"><i class="fa-solid fa-envelope"></i><span>Email</span></a>
          </div>
        </div>
      </div>'''


def sub_header(slug, title):
    if not title or slug == "profile":
        return ""
    return f'''<div class="sub-header-bar">
  <div class="sub-header-shell">
    <div class="sub-header-left">
      <h1 class="sub-header-title">{e(title)}</h1>
    </div>
    <div class="sub-header-right">
{SHARE_BTN}
      <a class="btn-rail-top" href="{GH}" target="_blank" rel="noopener noreferrer" title="Follow on GitHub" aria-label="Follow Mehedi on GitHub">
        <span class="git-icon-wrap"><i class="fa-brands fa-github"></i></span>
        <span>Follow</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="git-arr"><path d="M7 17L17 7M7 7h10v10"/></svg>
      </a>
    </div>
  </div>
</div>'''


def page(slug, title, desc, topbar_title, body, cur, show_open=True, show_rail=True):
    head, opening, tail = shell(slug, title, desc, cur)
    sub_bar = sub_header(slug, topbar_title)
    is_profile = (slug == "profile")
    return f'''{head}<body class="subpage nx-page" data-page="{slug}">{opening}
<div class="nx">
{sub_bar}
<div class="shell{" has-rail" if show_rail else ""}">
<main class="main">
{body}
</main>
{rail(show_open, show_top=is_profile) if show_rail else ""}
</div>
{bottom_nav(cur, prefix="../")}
</div>
<script src="../nx/nx.js?v=8"></script>
<script src="../nx/proj-dots.js?v=5"></script>
{'<script type="module" src="../nx/slats-cover.js?v=9"></script>' if is_profile else ""}
{SHARE_JS if (sub_bar or is_profile) else ""}
{tail}'''


# phones get their own share sheet; elsewhere a small panel with copy and the usual networks
SHARE_JS = """<script>
(function () {
  var btn = document.querySelector('[data-share]');
  if (!btn) return;
  var panel = btn.parentNode.querySelector('.share-panel');
  var url = location.href.split('#')[0], title = document.title;
  var desc = (document.querySelector('meta[name="description"]') || {}).content || '';
  var enc = encodeURIComponent;
  var NETS = {
    linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + enc(url),
    x: 'https://x.com/intent/post?url=' + enc(url) + '&text=' + enc(title),
    facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + enc(url),
    whatsapp: 'https://wa.me/?text=' + enc(title + ' ' + url),
    email: 'mailto:?subject=' + enc(title) + '&body=' + enc(desc + '\\n\\n' + url)
  };
  panel.querySelectorAll('[data-net]').forEach(function (a) { a.href = NETS[a.dataset.net]; });
  panel.querySelector('[data-share-url]').textContent = url.replace(/^https?:\\/\\//, '');
  document.body.appendChild(panel);
  function place() {
    var r = btn.getBoundingClientRect();
    panel.style.top = (r.bottom + 10) + 'px';
    panel.style.right = Math.max(8, innerWidth - r.right) + 'px';
  }
  function open(on) { if (on) place(); panel.hidden = !on; btn.setAttribute('aria-expanded', String(on)); }
  addEventListener('resize', function () { if (!panel.hidden) place(); });
  addEventListener('scroll', function () { if (!panel.hidden) open(false); }, { passive: true });
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      navigator.share({ title: title, text: desc, url: url }).catch(function () {});
      return;
    }
    open(panel.hidden);
  });
  panel.querySelector('[data-share-copy]').addEventListener('click', function () {
    var b = this;
    var done = function () { b.textContent = 'Copied \\u2713'; b.classList.add('is-done'); setTimeout(function () { b.textContent = 'Copy link'; b.classList.remove('is-done'); }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done); else done();
  });
  document.addEventListener('click', function (e) { if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) open(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { open(false); btn.focus(); } });
})();
</script>"""


def icon_src(name):
    return f"../uploads/brand-icons/{name}.svg" if (DOCS / "uploads/brand-icons" / f"{name}.svg").exists() else None


CARD_SIZES = "(max-width: 767px) calc(100vw - 48px), 340px"   # card images: ~364px wide on phones, ~340px in the desktop grids
LCP_LOAD = 'loading="eager" fetchpriority="high"'               # the image that is the first big paint on its page


def two_deep(html_out):
    """The shell writes paths for pages one level deep; library pages live two levels deep. Also paths inside JSON data
    attributes, which arrive HTML-escaped as &quot;../, and the later candidates in a srcset list."""
    html_out = re.sub(r'(["\'(]|&quot;)\.\./', r'\1../../', html_out)
    return re.sub(r'srcset="[^"]*"', lambda m: m.group(0).replace(", ../", ", ../../"), html_out)


def resp_img(src, sizes=CARD_SIZES):
    """srcset/sizes for a local .webp with a 640px copy beside it (x-640.webp, made here when missing), so phones
    don't download the full-size file. Remote images, or no Pillow, get nothing extra."""
    path = src.split("?")[0]
    if path.startswith("http") or not path.endswith(".webp") or path.endswith("-640.webp"):
        return ""
    full = DOCS / re.sub(r"^(\.\./)+", "", path)
    small = full.with_name(full.stem + "-640.webp")
    try:
        from PIL import Image
        with Image.open(full) as im:
            w = im.width
            if w <= 700:
                return ""
            if not small.exists():
                im.resize((640, round(im.height * 640 / w)), Image.LANCZOS).save(small, "WEBP", quality=80, method=6)
    except (ImportError, OSError):
        return ""
    return f' srcset="{path[:-5]}-640.webp 640w, {src} {w}w" sizes="{sizes}"'


def ask_chip(label, icon, color, note, extra=False):
    """A stack chip that explains where I use the tool, and asks my AI about it when clicked."""
    src = icon_src(icon)
    im = f'<img src="{src}" alt="" width="14" height="14">' if src else ""
    ultra = label in HERO_ULTRA
    cls = "pill ask-chip" + (" ultra" if ultra else (" ai" if color else "")) + (" is-extra" if extra else "")
    st = f' style="--c:{color}"' if color else ""
    return (f'<button type="button" class="{cls}"{st} data-ask="{e(label)}" data-tip="{e(note)}" '
            f'aria-label="{e(label)}: {e(note)}. Ask my AI about it">{im}<span>{e(label)}</span></button>')


HERO_FIRST = ["Claude", "OpenAI", "Antigravity", "Ollama", "LangGraph", "NestJS", "TypeScript", "Python", "PostgreSQL", "Kafka"]
# the AI tools I use every day get the glowing "Ultra" chip
HERO_ULTRA = {"Claude", "OpenAI", "Antigravity", "Ollama"}


def hero_stack():
    tools = {l: (l, i, c, n) for _, group, _ in HERO_STACK for (l, i, c, n) in group}
    first = [tools[l] for l in HERO_FIRST]
    rest = [t for l, t in tools.items() if l not in HERO_FIRST]
    chips = "".join(ask_chip(*t) for t in first) + "".join(ask_chip(*t, extra=True) for t in rest)
    more = f'<button type="button" class="pill pill-more" aria-label="Show {len(rest)} more tools">+{len(rest)}</button>' if rest else ""
    return f'<div class="pills stack-row">{chips}{more}</div>'


def pill_img(label, icon, color=None):
    src = icon_src(icon)
    im = f'<img src="{src}" alt="" width="14" height="14">' if src else ""
    st = f' ai" style="--c:{color}' if color else ""
    return f'<span class="pill{st}">{im}{e(label)}</span>'


# ------------------------------------------------------------------ PAGES
def skill_chip(label, icon, tier):
    src = icon_src(icon) if icon else None
    im = f'<img src="{src}" alt="" width="16" height="16" loading="lazy">' if src else ""
    return f'<span class="chip chip-logo {tier}">{im}{e(label)}</span>'


def initials(name):
    return "".join(w[0] for w in re.findall(r"[A-Za-z0-9&]+", name)[:2]).upper()


def profile_meta_widgets():
    return f'''<div class="meta-widgets">
  <div class="meta-grid-2">
    <!-- Card 1: Based in -->
    <div class="widget-card widget-location" data-halo>
      {nahian_aurora_html()}
      <div class="widget-head">
        <span class="widget-icon location-ico">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </span>
        <span class="widget-label">Based in</span>
      </div>
      <h3 class="widget-title">Dhaka, Bangladesh</h3>
      <div class="clock-display">
        <span class="clock-time" data-time>2:32 PM</span>
        <span class="clock-tz">GMT+6</span>
      </div>
      <div class="clock-daypart" data-daypart>
        <span class="daypart-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="daypart-svg"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg></span> <span class="daypart-text">Afternoon in Dhaka</span>
      </div>
    </div>

    <!-- Card 2: Works -->
    <div class="widget-card widget-works">
      <div class="widget-head">
        <span class="widget-icon globe-ico">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        </span>
        <span class="widget-label">Works</span>
      </div>
      <h3 class="widget-title">Remote-first</h3>
      <p class="widget-desc">Open to hybrid roles and on-site work in Dhaka, with remote collaboration across US, EU and APAC time zones.</p>
      <div class="works-chips">
        <span class="work-chip"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Remote</span>
        <span class="work-chip"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Hybrid</span>
        <span class="work-chip"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> On-site (Dhaka)</span>
        <span class="work-chip"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Async-friendly</span>
        <a class="work-chip work-chip-cv" href="../uploads/Mehedi_Hasan_CV.pdf" target="_blank" rel="noopener noreferrer"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6m-3 3l3 3 3-3"/></svg> Download CV</a>
      </div>
    </div>
  </div>

  <!-- Card 3: Languages (Full width) -->
  <div class="widget-card widget-languages">
    <div class="widget-head">
      <span class="widget-icon lang-ico">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
      </span>
      <span class="widget-label">Languages</span>
    </div>
    
    <div class="lang-grid">
      <!-- English -->
      <div class="lang-col">
        <div class="lang-title-row">
          <h4 class="lang-name">English</h4>
          <button type="button" class="lang-audio-btn" data-lang="en" title="Listen to English" aria-label="Listen English">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
          </button>
        </div>
        <div class="lang-bars" role="img" aria-label="Proficiency: 4 of 5">
          <span class="bar-seg active"></span>
          <span class="bar-seg active"></span>
          <span class="bar-seg active"></span>
          <span class="bar-seg active"></span>
          <span class="bar-seg"></span>
        </div>
        <div class="lang-pill"><span class="lang-dot"></span>Professional</div>
        <p class="lang-sub">Business communication, presentations and writing.</p>
      </div>

      <!-- Bangla -->
      <div class="lang-col">
        <div class="lang-title-row">
          <h4 class="lang-name">Bangla</h4>
          <button type="button" class="lang-audio-btn" data-lang="bn" title="বাংলা শুনুন" aria-label="Listen Bangla">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
          </button>
        </div>
        <div class="lang-bars" role="img" aria-label="Proficiency: 5 of 5">
          <span class="bar-seg active"></span>
          <span class="bar-seg active"></span>
          <span class="bar-seg active"></span>
          <span class="bar-seg active"></span>
          <span class="bar-seg active"></span>
        </div>
        <div class="lang-pill"><span class="lang-dot"></span>Native</div>
        <p class="lang-sub">First language.</p>
      </div>

      <!-- Hindi -->
      <div class="lang-col">
        <div class="lang-title-row">
          <h4 class="lang-name">Hindi</h4>
          <button type="button" class="lang-audio-btn" data-lang="hi" title="हिंदी सुनें" aria-label="Listen Hindi">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
          </button>
        </div>
        <div class="lang-bars" role="img" aria-label="Proficiency: 3 of 5">
          <span class="bar-seg active"></span>
          <span class="bar-seg active"></span>
          <span class="bar-seg active"></span>
          <span class="bar-seg"></span>
          <span class="bar-seg"></span>
        </div>
        <div class="lang-pill"><span class="lang-dot"></span>Speaking &amp; listening</div>
        <p class="lang-sub">Everyday conversation and listening.</p>
      </div>
    </div>
  </div>
</div>'''


MONTHS = {m: i for i, m in enumerate(["jan", "feb", "mar", "apr", "may", "jun",
                                      "jul", "aug", "sep", "oct", "nov", "dec"], 1)}


def _ym(text, default_month):
    """'Jun 2026' -> (2026, 6), '2024' -> (2024, default_month), 'Present' -> today."""
    parts = text.strip().split()
    if parts[0].lower() == "present":
        today = date.today()
        return (today.year, today.month)
    if len(parts) == 2:
        return (int(parts[1]), MONTHS[parts[0][:3].lower()])
    return (int(parts[0]), default_month)


def job_span(period):
    start, _, end = period.partition(" - ")
    return _ym(start, 1), _ym(end, 12)


def duration_label(start, end):
    months = (end[0] - start[0]) * 12 + (end[1] - start[1]) + 1
    years, rem = divmod(months, 12)
    parts = []
    if years:
        parts.append(f"{years} yr" + ("s" if years > 1 else ""))
    if rem:
        parts.append(f"{rem} mo" + ("s" if rem > 1 else ""))
    return " ".join(parts) or "< 1 mo"


KEY_FIGURE = re.compile(r"(?<![\w.])~?\d[\d,.]*\+?%?(?![\w])")


def emphasise(text):
    """Escape a bullet and bold its headline figures (85+, ~50%, 1,200+); bare years are left alone."""
    def bold(m):
        tok = m.group(0)
        return tok if re.fullmatch(r"(19|20)\d\d", tok) else f"<b>{tok}</b>"
    return KEY_FIGURE.sub(bold, e(text))


ICON_PATHS = {
    "code": '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>',
    "sparkle": '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    "database": '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    "shield": '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    "server": '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 8h.01M7 17h.01"/>',
    "book": '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
}
# first matching rule wins: security before data, AI before code
ICON_RULES = [
    (re.compile(r"security|VAPT|secure|backup|access control|patch|uptime", re.I), "shield"),
    (re.compile(r"\bAI\b|LLM|agent\w*|LangGraph|RAG|OpenAI|Claude|Gemini|MCP", re.I), "sparkle"),
    (re.compile(r"database|MySQL|PostgreSQL|PGVector|Redis|Kafka|\bdata\b", re.I), "database"),
    (re.compile(r"server|hosting|cPanel|Linux|Docker|Kubernetes|deploy|infrastructure|Nginx|network", re.I), "server"),
    (re.compile(r"support|training|documentation|SOP|guide|UAT|SRS|configur|onboard|social media|end-user|users?\b", re.I), "book"),
]
CHEVRON = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>'
HERO_JS = """<script>
(function () {
  var hero = document.querySelector('.nx-hero');
  if (!hero) return;
  // open the AI chat, then run fn once it is ready; without the chat, fall back to the contact page
  function withChat(fn) {
    var w = document.getElementById('ai-chat-widget'), h = document.getElementById('chat-header');
    if (!w || !window.MehediChat) { location.href = '../contact/'; return; }
    if (!w.classList.contains('chat-expanded') && h) h.click();
    setTimeout(fn, 320);
  }
  hero.addEventListener('click', function (e) {
    var chip = e.target.closest('[data-ask]');
    if (chip) { withChat(function () { window.MehediChat.ask('How have you used ' + chip.dataset.ask + ' in real projects?'); }); return; }
    var more = e.target.closest('.pill-more');
    if (more) { more.closest('.stack-row').classList.add('is-open'); more.remove(); }
  });
  // where I use each tool, in a small tip above the chip (mouse and keyboard only; taps go straight to the AI)
  if (matchMedia('(hover: hover)').matches) {
    var tip = document.createElement('div'), timer;
    tip.className = 'hero-tip'; tip.setAttribute('aria-hidden', 'true');
    document.querySelector('.nx').appendChild(tip);
    var show = function (chip) {
      clearTimeout(timer);
      timer = setTimeout(function () {
        tip.innerHTML = '';
        tip.appendChild(document.createTextNode(chip.dataset.tip));
        var cue = document.createElement('span'); cue.className = 'hero-tip-cue'; cue.textContent = 'Click to ask my AI \u2197';
        tip.appendChild(cue);
        var r = chip.getBoundingClientRect();
        tip.style.left = '0px'; tip.style.top = '0px'; tip.classList.add('is-on');
        var w = tip.offsetWidth, h = tip.offsetHeight;
        tip.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px';
        tip.style.top = (r.top - h - 8) + 'px';
      }, 220);
    };
    var hide = function () { clearTimeout(timer); tip.classList.remove('is-on'); };
    hero.addEventListener('pointerover', function (e) { var c = e.target.closest('[data-tip]'); if (c) show(c); });
    hero.addEventListener('pointerout', function (e) { if (e.target.closest('[data-tip]') && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('[data-tip]') === e.target.closest('[data-tip]'))) hide(); });
    hero.addEventListener('focusin', function (e) { var c = e.target.closest('[data-tip]'); if (c) show(c); });
    hero.addEventListener('focusout', hide);
    addEventListener('scroll', hide, { passive: true });
  }
})();
</script>"""

EXP_JS = """<script>
/* eases the glow toward the pointer; shared by every card with class exp-stat-card or glow-tile */
function glowTrack(card, x, y) {
  card._tx = x; card._ty = y;
  if (card._x === undefined) { card._x = x; card._y = y; }
  if (card._raf) return;
  (function step() {
    card._x += (card._tx - card._x) * 0.2; card._y += (card._ty - card._y) * 0.2;
    card.style.setProperty("--mx", card._x + "px"); card.style.setProperty("--my", card._y + "px");
    card._raf = (Math.abs(card._tx - card._x) > 0.5 || Math.abs(card._ty - card._y) > 0.5) ? requestAnimationFrame(step) : null;
  })();
}
document.addEventListener("pointermove", function (ev) {
  var card = ev.target.closest && ev.target.closest(".exp-stat-card");
  if (!card) return;
  var r = card.getBoundingClientRect();
  glowTrack(card, ev.clientX - r.left, ev.clientY - r.top);
});
document.addEventListener("click", function (ev) {
  var btn = ev.target.closest(".exp-more-btn");
  if (!btn) return;
  var item = btn.closest(".exp-item-modern");
  var open = item.classList.toggle("is-expanded");
  btn.setAttribute("aria-expanded", open ? "true" : "false");
  btn.querySelector("span").textContent = open ? "Show less" : "Read more";
});
</script>"""


def bullet_icon(text):
    name = next((icon for rx, icon in ICON_RULES if rx.search(text)), "code")
    return (f'<span class="xb-ico" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" '
            f'stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">'
            f'{ICON_PATHS[name]}</svg></span>')


def bullet_li(text, rest=False):
    cls = ' class="bullet-rest"' if rest else ""
    return f"<li{cls}>{bullet_icon(text)}{emphasise(text)}</li>"


def stat_card(category, num, caption, icon):
    return (f'<div class="widget-card widget-location exp-stat-card" data-halo>{nahian_aurora_html()}'
            f'<div class="widget-head"><span class="widget-icon location-ico">'
            f'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" '
            f'stroke-linecap="round" stroke-linejoin="round">{STAT_ICONS[icon]}</svg></span>'
            f'<span class="widget-label">{e(category)}</span></div>'
            f'<div class="exp-stat-num">{e(num)}</div>'
            f'<p class="exp-stat-cap">{e(caption)}</p></div>')


def company_mark(comp):
    if comp in COMPANY_LOGOS:
        return f'<img src="../{COMPANY_LOGOS[comp]}" alt="{e(comp)} logo" width="48" height="48" loading="lazy">'
    return initials(comp)


def experience_html():
    """Newest role first (ongoing roles included), with per-role duration and a one-line summary."""
    ordered = sorted(JOBS, key=lambda j: job_span(j[3]), reverse=True)
    spans = [job_span(j[3]) for j in JOBS]
    total = duration_label(min(s for s, _ in spans), max(t for _, t in spans))
    kinds = Counter(j[4] for j in JOBS)
    summary = (f"{total} overall &middot; {kinds['Full-time']} full-time &middot; "
               f"{kinds['Volunteer']} volunteer")
    items = ""
    for title, comp, place, period, kind, pts, chips in ordered:
        start, end = job_span(period)
        current = period.endswith("Present")
        lis = bullet_li(pts[0])
        if len(pts) > 1:
            lis += ('<li class="exp-more-li"><button class="exp-more-btn" type="button" aria-expanded="false">'
                    f'<span>Read more</span>{CHEVRON}</button></li>')
            lis += "".join(bullet_li(p, rest=True) for p in pts[1:])
        cc = "".join(f'<span class="chip-solid">{c}</span>' for c in chips)
        now_dot = '<span class="status-dot" title="Currently working here"></span>' if current else ""
        now_pill = '<span class="exp-now">Current</span>' if current else ""
        kind_cls = " is-volunteer" if kind == "Volunteer" else ""
        sub_text = (f'{e(comp)}<span class="exp-sep">&middot;</span>'
                    f'<span class="exp-kind{kind_cls}">{kind}</span>'
                    f'<span class="exp-sep">&middot;</span>{e(place)}')
        when = f'{e(period.replace(" - ", " – "))} <span class="exp-dur">&middot; {duration_label(start, end)}</span>'
        stats = JOB_STATS.get(comp, [])
        stat_html = ""
        if stats:
            stat_html = '<div class="exp-stats">' + "".join(stat_card(*st) for st in stats) + "</div>"
        items += (f'<article class="exp-item-modern">'
                  f'<div class="exp-timeline">'
                  f'<div class="exp-logo-box">{company_mark(comp)}{now_dot}</div>'
                  f'<div class="exp-line"></div>'
                  f'</div>'
                  f'<div class="exp-content">'
                  f'<div class="exp-header-row"><div class="exp-title-group"><h3>{e(title)}</h3>{now_pill}</div>'
                  f'<span class="exp-when">{when}</span></div>'
                  f'<div class="exp-sub">{sub_text}</div>'
                  f'{stat_html}'
                  f'<ul class="exp-bullets">{lis}</ul>'
                  f'<div class="exp-tech">{cc}</div>'
                  f'</div></article>')
    return summary, items


EXTRA_META = {  # title -> (kicker label, headline stat or None, tags)
    "Leadership & Community": ("Leadership", ("100+", "members led"), ["Youth mentorship", "Public communications", "Social development"]),
    "Philosophy & R&D": ("Research", None, ["Agent architectures", "Local LLM inference", "Developer tools"]),
    "Voluntary Work": ("Volunteer", ("2024", "volunteering since"), ["Non-profit", "WordPress", "Community tech"]),
}


def extra_card(title, text):
    kicker, stat, tags = EXTRA_META[title]
    stat_html = f'<div class="extra-stat"><b>{e(stat[0])}</b><span>{e(stat[1])}</span></div>' if stat else ""
    tag_html = "".join(f'<span class="chip">{e(t)}</span>' for t in tags)
    return (f'<article class="extra-card"><div class="extra-top"><span class="extra-kicker">{e(kicker)}</span>{stat_html}</div>'
            f'<h4 aria-level="3">{e(title)}</h4><p>{e(text)}</p><div class="extra-tags">{tag_html}</div></article>')


# WORK tab: one line of impact, a status and categories per project
WORK_META = {
    "SAWAB NGO ERP": ("HR, payroll, attendance, grants, micro-investment and accounts for SAWAB and SAWAB Foundation", "Live demo", ["ERP", "Non-profit"]),
    "Karbar ERP": ("NBR VAT (Mushak), payroll and TDS for Bangladeshi businesses", None, ["ERP"]),
    "SAWAB Bangladesh Platform": ("Live NGO portal for education, health, WASH and donations", None, ["Web", "Non-profit"]),
    "SAWAB Foundation Portal": ("Zakat calculator, relief tracking and instant donations", None, ["Web", "Non-profit"]),
    "AI Video Making Engine": ("Long videos into 9:16 shorts with Whisper and Bengali NLP", None, ["AI"]),
    "AI Chat Web App": ("Streaming LLM chat over WebSockets", "In development", ["AI", "Web"]),
    "HR & Payroll System": ("Payroll, tax deductions, attendance and compliance", None, ["ERP"]),
    "Savora: AI Hostel Management": ("AI meal planning and pantry tracking on web and mobile", None, ["AI", "Web"]),
    "Tafseerul Quran Foundation": ("A fast, secure site for a national non-profit", "Volunteer", ["Web", "Non-profit"]),
    "HBIZZ Corporate Website": ("Corporate site for a freight and logistics company", None, ["Web"]),
}
WORK_CATS = ["AI", "ERP", "Web", "Non-profit"]

WORK_JS = """<script>
(function () {
  var root = document.querySelector('.work2');
  if (!root) return;
  var rows = [].slice.call(root.querySelectorAll('.work2-row'));
  root.addEventListener('click', function (e) {
    var chip = e.target.closest('.work2-chip');
    if (chip) {
      root.querySelectorAll('.work2-chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      var cat = chip.dataset.cat;
      rows.forEach(function (r) { r.hidden = cat !== 'all' && r.dataset.cats.split(',').indexOf(cat) === -1; });
      return;
    }
    var ask = e.target.closest('[data-ask-project]');
    if (ask) {
      var w = document.getElementById('ai-chat-widget'), h = document.getElementById('chat-header');
      if (!w || !window.MehediChat) { location.href = '../projects/'; return; }
      if (!w.classList.contains('chat-expanded') && h) h.click();
      setTimeout(function () { window.MehediChat.ask('Tell me the story behind ' + ask.dataset.askProject + '. What was the hardest part?'); }, 320);
    }
  });
})();
</script>"""


def work_tab():
    rows, live, ai, npo = [], 0, 0, 0
    for t, d, tags, icon, badge, links, img in PROJECTS:
        impact, status, cats = WORK_META.get(t, (d, None, ["Web"]))
        site = next((u for k, u in links if k == "link"), None)
        code = next((u for k, u in links if k == "github"), None)
        wa = next((u for k, u in links if k == "whatsapp"), None)
        if not status:
            status = "Live" if site else None
        live += status in ("Live", "Live demo"); ai += "AI" in cats; npo += "Non-profit" in cats
        st_cls = {"Live": "is-live", "Live demo": "is-live", "In development": "is-dev", "Volunteer": "is-vol"}.get(status, "")
        st = f'<span class="work2-status {st_cls}"><i></i>{e(status)}</span>' if status else ""
        acts = ""
        if site: acts += f'<a class="work2-btn" href="{site}" target="_blank" rel="noopener noreferrer">Live <span aria-hidden="true">&#8599;</span></a>'
        if wa: acts += f'<a class="work2-btn" href="{wa}" target="_blank" rel="noopener noreferrer">Demo access <span aria-hidden="true">&#8599;</span></a>'
        if code and code != GH: acts += f'<a class="work2-btn" href="{code}" target="_blank" rel="noopener noreferrer">Code <span aria-hidden="true">&#8599;</span></a>'
        acts += f'<button type="button" class="work2-btn is-ai" data-ask-project="{e(t)}"><span aria-hidden="true">&#10022;</span> Ask AI</button>'
        chips = "".join(f'<span class="tag">{e(x)}</span>' for x in tags[:4])
        rows.append(f'<article class="work2-row" data-cats="{",".join(cats)}">'
                    f'<img class="work2-thumb" src="{img}" alt="" width="132" height="88" loading="lazy">'
                    f'<div class="work2-body"><div class="work2-top"><h3>{e(t)}</h3>{st}</div>'
                    f'<p class="work2-impact">{e(impact)}</p>'
                    f'<div class="work2-foot"><div class="tag-row">{chips}</div><div class="work2-acts">{acts}</div></div></div></article>')
    chips = '<button type="button" class="work2-chip" data-cat="all" aria-pressed="true">All</button>' + "".join(
        f'<button type="button" class="work2-chip" data-cat="{c}" aria-pressed="false">{e(c)}</button>' for c in WORK_CATS)
    summary = f"{len(PROJECTS)} projects &middot; {live} live &middot; {ai} with AI &middot; {npo} non-profit"
    return (f'<div class="work2"><p class="work2-summary">{summary}</p>'
            f'<div class="work2-chips" role="group" aria-label="Filter projects">{chips}</div>'
            f'<div class="work2-list">{"".join(rows)}</div>'
            f'<p style="margin-top:18px"><a class="btn btn-secondary" href="../projects/">See all projects</a></p></div>{WORK_JS}')


def profile():
    ai = "".join(pill_img(l, i, c) for l, i, c in AI_TOOLS)
    st = "".join(pill_img(l, i) for l, i in STACK)
    exp_summary, jobs = experience_html()
    edu = "".join(f'<div class="edu"><img class="edu-logo" src="../{logo}" alt="{e(s)} logo" width="48" height="48" loading="lazy">'
                  f'<div><h3>{e(d)}</h3><p class="exp-meta">{e(s)} &middot; {e(m)}</p></div></div>'
                  for d, s, m, logo in EDUCATION)
    certs = "".join(
        f'<article class="cert-card"><span class="cert-ico" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" '
        f'fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'
        f'<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg></span>'
        f'<div><h4 aria-level="3">{e(t)}</h4><p>{e(o)}</p></div></article>' for t, o in CERTS)
    skills = "".join(
        f'<div class="sk"><h4 aria-level="3">{g}</h4><p class="sk-desc">{e(d)}</p><div class="chips">'
        + "".join(skill_chip(l, i, "chip-core") for l, i in core)
        + "".join(skill_chip(l, i, "chip-more") for l, i in more)
        + "</div></div>" for g, d, core, more in SKILLS)
    extra = "".join(extra_card(k, v) for k, v in EXTRA)
    work = "".join(
        f'<a class="post" href="../projects/"><h3>{e(p[0])}</h3><small>{e(p[1])}</small></a>' for p in PROJECTS[:6])
    body = f'''{cover_banner()}
<section class="nx-hero">
<img class="avatar" src="../uploads/mehedi-avatar.jpg?v=1" alt="{NAME}" width="320" height="320" fetchpriority="high">
<h1 class="nx-name">{NAME} <span class="verified-badge" title="Verified Profile" role="img" aria-label="Verified">{ico("badge","verified")}</span></h1>
<p class="tagline">{TAGLINE}</p>
<a class="pill-status" href="../contact/"><span class="dot"></span>Open to freelance &amp; full-time</a>
<ul class="facts">
<li>{ico("case")} {ROLE_NOW} &middot; 4+ yrs</li>
<li>{ico("pin")} Dhaka <span class="t">&middot; <span data-time></span></span></li>
</ul>
<div class="stack-rows" aria-label="Tools I use. Select one to ask my AI how I used it">{hero_stack()}</div>
<div class="tabs" role="tablist"><button class="tab" role="tab" aria-selected="true" data-tab="resume">RESUME</button><button class="tab" role="tab" aria-selected="false" data-tab="work">WORK</button></div>
</section>
<div class="pad">
<div class="panel" data-panel="resume">
<h2 class="sec-title">{ico("user")} About</h2>
<div class="about-bio-wrap" id="about-bio-wrap">
  <div class="prose about-prose" id="about-prose">
    {"".join(f"<p>{e(p)}</p>" for p in ABOUT)}
  </div>
  <button class="about-toggle-btn" id="about-toggle-btn" type="button" aria-expanded="false" aria-controls="about-prose">
    <span class="about-btn-text">Read more</span>
    <svg class="about-btn-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
  </button>
</div>
{profile_meta_widgets()}
<h2 class="sec-title" style="margin-top:44px">{ico("case")} Experience</h2>
<p class="exp-summary">{exp_summary}</p>
<div class="exp-modern">{jobs}</div>
<h2 class="sec-title" style="margin-top:44px"><i class="fa-solid fa-code"></i> Skills</h2>
<div class="sk-grid">{skills}</div>
<h2 class="sec-title" style="margin-top:44px"><i class="fa-solid fa-graduation-cap"></i> Education</h2>
<div class="exp">{edu}</div>
<h2 class="sec-title" style="margin-top:44px"><i class="fa-solid fa-award"></i> Certifications &amp; training</h2>
<div class="cert-grid">{certs}</div>
<h2 class="sec-title" style="margin-top:44px"><i class="fa-solid fa-circle-info"></i> Additional</h2>
<div class="extra-grid">{extra}</div>
</div>
{EXP_JS}
{HERO_JS}
<div class="panel" data-panel="work" hidden>
<h2 class="sec-title">{ico("projects")} Selected work</h2>
{work_tab()}
</div>
</div>'''
    return page("profile", f"{NAME} · Profile", f"{NAME}: {TAGLINE}. {ROLE_NOW}. Laravel, NestJS, Kafka and agentic AI systems.", "", body, "profile")


def proj_card(t, d, tags, icon, badge, links, img, first=False):
    b = f'<span class="badge"><i class="fa-solid fa-arrow-trend-up"></i> {badge}</span>' if badge else ""
    lk = "".join(
        f'<a href="{u}" target="_blank" rel="noopener noreferrer" aria-label="{t} {k}"><i class="fa-brands fa-github"></i></a>' if k == "github"
        else f'<a href="{u}" target="_blank" rel="noopener noreferrer" aria-label="Ask for {t} demo access on WhatsApp" title="Demo access on WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>' if k == "whatsapp"
        else f'<a href="{u}" target="_blank" rel="noopener noreferrer" aria-label="Open {t}"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>'
        for k, u in links)
    tg = "".join(f'<span class="tag">{x}</span>' for x in tags)
    prim = links[0][1] if links else None
    cov_open = '<div class="proj-cover">'
    cov_close = '</div>'
    if prim:
        btn_label = ("Live Preview" if badge == "Live" else "Live Demo" if badge == "Live demo"
                     else "View Code" if links[0][0] == "github" else "View Project")
        btn_ico = '<i class="fa-solid fa-arrow-up-right-from-square"></i>'
        center_btn = (f'<a href="{prim}" target="_blank" rel="noopener noreferrer" class="proj-center-btn" aria-label="{btn_label} for {e(t)}">'
                      f'<span class="btn-ico">{btn_ico}</span>'
                      f'<span class="btn-text">{btn_label}</span>'
                      f'</a>')
    else:
        center_btn = ('<span class="proj-center-btn in-dev">'
                      '<span class="btn-ico"><i class="fa-solid fa-code"></i></span>'
                      '<span class="btn-text">In Development</span>'
                      '</span>')
    return (f'<article class="proj">'
              f'{cov_open}'
              # the first card's image is the page's largest paint (LCP): fetched early, not lazily
              f'<img src="{img}"{resp_img(img)} alt="{e(t)}" class="proj-img" {LCP_LOAD if first else 'loading="lazy"'} decoding="async">'
              f'<div class="proj-overlay"></div>'
              f'<canvas class="proj-dots-canvas"></canvas>'
              f'{b}'
              f'{center_btn}'
              f'{cov_close}'
              f'<div class="proj-body"><h3 aria-level="2">{e(t)}</h3><p>{e(d)}</p>'
              f'<div class="proj-foot"><div class="tag-row">{tg}</div><div class="proj-links">{lk}</div></div></div></article>')


def projects():
    cards = "".join(proj_card(*x, first=i == 0) for i, x in enumerate(PROJECTS))
    body = (f'<div class="pad"><p class="lead">Products I\'ve designed, built and shipped: NGO and ERP platforms, AI automation and web projects.</p>'
            f'<div class="grid2">{cards}</div></div>')
    return page("projects", "Projects", "Products and systems built by Mehedi Hasan: NGO ERP, Karbar ERP, SAWAB platforms, AI video engine and more.",
                "Projects", body, "projects")


# ------------------------------------------------------------------ LIBRARY
# Content lives in scripts/library_data.json (copied from nahian.bd/library as a starting point; edit that file, then rebuild).
LIB = json.loads((Path(__file__).resolve().parent / "library_data.json").read_text(encoding="utf-8"))
LIB_SUBS = [("skills", "AI Skills"), ("bookmarks", "Bookmarks"), ("music", "Watch & Listen")]
# a sub-page's address when it differs from its data key; the old addresses redirect (see main)
LIB_SLUG = {"music": "watch-listen"}


def lib_href(key):
    return LIB_SLUG.get(key, key)

LIB_SUB_ICON = {"skills": LIB["skills"]["icon"], "bookmarks": LIB["bookmarks"]["icon"],
                "music": LIB["music"]["icon"]}
NL_UI = {  # small UI glyphs not in the data file
    "out": '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M7 17 17 7M7 7h10v10"/>',
    "right": '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6"/>',
    "copy": '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></g>',
    "check": '<path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="m5 12 5 5L20 7"/>',
    "play": '<path fill="currentColor" d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.9-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14z"/>',
    "prev": '<path fill="currentColor" d="M6 5h2v14H6zM20 6.2v11.6a1 1 0 0 1-1.55.83L10 13.2a1.4 1.4 0 0 1 0-2.4l8.45-5.43A1 1 0 0 1 20 6.2z"/>',
    "next": '<path fill="currentColor" d="M16 5h2v14h-2zM4 6.2v11.6a1 1 0 0 0 1.55.83L14 13.2a1.4 1.4 0 0 0 0-2.4L5.55 5.37A1 1 0 0 0 4 6.2z"/>',
    "yt": '<path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6z"/>',
    "fb": '<path fill="currentColor" d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07"/>',
    "star": '<path fill="currentColor" d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z"/>',
    "link": '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/></g>',
    "trophy": '<path fill="currentColor" d="M17 3H7v2H3v3a4 4 0 0 0 4 4h.3A5 5 0 0 0 11 14.9V18H8v3h8v-3h-3v-3.1A5 5 0 0 0 16.7 12h.3a4 4 0 0 0 4-4V5h-4zM5 8V7h2v3a2 2 0 0 1-2-2zm14 0a2 2 0 0 1-2 2V7h2z"/>',
    "pen": '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    "books": '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4 4h4v16H4zM10 4h4v16h-4zM15.5 5.2l3.9-1 3.6 14.6-3.9 1z"/>',
    "wave": '<path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" d="M3 10v4M7 7v10M11 4v16M15 8v8M19 6v12"/>',
    "timer": '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5"/></g>',
    "spark": '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M11 3.5l1.9 4.8 4.8 1.9-4.8 1.9L11 17l-1.9-4.9-4.8-1.9 4.8-1.9zM18.5 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
    "radio": '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="11" r="2"/><path d="M12 13v8M8.5 7.5a5 5 0 0 0 0 7M15.5 7.5a5 5 0 0 1 0 7M5.6 4.6a9 9 0 0 0 0 12.8M18.4 4.6a9 9 0 0 1 0 12.8"/></g>',
    "mix": '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/></g>',
}


def nl_icon(name, size=18):
    if name in NL_UI:
        return f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" aria-hidden="true">{NL_UI[name]}</svg>'
    ic = LIB["icons"].get(name)
    return f'<svg width="{size}" height="{size}" viewBox="{ic["vb"]}" aria-hidden="true">{ic["body"]}</svg>' if ic else ""


def lib_counts():
    return {"skills": sum(len(g["items"]) for g in LIB["skills"]["groups"]),
            "bookmarks": next(f["count"] for f in LIB["bookmarks"]["filters"] if f["label"] == "All"),
            "music": len(LIB["music"]["tracks"]) + len(LIB["music"]["featured"]) + len(LIB["music"].get("learning", []))
                     + len(LIB["music"]["channels"])}


def yt_thumb(vid, q="mqdefault"):
    return f"https://i.ytimg.com/vi/{vid}/{q}.jpg"


def nl_head(key, title, sub, more=None, h="h2"):
    link = (f'<a class="nl-seeall" href="../library/{lib_href(key)}/">See all {more}{nl_icon("right", 15)}</a>' if more else "")
    return (f'<div class="nl-head"><span class="nl-tile">{nl_icon(LIB_SUB_ICON[key], 20)}</span>'
            f'<div class="nl-head-text"><{h}>{e(title)}</{h}><p>{e(sub)}</p></div>{link}</div>')


def nl_more(key, label):
    return f'<a class="nl-more" href="../library/{lib_href(key)}/">{e(label)}{nl_icon("right", 15)}</a>'


def nl_tabs(cur):
    c = lib_counts()
    items = [("", "All", "books", sum(c.values()))] + [(k, l, LIB_SUB_ICON[k], c[k]) for k, l in LIB_SUBS] + [("focus", "Focus", "wave", None)]
    lis = "".join(
        f'<li><a href="../library/{lib_href(k) + "/" if k else ""}"{" class=\"is-active\" aria-current=\"page\"" if k == cur else ""}>'
        f'{nl_icon(ic, 16)}<span>{e(l)}</span>{f"<b>{n}</b>" if n is not None else ""}</a></li>' for k, l, ic, n in items)
    return f'<div class="nl-tabs" role="navigation" aria-label="Library sections"><ul>{lis}</ul></div>'


def nl_skill_card(it, group, show_by):
    badge = f'<span class="nl-count"><i></i>{e(it["badge"])}</span>' if it.get("badge") else ""
    by = (f'<div class="nl-by"><img src="{group["avatar"]}" alt="" width="20" height="20" loading="lazy"><span>by {e(group["author"])}</span></div>'
          if show_by else "")
    return (f'<article class="nl-card"><div class="nl-card-head"><span class="nl-tile">{nl_icon(it["icon"], 20)}</span>'
            f'<div class="nl-card-title"><h3><a href="{it["url"]}" target="_blank" rel="noopener noreferrer"><code><span>/</span>{e(it["name"])}</code></a></h3>{by}</div>'
            f'{badge}<a class="nl-open" href="{it["url"]}" target="_blank" rel="noopener noreferrer" aria-label="Open {e(it["name"])}">{nl_icon("out", 18)}</a></div>'
            f'<p>{e(it["desc"])}</p>'
            f'<div class="nl-cmd"><code><span>$ </span>{e(it["cmd"])}</code>'
            f'<button type="button" class="nl-copy" data-copy="{e(it["cmd"])}" title="Copy" aria-label="Copy command">{nl_icon("copy", 16)}{nl_icon("check", 16)}</button></div></article>')


def nl_bm_card(it, cat):
    top = f'<span class="nl-top">{nl_icon("star", 12)}Top pick</span>' if it["top"] else ""
    kind = f'<span>{e(it["kind"])}</span>' if it["kind"] else ""
    return (f'<article class="nl-bm" data-cat="{e(cat)}"><a class="nl-bm-thumb" href="{it["url"]}" target="_blank" rel="noopener noreferrer" tabindex="-1">'
            f'<img src="{it["img"]}"{resp_img(it["img"])} alt="" loading="lazy" decoding="async"><span class="nl-bm-badges">{kind}{top}</span></a>'
            f'<div class="nl-bm-body"><h3><a href="{it["url"]}" target="_blank" rel="noopener noreferrer">{e(it["title"])}</a></h3><p>{e(it["desc"])}</p>'
            f'<p class="nl-domain">{nl_icon("link", 14)}<span>{e(it["domain"])}</span>{nl_icon("out", 15)}</p></div></article>')


def nl_feature(cat="Learn", first=False):
    f = LIB["bookmarks"]["feature"]
    badges = "".join(f'<span class="nl-top">{nl_icon("star", 12)}{e(b)}</span>' if b == "Top pick" else f'<span>{e(b)}</span>' for b in f["badges"])
    return (f'<div class="nl-feature" data-cat="{e(cat)}"><a class="nl-feature-img" href="{f["url"]}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-label="{e(f["title"])}">'
            f'<img src="{f["img"]}"{resp_img(f["img"])} alt="" {LCP_LOAD if first else 'loading="lazy"'} decoding="async"></a>'
            f'<div class="nl-feature-body"><p class="nl-badges">{badges}</p>'
            f'<h3>{e(f["title"])}</h3><p class="nl-feature-by">{e(f["by"])}</p><p>{e(f["desc"])}</p>'
            f'<a class="nl-cta" href="{f["url"]}" target="_blank" rel="noopener noreferrer">{e(f["cta"])}{nl_icon("out", 15)}</a></div></div>')


def nl_player(first_index=0):
    m = LIB["music"]
    av = {a["slug"]: a["avatar"] for a in m["artists"]}
    tracks = [dict(t, av=av.get(t["by"], "")) for t in m["tracks"]]
    t = tracks[first_index]
    return (f'<div class="nl-player" data-nl-player>'
            f'<div class="nl-screen"><img class="nl-screen-thumb" src="{yt_thumb(t["id"], "hqdefault")}" alt="" fetchpriority="high">'
            f'<button type="button" class="nl-play" data-nl-play aria-label="Play">{nl_icon("play", 30)}</button><div class="nl-frame"></div></div>'
            f'<div class="nl-player-bar"><img class="nl-player-av" src="{t["av"]}" alt="" width="48" height="48">'
            f'<div class="nl-player-meta"><p class="nl-upnext"><span class="nl-eq"><i></i><i></i><i></i><i></i></span><span data-nl-label>Up next</span></p>'
            f'<p class="nl-player-title">{e(t["title"])}</p><p class="nl-player-sub"><span>{e(t["sub"])}</span><span lang="ar" dir="rtl">{e(t.get("ar", ""))}</span></p></div>'
            f'<div class="nl-player-ctrl"><button type="button" data-nl-prev aria-label="Previous">{nl_icon("prev", 16)}</button>'
            f'<button type="button" data-nl-next aria-label="Next">{nl_icon("next", 16)}</button></div></div></div>')


def nl_track(i, t):
    ar = f'<span class="nl-ar" lang="ar" dir="rtl">{e(t["ar"])}</span>' if t.get("ar") else ""
    return (f'<li><button type="button" data-track="{i}"{" class=\"is-current\"" if i == 0 else ""}><span class="nl-n">{i + 1}</span>'
            f'<span class="nl-tthumb"><img src="{yt_thumb(t["id"])}" alt="" loading="lazy"><span>{nl_icon("play", 14)}</span></span>'
            f'<span class="nl-tmeta"><span>{e(t["title"])}</span><span>{e(t["sub"])}</span></span>{ar}</button></li>')


def nl_video(v):
    return (f'<div class="nl-vid"><div class="nl-vid-screen" data-yt="{v["id"]}"><img src="{yt_thumb(v["id"], "hqdefault")}" alt="" loading="lazy">'
            f'<button type="button" class="nl-play nl-play-sm" data-yt-play aria-label="Play: {e(v["title"])}">{nl_icon("play", 20)}</button></div>'
            f'<p>{e(v["title"])}</p></div>')


def nl_channel_card(c, big=False):
    return (f'<a class="nl-ch{" nl-ch-big" if big else ""}" href="{c["url"]}" target="_blank" rel="noopener noreferrer">'
            f'<img src="{c["avatar"]}" alt="" width="56" height="56" loading="lazy">'
            f'<span class="nl-ch-meta"><b>{e(c["name"])}</b><small>{e(c["handle"])}</small><span>{e(c["why"])}</span></span>'
            f'{"<span class=\"nl-ghost nl-ch-visit\">" + nl_icon("yt", 15) + "Visit channel</span>" if big else nl_icon("out", 16)}</a>')


def ch_key(c):
    return c.get("slug") or c["handle"].lstrip("@").lower()


def nl_channels():
    """Every channel Watch & Listen can play on its stage, An Nafee (the stage's own) first, with its tracks."""
    m = LIB["music"]
    a = m["artists"][0]
    av = {x["slug"]: x["avatar"] for x in m["artists"]}
    first = {"key": a["slug"], "name": a["name"], "url": a["channel"], "avatar": a["avatar"], "count": a["count"], "cat": "Quran",
             "tracks": [{"id": x["id"], "title": x["title"], "sub": x["sub"], "ar": x.get("ar", ""), "av": av.get(x["by"], "")} for x in m["tracks"]]}
    return [first] + [{"key": ch_key(c), "name": c["name"], "url": c["url"], "avatar": c["avatar"], "count": f'{len(c["videos"])} videos',
                       "cat": c["cat"], "tracks": [{"id": v["id"], "title": v["title"], "sub": c["name"], "av": c["avatar"]} for v in c["videos"]]}
                      for c in m["featured"] + m.get("learning", [])]


def nl_featured(c, up=False):
    return (f'<div class="nl-feat{" is-up" if up else ""}" data-cat="{e(c["cat"])}" data-ch="{ch_key(c)}">{nl_channel_card(c, big=True)}'
            f'<div class="nl-vids">{"".join(nl_video(v) for v in c["videos"])}</div></div>')


def nl_shelf(c):
    """Compact course shelf: one slim header line, then a sideways-scrolling row of small videos."""
    return (f'<div class="nl-shelf" data-cat="{e(c["cat"])}" data-ch="{ch_key(c)}"><div class="nl-shelf-head">'
            f'<img src="{c["avatar"]}" alt="" width="32" height="32" loading="lazy">'
            f'<div class="nl-shelf-id"><b>{e(c["name"])}</b><span>{e(c["why"])}</span></div>'
            f'<a class="nl-shelf-visit" href="{c["url"]}" target="_blank" rel="noopener noreferrer" aria-label="Visit {e(c["name"])} on YouTube">{nl_icon("yt", 14)}<span>Visit</span></a></div>'
            f'<div class="nl-shelf-row">{"".join(nl_video(v) for v in c["videos"])}</div></div>')


def library():
    c = lib_counts()
    o = LIB["overview"]
    secs = {s["title"]: s["sub"] for s in o["sections"]}
    stats = "".join(
        f'<a class="nl-stat" href="../library/{lib_href(k)}/"><span class="nl-stat-ico">{nl_icon(LIB_SUB_ICON[k], 20)}</span><b>{c[k]}</b><span>{e(l)}</span></a>'
        for k, l in LIB_SUBS)
    stats += (f'<a class="nl-stat nl-stat-focus" href="../library/focus/"><span class="nl-stat-ico">{nl_icon("wave", 20)}</span>'
              f'<b>Focus<i class="fx-live" aria-hidden="true"></i></b><span>Sounds &amp; a timer</span></a>')
    hero = (f'<div class="nl-hero"><span class="nl-pill"><i></i>{sum(c.values())} things I use, love and recommend</span>'
            f'<h2 class="nl-hero-title">{e(o["title"])}</h2><p>{e(o["intro"])}</p><div class="nl-stats">{stats}</div></div>')
    groups = LIB["skills"]["groups"]
    by_name = {it["name"]: (it, g) for g in groups for it in g["items"]}
    skills = "".join(nl_skill_card(*by_name[n], show_by=True) for n in o["skills"] if n in by_name)
    bm_all = {it["title"]: (it, sec["title"]) for sec in LIB["bookmarks"]["sections"] for it in sec["items"]}
    bms = "".join(nl_bm_card(*bm_all[n]) for n in o["bookmarks"] if n in bm_all)
    tracks = LIB["music"]["tracks"]
    tlist = "".join(nl_track(i, t) for i, t in enumerate(tracks[:6]))
    body = (f'<div class="pad nl-page">{hero}'
            f'<div class="nl-section">{nl_head("skills", "AI Skills", secs.get("AI Skills", ""), c["skills"])}'
            f'<div class="nl-grid">{skills}</div>{nl_more("skills", f"See all {c["skills"]} skills")}</div>'
            f'<div class="nl-section">{nl_head("bookmarks", "Bookmarks", secs.get("Bookmarks", ""), c["bookmarks"])}'
            f'{nl_feature()}<div class="nl-grid">{bms}</div>{nl_more("bookmarks", f"See all {c["bookmarks"]} links")}</div>'
            f'<div class="nl-section">{nl_head("music", "Watch & Listen", secs.get("Watch & Listen", ""), c["music"])}'
            f'{nl_player()}<ol class="nl-tracks">{tlist}</ol>'
            f'<div class="nl-ch-grid nl-ch-strip">{"".join(nl_channel_card(x) for x in LIB["music"]["featured"])}</div>'
            f'{nl_more("music", "Open Watch & Listen")}</div>'
            f'</div>{LIB_JS}')
    return page("library", "Library", "AI skills, bookmarks, and what I watch and listen to.",
                "Library", body, "library")


def library_sub(key):
    title = dict(LIB_SUBS)[key]
    d = LIB[key]
    head = nl_head(key, title, d["intro"], h="h2")
    if key == "skills":
        content = "".join(
            f'<div class="nl-group"><div class="nl-group-head"><img src="{g["avatar"]}" alt="" width="48" height="48" loading="lazy">'
            f'<div><h3>{e(g["author"])}</h3><p><a href="{g["handle_url"]}" target="_blank" rel="noopener noreferrer">{e(g["handle"])}</a><span> · </span>{e(g["count"])}</p></div>'
            + (f'<a class="nl-seeall" href="{g["more_url"]}" target="_blank" rel="noopener noreferrer">{e(g["more_label"])}{nl_icon("out", 15)}</a>' if g.get("more_url") else "")
            + f'</div><div class="nl-grid">{"".join(nl_skill_card(it, g, show_by=False) for it in g["items"])}</div></div>'
            for g in d["groups"])
    elif key == "bookmarks":
        chips = "".join(
            f'<button type="button" data-nl-filter="{e(f["label"])}"{" class=\"is-active\"" if f["label"] == "All" else ""}>'
            f'{nl_icon(f["icon"], 15)}<span>{e(f["label"])}</span><b>{f["count"]}</b></button>' for f in d["filters"])
        sections = "".join(
            f'<div class="nl-bm-sec" data-cat="{e(sec["title"])}"><div class="nl-bm-sec-head"><h3>{nl_icon(sec["icon"], 18)}{e(sec["title"])}</h3><p>{e(sec["desc"])}</p></div>'
            f'<div class="nl-grid">{"".join(nl_bm_card(it, sec["title"]) for it in sec["items"])}</div></div>'
            for sec in d["sections"])
        x = d["extensions"]
        fx = x.get("featured")  # optional: a highlighted extension above the list
        feat = ""
        if fx:
            links = "".join(
                f'<a class="{"nl-cta" if i == 0 else "nl-ghost"}" href="{l["url"]}" target="_blank" rel="noopener noreferrer">'
                f'{"" if i == 0 else "<i class=\"fa-brands fa-github\"></i>"}{e(l["label"])}{nl_icon("out", 14) if i == 0 else ""}</a>'
                for i, l in enumerate(fx["links"]))
            feat = (f'<div class="nl-ext-feature"><div class="nl-ext-feature-body"><div class="nl-ext-id"><img src="{fx["icon_img"]}" alt="" width="48" height="48" loading="lazy">'
                    f'<div><h4>{e(fx["name"])}</h4><span class="nl-tag">{e(fx["status"])}</span></div></div><p>{e(fx["desc"])}</p><div class="nl-ext-links">{links}</div></div>'
                    f'<a class="nl-ext-shot" href="{fx["links"][0]["url"]}" target="_blank" rel="noopener noreferrer" tabindex="-1"><img src="{fx["shot"]}" alt="" loading="lazy"></a></div>')
        ext_items = "".join(
            f'<li><a href="{it["url"]}" target="_blank" rel="noopener noreferrer"><span class="nl-ext-ico"><img src="{it["img"]}" alt="" width="40" height="40" loading="lazy"></span>'
            f'<span class="nl-ext-meta"><span>{e(it["name"])}</span><span>{e(it["desc"])}</span></span>{nl_icon("out", 16)}</a></li>' for it in x["items"])
        ext = (f'<div class="nl-ext" data-cat="Extensions"><div class="nl-ext-head">{nl_icon(x["icon"], 18)}<h3>{e(x["title"])}</h3><span class="nl-tag">{e(x["tag"])}</span></div>'
               f'{feat}<ul class="nl-ext-list">{ext_items}</ul></div>')
        content = f'<div class="nl-chips" role="group" aria-label="Filter bookmarks">{chips}</div>{nl_feature(first=True)}{sections}{ext}'
    elif key == "music":
        cats = d["categories"]
        count = {k: 0 for k in cats}
        count["Quran"] += 1  # the recitation player
        for x in d["featured"] + d.get("learning", []) + d["channels"]:
            count[x["cat"]] += 1
        chips = (f'<button type="button" data-nl-filter="All" class="is-active">{nl_icon("books", 15)}<span>All</span><b>{sum(count.values())}</b></button>'
                 + "".join(f'<button type="button" data-nl-filter="{e(k)}"><span>{e(k)}</span><b>{count[k]}</b></button>' for k in cats))
        a = d["artists"][0]
        # the stage: the channel at the top, with its player and track list. A video played from a channel card brings
        # that channel up, and An Nafee's card takes its place below (LIB_JS)
        quran = (f'<div class="nl-block nl-stage" data-cat="Quran" data-stage tabindex="-1" '
                 f'data-channels="{e(json.dumps(nl_channels(), ensure_ascii=False))}"><div class="nl-artist-head"><h3><img src="{a["avatar"]}" alt="" width="32" height="32" loading="lazy">'
                 f'{e(a["name"])}<span>{e(a["count"])}</span></h3><a href="{a["channel"]}" target="_blank" rel="noopener noreferrer">{nl_icon("yt", 16)}Channel</a></div>'
                 f'{nl_player()}<ol class="nl-tracks">{"".join(nl_track(i, t) for i, t in enumerate(d["tracks"]))}</ol></div>')
        nafee = dict(a, url=a["channel"], cat="Quran", videos=d["tracks"][:6])
        feats = f'<div class="nl-feats" data-feats>{nl_featured(nafee, up=True)}{"".join(nl_featured(x) for x in d["featured"])}</div>'
        learning = (f'<div class="nl-block nl-learn" data-cat="Learning"><div class="nl-learn-head"><span class="nl-tile">{nl_icon("tabler:school", 20)}</span>'
                    f'<div><h3>Learning</h3><p>Courses and lectures that match my stack: LLMs, agents, backend and system design.</p></div></div>'
                    f'{"".join(nl_shelf(x) for x in d.get("learning", []))}</div>' if d.get("learning") else "")
        groups = "".join(
            f'<div class="nl-block nl-cat" data-cat="{e(k)}"><h4 class="nl-cat-label">{e(k)}</h4>'
            f'<div class="nl-ch-grid">{"".join(nl_channel_card(x) for x in d["channels"] if x["cat"] == k)}</div></div>'
            for k in cats if any(x["cat"] == k for x in d["channels"]))
        content = (f'<div class="nl-chips" role="group" aria-label="Filter channels">{chips}</div>{quran}'
                   f'<h3 class="nl-block-title nl-gap" data-cat="All-only">My top channels</h3>{feats}{learning}'
                   f'<div class="nl-learn-head nl-more-head" data-cat="All-only"><span class="nl-tile">{nl_icon("tabler:headphones", 20)}</span>'
                   f'<div><h3>More channels I follow</h3><p>Grouped by topic. Tap any channel to open it on YouTube.</p></div></div>{groups}')
    body = f'<div class="pad nl-page">{nl_tabs(key)}<div class="nl-section">{head}{content}</div></div>{LIB_JS}'
    html_out = page(f"library/{lib_href(key)}", f"{title} · Library", d["intro"], "Library", body, "library")
    if key == "music":   # the player's YouTube thumbnail is the page's largest paint: open the connection to its host early
        html_out = html_out.replace("</head>", '<link rel="preconnect" href="https://i.ytimg.com">\n</head>', 1)
    return two_deep(html_out)


def fx_head(icon, title, sub):
    return (f'<div class="nl-head"><span class="nl-tile">{nl_icon(icon, 20)}</span>'
            f'<div class="nl-head-text"><h2>{e(title)}</h2><p>{e(sub)}</p></div></div>')


# tab icons drawn in parts, so they can move while their tab plays: the bars bounce, the radio's waves go out
FX_TAB_ICONS = {
    "sounds": '<svg class="fx-tab-ico fx-ico-bars" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">'
              '<line x1="3" y1="10" x2="3" y2="14"/><line x1="7" y1="7" x2="7" y2="17"/><line x1="11" y1="4" x2="11" y2="20"/>'
              '<line x1="15" y1="8" x2="15" y2="16"/><line x1="19" y1="6" x2="19" y2="18"/></g></svg>',
    "radio": '<svg class="fx-tab-ico fx-ico-radio" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
             '<circle cx="12" cy="11" r="2"/><path d="M12 13v8"/><path class="fx-w1" d="M8.5 7.5a5 5 0 0 0 0 7M15.5 7.5a5 5 0 0 1 0 7"/>'
             '<path class="fx-w2" d="M5.6 4.6a9 9 0 0 0 0 12.8M18.4 4.6a9 9 0 0 1 0 12.8"/></g></svg>',
}


def library_focus():
    fa = lambda n: f'<i class="fa-solid fa-{n}" aria-hidden="true"></i>'
    stage = (f'<div class="fx-stage" role="region" aria-labelledby="fx-title-h">'
             f'<div class="fx-scenes" data-scenes data-sizes="(max-width: 767px) 100vw, 1120px" aria-hidden="true"></div>'
             f'<canvas class="fx-viz" id="fx-viz-canvas" hidden aria-hidden="true"></canvas>'
             f'<div class="fx-stage-in">'
             f'<p class="fx-state" id="fx-state">Ready to play</p><h2 class="fx-title" id="fx-title-h"><span id="fx-title">Focus</span></h2>'
             # the line and the radio chip are there before the script fills them, so the controls below never jump
             f'<p class="fx-about" id="fx-about">&nbsp;</p>'
             f'<div class="fx-now-chips" id="fx-now-chips"><button type="button" class="fx-now-chip fx-qr" data-random '
             f'title="A live recitation, by a reciter picked at random (R)">{fa("tower-broadcast")}<span>Quran radio</span></button></div>'
             f'<p class="fx-quote">{fa("quote-left")}<span id="fx-quote"></span>'
             f'<button type="button" class="fx-quote-next" id="fx-quote-next" aria-label="Show another line" title="Another line">{fa("rotate")}</button></p>'
             f'<p class="fx-viz-name" id="fx-stage-viz-name" aria-live="polite"></p>'
             f'<div class="fx-ctrls">'
             f'<button type="button" class="fx-glass fx-step" id="fx-prev" aria-label="Previous mix" title="Previous">{fa("backward-step")}</button>'
             f'<button type="button" class="fx-play" id="fx-play" aria-label="Play (Space)">{fa("play")}</button>'
             f'<button type="button" class="fx-glass fx-step" id="fx-next" aria-label="Next mix" title="Next">{fa("forward-step")}</button>'
             f'<button type="button" class="fx-glass fx-side" id="fx-shuffle" aria-label="Shuffle: a surprise mix" title="Shuffle">{fa("shuffle")}</button>'
             f'<button type="button" class="fx-glass fx-side" id="fx-expand" aria-label="Open the focus view" title="Focus view (V)">{fa("expand")}</button>'
             f'<button type="button" class="fx-glass fx-side" id="fx-stage-viz" aria-pressed="false" aria-label="Visualizer" title="Visualizer">{fa("wand-magic-sparkles")}</button>'
             f'<div class="fx-stage-mix" id="fx-stage-mix"><button type="button" class="fx-glass fx-mixbtn" id="fx-mixbtn" aria-controls="fx-mixer" hidden>'
             f'{fa("sliders")}<b id="fx-mixcount"></b></button></div></div>'
             f'<div class="fx-presets-wrap" id="fx-presets-wrap">'
             f'<div class="fx-presets-bar">'
             f'<button type="button" class="fx-presets-pill" id="fx-presets-pill" aria-expanded="false" aria-controls="fx-presets">'
             f'{fa("layer-group")}<span class="fx-presets-lbl">Presets</span>'
             f'<span class="fx-presets-dot">·</span><span class="fx-presets-cur" id="fx-presets-cur">Deep focus</span>'
             f'{fa("chevron-down fx-presets-arr")}</button>'
             f'<div class="fx-keys"><span class="fx-keys-list" id="fx-keys-list" hidden>'
             f'<span><kbd>Space</kbd>play</span><span><kbd>P</kbd><kbd>N</kbd>skip</span><span><kbd>T</kbd>timer</span><span><kbd>R</kbd>radio</span>'
             f'<span><kbd>[</kbd><kbd>]</kbd>visual</span><span><kbd>V</kbd>view</span><span><kbd>F</kbd>full</span><span><kbd>M</kbd>mute</span></span>'
             f'<button type="button" class="fx-keys-btn" id="fx-keys-btn" aria-expanded="false" aria-controls="fx-keys-list">'
             f'{fa("keyboard")}<span>Shortcuts</span>{fa("chevron-right fx-keys-arr")}</button></div></div>'
             f'<div class="fx-chips" id="fx-presets" role="group" aria-label="Ready-made mixes"></div></div>'
             f'<button type="button" class="fx-more" id="fx-more">{fa("chevron-down")}<span>Timer, sounds and radio</span></button></div></div>')
    body = (f'<div class="pad nl-page fx-page">{nl_tabs("focus")}{stage}'
            f'<div class="fx-timer" id="fx-timer" role="group" aria-label="Focus timer"></div>'
            # the sounds and the Quran radio share one place, as tabs: each a tap away, each with the full width
            f'<div class="fx-lib" id="fx-lib"><div class="fx-libtabs-wrap"><div class="fx-libtabs" role="tablist" aria-label="Sounds and Quran radio">'
            + "".join(f'<button type="button" role="tab" class="fx-libtab" id="fx-tab-{k}" data-tab="{k}" aria-controls="fx-panel-{k}" aria-selected="false" tabindex="-1">'
                      f'{ic}<span>{label}</span><b data-count="{k}"></b></button>'
                      for k, ic, label in (("sounds", FX_TAB_ICONS["sounds"], "Sounds"), ("radio", FX_TAB_ICONS["radio"], '<span class="fx-tab-q">Quran </span>radio')))
            + f'</div></div>'
            f'<div class="fx-panel" role="tabpanel" id="fx-panel-sounds" aria-labelledby="fx-tab-sounds">'
            f'<p class="fx-panel-lead">Layer any of them and set each volume. The photo follows the mix.</p>'
            f'<div class="fx-tools"><div class="fx-rail" id="fx-cats" role="navigation" aria-label="Sound categories"></div>'
            f'<label class="fx-search">{fa("magnifying-glass")}'
            f'<input type="search" id="fx-search" placeholder="Search sounds" aria-label="Search sounds" autocomplete="off"></label></div>'
            f'<div class="fx-groups" id="fx-groups"></div><p class="fx-empty" id="fx-empty" hidden></p></div>'
            f'<div class="fx-panel" role="tabpanel" id="fx-panel-radio" aria-labelledby="fx-tab-radio" hidden>'
            f'<div class="fx-radio" id="fx-radio"></div></div></div>'

            f'<div class="fx-foot"><div class="fx-foot-row"><span class="fx-foot-backup" id="fx-backup"></span>'
            f'<button type="button" class="fx-text-btn" id="fx-credits-btn" aria-expanded="false" aria-controls="fx-credits-body">'
            f'{fa("circle-info")}<span>Credits</span>{fa("chevron-down fx-credits-arr")}</button></div>'
            f'<div class="fx-credits-body" id="fx-credits-body" hidden></div></div>'
            f'<div class="fx-dock" id="fx-dock"></div>'
            f'</div>{LIB_JS}<script src="../focus/focus-page.js?v=35" defer></script>')
    html_out = page("library/focus", "Focus · Library", "Ambient sounds, Quran radio and a focus timer that keep playing while you browse.",
                    "Library", body, "library", show_rail=False)
    return two_deep(html_out)


LIB_JS = """<script>
(function () {
  // cards glow where the pointer is, like the cards elsewhere on the site
  var SEL = '.nl-hero, .nl-feature, .nl-stat, .nl-card, .nl-bm, .nl-tile, .nl-ch';
  // the light eases after the pointer instead of jumping, so the movement reads clearly
  function follow(c) {
    if (c._raf) return;
    (function step() {
      c._x += (c._tx - c._x) * 0.18; c._y += (c._ty - c._y) * 0.18;
      c.style.setProperty('--gx', c._x.toFixed(1) + 'px'); c.style.setProperty('--gy', c._y.toFixed(1) + 'px');
      c._raf = (Math.abs(c._tx - c._x) > 0.4 || Math.abs(c._ty - c._y) > 0.4) ? requestAnimationFrame(step) : null;
    })();
  }
  document.addEventListener('pointermove', function (ev) {
    var c = ev.target.closest && ev.target.closest(SEL);
    if (!c) return;
    var r = c.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top;
    if (c._x === undefined || !c.matches(':hover')) { c._x = x; c._y = y; }
    c._tx = x; c._ty = y; follow(c);
  }, { passive: true });
  document.addEventListener('pointerover', function (ev) {
    var c = ev.target.closest && ev.target.closest(SEL);
    if (!c || c.contains(ev.relatedTarget)) return;
    var r = c.getBoundingClientRect();
    c._x = c._tx = ev.clientX - r.left; c._y = c._ty = ev.clientY - r.top; follow(c);
  }, { passive: true });
})();

(function () {
  function iframe(id) {
    return '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0" title="YouTube video player" ' +
           'allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
  }
  var player = document.querySelector("[data-nl-player]");
  /* Watch & Listen's stage: the channel at the top, with this player and its track list. A video played from a channel
     card brings that channel up, and the one there comes down: An Nafee's card takes the raised card's place in My top
     channels (or the top of it, for a Learning channel); the others go back to their own place */
  var stage = document.querySelector("[data-stage]");
  var channels = stage ? JSON.parse(stage.getAttribute("data-channels")) : [];
  var onStage = channels.length ? channels[0].key : "";
  var tracks = channels.length ? channels[0].tracks : [];
  var cur = 0, playing = false;
  var playIcon = stage ? stage.querySelector(".nl-tthumb > span").innerHTML : "";
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function channel(key) { return channels.filter(function (c) { return c.key === key; })[0]; }
  function find(id) {
    for (var k = 0; k < channels.length; k++) {
      var i = channels[k].tracks.findIndex(function (x) { return x.id === id; });
      if (i >= 0) return { ch: channels[k], i: i };
    }
    return null;
  }
  function raise(key) {
    var ch = channel(key), up = document.querySelector('[data-ch="' + key + '"]');
    if (!ch || !up || key === onStage) return;
    var head = stage.querySelector(".nl-artist-head");
    head.querySelector("h3").innerHTML = '<img src="' + esc(ch.avatar) + '" alt="" width="32" height="32">' + esc(ch.name) + "<span>" + esc(ch.count) + "</span>";
    head.querySelector("a").href = ch.url;
    stage.setAttribute("data-cat", ch.cat);
    stage.querySelector(".nl-tracks").innerHTML = ch.tracks.map(function (x, i) {
      return '<li><button type="button" data-track="' + i + '"><span class="nl-n">' + (i + 1) + '</span><span class="nl-tthumb">' +
        '<img src="https://i.ytimg.com/vi/' + x.id + '/mqdefault.jpg" alt="" loading="lazy"><span>' + playIcon + '</span></span>' +
        '<span class="nl-tmeta"><span>' + esc(x.title) + "</span><span>" + esc(x.sub) + "</span></span>" +
        (x.ar ? '<span class="nl-ar" lang="ar" dir="rtl">' + esc(x.ar) + "</span>" : "") + "</button></li>";
    }).join("");
    tracks = ch.tracks;
    var feats = document.querySelector("[data-feats]"), down = document.querySelector('[data-ch="' + onStage + '"]');
    if (down) down.classList.remove("is-up");
    up.classList.add("is-up");
    var first = feats.querySelector('[data-ch="' + channels[0].key + '"]');
    if (key !== channels[0].key) feats.insertBefore(first, up.parentNode === feats ? up : feats.firstChild);
    onStage = key;
    // rows that were hidden measured nothing: their position dots and edge fades are worked out again
    [first, down].forEach(function (c) { if (c) c.querySelectorAll(".nl-vids, .nl-shelf-row").forEach(function (r) { r.dispatchEvent(new Event("scroll")); }); });
  }
  /* to the stage, clear of the page's top bars, so the video that just started is in view; from the keyboard, focus
     follows (the card that was pressed has just gone) */
  function toStage(keyboard) {
    // the sticky bar's resting place, not where it is now: on phones the nav slides away while the page scrolls
    var nav = document.querySelector("body > nav"), bar = document.querySelector(".sub-header-bar");
    var cover = Math.max(nav ? nav.offsetHeight : 0, bar ? (parseFloat(getComputedStyle(bar).top) || 0) + bar.offsetHeight : 0);
    var y = stage.getBoundingClientRect().top + scrollY - cover - 12;
    scrollTo({ top: Math.max(0, y), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    if (keyboard) stage.focus({ preventScroll: true });
  }
  function setTrack(i, play) {
    if (!player) return;
    cur = i; var t = tracks[i];
    player.querySelector(".nl-player-title").textContent = t.title;
    var sub = player.querySelectorAll(".nl-player-sub span");
    sub[0].textContent = t.sub || ""; sub[1].textContent = t.ar || "";
    if (t.av) player.querySelector(".nl-player-av").src = t.av;
    player.querySelector(".nl-screen-thumb").src = "https://i.ytimg.com/vi/" + t.id + "/hqdefault.jpg";
    document.querySelectorAll("[data-track]").forEach(function (b) { b.classList.toggle("is-current", +b.getAttribute("data-track") === i); });
    if (play) {
      playing = true;
      if (window.TubeDock) { window.TubeDock.play(dockTracks(), i); return; }   /* plays in this screen, and keeps playing on other pages */
      player.querySelector(".nl-frame").innerHTML = iframe(t.id);
      player.classList.add("is-playing");
      try { localStorage.setItem("lib:last", JSON.stringify({ id: t.id, title: t.title, sub: t.sub || "", at: Date.now() })); } catch (e) {}
    }
  }
  /* the dock sits in whichever page stays loaded, so its avatars need full addresses */
  function dockTracks() {
    return tracks.map(function (x) { return { id: x.id, title: x.title, sub: x.sub || "", av: x.av ? new URL(x.av, location.href).href : "" }; });
  }
  function docked() { return window.TubeDock && window.TubeDock.state().open; }
  var playSvg = player ? player.querySelector("[data-nl-play]").innerHTML : "";
  var pauseSvg = '<svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>';
  /* the dock's video sits in this screen while the page is in view; the big player follows the dock (its track, and
     whether it plays); then a ?play=<video id> link starts that track */
  function followDock() {
    if (!player || !window.TubeDock) return;
    var dockApi = window.TubeDock, screen = player.querySelector(".nl-screen"), label = player.querySelector("[data-nl-label]");
    var sync = function () {
      var st = dockApi.state();
      var at = st.track ? tracks.findIndex(function (x) { return x.id === st.track.id; }) : -1;
      /* the dock plays another channel's video (back from another page): that channel is the one up on the stage */
      if (st.open && st.track && at < 0) { var hit = find(st.track.id); if (hit) { raise(hit.ch.key); at = hit.i; } }
      var on = st.open && at >= 0;
      player.classList.toggle("is-docked", on);
      player.classList.toggle("is-dock-playing", on && st.playing);
      player.querySelector("[data-nl-play]").innerHTML = on && st.playing ? pauseSvg : playSvg;
      label.textContent = on ? (st.playing ? "Now playing" : "Paused") : "Up next";
      if (on && at !== cur) setTrack(at, false);
      playing = on && st.playing;
    };
    var off = dockApi.on(sync);
    dockApi.slot(screen);
    sync();
    /* in Focus's frame the dock outlives this page: it lets go of the screen and stops listening when the page closes */
    addEventListener("pagehide", function () { dockApi.unslot(screen); off(); });
    addEventListener("pageshow", function (ev) { if (ev.persisted) { off = dockApi.on(sync); dockApi.slot(screen); sync(); } });
    var asked = new URLSearchParams(location.search).get("play");
    var want = asked ? find(asked) : null;
    if (want) { raise(want.ch.key); setTrack(want.i, true); player.scrollIntoView({ block: "center" }); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", followDock); else followDock();
  /* horizontal chip rows (tabs + bookmark filters) */
  var rows = document.querySelectorAll(".nl-chips, .nl-tabs ul, .nl-shelf-row, .nl-vids");
  function fade(row) {
    row.classList.toggle("fade-l", row.scrollLeft > 4);
    row.classList.toggle("fade-r", row.scrollLeft + row.clientWidth < row.scrollWidth - 4);
  }
  function center(el, smooth) {
    var row = el.closest(".nl-chips, .nl-tabs ul");
    if (!row) return;
    var left = el.offsetLeft - (row.clientWidth - el.offsetWidth) / 2;
    row.scrollTo({ left: Math.max(0, left), behavior: smooth ? "smooth" : "instant" });   // "auto" would follow the row's smooth scrolling
  }
  rows.forEach(function (row) {
    row.addEventListener("scroll", function () { fade(row); }, { passive: true });
    row.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      var max = row.scrollWidth - row.clientWidth;
      if (max <= 0 || (e.deltaY < 0 && row.scrollLeft <= 0) || (e.deltaY > 0 && row.scrollLeft >= max - 1)) return;
      e.preventDefault();
      row.scrollLeft += e.deltaY;
    }, { passive: false });
    var active = row.querySelector(".is-active");
    if (active) center(active, false);
    fade(row);
  });
  // the active tab is measured again once the web fonts have widened the tabs, and after a resize
  function settle() {
    rows.forEach(function (row) { var a = row.querySelector(".is-active"); if (a) center(a, false); fade(row); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(settle);
  var resizeT = 0;
  window.addEventListener("resize", function () { clearTimeout(resizeT); resizeT = setTimeout(settle, 120); });

  /* position dots under sideways video rows (shown on phones only, via CSS) */
  document.querySelectorAll(".nl-vids, .nl-shelf-row").forEach(function (row) {
    var cards = row.children; if (cards.length < 2) return;
    var dots = document.createElement("div"); dots.className = "nl-dots"; dots.setAttribute("aria-hidden", "true");
    for (var i = 0; i < cards.length; i++) {
      var b = document.createElement("button"); b.type = "button"; b.tabIndex = -1;
      (function (n) { b.addEventListener("click", function () { row.scrollTo({ left: cards[n].offsetLeft - cards[0].offsetLeft, behavior: "smooth" }); }); })(i);
      dots.appendChild(b);
    }
    row.insertAdjacentElement("afterend", dots);
    function sync() {
      var step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 1;
      var max = row.scrollWidth - row.clientWidth;
      var n = row.scrollLeft >= max - 4 ? cards.length - 1 : Math.round(row.scrollLeft / step);
      [].forEach.call(dots.children, function (d, k) { d.classList.toggle("is-on", k === n); });
    }
    row.addEventListener("scroll", sync, { passive: true }); sync();
  });

  document.addEventListener("click", function (ev) {
    var t = ev.target;
    if (!t || !t.closest) return;
    var copy = t.closest(".nl-copy");
    if (copy) {
      var text = copy.getAttribute("data-copy");
      var done = function () { copy.classList.add("is-copied"); setTimeout(function () { copy.classList.remove("is-copied"); }, 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done); }
      else { var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); done(); }
      return;
    }
    var f = t.closest("[data-nl-filter]");
    if (f) {
      var cat = f.getAttribute("data-nl-filter");
      document.querySelectorAll("[data-nl-filter]").forEach(function (b) { b.classList.toggle("is-active", b === f); });
      center(f, true);
      document.querySelectorAll(".nl-page [data-cat]").forEach(function (el) {
        el.hidden = !(cat === "All" || el.getAttribute("data-cat") === cat);
      });
      return;
    }
    var vp = t.closest("[data-yt-play]");
    if (vp) {
      var scr = vp.closest("[data-yt]"), card = vp.closest("[data-ch]");
      if (stage && card && channel(card.getAttribute("data-ch"))) {   /* on the stage's big player, not in the small card */
        raise(card.getAttribute("data-ch"));
        setTrack(Math.max(0, tracks.findIndex(function (x) { return x.id === scr.getAttribute("data-yt"); })), true);
        toStage(ev.detail === 0);
        return;
      }
      scr.innerHTML = iframe(scr.getAttribute("data-yt")); scr.classList.add("is-playing"); return;
    }
    var tr = t.closest("[data-track]");
    if (tr) { setTrack(+tr.getAttribute("data-track"), true); return; }
    if (t.closest("[data-nl-play]")) { if (docked()) window.TubeDock.toggle(); else setTrack(cur, true); return; }
    if (t.closest("[data-nl-prev]")) { if (docked()) window.TubeDock.prev(); else setTrack((cur - 1 + tracks.length) % tracks.length, playing); return; }
    if (t.closest("[data-nl-next]")) { if (docked()) window.TubeDock.next(); else setTrack((cur + 1) % tracks.length, playing); return; }
  });
})();
</script>"""


def people():
    cards, counts = "", {}
    for ini, name, handle, plat, url, bio, why, tags in PEOPLE:
        counts[plat] = counts.get(plat, 0) + 1
        tg = "".join(f'<span class="tag">{t}</span>' for t in tags)
        btn = (f'<a class="btn btn-secondary btn-sm" href="{url}" target="_blank" rel="noopener noreferrer">Follow <i class="fa-solid fa-arrow-up-right-from-square"></i></a>'
               if url else '<span class="tag role">Reference</span>')
        quote = f'<p class="why"><i class="fa-solid fa-quote-left"></i> {e(why)}</p>' if why else ""
        cards += (f'<article class="person" data-platform="{plat}"><div class="p-head"><span class="av p-img" style="background-image:url({ini})"><span class="plat">{badge_svg(plat)}</span></span>'
                  f'<div class="p-id"><b>{e(name)}</b><small>{e(handle)} &middot; {plat}</small></div>{btn}</div>'
                  f'<p>{e(bio)}</p>{quote}<div class="tag-row">{tg}</div></article>')
    fl = f'<button class="fchip" data-filter="all" aria-pressed="true">All<em>{len(PEOPLE)}</em></button>' + "".join(
        f'<button class="fchip" data-filter="{k}" aria-pressed="false">{badge_svg(k)} {k}<em>{v}</em></button>' for k, v in counts.items())
    avs = "".join(f'<span class="av p-img" style="width:34px;height:34px;font-size:12px;margin-left:-8px;box-shadow:0 0 0 2px var(--surface);background-image:url({p[0]});background-size:cover;background-position:center;"></span>' for p in PEOPLE[:6])
    hero = (f'<section class="people-hero" data-halo>{nahian_aurora_html()}<div class="av-stack">{avs}</div><h2>People I learn from</h2>'
            f'<p>Builders, founders and teachers whose work keeps me sharp, plus the mentors who guided me. Filter by where I follow them.</p>'
            f'<span class="meta"><i class="fa-solid fa-user-group"></i> {len(PEOPLE)} people &middot; {len(counts)} platforms</span></section>')
    body = (f'<div class="pad">{hero}<div class="filters" role="group" aria-label="Filter by platform">{fl}</div>'
            f'<div class="people">{cards}</div></div>')
    return page("people", "People", "People Mehedi Hasan learns from: NestJS, Laravel and AI builders, plus academic mentors.",
                "People", body, "people")


def contact():
    reach = [("fa-solid fa-envelope", "Email", MAIL, f"mailto:{MAIL}"),
             ("fa-brands fa-whatsapp", "WhatsApp", "+880 1799-447594", WA),
             ("fa-brands fa-linkedin", "LinkedIn", "in/mehedi-hasan-2859383b4", LI),
             ("fa-brands fa-github", "GitHub", "@MehediHasan228", GH),
             ("fa-solid fa-globe", "Portfolio", "mehedi.pro.bd", SITE),
             ("fa-solid fa-file-pdf", "Curriculum vitae", "Download PDF", "../uploads/Mehedi_Hasan_CV.pdf")]
    rc = "".join(f'<a class="reach-card" href="{u}" target="_blank" rel="noopener noreferrer"><span class="svc-ico"><i class="{i}"></i></span>'
                 f'<span class="l"><b>{t}</b><small>{h}</small></span><i class="fa-solid fa-arrow-up-right-from-square arr"></i></a>'
                 for i, t, h, u in reach)
    body = f'''<div class="pad">
<section class="cta-hero" data-halo>{nahian_aurora_html()}<h2>Let's build something</h2><p>Have a project, a role or just a question? Pick whatever's easiest and I'll get back to you.</p>
<div class="cta-row"><span class="pill"><span class="dot"></span> Open to new conversations</span><span class="pill">{ico("pin","")} Dhaka, GMT+6 &middot; <span data-time></span></span></div></section>
<h2 class="work-title">Work with me</h2>
<div class="svc">
<div class="svc-card wide" data-halo>{nahian_aurora_html()}<span class="svc-ico"><i class="fa-solid fa-rocket"></i></span><div class="svc-body"><h3>Build something together</h3>
<p>Founders and teams with ambitious products: I take features from idea to production with agentic engineering, from backend architecture and event-driven services to polished UI and AI workflows.</p>
<a class="btn btn-primary" href="mailto:{MAIL}?subject=Project%20inquiry">Let's talk <i class="fa-solid fa-arrow-right"></i></a></div></div>
<div class="svc-card"><span class="svc-ico"><i class="fa-solid fa-briefcase"></i></span><h3>Full-time role</h3><p>Immediately available for a full-time software developer or AI automation role. Dhaka, open to on-site and hybrid.</p>
<a class="btn btn-secondary" href="mailto:{MAIL}?subject=Job%20opportunity">Discuss a role <i class="fa-solid fa-arrow-right"></i></a></div>
<div class="svc-card"><span class="svc-ico"><i class="fa-regular fa-lightbulb"></i></span><h3>Paid consultation</h3><p>Architecture advice, code reviews and performance fixes for your NestJS, Laravel or AI-powered system.</p>
<a class="btn btn-secondary" href="mailto:{MAIL}?subject=Consultation">Book a consultation <i class="fa-solid fa-arrow-right"></i></a></div>
<div class="svc-card"><span class="svc-ico"><i class="fa-solid fa-video"></i></span><h3>1:1 call</h3><p>Career chats, mentoring, or a second opinion on what you're building.</p>
<a class="btn btn-secondary" href="{WA}?text=Hi%20Mehedi%2C%20I%27d%20like%20to%20book%20a%20call." target="_blank" rel="noopener noreferrer">Book a call <i class="fa-solid fa-arrow-right"></i></a></div>
</div>
<h2 class="work-title">Reach me</h2>
<div class="reach">{rc}</div>
<h2 class="work-title">Send a message</h2>
<form class="form" action="https://formspree.io/f/mwvrbjke" method="POST">
<input type="hidden" name="_subject" value="Portfolio message"><input type="hidden" name="_next" value="{SITE}/contact_process.html">
<input type="text" name="name" placeholder="Your name" required aria-label="Your name">
<input type="email" name="email" placeholder="Your email" required aria-label="Your email">
<textarea name="message" rows="4" placeholder="How can I help?" required aria-label="Message"></textarea>
<button type="submit" class="btn btn-primary" style="justify-self:start">Send message</button></form>
</div>'''
    return page("contact", "Contact", "Hire Mehedi Hasan for AI automation, ERP and distributed systems work. Based in Dhaka, Bangladesh.",
                "Contact", body, "contact", show_open=False)


CSS_VER = "0"  # set in main() from the stylesheet content, so browsers never reuse a stale copy


# ------------------------------------------------------------------ HOME DASHBOARD
# Under the home page's hero, a mission-control summary of every page: headline figures, then one tile per page whose
# chart is drawn here from the same data as that page (projects, jobs, skills, people, library), so the home stays in
# step with the pages it points to. build_pages.py places it; paths are from the site root.
DASH_SHORT = {"SAWAB Bangladesh": "SAWAB", "Jibika Intelligic Ltd.": "Jibika", "Smart Software Limited": "Smart Software",
              "HBIZZ Group Company": "HBIZZ", "Tafseerul Quran Foundation (TQF)": "TQF"}
DASH_TOOLS = 5   # tools the Stack tile shows per area
DASH_AREA = {"Core stack": "Core", "AI & agents": "AI", "AI-assisted development": "AI dev",
             "Data & streaming": "Data", "Infra & observability": "Infra"}
# the dashboard's script: reveals and counts once in view, runs the loops only while seen, and the projects,
# stack, career and library interactions
DASH_JS = '<script src="./dash.js?v=18" defer></script>'


def home_dashboard():
    import math

    def root(path):  # these pages sit one level down; the home page is at the root
        return "./" + path[3:] if path.startswith("../") else path

    def head(icon_svg, title, meta=""):
        meta = f'<span class="dash-meta">{meta}</span>' if meta else ""
        return f'<div class="dash-head"><span class="dash-ico">{icon_svg}</span><h3>{e(title)}</h3>{meta}</div>'

    def more(href, text):
        return f'<a class="dash-more" href="{href}">{e(text)}{nl_icon("right", 15)}</a>'

    def has_site(links):
        return any(k == "link" for k, _ in links)

    def month(ym):
        return ym[0] * 12 + ym[1] - 1

    # headline figures: experience and projects counted here, the Jibika figures read from its bullets
    spans = [job_span(j[3]) for j in JOBS]
    first, now = min(s for s, _ in spans), max(t for _, t in spans)
    live = sum(has_site(p[5]) for p in PROJECTS)
    tools = sum(len(core) + len(also) for _, _, core, also in SKILLS)
    bullets = " ".join(pt for j in JOBS for pt in j[5])
    kpis = [(duration_label(first, now), "of experience"), (str(len(PROJECTS)), f"projects, {live} live")]
    m = re.search(r"(\d[\d,]*\+) companies", bullets)
    if m:
        kpis.append((m.group(1), "companies on Jibika Plexus"))
    m = re.search(r"(~\d+%)", bullets)
    if m:
        kpis.append((m.group(1), "less manual work with LLMs"))
    kpis.append((str(tools), "tools in the stack"))
    kpi_tile = ('<div class="dash-tile dash-kpis">' + "".join(
        f'<div class="dash-kpi"><b>{e(v)}</b><span>{e(lbl)}</span></div>' for v, lbl in kpis) + '</div>')

    # projects: live share as a ring, kinds as bars, and the first three
    circ = 2 * math.pi * 44
    ring = (f'<div class="dash-ring"><svg viewBox="0 0 100 100" aria-hidden="true">'
            f'<circle class="dash-ring-track" cx="50" cy="50" r="44"/>'
            f'<circle class="dash-ring-arc" cx="50" cy="50" r="44" style="--arc:{circ * live / len(PROJECTS):.1f};--circ:{circ:.1f}"/>'
            f'</svg><span><b>{live}<small>/{len(PROJECTS)}</small></b>live</span></div>')
    kinds = Counter(k for p in PROJECTS for k in WORK_META.get(p[0], ("", None, []))[2])
    bars = "".join(f'<li><button type="button" class="dash-bar" data-kind="{e(k)}" aria-pressed="false">'
                   f'<span>{e(k)}</span><i><u style="--w:{n / len(PROJECTS) * 100:.0f}%"></u></i><b>{n}</b></button></li>'
                   for k, n in kinds.most_common())
    feats = ""
    for idx, (title, desc, tags, icon, badge, links, img) in enumerate(PROJECTS):
        kinds_of = " ".join(WORK_META.get(title, ("", None, []))[2])
        small = img.replace(".webp", "-640.webp")
        src = root(small if (DOCS / small[3:]).exists() else img)
        status = badge or ("Live" if has_site(links) else "On GitHub")
        feats += (f'<li data-kinds="{e(kinds_of)}"><a href="./projects/" tabindex="-1">'
                  f'<img src="{src}" alt="" width="320" height="200" loading="lazy" decoding="async">'
                  f'<span class="dash-glass"><b>{e(title)}</b><span class="dash-pill">{e(status)}</span>'
                  f'<span class="dash-kinds">{e(" · ".join(WORK_META.get(title, ("", None, []))[2]))}</span></span></a></li>')
    projects = (f'<article class="dash-tile dash-projects" id="projects">{head(ico("projects"), "Projects", "by status and kind")}'
                f'<div class="dash-proj-chart">{ring}<ul class="dash-bars" aria-label="Projects by kind: choose one to see them">{bars}</ul></div>'
                f'<ul class="dash-flow" tabindex="0" aria-roledescription="carousel" aria-label="All projects">{feats}</ul>'
                f'<div class="dash-proj-foot">{more("./projects/", f"See all {len(PROJECTS)} projects")}'
                f'<div class="dash-feat-nav"><span class="dash-feat-count" aria-live="polite">1 / {len(PROJECTS)}</span>'
                f'<button type="button" class="dash-nav is-prev" data-dir="-1" aria-label="Previous projects">{nl_icon("right", 16)}</button>'
                f'<button type="button" class="dash-nav" data-dir="1" aria-label="Next projects">{nl_icon("right", 16)}</button>'
                f'</div></div></article>')

    # career: each role on a timeline from the first job to now, full-time on one track and volunteering below
    start, total = month(first), month(now) + 1 - month(first)

    def seg(period, cls, label):
        s, t = job_span(period)
        left = (month(s) - start) / total * 100
        width = (month(t) + 1 - month(s)) / total * 100
        return f'<i class="dash-seg {cls}" data-k="{cls}" style="left:{left:.2f}%;width:{width:.2f}%" title="{e(label)}"></i>'

    full = sorted((j for j in JOBS if j[4] == "Full-time"), key=lambda j: job_span(j[3]))
    track = "".join(seg(j[3], f"s{i}", DASH_SHORT.get(j[1], j[1])) for i, j in enumerate(full))
    vol = "".join(seg(j[3], "sv", DASH_SHORT.get(j[1], j[1])) for j in JOBS if j[4] == "Volunteer")
    ticks = "".join(f'<span style="left:{(month((y, 1)) - start) / total * 100:.2f}%">{y}</span>'
                    for y in range(first[0] + 1, now[0] + 1))
    legend = ""
    rows = [(f"s{i}", j) for i, j in enumerate(full)][::-1] + [("sv", j) for j in JOBS if j[4] == "Volunteer"]
    for cls, (title, comp, place, period, kind, pts, chips) in rows:
        s, t = job_span(period)
        now_pill = '<span class="dash-pill">Now</span>' if period.endswith("Present") else ""
        legend += (f'<li data-k="{cls}"><i class="{cls}"></i><span><b>{e(DASH_SHORT.get(comp, comp))}</b> {e(title)}</span>'
                   f'<em>{e(duration_label(s, t))}</em>{now_pill}</li>')
    career = (f'<article class="dash-tile dash-career">{head(ico("profile"), "Career", e(duration_label(first, now)))}'
              f'<div class="dash-timeline" aria-hidden="true"><div class="dash-track">{track}</div>'
              f'<div class="dash-track is-vol">{vol}</div><div class="dash-ticks">{ticks}</div></div>'
              f'<ul class="dash-legend">{legend}</ul>{more("./profile/", "View profile")}</article>')

    # stack: tools per area as a radar
    areas = [(DASH_AREA.get(g, g), len(c) + len(a)) for g, _, c, a in SKILLS]
    top, cx, cy, rad = max(n for _, n in areas), 130, 98, 62

    def poly(scale):
        return " ".join(f"{cx + rad * scale(i) * math.cos(math.radians(-90 + i * 360 / len(areas))):.1f},"
                        f"{cy + rad * scale(i) * math.sin(math.radians(-90 + i * 360 / len(areas))):.1f}" for i in range(len(areas)))
    grid = "".join(f'<polygon class="dash-radar-grid" points="{poly(lambda i, k=k: k)}"/>' for k in (1 / 3, 2 / 3, 1))
    axes, labels = "", ""
    for i, (name, n) in enumerate(areas):
        ang = math.radians(-90 + i * 360 / len(areas))
        axes += f'<line x1="{cx}" y1="{cy}" x2="{cx + rad * math.cos(ang):.1f}" y2="{cy + rad * math.sin(ang):.1f}"/>'
        anchor = "middle" if abs(math.cos(ang)) < 0.3 else ("start" if math.cos(ang) > 0 else "end")
        labels += (f'<text class="dash-radar-label" data-area="{i}" x="{cx + (rad + 14) * math.cos(ang):.1f}" y="{cy + (rad + 14) * math.sin(ang):.1f}" '
                   f'text-anchor="{anchor}">{e(name)} <tspan>{n}</tspan></text>')
    sweep = (f'<g class="dash-sweep"><path d="M{cx} {cy} L{cx} {cy - rad} A{rad} {rad} 0 0 1 '
             f'{cx + rad * math.sin(math.radians(40)):.1f} {cy - rad * math.cos(math.radians(40)):.1f} Z"/></g>')
    spokes = "".join(f'<line class="dash-spoke" data-area="{i}" x1="{cx}" y1="{cy}" '
                     f'x2="{cx + rad * math.cos(math.radians(-90 + i * 360 / len(areas))):.1f}" '
                     f'y2="{cy + rad * math.sin(math.radians(-90 + i * 360 / len(areas))):.1f}"/>' for i in range(len(areas)))
    # a dot on the shape's corner for each area; the chosen area's glows
    dots = "".join(f'<circle class="dash-vertex" data-area="{i}" r="3.5" '
                   f'cx="{cx + rad * n / top * math.cos(math.radians(-90 + i * 360 / len(areas))):.1f}" '
                   f'cy="{cy + rad * n / top * math.sin(math.radians(-90 + i * 360 / len(areas))):.1f}"/>' for i, (_, n) in enumerate(areas))
    radar = (f'<svg class="dash-radar" viewBox="0 0 260 196" role="img" aria-label="Tools per area: '
             + ", ".join(f"{e(nm)} {n}" for nm, n in areas) + f'">{grid}<g class="dash-radar-axes">{axes}</g>{sweep}'
             f'<polygon class="dash-radar-shape" points="{poly(lambda i: areas[i][1] / top)}"/>{spokes}{dots}{labels}</svg>')
    pick = max(range(len(areas)), key=lambda i: areas[i][1])
    area_btns = "".join(f'<button type="button" class="dash-area" data-area="{i}" aria-pressed="{str(i == pick).lower()}">'
                        f'{e(nm)} <b>{n}</b></button>' for i, (nm, n) in enumerate(areas))
    # every area shows the same number of tools (its daily ones first, then the rest), and the panels share one place,
    # so the tile keeps one height while the areas take turns
    panels = ""
    for i, (group, use, core, also) in enumerate(SKILLS):
        chips, tools_all = "", core + also
        shown, rest = tools_all[:DASH_TOOLS], tools_all[DASH_TOOLS:]
        for label, slug in shown:
            src = icon_src(slug) if slug else None
            im = f'<img src="{root(src)}" alt="" width="14" height="14" loading="lazy" decoding="async">' if src else ""
            # a tool asks the site's AI how it is used (dash.js); the AI answers from the site's own pages
            chips += (f'<button type="button" class="dash-tool" data-ask="{e(label)}" title="Ask my AI how I use {e(label)}">'
                      f'{im}{e(label)}</button>')
        if rest:
            chips += f'<span class="dash-tool is-more" title="{e(", ".join(lbl for lbl, _ in rest))}">+{len(rest)} more</span>'
        panels += (f'<div class="dash-area-tools" data-area="{i}"' + ('' if i == pick else ' hidden') + '>'
                   f'<p>{e(use)}</p>{chips}</div>')
    stack = (f'<article class="dash-tile dash-stack">{head(ico("badge"), "Stack", f"{tools} tools")}{radar}'
             f'<div class="dash-areas" role="group" aria-label="Areas of the stack">{area_btns}</div><div class="dash-area-panels">{panels}</div>'
             f'<p class="dash-ask-hint"><i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i>Tap a tool to ask my AI how I use it</p>'
             f'{more("./profile/", "See every tool")}</article>')

    # people: faces in orbit around the count
    shown = PEOPLE[:8]
    orbit = "".join(f'<span class="dash-sat" style="--a:{i * 360 / len(shown):.0f}deg"><img src="{root(p[0])}" alt="" '
                    f'width="34" height="34" loading="lazy" decoding="async" title="{e(p[1])}"></span>' for i, p in enumerate(shown))
    people = (f'<article class="dash-tile dash-people">{head(ico("people"), "People")}'
              f'<div class="dash-orbit"><div class="dash-orbit-ring">{orbit}</div><span class="dash-orbit-core"><b>{len(PEOPLE)}</b>people</span></div>'
              f'<p class="dash-text">Builders and teachers I learn from, from Laravel to LangGraph.</p>'
              f'{more("./people/", f"See all {len(PEOPLE)} people")}</article>')

    # library: the three shelves as one split bar
    counts = lib_counts()
    whole = sum(counts.values())
    split = "".join(f'<i class="l{i}" data-k="l{i}" style="--w:{counts[k] / whole * 100:.1f}%"></i>' for i, (k, _) in enumerate(LIB_SUBS))
    shelves = "".join(f'<li data-k="l{i}"><a href="./library/{lib_href(k)}/"><i class="l{i}"></i>{e(label)}<b>{counts[k]}</b></a></li>'
                      for i, (k, label) in enumerate(LIB_SUBS))
    # a small Watch & Listen player: the track shown is the last one played (dash.js), or the first; play opens the
    # video in the tile (YouTube asks that it stays visible), and the arrows step through the tracks. Moving bars before
    # the title say it plays; the words stay for screen readers
    avatars = {a["slug"]: a["avatar"] for a in LIB["music"]["artists"]}
    mini = [{"id": x["id"], "title": x["title"], "sub": x.get("sub", ""), "av": root(avatars.get(x.get("by"), ""))}
            for x in LIB["music"]["tracks"]]
    first = mini[0]
    listen = (f'<div class="dash-yt" data-yt-mini data-tracks="{e(json.dumps(mini, ensure_ascii=False))}">'
              f'<div class="dash-yt-screen" hidden></div><div class="dash-yt-bar">'
              f'<img data-yt-av src="{e(first["av"] or yt_thumb(first["id"]))}" alt="" width="46" height="46" loading="lazy" decoding="async">'
              f'<span class="dash-np-text"><em data-yt-label>Up next</em><span class="dash-yt-line">'
              f'<span class="dash-np-eq" aria-hidden="true"><i></i><i></i><i></i></span><b data-yt-title>{e(first["title"])}</b></span>'
              f'<span data-yt-sub>{e(first["sub"])}</span></span><span class="dash-yt-ctrl">'
              f'<button type="button" data-yt="prev" aria-label="Previous track"><i class="fa-solid fa-backward-step"></i></button>'
              f'<button type="button" data-yt="toggle" class="is-main" aria-label="Play"><i class="fa-solid fa-play"></i></button>'
              f'<button type="button" data-yt="next" aria-label="Next track"><i class="fa-solid fa-forward-step"></i></button>'
              f'</span></div></div>')
    library = (f'<article class="dash-tile dash-library">{head(ico("library"), "Library", f"{whole} items")}'
               f'<p class="dash-text">AI skills, bookmarks, and what I watch and listen to.</p>'
               f'<div class="dash-split" aria-hidden="true">{split}</div><ul class="dash-shelves">{shelves}</ul>'
               f'{listen}{more("./library/", "Open the library")}</article>')

    # focus
    wave = "".join(f'<rect x="{i * 9}" y="{30 - h}" width="5" height="{2 * h}" rx="2.5" style="--i:{i}"/>'
                   for i, h in enumerate((6, 12, 20, 14, 24, 18, 9, 16, 26, 20, 11, 22, 15, 8, 18, 24, 13, 7, 17, 21, 10, 14, 6, 11)))
    # focus: the mix's scene as a stage (with the wave and a small presets chip on it), the Focus page's controls, and the
    # way to the Focus page; dash.js runs them from the Focus player and fills in what plays
    focus = (f'<article class="dash-tile dash-focus">'
             f'{head(nl_icon("wave", 18), "Focus", '<span data-fp-label>Ready to play</span>')}'
             f'<div class="dash-fp-stage"><img data-fp-art alt="" width="400" height="250" hidden>'
             f'<svg class="dash-wave" viewBox="0 0 212 60" aria-hidden="true">{wave}</svg>'
             f'<span class="dash-fp-info"><b data-fp-title>Focus</b><span data-fp-sub>Ambient sounds and Quran radio</span></span></div>'
             f'<div class="dash-fp" data-fp hidden><div class="dash-fp-ctrl">'
             f'<button type="button" data-fp-act="prev" aria-label="Previous mix"><i class="fa-solid fa-backward-step"></i></button>'
             f'<button type="button" data-fp-act="toggle" class="is-main" aria-label="Play"><i class="fa-solid fa-play"></i></button>'
             f'<button type="button" data-fp-act="next" aria-label="Next mix"><i class="fa-solid fa-forward-step"></i></button>'
             f'<button type="button" data-fp-act="shuffle" aria-label="Shuffle: a surprise mix"><i class="fa-solid fa-shuffle"></i></button>'
             f'</div><div class="dash-fp-picks">'
             # each chip, while what it chose plays, gets an off button joined to it
             f'<span class="dash-fp-pickwrap" data-pickwrap="mix"><label class="dash-fp-pick" data-pick="mix"><i class="fa-solid fa-layer-group"></i>'
             f'<span>Presets</span><i class="fa-solid fa-chevron-down"></i><select data-fp-presets aria-label="Presets: ready-made mixes"></select></label>'
             f'<button type="button" class="dash-fp-off" data-off="mix" aria-label="Turn the sounds off" title="Turn the sounds off" hidden>'
             f'<i class="fa-solid fa-xmark"></i></button></span>'
             f'<span class="dash-fp-pickwrap" data-pickwrap="radio"><label class="dash-fp-pick" data-pick="radio"><i class="fa-solid fa-tower-broadcast"></i>'
             f'<span>Quran radio</span><i class="fa-solid fa-chevron-down"></i><select data-fp-radio aria-label="Quran radio: choose a reciter"></select></label>'
             f'<button type="button" class="dash-fp-off" data-off="radio" aria-label="Turn the radio off" title="Turn the radio off" hidden>'
             f'<i class="fa-solid fa-xmark"></i></button></span>'
             f'</div></div>'
             f'<p class="dash-text">Ambient sounds, Quran radio and a focus timer that keep playing while you browse.</p>'
             f'<a class="dash-btn" href="./library/focus/" data-fp-open>{nl_icon("play", 14)}<span>Start a focus session</span></a></article>')

    contact = (f'<article class="dash-tile dash-contact" id="contact"><div class="dash-contact-text">'
               f'<span class="dash-status"><i></i>Open to freelance &amp; full-time</span>'
               f'<h3>Have an ERP, HR or AI project in mind?</h3>'
               f'<p class="dash-text">Tell me what you need. I work from Dhaka (GMT+6), remote-first.</p></div>'
               f'<div class="dash-actions"><a class="dash-btn" href="{WA}" target="_blank" rel="noopener noreferrer">'
               f'<i class="fa-brands fa-whatsapp"></i>Message on WhatsApp</a>'
               f'<a class="dash-btn is-ghost" href="mailto:{MAIL}"><i class="fa-solid fa-envelope"></i>Email me</a>'
               f'<a class="dash-btn is-ghost" href="./contact/">Contact form</a></div></article>')

    return (f'\n    <section id="overview" class="dash-section">'
            f'<div class="dash-top"><div class="section-title pf-title"><h2>{ico("home")}At a glance</h2></div>'
            f'<p class="dash-live"><i></i>Available for work &middot; Dhaka <time data-dash-clock>GMT+6</time></p></div>'
            f'<div class="dash-grid">{kpi_tile}{projects}{career}{stack}{people}{library}{focus}{contact}</div>'
            f'{DASH_JS}</section>\n')


def main():
    global CSS_VER
    css = scope_css((DOCS / "nx" / "nx.css").read_text(encoding="utf-8")) + SCOPED_FIX
    (DOCS / "nx" / "nx.scoped.css").write_text(css, encoding="utf-8")
    CSS_VER = hashlib.md5(css.encode("utf-8")).hexdigest()[:10]
    pages = [("profile", profile), ("projects", projects), ("people", people),
             ("contact", contact), ("library", library)]
    pages += [(f"library/{lib_href(k)}", (lambda k=k: library_sub(k))) for k, _ in LIB_SUBS]
    pages += [("library/focus", library_focus)]
    for slug, fn in pages:
        out = DOCS / slug / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(fn(), encoding="utf-8")
        print("wrote", out.relative_to(ROOT))
    for old, new in LIB_SLUG.items():   # shared links to the old address keep working, ?play= included
        out = DOCS / "library" / old / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(redirect_page(f"../{new}/", f"{SITE}/library/{new}/", dict(LIB_SUBS)[old]), encoding="utf-8")
        print("wrote", out.relative_to(ROOT), "(redirect)")


def redirect_page(to, canonical, title):
    return (f'<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8"><title>{e(title)} · Library | {NAME}</title>\n'
            f'<meta name="robots" content="noindex"><link rel="canonical" href="{canonical}">\n'
            f'<meta http-equiv="refresh" content="0; url={to}">\n'
            f'<script>location.replace("{to}" + location.search + location.hash);</script></head>\n'
            f'<body><p>This page has moved to <a href="{to}">{e(title)}</a>.</p></body></html>\n')


if __name__ == "__main__":
    main()
