// Home dashboard (#overview): Dhaka's clock, the one reveal as it comes into view (charts draw in, figures count up),
// the loops (radar sweep, orbit, equaliser) running only while it is on screen, and the tiles' interactions.
(function () {
    const s = document.getElementById('overview');
    if (!s) return;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    // site storage can be blocked (then touching it throws): it is read and written only through these
    const local = {
        get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }
    };

    // Dhaka's time in the status line
    const clock = s.querySelector('[data-dash-clock]');
    const tick = () => {
        try {
            clock.textContent = new Date().toLocaleTimeString('en-US', {timeZone: 'Asia/Dhaka', hour: 'numeric', minute: '2-digit'});
        } catch (e) {}
    };
    if (clock) { tick(); setInterval(tick, 30000); }
    // and how far Dhaka (UTC+6 all year) is from the visitor: "3h ahead of you", "30m ahead of you", "same time as you"
    const diff = s.querySelector('[data-dash-diff]');
    if (diff) {
        const mins = 360 + new Date().getTimezoneOffset(), a = Math.abs(mins), h = Math.floor(a / 60), m = a % 60;
        diff.textContent = !mins ? 'same time as you'
            : (h ? h + 'h' : '') + (h && m ? ' ' : '') + (m ? m + 'm' : '') + (mins > 0 ? ' ahead of you' : ' behind you');
        diff.hidden = false;
    }

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
                p.inert = !on;   // they keep their place (the tile holds one height) but never take Tab or reach a screen reader
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
            if (!chat || !chat.ask) { location.href = './profile/#tools'; return; }
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

        // the visualizer, here in the stage: the Focus page's Milkdrop presets (butterchurn, MIT), hearing the player's
        // sounds and the radio. The library loads the first time it is switched on; it draws only while the stage is in
        // view and the tab is shown; a double-click (double-tap) brings another, and it changes by itself every 3
        // minutes. The last one is kept with the Focus page's, so either carries on where the other left it.
        const stage = q('.dash-fp-stage'), vizBtn = box.querySelector('[data-fp-act="visual"]');
        const VIZ_KEY = 'focus:viz', CDN = 'https://cdn.jsdelivr.net/npm/';
        const coarse = matchMedia('(pointer: coarse)').matches;
        let viz = null, vizLib = null, vizSet = {}, vizNames = [], vizOn = false, raf = 0, auto = 0, nameT = 0, inView = true;
        let canvas = null, nameEl = null;
        const hist = [];
        const prefs = () => { try { return JSON.parse(local.get(VIZ_KEY)) || {}; } catch (err) { return {}; } };
        const keep = (o) => local.set(VIZ_KEY, JSON.stringify(Object.assign(prefs(), o)));
        const script = (src) => new Promise((ok, no) => { const el = document.createElement('script'); el.src = src; el.onload = ok; el.onerror = no; document.head.appendChild(el); });
        const say = (text, err) => {
            nameEl.textContent = text;
            nameEl.classList.toggle('is-err', !!err);
            nameEl.classList.add('is-on');
            clearTimeout(nameT);
            nameT = setTimeout(() => nameEl.classList.remove('is-on'), err ? 6000 : 3500);
        };
        const fitCanvas = () => {
            if (!viz) return;
            const r = Math.min(window.devicePixelRatio || 1, 1.5), w = Math.round(stage.clientWidth * r), h = Math.round(stage.clientHeight * r);
            if (w && h && (canvas.width !== w || canvas.height !== h)) { canvas.width = w; canvas.height = h; try { viz.setRendererSize(w, h); } catch (err) {} }
        };
        const draw = () => {
            if (!viz || !vizOn || !inView || document.hidden) { raf = 0; return; }
            try { viz.render(); } catch (err) { setViz(false); return; }
            raf = requestAnimationFrame(draw);
        };
        const loop = () => { cancelAnimationFrame(raf); raf = 0; draw(); };
        const schedule = () => { clearTimeout(auto); if (vizOn && !still) auto = setTimeout(() => nextViz(5.7), 180000); };
        const loadViz = (name, blend) => {
            try { viz.loadPreset(vizSet[name], blend); keep({preset: name}); } catch (err) { return; }
            say(name + (coarse ? ' · double-tap for another' : ' · double-click for another'));
            schedule();
        };
        const nextViz = (blend) => {
            if (!vizNames.length) return;
            const recent = new Set(hist.slice(-24)), pool = vizNames.filter((n) => !recent.has(n)), from = pool.length ? pool : vizNames;
            const name = from[Math.floor(Math.random() * from.length)];
            hist.push(name);
            loadViz(name, blend);
        };
        const startViz = async () => {
            if (viz) return true;
            if (!document.createElement('canvas').getContext('webgl2')) { say('The visualizer needs WebGL 2, which this browser does not offer.', true); return false; }
            say('Loading the visualizer…');
            try {
                vizLib = vizLib || Promise.all([script(CDN + 'butterchurn@2.6.7/lib/butterchurn.min.js'), script(CDN + 'butterchurn-presets@2.4.7/lib/butterchurnPresets.min.js')]);
                await vizLib;
            } catch (err) { vizLib = null; say("The visualizer didn't load. Check the connection and try again.", true); return false; }
            const bc = window.butterchurn.default || window.butterchurn, bp = window.butterchurnPresets.default || window.butterchurnPresets;
            vizSet = bp.getPresets(); vizNames = Object.keys(vizSet);
            const tap = fp.tap(), r = Math.min(window.devicePixelRatio || 1, 1.5);
            canvas.width = Math.round(stage.clientWidth * r); canvas.height = Math.round(stage.clientHeight * r);
            viz = bc.createVisualizer(tap.ctx, canvas, {width: canvas.width, height: canvas.height, pixelRatio: 1, textureRatio: 1});
            viz.connectAudio(tap.node);
            const last = prefs().preset;
            if (last && vizSet[last]) { hist.push(last); loadViz(last, 0); } else nextViz(0);
            return true;
        };
        const setViz = async (on) => {
            if (on && !canvas) {
                canvas = document.createElement('canvas');
                canvas.className = 'dash-viz';
                stage.prepend(canvas);
                nameEl = document.createElement('span');
                nameEl.className = 'dash-viz-name';
                const full = document.createElement('a');
                full.className = 'dash-viz-full';
                full.href = './library/focus/#visual';
                full.setAttribute('aria-label', 'The visualizer full screen, on the Focus page');
                full.title = 'Full screen';
                full.innerHTML = '<i class="fa-solid fa-expand" aria-hidden="true"></i>';
                stage.append(nameEl, full);
                if ('IntersectionObserver' in window) new IntersectionObserver((en) => { inView = en[0].isIntersecting; loop(); }).observe(stage);
                if ('ResizeObserver' in window) new ResizeObserver(fitCanvas).observe(stage);
                document.addEventListener('visibilitychange', loop);
            }
            stage.classList.toggle('is-viz', on);
            vizBtn.setAttribute('aria-pressed', String(on));
            if (on && !(await startViz())) { stage.classList.remove('is-viz'); vizBtn.setAttribute('aria-pressed', 'false'); return; }
            vizOn = on;
            if (on) { fitCanvas(); loop(); schedule(); } else { cancelAnimationFrame(raf); raf = 0; clearTimeout(auto); }
        };
        // another visual: a double-click, or a double-tap (two taps within 400 ms; the browser's own dblclick after a
        // double-tap does not count twice)
        let lastTap = -1e9, lastSwap = -1e9;
        const swap = (t) => { if (t - lastSwap < 500) return; lastSwap = t; nextViz(2); };
        stage.addEventListener('dblclick', (e) => {
            if (!vizOn || e.target.closest('a, button')) return;
            e.preventDefault(); swap(e.timeStamp);
        });
        stage.addEventListener('pointerup', (e) => {
            if (!vizOn || e.pointerType === 'mouse' || e.target.closest('a, button')) return;
            if (e.timeStamp - lastTap < 400) { lastTap = -1e9; swap(e.timeStamp); } else lastTap = e.timeStamp;
        });

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
                } else if (act.dataset.fpAct === 'visual') {
                    // the visuals move to the sound, so a silent player starts its mix as they come on
                    const turnOn = !vizOn;
                    if (turnOn && empty) fp.usePreset(select.value || (presets[0] && presets[0].id));
                    else if (turnOn && !isOn(st)) fp.play();
                    setViz(turnOn);
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
        let cur = 0, mode = 'idle';   // in the tile: idle (no video), playing, paused
        let dock = null;
        try {
            const last = JSON.parse(local.get('lib:last'));
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
            local.set('lib:last', JSON.stringify({id: t.id, title: t.title, sub: t.sub, at: Date.now()}));
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
            // the track row steps aside only while the video really is in the screen: a black screen never stands alone
            yt.classList.toggle('is-in', dock ? !!(dock.holds && dock.holds(screen)) : mode !== 'idle');
            yt.querySelectorAll('[data-yt="toggle"]').forEach((b) => {
                b.querySelector('i').className = 'fa-solid ' + (state === 'playing' ? 'fa-pause' : 'fa-play');
                b.setAttribute('aria-label', state === 'playing' ? 'Pause' : 'Play');
            });
            // the strip's volume shows the dock's (one volume, wherever it is set)
            const v = dock && dock.volume ? dock.volume() : null;
            if (v) {
                const level = v.muted ? 0 : v.level, mute = yt.querySelector('[data-yt="mute"]');
                if (document.activeElement !== volRange) volRange.value = level;
                volRange.style.setProperty('--v', level + '%');
                mute.querySelector('i').className = 'fa-solid ' + (v.muted || !v.level ? 'fa-volume-xmark' : v.level < 50 ? 'fa-volume-low' : 'fa-volume-high');
                mute.setAttribute('aria-label', v.muted ? 'Unmute' : 'Mute');
                mute.setAttribute('aria-pressed', String(v.muted));
            }
        };
        // the strip under the video floats up while the pointer is on the card. Over the video itself (YouTube's frame)
        // the page hears no pointer, so the last move before it decides: one on the card keeps the strip up
        const volRange = yt.querySelector('[data-yt-vol]'), card = yt.closest('.dash-tile');
        let farT = 0;
        document.addEventListener('pointermove', (e) => {
            if (!yt.classList.contains('is-in') || e.pointerType !== 'mouse') return;
            const r = card.getBoundingClientRect(), on = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
            if (on) { clearTimeout(farT); farT = 0; yt.classList.add('is-near'); }
            else if (!farT && yt.classList.contains('is-near')) farT = setTimeout(() => { farT = 0; yt.classList.remove('is-near'); }, 300);
        }, {passive: true});
        volRange.addEventListener('input', () => { if (dock && dock.setVolume) dock.setVolume(+volRange.value); });
        yt.addEventListener('click', (e) => {
            const b = e.target.closest('[data-yt]');
            if (!b) return;
            const act = b.dataset.yt;
            if (act === 'mute') { if (dock && dock.volume) dock.setVolume(undefined, !dock.volume().muted); return; }
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

    // the contact band's AI button opens the chat's project discussion (the AI weighs the visitor's brief against his
    // real work); without the chat the link opens the contact page
    const aiDiscuss = s.querySelector('[data-ai-discuss]');
    if (aiDiscuss) aiDiscuss.addEventListener('click', (e) => {
        const chat = window.MehediChat;
        if (!chat || !chat.discuss) return;
        e.preventDefault();
        if (chat.open) chat.open();
        setTimeout(() => chat.discuss(), 350);    /* once the chat has opened, as the greeting bubble does */
    });

    // people: one face at a time steps into the spotlight and the line under the orbit names them; hovering or
    // focusing a face brings that one forward. The turns wait while the pointer is on the orbit, and stay still for
    // reduced motion
    const orbit = s.querySelector('.dash-orbit'), spot = s.querySelector('.dash-spot');
    if (orbit && spot) {
        const sats = [...orbit.querySelectorAll('.dash-sat')];
        let at = 0, held = false;
        const showSpot = (i) => {
            at = i;
            sats.forEach((x, k) => x.classList.toggle('is-spot', k === i));
            spot.querySelector('b').textContent = sats[i].dataset.name;
            spot.querySelector('span').textContent = sats[i].dataset.role;
            if (!still) { spot.classList.remove('is-swap'); void spot.offsetWidth; spot.classList.add('is-swap'); }
        };
        sats.forEach((x, i) => { x.addEventListener('pointerenter', () => showSpot(i)); x.addEventListener('focus', () => showSpot(i)); });
        orbit.addEventListener('pointerenter', () => { held = true; });
        orbit.addEventListener('pointerleave', () => { held = false; });
        orbit.addEventListener('focusin', () => { held = true; });
        orbit.addEventListener('focusout', () => { held = false; });
        orbit.classList.add('has-spot');
        showSpot(0);
        if (!still) setInterval(() => {
            if (held || document.hidden || !s.classList.contains('is-onscreen')) return;
            showSpot((at + 1) % sats.length);
        }, 3000);
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
