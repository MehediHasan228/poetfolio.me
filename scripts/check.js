#!/usr/bin/env node
/*
 * Site check: loads every page of the running site in Chrome and reports what a visitor would hit.
 *
 *   npm run check                 full run (all pages, desktop + mobile, every theme, click timing, storage blocked)
 *   npm run check -- --quick      dark theme only, no click timing (about a minute)
 *   npm run check -- --pages /,/profile/
 *   npm run check -- --compare scratch/check/baseline.json   only what is new since that report
 *
 * The site must be served first (docker compose up -d, or npm run serve). CHECK_URL changes the address
 * (default http://localhost:8000). The full report is written to scratch/check/report.json; the exit code is 1
 * when anything fails.
 *
 * What fails:
 *   console errors, uncaught errors, failed requests and 4xx/5xx responses while a page loads
 *   axe WCAG 2.2 A/AA violations, in every theme, on desktop and mobile
 *   horizontal scroll, layout shift (CLS) above 0.1
 *   a Tab stop on something the visitor can't see (a closed drawer, a hidden overlay)
 *   a click that takes more than 200 ms to paint, with the CPU slowed 4x like a mid-range phone
 *   errors when the browser blocks site storage (localStorage throws)
 *   internal links that don't answer 200, and #anchors that point nowhere
 *   a page that forwards (meta refresh: /stack/, /sandbox/) to a page that doesn't answer or a #part it doesn't have
 *   a ?v= on a CSS/JS reference that doesn't match the file's content hash (npm run stamp fixes these)
 *   a :hover selector in the served CSS (stylesheets, inline <style>, stylesheets built in JS) outside a
 *   (hover: hover) media condition: on a touch screen a tap sets :hover until the next tap, so the style would stick
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const OUT_DIR = path.join(ROOT, 'scratch', 'check');
const BASE = (process.env.CHECK_URL || 'http://localhost:8000').replace(/\/$/, '');
const THEMES = ['dark', 'cyberpunk', 'light', 'mint', 'god-mode'];
const VIEWPORTS = {
    desktop: { width: 1440, height: 900 },
    mobile: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
};
const SLOW_CLICK_MS = 200;
const CPU_SLOWDOWN = 4;
const CLICKS_PER_PAGE = 8;
const POOL = 4;   // pages checked at once (the click-timing pass runs one at a time so timings stay honest)
const SKIP_DIRS = new Set(['vendor', 'uploads', 'data', 'favicon', 'ai', 'nx']);

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const QUICK = flag('--quick');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- pages and the static ?v= check

function discoverPages() {
    const pages = [];
    const walk = (dir) => {
        for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
            if (d.isDirectory()) { if (!SKIP_DIRS.has(d.name)) walk(path.join(dir, d.name)); }
            else if (d.name === 'index.html') {
                const rel = path.relative(DOCS, dir).split(path.sep).join('/');
                pages.push(rel ? `/${rel}/` : '/');
            }
        }
    };
    walk(DOCS);
    if (fs.existsSync(path.join(DOCS, '404.html'))) pages.push('/404.html');
    return pages.sort();
}

// where a page that only forwards (meta refresh) sends the visitor, as a full URL; null for a normal page
function redirectTarget(p) {
    const m = fs.readFileSync(pageFile(p), 'utf8').match(/http-equiv="refresh"\s+content="\d+;\s*url=([^"]+)"/i);
    return m ? new URL(m[1], BASE + p).href : null;
}

// a forward must land on a page that answers, on the #part it names (checked in the built file)
function checkRedirects(redirects) {
    const failures = [];
    for (const p of redirects) {
        const to = redirectTarget(p);
        if (!to) { failures.push({ type: 'redirect', key: `redirect|${p}|none`, detail: `${p}: forwards nowhere (no url in its meta refresh)` }); continue; }
        const u = new URL(to);
        if (u.origin !== new URL(BASE).origin || !u.hash) continue;
        const file = pageFile(normalisePage(u.pathname));
        const id = decodeURIComponent(u.hash.slice(1));
        const html = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
        if (!new RegExp(`\\sid="${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(html)) {
            failures.push({ type: 'redirect', key: `redirect|${p}|${u.pathname}${u.hash}`, detail: `${p} forwards to ${u.pathname}${u.hash}, which has no element with that id` });
        }
    }
    return failures;
}

// "/profile" and "/profile/" are the same page; "/404.html" is a file
const normalisePage = (p) => (p.endsWith('/') || /\.html$/.test(p) ? p : p + '/');

function pageFile(p) {
    return path.join(DOCS, p.endsWith('/') ? p + 'index.html' : p);
}

const hashOf = (file) => crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex').slice(0, 10);

// every "path.css?v=x" / "path.js?v=x" in the site's HTML, JS and CSS, resolved from the file that names it
// (scripts/stamp_versions.py writes the same hashes)
function checkStamps() {
    const failures = [];
    const files = [];
    const walk = (dir) => {
        for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, d.name);
            if (d.isDirectory()) { if (d.name !== 'vendor') walk(full); }
            else if (/\.(html|js|mjs|css)$/.test(d.name)) files.push(full);
        }
    };
    walk(DOCS);
    const re = /(["'`(])((?:\.{1,2}\/|\/(?!\/))?[\w~\-./]+\.(?:css|js|mjs))\?v=([\w.-]*)/g;   // not //cdn… URLs
    const isFile = (p) => { try { return fs.statSync(p).isFile(); } catch (e) { return false; } };
    for (const file of files) {
        const text = fs.readFileSync(file, 'utf8');
        for (const m of text.matchAll(re)) {
            const ref = m[2];
            const target = ref.startsWith('/') ? path.join(DOCS, ref) : path.resolve(path.dirname(file), ref);
            const where = path.relative(ROOT, file);
            if (!isFile(target)) { failures.push({ type: 'stamp', key: `stamp|${where}|${ref}|missing`, detail: `${where}: ${ref} does not exist` }); continue; }
            const want = hashOf(target);
            if (m[3] !== want) failures.push({ type: 'stamp', key: `stamp|${where}|${ref}`, detail: `${where}: ${ref}?v=${m[3]} should be ?v=${want}` });
        }
    }
    return failures;
}

// every :hover selector the site serves sits inside a (hover: hover) media condition, so only a mouse or trackpad ever
// shows it: a tap on a touch screen sets :hover and it stays until the next tap, and a lifted or recoloured control
// would stay that way (DESIGN.md, Touch). Read: every .css file, every inline <style>, and the stylesheets that a script
// builds in a template literal (focus.js's player). :not(:hover) is not a hover style and passes.
function hoverRules(css) {
    const out = [];   // { selector, offset }
    const skipString = (i) => { const q = css[i]; for (let j = i + 1; j < css.length; j++) { if (css[j] === '\\') j++; else if (css[j] === q) return j + 1; } return css.length; };
    const skipComment = (i) => { const e = css.indexOf('*/', i + 2); return e < 0 ? css.length : e + 2; };
    const walk = (from, to, gated) => {
        let i = from;
        while (i < to) {
            if (/\s/.test(css[i])) { i++; continue; }
            if (css.startsWith('/*', i)) { i = skipComment(i); continue; }
            let j = i, depth = 0;
            while (j < to) {
                const c = css[j];
                if (c === '"' || c === "'") { j = skipString(j); continue; }
                if (css.startsWith('/*', j)) { j = skipComment(j); continue; }
                if (c === '(' || c === '[') depth++;
                else if (c === ')' || c === ']') depth--;
                else if (depth === 0 && (c === '{' || c === ';' || c === '}')) break;
                j++;
            }
            if (j >= to || css[j] !== '{') { i = j + 1; continue; }
            let k = j, d = 0;
            for (; k < to; k++) {
                const c = css[k];
                if (c === '"' || c === "'") { k = skipString(k) - 1; continue; }
                if (css.startsWith('/*', k)) { k = skipComment(k) - 1; continue; }
                if (c === '{') d++; else if (c === '}' && --d === 0) break;
            }
            const prelude = css.slice(i, j).replace(/\/\*[\s\S]*?\*\//g, '').trim();
            if (/^@(media|supports|layer|container|document|scope)\b/i.test(prelude)) {
                walk(j + 1, k, gated || (/^@media\b/i.test(prelude) && /\(\s*hover\s*:\s*hover\s*\)/i.test(prelude)));
            } else if (!prelude.startsWith('@') && !gated) {
                // a :hover that is not inside :not(…) makes the rule a hover style
                const positive = prelude.replace(/:not\((?:[^()]|\([^()]*\))*\)/gi, '');
                if (/:hover\b/i.test(positive)) out.push({ selector: prelude.replace(/\s+/g, ' '), offset: i });
            }
            i = k + 1;
        }
    };
    walk(0, css.length, false);
    return out;
}

function checkHover() {
    const failures = [];
    const files = [];
    const walkDir = (dir) => {
        for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, d.name);
            if (d.isDirectory()) { if (d.name !== 'vendor') walkDir(full); }
            else if (/\.(css|html|js)$/.test(d.name)) files.push(full);
        }
    };
    walkDir(DOCS);
    for (const file of files) {
        const text = fs.readFileSync(file, 'utf8');
        const where = path.relative(ROOT, file);
        const blocks = [];   // [start, end] of the CSS inside the file
        if (file.endsWith('.css')) blocks.push([0, text.length]);
        else if (file.endsWith('.html')) {
            for (const m of text.matchAll(/<style\b[^>]*>/gi)) { const s = m.index + m[0].length; blocks.push([s, text.indexOf('</style>', s)]); }
        } else {
            // a template literal holding CSS: one with a rule that has :hover in its selector
            for (const m of text.matchAll(/:hover\b[^{}'"`\n]*\{/g)) {
                const s = text.lastIndexOf('`', m.index) + 1, e = text.indexOf('`', m.index);
                if (s > 0 && e > 0 && !blocks.some(([a]) => a === s)) blocks.push([s, e]);
            }
        }
        for (const [s, e] of blocks) {
            const css = text.slice(s, e);
            for (const r of hoverRules(css)) {
                const line = text.slice(0, s + r.offset).split('\n').length;
                failures.push({ type: 'hover', key: `hover|${where}|${r.selector.slice(0, 120)}`, detail: `${where}:${line}: ${r.selector.slice(0, 140)} is a :hover style outside @media (hover: hover) and (pointer: fine)` });
            }
        }
    }
    return failures;
}

// ---------------------------------------------------------------- in-page helpers (run inside the browser)

const PAGE_INIT = () => {
    const m = window.__check = { cls: 0, shifts: [], events: [] };
    const watch = (type, fn, extra) => { try { new PerformanceObserver((l) => l.getEntries().forEach(fn)).observe({ type, buffered: true, ...extra }); } catch (e) {} };
    watch('layout-shift', (e) => { if (!e.hadRecentInput) { m.cls += e.value; m.shifts.push(e.value); } });
    watch('event', (e) => m.events.push({ t: e.startTime, d: e.duration, id: e.interactionId }), { durationThreshold: 16 });
};

const BLOCK_STORAGE = () => {
    const deny = { get() { throw new DOMException('The operation is insecure.', 'SecurityError'); } };
    Object.defineProperty(window, 'localStorage', deny);
    Object.defineProperty(window, 'sessionStorage', deny);
};

// what a Tab stop looks like to a sighted visitor: false when it is clipped to nothing, outside the window (a drawer
// parked off screen), or transparent
const DESCRIBE_FOCUS = () => {
    const e = document.activeElement;
    if (!e || e === document.body || e === document.documentElement) return null;
    const label = (e.getAttribute('aria-label') || e.textContent || e.title || e.getAttribute('placeholder') || e.tagName).trim().replace(/\s+/g, ' ').slice(0, 40);
    const b = e.getBoundingClientRect();
    const st = getComputedStyle(e);
    let opacity = 1;
    for (let n = e; n && n.nodeType === 1; n = n.parentElement) opacity *= +getComputedStyle(n).opacity;
    const clipped = st.clip === 'rect(0px, 0px, 0px, 0px)' || /inset\(50%\)/.test(st.clipPath);
    let visible = b.width > 1 && b.height > 1 && b.right > 0 && b.left < innerWidth && b.bottom > 0 && b.top < innerHeight
        && opacity >= 0.05 && !clipped;
    // a native select or input made transparent over its own visible label (a styled picker) still shows focus there
    if (!visible && opacity < 0.05 && e.matches('select, input') && e.closest('label')) {
        const lb = e.closest('label').getBoundingClientRect();
        let lo = 1;
        for (let n = e.closest('label'); n && n.nodeType === 1; n = n.parentElement) lo *= +getComputedStyle(n).opacity;
        visible = lb.width >= 1 && lb.right > 0 && lb.left < innerWidth && lo >= 0.05;
    }
    const sel = e.id ? `#${e.id}` : e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/)[0] : '');
    return { label, sel, visible, node: e };
};

// ---------------------------------------------------------------- one page load

async function openPage(browser, url, vp, { theme, blockStorage, localOnly, init = true } = {}) {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    if (localOnly) {   // from the first request on, nothing goes to another host
        const origin = new URL(BASE).origin;
        await page.setRequestInterception(true);
        page.on('request', (q) => (new URL(q.url()).origin === origin ? q.continue() : q.abort('blockedbyclient')));
    }
    const log = { console: [], errors: [], failed: [], http: [] };
    page.on('console', (m) => { if (m.type() === 'error') log.console.push(m.text().slice(0, 200)); });
    page.on('pageerror', (e) => log.errors.push(String(e.message || e).slice(0, 200)));
    page.on('requestfailed', (q) => {
        const err = (q.failure() || {}).errorText || '';
        if (!/ERR_ABORTED|blockedbyclient/i.test(err)) log.failed.push(`${q.url().slice(0, 140)} ${err}`);
    });
    page.on('response', (r) => { if (r.status() >= 400) log.http.push(`${r.status()} ${r.url().slice(0, 140)}`); });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    ctx.on('targetcreated', async (t) => { try { const p = await t.page(); if (p && p !== page) await p.close(); } catch (e) {} });
    await page.setViewport(vp);
    if (init) await page.evaluateOnNewDocument(PAGE_INIT);
    if (theme) await page.evaluateOnNewDocument((t) => { try { localStorage.setItem('mehedi_theme', t); } catch (e) {} }, theme);
    if (blockStorage) await page.evaluateOnNewDocument(BLOCK_STORAGE);
    let navError = null;
    try { await page.goto(url, { waitUntil: 'load', timeout: 45000 }); } catch (e) { navError = e.message.slice(0, 160); }
    try { await page.waitForNetworkIdle({ idleTime: 600, timeout: 10000 }); } catch (e) {}
    await sleep(1200);
    return { ctx, page, log, navError };
}

let AXE_SOURCE = null;
async function runAxe(page) {
    if (!AXE_SOURCE) AXE_SOURCE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
    await page.evaluate(AXE_SOURCE);
    return page.evaluate(async () => {
        const res = await window.axe.run(document, { resultTypes: ['violations'], runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } });
        return res.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, eg: v.nodes.slice(0, 3).map((n) => n.target.join(' ').slice(0, 80)) }));
    });
}

// Tab through the page once (until focus comes back round) and keep the stops nobody can see. A stop that looks hidden
// is looked at again after a moment, so something that fades in on focus (a skip link) isn't counted
async function invisibleTabStops(page) {
    // focus scrolls instantly while we look (with smooth scrolling, a stop far down a long page is still on its way
    // into view when it is measured)
    await page.evaluate(() => {
        document.documentElement.style.scrollBehavior = 'auto';
        document.body.style.scrollBehavior = 'auto';
        document.activeElement && document.activeElement.blur();
        window.scrollTo(0, 0);
    });
    const bad = new Map();
    const look = () => page.evaluate(() => {
        const d = window.__describeFocus();
        if (!d) return null;
        if (!d.node.__checkSeen) d.node.__checkSeen = ++window.__checkStop;
        return { label: d.label, sel: d.sel, visible: d.visible, n: d.node.__checkSeen };
    });
    let first = null;
    let wrapped = false;
    for (let i = 0; i < 400; i++) {
        await page.keyboard.press('Tab');
        let f = await look();
        if (!f) continue;
        if (first === null) first = f.n; else if (f.n === first) { wrapped = true; break; }
        if (!f.visible) { await sleep(300); f = await look(); }
        if (f && !f.visible) bad.set(`${f.sel} "${f.label}"`, true);
    }
    const out = [...bad.keys()];
    if (!wrapped && first !== null) out.push('(Tab walk stopped after 400 stops without coming round; the rest is unchecked)');
    return out;
}

// ---------------------------------------------------------------- passes

async function mainPass(browser, pagePath, vpName) {
    const url = BASE + pagePath;
    const { ctx, page, log, navError } = await openPage(browser, url, VIEWPORTS[vpName]);
    const fails = [];
    const at = `${pagePath}|${vpName}`;
    const add = (type, id, detail) => fails.push({ type, key: `${type}|${at}|${id}`, detail: `${pagePath} (${vpName}): ${detail}` });
    if (navError) add('load', 'nav', navError);
    try {
        await page.evaluate(`window.__describeFocus = ${DESCRIBE_FOCUS.toString()}; window.__checkStop = 0;`);
        // scroll through once so lazy and on-view content runs, then back to the top
        const H = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < Math.min(H, 30000); y += Math.round(VIEWPORTS[vpName].height * 0.8)) { await page.evaluate((y) => window.scrollTo(0, y), y); await sleep(150); }
        await page.evaluate(() => window.scrollTo(0, 0));
        await sleep(500);
        const info = await page.evaluate(() => {
            const de = document.documentElement;
            const missing = [];
            for (const a of document.querySelectorAll('a[href*="#"]')) {
                const u = new URL(a.href);
                if (u.origin !== location.origin || u.pathname !== location.pathname) continue;
                let h = u.hash.slice(1);
                try { h = decodeURIComponent(h); } catch (e) {}
                if (h && h !== 'top' && !document.getElementById(h) && !document.getElementsByName(h).length) missing.push(a.getAttribute('href'));
            }
            return {
                overflow: de.scrollWidth > de.clientWidth,
                scrollWidth: de.scrollWidth,
                cls: +(window.__check ? window.__check.cls : 0).toFixed(3),
                links: [...document.querySelectorAll('a[href]')].map((a) => a.href).filter((h) => h.startsWith(location.origin)),
                missing: [...new Set(missing)],
            };
        });
        if (info.overflow) add('overflow', 'x', `page scrolls sideways (${info.scrollWidth}px wide)`);
        if (info.cls > 0.1) add('cls', 'cls', `layout shift ${info.cls}`);
        info.missing.forEach((h) => add('anchor', h, `link ${h} points to no element`));
        log.console.forEach((t) => add('console', t.slice(0, 80), `console error: ${t}`));
        log.errors.forEach((t) => add('pageerror', t.slice(0, 80), `uncaught error: ${t}`));
        log.failed.forEach((t) => add('request', t.split(' ')[0], `request failed: ${t}`));
        log.http.forEach((t) => add('http', t.split(' ')[1], `HTTP ${t}`));
        (await runAxe(page)).forEach((v) => add('axe', `default|${v.id}`, `axe ${v.id} (${v.impact}) ×${v.n}: ${v.eg.join(', ')}`));
        (await invisibleTabStops(page)).forEach((s) => add('tabstop', s, `Tab reaches something hidden: ${s}`));
        await ctx.close();
        return { fails, links: info.links };
    } catch (e) {
        add('check', 'crash', `check crashed: ${e.message.slice(0, 160)}`);
        await ctx.close().catch(() => {});
        return { fails, links: [] };
    }
}

async function themePass(browser, pagePath, vpName, theme) {
    const { ctx, page } = await openPage(browser, BASE + pagePath, VIEWPORTS[vpName], { theme });
    const fails = [];
    try {
        const applied = await page.evaluate(() => document.documentElement.dataset.theme);
        if (applied !== theme) fails.push({ type: 'theme', key: `theme|${pagePath}|${vpName}|${theme}`, detail: `${pagePath} (${vpName}): saved theme ${theme} shows as ${applied}` });
        (await runAxe(page)).forEach((v) => fails.push({ type: 'axe', key: `axe|${pagePath}|${vpName}|${theme}|${v.id}`, detail: `${pagePath} (${vpName}, ${theme}): axe ${v.id} ×${v.n}: ${v.eg.join(', ')}` }));
    } catch (e) {
        fails.push({ type: 'check', key: `check|${pagePath}|${vpName}|${theme}`, detail: `${pagePath} (${vpName}, ${theme}): check crashed: ${e.message.slice(0, 120)}` });
    }
    await ctx.close().catch(() => {});
    return fails;
}

async function storagePass(browser, pagePath) {
    const { ctx, log } = await openPage(browser, BASE + pagePath, VIEWPORTS.desktop, { blockStorage: true });
    await ctx.close().catch(() => {});
    return log.errors.map((t) => ({ type: 'storage', key: `storage|${pagePath}|${t.slice(0, 80)}`, detail: `${pagePath}: with site storage blocked: ${t}` }));
}

// click up to CLICKS_PER_PAGE controls that stay on the page and time each to its next paint, CPU slowed like a phone.
// Nothing leaves the machine: every request to another host is blocked from the start, chat messages and forms are
// never sent
async function timingPass(browser, pagePath, vpName) {
    const vp = VIEWPORTS[vpName];
    const { ctx, page, log } = await openPage(browser, BASE + pagePath, vp, { localOnly: true });
    const fails = [];
    const loadErrors = log.errors.length;
    try {
        await page.evaluate(() => { window.open = () => null; });
        const cdp = await page.createCDPSession();
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU_SLOWDOWN });
        const picked = await page.evaluate((max) => {
            const shown = (e) => {
                const b = e.getBoundingClientRect();
                if (b.width < 2 || b.height < 2 || b.right <= 0 || b.left >= innerWidth) return false;
                for (let n = e; n && n.nodeType === 1; n = n.parentElement) { const s = getComputedStyle(n); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.05) return false; }
                return !e.closest('[hidden],[inert],[aria-hidden="true"]');
            };
            const out = [];
            const perKind = {};
            for (const e of document.querySelectorAll('button, [role=button], [role=tab], [aria-expanded], [aria-pressed], summary, #chat-header')) {
                if (e.disabled || e.dataset.check !== undefined) continue;
                if (e.closest('form') && (e.type === 'submit' || !e.getAttribute('type'))) continue;
                if (e.closest('#ai-chat-widget') && !e.matches('#chat-header')) continue;
                const a = e.closest('a[href]');
                if (a && !a.getAttribute('href').startsWith('#')) continue;
                const label = (e.getAttribute('aria-label') || e.textContent || e.title || '').trim().replace(/\s+/g, ' ').slice(0, 30);
                if (/download|submit|send|delete|reset/i.test(label) || !shown(e)) continue;
                const kind = (typeof e.className === 'string' ? e.className.trim().split(/\s+/)[0] : '') || e.tagName;
                perKind[kind] = (perKind[kind] || 0) + 1;
                if (perKind[kind] > 2) continue;   // two of a kind is enough (six identical filter chips time the same)
                e.dataset.check = String(out.length);
                out.push(label || kind);
                if (out.length >= max) break;
            }
            return out;
        }, CLICKS_PER_PAGE);
        for (let i = 0; i < picked.length; i++) {
            const pos = await page.evaluate((i) => {
                const e = document.querySelector(`[data-check="${i}"]`);
                if (!e || !e.isConnected) return null;
                e.scrollIntoView({ block: 'center', behavior: 'instant' });
                const b = e.getBoundingClientRect();
                const x = b.left + b.width / 2, y = b.top + b.height / 2;
                const top = document.elementFromPoint(x, y);
                return top && (top === e || e.contains(top)) ? { x, y } : null;
            }, i);
            if (!pos) continue;
            await sleep(300);
            const before = page.url();
            const t0 = await page.evaluate(() => performance.now());
            if (vp.isMobile) await page.touchscreen.tap(pos.x, pos.y); else await page.mouse.click(pos.x, pos.y);
            await sleep(1200);
            const ms = await page.evaluate((t0) => {
                const ev = window.__check.events.filter((e) => e.t >= t0 - 5 && e.id);
                return ev.length ? Math.round(Math.max(...ev.map((e) => e.d))) : 0;
            }, t0);
            if (ms > SLOW_CLICK_MS) fails.push({ type: 'slow', key: `slow|${pagePath}|${vpName}|${picked[i]}`, detail: `${pagePath} (${vpName}): "${picked[i]}" takes ${ms} ms to respond at ${CPU_SLOWDOWN}x CPU`, ms });
            // a control that throws when used (the uncaught errors that arrived since the last click)
            log.errors.splice(loadErrors).forEach((t) => fails.push({ type: 'clickerror', key: `clickerror|${pagePath}|${vpName}|${picked[i]}|${t.slice(0, 60)}`, detail: `${pagePath} (${vpName}): clicking "${picked[i]}" throws: ${t}` }));
            if (page.url().split('#')[0] !== before.split('#')[0]) break;   // it navigated: the rest of the list is gone
            await page.keyboard.press('Escape').catch(() => {});
            await sleep(300);
        }
    } catch (e) {
        fails.push({ type: 'check', key: `check|timing|${pagePath}|${vpName}`, detail: `${pagePath} (${vpName}): click timing crashed: ${e.message.slice(0, 120)}` });
    }
    await ctx.close().catch(() => {});
    return fails;
}

async function checkLinks(urls) {
    const fails = [];
    for (const u of urls) {
        try {
            let r = await fetch(u, { method: 'HEAD', redirect: 'manual' });
            if (r.status === 405) { r = await fetch(u, { redirect: 'manual' }); await r.body?.cancel(); }
            if (r.status !== 200) fails.push({ type: 'link', key: `link|${u}|${r.status}`, detail: `${u} answers ${r.status}` });
        } catch (e) {
            fails.push({ type: 'link', key: `link|${u}|error`, detail: `${u}: ${e.message}` });
        }
    }
    return fails;
}

async function pool(items, size, fn) {
    const out = [];
    let next = 0;
    await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
        while (next < items.length) { const i = next++; out[i] = await fn(items[i]); }
    }));
    return out;
}

function launchOptions() {
    const executablePath = process.env.CHROME_PATH
        || (fs.existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome') ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : undefined);
    return { headless: true, executablePath, args: ['--mute-audio'] };
}

// ---------------------------------------------------------------- main

(async () => {
    const started = Date.now();
    try { await fetch(BASE + '/'); } catch (e) {
        console.error(`Nothing answers at ${BASE}. Start the site first: docker compose up -d (or npm run serve).`);
        process.exit(2);
    }
    const all = discoverPages();
    const wanted = opt('--pages') ? opt('--pages').split(',').map(normalisePage) : all;
    // a page that only forwards to another (meta refresh) is checked as a link, not as a page
    const redirects = wanted.filter((p) => /http-equiv="refresh"/i.test(fs.readFileSync(pageFile(p), 'utf8')));
    const pages = wanted.filter((p) => !redirects.includes(p));
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch(launchOptions());
    const failures = [];
    const step = (s) => process.stdout.write(`  ${s}\n`);

    console.log(`Checking ${pages.length} pages at ${BASE}${QUICK ? ' (quick)' : ''}`);
    const jobs = pages.flatMap((p) => Object.keys(VIEWPORTS).map((v) => [p, v]));
    const main = await pool(jobs, POOL, ([p, v]) => mainPass(browser, p, v));
    main.forEach((r) => failures.push(...r.fails));
    step(`pages, axe (dark), Tab stops: ${main.reduce((n, r) => n + r.fails.length, 0)} problems`);

    const targets = redirects.map(redirectTarget).filter((u) => u && u.startsWith(BASE));
    const links = [...new Set(main.flatMap((r) => r.links).concat(redirects.map((p) => BASE + p), targets).map((u) => u.split('#')[0]))];
    const linkFails = await checkLinks(links);
    failures.push(...linkFails);
    step(`${links.length} internal links: ${linkFails.length} broken`);

    const redirectFails = checkRedirects(redirects);
    failures.push(...redirectFails);
    step(`${redirects.length} pages that forward (${redirects.join(', ') || 'none'}): ${redirectFails.length} land nowhere`);

    const stampFails = checkStamps();
    failures.push(...stampFails);
    step(`?v= stamps: ${stampFails.length} out of date`);

    const hoverFails = checkHover();
    failures.push(...hoverFails);
    step(`:hover outside a (hover: hover) media condition: ${hoverFails.length}`);

    if (!QUICK) {
        const themeJobs = pages.flatMap((p) => Object.keys(VIEWPORTS).flatMap((v) => THEMES.filter((t) => t !== 'dark').map((t) => [p, v, t])));
        const themed = (await pool(themeJobs, POOL, ([p, v, t]) => themePass(browser, p, v, t))).flat();
        failures.push(...themed);
        step(`themes ${THEMES.slice(1).join(', ')}: ${themed.length} problems`);

        const blocked = (await pool(pages, POOL, (p) => storagePass(browser, p))).flat();
        failures.push(...blocked);
        step(`storage blocked: ${blocked.length} problems`);

        const slow = [];
        for (const [p, v] of jobs) slow.push(...await timingPass(browser, p, v));
        failures.push(...slow);
        step(`click timing at ${CPU_SLOWDOWN}x CPU: ${slow.length} slower than ${SLOW_CLICK_MS} ms`);
    }
    await browser.close();

    // summary
    const byType = {};
    failures.forEach((f) => { byType[f.type] = (byType[f.type] || 0) + 1; });
    let shown = failures;
    if (opt('--compare')) {
        const old = new Set(JSON.parse(fs.readFileSync(opt('--compare'), 'utf8')).failures.map((f) => f.key));
        shown = failures.filter((f) => !old.has(f.key));
        const now = new Set(failures.map((f) => f.key));
        console.log(`\nCompared with ${opt('--compare')}: ${shown.length} new, ${[...old].filter((k) => !now.has(k)).length} fixed`);
    }
    console.log('\nProblems by kind:', Object.keys(byType).length ? byType : 'none');
    const limit = flag('--all') ? Infinity : 60;
    shown.slice(0, limit).forEach((f) => console.log(`  [${f.type}] ${f.detail}`));
    if (shown.length > limit) console.log(`  … ${shown.length - limit} more in the report (or pass --all)`);

    fs.mkdirSync(OUT_DIR, { recursive: true });
    const report = { at: new Date().toISOString(), base: BASE, quick: QUICK, pages, redirects, seconds: Math.round((Date.now() - started) / 1000), byType, failures };
    const file = opt('--json') || path.join(OUT_DIR, 'report.json');
    fs.writeFileSync(file, JSON.stringify(report, null, 1));
    console.log(`\n${failures.length ? failures.length + ' problems' : 'All clear'} in ${report.seconds}s. Report: ${path.relative(ROOT, file)}`);
    process.exit(shown.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
