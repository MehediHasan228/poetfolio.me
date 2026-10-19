/**
 * Focus: layered ambient sounds, nasheeds from YouTube and a focus timer that keep playing while the
 * visitor moves around the site.
 *
 * The sound lives in the page where it started (the "host"). While something plays, a click on a link to
 * another page of the site opens that page in a full-screen frame over the host instead of leaving it, so
 * the sound never stops; the address bar, the title and the back button follow the framed page. Pages in
 * the frame load this script too, find the host's player and use it instead of starting their own.
 *
 * Sounds: focus/sounds/*.mp3 are 60s seamless loops cut from Moodist (github.com/remvze/moodist, MIT;
 * recordings under the Pixabay License or CC0). Noise and binaural tones are generated here, no download.
 */
(function () {
    'use strict';
    if (window.FocusPlayer) return;
    try {
        const t = window.top;
        if (t !== window && t.FocusPlayer && t.FocusPlayer.host) {
            window.FocusPlayer = t.FocusPlayer;
            t.FocusPlayer.attach(document);
            addEventListener('pagehide', () => t.FocusPlayer.detach(document));
            return;
        }
    } catch (e) { /* framed by another site: run on our own */ }

    const script = document.currentScript;
    const BASE = new URL('./', script ? script.src : location.href);
    const FOCUS_URL = new URL('../library/focus/', BASE).href;
    const IS_FOCUS = new URL(FOCUS_URL).pathname === location.pathname.replace(/index\.html$/, '');

    /* ---- catalogue ---- */
    const CATS = [['rain', 'Rain'], ['nature', 'Nature'], ['animals', 'Animals'], ['places', 'Places'], ['transport', 'Transport'],
        ['things', 'Things'], ['city', 'City'], ['noise', 'Noise and tones']];
    const SOUNDS = [
        ['light-rain', 'Light rain', 'rain', 'cloud-rain'], ['heavy-rain', 'Heavy rain', 'rain', 'cloud-showers-heavy'],
        ['thunder', 'Thunder', 'rain', 'bolt'], ['rain-window', 'Rain on a window', 'rain', 'window-maximize'],
        ['rain-umbrella', 'Rain on an umbrella', 'rain', 'umbrella'], ['rain-car', 'Rain on a car roof', 'rain', 'car-side'],
        ['rain-leaves', 'Rain on leaves', 'rain', 'leaf'], ['rain-tent', 'Rain on a tent', 'rain', 'campground'],
        ['river', 'River', 'nature', 'water'], ['waves', 'Waves', 'nature', 'umbrella-beach'], ['wind', 'Wind', 'nature', 'wind'],
        ['wind-trees', 'Wind in trees', 'nature', 'tree'], ['campfire', 'Campfire', 'nature', 'fire'], ['droplets', 'Droplets', 'nature', 'droplet'],
        ['jungle', 'Jungle', 'nature', 'seedling'], ['waterfall', 'Waterfall', 'nature', 'mountain'],
        ['birds', 'Birds', 'animals', 'dove'], ['crows', 'Crows', 'animals', 'crow'], ['crickets', 'Crickets', 'animals', 'bug'],
        ['frogs', 'Frogs', 'animals', 'frog'], ['owl', 'Owl', 'animals', 'feather'], ['cat', 'Cat purring', 'animals', 'cat'],
        ['seagulls', 'Seagulls', 'animals', 'kiwi-bird'],
        ['cafe', 'Café', 'places', 'mug-hot'], ['library', 'Library', 'places', 'book-open'], ['village-night', 'Village at night', 'places', 'moon'],
        ['restaurant', 'Restaurant', 'places', 'utensils'], ['office', 'Office', 'places', 'building'],
        ['train', 'Train', 'transport', 'train'], ['inside-train', 'Inside a train', 'transport', 'train-subway'], ['boat', 'Boat on the river', 'transport', 'sailboat'],
        ['keyboard', 'Keyboard', 'things', 'keyboard'], ['typewriter', 'Typewriter', 'things', 'pen-nib'], ['ceiling-fan', 'Ceiling fan', 'things', 'fan'],
        ['clock', 'Clock', 'things', 'clock'], ['kettle', 'Boiling kettle', 'things', 'fire-burner'], ['paper', 'Paper', 'things', 'file-lines'],
        ['wind-chimes', 'Wind chimes', 'things', 'bell'], ['vinyl', 'Vinyl crackle', 'things', 'record-vinyl'],
        ['traffic', 'Traffic', 'city', 'car'], ['busy-street', 'Busy street', 'city', 'city'], ['crowd', 'Crowd', 'city', 'users'], ['road', 'Road', 'city', 'road'],
        ['brown', 'Brown noise', 'noise', 'wave-square', 'Deep and warm', 'brown'], ['pink', 'Pink noise', 'noise', 'wave-square', 'Soft, like rainfall', 'pink'],
        ['white', 'White noise', 'noise', 'wave-square', 'Bright, blocks voices', 'white'],
        ['alpha', 'Binaural alpha', 'noise', 'headphones', '10 Hz, calm · headphones', 10], ['beta', 'Binaural beta', 'noise', 'headphones', '15 Hz, alert · headphones', 15],
        ['gamma', 'Binaural gamma', 'noise', 'headphones', '40 Hz, sharp · headphones', 40]
    ].map(([id, label, cat, icon, hint, gen]) => ({ id, label, cat, icon, hint: hint || '', gen: gen || null }));
    const BY = {}; SOUNDS.forEach((s) => { BY[s.id] = s; });
    const PRESETS = [
        { id: 'deep', name: 'Deep focus', sub: 'Brown noise under soft rain', icon: 'brain', mix: { brown: 0.55, 'light-rain': 0.3 } },
        { id: 'monsoon', name: 'Dhaka monsoon', sub: 'Heavy rain, thunder, the fan overhead', icon: 'cloud-showers-heavy', mix: { 'heavy-rain': 0.55, thunder: 0.35, 'rain-window': 0.35, 'ceiling-fan': 0.25 } },
        { id: 'cha', name: 'Tea stall', sub: 'Chatter, a boiling kettle, the street', icon: 'mug-hot', mix: { cafe: 0.5, kettle: 0.25, crowd: 0.2, traffic: 0.15 } },
        { id: 'coding', name: 'Late-night coding', sub: 'Keys, rain on the glass, brown noise', icon: 'laptop-code', mix: { keyboard: 0.35, 'rain-window': 0.4, brown: 0.25, clock: 0.12 } },
        { id: 'village', name: 'Village night', sub: 'Crickets, frogs, wind in the trees', icon: 'moon', mix: { crickets: 0.5, frogs: 0.35, 'wind-trees': 0.25, 'village-night': 0.2 } },
        { id: 'river', name: 'On the river', sub: 'Water, oars and birds', icon: 'sailboat', mix: { river: 0.5, boat: 0.35, birds: 0.2, wind: 0.15 } },
        { id: 'train', name: 'Night train', sub: 'Rails and rain on the window', icon: 'train-subway', mix: { 'inside-train': 0.55, 'rain-window': 0.3 } },
        { id: 'study', name: 'Study hall', sub: 'A quiet library, pages turning', icon: 'book-open', mix: { library: 0.5, paper: 0.2, clock: 0.12 } },
        { id: 'forest', name: 'Forest walk', sub: 'Birds, leaves and a stream', icon: 'tree', mix: { birds: 0.45, 'wind-trees': 0.35, river: 0.2 } },
        { id: 'coxs', name: "Cox's Bazar", sub: 'Waves, sea wind and gulls', icon: 'umbrella-beach', mix: { waves: 0.6, wind: 0.2, seagulls: 0.15 } },
        { id: 'cozy', name: 'Cozy evening', sub: 'Campfire, rain and a purring cat', icon: 'fire', mix: { campfire: 0.45, 'light-rain': 0.3, cat: 0.2 } },
        { id: 'cafe', name: 'Rainy café', sub: 'Café murmur with rain outside', icon: 'cloud-rain', mix: { cafe: 0.45, 'light-rain': 0.35, 'rain-umbrella': 0.15 } }
    ];
    const PHASES = { focus: ['Focus', 25], short: ['Short break', 5], long: ['Long break', 15] };

    /* ---- state, kept per browser so a new page can offer to resume ---- */
    const KEY = 'focus:v1';
    const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
    const st = Object.assign({ mix: {}, master: 0.8, preset: null, active: false, at: 0, yt: null, done: 0,
        timer: { phase: 'focus', running: false, endsAt: 0, left: PHASES.focus[1] * 60000 } }, read());
    Object.keys(st.mix).forEach((id) => { if (!BY[id]) delete st.mix[id]; });
    let saveTimer = 0;
    function save(now) {
        clearTimeout(saveTimer);
        const w = () => { st.at = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
        if (now) w(); else saveTimer = setTimeout(w, 250);
    }

    /* ---- listeners: the Focus page UI and the documents in the frame ---- */
    const listeners = new Set(), docs = new Set([document]);
    function emit() {
        listeners.forEach((fn) => { try { fn(); } catch (e) { listeners.delete(fn); } });
        docs.forEach((d) => {
            try { d.documentElement.classList.toggle('fp-playing', playing || !!ytOn); d.documentElement.classList.toggle('fp-busy', busy()); } catch (e) { docs.delete(d); }
        });
        render();
    }

    /* ---- audio ---- */
    let ctx = null, master = null, playing = false, ytOn = false, silent = null;
    const nodes = new Map(), buffers = new Map();
    const curve = (v) => v * v;            /* sliders feel even to the ear */
    function audio() {
        if (ctx) return ctx;
        const AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC();
        master = ctx.createGain(); master.gain.value = curve(st.master); master.connect(ctx.destination);
        try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
        return ctx;
    }
    /* iPhones mute web audio on the silent switch unless a media element is playing too */
    function keepAwake(on) {
        if (!silent) {
            const sr = 8000, n = sr / 2, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
            const s = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
            s(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); s(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
            v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); s(36, 'data'); v.setUint32(40, n * 2, true);
            silent = new Audio(URL.createObjectURL(new Blob([buf], { type: 'audio/wav' })));
            silent.loop = true; silent.setAttribute('playsinline', '');
        }
        if (on) silent.play().catch(() => {}); else silent.pause();
    }
    function generate(gen) {
        const sr = ctx.sampleRate;
        if (typeof gen === 'number') {                /* binaural: 200 Hz left, 200 + gen right; 4 s holds whole cycles, so it loops cleanly */
            const n = sr * 4, b = ctx.createBuffer(2, n, sr), l = b.getChannelData(0), r = b.getChannelData(1);
            for (let i = 0; i < n; i++) { const t = i / sr; l[i] = 0.3 * Math.sin(2 * Math.PI * 200 * t); r[i] = 0.3 * Math.sin(2 * Math.PI * (200 + gen) * t); }
            return b;
        }
        const n = sr * 8, f = sr / 2, raw = new Float32Array(n + f);
        let last = 0, b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < raw.length; i++) {
            const w = Math.random() * 2 - 1;
            if (gen === 'white') raw[i] = w * 0.25;
            else if (gen === 'pink') { b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; raw[i] = (b0 + b1 + b2 + w * 0.1848) * 0.11; }
            else { last = (last + 0.02 * w) / 1.02; raw[i] = last * 3.2; }
        }
        const b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0);
        for (let i = 0; i < n; i++) {                 /* the tail fades into the head, so the loop has no seam */
            if (i < f) { const t = (i / f) * Math.PI / 2; d[i] = raw[i] * Math.sin(t) + raw[n + i] * Math.cos(t); } else d[i] = raw[i];
        }
        return b;
    }
    function buffer(id) {
        if (!buffers.has(id)) {
            const s = BY[id];
            const p = s.gen ? Promise.resolve(generate(s.gen))
                : fetch(new URL('sounds/' + id + '.mp3', BASE)).then((r) => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
                    .then((ab) => new Promise((ok, no) => ctx.decodeAudioData(ab, ok, no)));
            p.catch(() => buffers.delete(id));
            buffers.set(id, p);
        }
        return buffers.get(id);
    }
    const ramp = (param, to, secs) => { const now = ctx.currentTime; param.cancelScheduledValues(now); param.setValueAtTime(param.value, now); param.setTargetAtTime(to, now, secs / 3); };
    async function start(id) {
        if (nodes.has(id)) return;
        const n = { gain: ctx.createGain(), src: null, loading: true };
        n.gain.gain.value = 0; n.gain.connect(master); nodes.set(id, n); emit();
        let buf;
        try { buf = await buffer(id); } catch (e) { nodes.delete(id); n.gain.disconnect(); emit(); return; }
        if (nodes.get(id) !== n) return;
        const src = ctx.createBufferSource();
        src.buffer = buf; src.loop = true;
        if (!BY[id].gen && buf.duration > 2) { src.loopStart = 0.03; src.loopEnd = buf.duration - 0.03; }   /* skips mp3 padding */
        src.connect(n.gain); src.start(0, src.loopStart || 0);
        n.src = src; n.loading = false;
        ramp(n.gain.gain, curve(st.mix[id] == null ? 0.5 : st.mix[id]), 1.2);
        emit();
    }
    function stop(id, secs) {
        const n = nodes.get(id);
        if (!n) return;
        nodes.delete(id);
        ramp(n.gain.gain, 0, secs || 0.6);
        setTimeout(() => { try { if (n.src) n.src.stop(); } catch (e) {} n.gain.disconnect(); }, (secs || 0.6) * 1000 + 150);
    }
    function play() {
        if (!Object.keys(st.mix).length && !st.yt) return;
        audio(); if (ctx.state !== 'running') ctx.resume();
        playing = Object.keys(st.mix).length > 0; st.active = true;
        Object.keys(st.mix).forEach(start);
        if (st.yt && !ytOn) playYouTube(st.yt.id, st.yt.title);
        keepAwake(true); media(); save(true); emit();
    }
    function pause() {
        playing = false;
        [...nodes.keys()].forEach((id) => stop(id, 0.5));
        keepAwake(false); media(); save(true); emit();
    }
    function toggleSound(id) {
        if (!BY[id]) return;
        st.preset = null;
        if (id in st.mix) { delete st.mix[id]; stop(id); if (!Object.keys(st.mix).length) { playing = false; keepAwake(!!ytOn); } }
        else { st.mix[id] = 0.5; if (playing) start(id); else play(); }
        media(); save(); emit();
    }
    function setVolume(id, v) {
        if (!(id in st.mix)) return;
        st.mix[id] = Math.max(0, Math.min(1, v));
        const n = nodes.get(id); if (n && !n.loading) ramp(n.gain.gain, curve(st.mix[id]), 0.15);
        save(); emit();
    }
    function setMaster(v) { st.master = Math.max(0, Math.min(1, v)); if (master) ramp(master.gain, curve(st.master), 0.15); save(); emit(); }
    function usePreset(id) {
        const p = PRESETS.find((x) => x.id === id); if (!p) return;
        Object.keys(st.mix).forEach((k) => { if (!(k in p.mix)) stop(k); });
        st.mix = Object.assign({}, p.mix); st.preset = p.id;
        if (playing) Object.keys(st.mix).forEach((k) => { const n = nodes.get(k); if (n && !n.loading) ramp(n.gain.gain, curve(st.mix[k]), 0.8); else start(k); });
        else play();
        media(); save(true); emit();
    }
    function setMix(mix, autoplay) {
        Object.keys(st.mix).forEach((k) => { if (!(k in mix)) stop(k); });
        st.mix = {}; Object.keys(mix).forEach((k) => { if (BY[k]) st.mix[k] = Math.max(0, Math.min(1, mix[k])); });
        st.preset = null;
        if (autoplay) play(); else { save(true); emit(); }
    }
    function clear() { pause(); st.mix = {}; st.preset = null; if (!ytOn && !st.timer.running) st.active = false; save(true); emit(); }
    function end() {             /* the pill's close button: everything stops, nothing is offered for resume */
        pause(); stopYouTube(); pauseTimer(); st.active = false; save(true); emit();
    }
    function title() {
        const p = PRESETS.find((x) => x.id === st.preset), n = Object.keys(st.mix).length;
        if (p) return p.name;
        if (n) return n === 1 ? BY[Object.keys(st.mix)[0]].label : n + ' sounds';
        return st.yt ? st.yt.title : 'Focus';
    }
    function media() {
        if (!('mediaSession' in navigator)) return;
        try {
            navigator.mediaSession.metadata = new MediaMetadata({ title: title(), artist: 'Focus · mehedi.pro.bd', artwork: [{ src: new URL('../mehedi-logo.png', BASE).href, sizes: '512x512', type: 'image/png' }] });
            navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
            navigator.mediaSession.setActionHandler('play', play);
            navigator.mediaSession.setActionHandler('pause', pause);
        } catch (e) {}
    }

    /* ---- YouTube: the video stays visible in a small dock, as YouTube requires ---- */
    let dock = null;
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    function playYouTube(id, name) {
        if (!/^[\w-]{11}$/.test(id || '')) return false;
        css();
        if (!dock) {
            dock = document.createElement('div');
            dock.id = 'fp-dock';
            dock.innerHTML = '<div class="fp-dock-head"><i class="fa-brands fa-youtube" aria-hidden="true"></i><b></b>'
                + '<button type="button" class="fp-btn" aria-label="Close the video"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div><div class="fp-dock-video"></div>';
            dock.querySelector('button').addEventListener('click', () => { stopYouTube(); });
            document.body.appendChild(dock);
        }
        dock.querySelector('b').textContent = name || 'YouTube';
        dock.querySelector('.fp-dock-video').innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&rel=0&playsinline=1" title="${esc(name || 'YouTube video')}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
        ytOn = true; st.yt = { id, title: name || '' }; st.active = true;
        keepAwake(true); save(true); emit();
        return true;
    }
    function stopYouTube() {
        if (dock) { dock.remove(); dock = null; }
        ytOn = false; st.yt = null;
        if (!playing) keepAwake(false);
        if (!playing && !st.timer.running && !Object.keys(st.mix).length) st.active = false;
        save(true); emit();
    }

    /* ---- focus timer: 25 minutes of work, then a break; every fourth break is a long one ---- */
    const T = st.timer;
    const left = () => (T.running ? Math.max(0, T.endsAt - Date.now()) : T.left);
    function startTimer() {
        if (T.running) return;
        audio(); if (ctx.state !== 'running') ctx.resume();     /* unlocked now, so the chime can sound later without a tap */
        T.running = true; T.endsAt = Date.now() + T.left; st.active = true; if (T.phase === 'focus') react('excited', 1500); save(true); emit(); }
    function pauseTimer() { if (!T.running) return; T.left = left(); T.running = false; save(true); emit(); }
    function resetTimer() { T.running = false; T.left = PHASES[T.phase][1] * 60000; save(true); emit(); }
    function setPhase(p) { if (!PHASES[p]) return; T.phase = p; T.running = false; T.left = PHASES[p][1] * 60000; save(true); emit(); }
    function chime(up) {
        try {
            audio(); if (ctx.state !== 'running') ctx.resume();
            (up ? [660, 880, 1320] : [880, 660, 523]).forEach((f, i) => {
                const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + i * 0.22;
                o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.18, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
                o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 1.2);
            });
        } catch (e) {}
    }
    function react(expr, ms) {
        docs.forEach((d) => { try { d.querySelectorAll('ai-orb-mascot').forEach((m) => { if (typeof m.triggerReaction === 'function') m.triggerReaction(expr, ms); }); } catch (e) {} });
    }
    function phaseEnd() {
        if (T.phase === 'focus') {
            st.done = (st.done || 0) + 1;
            T.phase = st.done % 4 === 0 ? 'long' : 'short';
            T.left = PHASES[T.phase][1] * 60000; T.running = true; T.endsAt = Date.now() + T.left;   /* the break starts by itself */
            chime(false); react('happy', 2400);
        } else {
            T.phase = 'focus'; T.left = PHASES.focus[1] * 60000; T.running = false;                 /* the next round waits for the visitor */
            chime(true); react('excited', 1800);
        }
        save(true); emit();
    }
    setInterval(() => {
        if (!T.running) return;
        if (Date.now() >= T.endsAt) phaseEnd(); else renderTime();
        listeners.forEach((fn) => { try { fn('tick'); } catch (e) { listeners.delete(fn); } });
    }, 1000);
    const clock = (ms) => { const s = Math.ceil(ms / 1000); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };

    const busy = () => playing || ytOn || T.running;
    const resumable = () => st.active && (Object.keys(st.mix).length > 0 || !!st.yt) && Date.now() - (st.at || 0) < 6 * 3600000;

    /* ---- the mini player, on every page while a session is on ---- */
    let pill = null, cssDone = false;
    function css() {
        if (cssDone) return; cssDone = true;
        const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = new URL('focus.css?v=1', BASE).href;
        document.head.appendChild(l);
    }
    function render() {
        const show = !(IS_FOCUS && !frame) && (busy() || resumable());
        if (dock) dock.classList.toggle('fp-low', !show);       /* no pill below it: the video sits lower */
        if (!show) { if (pill) { pill.remove(); pill = null; } return; }
        css();
        if (!pill) {
            pill = document.createElement('div');
            pill.id = 'fp-pill'; pill.setAttribute('role', 'region'); pill.setAttribute('aria-label', 'Focus player');
            pill.innerHTML = '<span class="fp-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>'
                + `<a class="fp-info" href="${FOCUS_URL}"><b></b><small></small></a>`
                + '<button type="button" class="fp-btn fp-play"><i aria-hidden="true"></i></button>'
                + '<button type="button" class="fp-btn fp-x" aria-label="Stop Focus"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>';
            pill.querySelector('.fp-play').addEventListener('click', () => { if (playing || ytOn) { pause(); if (ytOn) stopYouTube(); } else play(); });
            pill.querySelector('.fp-x').addEventListener('click', end);
            pill.querySelector('.fp-info').addEventListener('click', (e) => {
                if (!frame) return;
                e.preventDefault();
                if (IS_FOCUS) closeShell(true); else frame.contentWindow.location.href = FOCUS_URL;
            });
            document.body.appendChild(pill);
        }
        const on = playing || ytOn;
        pill.classList.toggle('is-on', on);
        pill.querySelector('b').textContent = title();
        const p = pill.querySelector('.fp-play');
        p.setAttribute('aria-label', on ? 'Pause' : 'Play');
        p.querySelector('i').className = 'fa-solid ' + (on ? 'fa-pause' : 'fa-play');
        renderTime();
    }
    function renderTime() {
        if (!pill) return;
        const on = playing || ytOn;
        pill.querySelector('small').textContent = T.running ? PHASES[T.phase][0] + ' · ' + clock(left()) : (on ? 'Playing' : 'Paused · tap play to resume');
    }

    /* ---- the shell: while something plays, other pages open in a frame over this one ---- */
    let frame = null;
    const hostUrl = location.href, hostTitle = document.title;
    function pageLink(u) {
        if (u.origin !== location.origin || !/(\/|\.html)$/.test(u.pathname)) return false;     /* files (the CV, images) open as usual */
        return !(u.pathname === location.pathname && u.search === location.search);              /* same page: a hash jump */
    }
    function openShell(url, push) {
        css();
        frame = document.createElement('iframe');
        frame.id = 'fp-shell'; frame.title = 'Page'; frame.setAttribute('allow', 'autoplay; clipboard-write; web-share; fullscreen');
        frame.src = url;
        frame.addEventListener('load', framed);
        document.body.appendChild(frame);
        document.documentElement.classList.add('fp-shell-on');
        if (push) history.pushState({ fpShell: 1 }, '', url);
        render();
    }
    function closeShell(push) {
        if (!frame) return;
        frame.remove(); frame = null;
        document.documentElement.classList.remove('fp-shell-on');
        document.title = hostTitle;
        if (push) history.pushState(null, '', hostUrl);
        render();
    }
    const wired = new WeakSet();
    function framed() {                       /* runs as soon as the framed page's own focus.js attaches, and again on load */
        if (!frame) return;
        let w, href;
        try { w = frame.contentWindow; href = w.location.href; } catch (e) { return; }
        if (href === 'about:blank') return;
        if (IS_FOCUS && new URL(href).pathname === new URL(hostUrl).pathname) { closeShell(false); history.replaceState(null, '', hostUrl); return; }
        history.replaceState({ fpShell: 1 }, '', href);
        document.title = w.document.title;
        const d = w.document;
        if (wired.has(d)) return;
        wired.add(d);
        /* other sites open in a new tab (they refuse to be framed); forms leaving the site take the whole tab */
        d.addEventListener('click', (e) => {
            const a = e.target.closest && e.target.closest('a[href]');
            if (!a || e.defaultPrevented) return;
            const u = new URL(a.href, d.baseURI);
            if (/^https?:$/.test(u.protocol) && u.origin !== location.origin && (!a.target || /^_(self|top|parent)$/.test(a.target))) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
            else if (IS_FOCUS && u.origin === location.origin && u.pathname === new URL(hostUrl).pathname && !(e.metaKey || e.ctrlKey || e.shiftKey)) { e.preventDefault(); closeShell(true); }
        });
        d.querySelectorAll('form[action]').forEach((f) => { try { if (new URL(f.action, d.baseURI).origin !== location.origin) f.target = '_top'; } catch (e) {} });
        render();
    }
    addEventListener('click', (e) => {          /* runs last, so links other scripts handle are left alone */
        if (frame || !busy() || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const a = e.target.closest && e.target.closest('a[href]');
        if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
        const u = new URL(a.href, location.href);
        if (!pageLink(u)) return;
        e.preventDefault(); openShell(u.href, true);
    });
    if (window.navigation && typeof navigation.addEventListener === 'function') {
        navigation.addEventListener('navigate', (e) => {   /* script-driven page changes (cards, the logo) */
            if (frame || !busy() || !e.cancelable || e.destination.sameDocument || e.navigationType !== 'push' || e.formData || e.downloadRequest) return;
            const u = new URL(e.destination.url);
            if (!pageLink(u)) return;
            e.preventDefault(); openShell(u.href, true);
        });
    }
    addEventListener('popstate', (e) => {
        const on = !!(e.state && e.state.fpShell);
        if (on && !frame) openShell(location.href, false);
        else if (!on && frame) closeShell(false);
    });
    addEventListener('storage', (e) => {        /* a theme picked inside the frame recolours the player too */
        if (e.key === 'mehedi_theme' && e.newValue) document.documentElement.setAttribute('data-theme', e.newValue);
    });

    window.FocusPlayer = {
        host: true, CATS, SOUNDS, PRESETS, PHASES, FOCUS_URL,
        state: () => ({ mix: Object.assign({}, st.mix), master: st.master, preset: st.preset, playing, yt: ytOn ? st.yt : null, active: st.active,
            loading: [...nodes].filter(([, n]) => n.loading).map(([id]) => id),
            timer: { phase: T.phase, running: T.running, left: left(), total: PHASES[T.phase][1] * 60000 }, done: st.done || 0 }),
        title, busy, play, pause, toggleSound, setVolume, setMaster, usePreset, setMix, clear, end,
        playYouTube, stopYouTube, startTimer, pauseTimer, resetTimer, setPhase, clock,
        on: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
        attach: (d) => { docs.add(d); if (frame && frame.contentDocument === d) framed(); emit(); }, detach: (d) => { docs.delete(d); }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', emit); else emit();
})();
