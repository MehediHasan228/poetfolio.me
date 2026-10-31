/**
 * Focus: layered ambient sounds, Quran radio and a focus timer that keep playing while the
 * visitor moves around the site.
 *
 * The sound lives in the page where it started (the "host"). While something plays, a click on a link to
 * another page of the site opens that page in a full-screen frame over the host instead of leaving it, so
 * the sound never stops; the address bar, the title and the back button follow the framed page. Pages in
 * the frame load this script too, find the host's player and use it instead of starting their own.
 *
 * Sounds: focus/sounds/*.mp3 are 60s seamless loops cut from Moodist (github.com/remvze/moodist, MIT;
 * recordings under the Pixabay License or CC0). Noise, binaural tones and the sci-fi hum are generated here.
 * Scenes: focus/scenes/*.webp are photos from Wikimedia Commons, credited in SCENES; the mix picks one.
 * Radio: live Quran recitation from mp3quran.net; the Quran with Bangla meaning played surah by surah from
 * archive.org sets; or any stream the visitor pastes.
 */
(function () {
    'use strict';
    if (window.FocusPlayer) return;
    /* site storage can be blocked (then touching it throws): it is read and written only through these */
    const local = {
        get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }
    };
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
    const CATS = [['rain', 'Rain', 'window'], ['nature', 'Nature', 'forest'], ['animals', 'Animals', 'garden'], ['places', 'Places', 'teastall'],
        ['transport', 'Transport', 'train'], ['things', 'Things', 'desk'], ['city', 'City', 'city'], ['noise', 'Noise and tones', 'hills']];
    /* scene: [place, photographer, licence, Commons file] */
    const SCENES = {
        hills: ['Sajek Valley', 'G.B. G.Son', 'CC BY-SA 4.0', 'Of_Serene_Sajek_Valley.jpg'],
        monsoon: ['Fuller Road, Dhaka', 'Hasan Nahiyan Nobel', 'CC BY-SA 4.0', 'A_Vespa_in_Rain_at_Fuller_Road,_Dhaka.jpg'],
        window: ['Rain on the glass', 'ASaber91', 'CC BY 2.0', 'Window_in_the_rain_(26729717796).jpg'],
        teastall: ['A tea stall at night', 'চিত্রকথক', 'CC BY-SA 4.0', 'Tea_stall.jpg'],
        desk: ['Working late', 'Kuba Bożanowski', 'CC BY 2.0', 'Working_lat(t)e_(3583874642).jpg'],
        village: ['Village under the Milky Way', 'NPS', 'Public domain', 'Milky_Way_Galaxy_Over_North_Manitou_Village_(02d407c9-8929-4e76-b784-3f161060c0bb).jpg'],
        river: ['Sunset on the river', 'Syed Abhi', 'CC BY-SA 4.0', 'A_beautiful_sunset_of_Bangladesh.jpg'],
        train: ['Bangladesh Railway', 'Rafsanahmed', 'CC BY-SA 4.0', 'Scene_from_Bangladesh_Railway_train_5.jpg'],
        library: ['Suzzallo Reading Room', 'Guywelch2000', 'CC BY 4.0', 'Suzzallo_Reading_Room_University_of_Washington_restoration_Seattle_Washington_2026.jpg'],
        forest: ['Lawachara Forest', 'Abdulmominbd', 'CC BY-SA 4.0', 'Lawachara_Forest.jpg'],
        beach: ["Cox's Bazar at dusk", 'Thomas Faraday', 'CC BY-SA 4.0', "Cox's_Bazar_sea_Beach_(evening_sunset).jpg"],
        hearth: ['A cozy fire', 'Kaarina Dillabough', 'CC BY-SA 2.0', 'Cozy_fire_(45059571665).jpg'],
        cafe: ['Hot coffee on a rainy day', 'David Joyce', 'CC BY-SA 2.0', 'Hot_Coffee_on_a_rainy_day_-_Flickr_-_DeaPeaJay.jpg'],
        storm: ['Lightning over the hills', 'NOIRLab/NSF/AURA/J. Chu', 'CC BY 4.0', 'Lightning_Above_the_Mountaintop_(iotw2433a).jpg'],
        city: ['Traffic in the rain', 'ASaber91', 'CC BY 2.0', 'Traffic_in_the_rain_(26755138955).jpg'],
        garden: ['Tea garden, Srimangal', 'Xahidur Reza', 'CC BY 2.0', 'Tea_Garden_near_Srimangal,_Sylhet,_Bangladesh.jpg'],
        space: ['The Cosmic Cliffs', 'NASA, ESA, CSA, STScI', 'Public domain', 'James_Webb_Space_Telescope_NIRCam_Image_of_the_“Cosmic_Cliffs”_in_Carina_Nebula_(carina_nebula).png']
    };
    /* sounds whose own place differs from their category's */
    const SOUND_SCENE = { 'heavy-rain': 'storm', thunder: 'storm', 'rain-umbrella': 'monsoon', 'rain-car': 'monsoon', 'rain-leaves': 'forest', 'rain-tent': 'forest',
        river: 'river', waves: 'beach', wind: 'hills', 'wind-trees': 'garden', campfire: 'hearth', crows: 'village', crickets: 'village', frogs: 'village',
        owl: 'village', cat: 'hearth', seagulls: 'beach', cafe: 'cafe', library: 'library', 'village-night': 'village', restaurant: 'cafe', office: 'desk',
        boat: 'river', 'ceiling-fan': 'monsoon', clock: 'library', kettle: 'teastall', paper: 'library', 'wind-chimes': 'garden', vinyl: 'hearth', scifi: 'space' };
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
        ['gamma', 'Binaural gamma', 'noise', 'headphones', '40 Hz, sharp · headphones', 40],
        ['scifi', 'Sci-fi hum', 'noise', 'rocket', 'A starship engine room', 'drone']
    ].map(([id, label, cat, icon, hint, gen]) => ({ id, label, cat, icon, hint: hint || '', gen: gen || null }));
    const BY = {}; SOUNDS.forEach((s) => { BY[s.id] = s; });
    const PRESETS = [
        { id: 'deep', name: 'Deep focus', sub: 'Brown noise under soft rain', icon: 'brain', scene: 'hills', mix: { brown: 0.55, 'light-rain': 0.3 } },
        { id: 'monsoon', name: 'Dhaka monsoon', sub: 'Heavy rain, thunder, the fan overhead', icon: 'cloud-showers-heavy', scene: 'monsoon', mix: { 'heavy-rain': 0.55, thunder: 0.35, 'rain-window': 0.35, 'ceiling-fan': 0.25 } },
        { id: 'cha', name: 'Tea stall', sub: 'Chatter, a boiling kettle, the street', icon: 'mug-hot', scene: 'teastall', mix: { cafe: 0.5, kettle: 0.25, crowd: 0.2, traffic: 0.15 } },
        { id: 'coding', name: 'Late-night coding', sub: 'Keys, rain on the glass, brown noise', icon: 'laptop-code', scene: 'desk', mix: { keyboard: 0.35, 'rain-window': 0.4, brown: 0.25, clock: 0.12 } },
        { id: 'village', name: 'Village night', sub: 'Crickets, frogs, wind in the trees', icon: 'moon', scene: 'village', mix: { crickets: 0.5, frogs: 0.35, 'wind-trees': 0.25, 'village-night': 0.2 } },
        { id: 'river', name: 'On the river', sub: 'Water, oars and birds', icon: 'sailboat', scene: 'river', mix: { river: 0.5, boat: 0.35, birds: 0.2, wind: 0.15 } },
        { id: 'train', name: 'Night train', sub: 'Rails and rain on the window', icon: 'train-subway', scene: 'train', mix: { 'inside-train': 0.55, 'rain-window': 0.3 } },
        { id: 'study', name: 'Study hall', sub: 'A quiet library, pages turning', icon: 'book-open', scene: 'library', mix: { library: 0.5, paper: 0.2, clock: 0.12 } },
        { id: 'forest', name: 'Forest walk', sub: 'Birds, leaves and a stream', icon: 'tree', scene: 'forest', mix: { birds: 0.45, 'wind-trees': 0.35, river: 0.2 } },
        { id: 'coxs', name: "Cox's Bazar", sub: 'Waves, sea wind and gulls', icon: 'umbrella-beach', scene: 'beach', mix: { waves: 0.6, wind: 0.2, seagulls: 0.15 } },
        { id: 'cozy', name: 'Cozy evening', sub: 'Campfire, rain and a purring cat', icon: 'fire', scene: 'hearth', mix: { campfire: 0.45, 'light-rain': 0.3, cat: 0.2 } },
        { id: 'cafe', name: 'Rainy café', sub: 'Café murmur with rain outside', icon: 'cloud-rain', scene: 'cafe', mix: { cafe: 0.45, 'light-rain': 0.35, 'rain-umbrella': 0.15 } },
        { id: 'storm', name: 'Thunderstorm', sub: 'Heavy rain, thunder and wind', icon: 'cloud-bolt', scene: 'storm', mix: { 'heavy-rain': 0.6, thunder: 0.5, wind: 0.2 } },
        { id: 'starship', name: 'Starship', sub: 'An engine hum under brown noise', icon: 'rocket', scene: 'space', mix: { scifi: 0.6, brown: 0.25 } }
    ];
    const PHASES = { focus: ['Focus', 25], short: ['Short break', 5], long: ['Long break', 15] };
    /* minutes of focus, a short break and the long break after every fourth round */
    const PLANS = { classic: [25, 5, 15, 'Classic'], deep: [50, 10, 20, 'Deep work'], flow: [90, 20, 30, 'Flow'] };
    const usePlan = (id) => { const p = PLANS[id] || PLANS.classic; PHASES.focus[1] = p[0]; PHASES.short[1] = p[1]; PHASES.long[1] = p[2]; };
    /* mp3quran.net streams send CORS headers, so they play through the same chain (volume, limiter, visualizer) as the sounds;
       qurango.net first, its backup host when it stumbles. group: top (always shown), more (renowned reciters), bn (Bangla meaning) */
    const QR = 'https://qurango.net/radio/', QR2 = 'https://backup.qurango.net/radio/';
    const live = (group, sub) => ([id, name, path, note]) => ({ id, name, group, sub: note || sub, url: QR + path, alt: QR2 + path });
    /* the Quran with Bangla meaning: complete sets on archive.org, one file per surah, played in order */
    const set = ([id, name, item, sub]) => ({ id, name, group: 'bn', sub, list: item, url: 'https://archive.org/details/' + item });
    const STATIONS = [].concat(
        [['mishary', 'Mishary Alafasi', 'mishary_alafasi'], ['basit', 'Abdul Basit Abdus Samad', 'abdulbasit_abdulsamad'],
            ['minshawi', 'Muhammad Siddiq Al-Minshawi', 'mohammed_siddiq_alminshawi'], ['husary', 'Mahmoud Khalil Al-Husary', 'mahmoud_khalil_alhussary'],
            ['ghamdi', 'Saad Al-Ghamdi', 'saad_alghamdi'], ['maher', 'Maher Al-Muaiqly', 'maher'], ['dosari', 'Yasser Al-Dosari', 'yasser_aldosari'],
            ['english', 'Quran in English', 'translation_quran_english_basit', 'English meaning · Abdul Basit']].map(live('top', 'Murattal')),
        [['sudais', 'Abdul Rahman Al-Sudais', 'abdulrahman_alsudaes'], ['shuraim', 'Saud Al-Shuraim', 'saud_alshuraim'],
            ['huthaifi', 'Ali Al-Huthaifi', 'ali_alhuthaifi'], ['ajmy', 'Ahmad Al-Ajmy', 'ahmad_alajmy'],
            ['shatri', 'Abu Bakr Al-Shatri', 'shaik_abu_bakr_al_shatri'], ['abkr', 'Idrees Abkr', 'idrees_abkr'],
            ['abbad', 'Fares Abbad', 'fares_abbad'], ['qatami', 'Nasser Al-Qatami', 'nasser_alqatami'],
            ['ayyub', 'Muhammad Ayyub', 'mohammed_ayyub'], ['basfar', 'Abdullah Basfar', 'abdullah_basfer'],
            ['juhany', 'Abdullah Al-Juhany', 'abdullah_aljohany'], ['jaleel', 'Khalid Al-Jaleel', 'khalid_aljileel'],
            ['rifai', 'Hani Ar-Rifai', 'hani_arrifai'], ['tablawi', 'Mohammad Al-Tablawi', 'mohammad_altablaway'],
            ['ismail', 'Mustafa Ismail', 'mustafa_ismail'], ['jibreel', 'Muhammad Jibreel', 'mohammed_jibreel'],
            ['balilah', 'Bandar Balilah', 'bandar_balilah'], ['bukhatir', 'Salah Bukhatir', 'slaah_bukhatir'],
            ['basit-mj', 'Abdul Basit, mujawwad', 'abdulbasit_abdulsamad_mojawwad', 'Mujawwad'],
            ['minshawi-mj', 'Al-Minshawi, mujawwad', 'mohammed_siddiq_alminshawi_mojawwad', 'Mujawwad']].map(live('more', 'Murattal')),
        [['bn-mishary', 'Mishary Alafasi, Bangla', 'bdquran', 'Bangla meaning · Islamic Foundation'],
            ['bn-basit', 'Abdul Basit, Bangla', 'Al-QuranArabicToBanglaAudio', 'Bangla voice · Sayed Ismat Toha'],
            ['bn-shuraim', 'Saud Al-Shuraim, Bangla', 'AlQuranWithBengaliBanglaTranslation-ReciterSheikhSaudAlSuraima-VoiceZayedIqbal', 'Bangla voice · Zayed Iqbal'],
            ['bn-sudais', 'Sudais & Shuraim, Bangla', 'alquranwithbanglaaudio', 'Bangla voice · Sayed Ismat Toha']].map(set));
    /* reciters' photos (focus/reciters/*.webp, cropped from Wikimedia Commons): [photographer, licence, Commons file] */
    const FACES = {
        mishary: ['quranic.ru', 'Copyrighted free use', 'Мишари_Рашид.jpg'],
        minshawi: ['Unknown author', 'Public domain', 'Elminshwey.jpg'],
        husary: ['Zubairkhan1', 'Public domain', 'Hussary.jpg'],
        ghamdi: ['الشيخ هيثم الدخين', 'CC BY-SA 4.0', 'Saad_al_Ghamdi.jpg'],
        maher: ['وليد أيوب', 'CC BY-SA 3.0', 'Maher_Al_Mueaqly.png'],
        dosari: ['أحمد زين', 'CC BY-SA 3.0', 'Yasser_Al-Dosari.png'],
        sudais: ['India, Prime Minister\'s Office', 'GODL-India', 'Abdul-Rahman_Al-Sudais_(Cropped,_2011).jpg'],
        shuraim: ['India, Vice President\'s Secretariat', 'GODL-India', 'The_IMAM_of_Holy_Mosque_in_Makka_Al_Mukarramah,_Saudi_Arabia,_Sheikh_Dr._Saud_Bin_Ibrahem_Al_Shuraim_meeting_the_Vice_President,_Shri_Mohd._Hamid_Ansari,_in_New_Delhi_on_March_03,_2012_(cropped).jpg'],
        huthaifi: ['آيات', 'CC BY 3.0', 'Ali_al-Hudhayfi.jpg'],
        ajmy: ['أحمد زين', 'CC BY-SA 3.0', 'Ahmad_bin_Ali_Al-Ajmi.png'],
        qatami: ['Ayman dhū alghiná', 'CC BY-SA 4.0', 'صورة_شخصية_ناصر_القطامي.jpg'],
        juhany: ['الشيخ هيثم الدخين', 'CC BY-SA 4.0', 'Abdullah_Al_Juhany_(Cropped).png'],
        ismail: ['Unknown author', 'Public domain', 'Mustafa_Ismail_(1).jpg'],
        balilah: ['محبين يحيى الزعبي', 'CC BY-SA 3.0', 'Bandar_Baleela.jpg']
    };
    const SURAHS = ('Al-Fatihah,Al-Baqarah,Al-Imran,An-Nisa,Al-Ma\'idah,Al-An\'am,Al-A\'raf,Al-Anfal,At-Tawbah,Yunus,Hud,Yusuf,Ar-Ra\'d,Ibrahim,Al-Hijr,An-Nahl,'
        + 'Al-Isra,Al-Kahf,Maryam,Ta-Ha,Al-Anbiya,Al-Hajj,Al-Mu\'minun,An-Nur,Al-Furqan,Ash-Shu\'ara,An-Naml,Al-Qasas,Al-Ankabut,Ar-Rum,Luqman,As-Sajdah,'
        + 'Al-Ahzab,Saba,Fatir,Ya-Sin,As-Saffat,Sad,Az-Zumar,Ghafir,Fussilat,Ash-Shura,Az-Zukhruf,Ad-Dukhan,Al-Jathiyah,Al-Ahqaf,Muhammad,Al-Fath,'
        + 'Al-Hujurat,Qaf,Adh-Dhariyat,At-Tur,An-Najm,Al-Qamar,Ar-Rahman,Al-Waqi\'ah,Al-Hadid,Al-Mujadilah,Al-Hashr,Al-Mumtahanah,As-Saff,Al-Jumu\'ah,'
        + 'Al-Munafiqun,At-Taghabun,At-Talaq,At-Tahrim,Al-Mulk,Al-Qalam,Al-Haqqah,Al-Ma\'arij,Nuh,Al-Jinn,Al-Muzzammil,Al-Muddaththir,Al-Qiyamah,Al-Insan,'
        + 'Al-Mursalat,An-Naba,An-Nazi\'at,Abasa,At-Takwir,Al-Infitar,Al-Mutaffifin,Al-Inshiqaq,Al-Buruj,At-Tariq,Al-A\'la,Al-Ghashiyah,Al-Fajr,Al-Balad,'
        + 'Ash-Shams,Al-Layl,Ad-Duha,Ash-Sharh,At-Tin,Al-Alaq,Al-Qadr,Al-Bayyinah,Az-Zalzalah,Al-Adiyat,Al-Qari\'ah,At-Takathur,Al-Asr,Al-Humazah,Al-Fil,'
        + 'Quraysh,Al-Ma\'un,Al-Kawthar,Al-Kafirun,An-Nasr,Al-Masad,Al-Ikhlas,Al-Falaq,An-Nas').split(',');

    /* ---- state, kept per browser so a new page can offer to resume ---- */
    const KEY = 'focus:v1';
    const read = () => { try { return JSON.parse(local.get(KEY)) || {}; } catch (e) { return {}; } };
    const st = Object.assign({ mix: {}, master: 0.8, active: false, at: 0, done: 0, radio: null, radioVol: 0.8, sleep: 0, lead: 'mix',
        plan: 'classic', dip: true, day: '', mins: 0, tracks: {},
        timer: { phase: 'focus', running: false, endsAt: 0, left: PHASES.focus[1] * 60000 } }, read());
    Object.keys(st.mix).forEach((id) => { if (!BY[id]) delete st.mix[id]; });
    delete st.yt;                                          /* a YouTube nasheed saved before the player went */
    if (st.radio && st.radio.url) st.radio.url = st.radio.url.replace('//backup.qurango.net/', '//qurango.net/');   /* saved before the hosts swapped */
    usePlan(st.plan);
    const rollDay = () => { const d = new Date().toDateString(); if (st.day !== d) { st.day = d; st.done = 0; st.mins = 0; } };     /* rounds count per day */
    rollDay();
    let saveTimer = 0;
    function save(now) {
        clearTimeout(saveTimer);
        /* the scene goes with it: the Focus page's head reads it to preload the stage photo before any script runs */
        const w = () => { st.at = Date.now(); try { st.scene = scene() || undefined; } catch (e) {} local.set(KEY, JSON.stringify(st)); };
        if (now) w(); else saveTimer = setTimeout(w, 250);
    }

    /* ---- listeners: the Focus page UI and the documents in the frame ---- */
    const listeners = new Set(), docs = new Set([document]);
    function emit() {
        listeners.forEach((fn) => { try { fn(); } catch (e) { listeners.delete(fn); } });
        docs.forEach((d) => {
            try { d.documentElement.classList.toggle('fp-playing', playing || radioOn); d.documentElement.classList.toggle('fp-busy', busy()); } catch (e) { docs.delete(d); }
        });
        render();
    }

    /* ---- audio ---- */
    let ctx = null, master = null, playing = false, radioOn = false, silent = null;
    const nodes = new Map(), buffers = new Map();
    const curve = (v) => v * v;            /* sliders feel even to the ear */
    function audio() {
        if (ctx) return ctx;
        const AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC();
        master = ctx.createGain(); master.gain.value = masterLevel();
        const limit = ctx.createDynamicsCompressor(); limit.threshold.value = -10; limit.ratio.value = 3;   /* a stack of loud layers never clips */
        master.connect(limit).connect(ctx.destination);
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
    /* the sci-fi hum: detuned saws and a fifth through a slowly breathing low-pass, with a little air on top */
    function hum(out) {
        const parts = [];
        const osc = (f, type) => { const o = ctx.createOscillator(); o.type = type || 'sine'; o.frequency.value = f; o.start(); parts.push(o); return o; };
        const level = (v) => { const g = ctx.createGain(); g.gain.value = v; return g; };
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 380; lp.Q.value = 1.1; lp.connect(out);
        [[55, 'sawtooth', 0.11], [55.5, 'sawtooth', 0.11], [82.5, 'triangle', 0.09], [110, 'sine', 0.07]].forEach(([f, t, v]) => osc(f, t).connect(level(v)).connect(lp));
        osc(0.04).connect(level(140)).connect(lp.frequency);      /* opens and closes every 25 s */
        let stopped = false;
        buffer('pink').then((b) => {                /* the air joins once its noise is made (after the tap has painted) */
            if (stopped) return;
            const air = ctx.createBufferSource(), bp = ctx.createBiquadFilter();
            air.buffer = b; air.loop = true; bp.type = 'bandpass'; bp.frequency.value = 600; bp.Q.value = 0.7;
            air.connect(bp).connect(level(0.5)).connect(out); air.start(); parts.push(air);
        }, () => {});
        return { stop: () => { stopped = true; parts.forEach((p) => { try { p.stop(); } catch (e) {} }); } };
    }
    /* fn runs after the next frame is painted (or after 250 ms in a tab that draws no frames): making seconds of noise
       inside the tap that asked for it held that tap's frame back by over 100 ms on a slow phone */
    const afterPaint = (fn) => new Promise((ok, no) => {
        let done = false;
        const go = () => { if (done) return; done = true; try { ok(fn()); } catch (e) { no(e); } };
        requestAnimationFrame(() => setTimeout(go, 0));
        setTimeout(go, 250);
    });
    function buffer(id) {
        if (!buffers.has(id)) {
            const s = BY[id];
            const p = s.gen ? afterPaint(() => generate(s.gen))
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
        n.gain.gain.value = 0; n.gain.connect(master); nodes.set(id, n);
        if (BY[id].gen === 'drone') { n.src = hum(n.gain); n.loading = false; ramp(n.gain.gain, curve(st.mix[id] == null ? 0.5 : st.mix[id]), 1.2); emit(); return; }
        emit();
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
        if (!Object.keys(st.mix).length && !st.radio) return;
        audio(); if (ctx.state !== 'running') ctx.resume();
        playing = Object.keys(st.mix).length > 0; st.active = true;
        Object.keys(st.mix).forEach(start);
        if (st.radio && !radioOn) tune();
        keepAwake(true); media(); save(true); emit();
    }
    function pause() {
        playing = false;
        [...nodes.keys()].forEach((id) => stop(id, 0.5));
        detune();
        keepAwake(false); media(); save(true); emit();
    }
    function toggleSound(id) {
        if (!BY[id]) return;
        if (id in st.mix) { delete st.mix[id]; stop(id); if (!Object.keys(st.mix).length) { playing = false; keepAwake(radioOn); } }
        else { st.mix[id] = 0.5; st.lead = 'mix'; if (playing) start(id); else play(); }
        media(); save(); emit();
    }
    function setVolume(id, v) {
        if (!(id in st.mix)) return;
        st.mix[id] = Math.max(0, Math.min(1, v));
        const n = nodes.get(id); if (n && !n.loading) ramp(n.gain.gain, curve(st.mix[id]), 0.15);
        save(); emit();
    }
    let unmuted = st.master || 0.8;
    function setMaster(v) {
        st.master = Math.max(0, Math.min(1, v)); if (st.master > 0) unmuted = st.master;
        if (master && !fading) ramp(master.gain, masterLevel(), 0.15);
        level(); save(); emit();
    }
    const toggleMute = () => setMaster(st.master > 0 ? 0 : unmuted);
    function usePreset(id) {
        const p = PRESETS.find((x) => x.id === id); if (!p) return;
        Object.keys(st.mix).forEach((k) => { if (!(k in p.mix)) stop(k); });
        st.mix = Object.assign({}, p.mix); st.lead = 'mix';
        if (playing) Object.keys(st.mix).forEach((k) => { const n = nodes.get(k); if (n && !n.loading) ramp(n.gain.gain, curve(st.mix[k]), 0.8); else start(k); });
        else play();
        media(); save(true); emit();
    }
    function setMix(mix, autoplay) {
        Object.keys(st.mix).forEach((k) => { if (!(k in mix)) stop(k); });
        st.mix = {}; Object.keys(mix).forEach((k) => { if (BY[k]) st.mix[k] = Math.max(0, Math.min(1, mix[k])); });
        if (Object.keys(st.mix).length) st.lead = 'mix';
        nodes.forEach((n, k) => { if (!n.loading && k in st.mix) ramp(n.gain.gain, curve(st.mix[k]), 0.8); });
        if (!Object.keys(st.mix).length && playing) { playing = false; [...nodes.keys()].forEach((k) => stop(k)); keepAwake(radioOn); save(true); emit(); }
        else if (autoplay || playing) play(); else { save(true); emit(); }
    }
    /* a surprise mix: one bed to sit in, one or two details on top */
    function shuffle() {
        const pick = (list) => list[Math.floor(Math.random() * list.length)];
        const vol = (lo, hi) => Math.round((lo + Math.random() * (hi - lo)) * 100) / 100;
        const beds = SOUNDS.filter((s) => s.cat === 'rain' || s.cat === 'nature' || s.gen === 'brown' || s.gen === 'pink');
        const details = SOUNDS.filter((s) => /^(animals|places|transport|things|city)$/.test(s.cat));
        const mix = {}; mix[pick(beds).id] = vol(0.45, 0.65);
        for (let n = Math.random() < 0.5 ? 1 : 2; n > 0;) { const d = pick(details); if (!(d.id in mix)) { mix[d.id] = vol(0.15, 0.4); n--; } }
        setMix(mix, true);
    }
    function clear() { pause(); st.mix = {}; st.radio = null; if (!st.timer.running) st.active = false; media(); save(true); emit(); }
    function end() {             /* the pill's close button: everything stops, nothing is offered for resume */
        pause(); stopRadio(); pauseTimer(); setSleep(0); st.active = false; save(true); emit();
    }
    function matched() {         /* the preset this mix is, even when it was put together by hand */
        const ids = Object.keys(st.mix).sort().join();
        return (ids && PRESETS.find((p) => Object.keys(p.mix).sort().join() === ids)) || null;
    }
    const sceneOf = (id) => SOUND_SCENE[id] || CATS.find((c) => c[0] === BY[id].cat)[2];
    const sceneUrl = (key, w) => new URL('scenes/' + key + '-' + (w || 1600) + '.webp?v=2', BASE).href;     /* v: a photo was replaced */
    function scene() {           /* the preset's place, or the place of the loudest sound */
        const p = matched(); if (p) return p.scene;
        let top = null; Object.keys(st.mix).forEach((id) => { if (!top || st.mix[id] > st.mix[top]) top = id; });
        return top ? sceneOf(top) : null;
    }
    /* the lead is what the visitor chose last, the radio or the mix; next/previous, the title and the lock screen follow it */
    const lead = () => (st.radio && (st.lead === 'radio' || !Object.keys(st.mix).length) ? 'radio' : 'mix');
    function setLead(x) { st.lead = x === 'radio' ? 'radio' : 'mix'; media(); save(); emit(); }
    function mixTitle() {
        const p = matched(), ids = Object.keys(st.mix);
        if (p) return p.name;
        return ids.length ? ids.slice(0, 3).map((id) => BY[id].label).join(' · ') + (ids.length > 3 ? ' +' + (ids.length - 3) : '') : '';
    }
    function title() {
        if (lead() === 'radio') return st.radio.name;
        return mixTitle() || 'Focus';
    }
    /* the lock screen, headset buttons and media keys: next and previous step through the presets, or the stations when only the radio plays */
    const myStations = () => { try { return (JSON.parse(local.get('focus:stations')) || []).filter((x) => x && /^https:\/\//i.test(x.url)); } catch (e) { return []; } };
    function step(d) {
        const set = lead() === 'radio' && stationOf(st.radio.url);
        if (set && set.list) { surah(trackOf(set).n + d); return; }          /* in a set, next and previous are surahs */
        if (lead() === 'radio') {          /* the live stations, then the ones the visitor added; a set is entered by picking it */
            const list = STATIONS.filter((x) => !x.list).concat(myStations().filter((x) => !STATIONS.some((y) => y.url === x.url)));
            const i = list.findIndex((x) => x.url === st.radio.url), s = list[(Math.max(i, d > 0 ? -1 : 0) + d + list.length) % list.length];
            playRadio(s.url, s.name); return;
        }
        const p = matched(), i = p ? PRESETS.indexOf(p) : (d > 0 ? -1 : 0);
        usePreset(PRESETS[(i + d + PRESETS.length) % PRESETS.length].id);
    }
    function media() {
        if (!('mediaSession' in navigator)) return;
        const ms = navigator.mediaSession, on = (a, fn) => { try { ms.setActionHandler(a, fn); } catch (e) {} };
        try {
            const sc = scene(), face = lead() === 'radio' && faceOf(stationOf(st.radio.url));
            const art = face ? { src: face, sizes: '144x144', type: 'image/webp' } : sc ? { src: sceneUrl(sc, 800), sizes: '800x533', type: 'image/webp' } : { src: new URL('../mehedi-logo.png', BASE).href, sizes: '512x512', type: 'image/png' };
            const stn = st.radio && stationOf(st.radio.url), mt = mixTitle();
            let by = lead() === 'radio' ? (stn ? 'Quran radio' : 'Radio') + (mt ? ' · with ' + mt : stn ? ' · ' + stn.sub : '')
                : st.radio ? 'Focus · with ' + st.radio.name : 'Focus · mehedi.pro.bd';
            let name = title();
            if (lead() === 'radio' && stn && stn.list) { const t = trackOf(stn); name = 'Surah ' + t.n + ' · ' + SURAHS[t.n - 1]; by = stn.name + (mt ? ' · with ' + mt : ''); }
            ms.metadata = new MediaMetadata({ title: name, artist: by, artwork: [art] });
            ms.playbackState = playing || radioOn ? 'playing' : 'paused';
        } catch (e) {}
        on('play', play); on('pause', pause); on('stop', end);
        on('nexttrack', () => step(1)); on('previoustrack', () => step(-1));
    }

    /* ---- radio: a live stream joins the mix with its own volume; one without CORS headers plays straight, outside the chain ---- */
    let radio = null, radioError = '';
    const stationOf = (url) => STATIONS.find((x) => x.url === url) || null;
    /* a station's face: the reciter's photo where a free one exists (Bangla and mujawwad stations share it) */
    const faceOf = (stn) => { const k = stn && stn.id && stn.id.replace(/^bn-/, '').replace(/-mj$/, ''); return k && FACES[k] ? new URL('reciters/' + k + '.webp', BASE).href : null; };
    /* a set's files, sorted by surah, read once from archive.org (it sends CORS headers) and kept for the visit */
    const lists = new Map();
    function listOf(item) {
        if (!lists.has(item)) {
            const p = fetch('https://archive.org/metadata/' + encodeURIComponent(item) + '/files').then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
                .then((d) => (d.result || []).filter((f) => /\.mp3$/i.test(f.name) && f.source === 'original' && /^\s*\d+/.test(f.name))
                    .map((f) => ({ n: parseInt(f.name, 10), url: 'https://archive.org/download/' + encodeURIComponent(item) + '/' + f.name.split('/').map(encodeURIComponent).join('/') }))
                    .filter((f) => f.n >= 1 && f.n <= 114).sort((a, b) => a.n - b.n));
            p.catch(() => lists.delete(item));
            lists.set(item, p);
        }
        return lists.get(item);
    }
    const trackOf = (stn) => { const t = (st.tracks || {})[stn.id]; return t && t.n >= 1 && t.n <= 114 ? t : { n: 1, at: 0 }; };
    function tune() {
        detune();
        const stn = stationOf(st.radio.url);
        const r = { el: null, gain: ctx.createGain(), cors: true, loading: true, stn };
        r.gain.gain.value = curve(st.radioVol); r.gain.connect(master);
        const hosts = stn && stn.alt ? [stn.url, stn.alt] : [st.radio.url];
        let retries = stn ? 3 : 0, h = 0;                  /* our stations do send CORS headers; an error there is a passing server hiccup */
        const source = () => {
            if (!stn || !stn.list) return Promise.resolve({ url: hosts[h % hosts.length] });
            const t = trackOf(stn);
            return listOf(stn.list).then((files) => {
                const f = files.find((x) => x.n >= t.n) || files[0];
                if (!f) throw new Error('empty');
                return { url: f.url, n: f.n, at: f.n === t.n ? t.at || 0 : 0 };
            });
        };
        const fail = () => {
            if (radio !== r) return;
            radioError = st.radio ? st.radio.name : 'The stream'; detune(); st.radio = null;
            keepAwake(playing); media(); save(true); emit();
        };
        const load = (cors) => {
            const el = new Audio(); r.el = el; r.cors = cors;
            el.preload = 'none'; el.setAttribute('playsinline', '');
            if (cors) { el.crossOrigin = 'anonymous'; ctx.createMediaElementSource(el).connect(r.gain); }
            el.addEventListener('playing', () => { if (radio === r) { r.loading = false; radioError = ''; emit(); } });
            el.addEventListener('waiting', () => { if (radio === r) { r.loading = true; emit(); } });
            el.addEventListener('ended', () => { if (radio === r && stn && stn.list) surah(r.n + 1, true); });     /* a set plays on to the next surah */
            el.addEventListener('error', () => {
                if (radio !== r) return;
                el.removeAttribute('src');
                if (cors && retries-- > 0) { h++; setTimeout(() => { if (radio === r) load(true); }, 900); return; }
                if (cors) { load(false); return; }                               /* no CORS headers: try once more without the chain */
                fail();
            });
            source().then((x) => {
                if (radio !== r) return;
                r.n = x.n;
                if (x.at) el.addEventListener('loadedmetadata', () => { try { el.currentTime = x.at; } catch (e) {} }, { once: true });   /* where the listener left off */
                el.src = x.url; level();
                el.play().catch(() => {});
                emit();
            }, fail);
        };
        radio = r; radioOn = true; radioError = '';
        load(true);
    }
    function detune() {
        const r = radio; if (!r) return;
        radio = null; radioOn = false;
        if (r.stn && r.stn.list && r.n && r.el) {          /* a set remembers the surah and the minute */
            st.tracks = st.tracks || {}; st.tracks[r.stn.id] = { n: r.n, at: Math.floor(r.el.currentTime || 0) };
        }
        if (r.el) { r.el.pause(); r.el.removeAttribute('src'); r.el.load(); }
        r.gain.disconnect();
    }
    /* go to a surah of the set that is playing: 1-114, wrapping round */
    function surah(n, fromEnd) {
        const stn = st.radio && stationOf(st.radio.url); if (!stn || !stn.list) return;
        const k = ((Math.round(n) - 1) % 114 + 114) % 114 + 1;
        st.tracks = st.tracks || {}; st.tracks[stn.id] = { n: k, at: 0 };
        if (radio) radio.n = 0;                            /* detune must not write the old surah back */
        if (radioOn || fromEnd) { audio(); tune(); } 
        media(); save(true); emit();
    }
    function level() {          /* a stream outside the chain follows the volume and the sleep fade itself */
        if (radio) radio.gain.gain.value = curve(st.radioVol);
        if (radio && !radio.cors && radio.el) radio.el.volume = Math.min(1, masterLevel() * curve(st.radioVol) * (fading ? fadeLeft : 1));
    }
    function playRadio(url, name) {
        if (!/^https:\/\/\S+$/i.test(url || '')) return false;
        st.radio = { url, name: name || new URL(url).hostname.replace(/^www\./, '') }; st.active = true; st.lead = 'radio';
        audio(); if (ctx.state !== 'running') ctx.resume();
        tune(); keepAwake(true); media(); save(true); emit();
        return true;
    }
    function stopRadio() {
        detune(); st.radio = null;
        if (!playing) keepAwake(false);
        if (!playing && !st.timer.running && !Object.keys(st.mix).length) st.active = false;
        media(); save(true); emit();
    }
    function setRadioVolume(v) { st.radioVol = Math.max(0, Math.min(1, v)); level(); save(); emit(); }

    /* ---- sleep timer: everything fades out over the last 30 seconds, then stops ---- */
    let fading = false, fadeLeft = 1;
    function setSleep(mins) {
        st.sleep = mins > 0 ? Date.now() + mins * 60000 : 0;
        if (fading) { fading = false; fadeLeft = 1; if (master) ramp(master.gain, masterLevel(), 0.4); level(); }
        save(true); emit();
    }
    function sleepTick() {
        const ms = st.sleep - Date.now();
        if (ms <= 0) {
            st.sleep = 0; pause();
            setTimeout(() => { fading = false; fadeLeft = 1; if (master) ramp(master.gain, masterLevel(), 0.1); level(); }, 900);   /* back to full for the next play */
            save(true); emit(); return;
        }
        if (ms <= 30000 && (playing || radioOn)) {
            if (!fading && master) ramp(master.gain, 0, ms / 1000);
            fading = true; fadeLeft = ms / 30000; level();
        }
    }

    /* ---- focus timer: 25 minutes of work, then a break; every fourth break is a long one ---- */
    const T = st.timer;
    const left = () => (T.running ? Math.max(0, T.endsAt - Date.now()) : T.left);
    /* on a break the sounds step back to a third, so the break is felt; they come back with the next round */
    function onBreak() { return !!(st && st.timer && st.timer.running && st.timer.phase !== 'focus' && st.dip !== false); }
    function masterLevel() { return curve(st.master) * (onBreak() ? 0.35 : 1); }
    function relevel(secs) { if (master && !fading) ramp(master.gain, masterLevel(), secs); level(); }
    function startTimer() {
        if (T.running) return;
        rollDay();
        audio(); if (ctx.state !== 'running') ctx.resume();     /* unlocked now, so the chime can sound later without a tap */
        T.running = true; T.endsAt = Date.now() + T.left; st.active = true; if (T.phase === 'focus') react('excited', 1500); relevel(1); save(true); emit(); }
    function pauseTimer() { if (!T.running) return; T.left = left(); T.running = false; relevel(1); save(true); emit(); }
    function resetTimer() { T.running = false; T.left = PHASES[T.phase][1] * 60000; relevel(1); save(true); emit(); }
    function setPhase(p) { if (!PHASES[p]) return; T.phase = p; T.running = false; T.left = PHASES[p][1] * 60000; relevel(1); save(true); emit(); }
    function setPlan(id) { if (!PLANS[id]) return; st.plan = id; usePlan(id); T.running = false; T.left = PHASES[T.phase][1] * 60000; relevel(1); save(true); emit(); }
    function setDip(on) { st.dip = !!on; relevel(1); save(true); emit(); }
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
            rollDay();
            st.done = (st.done || 0) + 1; st.mins = (st.mins || 0) + PHASES.focus[1];
            T.phase = st.done % 4 === 0 ? 'long' : 'short';
            T.left = PHASES[T.phase][1] * 60000; T.running = true; T.endsAt = Date.now() + T.left;   /* the break starts by itself */
            chime(false); react('happy', 2400);
        } else {
            T.phase = 'focus'; T.left = PHASES.focus[1] * 60000; T.running = false;                 /* the next round waits for the visitor */
            chime(true); react('excited', 1800);
        }
        relevel(3); save(true); emit();
    }
    setInterval(() => {
        if (st.sleep) sleepTick();
        if (!T.running && !st.sleep) return;
        if (T.running && Date.now() >= T.endsAt) phaseEnd(); else renderTime();
        listeners.forEach((fn) => { try { fn('tick'); } catch (e) { listeners.delete(fn); } });
    }, 1000);
    const clock = (ms) => { const s = Math.ceil(ms / 1000); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };

    const busy = () => playing || radioOn || T.running;
    /* other players on the site (the YouTube dock below) keep pages loading in the frame while they play, without
       showing this player's bar: alive() decides the frame, busy() the bar */
    const keepers = new Set();
    const alive = () => busy() || keepers.size > 0;
    const resumable = () => st.active && (Object.keys(st.mix).length > 0 || !!st.radio) && Date.now() - (st.at || 0) < 6 * 3600000;

    /* ---- the mini player, on every page while a session is on ---- */
    let pill = null, cssDone = false;
    function css() {
        if (cssDone) return; cssDone = true;
        const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = new URL('focus.css?v=6dbd24826e', BASE).href;
        document.head.appendChild(l);
    }
    /* the same player as the Focus page's bar: the photo, the name (it opens the mix: each layer's volume and ✕), the volume,
       play, a link to the mix, the focus view and stop. Built once, kept in step on every change */
    const fa = (n, extra) => `<i class="fa-solid fa-${n}${extra ? ' ' + extra : ''}" aria-hidden="true"></i>`;
    const escH = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const vol = (label, v, cls) => { const p = Math.round(v * 100); return `<div class="fp-vol${cls ? ' ' + cls : ''}" role="slider" tabindex="0" aria-label="${escH(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}" aria-valuetext="${p}%" style="--fill:${p}%"><span class="fp-vol-fill"></span><span class="fp-vol-ico">${fa('volume-low')}</span><span class="fp-vol-ico fp-vol-on">${fa('volume-low')}</span></div>`; };
    function setVol(el, v) {
        if (!el || 'dragging' in el.dataset) return;
        const p = Math.round(Math.max(0, Math.min(1, v)) * 100);
        el.style.setProperty('--fill', p + '%'); el.setAttribute('aria-valuenow', p); el.setAttribute('aria-valuetext', p + '%');
    }
    function slid(el, v) {                       /* a slider moved: the master, a sound, or the radio */
        v = Math.max(0, Math.min(1, v));
        const p = Math.round(v * 100); el.style.setProperty('--fill', p + '%'); el.setAttribute('aria-valuenow', p); el.setAttribute('aria-valuetext', p + '%');
        const row = el.closest('[data-layer]');
        if (!row) setMaster(v); else if (row.dataset.layer === 'radio') setRadioVolume(v); else setVolume(row.dataset.layer, v);
    }
    function sliders(root) {
        root.addEventListener('pointerdown', (e) => {
            const el = e.target.closest('.fp-vol'); if (!el || e.button !== 0) return;
            const at = (x) => { const r = el.getBoundingClientRect(); return (x - r.left) / r.width; };
            const x0 = e.clientX, y0 = e.clientY; let drag = false;
            const grab = (ev) => { drag = true; el.setPointerCapture(ev.pointerId); el.dataset.dragging = ''; };
            if (e.pointerType === 'mouse') { grab(e); slid(el, at(e.clientX)); }
            const move = (ev) => { if (!drag) { const dx = Math.abs(ev.clientX - x0); if (dx < 6 || dx < Math.abs(ev.clientY - y0)) return; grab(ev); } slid(el, at(ev.clientX)); };
            const up = (ev) => { if (!drag && ev.type === 'pointerup') slid(el, at(ev.clientX)); delete el.dataset.dragging;
                el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
            el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
        });
        root.addEventListener('keydown', (e) => {
            const el = e.target.closest('.fp-vol'); if (!el) return;
            const v = Number(el.getAttribute('aria-valuenow')) / 100;
            const to = { ArrowRight: v + 0.05, ArrowUp: v + 0.05, ArrowLeft: v - 0.05, ArrowDown: v - 0.05, PageUp: v + 0.1, PageDown: v - 0.1, Home: 0, End: 1 }[e.key];
            if (to !== undefined) { e.preventDefault(); e.stopPropagation(); slid(el, to); }
        });
    }
    function goFocus(view) {                     /* the Focus page, without stopping the sound: in the frame when one is open or needed */
        const url = FOCUS_URL + (view ? '#view' : '');
        if (frame && IS_FOCUS) { closeShell(true); if (view) dispatchEvent(new Event('fp-view')); }
        else if (frame) frame.contentWindow.location.href = url;
        else if (alive()) openShell(url, true);
        else location.href = url;
    }
    function subline() {
        const n = Object.keys(st.mix).length, on = playing || radioOn, parts = [];
        if (n) parts.push(n + (n === 1 ? ' sound' : ' sounds'));
        if (st.radio) { const stn = stationOf(st.radio.url), t = stn && stn.list ? trackOf(stn) : null; parts.push(t ? `Surah ${t.n} · ${SURAHS[t.n - 1]}` : 'Quran radio'); }
        parts.push(on ? 'playing' : 'paused');
        if (T.running) parts.push(PHASES[T.phase][0] + ' ' + clock(left()));
        else if (st.sleep && on) parts.push('Sleep ' + clock(st.sleep - Date.now()));
        return parts.join(' · ');
    }
    let layersKey = null;
    function mixerOpen(open) {
        if (!pill) return;
        const m = pill.querySelector('.fp-mixer');
        if (open === !m.hidden) return;
        m.hidden = !open; pill.classList.toggle('is-open', open);
        pill.querySelector('.fp-now').setAttribute('aria-expanded', String(open));
    }
    function drawLayers() {
        const ids = Object.keys(st.mix), key = ids.join() + '|' + (st.radio ? st.radio.url : '');
        const list = pill.querySelector('.fp-layers');
        if (key !== layersKey) {
            layersKey = key;
            const face = st.radio && faceOf(stationOf(st.radio.url));
            list.innerHTML = ids.map((id) => `<li data-layer="${id}"><span class="fp-layer-ico">${fa(BY[id].icon)}</span><span class="fp-layer-name">${escH(BY[id].label)}</span>`
                + vol(BY[id].label + ' volume', st.mix[id]) + `<button type="button" class="fp-btn fp-ghost" data-remove="${id}" aria-label="Remove ${escH(BY[id].label)}">${fa('xmark')}</button></li>`).join('')
                + (st.radio ? `<li data-layer="radio"><span class="fp-layer-ico${face ? ' fp-face' : ''}">${face ? `<img src="${face}" alt="">` : fa('tower-broadcast')}</span>`
                    + `<span class="fp-layer-name">${escH(st.radio.name)}</span>${vol(st.radio.name + ' volume', st.radioVol)}`
                    + `<button type="button" class="fp-btn fp-ghost" data-remove="radio" aria-label="Stop the radio">${fa('xmark')}</button></li>` : '');
        }
        list.querySelectorAll('[data-layer]').forEach((li) => setVol(li.querySelector('.fp-vol'), li.dataset.layer === 'radio' ? st.radioVol : st.mix[li.dataset.layer]));
        if (!ids.length && !st.radio) mixerOpen(false);
    }
    function shareMix(btn) {
        const ids = Object.keys(st.mix); if (!ids.length) return;
        const url = FOCUS_URL + '?mix=' + ids.map((id) => id + ':' + Math.round(st.mix[id] * 100)).join(',');
        const was = btn.innerHTML, done = (ok) => { btn.innerHTML = fa(ok ? 'check' : 'xmark') + (btn.dataset.text ? `<span>${ok ? 'Link copied' : 'Copy failed'}</span>` : ''); setTimeout(() => { btn.innerHTML = was; }, 1600); };
        if (navigator.share && matchMedia('(pointer: coarse)').matches) navigator.share({ title: 'My Focus mix', url }).catch(() => {});
        else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => done(true), () => done(false));
    }
    function render() {
        const show = !(IS_FOCUS && !frame) && !framedFocus && (busy() || resumable());     /* the Focus page has its own player bar */
        if (!show) { if (pill) { pill.remove(); pill = null; layersKey = null; } return; }
        css();
        if (!pill) {
            pill = document.createElement('div');
            pill.id = 'fp-pill'; pill.setAttribute('role', 'region'); pill.setAttribute('aria-label', 'Focus player');
            pill.innerHTML = '<div class="fp-mixer" hidden><div class="fp-mixer-head"><b>In this mix</b>'
                + `<button type="button" class="fp-tbtn" data-act="share" data-text="1">${fa('link')}<span>Share</span></button>`
                + `<button type="button" class="fp-tbtn" data-act="clear">${fa('trash-can')}<span>Clear all</span></button></div><ul class="fp-layers"></ul></div>`
                + `<a class="fp-art" href="${FOCUS_URL}" aria-label="Open Focus" title="Open Focus"></a>`
                + '<button type="button" class="fp-now" aria-expanded="false" title="The mix"><span class="fp-info"><b></b>'
                + `<small><span class="fp-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="fp-sub"></span></small></span>${fa('chevron-up', 'fp-chev')}</button>`
                + vol('Volume', st.master, 'fp-master')
                + '<button type="button" class="fp-btn fp-play"><i aria-hidden="true"></i></button>'
                + `<button type="button" class="fp-btn fp-wide" data-act="share" aria-label="Copy a link to this mix" title="Copy a link to this mix">${fa('link')}</button>`
                + `<button type="button" class="fp-btn fp-wide" data-act="view" aria-label="Focus view" title="Focus view">${fa('expand')}</button>`
                + `<button type="button" class="fp-btn fp-x" aria-label="Stop Focus" title="Stop">${fa('xmark')}</button>`;
            sliders(pill);
            pill.addEventListener('click', (e) => {
                const t = e.target;
                if (t.closest('.fp-art')) { e.preventDefault(); goFocus(false); return; }
                if (t.closest('.fp-now')) { mixerOpen(pill.querySelector('.fp-mixer').hidden); return; }
                if (t.closest('.fp-play')) { if (playing || radioOn) pause(); else play(); return; }
                if (t.closest('.fp-x')) { end(); return; }
                const rm = t.closest('[data-remove]');
                if (rm) { if (rm.dataset.remove === 'radio') stopRadio(); else toggleSound(rm.dataset.remove); return; }
                const act = t.closest('[data-act]');
                if (!act) return;
                if (act.dataset.act === 'share') shareMix(act);
                else if (act.dataset.act === 'clear') clear();
                else if (act.dataset.act === 'view') goFocus(true);
            });
            document.addEventListener('click', (e) => { if (pill && !e.composedPath().includes(pill)) mixerOpen(false); });
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape') mixerOpen(false); });
            document.body.appendChild(pill);
        }
        const on = playing || radioOn, sc = scene(), face = lead() === 'radio' && faceOf(stationOf(st.radio.url));
        pill.classList.toggle('is-on', on);
        const art = face || (sc ? sceneUrl(sc, 800) : '');           /* the reciter's photo while the radio leads, else the scene */
        pill.querySelector('.fp-art').style.backgroundImage = art ? `url("${art}")` : '';
        pill.querySelector('.fp-info b').textContent = title();
        const p = pill.querySelector('.fp-play');
        p.setAttribute('aria-label', on ? 'Pause' : 'Play');
        p.querySelector('i').className = 'fa-solid ' + (on ? 'fa-pause' : 'fa-play');
        setVol(pill.querySelector('.fp-master'), st.master);
        pill.querySelector('.fp-master').classList.toggle('is-muted', st.master === 0);
        pill.querySelectorAll('[data-act="share"]').forEach((b) => { b.disabled = !Object.keys(st.mix).length; });
        drawLayers();
        renderTime();
    }
    function renderTime() {
        if (!pill) return;
        const text = subline(), sub = pill.querySelector('.fp-sub');
        if (sub.textContent !== text) sub.textContent = text;
    }

    /* ---- the shell: while something plays, other pages open in a frame over this one ---- */
    let frame = null, framedFocus = false;
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
        frame.remove(); frame = null; framedFocus = false;
        document.documentElement.classList.remove('fp-shell-on');
        document.title = hostTitle;
        if (push) history.pushState(null, '', hostUrl);
        render();
    }
    const wired = new WeakSet();
    /* a link to the page under the frame shows that page again, at the section it names */
    function backToHost(u, push) {
        closeShell(push);
        if (!push) history.replaceState(null, '', hostUrl);
        if (IS_FOCUS && (u.hash === '#view' || u.hash === '#visual')) { dispatchEvent(new CustomEvent('fp-view', { detail: { viz: u.hash === '#visual' } })); return; }
        const el = u.hash && document.getElementById(decodeURIComponent(u.hash.slice(1)));
        if (el) el.scrollIntoView();
    }
    function framed() {                       /* runs as soon as the framed page's own focus.js attaches, and again on load */
        if (!frame) return;
        let w, href;
        try { w = frame.contentWindow; href = w.location.href; } catch (e) { return; }
        if (href === 'about:blank') return;
        if (new URL(href).pathname === new URL(hostUrl).pathname) { backToHost(new URL(href), false); return; }
        history.replaceState({ fpShell: 1 }, '', href);
        document.title = w.document.title;
        const onFocus = new URL(href).pathname.replace(/index\.html$/, '') === new URL(FOCUS_URL).pathname;
        if (onFocus !== framedFocus) { framedFocus = onFocus; render(); }
        const d = w.document;
        if (wired.has(d)) return;
        wired.add(d);
        /* other sites open in a new tab (they refuse to be framed); forms leaving the site take the whole tab */
        d.addEventListener('click', (e) => {
            const a = e.target.closest && e.target.closest('a[href]');
            if (!a || e.defaultPrevented) return;
            const u = new URL(a.href, d.baseURI);
            if (/^https?:$/.test(u.protocol) && u.origin !== location.origin && (!a.target || /^_(self|top|parent)$/.test(a.target))) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
            else if (u.origin === location.origin && u.pathname === new URL(hostUrl).pathname && !(e.metaKey || e.ctrlKey || e.shiftKey)) { e.preventDefault(); backToHost(u, true); }
        });
        d.querySelectorAll('form[action]').forEach((f) => { try { if (new URL(f.action, d.baseURI).origin !== location.origin) f.target = '_top'; } catch (e) {} });
        render();
    }
    addEventListener('click', (e) => {          /* runs last, so links other scripts handle are left alone */
        if (frame || !alive() || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const a = e.target.closest && e.target.closest('a[href]');
        if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
        const u = new URL(a.href, location.href);
        if (!pageLink(u)) return;
        e.preventDefault(); openShell(u.href, true);
    });
    if (window.navigation && typeof navigation.addEventListener === 'function') {
        navigation.addEventListener('navigate', (e) => {   /* script-driven page changes (cards, the logo) */
            if (frame || !alive() || !e.cancelable || e.destination.sameDocument || e.navigationType !== 'push' || e.formData || e.downloadRequest) return;
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
        if (e.key !== 'mehedi_theme' || !e.newValue) return;
        const root = document.documentElement;      /* painted in one frame, without transitions, as script~ does */
        root.classList.add('theme-swap');
        root.setAttribute('data-theme', e.newValue);
        requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-swap')));
    });

    window.FocusPlayer = {
        host: true, CATS, SOUNDS, PRESETS, PHASES, PLANS, SCENES, STATIONS, SURAHS, FACES, FOCUS_URL, faceOf,
        state: () => ({ mix: Object.assign({}, st.mix), master: st.master, preset: (matched() || {}).id || null, scene: scene(), playing,
            radio: st.radio ? { url: st.radio.url, name: st.radio.name, on: radioOn, loading: !!(radio && radio.loading), direct: !!(radio && !radio.cors), volume: st.radioVol,
                track: (() => { const stn = stationOf(st.radio.url); if (!stn || !stn.list) return null; const t = trackOf(stn); return { n: t.n, name: SURAHS[t.n - 1] }; })() } : null,
            radioError, sleep: st.sleep ? Math.max(0, st.sleep - Date.now()) : 0, lead: lead(), mixName: mixTitle(),
            active: st.active, loading: [...nodes].filter(([, n]) => n.loading).map(([id]) => id),
            timer: { phase: T.phase, running: T.running, left: left(), total: PHASES[T.phase][1] * 60000 }, done: st.done || 0,
            plan: st.plan, dip: st.dip !== false, mins: st.mins || 0, dipping: onBreak() }),
        title, busy, play, pause, toggleSound, setVolume, setMaster, toggleMute, usePreset, setMix, shuffle, clear, end, sceneOf, sceneUrl,
        playRadio, stopRadio, setRadioVolume, setSleep, setLead, setPlan, setDip, surah, next: () => step(1), prev: () => step(-1),
        tap: () => { audio(); if (ctx.state !== 'running') ctx.resume(); return { ctx, node: master }; },     /* for the visualizer */
        /* the audio engine, made ahead and left silent: the first one in a browser session starts the browser's audio
           service, which held the first play tap for about 200 ms. Made without a tap it stays suspended until play() */
        warm: () => { if (ctx) return; audio(); if (ctx.state === 'running' && !playing && !radioOn) ctx.suspend(); },
        startTimer, pauseTimer, resetTimer, setPhase, clock,
        on: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
        keep: (id, on) => { if (on) keepers.add(id); else keepers.delete(id); },
        attach: (d) => { docs.add(d); if (frame && frame.contentDocument === d) framed(); emit(); }, detach: (d) => { docs.delete(d); }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', emit); else emit();
})();

/**
 * TubeDock: YouTube tracks from Watch & Listen (and the home dashboard) keep playing while the visitor moves around the
 * site. The video plays in a small dock in the host page, the page that stays loaded while others open in Focus's
 * frame over it (above); while the dock is open Focus keeps that frame in use, so links open in it. The video stays in
 * view as YouTube's embed rules ask (no background play), and the controls drive it through the embed's messages
 * (enablejsapi), so no YouTube script is loaded. Pages in the frame use the host's dock.
 * A page with its own screen (Watch & Listen's big player) hands it over with slot(): while that page is in view the
 * video sits in the screen, and it shrinks to the corner when the visitor moves on. It is always the same iframe, so
 * the track never restarts.
 * In the corner the dock is the video alone; hovered (or focused, or on a touch screen) it shows a bar above (the
 * track, open and close; dragged by it, it glides to the nearer side, at the height it was dropped, remembered) and one
 * below (previous, play, next and the volume, remembered too).
 */
(function () {
    'use strict';
    if (window.TubeDock) return;
    /* site storage can be blocked (then touching it throws): it is read and written only through these */
    const local = {
        get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }
    };
    try {
        const t = window.top;
        if (t !== window && t.TubeDock) { window.TubeDock = t.TubeDock; return; }
    } catch (e) { /* framed by another site: run on our own */ }

    const YT = 'https://www.youtube-nocookie.com';
    const MUSIC_URL = new URL('../library/watch-listen/', document.currentScript ? document.currentScript.src : location.href).href;
    const ICON = {
        prev: '<i class="fa-solid fa-backward-step"></i>', next: '<i class="fa-solid fa-forward-step"></i>',
        play: '<i class="fa-solid fa-play"></i>', pause: '<i class="fa-solid fa-pause"></i>',
        open: '<i class="fa-solid fa-arrow-up-right-from-square"></i>', close: '<i class="fa-solid fa-xmark"></i>',
        high: '<i class="fa-solid fa-volume-high"></i>', low: '<i class="fa-solid fa-volume-low"></i>', mute: '<i class="fa-solid fa-volume-xmark"></i>'
    };
    let tracks = [], index = 0, playing = false, dock = null, video = null;
    const store = (k, v) => local.set(k, JSON.stringify(v));
    const stored = (k) => { try { return JSON.parse(local.get(k)); } catch (e) { return null; } };
    /* where the visitor left the dock (a side and a height), and its volume */
    let pos = stored('td:pos');
    if (!pos || !/^[lr]$/.test(pos.side) || typeof pos.top !== 'number') pos = null;
    const sv = stored('td:vol') || {};
    let vol = typeof sv.v === 'number' ? Math.max(0, Math.min(100, Math.round(sv.v))) : 100, muted = !!sv.m, ready = false, setAt = 0;
    /* the screens pages lend (slots), each watched for moving, hiding (a filter) or showing again; the dock sits in
       slotEl, the one in view: mode is 'page' when it is in this document, 'over' when it is in the page in Focus's frame */
    const slots = new Map();
    let slotEl = null, placed = null, mode = '', tick = 0, radius = '';
    const listeners = new Set();
    const emit = () => listeners.forEach((fn) => { try { fn(); } catch (e) { listeners.delete(fn); } });
    const keep = (on) => { try { window.FocusPlayer.keep('tube', on); } catch (e) {} };
    const send = (func, args) => { if (video) video.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args: args || [] }), YT); };

    function css() {
        if (document.getElementById('td-css')) return;
        const s = document.createElement('style');
        s.id = 'td-css';
        s.textContent = `
#tube-dock { position: fixed; right: 16px; bottom: 136px; z-index: 2147483500; width: 360px; box-sizing: border-box; border-radius: 16px;
  color: var(--text-primary, #f8fafc); font: 600 13px/1.3 Poppins, system-ui, -apple-system, 'Segoe UI', sans-serif; background: #000;
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--text-primary, #f8fafc) 14%, transparent), 0 24px 50px -16px rgba(0, 0, 0, .65);
  animation: td-in .35s cubic-bezier(.2, .9, .3, 1.2) both; }
#tube-dock * { box-sizing: border-box; }
#tube-dock .td-screen { width: 100%; aspect-ratio: 16 / 9; min-height: 200px; overflow: hidden; border-radius: inherit; background: #000; }
#tube-dock iframe { display: block; width: 100%; height: 100%; border: 0; }
/* the controls sit just outside the video (YouTube's rules keep other things off the player), shown while the dock is
   hovered or has focus; at rest only the video shows */
#tube-dock :is(.td-head, .td-bar) { position: absolute; left: 0; right: 0; opacity: 0; pointer-events: none;
  transition: opacity .2s ease .35s, transform .2s ease .35s; }
#tube-dock .td-head { bottom: 100%; padding-bottom: 6px; transform: translateY(5px); }
#tube-dock .td-bar { top: 100%; padding-top: 6px; transform: translateY(-5px); }
#tube-dock:is(.td-show, :focus-within, .td-drag) :is(.td-head, .td-bar) { opacity: 1; pointer-events: auto; transform: none; transition-delay: 0s; }
@media (hover: hover) and (pointer: fine) { #tube-dock:hover :is(.td-head, .td-bar) { opacity: 1; pointer-events: auto; transform: none; transition-delay: 0s; } }
@media (hover: none) { #tube-dock :is(.td-head, .td-bar) { opacity: 1; pointer-events: auto; transform: none; } }
#tube-dock .td-pill { display: flex; align-items: center; gap: 2px; height: 42px; padding: 0 6px; border-radius: 14px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--text-primary, #f8fafc) 5%, transparent), transparent), var(--bg-color, #0b1120);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--text-primary, #f8fafc) 12%, transparent), 0 14px 30px -14px rgba(0, 0, 0, .55); }
#tube-dock .td-head .td-pill { cursor: grab; touch-action: none; user-select: none; -webkit-user-select: none; }
#tube-dock :is(button, a) { display: grid; flex-shrink: 0; place-items: center; width: 30px; height: 30px; padding: 0; border: 0;
  border-radius: 50%; font-size: 12px; color: var(--text-secondary, #94a3b8); text-decoration: none; cursor: pointer; background: none; }
@media (hover: hover) and (pointer: fine) { #tube-dock :is(button, a):hover { color: var(--accent-1, #00f2fe); background: color-mix(in srgb, var(--text-primary, #f8fafc) 8%, transparent); } }
#tube-dock :is(button, a):focus-visible { outline: 2px solid var(--accent-1, #00f2fe); outline-offset: 2px; }
#tube-dock .td-grip { width: 20px; color: var(--text-secondary, #94a3b8); cursor: grab; }
@media (hover: hover) and (pointer: fine) { #tube-dock .td-grip:hover { background: none; } }
#tube-dock .td-grip::before { content: ""; width: 10px; height: 15px; opacity: .75;
  background: radial-gradient(circle, currentColor 1.2px, transparent 1.6px) 0 0 / 5px 5px; }
/* playing shows as moving bars beside the title; paused, they rest */
#tube-dock .td-eq { display: inline-flex; flex-shrink: 0; align-items: flex-end; gap: 2px; width: 13px; height: 12px; margin: 0 6px 0 4px;
  color: var(--text-secondary, #94a3b8); }
#tube-dock .td-eq i { flex: 1; height: 35%; border-radius: 1px; background: currentColor; }
#tube-dock .td-eq i:nth-child(2) { height: 70%; }
#tube-dock .td-eq i:nth-child(3) { height: 50%; }
#tube-dock.is-playing .td-eq { color: var(--accent-1, #00f2fe); }
#tube-dock.is-playing .td-eq i { animation: td-eq .9s ease-in-out infinite; }
#tube-dock.is-playing .td-eq i:nth-child(2) { animation-delay: -.3s; }
#tube-dock.is-playing .td-eq i:nth-child(3) { animation-delay: -.6s; }
#tube-dock .td-text { display: grid; flex: 1; min-width: 0; margin-right: 4px; line-height: 1.25; }
#tube-dock .td-text :is(b, span) { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
#tube-dock .td-text b { font-size: 13px; }
#tube-dock .td-text span { font-size: 11px; font-weight: 500; color: var(--text-secondary, #94a3b8); }
#tube-dock .td-main { width: 34px; height: 34px; margin: 0 2px; font-size: 13px; color: var(--accent-active-color, #0b1120);
  background: linear-gradient(180deg, rgba(255, 255, 255, .22), rgba(255, 255, 255, 0) 55%), var(--gradient-accent, var(--accent-1, #00f2fe));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .45), 0 6px 16px -6px var(--shade, rgba(0, 0, 0, 0.4)); }
@media (hover: hover) and (pointer: fine) { #tube-dock .td-main:hover { color: var(--accent-active-color, #0b1120); background: linear-gradient(180deg, rgba(255, 255, 255, .22), rgba(255, 255, 255, 0) 55%), var(--gradient-accent, var(--accent-1, #00f2fe)); filter: brightness(1.06); } }
#tube-dock .td-vol { display: flex; align-items: center; gap: 4px; margin-left: auto; }
#tube-dock .td-range { -webkit-appearance: none; appearance: none; width: 84px; height: 4px; margin: 0 6px 0 0; border-radius: 4px; cursor: pointer;
  background: linear-gradient(90deg, var(--accent-1, #00f2fe) var(--v, 100%), color-mix(in srgb, var(--text-primary, #f8fafc) 18%, transparent) var(--v, 100%)); }
#tube-dock .td-range::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border: 0; border-radius: 50%; background: #fff;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-1, #00f2fe) 35%, transparent); }
#tube-dock .td-range::-moz-range-thumb { width: 12px; height: 12px; border: 0; border-radius: 50%; background: #fff;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-1, #00f2fe) 35%, transparent); }
#tube-dock .td-range:focus-visible { outline: 2px solid var(--accent-1, #00f2fe); outline-offset: 5px; }
#tube-dock.td-drag { cursor: grabbing; box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent-1, #00f2fe) 45%, transparent), 0 34px 70px -20px rgba(0, 0, 0, .75); }
#tube-dock.td-drag :is(.td-pill, .td-grip) { cursor: grabbing; }
#tube-dock.td-drag iframe { pointer-events: none; }
#tube-dock.td-slot { position: absolute; right: auto; bottom: auto; z-index: 50; overflow: hidden; box-shadow: none; animation: none; }
#tube-dock.td-slot.td-over { position: fixed; z-index: 2147483500; }
#tube-dock.td-slot .td-screen { height: 100%; min-height: 0; aspect-ratio: auto; border-radius: 0; }
#tube-dock.td-slot :is(.td-head, .td-bar) { display: none; }
@keyframes td-in { from { opacity: 0; transform: translateY(16px) scale(.96); } }
@keyframes td-eq { 0%, 100% { height: 25%; } 50% { height: 100%; } }
@media (max-width: 767px) { #tube-dock { right: 12px; left: 12px; bottom: 132px; width: auto; } }
@media (prefers-reduced-motion: reduce) { #tube-dock, #tube-dock .td-eq i { animation: none !important; } }`;
        document.head.appendChild(s);
    }

    function build() {
        css();
        dock = document.createElement('div');
        dock.id = 'tube-dock';
        dock.setAttribute('role', 'region');
        dock.setAttribute('aria-label', 'Now playing from Watch & Listen');
        dock.innerHTML = '<div class="td-head"><div class="td-pill">' +
            '<button type="button" class="td-grip" aria-label="Move the player (arrow keys)" title="Drag to move"></button>' +
            '<span class="td-eq" aria-hidden="true"><i></i><i></i><i></i></span><span class="td-text"><b></b><span></span></span>' +
            '<a data-td="open" href="' + MUSIC_URL + '" aria-label="Open Watch & Listen" title="Open Watch & Listen">' + ICON.open + '</a>' +
            '<button type="button" data-td="close" aria-label="Close the player" title="Close">' + ICON.close + '</button></div></div>' +
            '<div class="td-screen"></div>' +
            '<div class="td-bar"><div class="td-pill">' +
            '<button type="button" data-td="prev" aria-label="Previous track">' + ICON.prev + '</button>' +
            '<button type="button" data-td="toggle" class="td-main" aria-label="Pause">' + ICON.pause + '</button>' +
            '<button type="button" data-td="next" aria-label="Next track">' + ICON.next + '</button>' +
            '<span class="td-vol"><button type="button" data-td="mute" aria-label="Mute" aria-pressed="false">' + ICON.high + '</button>' +
            '<input class="td-range" type="range" min="0" max="100" step="1" aria-label="Volume"></span></div></div>';
        const head = dock.querySelector('.td-head .td-pill'), range = dock.querySelector('.td-range');
        head.addEventListener('pointerdown', drag);
        dock.querySelector('.td-grip').addEventListener('keydown', nudge);
        range.addEventListener('input', () => {
            vol = +range.value;
            if (vol > 0) muted = false;
            setVolume();
        });
        dock.addEventListener('click', (e) => {
            const b = e.target.closest('[data-td]');
            if (!b) return;
            const act = b.dataset.td;
            if (act === 'mute') {
                if (muted || !vol) { muted = false; if (!vol) vol = 50; } else muted = true;
                setVolume();
                return;
            }
            if (act === 'open') {
                // with Focus's frame open, the page opens in it; otherwise Focus opens the frame for the link
                const shell = document.getElementById('fp-shell');
                if (shell) { e.preventDefault(); shell.src = MUSIC_URL; }
                return;
            }
            api[act]();
        });
        document.body.appendChild(dock);
        sound();
        applyPos();
        place(true);
    }

    /* volume: the row shows it, the player gets it, and it is kept for the next visit */
    function sound() {
        if (!dock) return;
        const r = dock.querySelector('.td-range'), b = dock.querySelector('[data-td="mute"]'), shown = muted ? 0 : vol;
        r.value = shown;
        r.style.setProperty('--v', shown + '%');
        r.setAttribute('aria-valuetext', muted ? 'Muted' : vol + '%');
        b.innerHTML = muted || !vol ? ICON.mute : vol < 50 ? ICON.low : ICON.high;
        b.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
        b.setAttribute('aria-pressed', String(muted));
    }
    const tell = () => { send('setVolume', [vol]); send(muted ? 'mute' : 'unMute'); setAt = Date.now(); };
    function setVolume() { tell(); sound(); store('td:vol', { v: vol, m: muted }); emit(); }

    /* the corner's place: the side and height the visitor left it at (on a phone it spans the width: the height only),
       leaving room for the bars above and below the video */
    const ABOVE = 56, BELOW = 60;
    function applyPos() {
        if (!dock || mode) return;
        const s = dock.style;
        if (!pos) { s.left = s.right = s.top = s.bottom = ''; return; }
        s.top = Math.max(ABOVE, Math.min(pos.top, innerHeight - dock.offsetHeight - BELOW)) + 'px';
        s.bottom = 'auto';
        if (innerWidth <= 767) s.left = s.right = '';
        else if (pos.side === 'l') { s.left = '16px'; s.right = 'auto'; }
        else { s.right = '16px'; s.left = 'auto'; }
    }
    /* dragged by the top row (not its buttons); let go, it glides to the nearer side */
    function drag(e) {
        if (mode || e.button !== 0 || e.target.closest('a, input, button:not(.td-grip)')) return;
        e.preventDefault();
        const head = e.currentTarget, r = dock.getBoundingClientRect(), s = dock.style;
        const dx = e.clientX - r.left, dy = e.clientY - r.top;
        let moved = false;
        head.setPointerCapture(e.pointerId);
        const move = (ev) => {
            if (!moved && Math.hypot(ev.clientX - e.clientX, ev.clientY - e.clientY) < 4) return;
            if (!moved) { moved = true; dock.classList.add('td-drag'); s.width = r.width + 'px'; s.right = s.bottom = 'auto'; }
            s.left = Math.max(4, Math.min(ev.clientX - dx, innerWidth - r.width - 4)) + 'px';
            s.top = Math.max(ABOVE, Math.min(ev.clientY - dy, innerHeight - r.height - BELOW)) + 'px';
        };
        const up = () => {
            head.removeEventListener('pointermove', move);
            head.removeEventListener('pointerup', up);
            head.removeEventListener('pointercancel', up);
            if (!moved) return;
            dock.classList.remove('td-drag');
            const from = dock.getBoundingClientRect();
            s.width = '';
            pos = { side: from.left + from.width / 2 < innerWidth / 2 ? 'l' : 'r', top: Math.round(from.top) };
            store('td:pos', pos);
            applyPos();
            flip(from);
        };
        head.addEventListener('pointermove', move);
        head.addEventListener('pointerup', up);
        head.addEventListener('pointercancel', up);
    }
    /* from the keyboard: the arrows send it to a side, to the top, or back down above the chat button */
    function nudge(e) {
        if (mode || !/^Arrow(Left|Right|Up|Down)$/.test(e.key)) return;
        e.preventDefault();
        const from = dock.getBoundingClientRect(), next = pos ? Object.assign({}, pos) : { side: 'r', top: from.top };
        if (e.key === 'ArrowLeft') next.side = 'l';
        if (e.key === 'ArrowRight') next.side = 'r';
        if (e.key === 'ArrowUp') next.top = ABOVE;
        if (e.key === 'ArrowDown') next.top = innerHeight - from.height - 136;
        pos = next;
        store('td:pos', pos);
        applyPos();
        flip(from);
    }

    /* hover cannot be seen over the video (YouTube's frame is another site's page: the pointer's moves go there), so the
       bars show when the pointer comes near the dock and hide once it has moved away. The last move before the pointer
       goes onto the video is a near one, so they stay while it is there. Pages in Focus's frame are watched too. */
    let near = false, hideT = 0;
    const watched = new WeakSet();
    function nearness(e) {
        if (!dock || mode) return;
        const r = dock.getBoundingClientRect();
        let x = e.clientX, y = e.clientY;
        const view = e.view;
        if (view && view !== window && view.frameElement) { const f = view.frameElement.getBoundingClientRect(); x += f.left; y += f.top; }
        const m = near ? 24 : 40, above = near ? 56 : 0, below = near ? 60 : 0;     /* once shown, the bars count too */
        if (x > r.left - m && x < r.right + m && y > r.top - m - above && y < r.bottom + m + below) {
            clearTimeout(hideT); hideT = 0;
            if (!near) { near = true; dock.classList.add('td-show'); }
        } else if (near && !hideT) {
            hideT = setTimeout(() => { hideT = 0; near = false; if (dock) dock.classList.remove('td-show'); }, 250);
        }
    }
    function watchMoves(doc) {
        if (!doc || watched.has(doc)) return;
        watched.add(doc);
        doc.addEventListener('pointermove', nearness, { passive: true });
    }
    watchMoves(document);

    /* the page whose content is in view: the one open in Focus's frame, or this one */
    function shown() {
        const f = document.getElementById('fp-shell');
        if (!f) return document;
        try { return f.contentDocument; } catch (e) { return null; }
    }
    function lend(el) {
        if (!el || slots.has(el)) return;
        const win = el.ownerDocument.defaultView, onScroll = () => fit();
        const ro = new win.ResizeObserver(() => place());          /* the observer of the screen's own page */
        ro.observe(el); ro.observe(el.ownerDocument.body);
        win.addEventListener('scroll', onScroll, { passive: true });
        slots.set(el, { win, ro, onScroll });
    }
    function takeBack(el) {
        const s = slots.get(el);
        if (!s) return;
        s.ro.disconnect();
        try { s.win.removeEventListener('scroll', s.onScroll); } catch (e) {}
        slots.delete(el);
    }
    /* into the screen of the page in view, when it shows, otherwise the corner */
    function place(still) {
        const shell = document.getElementById('fp-shell');
        if (shell && !watched.has(shell)) {
            watched.add(shell);
            shell.addEventListener('load', () => { try { watchMoves(shell.contentDocument); } catch (e) {} });
        }
        try { if (shell) watchMoves(shell.contentDocument); } catch (e) {}
        slots.forEach((s, el) => { if (!el.ownerDocument.defaultView) takeBack(el); });     /* its page has closed */
        const on = !!dock && slots.size > 0;
        if (on !== !!tick) { clearInterval(tick); tick = on ? setInterval(place, 300) : 0; }   /* catches what no event reports, like a menu opening */
        if (!dock) return;
        const d = shown();
        slotEl = null;
        slots.forEach((s, el) => { if (!slotEl && el.ownerDocument === d && el.offsetWidth) slotEl = el; });
        const m = slotEl ? (d === document ? 'page' : 'over') : '';
        if (m === mode && slotEl === placed) { fit(); return; }
        const from = dock.getBoundingClientRect();
        mode = m; placed = slotEl;
        dock.classList.toggle('td-slot', !!m);
        dock.classList.toggle('td-over', m === 'over');
        dock.removeAttribute('style');
        if (!m) applyPos();
        radius = m ? d.defaultView.getComputedStyle(slotEl).borderRadius : '';
        fit();
        if (!still) flip(from);
        emit();
    }
    function fit() {
        if (!mode || !slotEl || !slotEl.ownerDocument.defaultView) return;
        const d = slotEl.ownerDocument, r = slotEl.getBoundingClientRect(), s = dock.style;
        let x = r.left, y = r.top, covered = false;
        if (mode === 'page') { x += scrollX; y += scrollY; }      /* in this page the dock scrolls with it, on its own */
        else { const f = document.getElementById('fp-shell').getBoundingClientRect(); x += f.left; y += f.top; }
        // the page's top bars stay over its content, so the video is cut where it passes under them
        let cover = 0;
        d.querySelectorAll('body > nav, .sub-header-bar').forEach((el) => { const b = el.getBoundingClientRect(); if (b.height) cover = Math.max(cover, b.bottom); });
        const clip = Math.max(0, Math.min(r.height, cover - r.top));
        if (mode === 'over') {
            // above the whole frame, the video would cover what the page opens over its screen (a menu, the chat): it steps aside
            const cy = Math.min((r.top + clip + r.bottom) / 2, d.defaultView.innerHeight - 1);
            const hit = clip < r.height && cy > 0 ? d.elementFromPoint(r.left + r.width / 2, cy) : null;
            covered = !!hit && !slotEl.contains(hit);
        }
        const set = (k, v) => { if (s[k] !== v) s[k] = v; };
        set('left', x + 'px'); set('top', y + 'px'); set('width', r.width + 'px'); set('height', r.height + 'px');
        set('borderRadius', radius);
        set('clipPath', clip ? 'inset(' + clip + 'px 0 0 0)' : '');
        set('visibility', covered ? 'hidden' : '');
    }
    /* between the screen and the corner the dock glides, so the eye follows the video */
    function flip(from) {
        const to = dock.getBoundingClientRect();
        if (!from.width || !to.width || !dock.animate || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        dock.animate([
            { transformOrigin: '0 0', transform: 'translate(' + (from.left - to.left) + 'px, ' + (from.top - to.top) + 'px) scale(' + from.width / to.width + ', ' + from.height / to.height + ')' },
            { transformOrigin: '0 0', transform: 'none' }
        ], { duration: 360, easing: 'cubic-bezier(.2, .8, .2, 1)' });
    }
    new MutationObserver(() => place()).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });   /* the frame opens or closes */
    addEventListener('resize', () => { place(); applyPos(); });

    function render() {
        if (!dock) return;
        const t = tracks[index];
        dock.classList.toggle('is-playing', playing);
        dock.querySelector('.td-text b').textContent = t.title || '';
        dock.querySelector('.td-text span').textContent = t.sub || '';
        const toggle = dock.querySelector('[data-td="toggle"]');
        toggle.innerHTML = playing ? ICON.pause : ICON.play;
        toggle.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    }

    function load(i) {
        index = (i + tracks.length) % tracks.length;
        const t = tracks[index];
        if (!dock) build();
        if (!video) {
            video = document.createElement('iframe');
            video.title = 'YouTube video player';
            video.allow = 'autoplay; encrypted-media; picture-in-picture';
            video.allowFullscreen = true;
            video.src = YT + '/embed/' + t.id + '?autoplay=1&rel=0&playsinline=1&enablejsapi=1&origin=' + encodeURIComponent(location.origin);
            ready = false;
            // ask the player to report its state, so pausing in the video itself shows here, and an ended track moves on
            video.addEventListener('load', () => video && video.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 'td' }), YT));
            dock.querySelector('.td-screen').appendChild(video);
        } else {
            send('loadVideoById', [t.id]);
        }
        playing = true;
        local.set('lib:last', JSON.stringify({ id: t.id, title: t.title, sub: t.sub || '', at: Date.now() }));
        keep(true);
        render();
        emit();
    }

    addEventListener('message', (e) => {
        if (e.origin !== YT || !video || e.source !== video.contentWindow) return;
        let d;
        try { d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (err) { return; }
        if (!d) return;
        // once the player is ready it takes the kept volume; after that a change made in the video itself shows here
        if (d.event === 'onReady') { tell(); setTimeout(() => { ready = true; }, 800); }
        const info = d.info && typeof d.info === 'object' ? d.info : null;
        if (ready && info && typeof info.volume === 'number' && Date.now() - setAt > 700) {
            const v = Math.round(info.volume), m = !!info.muted;
            if (v !== vol || m !== muted) { vol = v; muted = m; sound(); store('td:vol', { v: vol, m: muted }); emit(); }
        }
        const ps = d.event === 'onStateChange' ? d.info : info && info.playerState;
        if (typeof ps !== 'number') return;
        if (ps === 0) { api.next(); return; }            /* ended: the next track */
        if ((ps === 1 || ps === 2) && playing !== (ps === 1)) { playing = ps === 1; render(); emit(); }
    });

    const api = window.TubeDock = {
        host: true,
        state: () => ({ tracks: tracks.slice(), index, track: dock ? tracks[index] : null, playing: !!dock && playing, open: !!dock, slotted: !!mode }),
        /* list: [{ id, title, sub, av }] with av an absolute URL (the dock may sit in a page at another depth) */
        play(list, i) {
            if (list && list.length) tracks = list.map((x) => ({ id: String(x.id), title: x.title || '', sub: x.sub || '', av: x.av || '' }));
            if (tracks.length) load(i || 0);
        },
        toggle() { if (!dock) return; send(playing ? 'pauseVideo' : 'playVideo'); playing = !playing; render(); emit(); },
        next() { if (dock) load(index + 1); },
        prev() { if (dock) load(index - 1); },
        /* whether the video sits in el now, and shows (a page hides its own controls only then) */
        holds: (el) => !!dock && !!mode && slotEl === el && dock.style.visibility !== 'hidden',
        /* the volume, for a page's own controls: { level 0-100, muted }; set either or both */
        volume: () => ({ level: vol, muted }),
        setVolume(level, mute) {
            if (typeof level === 'number') { vol = Math.max(0, Math.min(100, Math.round(level))); if (vol > 0) muted = false; }
            if (typeof mute === 'boolean') { muted = mute; if (!mute && !vol) vol = 50; }
            setVolume();
        },
        /* el: a page's own screen for the video; that page lets it go with unslot() when it closes */
        slot(el) { lend(el); place(); },
        unslot(el) { takeBack(el); place(); },
        close() {
            if (!dock) return;
            mode = ''; placed = null; near = false;
            dock.remove();
            dock = video = null;
            place();
            playing = false;
            keep(false);
            emit();
        },
        on: (fn) => { listeners.add(fn); return () => listeners.delete(fn); }
    };
})();
