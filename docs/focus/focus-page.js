/**
 * The Focus page (library/focus): presets, the sound board, the timer, the current mix and nasheeds.
 * Everything here only drives window.FocusPlayer (focus/focus.js), which keeps playing across pages.
 */
(function () {
    'use strict';
    function init() {
        const FP = window.FocusPlayer;
        if (!FP) return;
        const $ = (id) => document.getElementById(id);
        const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        const ico = (n, extra) => `<i class="fa-solid fa-${n}${extra ? ' ' + extra : ''}" aria-hidden="true"></i>`;
        const svg = (d) => `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
        const BY = {}; FP.SOUNDS.forEach((s) => { BY[s.id] = s; });
        const typing = (el) => el && (/^(input|textarea|select)$/i.test(el.tagName) || el.isContentEditable);

        /* ---- now playing ---- */
        $('fx-now').innerHTML = `<div class="fx-now-row"><button type="button" class="fx-big" id="fx-big">${ico('play')}</button>`
            + '<div class="fx-now-text"><b id="fx-status">Ready to play</b><small id="fx-sub">Pick a preset, or a few sounds below</small></div>'
            + '<span class="fx-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span></div>'
            + `<label class="fx-vol">${ico('volume-low')}<input type="range" id="fx-master" min="0" max="100" aria-label="Volume">${ico('volume-high')}</label>`;
        $('fx-big').addEventListener('click', () => {
            const s = FP.state();
            if (s.playing || s.yt) { FP.pause(); if (s.yt) FP.stopYouTube(); }
            else if (Object.keys(s.mix).length) FP.play();
            else FP.usePreset('deep');
        });
        $('fx-master').addEventListener('input', (e) => FP.setMaster(e.target.value / 100));

        /* ---- timer ---- */
        $('fx-timer').innerHTML = `<div class="fx-card-head"><h3>${svg('<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5"/></g>')}Focus timer</h3><small id="fx-round"></small></div>`
            + '<div class="fx-phases" role="group" aria-label="Timer mode">'
            + Object.keys(FP.PHASES).map((k) => `<button type="button" data-phase="${k}">${esc(FP.PHASES[k][0])} ${FP.PHASES[k][1]}</button>`).join('') + '</div>'
            + '<div class="fx-clock"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="fx-ring-bg" cx="60" cy="60" r="54"/><circle class="fx-ring-fg" id="fx-ring" cx="60" cy="60" r="54"/></svg>'
            + '<div class="fx-clock-text" role="timer" aria-live="off"><b id="fx-time">25:00</b><small id="fx-phase">Focus</small></div></div>'
            + `<div class="fx-actions"><button type="button" class="fx-btn fx-primary" id="fx-tgo">${ico('play')}<span>Start</span></button>`
            + `<button type="button" class="fx-btn" id="fx-treset">${ico('rotate-left')}<span>Reset</span></button></div>`;
        $('fx-timer').querySelector('.fx-phases').addEventListener('click', (e) => { const b = e.target.closest('[data-phase]'); if (b) FP.setPhase(b.dataset.phase); });
        $('fx-tgo').addEventListener('click', () => { if (FP.state().timer.running) FP.pauseTimer(); else FP.startTimer(); });
        $('fx-treset').addEventListener('click', () => FP.resetTimer());

        /* ---- the current mix ---- */
        $('fx-mix').innerHTML = `<div class="fx-card-head"><h3>${svg('<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/></g>')}In this mix</h3><small id="fx-count"></small></div>`
            + '<ul class="fx-mix-list" id="fx-mix-list"></ul><p class="fx-mix-empty" id="fx-mix-empty">Nothing yet. Tap a preset or any sound and it shows up here with its own volume.</p>'
            + `<div class="fx-actions"><button type="button" class="fx-btn" id="fx-share">${ico('link')}<span>Share mix</span></button>`
            + `<button type="button" class="fx-btn" id="fx-clear">${ico('trash-can')}<span>Clear all</span></button></div>`;
        const mixList = $('fx-mix-list');
        mixList.addEventListener('input', (e) => { const li = e.target.closest('[data-id]'); if (li) FP.setVolume(li.dataset.id, e.target.value / 100); });
        mixList.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) FP.toggleSound(b.closest('[data-id]').dataset.id); });
        $('fx-clear').addEventListener('click', () => FP.clear());
        $('fx-share').addEventListener('click', () => {
            const mix = FP.state().mix, ids = Object.keys(mix);
            if (!ids.length) return;
            const url = FP.FOCUS_URL + '?mix=' + ids.map((id) => id + ':' + Math.round(mix[id] * 100)).join(',');
            const label = $('fx-share').querySelector('span'), done = (t) => { label.textContent = t; setTimeout(() => { label.textContent = 'Share mix'; }, 1800); };
            if (navigator.share && matchMedia('(pointer: coarse)').matches) navigator.share({ title: 'My Focus mix', url }).catch(() => {});
            else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => done('Link copied'), () => done('Copy failed'));
        });

        /* ---- presets ---- */
        $('fx-presets').innerHTML = FP.PRESETS.map((p) => `<button type="button" class="fx-preset" data-preset="${p.id}" aria-pressed="false">${ico(p.icon)}`
            + `<span><b>${esc(p.name)}</b><small>${esc(p.sub)}</small></span></button>`).join('');
        $('fx-presets').addEventListener('click', (e) => {
            const b = e.target.closest('[data-preset]'); if (!b) return;
            const s = FP.state();
            if (s.preset === b.dataset.preset && s.playing) FP.pause(); else FP.usePreset(b.dataset.preset);
        });

        /* ---- the sound board ---- */
        let cat = 'all', query = '';
        $('fx-cats').innerHTML = `<button type="button" data-cat="all" class="is-active"><span>All</span><b>${FP.SOUNDS.length}</b></button>`
            + FP.CATS.map(([k, l]) => `<button type="button" data-cat="${k}"><span>${esc(l)}</span><b>${FP.SOUNDS.filter((s) => s.cat === k).length}</b></button>`).join('');
        $('fx-sounds').innerHTML = FP.SOUNDS.map((s) => `<div class="fx-sound" data-id="${s.id}" data-cat="${s.cat}"><button type="button" aria-pressed="false">${ico(s.icon)}`
            + `<span><b>${esc(s.label)}</b><small>${esc(s.hint || FP.CATS.find((c) => c[0] === s.cat)[1])}</small></span></button>`
            + `<input type="range" min="0" max="100" aria-label="${esc(s.label)} volume"></div>`).join('');
        const tiles = [...$('fx-sounds').children];
        $('fx-sounds').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) FP.toggleSound(b.parentElement.dataset.id); });
        $('fx-sounds').addEventListener('input', (e) => FP.setVolume(e.target.parentElement.dataset.id, e.target.value / 100));
        function filter() {
            let shown = 0;
            tiles.forEach((t) => {
                const s = BY[t.dataset.id];
                const ok = (cat === 'all' || s.cat === cat) && (!query || (s.label + ' ' + s.hint + ' ' + s.cat).toLowerCase().includes(query));
                t.hidden = !ok; if (ok) shown++;
            });
            $('fx-empty').hidden = shown > 0;
        }
        $('fx-cats').addEventListener('click', (e) => {
            const b = e.target.closest('[data-cat]'); if (!b) return;
            cat = b.dataset.cat;
            $('fx-cats').querySelectorAll('button').forEach((x) => x.classList.toggle('is-active', x === b));
            filter();
        });
        $('fx-search').addEventListener('input', (e) => { query = e.target.value.trim().toLowerCase(); filter(); });

        /* ---- nasheeds and the visitor's own YouTube links ---- */
        const yt = $('fx-yt');
        let picks = [];
        try { picks = JSON.parse(yt.dataset.picks || '[]'); } catch (e) {}
        const LINKS = 'focus:links';
        const mine = () => { try { return JSON.parse(localStorage.getItem(LINKS)) || []; } catch (e) { return []; } };
        const keep = (list) => { try { localStorage.setItem(LINKS, JSON.stringify(list.slice(0, 12))); } catch (e) {} };
        const idOf = (text) => {
            const t = String(text).trim();
            if (/^[\w-]{11}$/.test(t)) return t;
            try {
                const u = new URL(t);
                if (/(^|\.)youtu\.be$/.test(u.hostname)) return u.pathname.slice(1, 12);
                if (/(^|\.)youtube(-nocookie)?\.com$/.test(u.hostname)) return u.searchParams.get('v') || (u.pathname.match(/\/(embed|shorts|live)\/([\w-]{11})/) || [])[2] || null;
            } catch (e) {}
            return null;
        };
        const pick = (p, del) => `<li><button type="button" class="fx-pick" data-yt="${esc(p.id)}" data-title="${esc(p.title)}">`
            + `<img src="https://i.ytimg.com/vi/${esc(p.id)}/mqdefault.jpg" alt="" loading="lazy" width="72" height="40"><span><b>${esc(p.title)}</b><small>${esc(p.sub || 'YouTube')}</small></span>`
            + (del ? `<i class="fa-solid fa-xmark fx-del" data-del="${esc(p.id)}" role="button" aria-label="Remove ${esc(p.title)}"></i>` : '') + '</button></li>';
        function drawYt() {
            const m = mine();
            yt.innerHTML = '<div class="fx-paste"><label class="fx-search"><i class="fa-brands fa-youtube" aria-hidden="true"></i>'
                + '<input type="url" id="fx-yt-url" placeholder="Paste a YouTube link" aria-label="YouTube link" autocomplete="off"></label>'
                + `<button type="button" class="fx-btn fx-primary" id="fx-yt-go">${ico('play')}<span>Play</span></button></div>`
                + '<p class="fx-yt-msg" id="fx-yt-msg">Anything from YouTube plays here and keeps going while you browse. Links you add stay on this device.</p>'
                + (m.length ? `<p class="fx-yt-sub">Your links</p><ul class="fx-picks">${m.map((p) => pick(p, true)).join('')}</ul>` : '')
                + `<p class="fx-yt-sub">My picks</p><ul class="fx-picks">${picks.map((p) => pick(p)).join('')}</ul>`;
            $('fx-yt-go').addEventListener('click', addLink);
            $('fx-yt-url').addEventListener('keydown', (e) => { if (e.key === 'Enter') addLink(); });
            update();
        }
        function addLink() {
            const input = $('fx-yt-url'), id = idOf(input.value), msg = $('fx-yt-msg');
            if (!id) { msg.textContent = "That doesn't look like a YouTube link. Try one like youtube.com/watch?v=..."; msg.classList.add('is-err'); return; }
            const known = picks.concat(mine()).find((p) => p.id === id);
            const p = known || { id, title: 'Your video', sub: 'YouTube' };
            if (!known) keep([p].concat(mine()));
            FP.playYouTube(p.id, p.title);
            drawYt();
            if (!known) fetch('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + id))
                .then((r) => (r.ok ? r.json() : null)).then((d) => {
                    if (!d) return;
                    keep(mine().map((x) => (x.id === id ? { id, title: d.title, sub: d.author_name } : x)));
                    if ((FP.state().yt || {}).id === id) FP.playYouTube(id, d.title);
                    drawYt();
                }).catch(() => {});
        }
        yt.addEventListener('click', (e) => {
            const del = e.target.closest('[data-del]');
            if (del) { e.stopPropagation(); keep(mine().filter((p) => p.id !== del.dataset.del)); drawYt(); return; }
            const b = e.target.closest('[data-yt]'); if (!b) return;
            if ((FP.state().yt || {}).id === b.dataset.yt) FP.stopYouTube(); else FP.playYouTube(b.dataset.yt, b.dataset.title);
        });

        /* ---- keep the page in step with the player ---- */
        const RING = 339.3;
        function timer(s) {
            const t = s.timer;
            $('fx-time').textContent = FP.clock(t.left);
            $('fx-phase').textContent = FP.PHASES[t.phase][0] + (t.running ? '' : ' · paused');
            $('fx-ring').style.strokeDashoffset = String(RING * (1 - t.left / t.total));
            $('fx-round').textContent = s.done ? s.done + (s.done === 1 ? ' round done' : ' rounds done') : '';
            const go = $('fx-tgo');
            go.querySelector('i').className = 'fa-solid fa-' + (t.running ? 'pause' : 'play');
            go.querySelector('span').textContent = t.running ? 'Pause' : (t.left < t.total ? 'Resume' : 'Start');
            $('fx-timer').querySelectorAll('[data-phase]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.phase === t.phase)));
        }
        function update(kind) {
            const s = FP.state();
            timer(s);
            if (kind === 'tick') return;
            const ids = Object.keys(s.mix), on = s.playing || !!s.yt;
            const big = $('fx-big');
            big.innerHTML = ico(on ? 'pause' : 'play'); big.setAttribute('aria-label', on ? 'Pause' : 'Play');
            $('fx-status').textContent = ids.length || s.yt ? FP.title() : 'Ready to play';
            $('fx-sub').textContent = on ? (ids.length ? ids.length + (ids.length === 1 ? ' sound' : ' sounds') : '') + (s.yt ? (ids.length ? ' · ' : '') + 'YouTube' : '') + ' · playing'
                : (ids.length ? 'Paused · press play' : 'Pick a preset, or a few sounds below');
            if (document.activeElement !== $('fx-master')) $('fx-master').value = Math.round(s.master * 100);
            $('fx-presets').querySelectorAll('[data-preset]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.preset === s.preset)));
            tiles.forEach((t) => {
                const id = t.dataset.id, inMix = id in s.mix;
                t.classList.toggle('is-on', inMix);
                t.classList.toggle('is-loading', s.loading.includes(id));
                t.querySelector('button').setAttribute('aria-pressed', String(inMix));
                const r = t.querySelector('input');
                if (inMix && document.activeElement !== r) r.value = Math.round(s.mix[id] * 100);
            });
            const drawn = [...mixList.children].map((li) => li.dataset.id).join();
            if (drawn !== ids.join()) {
                mixList.innerHTML = ids.map((id) => `<li data-id="${id}">${ico(BY[id].icon)}<span>${esc(BY[id].label)}</span>`
                    + `<input type="range" min="0" max="100" aria-label="${esc(BY[id].label)} volume"><button type="button" aria-label="Remove ${esc(BY[id].label)}">${ico('xmark')}</button></li>`).join('');
            }
            mixList.querySelectorAll('li').forEach((li) => { const r = li.querySelector('input'); if (document.activeElement !== r) r.value = Math.round(s.mix[li.dataset.id] * 100); });
            $('fx-mix-empty').hidden = ids.length > 0;
            $('fx-count').textContent = ids.length ? ids.length + (ids.length === 1 ? ' sound' : ' sounds') : '';
            $('fx-share').disabled = $('fx-clear').disabled = !ids.length;
            yt.querySelectorAll('[data-yt]').forEach((b) => b.classList.toggle('is-on', !!s.yt && s.yt.id === b.dataset.yt));
        }
        const off = FP.on(update);
        addEventListener('pagehide', off);
        drawYt();
        filter();

        /* a shared mix (?mix=rain:60,cafe:40) is loaded paused; play is one tap away */
        const shared = new URLSearchParams(location.search).get('mix');
        if (shared) {
            const mix = {};
            shared.split(',').forEach((x) => { const [id, v] = x.split(':'); if (BY[id]) mix[id] = Math.max(0, Math.min(100, Number(v) || 50)) / 100; });
            if (Object.keys(mix).length) { FP.setMix(mix, false); $('fx-sub').textContent = 'Shared mix loaded · press play'; }
        }

        /* space bar plays and pauses, unless typing or on a button */
        document.addEventListener('keydown', (e) => {
            if (e.key !== ' ' || e.repeat || typing(e.target) || (e.target.closest && e.target.closest('button, a, [role="button"]'))) return;
            e.preventDefault(); $('fx-big').click();
        });
    }
    /* focus.js comes later in the page; every deferred script has run by DOMContentLoaded */
    if (window.FocusPlayer) init(); else document.addEventListener('DOMContentLoaded', init, { once: true });
})();
