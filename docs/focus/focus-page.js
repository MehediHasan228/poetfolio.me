/**
 * The Focus page (library/focus): a stage whose photo follows the mix, presets, the timer and sleep timer, the sound board,
 * the Quran radio, a player bar with the mixer, a full-screen focus view with a Milkdrop visualizer, and a settings backup.
 * Everything here only drives window.FocusPlayer (focus/focus.js), which keeps playing across pages.
 */
(function () {
    'use strict';
    /* site storage can be blocked (then touching it throws): it is read and written only through these */
    const local = {
        get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }
    };
    const LINES = [
        'Start with the smallest piece you can finish before the tea goes cold.',
        'Write the ugly first draft. Polish is a second pass.',
        'The error message is a clue, not an insult.',
        'Leave the code a little cleaner than you found it.',
        'Twenty-five quiet minutes. That is the whole deal.',
        'Notifications can wait. This thought cannot.',
        'If it is taking forever, make the task smaller.',
        'You do not have to feel ready. Just open the file.',
        'Name things well. Future you is reading.',
        'The rain keeps time. You keep going.',
        'Bismillah. One line at a time.',
        'Slow is smooth, and smooth is fast.',
        'Finish the sentence before you pick up the phone.',
        'Every big project is a pile of small, boring wins.',
        'Read it twice, then write it once.',
        'Debugging is just asking better questions.',
        'Stuck? Walk around the problem, not away from it.',
        'Commit while it works.',
        'Quiet mind, clear diff.',
        'Breathe out. Pick the next small step.',
        'A break is part of the work, not a prize for it.',
        'Ship the small version today.',
        "Today's practice is next year's talent.",
        'Make it work, make it right, then make it fast.',
        'Warm cup, one clear goal.',
        'Do the hard part while the coffee is still warm.',
        'Focus is a muscle. This is the gym.',
        'Keep your promise to the next twenty-five minutes.',
        'Let the sound hold the room while you hold the thought.',
        'Close one loop before you open another.'
    ];
    const CAT_ICON = { rain: 'cloud-rain', nature: 'tree', animals: 'feather', places: 'mug-hot', transport: 'train', things: 'keyboard', city: 'city', noise: 'wave-square' };

    function init() {
        const FP = window.FocusPlayer;
        const page = document.querySelector('.fx-page');
        if (!FP || !page) return;
        const $ = (id) => document.getElementById(id);
        const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        const ico = (n, extra) => `<i class="fa-solid fa-${n}${extra ? ' ' + extra : ''}" aria-hidden="true"></i>`;
        const BY = {}; FP.SOUNDS.forEach((s) => { BY[s.id] = s; });
        const CAT = {}; FP.CATS.forEach(([k, l]) => { CAT[k] = l; });
        const typing = (el) => el && (/^(input|textarea|select)$/i.test(el.tagName) || el.isContentEditable);
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const coarse = matchMedia('(pointer: coarse)').matches;
        /* this page is for listening: the audio engine is made while the page is idle (FP.warm), so the first play,
           preset or next/previous doesn't wait for the browser to start its audio service */
        const warm = () => { if (FP.warm) FP.warm(); };
        const warmLater = () => setTimeout(() => { if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 3000 }); else warm(); }, 2000);
        if (document.readyState === 'complete') warmLater(); else addEventListener('load', warmLater, { once: true });
        const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return u; } };
        const commons = (file) => 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(file);

        let last = -1;
        const line = () => { let i = Math.floor(Math.random() * LINES.length); if (i === last) i = (i + 1) % LINES.length; last = i; return LINES[i]; };

        /* a title changes with a short blur and slide instead of a jump */
        function swap(el, text) {
            if ('_to' in el ? el._to === text : el.textContent === text) return;
            const busy = '_to' in el; el._to = text;
            if (busy) return;
            const done = () => { el.textContent = el._to; delete el._to; };
            if (reduced || !el.animate || document.hidden || !el.getClientRects().length) { done(); return; }
            el.animate([{ opacity: 1 }, { opacity: 0, filter: 'blur(4px)', transform: 'translateY(-.25em)' }], { duration: 140, easing: 'ease-in', fill: 'forwards' })
                .finished.then(() => {
                    done(); el.getAnimations().forEach((a) => a.cancel());
                    el.animate([{ opacity: 0, filter: 'blur(4px)', transform: 'translateY(.25em)' }, { opacity: 1, filter: 'blur(0)', transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.23, 1, .32, 1)' });
                }, done);
        }

        /* ---- what to suggest: the visitor's time of day, and the monsoon from June to September ---- */
        const pick = (function () {
            const now = new Date(), h = now.getHours();
            const [when, ids] = h < 5 ? ['tonight', ['train', 'coding', 'starship']]
                : h < 9 ? ['this morning', ['forest', 'river', 'coxs']]
                : h < 12 ? ['this morning', ['deep', 'study', 'cafe']]
                : h < 17 ? ['this afternoon', ['cha', 'study', 'cafe']]
                : h < 20 ? ['this evening', ['cha', 'cozy', 'river']]
                : ['tonight', ['coding', 'village', 'train']];
            const list = now.getMonth() >= 5 && now.getMonth() <= 8 && h >= 12 ? ['monsoon'].concat(ids) : ids;
            const day = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 864e5);     /* the same pick all day, a new one tomorrow */
            return { when, preset: FP.PRESETS.find((p) => p.id === list[day % list.length]) };
        })();
        const SUG = pick.preset;

        /* ---- scenes: each [data-scenes] box cross-fades to the photo of the place the mix sounds like ---- */
        function paint(box, key) {
            if (!key || box.dataset.want === key) return;
            box.dataset.want = key;
            let img = box.querySelector(`img[data-scene="${key}"]`);
            if (!img) {
                img = document.createElement('img');
                img.alt = ''; img.decoding = 'async'; img.dataset.scene = key;
                img.sizes = box.dataset.sizes || '100vw';
                img.srcset = `${FP.sceneUrl(key, 800)} 800w, ${FP.sceneUrl(key, 1600)} 1600w`;
                img.src = FP.sceneUrl(key, 800);
                box.appendChild(img);
            }
            const show = () => { if (box.dataset.want === key) box.querySelectorAll('img').forEach((x) => x.classList.toggle('is-on', x === img)); };
            if (img.complete && img.naturalWidth) requestAnimationFrame(show); else img.addEventListener('load', show, { once: true });
        }

        /* ---- volume sliders: a pill that fills; drag, tap or use the arrow keys ---- */
        const slider = (label, v, cls) => {
            const p = Math.round(v * 100);
            return `<div class="fx-vol${cls ? ' ' + cls : ''}" role="slider" tabindex="0" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}" aria-valuetext="${p}%" style="--fill:${p}%">`
                + `<span class="fx-vol-fill"></span><span class="fx-vol-ico">${ico('volume-low')}</span><span class="fx-vol-ico fx-vol-on">${ico('volume-low')}</span></div>`;
        };
        function setSlider(el, v) {
            if (!el || 'dragging' in el.dataset) return;
            const p = Math.round(Math.max(0, Math.min(1, v)) * 100);
            el.style.setProperty('--fill', p + '%'); el.setAttribute('aria-valuenow', p); el.setAttribute('aria-valuetext', p + '%');
        }
        function slide(el, v) {
            const p = Math.round(Math.max(0, Math.min(1, v)) * 100);
            el.style.setProperty('--fill', p + '%'); el.setAttribute('aria-valuenow', p); el.setAttribute('aria-valuetext', p + '%');
            el.dispatchEvent(new CustomEvent('fx-volume', { bubbles: true, detail: p / 100 }));
        }
        document.addEventListener('pointerdown', (e) => {
            const el = e.target.closest && e.target.closest('.fx-vol');
            if (!el || e.button !== 0) return;
            const at = (x) => { const r = el.getBoundingClientRect(); return (x - r.left) / r.width; };
            const x0 = e.clientX, y0 = e.clientY;
            let drag = false;
            const grab = (ev) => { drag = true; el.setPointerCapture(ev.pointerId); el.dataset.dragging = ''; };
            if (e.pointerType === 'mouse') { grab(e); slide(el, at(e.clientX)); }
            const move = (ev) => {          /* on touch the page scrolls until the finger clearly moves sideways */
                if (!drag) { const dx = Math.abs(ev.clientX - x0); if (dx < 6 || dx < Math.abs(ev.clientY - y0)) return; grab(ev); }
                slide(el, at(ev.clientX));
            };
            const up = (ev) => {
                if (!drag && ev.type === 'pointerup') slide(el, at(ev.clientX));
                delete el.dataset.dragging;
                el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
            };
            el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
        });
        document.addEventListener('keydown', (e) => {
            const el = e.target.closest && e.target.closest('.fx-vol');
            if (!el) return;
            const v = Number(el.getAttribute('aria-valuenow')) / 100;
            const to = { ArrowRight: v + 0.05, ArrowUp: v + 0.05, ArrowLeft: v - 0.05, ArrowDown: v - 0.05, PageUp: v + 0.1, PageDown: v - 0.1, Home: 0, End: 1 }[e.key];
            if (to !== undefined) { e.preventDefault(); slide(el, to); }
        });

        /* ---- the stage ---- */
        const presets = $('fx-presets');
        presets.innerHTML = FP.PRESETS.map((p) => `<button type="button" class="fx-chip" data-preset="${p.id}" aria-pressed="false" title="${esc(p.sub + (p.id === SUG.id ? ' · picked for ' + pick.when : ''))}"`
            + `${p.id === SUG.id ? ' data-suggested' : ''}>${ico(p.icon)}<span>${esc(p.name)}</span></button>`).join('');
        const presetBtns = [...presets.children];
        /* the presets open like a menu: a click on the pill, closed again by a pick, Esc or a click elsewhere */
        const presetsWrap = $('fx-presets-wrap'), presetsPill = $('fx-presets-pill');
        function presetsOpen(open, byKey) {
            if (open === presetsWrap.classList.contains('is-open')) return;
            presetsWrap.classList.toggle('is-open', open);
            setTimeout(() => dodgeSoon(), 360);          /* the chips row has finished opening or closing */
            presetsPill.setAttribute('aria-expanded', String(open));
            const c = open && (presets.querySelector('[aria-pressed="true"]') || presets.querySelector('[data-suggested]'));
            if (c) {                                     /* on a phone the row scrolls sideways: it opens on the playing preset */
                presets.scrollLeft = c.offsetLeft - (presets.clientWidth - c.offsetWidth) / 2;
                if (byKey) setTimeout(() => c.focus({ preventScroll: true }), 60);     /* from the keyboard, focus moves into the menu */
            }
        }
        presetsPill.addEventListener('click', (e) => presetsOpen(!presetsWrap.classList.contains('is-open'), e.detail === 0));
        presets.addEventListener('click', (e) => {
            const b = e.target.closest('[data-preset]'); if (!b) return;
            const s = FP.state();
            if (s.preset === b.dataset.preset && s.playing) FP.pause(); else FP.usePreset(b.dataset.preset);
            const byKey = e.detail === 0;
            presetsOpen(false); if (byKey) presetsPill.focus({ preventScroll: true });
        });
        function toggleAll() {          /* Space, the big button and the bar: the sounds, the radio and the video together */
            const s = FP.state();
            if (s.playing || (s.radio && s.radio.on)) FP.pause();
            else if (Object.keys(s.mix).length || s.radio) FP.play();
            else FP.usePreset(SUG.id);
        }
        /* a transport tap paints first (play turns to pause at once) and then sets the sound going: starting the audio (the
           sounds, the radio, the silent track an iPhone needs) took a slow phone 50-150 ms inside the tap and held its
           frame back. A timer set in the tap still counts as the tap for Safari's autoplay rule (up to 1 s), and Chrome
           runs it after the tap's frame; update() then shows what is true */
        const afterTap = (fn) => () => { setTimeout(fn, 0); };
        const playTap = () => {
            const s = FP.state(), on = !(s.playing || (s.radio && s.radio.on));
            [$('fx-play'), $('fx-bar-play'), $('fx-view-play')].forEach((b) => {
                if (!b) return;
                if (b.dataset.on !== String(on)) { b.dataset.on = String(on); b.innerHTML = ico(on ? 'pause' : 'play'); }
                b.setAttribute('aria-label', (on ? 'Pause' : 'Play') + ' (Space)');
            });
            setTimeout(toggleAll, 0);
        };
        $('fx-play').addEventListener('click', playTap);
        function shuffleFront() {
            const s = FP.state();
            if (s.lead === 'radio' && s.radio && s.radio.track) {          /* a Bangla set: a surah picked at random */
                let n = s.radio.track.n; while (n === s.radio.track.n) n = 1 + Math.floor(Math.random() * 114);
                FP.surah(n); return;
            }
            if (s.lead === 'radio' && s.radio) return quranRadio();
            FP.shuffle();
        }
        $('fx-shuffle').addEventListener('click', afterTap(shuffleFront));
        $('fx-expand').addEventListener('click', (e) => openView(false, e.detail === 0));
        const quote = () => swap($('fx-quote'), line());
        $('fx-quote-next').addEventListener('click', quote);
        $('fx-quote').textContent = line();
        /* on the first screen the stage is the player, only mixer button here */
        $('fx-stage-mix').innerHTML = `<button type="button" class="fx-glass fx-mixbtn" id="fx-mixbtn" aria-controls="fx-mixer">${ico('sliders')}<b id="fx-mixcount"></b></button>`;
        $('fx-mixbtn').addEventListener('click', () => mixer(mixerEl.hidden));
        $('fx-prev').addEventListener('click', afterTap(() => FP.prev()));
        $('fx-next').addEventListener('click', afterTap(() => FP.next()));
        /* a short note on the stage, where the visualizer names its presets */
        let sayT = 0;
        function say(text) {
            const el = $('fx-stage-viz-name'); if (!el) return;
            el.textContent = text; el.classList.remove('is-err'); el.classList.add('is-on');
            clearTimeout(sayT); sayT = setTimeout(() => el.classList.remove('is-on'), 3200);
        }

        /* keyboard shortcuts: one quiet line that opens from "Shortcuts ›" */
        const keysBtn = $('fx-keys-btn'), keysList = $('fx-keys-list');
        const keys = (open) => { keysList.hidden = !open; keysBtn.setAttribute('aria-expanded', String(open)); };
        keysBtn.addEventListener('click', () => keys(keysList.hidden));
        document.addEventListener('click', (e) => { if (!e.composedPath().includes(presetsWrap)) presetsOpen(false); });
        /* ---- the sounds and the Quran radio share one place as tabs; the last one used opens next time ---- */
        const TAB = 'focus:tab', libTabs = [...document.querySelectorAll('.fx-libtab')];
        function showTab(name, focus) {
            libTabs.forEach((t) => {
                const on = t.dataset.tab === name;
                t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
                $('fx-panel-' + t.dataset.tab).hidden = !on;
                if (on && focus) t.focus();
            });
            local.set(TAB, name);
        }
        libTabs.forEach((t) => t.addEventListener('click', () => showTab(t.dataset.tab)));
        $('fx-lib').querySelector('[role="tablist"]').addEventListener('keydown', (e) => {
            const i = libTabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
            const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: libTabs.length - 1 }[e.key];
            if (to === undefined) return;
            e.preventDefault(); showTab(libTabs[(to + libTabs.length) % libTabs.length].dataset.tab, true);
        });
        const counts = { sounds: FP.SOUNDS.length, radio: FP.STATIONS.length };
        document.querySelectorAll('[data-count]').forEach((b) => { b.textContent = counts[b.dataset.count]; });
        showTab((() => {
            const t = local.get(TAB); if (t && $('fx-panel-' + t)) return t;
            const s = FP.state(); return s.radio && !Object.keys(s.mix).length ? 'radio' : 'sounds';     /* first visit: what is playing, else sounds */
        })());
        /* on desktop the tab row sticks under the header: its offset is measured, the header differs by width */
        function stickAt() {
            const nav = document.querySelector('body > nav'), bar = document.querySelector('.sub-header-bar');
            const top = (nav && getComputedStyle(nav).position === 'fixed' ? nav.offsetHeight : 0) + (bar && getComputedStyle(bar).position === 'sticky' ? bar.offsetHeight : 0);
            page.style.setProperty('--fx-stick', (top || 0) + 'px');
        }
        stickAt(); addEventListener('resize', stickAt);
        const PANEL_OF = { 'fx-groups': 'sounds', 'fx-radio': 'radio' };
        const goTo = (id) => {
            if (id === 'fx-groups') board();
            if (PANEL_OF[id]) { showTab(PANEL_OF[id]); id = 'fx-lib'; }          /* a chip for the radio opens its tab */
            $(id).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        };
        $('fx-more').addEventListener('click', () => goTo('fx-timer'));
        $('fx-now-chips').addEventListener('click', (e) => {
            if (e.target.closest('[data-random]')) return afterTap(quranRadio)();
            const stop = e.target.closest('[data-stop]'); if (stop) return stopLayer(stop.dataset.stop);
            const front = e.target.closest('[data-front]'); if (front) return FP.setLead(front.dataset.front);
            const b = e.target.closest('[data-go]'); if (b) goTo(b.dataset.go);
        });
        /* stop one layer and keep the other: the station, or the mix (its sounds go, the radio plays on and takes the title) */
        function stopLayer(which) {
            const s = FP.state(), name = which === 'radio' ? (s.radio && s.radio.name) : s.mixName;
            if (which === 'radio') FP.stopRadio(); else FP.setMix({}, false);
            if (name) say('Stopped ' + name);
        }
        /* one tap to a live recitation: a reciter picked at random, not the one playing nor one of the last few */
        const heard = [];
        function quranRadio() {
            const cur = (FP.state().radio || {}).url;
            const all = FP.STATIONS.filter((x) => (x.group === 'top' || x.group === 'more') && !/^english/.test(x.id));
            const pool = all.filter((x) => x.url !== cur && !heard.includes(x.url));
            const x = (pool.length ? pool : all)[Math.floor(Math.random() * (pool.length || all.length))];
            heard.push(x.url); if (heard.length > 8) heard.shift();
            FP.playRadio(x.url, x.name);
            say('Quran radio · ' + x.name);
        }
        let chipsHtml = '', chipOn = null;
        function nowChips(s) {          /* what runs beside the title, live on the stage: the timer, the sleep timer, the radio and the mix */
            const t = s.timer, chip = (to, i, text, cls) => `<button type="button" class="fx-now-chip${cls ? ' ' + cls : ''}" data-go="${to}">${ico(i)}<span>${esc(text)}</span></button>`;
            let html = '';
            if (t.running || t.left < t.total) html += chip('fx-timer', 'stopwatch', FP.PHASES[t.phase][0] + ' ' + FP.clock(t.left) + (t.running ? '' : ' · paused'));
            else if (t.phase === 'focus' && s.done > 0) html += chip('fx-timer', 'stopwatch', 'Break over · round ' + ((s.done % 4) + 1));
            if (s.sleep) html += chip('fx-timer', 'moon', 'Sleep ' + FP.clock(s.sleep));
            /* the radio sits beside the timer: a one-tap Quran radio when off. With a station and a mix both playing, each gets a
               chip with its own ✕, like tabs: the lit one is what the big buttons control, a tap on the other switches to it */
            const mixed = Object.keys(s.mix).length > 0, both = !!s.radio && mixed;
            const tab = (lead, i, text, what) => {
                const on = s.lead === lead;
                return `<span class="fx-layer${on ? ' is-on' : ''}"><button type="button" class="fx-now-chip fx-layer-pick" data-front="${lead}" aria-pressed="${on}" `
                    + `title="${on ? `The big buttons control this ${what}` : `Tap to control this ${what} with the big buttons`}">${ico(i)}<span>${esc(text)}</span></button>`
                    + `<button type="button" class="fx-now-chip fx-layer-x" data-stop="${lead}" aria-label="Stop ${esc(text)}" title="Stop ${esc(text)}; the other keeps playing">${ico('xmark')}</button></span>`;
            };
            if (!s.radio) html += `<button type="button" class="fx-now-chip fx-qr" data-random title="A live recitation, by a reciter picked at random (R)">${ico('tower-broadcast')}<span>Quran radio</span></button>`;
            else if (both) html += tab('radio', 'tower-broadcast', s.radio.name, s.radio.track ? 'surah' : 'station') + tab('mix', 'layer-group', s.mixName, 'mix');
            if (html !== chipsHtml) { chipsHtml = html; $('fx-now-chips').innerHTML = html; }
        }

        /* on phones the stage fills the first screen, down to the tab bar */
        const phone = matchMedia('(max-width: 767px)'), stage = page.querySelector('.fx-stage');
        let fitW = 0;
        function fit() {
            if (!phone.matches) { stage.style.minHeight = ''; fitW = 0; return; }
            if (fitW === innerWidth) return;          /* the browser's bars sliding in and out change the height only: no jumps */
            fitW = innerWidth;
            const nav = document.querySelector('.bottom-nav'), top = stage.getBoundingClientRect().top + scrollY;
            stage.style.minHeight = Math.max(460, innerHeight - top - (nav ? nav.offsetHeight : 0) - 14) + 'px';
        }
        fit();
        addEventListener('resize', fit);
        /* on phones the focus view and visualizer buttons sit beside the presets, so the transport row stays one row */
        const tools = document.createElement('span');
        tools.className = 'fx-bar-tools';
        function arrange() {
            const ex = $('fx-expand'), vz = $('fx-stage-viz'); if (!ex || !vz) return;
            if (phone.matches) { if (ex.parentElement !== tools) { tools.append(ex, vz); presetsPill.after(tools); } }
            else if (ex.parentElement === tools) { $('fx-stage-mix').before(ex, vz); tools.remove(); }
        }
        arrange();
        phone.addEventListener('change', arrange);

        /* ---- timer: rounds of focus with short breaks, a long one after every fourth; the sounds keep you company and step back on breaks ---- */
        const BREAK_TIPS = ['Stand up and stretch', 'Look at something far away', 'Drink some water', 'Rest your eyes for a minute', 'Roll your shoulders', 'Breathe in slowly, four times'];
        $('fx-timer').innerHTML = '<div class="fx-clock"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="fx-ring-bg" cx="60" cy="60" r="54"/>'
            + `<circle class="fx-ring-fg" id="fx-ring" cx="60" cy="60" r="54"/></svg><button type="button" class="fx-tgo" id="fx-tgo">${ico('play')}</button></div>`
            + '<div class="fx-timer-text"><b id="fx-time" role="timer" aria-live="off">25:00</b><small><span id="fx-phase"></span>'
            + '<span class="fx-dots" id="fx-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span></small></div>'
            + '<div class="fx-phases" role="group" aria-label="Timer mode">'
            + Object.keys(FP.PHASES).map((k) => `<button type="button" data-phase="${k}" aria-pressed="false">`          /* "break" drops on the narrowest phones */
                + `${esc(FP.PHASES[k][0]).replace(' break', '<span class="fx-ph-word"> break</span>')} <b></b></button>`).join('') + '</div>'
            + `<label class="fx-sleep fx-plan" title="How long the rounds and breaks are">${ico('stopwatch')}<select id="fx-plan" aria-label="Round length">`
            + Object.keys(FP.PLANS).map((k) => { const [f, b, , name] = FP.PLANS[k]; return `<option value="${k}">${f} / ${b} · ${esc(name)}</option>`; }).join('') + '</select></label>'
            + `<button type="button" class="fx-icon" id="fx-treset" aria-label="Reset the timer" title="Reset">${ico('rotate-left')}</button>`
            + `<label class="fx-sleep" title="Stop everything after a while, with a gentle fade">${ico('moon')}<select id="fx-sleep" aria-label="Sleep timer">`
            + [0, 15, 30, 45, 60, 90, 120].map((m) => `<option value="${m}">${m ? (m < 60 ? m + ' min' : m / 60 + (m === 60 ? ' hour' : ' hours')) : 'Sleep timer'}</option>`).join('')
            + '</select><b id="fx-sleep-left"></b></label>';
        $('fx-timer').querySelector('.fx-phases').addEventListener('click', (e) => { const b = e.target.closest('[data-phase]'); if (b) FP.setPhase(b.dataset.phase); });
        function timerGo() {
            const s = FP.state();
            if (s.timer.running) return FP.pauseTimer();
            FP.startTimer();
            /* a focus round brings its sound: the last mix or station, or today's pick */
            if (s.timer.phase === 'focus' && !live(s)) { if (Object.keys(s.mix).length || s.radio) FP.play(); else FP.usePreset(SUG.id); }
        }
        $('fx-tgo').addEventListener('click', timerGo);
        $('fx-plan').addEventListener('change', (e) => FP.setPlan(e.target.value));
        $('fx-treset').addEventListener('click', () => FP.resetTimer());
        $('fx-sleep').addEventListener('change', (e) => FP.setSleep(Number(e.target.value)));

        /* ---- the sound board, grouped like the categories ---- */
        const spots = (id) => {            /* where the colour glows sit in a tile: fixed per sound */
            let h = 7; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
            const r = () => { h = (h * 1103515245 + 12345) >>> 0; return 12 + ((h >>> 8) % 76) + '%'; };
            return `--x1:${r()};--y1:${r()};--x2:${r()};--y2:${r()};--x3:${r()};--y3:${r()}`;
        };
        const groups = FP.CATS.map(([k, l]) => ({ k, l, list: FP.SOUNDS.filter((s) => s.cat === k) }));
        $('fx-cats').innerHTML = groups.map((g) => `<a href="#fx-g-${g.k}" class="fx-cat" data-tint="${g.k}">${ico(CAT_ICON[g.k])}<span>${esc(g.l)}</span><b>${g.list.length}</b></a>`).join('');
        /* the tiles (about a thousand elements, below the stage) are made when the board comes near the screen, when the
           page is idle, or the moment something needs them (a search, a category, a chip that leads here); in sight from
           the start, in the first frame. Made with the page, their styles and layout were most of the long task right
           after the first paint (see the end of init) */
        let tiles = [], made = 0;
        const groupHtml = (g) => `<div class="fx-group" id="fx-g-${g.k}" data-tint="${g.k}"><h3>${ico(CAT_ICON[g.k])}${esc(g.l)}</h3><div class="fx-tiles">`
            + g.list.map((s) => `<div class="fx-tile" data-id="${s.id}" data-name="${esc((s.label + ' ' + s.hint + ' ' + g.l).toLowerCase())}" style="${spots(s.id)}">`
                + `<button type="button" class="fx-tile-btn" aria-pressed="false"><span class="fx-tile-ico">${ico(s.icon)}</span>`
                + `<span class="fx-tile-text"><b>${esc(s.label)}</b>${s.hint ? `<small>${esc(s.hint)}</small>` : ''}</span>`
                + '<span class="fx-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span></button>'
                + slider(s.label + ' volume', 0.5) + '</div>').join('') + '</div></div>';
        /* every group still to make, or (one = true, while the page is idle) only the next one */
        function board(one) {
            if (made >= groups.length) return;
            const box = $('fx-groups');
            do box.insertAdjacentHTML('beforeend', groupHtml(groups[made++])); while (one !== true && made < groups.length);
            tiles = [...page.querySelectorAll('.fx-tile')];
            update();                                      /* which are on, playing and at what volume */
        }
        $('fx-cats').addEventListener('click', board, true);         /* before the link jumps to its group */
        $('fx-search').addEventListener('focus', board);
        $('fx-groups').addEventListener('click', (e) => { const b = e.target.closest('.fx-tile-btn'); if (b) FP.toggleSound(b.parentElement.dataset.id); });
        $('fx-search').addEventListener('input', (e) => {
            board();
            const q = e.target.value.trim().toLowerCase();
            const hit = (name) => name.split(/\s+/).some((_, i, all) => all.slice(i).join(' ').startsWith(q));     /* "rain" finds Light rain, not Train */
            tiles.forEach((t) => { t.hidden = !!q && !hit(t.dataset.name); });
            page.querySelectorAll('.fx-group').forEach((g) => { g.hidden = !g.querySelector('.fx-tile:not([hidden])'); });
            const none = !tiles.some((t) => !t.hidden);
            $('fx-empty').hidden = !none;
            if (none) $('fx-empty').textContent = `No sound called “${e.target.value.trim()}”. Try rain, café or noise.`;
        });

        /* ---- the player bar and, above it, the mixer ---- */
        $('fx-dock').innerHTML = '<div class="fx-scrim" id="fx-scrim" hidden></div>'
            + '<div class="fx-mixer" id="fx-mixer" hidden><div class="fx-mixer-head"><b>In this mix</b>'
            + `<button type="button" class="fx-text-btn" id="fx-share">${ico('link')}<span>Share</span></button>`
            + `<button type="button" class="fx-text-btn" id="fx-clear">${ico('trash-can')}<span>Clear all</span></button></div>`
            + '<ul class="fx-layers" id="fx-layers"></ul></div>'
            + '<div class="fx-bar" id="fx-bar" role="region" aria-label="Player" inert>'
            + '<button type="button" class="fx-thumb" id="fx-thumb" aria-label="Open the focus view" title="Focus view (V)">'
            + `<span class="fx-scenes" data-scenes data-sizes="56px" aria-hidden="true"></span><span class="fx-thumb-over">${ico('expand')}</span></button>`
            + '<button type="button" class="fx-now" id="fx-now" aria-expanded="false" aria-controls="fx-mixer"><span class="fx-now-text"><b id="fx-name"></b>'
            + '<small><span class="fx-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span id="fx-sub"></span></small></span>' + ico('chevron-up', 'fx-chev') + '</button>'
            + slider('Volume', 0.8, 'fx-master fx-bar-vol')
            + `<button type="button" class="fx-play fx-play-sm" id="fx-bar-play">${ico('play')}</button>`
            + `<button type="button" class="fx-icon fx-wide" id="fx-copy" aria-label="Copy a link to this mix" title="Copy a link to this mix">${ico('link')}</button>`
            + `<button type="button" class="fx-icon" id="fx-full" aria-label="Full screen focus view" title="Full screen (F)">${ico('expand')}</button>`
            + `<button type="button" class="fx-icon fx-ghost" id="fx-stop" aria-label="Stop and clear the mix" title="Stop and clear">${ico('xmark')}</button></div>`;
        const mixerEl = $('fx-mixer');
        function mixer(open) {
            if (open === !mixerEl.hidden) return;
            mixerEl.hidden = $('fx-scrim').hidden = !open;
            $('fx-bar').classList.toggle('is-open', open);
            $('fx-now').setAttribute('aria-expanded', String(open));
            $('fx-mixbtn').setAttribute('aria-expanded', String(open));
            dock();
        }
        /* the bar comes up once the stage's play button has scrolled past the top (or while the mix is open);
           on phones the AI orb steps aside for it, so the two never share the corner */
        let past = false;
        const orb = document.getElementById('ai-chat-widget');
        /* where the collapsed orb sits, from its anchors rather than its box, so hiding it (it slides down) can't change the answer */
        function orbBox() {
            const cs = getComputedStyle(orb), right = innerWidth - parseFloat(cs.right), bottom = innerHeight - parseFloat(cs.bottom);
            return { left: right - orb.offsetWidth, right, top: bottom - orb.offsetHeight, bottom };
        }
        const meets = (a, b, pad) => !(a.right + pad < b.left || a.left - pad > b.right || a.bottom + pad < b.top || a.top - pad > b.bottom);
        function dock() {
            const up = page.hasAttribute('data-mixed') && (past || !mixerEl.hidden);
            page.toggleAttribute('data-bar', up);
            $('fx-bar').inert = !up;   /* down, it is out of sight, so Tab passes it by */
            const clash = up && !!orb && orb.classList.contains('chat-collapsed') && meets(orbBox(), $('fx-dock').getBoundingClientRect(), 8);
            document.documentElement.classList.toggle('fx-orb-yields', clash);
        }
        let dockRaf = 0;
        addEventListener('scroll', () => { if (!dockRaf) dockRaf = requestAnimationFrame(() => { dockRaf = 0; dock(); }); }, { passive: true });
        addEventListener('resize', () => dock());
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(([e]) => {
                past = !e.isIntersecting && e.boundingClientRect.top < (e.rootBounds ? e.rootBounds.top : 0);
                dock();
            }, { rootMargin: '-25% 0px 0px 0px' }).observe($('fx-play'));
        } else past = true;
        /* nor on a stage button: where the screen is too short or too narrow to keep its corner free, it fades out while it
           would cover one and comes back once the page settles elsewhere (measured only at rest) */
        let dodgeT = 0;
        function dodge() {
            if (!orb) return;
            const html = document.documentElement;
            if (!orb.classList.contains('chat-collapsed') || html.classList.contains('fx-orb-yields')) { html.classList.remove('fx-orb-away'); return; }
            const o = orbBox();
            const shown = (el) => (el.checkVisibility ? el.checkVisibility({ visibilityProperty: true, opacityProperty: true }) : getComputedStyle(el).visibility !== 'hidden');
            const hit = [...stage.querySelectorAll('button, [role="slider"]')].some((el) => {     /* the closed preset menu's chips don't count */
                const r = el.getBoundingClientRect();
                return r.width > 0 && !(r.right < o.left || r.left > o.right || r.bottom < o.top || r.top > o.bottom) && shown(el);
            });
            html.classList.toggle('fx-orb-away', hit);
        }
        const dodgeSoon = () => { clearTimeout(dodgeT); dodgeT = setTimeout(dodge, 140); };
        addEventListener('scroll', dodgeSoon, { passive: true });
        addEventListener('resize', dodgeSoon);
        setTimeout(dodge, 300);
        $('fx-now').addEventListener('click', () => mixer(mixerEl.hidden));
        $('fx-scrim').addEventListener('click', () => mixer(false));
        $('fx-thumb').addEventListener('click', (e) => openView(false, e.detail === 0));
        $('fx-full').addEventListener('click', (e) => openView(true, e.detail === 0));
        $('fx-bar-play').addEventListener('click', playTap);
        $('fx-stop').addEventListener('click', () => FP.clear());
        $('fx-clear').addEventListener('click', () => FP.clear());
        $('fx-layers').addEventListener('click', (e) => {
            if (e.target.closest('[data-remove-radio]')) return FP.stopRadio();
            const b = e.target.closest('[data-remove]'); if (b) FP.toggleSound(b.closest('[data-id]').dataset.id);
        });
        function share(btn, label) {
            const mix = FP.state().mix, ids = Object.keys(mix);
            if (!ids.length) return;
            const url = FP.FOCUS_URL + '?mix=' + ids.map((id) => id + ':' + Math.round(mix[id] * 100)).join(',');
            const done = (ok) => {
                const was = btn.innerHTML;
                btn.innerHTML = ico(ok ? 'check' : 'xmark') + (label ? `<span>${ok ? 'Link copied' : 'Copy failed'}</span>` : '');
                btn.classList.add('is-done'); setTimeout(() => { btn.innerHTML = was; btn.classList.remove('is-done'); }, 1600);
            };
            if (navigator.share && matchMedia('(pointer: coarse)').matches) navigator.share({ title: 'My Focus mix', url }).catch(() => {});
            else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => done(true), () => done(false));
        }
        $('fx-copy').addEventListener('click', () => share($('fx-copy')));
        $('fx-share').addEventListener('click', () => share($('fx-share'), true));
        document.addEventListener('click', (e) => {     /* the path is taken at the click, so a row removed by it still counts as inside */
            if (!mixerEl.hidden && !e.composedPath().some((n) => n === mixerEl || n === $('fx-now') || n === $('fx-mixbtn'))) mixer(false);
        });
        page.addEventListener('fx-volume', (e) => {
            const el = e.target, v = e.detail;
            if (el.classList.contains('fx-master')) return FP.setMaster(v);
            if (el.closest('[data-radio]')) return FP.setRadioVolume(v);
            const row = el.closest('[data-id]'); if (!row) return;
            if (row.classList.contains('fx-tile') && !(row.dataset.id in FP.state().mix)) FP.toggleSound(row.dataset.id);
            FP.setVolume(row.dataset.id, v);
        });

        /* ---- the focus view: the scene full size, a line to keep you going, the controls fade when you settle ---- */
        const view = document.createElement('div');
        view.className = 'nx fx-view'; view.hidden = true; view.tabIndex = -1;           /* its own .nx root: the theme, above everything on the page */
        view.setAttribute('role', 'dialog'); view.setAttribute('aria-modal', 'true'); view.setAttribute('aria-label', 'Focus view');
        view.innerHTML = '<div class="fx-scenes" data-scenes data-sizes="100vw" aria-hidden="true"></div>'
            + '<div class="fx-view-shade" aria-hidden="true"></div><div class="fx-view-in">'
            + `<div class="fx-view-top fx-fades"><p>${ico('headphones')}Focus</p><span class="fx-view-timer" id="fx-view-timer" hidden></span><span class="fx-view-tools">`
            + `<button type="button" class="fx-glass" id="fx-viz-next" aria-label="Next visual" title="Next visual" hidden>${ico('forward')}</button>`
            + `<button type="button" class="fx-glass" id="fx-viz" aria-pressed="false" aria-label="Visualizer" title="Visualizer">${ico('wand-magic-sparkles')}</button>`
            + `<button type="button" class="fx-glass" id="fx-view-full" aria-label="Full screen" title="Full screen (F)">${ico('expand')}</button>`
            + `<button type="button" class="fx-glass" id="fx-view-close" aria-label="Close the focus view" title="Close (Esc)">${ico('xmark')}</button></span></div>`
            + '<div class="fx-view-mid"><p class="fx-view-quote" id="fx-view-quote"></p><p class="fx-viz-name" id="fx-viz-name" aria-live="polite"></p></div>'
            + '<div class="fx-view-foot"><div class="fx-view-name"><p id="fx-view-name"></p><small id="fx-view-sub"></small></div>'
            + `<div class="fx-view-ctrls fx-fades">${slider('Volume', 0.8, 'fx-master fx-vol-dark fx-vol-lg')}`
            + `<button type="button" class="fx-glass" id="fx-view-prev" aria-label="Previous mix" title="Previous">${ico('backward-step')}</button>`
            + `<button type="button" class="fx-glass fx-glass-lg" id="fx-view-play">${ico('play')}</button>`
            + `<button type="button" class="fx-glass" id="fx-view-next" aria-label="Next mix" title="Next">${ico('forward-step')}</button></div></div>`
            + '<p class="fx-view-credit fx-fades" id="fx-view-credit"></p></div>';
        document.body.appendChild(view);
        view.addEventListener('fx-volume', (e) => FP.setMaster(e.detail));
        const viewScenes = view.querySelector('[data-scenes]');
        let idle = 0, rotate = 0, back = null;
        const wake = () => {
            view.removeAttribute('data-idle'); clearTimeout(idle);
            if (!view.hidden) idle = setTimeout(() => view.setAttribute('data-idle', ''), 3000);
        };
        ['pointermove', 'pointerdown', 'keydown'].forEach((t) => document.addEventListener(t, wake, { passive: true }));
        const fullscreen = () => { if (view.requestFullscreen) view.requestFullscreen({ navigationUI: 'hide' }).catch(() => {}); };
        const unfull = () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); };
        function nextViewLine() {
            const q = $('fx-view-quote'); q.classList.add('is-fading');
            setTimeout(() => { q.textContent = line(); q.classList.remove('is-fading'); }, 900);
        }
        function mountCanvas(target) {
            if (!canvas || !target) return;
            if (canvas.parentElement !== target) {
                if (target === view) {
                    view.insertBefore(canvas, view.querySelector('.fx-view-shade') || view.firstElementChild);
                } else {
                    stage.insertBefore(canvas, stage.querySelector('.fx-stage-in') || stage.firstElementChild);
                }
                try {
                    const gl = canvas.getContext('webgl2');
                    if (gl && gl.isContextLost()) {
                        viz = null;
                        if (vizOn) vizStart();
                    }
                } catch (e) {
                    viz = null;
                    if (vizOn) vizStart();
                }
            }
            vizSize();
        }
        function openView(full, byKey) {
            if (view.hidden) {
                back = document.activeElement;
                mixer(false);
                view.hidden = false; document.documentElement.classList.add('fx-view-on');
                $('fx-view-quote').textContent = line();
                clearInterval(rotate); rotate = setInterval(nextViewLine, 180000);
                paint(viewScenes, drawn);
                (byKey ? $('fx-view-close') : view).focus({ preventScroll: true });
                if (vizOn) {
                    mountCanvas(view);
                    view.toggleAttribute('data-viz', true);
                    stage.removeAttribute('data-viz');
                    vizSize();
                    vizLoop();
                } else if (vizPrefs().on) {
                    vizToggle(true);
                }
            }
            if (full) fullscreen();
            wake();
        }
        function closeView() {
            if (view.hidden) return;
            unfull();
            view.hidden = true; document.documentElement.classList.remove('fx-view-on');
            view.removeAttribute('data-viz');
            clearInterval(rotate); clearTimeout(idle);
            if (vizOn) {
                mountCanvas(stage);
                stage.toggleAttribute('data-viz', true);
                vizSize();
                vizLoop();
            } else {
                clearTimeout(vizAuto); cancelAnimationFrame(vizRaf);
            }
            if (back && back.focus) back.focus({ preventScroll: true });
        }
        $('fx-view-close').addEventListener('click', closeView);
        /* the player on other pages opens the focus view: with #view in the address, or by an event when this page is underneath the frame.
           #visual (or the event's detail.viz) opens it with the visualizer on: the home dashboard's visualizer button */
        const openFrom = (viz) => { openView(false); if (viz && !vizOn) vizToggle(true); };
        addEventListener('fp-view', (e) => openFrom(!!(e.detail && e.detail.viz)));
        if (location.hash === '#view' || location.hash === '#visual') {
            const viz = location.hash === '#visual';
            history.replaceState(history.state, '', location.pathname + location.search);
            setTimeout(() => openFrom(viz), 0);
        }
        $('fx-view-full').addEventListener('click', () => (document.fullscreenElement ? unfull() : fullscreen()));
        $('fx-view-play').addEventListener('click', playTap);
        $('fx-view-prev').addEventListener('click', afterTap(() => FP.prev()));
        $('fx-view-next').addEventListener('click', afterTap(() => FP.next()));
        document.addEventListener('fullscreenchange', () => {
            vizSize();
            const on = document.fullscreenElement === view;
            view.toggleAttribute('data-full', on);
            $('fx-view-full').innerHTML = ico(on ? 'compress' : 'expand');
            $('fx-view-full').setAttribute('aria-label', on ? 'Leave full screen' : 'Full screen');
        });
        view.addEventListener('keydown', (e) => {         /* Tab stays inside the view while it is open */
            if (e.key !== 'Tab') return;
            const f = [...view.querySelectorAll('button, [tabindex="0"], a[href]')].filter((x) => x.getClientRects().length);
            if (!f.length) return;
            const first = f[0], end = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); end.focus(); }
            else if (!e.shiftKey && document.activeElement === end) { e.preventDefault(); first.focus(); }
        });

        /* ---- visualizer: Milkdrop presets (butterchurn, MIT), loaded the first time it is switched on; it hears the sounds and the radio ---- */
        const VIZ = 'focus:viz', CDN = 'https://cdn.jsdelivr.net/npm/', canvas = $('fx-viz-canvas');
        const vizPrefs = () => { try { return JSON.parse(local.get(VIZ)) || {}; } catch (e) { return {}; } };
        const vizKeep = (o) => local.set(VIZ, JSON.stringify(Object.assign(vizPrefs(), o)));
        const script = (src) => new Promise((ok, no) => { const el = document.createElement('script'); el.src = src; el.onload = ok; el.onerror = no; document.head.appendChild(el); });
        let viz = null, vizLib = null, vizPresets = {}, vizNames = [], vizRaf = 0, vizOn = false, vizNameT = 0;
        function vizSay(text, err) {
            [$('fx-viz-name'), $('fx-stage-viz-name')].forEach((el) => {
                if (!el) return;
                el.textContent = text;
                el.classList.toggle('is-err', !!err);
                el.classList.add('is-on');
            });
            clearTimeout(vizNameT);
            vizNameT = setTimeout(() => {
                [$('fx-viz-name'), $('fx-stage-viz-name')].forEach((el) => el && el.classList.remove('is-on'));
            }, err ? 6000 : 3500);
        }
        function vizSize() {
            if (!viz || !canvas || canvas.hidden) return;
            const r = Math.min(window.devicePixelRatio || 1, coarse ? 1 : 1.5);
            const parent = canvas.parentElement || (view.hidden ? stage : view);
            const w = Math.round((parent.clientWidth || innerWidth) * r), h = Math.round((parent.clientHeight || innerHeight) * r);
            if (w && h && (canvas.width !== w || canvas.height !== h)) {
                canvas.width = w; canvas.height = h;
                try {
                    viz.setRendererSize(w, h);
                } catch (e) {
                    viz = null;
                    if (vizOn) vizStart();
                }
            }
        }
        /* changing the visual: forward is a fresh one (none of the last 24), back walks the history; it changes by itself
           when the music changes and every 3 minutes, unless the visitor holds it to keep it */
        const vizHist = [];
        let vizAt = -1, vizAuto = 0, vizPinned = !!vizPrefs().pinned;
        function vizLoad(name, blend) {
            try { viz.loadPreset(vizPresets[name], blend); vizKeep({ preset: name }); return true; } catch (e) { viz = null; if (vizOn) vizStart(); return false; }
        }
        function vizHint() {                 /* the first three times, how to change it */
            const n = vizPrefs().hints || 0; if (n >= 3) return '';
            vizKeep({ hints: n + 1 });
            return coarse ? ' · double-tap or swipe for another, hold to keep it' : ' · double-click for another, hold to keep it';
        }
        function vizSchedule() {
            clearTimeout(vizAuto);
            if (vizOn && !vizPinned && !reduced) vizAuto = setTimeout(() => vizGo(1, 5.7), 180000);
        }
        function vizGo(dir, blend) {
            if (!viz || !vizNames.length) return;
            let name;
            if (dir < 0) { if (vizAt <= 0) { vizSay('That was the first one'); return; } name = vizHist[--vizAt]; }
            else if (vizAt < vizHist.length - 1) name = vizHist[++vizAt];
            else {
                const recent = new Set(vizHist.slice(-24)), pool = vizNames.filter((n) => !recent.has(n));
                const from = pool.length ? pool : vizNames;
                name = from[Math.floor(Math.random() * from.length)];
                vizHist.push(name); vizAt = vizHist.length - 1;
            }
            if (vizLoad(name, blend)) { vizSay(name + vizHint()); vizSchedule(); }
        }
        function vizPin(on) {
            vizPinned = on; vizKeep({ pinned: on }); vizSchedule();
            [$('fx-viz'), $('fx-stage-viz')].forEach((b) => b && b.classList.toggle('is-pinned', on));
            vizSay(on ? 'Kept: ' + (vizHist[vizAt] || 'this one') + '. It stays until you change it' : 'It changes with the music again');
        }
        /* on the picture: double-click or double-tap for the next one, swipe for next and previous, hold to keep it */
        function vizGestures(host) {
            /* timing comes from the events' own timestamps, so a busy page can't turn a tap into a hold or split a double-tap */
            let down = null, holdT = 0, lastTap = -1e9, lastX = 0, lastY = 0, lastType = 'mouse';
            const skip = (t) => !host.hasAttribute('data-viz') || !!(t.closest && t.closest('button, a, input, select, label, [role="slider"], .fx-presets-wrap, .fx-now-chips, .fx-keys, .fx-view-ctrls'));
            const hold = () => { vizPin(!vizPinned); if (navigator.vibrate) try { navigator.vibrate(12); } catch (err) {} };
            host.addEventListener('pointerdown', (e) => {
                lastType = e.pointerType;
                if (e.button || skip(e.target)) { down = null; return; }
                down = { x: e.clientX, y: e.clientY, t: e.timeStamp, type: e.pointerType };
                clearTimeout(holdT);
                holdT = setTimeout(() => { if (down && !down.moved) { down.held = true; hold(); } }, 600);
            });
            host.addEventListener('pointermove', (e) => {
                if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 10) { down.moved = true; clearTimeout(holdT); }
            }, { passive: true });
            const up = (e) => {
                clearTimeout(holdT);
                const d = down; down = null;
                if (!d || d.held || e.type === 'pointercancel') return;
                const dx = e.clientX - d.x, dy = e.clientY - d.y, still = !d.moved && Math.abs(dx) <= 12 && Math.abs(dy) <= 12;
                if (still && e.timeStamp - d.t >= 600) { hold(); return; }          /* held long enough; the timer was just late */
                if (d.type === 'mouse') return;                                    /* a mouse double-clicks instead */
                if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && e.timeStamp - d.t < 700) { lastTap = -1e9; vizGo(dx < 0 ? 1 : -1, 2); return; }
                if (!still) return;
                if (e.timeStamp - lastTap < 320 && Math.hypot(e.clientX - lastX, e.clientY - lastY) < 40) { lastTap = -1e9; vizGo(1, 2); }
                else { lastTap = e.timeStamp; lastX = e.clientX; lastY = e.clientY; }
            };
            host.addEventListener('pointerup', up);
            host.addEventListener('pointercancel', up);
            host.addEventListener('dblclick', (e) => { if (lastType === 'mouse' && !skip(e.target)) { e.preventDefault(); vizGo(1, 2); } });
        }
        vizGestures(stage); vizGestures(view);
        function vizLoop() {
            cancelAnimationFrame(vizRaf);
            if (!viz || !vizOn || document.hidden) return;
            const draw = () => {
                if (!viz || !vizOn || document.hidden) return;
                try {
                    viz.render();
                } catch (e) {
                    viz = null;
                    if (vizOn) vizStart();
                    return;
                }
                vizRaf = requestAnimationFrame(draw);
            };
            draw();
        }
        async function vizStart() {
            if (viz) return true;
            if (!document.createElement('canvas').getContext('webgl2')) { vizSay('The visualizer needs WebGL 2, which this browser does not offer.', true); return false; }
            vizSay('Loading the visualizer…');
            try {
                vizLib = vizLib || Promise.all([script(CDN + 'butterchurn@2.6.7/lib/butterchurn.min.js'), script(CDN + 'butterchurn-presets@2.4.7/lib/butterchurnPresets.min.js')]);
                await vizLib;
            } catch (e) { vizLib = null; vizSay("The visualizer didn't load. Check the connection and try again.", true); return false; }
            const bc = window.butterchurn.default || window.butterchurn, bp = window.butterchurnPresets.default || window.butterchurnPresets;
            vizPresets = bp.getPresets(); vizNames = Object.keys(vizPresets);
            const tap = FP.tap();
            mountCanvas(view.hidden ? stage : view);
            canvas.hidden = false;
            const parent = canvas.parentElement || (view.hidden ? stage : view);
            const w = parent.clientWidth || innerWidth, h = parent.clientHeight || innerHeight;
            canvas.width = w; canvas.height = h;
            viz = bc.createVisualizer(tap.ctx, canvas, { width: w, height: h, pixelRatio: 1, textureRatio: 1 });
            viz.connectAudio(tap.node);
            const last = vizPrefs().preset;
            if (last && vizPresets[last] && !vizHist.length) { vizHist.push(last); vizAt = 0; if (vizLoad(last, 0)) vizSay(last + vizHint()); }
            else if (vizAt >= 0 && vizHist[vizAt]) vizLoad(vizHist[vizAt], 0);       /* a fresh renderer after a lost context */
            else vizGo(1, 0);
            return true;
        }
        async function vizToggle(on) {
            if (on && !(await vizStart())) on = false;
            vizOn = on; vizKeep({ on });
            if (view.hidden) {
                mountCanvas(stage);
                stage.toggleAttribute('data-viz', on);
                view.removeAttribute('data-viz');
            } else {
                mountCanvas(view);
                view.toggleAttribute('data-viz', on);
                stage.removeAttribute('data-viz');
            }
            if (canvas) canvas.hidden = !on;
            const nextBtn = $('fx-viz-next'); if (nextBtn) nextBtn.hidden = !on;
            [$('fx-viz'), $('fx-stage-viz')].forEach((b) => {
                if (b) {
                    b.setAttribute('aria-pressed', String(on));
                    b.classList.toggle('is-active', on);
                }
            });
            if (on) { vizSize(); vizLoop(); vizSchedule(); }
            else { cancelAnimationFrame(vizRaf); clearTimeout(vizAuto); }
            [$('fx-viz'), $('fx-stage-viz')].forEach((b) => b && b.classList.toggle('is-pinned', on && vizPinned));
        }
        if ($('fx-stage-viz')) $('fx-stage-viz').addEventListener('click', () => vizToggle(!vizOn));
        if ($('fx-viz')) $('fx-viz').addEventListener('click', () => vizToggle(!vizOn));
        if ($('fx-viz-next')) $('fx-viz-next').addEventListener('click', () => vizGo(1, 2.7));
        addEventListener('resize', vizSize);
        document.addEventListener('visibilitychange', vizLoop);

        /* ---- radio: one grid of reciters (eight in sight, the rest behind "more"), the Quran with Bangla meaning as its own grid,
           the visitor's own streams from a quiet "+". Cards carry a name and nothing else until they play ---- */
        const radioBox = $('fx-radio'), STN = 'focus:stations', MORE = 'focus:more';
        const myStations = () => { try { return JSON.parse(local.get(STN)) || []; } catch (e) { return []; } };
        const keepStations = (list) => local.set(STN, JSON.stringify(list.slice(0, 12)));
        const moreOpen = () => local.get(MORE) === '1';
        const station = (x, opts) => {
            const o = opts || {}, tint = x.group === 'bn' ? 'bn' : o.own ? 'noise' : 'quran';
            const label = x.group === 'bn' ? x.name.replace(/, Bangla$/, '') : x.name.replace(/^Muhammad Siddiq /, '');      /* fits two lines on a phone */
            return `<li${o.more ? ' class="fx-st-more-item"' : ''}${o.more && !o.open ? ' hidden' : ''}>`
                + `<button type="button" class="fx-station" data-url="${esc(x.url)}" data-name="${esc(x.name)}" data-tint="${tint}" style="${spots(x.id || x.url)}" title="${esc(x.name + ' · ' + (x.sub || hostOf(x.url)))}">`
                + avatar(x, o)
                + `<span class="fx-station-text"><b>${esc(label)}</b><small></small></span>`
                + '<span class="fx-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>'
                + (o.own ? `<i class="fa-solid fa-xmark fx-del" data-del-station="${esc(x.url)}" role="button" aria-label="Remove ${esc(x.name)}"></i>` : '') + '</button></li>';
        };
        /* the reciter's photo where a free one exists, else their initials in the theme's colours; a Bangla card wears a small badge */
        /* a reciter without a free photo wears an Islamic emblem instead: the ۞ star (the Quran's own section mark), a mosque,
           the Quran, crescent and star, the Kaaba, a crescent. Handed out in turn so neighbours differ; one reciter keeps one emblem */
        const RUB = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><g fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round">'
            + '<rect x="6.2" y="6.2" width="11.6" height="11.6"/><rect x="6.2" y="6.2" width="11.6" height="11.6" transform="rotate(45 12 12)"/></g></svg>';
        const EMBLEMS = ['rub', 'mosque', 'book-quran', 'star-and-crescent', 'kaaba', 'moon'], emblemOf = {};
        FP.STATIONS.filter((x) => !FP.faceOf(x) && x.id !== 'english').map((x) => x.id.replace(/^bn-/, '').replace(/-mj$/, ''))
            .filter((k, i, all) => all.indexOf(k) === i).forEach((k, i) => { emblemOf[k] = EMBLEMS[i % EMBLEMS.length]; });
        const emblem = (x) => (x.id === 'english' ? 'book-quran' : emblemOf[x.id.replace(/^bn-/, '').replace(/-mj$/, '')] || 'rub');
        function avatar(x, o) {
            const face = !o.own && FP.faceOf(x);
            const badge = x.group === 'bn' ? '<span class="fx-face-badge" aria-hidden="true">বাং</span>' : x.id === 'english' ? '<span class="fx-face-badge" aria-hidden="true">EN</span>' : '';
            if (o.own) return `<span class="fx-station-ico">${ico('tower-broadcast')}</span>`;
            if (face) return `<span class="fx-station-ico fx-face"><img src="${face}" alt="" loading="lazy" width="36" height="36">${badge}</span>`;
            const e = emblem(x);
            return `<span class="fx-station-ico fx-glyph">${e === 'rub' ? RUB : ico(e)}${badge}</span>`;
        }
        const RADIO_NOTE = 'Any https audio stream, or an .m3u / .pls link. It stays on this device.';
        const inGroup = (g) => FP.STATIONS.filter((x) => x.group === g);
        function drawRadio() {
            const m = myStations(), more = inGroup('more'), r = FP.state().radio;
            const open = moreOpen() || (!!r && more.some((x) => x.url === r.url));      /* a hidden reciter that plays stays in sight */
            radioBox.innerHTML = `<ul class="fx-stations">${inGroup('top').map((x) => station(x)).join('')}${more.map((x) => station(x, { more: true, open })).join('')}</ul>`
                + '<div class="fx-radio-foot">'
                + `<button type="button" class="fx-showmore" id="fx-showmore" aria-expanded="${open}">${showMoreLabel(open, more.length)}</button>`
                + `<button type="button" class="fx-text-btn fx-addst" id="fx-addst" aria-expanded="false" aria-controls="fx-addst-panel" title="Add your own stream">${ico('plus')}<span>Add</span></button></div>`
                + '<div class="fx-addst-panel" id="fx-addst-panel" hidden><div class="fx-paste">'
                + `<label class="fx-search">${ico('tower-broadcast')}<input type="url" id="fx-radio-url" placeholder="https://…" aria-label="Stream link" autocomplete="off"></label>`
                + `<button type="button" class="fx-btn fx-primary" id="fx-radio-go">${ico('play')}<span>Play</span></button></div>`
                + `<p class="fx-msg" id="fx-radio-msg">${RADIO_NOTE}</p></div>`
                + (m.length ? `<ul class="fx-stations">${m.map((x) => station(x, { own: true })).join('')}</ul>` : '')
                + `<p class="fx-st-group">${ico('language')}With Bangla meaning</p>`
                + `<ul class="fx-stations">${inGroup('bn').map((x) => station(x)).join('')}</ul>`
                + '<div class="fx-tuned" id="fx-tuned" hidden></div><p class="fx-radio-err" id="fx-radio-err" role="status" hidden></p>';
            $('fx-radio-go').addEventListener('click', addStation);
            $('fx-radio-url').addEventListener('keydown', (e) => { if (e.key === 'Enter') addStation(); });
            tunedDrawn = '';
            update();
        }
        function showMoreLabel(open, n) { return open ? `<span>Fewer</span>${ico('chevron-up')}` : `<span>${n} more reciters</span>${ico('chevron-down')}`; }
        function showMore(open) {
            local.set(MORE, open ? '1' : '0');
            const btn = $('fx-showmore'), head = btn.getBoundingClientRect().top;
            radioBox.querySelectorAll('.fx-st-more-item').forEach((li) => { li.hidden = !open; });
            btn.setAttribute('aria-expanded', String(open)); btn.innerHTML = showMoreLabel(open, inGroup('more').length);
            if (!open) {                                   /* closing from below: the button stays where the finger was */
                const now = btn.getBoundingClientRect().top;
                if (now !== head) window.scrollBy({ top: now - head, behavior: 'instant' });
            }
        }
        async function addStation() {
            const msg = $('fx-radio-msg');
            let url = $('fx-radio-url').value.trim();
            if (!/^https:\/\/\S+$/i.test(url)) {
                msg.textContent = /^http:/i.test(url) ? 'Only https streams can play on this page.' : "That doesn't look like a stream link. It should start with https://";
                msg.classList.add('is-err'); return;
            }
            if (/\.(m3u|pls)(\?|$)/i.test(url)) {          /* a playlist file: play the first https stream in it */
                try { const m = (await (await fetch(url)).text()).match(/https:\/\/[^\s"<>]+/); if (m) url = m[0]; } catch (e) {}
            }
            const known = FP.STATIONS.concat(myStations()).find((x) => x.url === url);
            const x = known || { url, name: hostOf(url) };
            if (!known) keepStations([x].concat(myStations()));
            FP.playRadio(x.url, x.name);
            drawRadio();
        }
        radioBox.addEventListener('click', (e) => {
            const del = e.target.closest('[data-del-station]');
            if (del) { e.stopPropagation(); keepStations(myStations().filter((x) => x.url !== del.dataset.delStation)); drawRadio(); return; }
            if (e.target.closest('#fx-showmore')) { showMore($('fx-showmore').getAttribute('aria-expanded') !== 'true'); return; }
            const add = e.target.closest('#fx-addst');
            if (add) {
                const open = $('fx-addst-panel').hidden;
                $('fx-addst-panel').hidden = !open; add.setAttribute('aria-expanded', String(open));
                if (open) $('fx-radio-url').focus();
                return;
            }
            const step = e.target.closest('[data-surah-step]');
            if (step) { const t = FP.state().radio.track; if (t) FP.surah(t.n + Number(step.dataset.surahStep)); return; }
            const b = e.target.closest('[data-url]'); if (!b) return;
            const r = FP.state().radio;
            if (r && r.url === b.dataset.url) FP.stopRadio(); else FP.playRadio(b.dataset.url, b.dataset.name);
        });
        radioBox.addEventListener('change', (e) => { if (e.target.id === 'fx-surah') FP.surah(Number(e.target.value)); });
        /* while a Bangla set plays: which surah, a picker for any other, previous and next */
        let tunedDrawn = '';
        function tuned(s) {
            const el = $('fx-tuned'); if (!el) return;
            const t = s.radio && s.radio.track;
            const key = t ? s.radio.url + '|' + t.n : '';
            if (key === tunedDrawn) return;
            tunedDrawn = key;
            el.hidden = !t;
            if (!t) { el.innerHTML = ''; return; }
            el.innerHTML = `<button type="button" class="fx-icon fx-ghost" data-surah-step="-1" aria-label="Previous surah" title="Previous surah">${ico('backward-step')}</button>`
                + `<label class="fx-sleep fx-surah">${ico('book-open')}<select id="fx-surah" aria-label="Surah">`
                + FP.SURAHS.map((n, i) => `<option value="${i + 1}"${i + 1 === t.n ? ' selected' : ''}>${i + 1}. ${esc(n)}</option>`).join('') + '</select></label>'
                + `<button type="button" class="fx-icon fx-ghost" data-surah-step="1" aria-label="Next surah" title="Next surah">${ico('forward-step')}</button>`;
        }

        /* ---- backup: the mix, the volumes and everything the visitor added, in one file ---- */
        const WHAT = 'Your mix, volumes, stations and visualizer in one file, to bring to another device';
        $('fx-backup').innerHTML = `<button type="button" class="fx-text-btn" id="fx-export" title="${WHAT}">${ico('download')}<span>Export settings</span></button>`
            + `<label class="fx-text-btn" tabindex="0" title="${WHAT}">${ico('upload')}<span>Import</span><input type="file" id="fx-import" accept="application/json,.json" hidden></label>`
            + '<span id="fx-backup-msg" role="status"></span>';
        let backupT = 0;
        const backupSay = (text, err) => {
            const el = $('fx-backup-msg'); el.textContent = text; el.classList.toggle('is-err', !!err);
            clearTimeout(backupT); backupT = setTimeout(() => { el.textContent = ''; }, 6000);
        };
        $('fx-export').addEventListener('click', () => {
            const s = FP.state();
            const data = { app: 'mehedi.pro.bd/focus', version: 1, exported: new Date().toISOString(), mix: s.mix, volume: s.master,
                radioVolume: s.radio ? s.radio.volume : undefined, stations: myStations(), visualizer: vizPrefs() };
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
            a.download = 'focus-settings.json'; document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(a.href), 2000);
            backupSay('Saved focus-settings.json');
        });
        $('fx-import').parentElement.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('fx-import').click(); } });
        $('fx-import').addEventListener('change', async (e) => {
            const f = e.target.files[0]; e.target.value = '';
            if (!f) return;
            try {
                const d = JSON.parse(await f.text());
                if (!d || d.app !== 'mehedi.pro.bd/focus') throw new Error('not a Focus backup');
                const list = (x) => (Array.isArray(x) ? x.filter((i) => i && typeof i === 'object') : []);
                keepStations(list(d.stations).filter((x) => /^https:\/\/\S+$/i.test(x.url)).map((x) => ({ url: x.url, name: String(x.name || hostOf(x.url)) })));
                if (d.visualizer && typeof d.visualizer === 'object') vizKeep({ on: !!d.visualizer.on, preset: typeof d.visualizer.preset === 'string' ? d.visualizer.preset : undefined });
                if (typeof d.volume === 'number') FP.setMaster(d.volume);
                if (typeof d.radioVolume === 'number') FP.setRadioVolume(d.radioVolume);
                if (d.mix && typeof d.mix === 'object') FP.setMix(Object.fromEntries(Object.entries(d.mix).filter(([k, v]) => BY[k] && typeof v === 'number')), false);
                drawRadio();
                backupSay('Imported. Press play when you are ready');
            } catch (err) { backupSay("That file isn't a Focus backup.", true); }
        });

        /* ---- credits: the recordings, the radio, the visualizer and every photo ---- */
        $('fx-credits-btn').addEventListener('click', (e) => {
            const open = $('fx-credits-body').hidden;
            $('fx-credits-body').hidden = !open; e.currentTarget.setAttribute('aria-expanded', String(open));
        });
        const archive = (id, label) => `<a href="https://archive.org/details/${id}" target="_blank" rel="noopener noreferrer">${label}</a>`;
        $('fx-credits-body').innerHTML = '<p>Sound recordings come from <a href="https://github.com/remvze/moodist" target="_blank" rel="noopener noreferrer">Moodist</a> '
            + 'by remvze (MIT), under the Pixabay License or CC0. Noise, binaural tones and the sci-fi hum are generated in your browser.</p>'
            + '<p>The radio streams Quran recitation from <a href="https://mp3quran.net/" target="_blank" rel="noopener noreferrer">mp3quran.net</a>. '
            + 'The Quran with Bangla meaning plays from sets on the Internet Archive: ' + FP.STATIONS.filter((x) => x.list).map((x) => archive(x.list, esc(x.name.replace(', Bangla', '')) + ' (' + esc(x.sub) + ')')).join(', ') + '. '
            + 'The visualizer is <a href="https://github.com/jberg/butterchurn" target="_blank" rel="noopener noreferrer">butterchurn</a> (MIT), a WebGL take on Milkdrop, with its community presets.</p>'
            + '<p>Reciters\' photos from Wikimedia Commons:</p><ul>' + Object.keys(FP.FACES).map((k) => {
                const [by, lic, file] = FP.FACES[k], stn = FP.STATIONS.find((x) => x.id === k);
                return `<li><a href="${commons(file)}" target="_blank" rel="noopener noreferrer">${esc(stn ? stn.name : k)}</a> <span>by ${esc(by)} · ${esc(lic)}</span></li>`;
            }).join('') + '</ul>'
            + '<p>Scene photos from Wikimedia Commons:</p><ul>' + Object.keys(FP.SCENES).map((k) => {
                const [place, by, lic, file] = FP.SCENES[k];
                return `<li><a href="${commons(file)}" target="_blank" rel="noopener noreferrer">${esc(place)}</a> <span>by ${esc(by)} · ${esc(lic)}</span></li>`;
            }).join('') + '</ul>';

        /* ---- keep everything in step with the player ---- */
        const RING = 339.3;
        let drawn = '', layersDrawn = null, ready = false, leadWas = '', vizTune = '';
        const live = (s) => s.playing || !!(s.radio && s.radio.on);
        function subline(s) {
            const n = Object.keys(s.mix).length, parts = [];
            if (n) parts.push(n + (n === 1 ? ' sound' : ' sounds'));
            if (s.radio) parts.push(s.radio.on && s.radio.loading ? 'Radio, tuning in' : s.radio.track ? `Surah ${s.radio.track.n} · ${s.radio.track.name}` : 'Radio');
            parts.push(live(s) ? 'playing' : 'paused');
            if (s.timer.running) parts.push(FP.PHASES[s.timer.phase][0] + ' ' + FP.clock(s.timer.left));
            if (s.sleep) parts.push('Sleep ' + FP.clock(s.sleep));
            return parts.join(' · ');
        }
        function timer(s) {
            const t = s.timer, partial = t.left < t.total, round = (s.done % 4) + 1, focus = t.phase === 'focus';
            const waiting = focus && !t.running && !partial && s.done > 0;          /* a break just ended: the next round is one tap away */
            $('fx-time').textContent = FP.clock(t.left);
            $('fx-phase').textContent = focus
                ? (t.running ? `Round ${round} of 4` : partial ? `Round ${round} · paused` : waiting ? `Break over · start round ${round}` : 'Press play to start round 1')
                : (t.running ? BREAK_TIPS[s.done % BREAK_TIPS.length] : FP.PHASES[t.phase][0] + (partial ? ' · paused' : ''));
            const filled = focus ? (s.done % 4) : (t.phase === 'long' ? 4 : ((s.done - 1) % 4) + 1);
            $('fx-dots').querySelectorAll('i').forEach((d, i) => { d.classList.toggle('is-on', i < filled); d.classList.toggle('is-now', focus && t.running && i === filled); });
            $('fx-dots').parentElement.title = `${filled} of 4 rounds before the long break`          /* today's total, for whoever looks */
                + (s.done ? ` · today: ${s.done} ${s.done === 1 ? 'round' : 'rounds'}, ${s.mins} minutes` : '');
            $('fx-timer').classList.toggle('is-waiting', waiting);
            $('fx-timer').classList.toggle('is-break', !focus && t.running);
            $('fx-timer').querySelectorAll('[data-phase] b').forEach((b) => { b.textContent = FP.PHASES[b.parentElement.dataset.phase][1]; });
            if (document.activeElement !== $('fx-plan')) $('fx-plan').value = s.plan;
            $('fx-ring').style.strokeDashoffset = String(RING * (1 - t.left / t.total));
            const go = $('fx-tgo');
            if (go.dataset.on !== String(t.running)) {
                go.dataset.on = String(t.running); go.innerHTML = ico(t.running ? 'pause' : 'play');
            }
            go.setAttribute('aria-label', t.running ? 'Pause the timer' : partial ? 'Resume the timer' : 'Start the timer');
            $('fx-timer').classList.toggle('is-running', t.running);
            $('fx-timer').querySelectorAll('[data-phase]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.phase === t.phase)));
            const mixed = Object.keys(s.mix).length > 0 || !!s.radio;
            $('fx-sleep-left').textContent = s.sleep ? FP.clock(s.sleep) + ' left' : '';
            const sel = $('fx-sleep');
            if (document.activeElement !== sel) {          /* follows a timer set elsewhere (another page, a reload) or one that ran out */
                if (!s.sleep) sel.value = '0';
                else if (sel.value === '0') sel.value = String([15, 30, 45, 60, 90, 120].find((m) => m * 60000 >= s.sleep) || 120);
            }
            $('fx-timer').classList.toggle('is-sleeping', !!s.sleep);
            $('fx-sub').textContent = subline(s);
            $('fx-view-sub').textContent = mixed ? subline(s) : 'Press play to start';
            const vt = $('fx-view-timer');
            vt.hidden = !(t.running || partial);
            vt.textContent = FP.PHASES[t.phase][0] + ' · ' + FP.clock(t.left);
            nowChips(s);
        }
        function update(kind) {
            const s = FP.state();
            timer(s);
            if (kind === 'tick') return;
            const ids = Object.keys(s.mix), on = live(s), mixed = ids.length > 0 || !!s.radio;
            page.toggleAttribute('data-mixed', mixed);
            page.toggleAttribute('data-live', on);
            const liveIn = { sounds: s.playing, radio: !!(s.radio && s.radio.on) };
            libTabs.forEach((t) => { t.classList.toggle('is-live', liveIn[t.dataset.tab]); });
            dock(); dodgeSoon();
            view.toggleAttribute('data-live', on);
            const name = mixed ? FP.title() : SUG.name;
            if (ready) swap($('fx-title'), name); else $('fx-title').textContent = name;
            ready = true;
            $('fx-name').textContent = FP.title();
            $('fx-view-name').textContent = name;
            $('fx-state').textContent = on ? 'Now playing' : mixed ? 'Paused' : 'Picked for ' + pick.when;
            [$('fx-play'), $('fx-bar-play'), $('fx-view-play')].forEach((b) => {
                if (b.dataset.on !== String(on)) { b.dataset.on = String(on); b.innerHTML = ico(on ? 'pause' : 'play'); }
                b.setAttribute('aria-label', (on ? 'Pause' : 'Play') + ' (Space)');
            });
            document.querySelectorAll('.fx-master').forEach((el) => { setSlider(el, s.master); el.classList.toggle('is-muted', s.master === 0); });
            presetBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.preset === s.preset)));
            const preset = FP.PRESETS.find((x) => x.id === s.preset), station = s.radio && FP.STATIONS.find((x) => x.url === s.radio.url);
            if ($('fx-presets-cur')) $('fx-presets-cur').textContent = preset ? preset.name : (ids.length ? 'Custom mix' : SUG.name);
            presetsPill.classList.toggle('is-plain', s.lead === 'radio' && !!s.radio);     /* under a station the mix is named once, in its chip */
            const byRadio = s.lead === 'radio';
            const where = s.radio && s.radio.track ? `Surah ${s.radio.track.n} · ${s.radio.track.name}` : (station ? station.sub : 'Live radio') + ' · live';
            $('fx-about').textContent = byRadio ? where                 /* the mix under a station has its own small chip */
                : preset ? preset.sub          /* one line on what is playing */
                : ids.length ? ids.length + (ids.length === 1 ? ' sound' : ' sounds') + ' · ' + FP.SCENES[s.scene][0]
                : SUG.sub;
            /* the big buttons act on what is in front, and say so */
            const both = !!s.radio && ids.length > 0, what = byRadio ? (s.radio.track ? 'surah' : 'station') : 'mix';
            [['fx-prev', 'Previous'], ['fx-next', 'Next'], ['fx-view-prev', 'Previous'], ['fx-view-next', 'Next']].forEach(([id, w]) => {
                $(id).setAttribute('aria-label', w + ' ' + what); $(id).title = w + ' ' + what + ' (' + (w === 'Next' ? 'N' : 'P') + ')';
            });
            const shuf = byRadio ? (s.radio.track ? 'A random surah' : 'Another reciter, picked at random') : 'Shuffle: a surprise mix';
            $('fx-shuffle').setAttribute('aria-label', shuf); $('fx-shuffle').title = shuf;
            if (both && leadWas && leadWas !== s.lead) say('The big buttons now control ' + (byRadio ? s.radio.name : s.mixName));
            leadWas = both ? s.lead : '';
            const layers = ids.length + (s.radio ? 1 : 0);
            $('fx-mixcount').textContent = String(layers);
            $('fx-mixbtn').hidden = !layers;
            $('fx-mixbtn').setAttribute('aria-label', `Open the mix (${layers} ${layers === 1 ? 'layer' : 'layers'})`);
            const chip = presets.querySelector('[aria-pressed="true"]') || presets.querySelector('[data-suggested]');
            if (chip && chip !== chipOn) {        /* the chip row scrolls sideways to keep the playing mix in sight */
                const first = !chipOn; chipOn = chip;
                if (presets.scrollWidth > presets.clientWidth) presets.scrollTo({ left: chip.offsetLeft - (presets.clientWidth - chip.offsetWidth) / 2, behavior: first ? 'auto' : 'smooth' });
            }
            tiles.forEach((t) => {
                const id = t.dataset.id, inMix = id in s.mix, loading = s.loading.includes(id);
                t.classList.toggle('is-on', inMix);
                t.classList.toggle('is-loading', loading);
                t.classList.toggle('is-playing', inMix && s.playing && !loading);
                t.firstElementChild.setAttribute('aria-pressed', String(inMix));
                if (inMix) setSlider(t.lastElementChild, s.mix[id]);
            });
            const layersKey = ids.join() + '|' + (s.radio ? s.radio.url : '');
            if (layersDrawn !== layersKey) {
                layersDrawn = layersKey;
                $('fx-layers').innerHTML = ids.map((id) => `<li data-id="${id}" data-tint="${BY[id].cat}"><span class="fx-layer-ico">${ico(BY[id].icon)}</span>`
                    + `<span class="fx-layer-name">${esc(BY[id].label)}</span>${slider(BY[id].label + ' volume', s.mix[id])}`
                    + `<button type="button" class="fx-icon fx-ghost" data-remove aria-label="Remove ${esc(BY[id].label)}">${ico('xmark')}</button></li>`).join('')
                    + (s.radio ? `<li data-radio data-tint="noise"><span class="fx-layer-ico">${ico('tower-broadcast')}</span><span class="fx-layer-name">${esc(s.radio.name)}</span>`
                        + `${slider(s.radio.name + ' volume', s.radio.volume)}<button type="button" class="fx-icon fx-ghost" data-remove-radio aria-label="Stop the radio">${ico('xmark')}</button></li>` : '');
            }
            $('fx-layers').querySelectorAll('li[data-id]').forEach((li) => {
                setSlider(li.querySelector('.fx-vol'), s.mix[li.dataset.id]);
                li.classList.toggle('is-loading', s.loading.includes(li.dataset.id));
            });
            const radioRow = $('fx-layers').querySelector('[data-radio]');
            if (radioRow) { setSlider(radioRow.querySelector('.fx-vol'), s.radio.volume); radioRow.classList.toggle('is-loading', s.radio.on && s.radio.loading); }
            if (!ids.length && !s.radio) mixer(false);
            const tune = (s.preset || ids.join()) + '|' + (s.radio ? s.radio.url : '');
            if (tune !== vizTune) { if (vizTune && vizOn && !vizPinned && !reduced && mixed) vizGo(1, 4); vizTune = tune; }
            const sc = s.scene || SUG.scene;
            if (sc !== drawn) {
                drawn = sc;
                page.querySelectorAll('[data-scenes]').forEach((box) => paint(box, sc));
                if (!view.hidden) paint(viewScenes, sc);
                const [place, by, lic, file] = FP.SCENES[sc];
                $('fx-view-credit').innerHTML = `Photo: <a href="${commons(file)}" target="_blank" rel="noopener noreferrer">${esc(place)}</a> · ${esc(by)} · ${esc(lic)}`;
            }
            radioBox.querySelectorAll('[data-url]').forEach((b) => {
                const here = !!s.radio && s.radio.url === b.dataset.url, sub = b.querySelector('small');
                const want = !here ? '' : s.radio.track ? `${s.radio.track.n}. ${s.radio.track.name}` : s.radio.on && s.radio.loading ? 'Tuning in…' : s.radio.on ? 'Live' : 'Paused';
                if (sub.textContent !== want) sub.textContent = want;
                b.classList.toggle('is-on', here);
                b.classList.toggle('is-loading', here && s.radio.on && s.radio.loading);
                b.classList.toggle('is-playing', here && s.radio.on && !s.radio.loading);
            });
            const err = $('fx-radio-err');
            if (err && s.radioError && radioBox.dataset.err !== s.radioError) {
                radioBox.dataset.err = s.radioError;
                err.textContent = `“${s.radioError}” didn't play. The station may be offline for a moment; try it again, or pick another.`; err.hidden = false;
            } else if (err && !s.radioError && radioBox.dataset.err) { delete radioBox.dataset.err; err.hidden = true; }
            tuned(s);
        }
        const off = FP.on(update);
        addEventListener('pagehide', off);
        drawRadio();

        /* the sound board's tiles: all now for a link to one of its groups; in the first frame when the board is in sight
           (or its panel is closed, where they cost little); else all at once when it comes within a quarter screen, and a
           group at a time while the page is idle (each a short task, so a tap meanwhile isn't kept waiting) */
        if (/^#fx-g-/.test(location.hash)) board();
        else requestAnimationFrame(() => {
            const box = $('fx-groups');
            if (made || box.getBoundingClientRect().top < innerHeight + 100) { board(); return; }
            const io = 'IntersectionObserver' in window ? new IntersectionObserver((en) => {
                if (en.some((x) => x.isIntersecting)) { io.disconnect(); board(); }
            }, { rootMargin: '0px 0px 25% 0px' }) : null;
            if (io) io.observe(box);
            const step = () => {
                board(true);
                if (made < groups.length) { if ('requestIdleCallback' in window) requestIdleCallback(step, { timeout: 2000 }); else setTimeout(step, 50); }
                else if (io) io.disconnect();
            };
            if ('requestIdleCallback' in window) requestIdleCallback(step, { timeout: 4000 }); else setTimeout(step, 1500);
        });
        /* a group's address typed in before the board is whole: the jump found nothing, so make it and go there */
        addEventListener('hashchange', () => {
            if (!/^#fx-g-/.test(location.hash) || made >= groups.length) return;
            board();
            const g = document.getElementById(location.hash.slice(1));
            if (g) g.scrollIntoView({ block: 'start' });
        });

        /* a shared mix (?mix=rain:60,cafe:40) is loaded paused; play is one tap away */
        const url = new URL(location.href), shared = url.searchParams.get('mix');
        if (shared) {
            const mix = {};
            shared.split(',').forEach((x) => { const [id, v] = x.split(':'); if (BY[id]) mix[id] = Math.max(0, Math.min(100, Number(v) || 50)) / 100; });
            if (Object.keys(mix).length) FP.setMix(mix, false);
            url.searchParams.delete('mix'); history.replaceState(history.state, '', url);
        }

        /* Space plays and pauses, V opens the focus view, F goes full screen, M mutes, Esc closes */
        document.addEventListener('keydown', (e) => {
            if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented || typing(e.target) || (e.target.closest && e.target.closest('.fx-vol'))) return;
            const k = e.key.toLowerCase();
            if (e.key === ' ') {
                if (e.repeat || (e.target.closest && e.target.closest('button, a, summary, [role="button"]'))) return;
                e.preventDefault(); toggleAll();
            } else if (k === 'v') { if (view.hidden) openView(false, true); else closeView(); }
            else if (k === 'f') { if (!view.hidden && document.fullscreenElement) unfull(); else openView(true, true); }
            else if (k === 'm') FP.toggleMute();
            else if (k === 't') timerGo();
            else if (k === 'r') quranRadio();
            else if ((e.key === '[' || e.key === ']') && vizOn) vizGo(e.key === ']' ? 1 : -1, 2);
            else if (k === 'n' || k === 'p') { const s = FP.state(); if (Object.keys(s.mix).length || s.radio) (k === 'n' ? FP.next : FP.prev)(); }
            else if (e.key === 'Escape') {
                if (presetsWrap.classList.contains('is-open')) { presetsOpen(false); presetsPill.focus({ preventScroll: true }); return; }
                if (!keysList.hidden) { keys(false); return; }
                if (!view.hidden && !document.fullscreenElement) closeView(); else mixer(false);
            }
        });
    }
    /* focus.js comes later in the page; every deferred script has run by DOMContentLoaded */
    if (window.FocusPlayer) init(); else document.addEventListener('DOMContentLoaded', init, { once: true });
})();
