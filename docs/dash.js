// Home dashboard (#overview): Dhaka's clock, the one reveal as it comes into view (charts draw in, figures count up),
// the loops (radar sweep, orbit, equaliser) running only while it is on screen, and the tiles' interactions.
(function () {
    const s = document.getElementById('overview');
    if (!s) return;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Dhaka's time in the status line
    const clock = s.querySelector('[data-dash-clock]');
    const tick = () => {
        try {
            clock.textContent = new Date().toLocaleTimeString('en-US', {timeZone: 'Asia/Dhaka', hour: 'numeric', minute: '2-digit'});
        } catch (e) {}
    };
    if (clock) { tick(); setInterval(tick, 30000); }

    // every number in a figure counts up from zero together ("4 yrs 3 mos", "300+", "~50%")
    const countUp = (el) => {
        const text = el.textContent;
        const nums = text.match(/\d+/g);
        if (!nums) return;
        const t0 = performance.now();
        const step = (now) => {
            const k = Math.min(1, (now - t0) / 1100);
            const ease = 1 - Math.pow(1 - k, 3);
            let i = 0;
            el.textContent = text.replace(/\d+/g, () => String(Math.round(nums[i++] * ease)));
            if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window) {
        if (!still) s.classList.add('dash-wait');
        let revealed = false;
        new IntersectionObserver((entries) => {
            const seen = entries[0].isIntersecting;
            if (!still) s.classList.toggle('is-onscreen', seen);   // the loops run only while this is set
            if (seen && !revealed && !still) {
                revealed = true;
                s.classList.add('dash-in');
                s.querySelectorAll('.dash-kpi b').forEach(countUp);
            }
        }, {threshold: 0.1}).observe(s);
    }

    // a soft light follows the pointer inside each tile
    if (matchMedia('(hover: hover)').matches && !still) {
        s.querySelectorAll('.dash-tile').forEach((tile) => {
            let raf = 0;
            tile.addEventListener('pointermove', (e) => {
                if (raf) return;
                raf = requestAnimationFrame(() => {
                    raf = 0;
                    const r = tile.getBoundingClientRect();
                    tile.style.setProperty('--mx', (e.clientX - r.left) + 'px');
                    tile.style.setProperty('--my', (e.clientY - r.top) + 'px');
                });
            });
            tile.addEventListener('pointerleave', () => { tile.style.removeProperty('--mx'); tile.style.removeProperty('--my'); });
        });
    }

    // projects: every project in a 3D coverflow. The front card faces the visitor and the next ones turn away; it moves
    // on every few seconds while the dashboard is on screen, and waits while it is hovered, focused or touched (and for a
    // while after the visitor moves it). A side card comes to the front when chosen; the front card opens the projects
    // page. A kind's bar keeps only that kind in the flow; choosing it again brings them all back.
    const projTile = s.querySelector('.dash-projects');
    if (projTile) {
        const flow = projTile.querySelector('.dash-flow');
        const cards = [...flow.querySelectorAll('li')];
        const bars = projTile.querySelectorAll('.dash-bar');
        const [prev, next] = projTile.querySelectorAll('.dash-nav');
        const count = projTile.querySelector('.dash-feat-count');
        const meta = projTile.querySelector('.dash-meta');
        const metaText = meta ? meta.textContent : '';
        let front = 0;
        const shown = () => cards.filter((li) => !li.hidden);

        const place = () => {
            cards.forEach((li) => { if (li.hidden) { li.classList.remove('is-front'); li.classList.add('is-far'); } });
            const v = shown();
            const n = v.length;
            front = (front + n) % n;
            v.forEach((li, i) => {
                let o = i - front;                       // the shorter way round the ring
                if (o > n / 2) o -= n;
                if (o < -n / 2 + (n % 2 ? 0 : 1)) o += n;
                const d = Math.abs(o);
                li.style.setProperty('--o', o);
                li.style.setProperty('--d', Math.min(d, 3));
                li.classList.toggle('is-front', o === 0);
                li.classList.toggle('is-far', d > 2);
                li.setAttribute('aria-hidden', String(o !== 0));
                li.querySelector('a').tabIndex = o === 0 ? 0 : -1;
            });
            count.textContent = (n ? front + 1 : 0) + ' / ' + n;
            prev.disabled = next.disabled = n < 2;
        };

        let hold = 0;          // hovered or focused
        let quietUntil = 0;    // the visitor moved it: wait a while before moving on again
        const touched = () => { quietUntil = Date.now() + 8000; };
        const go = (dir) => { front += dir; place(); };
        prev.addEventListener('click', () => { touched(); go(-1); });
        next.addEventListener('click', () => { touched(); go(1); });

        // a side card comes forward; the front card is a link to the projects page
        flow.addEventListener('click', (e) => {
            const li = e.target.closest('li');
            if (!li || li.classList.contains('is-front')) return;
            e.preventDefault();
            touched();
            front = shown().indexOf(li);
            place();
        });
        flow.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                touched();
                go(e.key === 'ArrowRight' ? 1 : -1);
            }
        });
        // a sideways swipe moves it one card
        let x0 = null;
        flow.addEventListener('pointerdown', (e) => { x0 = e.clientX; touched(); });
        flow.addEventListener('pointerup', (e) => {
            if (x0 !== null && Math.abs(e.clientX - x0) > 40) go(e.clientX < x0 ? 1 : -1);
            x0 = null;
        });
        flow.addEventListener('pointerenter', () => { hold++; });
        flow.addEventListener('pointerleave', () => { hold = Math.max(0, hold - 1); x0 = null; });
        flow.addEventListener('focusin', () => { hold++; });
        flow.addEventListener('focusout', () => { hold = Math.max(0, hold - 1); });
        if (!still) {
            setInterval(() => {
                if (hold || Date.now() < quietUntil || document.hidden || !s.classList.contains('is-onscreen')) return;
                go(1);
            }, 3500);
        }

        bars.forEach((bar) => bar.addEventListener('click', () => {
            const on = bar.getAttribute('aria-pressed') !== 'true';
            bars.forEach((b) => b.setAttribute('aria-pressed', String(on && b === bar)));
            const kind = on ? bar.dataset.kind : null;
            cards.forEach((li) => { li.hidden = !!kind && !li.dataset.kinds.split(' ').includes(kind); });
            front = 0;
            projTile.classList.toggle('is-filtered', on);
            if (meta) meta.textContent = on ? kind + ' projects' : metaText;
            touched();
            place();
        }));
        place();
    }

    // stack: an area's button (or its name on the radar) lights its spoke and corner and lists its tools. The areas take
    // turns on their own: the chosen one's line fills (CSS), and when it is full the next is chosen. The line waits
    // while the tile is hovered, has keyboard focus or is off screen, and for a while after the visitor picks one.
    // A tool asks the site's AI how Mehedi uses it.
    const stackTile = s.querySelector('.dash-stack');
    if (stackTile) {
        const btns = [...stackTile.querySelectorAll('.dash-area')];
        const show = (i, keep) => {
            stackTile.querySelectorAll('.dash-spoke, .dash-vertex, .dash-radar-label').forEach((l) => l.classList.toggle('is-on', l.dataset.area === i));
            stackTile.querySelectorAll('.dash-area-tools').forEach((p) => {
                const on = p.dataset.area === i;
                if (on && p.hidden && !still) p.animate([{opacity: 0, transform: 'translateY(4px)'}, {opacity: 1, transform: 'none'}], {duration: 260, easing: 'ease-out'});
                p.hidden = !on;
            });
            if (keep) btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.area === i)));
        };
        const chosen = () => (stackTile.querySelector('.dash-area[aria-pressed="true"]') || btns[0]).dataset.area;
        let quiet = 0;
        const pick = (i) => {
            show(i, true);
            if (still) return;
            stackTile.classList.remove('is-auto');
            clearTimeout(quiet);
            quiet = setTimeout(() => stackTile.classList.add('is-auto'), 8000);
        };
        btns.forEach((b) => {
            b.addEventListener('click', () => pick(b.dataset.area));
            b.addEventListener('pointerenter', () => show(b.dataset.area, false));
            b.addEventListener('focus', () => show(b.dataset.area, false));
        });
        stackTile.querySelector('.dash-areas').addEventListener('pointerleave', () => show(chosen(), false));
        stackTile.querySelectorAll('.dash-radar-label').forEach((l) => {
            l.addEventListener('click', () => pick(l.dataset.area));
            l.addEventListener('pointerenter', () => show(l.dataset.area, false));
            l.addEventListener('pointerleave', () => show(chosen(), false));
        });
        stackTile.addEventListener('animationend', (e) => {
            if (e.animationName !== 'dash-cycle') return;
            const at = btns.findIndex((b) => b.dataset.area === chosen());
            show(btns[(at + 1) % btns.length].dataset.area, true);
        });
        if (!still) stackTile.classList.add('is-auto');
        show(chosen(), false);

        stackTile.addEventListener('click', (e) => {
            const tool = e.target.closest('[data-ask]');
            if (!tool) return;
            const chat = window.MehediChat;
            if (!chat || !chat.ask) { location.href = './stack/'; return; }
            const name = tool.dataset.ask;
            const q = chat.lang && chat.lang() === 'bn' ? 'মেহেদী তার কাজে ' + name + ' কীভাবে ব্যবহার করেন?' : 'How does Mehedi use ' + name + ' in his work?';
            if (chat.open) chat.open();
            setTimeout(() => chat.ask(q), 350);    /* once the chat has opened, as the greeting bubble does */
        });
    }

    // focus: the Focus page's controls, run from here. The Focus player (focus/focus.js, deferred after this script) is
    // the host's on every page, so it is read once the document has loaded; its listeners fire on every change and each
    // second while the timer runs. Without it the tile keeps its link to the Focus page.
    const focusTile = s.querySelector('.dash-focus');
    const runFocus = (fp) => {
        const q = (sel) => focusTile.querySelector(sel);
        const box = q('[data-fp]');
        const art = q('[data-fp-art]');
        const toggle = box.querySelector('[data-fp-act="toggle"]');
        const select = q('[data-fp-presets]');
        const openText = q('[data-fp-open] span');
        const presets = fp.PRESETS || [];
        presets.forEach((x) => select.add(new Option(x.name, x.id)));
        const custom = new Option('Your mix', '');
        custom.disabled = true;
        select.add(custom, 0);
        const soundsOff = new Option('Turn the sounds off', 'off');
        // the mix alone stops: each of its sounds is taken out, so the radio plays on
        const stopSounds = () => { try { Object.keys(fp.state().mix || {}).forEach((id) => fp.toggleSound(id)); } catch (e) {} };
        // the Quran radio: the Focus player's stations by group, and a way to turn it off while it plays
        const radioSel = q('[data-fp-radio]');
        const stations = fp.STATIONS || [];
        const GROUPS = {top: 'Murattal', more: 'More reciters', bn: 'With Bangla meaning'};
        const pickRadio = new Option('Choose a reciter', '');
        pickRadio.disabled = true;
        radioSel.add(pickRadio);
        const radioOff = new Option('Turn the radio off', 'off');
        Object.keys(GROUPS).forEach((g) => {
            const og = document.createElement('optgroup');
            og.label = GROUPS[g];
            stations.filter((x) => x.group === g).forEach((x) => og.appendChild(new Option(x.name, x.id)));
            if (og.children.length) radioSel.appendChild(og);
        });
        box.hidden = false;
        const clock = (ms) => { const m = Math.floor(ms / 60000), sec = Math.floor(ms / 1000) % 60; return m + ':' + String(sec).padStart(2, '0'); };
        const isOn = (st) => st.playing || !!(st.radio && st.radio.on);

        const render = () => {
            let st;
            try { st = fp.state(); } catch (e) { return; }
            const sounds = Object.keys(st.mix || {}).length;
            const on = isOn(st);
            const session = on || (st.active && (sounds > 0 || !!st.radio));
            const radioLeads = session && st.lead === 'radio';
            const chosen = presets.find((x) => x.id === (st.preset || select.value)) || presets[0];
            focusTile.classList.toggle('is-playing', on);
            select.value = st.preset || (session ? '' : (chosen ? chosen.id : ''));
            let face = null;
            try { if (radioLeads) face = fp.faceOf((fp.STATIONS || []).find((x) => x.url === st.radio.url)); } catch (e) {}
            const scene = session ? st.scene : chosen && chosen.scene;
            const src = face || (scene ? fp.sceneUrl(scene, 800) : '');
            if (src && art.getAttribute('src') !== src) art.src = src;
            art.hidden = !src;
            q('.dash-fp-stage').classList.toggle('is-face', !!face);   // a reciter's portrait sits as a round photo
            q('[data-fp-label]').textContent = on ? 'Now playing' : session ? 'Paused' : 'Ready to play';
            q('[data-fp-title]').textContent = session ? fp.title() : (chosen ? chosen.name : 'Focus');
            let sub = radioLeads ? (st.radio.track ? 'Surah ' + st.radio.track.name : 'Quran radio')
                : session ? sounds + (sounds === 1 ? ' sound' : ' sounds') : 'A ready-made mix';
            if (st.timer && st.timer.running) sub += ' · ' + clock(st.timer.left) + ' left';
            q('[data-fp-sub]').textContent = sub;
            const radioStn = st.radio ? stations.find((x) => x.url === st.radio.url) : null;
            if (st.radio && !radioOff.parentNode) radioSel.insertBefore(radioOff, pickRadio.nextSibling);   // at the top, outside the groups
            if (!st.radio && radioOff.parentNode) radioOff.remove();
            radioSel.value = radioStn ? radioStn.id : '';
            if (sounds > 0 && !soundsOff.parentNode) select.insertBefore(soundsOff, custom.nextSibling);
            if (!sounds && soundsOff.parentNode) soundsOff.remove();
            [['radio', !!st.radio], ['mix', sounds > 0]].forEach(([k, live]) => {
                q('[data-pick="' + k + '"]').classList.toggle('is-active', live);
                q('[data-pickwrap="' + k + '"]').classList.toggle('is-on', live);
                q('[data-off="' + k + '"]').hidden = !live;
            });
            toggle.querySelector('i').className = 'fa-solid ' + (on ? 'fa-pause' : 'fa-play');
            toggle.setAttribute('aria-label', on ? 'Pause' : 'Play');
            openText.textContent = session ? 'Open the Focus player' : 'Start a focus session';
        };

        box.addEventListener('click', (e) => {
            const act = e.target.closest('[data-fp-act]');
            if (!act) return;
            try {
                const st = fp.state();
                const empty = !Object.keys(st.mix || {}).length && !st.radio;
                if (act.dataset.fpAct === 'toggle') {
                    if (isOn(st)) fp.pause();
                    else if (empty) fp.usePreset(select.value || (presets[0] && presets[0].id));   // starts playing
                    else fp.play();
                } else if (act.dataset.fpAct === 'prev') fp.prev();
                else if (act.dataset.fpAct === 'next') fp.next();
                else if (act.dataset.fpAct === 'shuffle') fp.shuffle();
            } catch (err) {}
        });
        select.addEventListener('change', () => {
            if (select.value === 'off') { stopSounds(); return; }
            if (select.value) fp.usePreset(select.value);
        });
        q('.dash-fp-picks').addEventListener('click', (e) => {
            const off = e.target.closest('[data-off]');
            if (!off) return;
            if (off.dataset.off === 'mix') stopSounds();
            else fp.stopRadio();
        });
        radioSel.addEventListener('change', () => {
            if (radioSel.value === 'off') { fp.stopRadio(); return; }
            const x = stations.find((y) => y.id === radioSel.value);
            if (x) fp.playRadio(x.url, x.name);
        });
        fp.on(render);
        render();
    };
    if (focusTile) {
        if (window.FocusPlayer) runFocus(window.FocusPlayer);
        else addEventListener('DOMContentLoaded', () => { if (window.FocusPlayer) runFocus(window.FocusPlayer); }, {once: true});
    }

    // library: a small Watch & Listen player. With the site's dock (TubeDock in focus/focus.js) the video plays in this
    // tile's screen, lent to the dock, and moves to the corner when the visitor goes to another page, so the track keeps
    // playing; the tile shows and drives whatever the dock plays. Without the dock the video opens in the tile on its
    // own. It starts on the last track played in Watch & Listen, or the first.
    const yt = s.querySelector('[data-yt-mini]');
    if (yt) {
        const tracks = JSON.parse(yt.dataset.tracks).map((x) => Object.assign({}, x, {av: x.av ? new URL(x.av, location.href).href : ''}));
        const screen = yt.querySelector('.dash-yt-screen');
        const toggle = yt.querySelector('[data-yt="toggle"]');
        let cur = 0, mode = 'idle';   // in the tile: idle (no video), playing, paused
        let dock = null;
        try {
            const last = JSON.parse(localStorage.getItem('lib:last'));
            const at = last ? tracks.findIndex((x) => x.id === last.id) : -1;
            if (at >= 0) cur = at;
        } catch (e) {}
        const tell = (func) => {
            const f = screen.querySelector('iframe');
            if (f) f.contentWindow.postMessage(JSON.stringify({event: 'command', func, args: []}), 'https://www.youtube-nocookie.com');
        };
        const load = () => {
            const t = tracks[cur];
            screen.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + t.id + '?autoplay=1&rel=0&enablejsapi=1" title="' +
                t.title.replace(/"/g, '&quot;') + '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
            try { localStorage.setItem('lib:last', JSON.stringify({id: t.id, title: t.title, sub: t.sub, at: Date.now()})); } catch (e) {}
        };
        const show = () => {
            let t = tracks[cur], state = mode;
            if (dock) {
                const st = dock.state();
                if (st.open && st.track) {
                    const at = tracks.findIndex((x) => x.id === st.track.id);
                    if (at >= 0) cur = at;
                    t = st.track;
                    state = st.playing ? 'playing' : 'paused';
                } else state = 'idle';
            }
            yt.querySelector('[data-yt-title]').textContent = t.title;
            yt.querySelector('[data-yt-sub]').textContent = t.sub;
            yt.querySelector('[data-yt-av]').src = t.av || 'https://i.ytimg.com/vi/' + t.id + '/mqdefault.jpg';
            yt.querySelector('[data-yt-label]').textContent = state === 'playing' ? 'Now playing' : state === 'paused' ? 'Paused' : 'Up next';
            yt.classList.toggle('is-playing', state === 'playing');
            screen.hidden = dock ? !dock.state().open : mode === 'idle';
            toggle.querySelector('i').className = 'fa-solid ' + (state === 'playing' ? 'fa-pause' : 'fa-play');
            toggle.setAttribute('aria-label', state === 'playing' ? 'Pause' : 'Play');
        };
        yt.addEventListener('click', (e) => {
            const b = e.target.closest('[data-yt]');
            if (!b) return;
            const act = b.dataset.yt;
            if (dock) {
                const open = dock.state().open;
                if (act === 'toggle') {
                    if (open) dock.toggle();
                    else { screen.hidden = false; dock.play(tracks, cur); }   /* the screen shows first, so the video opens in it */
                }
                else if (open) { if (act === 'next') dock.next(); else dock.prev(); }
                else { cur = (cur + (act === 'next' ? 1 : -1) + tracks.length) % tracks.length; show(); }
                return;
            }
            if (act === 'toggle') {
                if (mode === 'idle') { load(); mode = 'playing'; }
                else if (mode === 'playing') { tell('pauseVideo'); mode = 'paused'; }
                else { tell('playVideo'); mode = 'playing'; }
            } else {
                cur = (cur + (act === 'next' ? 1 : -1) + tracks.length) % tracks.length;
                if (mode !== 'idle') { load(); mode = 'playing'; }
            }
            show();
        });
        show();
        const useDock = () => { if (window.TubeDock) { dock = window.TubeDock; dock.on(show); dock.slot(screen); show(); } };
        if (window.TubeDock) useDock(); else addEventListener('DOMContentLoaded', useDock, {once: true});
    }

    // career and library: a legend row and its piece of the chart light each other
    s.querySelectorAll('.dash-career, .dash-library').forEach((tile) => {
        const light = (k) => {
            tile.classList.toggle('is-picking', !!k);
            tile.querySelectorAll('[data-k]').forEach((el) => el.classList.toggle('is-hl', el.dataset.k === k));
        };
        tile.querySelectorAll('[data-k]').forEach((el) => {
            el.addEventListener('pointerenter', () => light(el.dataset.k));
            el.addEventListener('pointerleave', () => light(null));
        });
    });
})();
