#!/usr/bin/env python3
"""Generate the nahian.bd-style pages: /profile /projects /writing /people /contact.

Run: python3 scripts/build_nx_pages.py
Edit the DATA section below to change content.
"""
import html
import json
import re
import sys
from pathlib import Path

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
TAGLINE = "Full-Stack Web Developer & AI Automation Engineer"
ROLE_NOW = "Software Developer at SAWAB Bangladesh"
ABOUT = [
    "Full-Stack Software Engineer with 4+ years of hands-on experience architecting high-performance web applications "
    "and scalable APIs. Core expertise spans modern TypeScript, React, and Next.js on the frontend, paired with robust "
    "NestJS and PHP / Laravel backend microservices. Proven track record delivering everything from custom platforms and "
    "WordPress / WooCommerce solutions to complex, event-driven distributed systems.",
    "An AI-native engineer who leverages state-of-the-art LLM workflows (Claude, OpenAI, Gemini) to accelerate engineering "
    "velocity without sacrificing code hygiene. Actively building multi-agent automation systems using LangGraph, MCP, and "
    "retrieval-augmented workflows (PGVector), backed by Kafka event streaming and Docker containerisation.",
    "Currently leading development for SAWAB Bangladesh's digital web platforms and architecting an AI-native NGO ERP spanning "
    "85+ planned modules. Strong grasp of enterprise IT, VAPT security, and clean documentation—driven to build reliable software fast.",
]
AI_TOOLS = [("Claude", "claude", "#d97757"), ("OpenAI", "openai", "#10a37f"), ("Gemini", "gemini", "#3186ff"),
            ("Antigravity", "antigravity", "#3186ff"), ("Ollama", "ollama", "#9a9897")]
STACK = [("Laravel", "laravel"), ("PHP", "php"), ("NestJS", "nestjs"), ("TypeScript", "typescript"), ("Next.js", "nextjs"),
         ("React", "react"), ("PostgreSQL", "postgresql"), ("MySQL", "mysql"), ("Redis", "redis"),
         ("Kafka", "apachekafka"), ("LangGraph", "langgraph"), ("Docker", "docker"), ("Kubernetes", "kubernetes"),
         ("n8n", "n8n")]
# (title, company, place, period, current?, [bullets], [chips])
JOBS = [
    ("Software Developer, Web Platforms & NGO ERP", "SAWAB Bangladesh", "Dhaka, Bangladesh", "Jul 2026 - Present", True,
     ["Build and maintain SAWAB Bangladesh's public web platforms (sawabbd.org, sawabfoundation.org.bd) on Node.js / "
      "React: donation pipelines, bilingual (Bangla/English) content, and program pages for education, healthcare and WASH initiatives.",
      "Design and develop an AI-native NGO ERP: NestJS microservices, Kafka event streaming, Redis, PGVector-based "
      "retrieval and LangGraph multi-agent workflows, planned across 85+ modules; currently in active development."],
     ["Node.js", "React", "NestJS", "Kafka", "PGVector", "LangGraph"]),
    ("Software Developer & AI Technology Specialist", "Jibika Intelligic Ltd.", "Dhaka, Bangladesh",
     "Jan 2025 - Jun 2026", False,
     ["Developed, tested and deployed PHP / Laravel and WordPress web applications across the full SDLC: custom themes, "
      "plugins, responsive UIs (HTML5, CSS3, JavaScript, Bootstrap) and REST APIs for a diverse client base.",
      "Integrated third-party and LLM APIs (OpenAI, Claude, Gemini) to automate content, research and reporting workflows, "
      "reducing manual effort by approximately 50%.",
      "Designed and maintained relational databases (MySQL / PostgreSQL) and managed Linux / cPanel hosting, deployments, "
      "backups and uptime monitoring.",
      "Provided full-cycle IT support, managed organisational social media and authored technical documentation, product guides and SOPs."],
     ["Laravel", "WordPress", "LLM APIs", "MySQL", "PostgreSQL"]),
    ("Software Developer, ERP Technology", "Smart Software Limited", "Dhaka, Bangladesh", "Jan 2024 - Dec 2024", False,
     ["Built and demonstrated PHP & JavaScript ERP web modules (HRIS / Payroll, School Management, Hospital Management) "
      "for prospective institutional clients; gathered requirements and prepared SRS / BRD and UAT documentation.",
      "Performed module testing, bug tracking and defect fixing throughout the SDLC and supported client onboarding, "
      "configuration and end-user training.",
      "Delivered day-to-day IT support, system debugging and hardware troubleshooting for 20+ concurrent users across departments."],
     ["PHP", "JavaScript", "ERP", "SRS / BRD", "UAT"]),
    ("Documentation & IT Executive", "HBIZZ Group Company", "Karwan Bazar, Dhaka", "Aug 2022 - Dec 2023", False,
     ["Provided IT support across hardware, software, networking and connectivity; maintained IT assets, user accounts and system documentation.",
      "Enforced data security through access control, secure document handling and scheduled system backups.",
      "Developed and maintained the corporate website (hbizz.com) on WordPress with cPanel hosting configuration and performance monitoring."],
     ["WordPress", "cPanel", "IT support", "Security"]),
    ("Voluntary Web Developer", "Tafseerul Quran Foundation (TQF)", "Bangladesh", "2024 - Present", True,
     ["Build and maintain the official TQF website (tqfbd.org) on WordPress: custom theme configuration, plugin management, "
      "security patching, performance optimisation and a mobile-responsive layout for a national non-profit audience.",
      "Collaborate with the TQF team on digital-outreach strategy and social-media integration."],
     ["WordPress", "Volunteer", "Non-profit"]),
]
METRICS = [("4+", "years building software"), ("85+", "modules planned in the NGO ERP"),
           ("~50%", "less manual effort via LLM automation"), ("20+", "users supported day to day")]
EDUCATION = [("B.Sc. in Computer Science & Engineering", "Daffodil International University (DIU), Dhaka",
              "CGPA 3.11 / 4.00 · Graduated 2022")]
CERTS = [("Web Development: HTML, CSS, JavaScript & Advanced React (6 months)", "SR Institute of Design"),
         ("Cybersecurity Training: VAPT", "Security Mind Pro"),
         ("Google AI Essentials: Generative AI, Prompt Engineering & Responsible AI", "Google / Coursera"),
         ("AI Tools & Automation: ChatGPT, Gemini, Claude, OpenClaw", "Professional Development"),
         ("B2B Lead Generation", "BITM")]
SKILLS = [
    ("Languages", ["PHP", "JavaScript / TypeScript", "Python", "SQL", "HTML5 / CSS3", "C# / .NET Core (working)"]),
    ("Frameworks & CMS", ["Laravel", "NestJS", "Node.js / Express", "React", "Next.js", "Vue.js", "WordPress / WooCommerce",
                          "Tailwind CSS", "Bootstrap 5"]),
    ("Databases", ["MySQL", "PostgreSQL", "MongoDB", "Firebase", "Redis", "PGVector"]),
    ("AI & APIs", ["OpenAI / Claude / Gemini APIs", "LangGraph", "MCP", "RAG", "FastAPI", "Whisper", "REST & WebSocket"]),
    ("DevOps & Cloud", ["Git & GitHub", "CI/CD", "Docker", "Kubernetes", "AWS EC2 / S3", "Kafka / RabbitMQ", "Linux", "Nginx / Apache"]),
    ("IT & Security", ["Networking (LAN/WAN)", "Microsoft 365 admin", "VAPT", "Backup & recovery", "CCTV / ELV"]),
]
EXTRA = [("Leadership & Community", "President, Gobindopur Rising Tigers Club: led a 100+ member community organisation across "
                                    "social-development, youth mentorship, and public communications initiatives."),
         ("Philosophy & R&D", "Passionate about autonomous agent architectures, local LLM inference, and building "
                              "developer tools that maximize flow state and engineering velocity."),
         ("Voluntary Work", "Technical contributor for community websites and open-source non-profit initiatives.")]
# (title, description, tags, icon, badge, [links])
PROJECTS = [
    ("AI-Native NGO ERP", "Distributed humanitarian ERP with NestJS microservices, Kafka event streaming, PGVector RAG, "
     "Redis locks and LangGraph multi-agents. Planned across 85+ modules; in active development.",
     ["NestJS", "Kafka", "PGVector", "LangGraph"], "fa-sitemap", "85+ modules", [("github", GH + "/ai-native-ngo-erp")],
     "../ngo_erp_dashboard.jpg"),
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
     "../hr_payroll_dashboard.jpg"),
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
    ("https://nahian.bd/_astro/ahmed-shamim-hassan-shaon.BIgVFP6s_Z1hpCVE.webp", "Ahmed Shamim Hassan Shaon", "@me_shaon", "X", "https://x.com/me_shaon", "CEO of Megaminds Learning, software architect and Laravel contributor", "My mentor and the senior brother everyone wants by their side. I admire him the most.", ["Tech"]),
    ("https://nahian.bd/_astro/mohammad-emran-hasan.B3Wat4fb_2rMcEN.webp", "Mohammad Emran Hasan", "@phpfour", "X", "https://x.com/phpfour", "Building SaaS at klasio.com and helping teams ship Laravel products at figlab.io", "The guru of gurus, with extensive experience behind every tip.", ["Tech"]),
    ("https://nahian.bd/_astro/hm-nayem.Ds5mCNNA_Z8zyPc.webp", "HM Nayem", "@mrhm-dev", "GitHub", "https://github.com/mrhm-dev", "Founder of Stack Learner, full-stack developer and trainer", "Founder of Stack Learner, full-stack developer and trainer", ["Tech"]),
    ("https://nahian.bd/_astro/muntaser-muttaqi.kNFzAuiZ_ZVBNB4.webp", "Muntaser Muttaqi", "@iammuttaqi", "GitHub", "https://github.com/iammuttaqi", "Software engineer at GymScanner and Laravel enthusiast", "A great person to follow", ["Tech"]),
    ("https://nahian.bd/_astro/mehbub-rashid-rabu.M5BbTgk6_1L2swT.webp", "Mehbub Rashid Rabu", "/mehbub.rashid.2025", "Facebook", "https://www.facebook.com/mehbub.rashid.2025", "Web developer focused on Node.js, React, WordPress, chatbots and automations", "A great person to follow", ["Tech"]),
    ("https://nahian.bd/_astro/jeffrey-way.DplsT5Lt_1zBnpr.webp", "Jeffrey Way", "@jeffrey_way", "X", "https://x.com/jeffrey_way", "Founder of Laracasts", "A great person to follow", ["Tech"]),
    ("https://nahian.bd/_astro/povilas-korop.B8T32WAI_Z1P9Xzs.webp", "Povilas Korop", "@LaravelDaily", "YouTube", "https://www.youtube.com/@LaravelDaily", "Laravel Daily: practical Laravel tips every day", "A great person to follow", ["Tech"]),
    ("https://nahian.bd/_astro/taylor-otwell.DsnKVGqJ_Z1ssXEe.webp", "Taylor Otwell", "@taylorotwell", "X", "https://x.com/taylorotwell", "Creator of Laravel", "A great person to follow", ["Tech"]),
    ("https://nahian.bd/_astro/caleb-porzio.DgSGKaNa_21RW5D.webp", "Caleb Porzio", "@calebporzio", "X", "https://x.com/calebporzio", "Creator of Livewire and Alpine.js", "A great person to follow", ["Tech"]),
    ("https://avatars.githubusercontent.com/u/5457236?v=4", "Nuno Maduro", "@enunomaduro", "X", "https://x.com/enunomaduro", "Laravel core team, creator of Pest", "A great person to follow", ["Tech"]),
]
PLATFORM_ICON = {"X": "fa-brands fa-twitter", "Website": "fa-solid fa-globe", "GitHub": "fa-brands fa-github",
                 "Mentor": "fa-solid fa-graduation-cap", "Facebook": "fa-brands fa-facebook", "YouTube": "fa-brands fa-youtube"}

from icons import P, ico, BOTTOM_NAV, bottom_nav
NAV = [("profile", "Profile"), ("projects", "Projects"), ("writing", "Writing"), ("people", "People"),
       ("contact", "Contact")]
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


def rail(show_open=True, show_top=False):
    openc = ('''<div class="r-card r-card-open">
      <div class="r-status-pill">
        <span class="live-dot-wrap">
          <span class="live-dot-ping"></span>
          <span class="live-dot-core"></span>
        </span>
        <span class="r-status-label">Available for work</span>
      </div>
      <h3 class="r-card-title">Open to new conversations</h3>
      <p class="r-card-desc">AI automation engineer & full-stack builder. Always happy to talk products, collaborations and consultations.</p>
      <a class="r-cta-btn" href="../contact/">
        <span>Let's talk</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="r-btn-arrow"><path d="M5 12h14m-6-6l6 6-6 6"/></svg>
      </a>
    </div>''' if show_open else "")

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

    rail_top_html = (f'<div class="rail-top"><a class="btn-rail-top" href="{GH}" target="_blank" rel="noopener noreferrer">'
                     f'<span class="git-icon-wrap"><i class="fa-brands fa-github"></i></span>'
                     f'<span>Follow on GitHub</span>'
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
            f'</div></aside>')


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
            '<div class="absolute inset-0" data-slats-canvas style="position:absolute;inset:0;opacity:0;transition:opacity .7s;"></div>'
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
  border-bottom: 1px solid var(--line);
  background: color-mix(in srgb, var(--bg) 92%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
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
  border-bottom: 1px solid var(--line);
  background: color-mix(in srgb, var(--bg) 94%, transparent) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
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
  transition: opacity 0.7s ease;
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
.status-dot { position: absolute; bottom: -2px; right: -2px; width: 14px; height: 14px; background: #10b981; border: 2px solid var(--bg); border-radius: 50%; }
.exp-line { flex: 1; width: 2px; background: var(--line); margin-top: 8px; margin-bottom: 8px; min-height: 40px; }
.exp-item-modern:last-child .exp-line { display: none; }
.exp-content { flex: 1; padding-bottom: 40px; }
.exp-item-modern:last-child .exp-content { padding-bottom: 0; }
.exp-header-row { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; margin-bottom: 6px; flex-wrap: wrap; }
.exp-header-row h3 { font-size: 19px; font-weight: 700; color: var(--ink); margin: 0; }
.exp-date { font-size: 15px; color: var(--ink-3); font-weight: 500; white-space: nowrap; }
.exp-sub { font-size: 16px; color: var(--ink-2); margin-bottom: 16px; font-weight: 500; }
.exp-bullets { list-style: disc; padding-left: 20px; margin: 0 0 16px 0; display: flex; flex-direction: column; gap: 10px; }
.exp-bullets li { font-size: 15px; color: var(--ink-2); line-height: 1.6; }
.exp-tech { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.chip-solid { background: var(--surface-2); color: var(--ink-2); padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; border: 1px solid var(--line); }

/* Floating Controls (Theme, Sound, WhatsApp) & AI Widget */
body.nx-page #leaderboard-widget {
  display: none !important;
}

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
}
.nx .proj:hover {
  transform: translateY(-4px);
  box-shadow: inset 0 0 0 1px rgba(var(--brand-rgb, 0, 242, 254), .8), 0 20px 40px -20px rgba(var(--brand-rgb, 0, 242, 254), .45);
}
.nx .proj-cover {
  position: relative;
  height: 195px;
  border-radius: 20px;
  overflow: hidden;
  background: #090e17;
  display: block;
  text-decoration: none;
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
.nx .proj:hover .proj-img {
  transform: scale(1.05);
  filter: brightness(0.4);
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
.nx .proj:hover .proj-overlay {
  opacity: 1;
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
.nx .proj:hover .proj-dots-canvas {
  opacity: 1;
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
  z-index: 5;
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
  pointer-events: none;
  opacity: 0;
  transition: opacity .32s cubic-bezier(0.16, 1, 0.3, 1), transform .32s cubic-bezier(0.16, 1, 0.3, 1), border-color .25s ease, box-shadow .25s ease, background .25s ease;
}
.nx .proj:hover .proj-center-btn {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}
.nx .proj-cover:hover .proj-center-btn {
  background: rgba(10, 18, 34, 0.96);
  border-color: rgba(var(--brand-rgb, 0, 242, 254), 0.85);
  transform: translate(-50%, -50%) scale(1.05);
  box-shadow: 0 16px 36px -4px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(var(--brand-rgb, 0, 242, 254), 0.6), 0 0 32px 2px rgba(var(--brand-rgb, 0, 242, 254), 0.5);
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
.nx .proj-cover:hover .proj-center-btn .btn-ico {
  transform: translate(1px, -1px);
  background: rgba(var(--brand-rgb, 0, 242, 254), 0.35);
  color: #ffffff;
}
.nx .proj-center-btn .btn-text {
  font-size: 13px;
  font-weight: 600;
  color: #f8fafc;
  letter-spacing: -0.01em;
  white-space: nowrap;
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
.widget-works .globe-ico {
  color: #059669;
}
[data-theme="dark"] .widget-works .globe-ico {
  color: #34d399;
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

.lang-sub {
  font-size: 13px;
  color: var(--ink-3);
  margin: 0;
  line-height: 1.4;
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
_open = _src[_src.index("<body>") + 6:_src.index('<header class="hero"')]
_tail = _src[_src.index('<div style="text-align: center; padding-bottom: 2rem;">'):]
_tail = _tail.replace('<div style="text-align: center; padding-bottom: 2rem;">',
                      '<div style="text-align: center; padding-bottom: 2rem; display: none;">', 1)


def global_top_nav(cur):
    links = [("profile", "Profile"), ("projects", "Projects"), ("writing", "Writing"),
             ("people", "People"), ("contact", "Contact")]
    links_html = "".join([f'<a href="../{k}/" class="{"active" if k==cur else ""}">{l}</a>' for k, l in links])
    links_html += f'<a href="../ai-insights/index.html">AI Insights</a>'
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
    items += f'<li><a href="{prefix}ai-insights/index.html" class="magnetic-element hover-sound nav-link-item">{ico("library")} <span>AI Insights</span></a></li>\n            '
    nav_inner = "\n            " + items + cli + "\n        "
    return re.sub(r'<ul class="nav-links">.*?</ul>', f'<ul class="nav-links">{nav_inner}</ul>', html, flags=re.S)


def shell(slug, title, desc, cur):
    head = build_pages.set_meta(_head, slug, title.replace(f"{NAME} · ", ""), desc, "../")
    head = head.replace("</head>", '<link rel="stylesheet" href="../nx/nx.scoped.css?v=13">\n</head>')
    opening = swap_nav_active(_open, "../", cur)
    return build_pages.rewrite(head, "../"), build_pages.rewrite(opening, "../"), build_pages.rewrite(_tail, "../")


def sub_header(slug, title):
    if not title or slug == "profile":
        return ""
    return f'''<div class="sub-header-bar">
  <div class="sub-header-shell">
    <div class="sub-header-left">
      <h1 class="sub-header-title">{e(title)}</h1>
    </div>
    <div class="sub-header-right">
      <a class="btn-rail-top" href="{GH}" target="_blank" rel="noopener noreferrer">
        <span class="git-icon-wrap"><i class="fa-brands fa-github"></i></span>
        <span>Follow on GitHub</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="git-arr"><path d="M7 17L17 7M7 7h10v10"/></svg>
      </a>
    </div>
  </div>
</div>'''


def page(slug, title, desc, topbar_title, body, cur, show_open=True):
    head, opening, tail = shell(slug, title, desc, cur)
    sub_bar = sub_header(slug, topbar_title)
    is_profile = (slug == "profile")
    return f'''{head}<body class="subpage nx-page" data-page="{slug}">{opening}
<div class="nx">
{sub_bar}
<div class="shell">
<main class="main">
{body}
</main>
{rail(show_open, show_top=is_profile)}
</div>
{bottom_nav(cur, prefix="../")}
</div>
<script src="../nx/nx.js?v=3"></script>
<script type="module" src="../nx/slats-cover.js?v=8"></script>
<script src="../nx/proj-dots.js?v=3"></script>
{tail}'''


def icon_src(name):
    return f"../uploads/brand-icons/{name}.svg" if (DOCS / "uploads/brand-icons" / f"{name}.svg").exists() else None


def pill_img(label, icon, color=None):
    src = icon_src(icon)
    im = f'<img src="{src}" alt="" width="14" height="14">' if src else ""
    st = f' ai" style="--c:{color}' if color else ""
    return f'<span class="pill{st}">{im}{e(label)}</span>'


# ------------------------------------------------------------------ PAGES
def initials(name):
    return "".join(w[0] for w in re.findall(r"[A-Za-z0-9&]+", name)[:2]).upper()


def profile_meta_widgets():
    return '''<div class="meta-widgets">
  <div class="meta-grid-2">
    <!-- Card 1: Based in -->
    <div class="widget-card widget-location">
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
      <h3 class="widget-title">Remote / Office Work</h3>
      <p class="widget-desc">Open to on-site and hybrid roles in Dhaka, as well as remote collaboration across global time zones (US, EU, APAC).</p>
      <div class="works-chips">
        <span class="work-chip"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Remote</span>
        <span class="work-chip"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Office / On-site (Dhaka)</span>
        <span class="work-chip"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Hybrid</span>
        <span class="work-chip"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Async-friendly</span>
        <span class="work-chip"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Flexible schedule</span>
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
        <div class="lang-bars" aria-label="Proficiency: 5 of 5">
          <span class="bar-seg active"></span>
          <span class="bar-seg active"></span>
          <span class="bar-seg active"></span>
          <span class="bar-seg active"></span>
          <span class="bar-seg active"></span>
        </div>
        <div class="lang-pill"><span class="lang-dot"></span>Near-native</div>
        <p class="lang-sub">British and American accents</p>
      </div>

      <!-- Bangla -->
      <div class="lang-col">
        <div class="lang-title-row">
          <h4 class="lang-name">Bangla</h4>
          <button type="button" class="lang-audio-btn" data-lang="bn" title="বাংলা শুনুন" aria-label="Listen Bangla">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
          </button>
        </div>
        <div class="lang-bars" aria-label="Proficiency: 5 of 5">
          <span class="bar-seg active"></span>
          <span class="bar-seg active"></span>
          <span class="bar-seg active"></span>
          <span class="bar-seg active"></span>
          <span class="bar-seg active"></span>
        </div>
        <div class="lang-pill"><span class="lang-dot"></span>Native</div>
        <p class="lang-sub">First language & mother tongue</p>
      </div>

      <!-- Arabic -->
      <div class="lang-col">
        <div class="lang-title-row">
          <h4 class="lang-name">Arabic</h4>
          <button type="button" class="lang-audio-btn" data-lang="ar" title="استمع إلى العربية" aria-label="Listen Arabic">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
          </button>
        </div>
        <div class="lang-bars" aria-label="Proficiency: 3 of 5">
          <span class="bar-seg active"></span>
          <span class="bar-seg active"></span>
          <span class="bar-seg active"></span>
          <span class="bar-seg"></span>
          <span class="bar-seg"></span>
        </div>
        <div class="lang-pill"><span class="lang-dot"></span>Reading and small talk</div>
        <p class="lang-sub">Elementary reading & conversational comprehension</p>
      </div>
    </div>
  </div>
</div>'''


def profile():
    ai = "".join(pill_img(l, i, c) for l, i, c in AI_TOOLS)
    st = "".join(pill_img(l, i) for l, i in STACK)
    metrics = "".join(f'<div class="metric"><b>{a}</b><span>{b}</span></div>' for a, b in METRICS)
    jobs = ""
    for title, comp, place, period, current, pts, chips in JOBS:
        lis = "".join(f"<li>{e(p)}</li>" for p in pts)
        cc = "".join(f'<span class="chip-solid">{c}</span>' for c in chips)
        now = '<span class="status-dot" title="Presently working here"></span>' if current and "Present" in period else ""
        sub_text = f"{e(comp)} &middot; Full-time &middot; {e(place)}"
        jobs += (f'<article class="exp-item-modern">'
                 f'<div class="exp-timeline">'
                 f'<div class="exp-logo-box">{initials(comp)}{now}</div>'
                 f'<div class="exp-line"></div>'
                 f'</div>'
                 f'<div class="exp-content">'
                 f'<div class="exp-header-row"><h3>{e(title)}</h3><span class="exp-date">{period}</span></div>'
                 f'<div class="exp-sub">{sub_text}</div>'
                 f'<ul class="exp-bullets">{lis}</ul>'
                 f'<div class="exp-tech">{cc}</div>'
                 f'</div></article>')
    edu = "".join(f'<div class="edu"><span class="logo-sq">{initials(s)}</span><div><h3>{e(d)}</h3>'
                  f'<p class="exp-meta">{e(s)} &middot; {e(m)}</p></div></div>' for d, s, m in EDUCATION)
    certs = "".join(f'<li><i class="fa-solid fa-award"></i><div><b>{e(t)}</b><small>{e(o)}</small></div></li>' for t, o in CERTS)
    skills = "".join(f'<div class="sk"><h4>{g}</h4><div class="chips">' + "".join(f'<span class="chip">{e(x)}</span>' for x in xs)
                     + "</div></div>" for g, xs in SKILLS)
    extra = "".join(f'<div class="card"><h4>{k}</h4><div class="sm" style="margin-top:0;color:var(--ink-2)">{e(v)}</div></div>' for k, v in EXTRA)
    work = "".join(
        f'<a class="post" href="../projects/"><h3>{e(p[0])}</h3><small>{e(p[1])}</small></a>' for p in PROJECTS[:6])
    body = f'''{cover_banner()}
<section class="nx-hero">
<img class="avatar" src="../uploads/Mehedi.pro.png" alt="{NAME}" width="240" height="240" fetchpriority="high">
<h1 class="nx-name">{NAME} <span class="verified-badge" title="Verified Profile" aria-label="Verified">{ico("badge","verified")}</span></h1>
<p class="tagline">{TAGLINE}</p>
<a class="pill-status" href="../contact/"><span class="dot"></span>Open to new conversations</a>
<ul class="facts">
<li>{ico("case")} {ROLE_NOW} &middot; 4+ years</li>
<li>{ico("pin")} Dhaka, Bangladesh <span class="t">&middot; <span data-time></span></span></li>
</ul>
<div class="pills" aria-label="AI tools">{ai}</div>
<div class="pills" aria-label="Tech stack" style="margin-top:10px">{st}</div>
<div class="tabs" role="tablist"><button class="tab" role="tab" aria-selected="true" data-tab="resume">RESUME</button><button class="tab" role="tab" aria-selected="false" data-tab="work">WORK</button></div>
</section>
<div class="pad">
<div class="panel" data-panel="resume">
<h2 class="sec-title">{ico("user")} About</h2>
<div class="prose">{"".join(f"<p>{e(p)}</p>" for p in ABOUT)}</div>
<div class="metrics big-metrics">{metrics}</div>
{profile_meta_widgets()}
<h2 class="sec-title" style="margin-top:44px">{ico("case")} Experience</h2>
<div class="exp-modern">{jobs}</div>
<h2 class="sec-title" style="margin-top:44px"><i class="fa-solid fa-code"></i> Skills</h2>
<div class="sk-grid">{skills}</div>
<h2 class="sec-title" style="margin-top:44px"><i class="fa-solid fa-graduation-cap"></i> Education</h2>
<div class="exp">{edu}</div>
<h2 class="sec-title" style="margin-top:44px"><i class="fa-solid fa-award"></i> Certifications &amp; training</h2>
<ul class="certs">{certs}</ul>
<h2 class="sec-title" style="margin-top:44px"><i class="fa-solid fa-circle-info"></i> Additional</h2>
<div class="cards3">{extra}</div>
</div>
<div class="panel" data-panel="work" hidden>
<h2 class="sec-title">{ico("projects")} Selected work</h2>
<div class="posts">{work}</div>
<p style="margin-top:18px"><a class="btn btn-secondary" href="../projects/">See all projects</a></p>
</div>
</div>'''
    return page("profile", f"{NAME} · Profile", f"{NAME}: {TAGLINE}. {ROLE_NOW}. Laravel, NestJS, Kafka and agentic AI systems.", "", body, "profile")


def projects():
    cards = ""
    for t, d, tags, icon, badge, links, img in PROJECTS:
        b = f'<span class="badge"><i class="fa-solid fa-arrow-trend-up"></i> {badge}</span>' if badge else ""
        lk = "".join(
            f'<a href="{u}" target="_blank" rel="noopener noreferrer" aria-label="{t} {k}"><i class="fa-brands fa-github"></i></a>' if k == "github"
            else f'<a href="{u}" target="_blank" rel="noopener noreferrer" aria-label="Open {t}"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>'
            for k, u in links)
        tg = "".join(f'<span class="tag">{x}</span>' for x in tags)
        prim = links[0][1] if links else None
        cov_open = f'<a href="{prim}" target="_blank" rel="noopener noreferrer" class="proj-cover" aria-label="Open {e(t)}">' if prim else '<div class="proj-cover">'
        cov_close = '</a>' if prim else '</div>'
        if prim:
            btn_label = "Live Preview" if badge == "Live" else ("View Code" if (links and links[0][0] == "github") else "View Project")
            btn_ico = '<i class="fa-solid fa-arrow-up-right-from-square"></i>'
            center_btn = (f'<span class="proj-center-btn">'
                          f'<span class="btn-ico">{btn_ico}</span>'
                          f'<span class="btn-text">{btn_label}</span>'
                          f'</span>')
        else:
            center_btn = ('<span class="proj-center-btn in-dev">'
                          '<span class="btn-ico"><i class="fa-solid fa-code"></i></span>'
                          '<span class="btn-text">In Development</span>'
                          '</span>')
        cards += (f'<article class="proj">'
                  f'{cov_open}'
                  f'<img src="{img}" alt="{e(t)}" class="proj-img" loading="lazy">'
                  f'<div class="proj-overlay"></div>'
                  f'<canvas class="proj-dots-canvas"></canvas>'
                  f'{b}'
                  f'{center_btn}'
                  f'{cov_close}'
                  f'<div class="proj-body"><h3>{e(t)}</h3><p>{e(d)}</p>'
                  f'<div class="proj-foot"><div class="tag-row">{tg}</div><div class="proj-links">{lk}</div></div></div></article>')
    body = (f'<div class="pad"><p class="lead">Products I\'ve designed, built and shipped: NGO and ERP platforms, AI automation and web projects.</p>'
            f'<div class="grid2">{cards}</div></div>')
    return page("projects", "Projects", "Products and systems built by Mehedi Hasan: NGO ERP, Karbar ERP, SAWAB platforms, AI video engine and more.",
                "Projects", body, "projects")


def writing():
    data = json.loads((DOCS / "ai-insights/data.json").read_text(encoding="utf-8"))
    posts = ""
    for it in data[:6]:
        posts += (f'<a class="post" href="{e(it["url"])}" target="_blank" rel="noopener noreferrer"><h3>{e(it["title"])}</h3>'
                  f'<small>{e(it["source_name"])} &middot; {it["published_at"][:10]}</small></a>')
    body = (f'<div class="pad"><section class="empty"><span class="empty-ico">{ico("writing")}</span>'
            f'<h2>Articles and notes are coming</h2>'
            f'<p>Long-form posts on AI agents, event-driven systems and ERP engineering will live here.</p>'
            f'<a class="btn btn-secondary" href="../ai-insights/index.html">Open AI Insights</a></section>'
            f'<h2 class="work-title" style="margin-top:8px">What I\'m reading on AI</h2>'
            f'<div class="posts">{posts}</div></div>')
    return page("writing", "Writing", "Notes and AI reading list from Mehedi Hasan.", "Writing", body, "writing")


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
    hero = (f'<section class="people-hero"><div class="av-stack">{avs}</div><h2>People I learn from</h2>'
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
<section class="cta-hero"><h2>Let's build something</h2><p>Have a project, a role or just a question? Pick whatever's easiest and I'll get back to you.</p>
<div class="cta-row"><span class="pill"><span class="dot"></span> Open to new conversations</span><span class="pill">{ico("pin","")} Dhaka, GMT+6 &middot; <span data-time></span></span></div></section>
<h2 class="work-title">Work with me</h2>
<div class="svc">
<div class="svc-card wide"><span class="svc-ico"><i class="fa-solid fa-rocket"></i></span><div class="svc-body"><h3>Build something together</h3>
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


def main():
    (DOCS / "nx" / "nx.scoped.css").write_text(scope_css((DOCS / "nx" / "nx.css").read_text(encoding="utf-8")) + SCOPED_FIX, encoding="utf-8")
    for slug, fn in [("profile", profile), ("projects", projects), ("writing", writing), ("people", people),
                     ("contact", contact)]:
        out = DOCS / slug / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(fn(), encoding="utf-8")
        print("wrote", out.relative_to(ROOT))


if __name__ == "__main__":
    main()
