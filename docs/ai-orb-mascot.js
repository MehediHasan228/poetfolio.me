/**
 * AI ORB MASCOT COMPONENT
 * An original, minimalist, futuristic AI Orb Mascot for mehedi.pro.bd.
 * 
 * Expresses emotion ONLY through TWO capsule eyes with 3D spherical lighting,
 * gloss specular reflection, subtle rim light, and cyber ambient glow.
 * NO eyebrows. NO mouth. NO accessories.
 * 
 * Supported expressions:
 * 'idle', 'looking-left', 'looking-right', 'excited', 'happy', 'angry',
 * 'pout', 'surprised', 'blink', 'thinking', 'responding', 'error'
 */

(function () {
    const ORB_SVG_TEMPLATE = `
<svg class="ai-orb-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
        <!-- Clip to Sphere Boundary to prevent any highlight bleeding -->
        <clipPath id="aiOrbSphereClip">
            <circle cx="100" cy="100" r="74" />
        </clipPath>

        <!-- 3D Spherical Radial Gradient Body (Smooth Matte/Satin Velvet Cyan-Blue) -->
        <radialGradient id="aiOrbBodyGrad" cx="38%" cy="30%" r="86%" fx="34%" fy="26%">
            <stop offset="0%" stop-color="var(--orb-stop-highlight, #dbeafe)" />
            <stop offset="20%" stop-color="var(--orb-stop-bright, #38bdf8)" />
            <stop offset="50%" stop-color="var(--orb-stop-primary, #0284c7)" />
            <stop offset="78%" stop-color="var(--orb-stop-deep, #03447c)" />
            <stop offset="100%" stop-color="var(--orb-stop-dark, #021f42)" />
        </radialGradient>

        <!-- Soft Diffuse Ambient Highlight (Matte/Satin, No Harsh Glare) -->
        <radialGradient id="aiOrbSoftHighlight" cx="42%" cy="40%" r="52%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.32" />
            <stop offset="50%" stop-color="#ffffff" stop-opacity="0.08" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>

        <!-- Eye Capsule Gradient (Deep velvety dark navy/black) -->
        <linearGradient id="aiOrbEyeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="var(--orb-eye-top, #0a1526)" />
            <stop offset="100%" stop-color="var(--orb-eye-bot, #01040a)" />
        </linearGradient>
    </defs>

    <g class="ai-orb-group">
        <!-- Clipped Sphere Content (Clean boundary, no bleed) -->
        <g clip-path="url(#aiOrbSphereClip)">
            <!-- Base 3D Sphere -->
            <circle class="ai-orb-sphere" cx="100" cy="100" r="74" fill="url(#aiOrbBodyGrad)" />
            
            <!-- Soft Diffuse Satin Highlight (Subtle, velvety light bounce) -->
            <ellipse class="ai-orb-highlight" cx="68" cy="62" rx="22" ry="16" transform="rotate(-30 68 62)" fill="url(#aiOrbSoftHighlight)" pointer-events="none" />

            <!-- Facial Emotion Group (Only Two Eyes, No Eyebrows, No Mouth) -->
            <g class="ai-orb-face">
                <!-- Left Eye Socket permanently anchored at (77, 97) - Awake, Lively & Centered -->
                <g class="ai-orb-eye-socket" transform="translate(77, 97)">
                    <g class="ai-orb-eye ai-orb-eye-left">
                        <g class="ai-orb-eye-inner">
                            <!-- Enlarged expressive capsule eye -->
                            <rect class="ai-orb-capsule" x="-9" y="-18" width="18" height="36" rx="9" ry="9" fill="url(#aiOrbEyeGrad)" />
                            <!-- Soft white catchlight / gloss reflection -->
                            <ellipse class="ai-orb-sparkle" cx="2.6" cy="-8.5" rx="2.5" ry="4.2" transform="rotate(-12 2.6 -8.5)" fill="#ffffff" opacity="0.88" />
                            <circle class="ai-orb-sparkle-micro" cx="-2.6" cy="7.2" r="1.3" fill="#ffffff" opacity="0.28" />
                            <!-- Happy expression upward crescent arch -->
                            <path class="ai-orb-arch" d="M -10 5 C -7.5 -8, 7.5 -8, 10 5" fill="none" stroke="url(#aiOrbEyeGrad)" stroke-width="5.5" stroke-linecap="round" />
                        </g>
                    </g>
                </g>

                <!-- Right Eye Socket permanently anchored at (123, 97) - Awake, Lively & Centered -->
                <g class="ai-orb-eye-socket" transform="translate(123, 97)">
                    <g class="ai-orb-eye ai-orb-eye-right">
                        <g class="ai-orb-eye-inner">
                            <!-- Enlarged expressive capsule eye -->
                            <rect class="ai-orb-capsule" x="-9" y="-18" width="18" height="36" rx="9" ry="9" fill="url(#aiOrbEyeGrad)" />
                            <!-- Clean, matched catchlight -->
                            <ellipse class="ai-orb-sparkle" cx="2.6" cy="-8.5" rx="2.5" ry="4.2" transform="rotate(-12 2.6 -8.5)" fill="#ffffff" opacity="0.88" />
                            <circle class="ai-orb-sparkle-micro" cx="-2.6" cy="7.2" r="1.3" fill="#ffffff" opacity="0.28" />
                            <!-- Happy expression upward crescent arch -->
                            <path class="ai-orb-arch" d="M -10 5 C -7.5 -8, 7.5 -8, 10 5" fill="none" stroke="url(#aiOrbEyeGrad)" stroke-width="5.5" stroke-linecap="round" />
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </g>
</svg>
`;

    // Modern Web Component Custom Element
    class AIOrbMascot extends HTMLElement {
        static get observedAttributes() {
            return ['expression', 'size'];
        }

        constructor() {
            super();
            this._expression = 'idle';
            this._blinkTimeout = null;
            this._reactionTimeout = null;
            this._introSequenceTimers = [];
            this._cursorTracking = true;
            this._boundOnMouseMove = this._onMouseMove.bind(this);
            this._boundOnMouseLeave = this._onMouseLeave.bind(this);
            this._glanceTimeout = null;
            this._lastPointer = 0;
            this._look = { x: 0, y: 0, tx: 0, ty: 0, raf: 0 };
        }

        connectedCallback() {
            if (!this.querySelector('.ai-orb-svg')) {
                this.innerHTML = ORB_SVG_TEMPLATE;
            }

            const initialExpr = this.getAttribute('expression') || 'idle';
            this.setExpression(initialExpr);

            if (this.hasAttribute('size')) {
                const s = this.getAttribute('size');
                this.style.width = isNaN(s) ? s : `${s}px`;
                this.style.height = isNaN(s) ? s : `${s}px`;
            }

            // Start wake-up sequence: double blink, then look right, then look left, then idle
            this.playIntroSequence();

            // Setup subtle cursor tracking for desktop
            window.addEventListener('mousemove', this._boundOnMouseMove, { passive: true });
            document.addEventListener('mouseleave', this._boundOnMouseLeave, { passive: true });

            // Pause the animations while the orb is off-screen or the tab is hidden
            this._visible = true;
            const sync = () => this.classList.toggle('orb-paused', document.hidden || !this._visible);
            this._boundVis = sync;
            document.addEventListener('visibilitychange', sync);
            if ('IntersectionObserver' in window) {
                this._io = new IntersectionObserver((entries) => { this._visible = entries[0].isIntersecting; sync(); });
                this._io.observe(this);
            }
        }

        disconnectedCallback() {
            this._clearIntroSequence();
            if (this._blinkTimeout) clearTimeout(this._blinkTimeout);
            if (this._reactionTimeout) clearTimeout(this._reactionTimeout);
            window.removeEventListener('mousemove', this._boundOnMouseMove);
            document.removeEventListener('mouseleave', this._boundOnMouseLeave);
            if (this._glanceTimeout) clearTimeout(this._glanceTimeout);
            if (this._io) this._io.disconnect();
            if (this._boundVis) document.removeEventListener('visibilitychange', this._boundVis);
            cancelAnimationFrame(this._look.raf);
        }

        _clearIntroSequence() {
            if (this._introSequenceTimers && this._introSequenceTimers.length > 0) {
                this._introSequenceTimers.forEach(t => clearTimeout(t));
                this._introSequenceTimers = [];
            }
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue === newValue) return;
            if (name === 'expression') {
                this.setExpression(newValue || 'idle');
            } else if (name === 'size') {
                const s = newValue;
                this.style.width = isNaN(s) ? s : `${s}px`;
                this.style.height = isNaN(s) ? s : `${s}px`;
            }
        }

        get expression() {
            return this._expression;
        }

        set expression(val) {
            this.setAttribute('expression', val);
        }

        /**
         * Set current expression. If durationMs is provided, automatically returns to 'idle'
         */
        setExpression(expr, durationMs = 0) {
            const validExpressions = [
                'idle', 'looking-left', 'looking-right', 'excited', 'happy',
                'angry', 'pout', 'surprised', 'blink', 'thinking', 'responding', 'error'
            ];

            const normalized = validExpressions.includes(expr) ? expr : 'idle';
            this._expression = normalized;

            // Remove existing expression classes and add new one
            validExpressions.forEach(e => {
                this.classList.remove(`orb-expr-${e}`);
            });
            this.classList.add(`orb-expr-${normalized}`);
            this.setAttribute('data-expression', normalized);

            // Clear any pending temporary expression timer
            if (this._reactionTimeout) {
                clearTimeout(this._reactionTimeout);
                this._reactionTimeout = null;
            }

            // If an active emotion is triggered (e.g., chat interaction), pause the glance routine
            if (normalized !== 'idle' && normalized !== 'looking-right' && normalized !== 'looking-left') {
                this._clearIntroSequence();
            }

            if (durationMs > 0 && normalized !== 'idle') {
                this._reactionTimeout = setTimeout(() => {
                    this.setExpression('idle');
                    this._startIdleLife();
                }, durationMs);
            }
        }

        /**
         * Trigger a temporary emotional reaction then smoothly revert to idle
         */
        triggerReaction(expr, durationMs = 1800) {
            this.setExpression(expr, durationMs);
        }

        /**
         * Entrance & Recurring Glance Sequence (repeats every 6 seconds):
         * "প্রথমে দুই বার চোখ বিলিংক করে ডানে বামে তাকাবে এবং ৬ সেকেন্ড পর পর রিপিট হবে"
         * 1. First blink
         * 2. Pause
         * 3. Second blink
         * 4. Look right
         * 5. Look upward-left
         * 6. Settle back into center idle
         * 7. Wait 6 seconds and repeat
         */
        playIntroSequence() {
            this._clearIntroSequence();
            if (this._blinkTimeout) clearTimeout(this._blinkTimeout);
            this.setExpression('idle');

            const addTimer = (fn, delay) => {
                const t = setTimeout(fn, delay);
                this._introSequenceTimers.push(t);
                return t;
            };

            // 1. First Blink (starts at 300ms)
            addTimer(() => {
                this.classList.add('orb-is-blinking');
                // Open first blink after 130ms
                addTimer(() => {
                    this.classList.remove('orb-is-blinking');

                    // 2. Second Blink (220ms after first blink finishes)
                    addTimer(() => {
                        this.classList.add('orb-is-blinking');
                        // Open second blink after 130ms
                        addTimer(() => {
                            this.classList.remove('orb-is-blinking');

                            // 3. Smoothly sweep Right (400ms pause after double-blink, then turn right)
                            addTimer(() => {
                                this.setExpression('looking-right');

                                // 4. Hold glance right (700ms glide + 500ms pause = 1200ms), then sweep to Upward-Left
                                addTimer(() => {
                                    this.setExpression('looking-left');

                                    // 5. Hold glance upward-left (700ms glide + 500ms pause = 1200ms), then glide back to Center Idle
                                    addTimer(() => {
                                        this.setExpression('idle');
                                        // From here on: natural, random idle behaviour (no repeating loop)
                                        this._startIdleLife();
                                    }, 1200);
                                }, 1200);
                            }, 400);
                        }, 130);
                    }, 220);
                }, 130);
            }, 300);
        }

        /**
         * Manual or automated look direction offset (-10px to +10px)
         */
        lookAt(dx, dy) {
            this.style.setProperty('--orb-look-x', `${Math.max(-10, Math.min(10, dx))}px`);
            this.style.setProperty('--orb-look-y', `${Math.max(-7, Math.min(7, dy))}px`);
        }

        resetLook() {
            this.style.setProperty('--orb-look-x', '0px');
            this.style.setProperty('--orb-look-y', '0px');
        }

        /** Natural idle behaviour: random blinks, occasional glances and tiny eye movements. */
        _startIdleLife() {
            this._scheduleNextBlink();
            this._scheduleGlance();
        }

        _blinkOnce(cb) {
            this.classList.add('orb-is-blinking');
            setTimeout(() => { this.classList.remove('orb-is-blinking'); if (cb) cb(); }, 110 + Math.random() * 60);
        }

        _scheduleGlance() {
            if (this._glanceTimeout) clearTimeout(this._glanceTimeout);
            this._glanceTimeout = setTimeout(() => {
                const pointerQuiet = Date.now() - this._lastPointer > 4000;
                if (this._expression === 'idle' && pointerQuiet && !this.classList.contains('orb-paused')) {
                    const r = Math.random();
                    if (r < 0.55) {
                        // a glance to one side, often with a blink on the way back
                        this.setExpression(Math.random() < 0.5 ? 'looking-left' : 'looking-right');
                        setTimeout(() => {
                            if (this._expression === 'looking-left' || this._expression === 'looking-right') {
                                this.setExpression('idle');
                                if (Math.random() < 0.6) setTimeout(() => this._blinkOnce(), 120);
                            }
                        }, 700 + Math.random() * 700);
                    } else {
                        // tiny eye movements (saccades) that settle back to centre
                        this._setLookTarget((Math.random() * 2 - 1) * 4, (Math.random() * 2 - 1) * 3);
                        setTimeout(() => this._setLookTarget(0, 0), 450 + Math.random() * 500);
                    }
                }
                this._scheduleGlance();
            }, 7000 + Math.random() * 9000);
        }

        /** Smoothly ease the gaze toward a target instead of jumping. */
        _setLookTarget(x, y) {
            const L = this._look;
            L.tx = Math.max(-10, Math.min(10, x)); L.ty = Math.max(-7, Math.min(7, y));
            if (L.raf) return;
            const step = () => {
                L.x += (L.tx - L.x) * 0.18; L.y += (L.ty - L.y) * 0.18;
                this.style.setProperty('--orb-look-x', `${L.x.toFixed(2)}px`);
                this.style.setProperty('--orb-look-y', `${L.y.toFixed(2)}px`);
                L.raf = (Math.abs(L.tx - L.x) > 0.05 || Math.abs(L.ty - L.y) > 0.05) ? requestAnimationFrame(step) : 0;
            };
            L.raf = requestAnimationFrame(step);
        }

        _scheduleNextBlink() {
            if (this._blinkTimeout) clearTimeout(this._blinkTimeout);
            // Natural random interval between 2.5s and 6.5s
            const interval = 2500 + Math.random() * 4000;
            this._blinkTimeout = setTimeout(() => {
                if (this._expression === 'idle') {
                    this.classList.add('orb-is-blinking');
                    setTimeout(() => {
                        this.classList.remove('orb-is-blinking');
                        // Occasional natural double blink
                        if (Math.random() < 0.2) {
                            setTimeout(() => {
                                if (this._expression === 'idle') {
                                    this.classList.add('orb-is-blinking');
                                    setTimeout(() => this.classList.remove('orb-is-blinking'), 140);
                                }
                            }, 180);
                        }
                    }, 150);
                }
                this._scheduleNextBlink();
            }, interval);
        }

        _onMouseMove(e) {
            // Only perform subtle cursor tracking when in idle or thinking state
            if (this._expression !== 'idle' && this._expression !== 'thinking') {
                this._setLookTarget(0, 0);
                return;
            }

            const rect = this.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            const orbCenterX = rect.left + rect.width / 2;
            const orbCenterY = rect.top + rect.height / 2;

            const deltaX = e.clientX - orbCenterX;
            const deltaY = e.clientY - orbCenterY;
            const dist = Math.hypot(deltaX, deltaY);

            // Responsive gaze radius
            if (dist < 1000) {
                const maxShiftX = 8;
                const maxShiftY = 5;
                const factor = Math.min(1, dist / 350);
                const shiftX = (deltaX / (dist || 1)) * maxShiftX * factor;
                const shiftY = (deltaY / (dist || 1)) * maxShiftY * factor;
                this._lastPointer = Date.now();
                this._setLookTarget(shiftX, shiftY);
            } else {
                this._setLookTarget(0, 0);
            }
        }

        _onMouseLeave() {
            this._setLookTarget(0, 0);
        }
    }

    if (!customElements.get('ai-orb-mascot')) {
        customElements.define('ai-orb-mascot', AIOrbMascot);
    }

    /**
     * Proactive greeting, modelled on nahian.bd's "DM toast":
     *  - counts *active* attention (tab visible and the visitor interacted in the last 20s), kept per session across pages
     *  - shows after 2 min of attention, or 1 min plus (2+ pages or half-way down a page), once the visitor pauses for 2.5s
     *  - also on desktop exit intent (after 30s), or while the tab is hidden (after 45s) with a "(1) ..." title flash
     *  - never on Contact, while typing, with text selected, or while the chat or menu is open
     *  - reads like a chat: typing dots, a context-aware greeting, one question per page, quick-reply chips,
     *    a typed answer, then a call to action; closes itself after 30s of no interaction (hover pauses it)
     *  - after it shows, the attention count restarts, so it can come back later in the visit, never in a burst
     */
    function initProactiveGreeting() {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;

        const page = ((document.body && document.body.dataset.page) || 'home').split('/')[0];
        if (page === 'contact') return;
        const NAME = 'Mehedi', CITY = 'Dhaka', TZ = 'Asia/Dhaka';
        const IDLE = 20000, CLOSE_AFTER = 30000, DAY = 864e5;
        const widget = () => document.getElementById('ai-chat-widget');
        const isChatOpen = () => { const w = widget(); return !!(w && w.classList.contains('chat-expanded')); };
        const phone = window.matchMedia('(max-width: 767px)');
        const still = window.matchMedia('(prefers-reduced-motion: reduce)');
        const rootHref = (() => { const l = document.querySelector('a.logo-link'); return l ? new URL(l.getAttribute('href'), location.href).href.replace(/index\.html$/, '') : '/'; })();

        /* ---- per-session memory (attention, pages) and per-browser visit history ---- */
        const ss = { get: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} } };
        const ls = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
        const num = (v) => Number(v) || 0;
        if (!ss.get('greet:start')) {
            ss.set('greet:start', String(Date.now()));
            ls.set('greet:visits', String(num(ls.get('greet:visits')) + 1));
            const last = num(ls.get('greet:last'));
            if (last) ss.set('greet:away', String(Math.floor((Date.now() - last) / DAY)));
            ls.set('greet:last', String(Date.now()));
        }
        ss.set('greet:pages', String(num(ss.get('greet:pages')) + 1));
        let attention = num(ss.get('greet:active'));
        let depth = 0, lastActive = Date.now(), lastMove = Date.now();

        /* ---- what to say ---- */
        const pick = (a) => a[Math.floor(Math.random() * a.length)];
        function clockIn(tz) { try { return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZone: tz }); } catch (e) { return ''; } }
        function hoursApart() {
            try {
                const here = new Date(), mine = new Date(here.toLocaleString('en-US', { timeZone: TZ }));
                return Math.round(Math.abs(mine - new Date(here.toLocaleString('en-US'))) / 36e5);
            } catch (e) { return 0; }
        }
        function greeting() {
            const visits = num(ls.get('greet:visits')), awayRaw = ss.get('greet:away'), away = awayRaw === null ? null : num(awayRaw);
            const h = new Date().getHours(), apart = hoursApart();
            if (visits > 1 && away !== null) {
                if (away === 0) return pick(['Welcome back!', 'Nice to see you again!']);
                if (away === 1) return 'Welcome back! Good to see you again.';
                return `Welcome back! It's been ${away} days, good to see you again.`;
            }
            if (apart === 0) return pick(['Assalamu alaikum!', 'Hi! Looks like we share a time zone.']);
            if (h < 5) return `It's ${clockIn()} where you are. Thanks for spending part of your night here.`;
            if (apart >= 3) return pick([`Hello from ${CITY}, where it's ${clockIn(TZ)} right now.`, `Hi! It's ${clockIn(TZ)} here in ${CITY}.`]);
            if (h < 12) return pick(['Good morning!', "Morning! Hope your day's off to a good start."]);
            if (h >= 18) return pick(['Good evening!', "Hi! Hope your evening's going well."]);
            return pick(['Hi there!', 'Hello!']);
        }
        const CHAT = { cta: 'Ask my AI', action: 'chat' };
        const TALK = { cta: "Let's talk", href: rootHref + 'contact/' };
        const FLOWS = {
            home: { ask: ['Curious what I build?', 'Want a quick look at my work?'], replies: [
                { label: 'Show me projects', answers: [['Here are the ones I am proudest of.'], ['The NGO ERP is the big one: 85+ modules on events and agents.']], then: { cta: 'Open projects', href: rootHref + 'projects/' } },
                { label: 'I have a question', answers: [['Sure! My AI assistant knows my work and stack well.']], then: CHAT },
                { label: 'Just browsing', answers: [['No problem at all. Enjoy looking around!']], then: 'bye' } ] },
            profile: { ask: ['Hiring, or just looking around?', 'Looking for someone for a project?'], replies: [
                { label: 'Hiring', hearts: true, answers: [['That is great to hear!', 'I would love to hear about the role.']], then: TALK },
                { label: 'A freelance project', answers: [['Nice. AI automation, ERP and web platforms are my sweet spot.']], then: TALK },
                { label: 'Just looking', answers: [['No worries. Feel free to look around.']], then: 'bye' } ] },
            projects: { ask: ['Are you working on something of your own?', 'Do you have a project in mind?'], replies: [
                { label: 'Yes, I have an idea', hearts: true, answers: [['Love that!', 'Tell my AI assistant about it, and it can point you to similar work.']], then: CHAT },
                { label: 'Not right now', answers: [['That is alright!', 'If you ever need a hand later, you know where to find me.']], then: 'bye' } ] },
            library: { ask: ['Looking for a tool or a course?', 'Exploring my stack?'], replies: [
                { label: 'Yes, help me pick', answers: [['Happy to help.', 'Ask my AI which tool fits your stack.']], then: CHAT },
                { label: 'Just browsing', answers: [['Enjoy! Everything here is something I actually use.']], then: 'bye' } ] },
            people: { ask: ['Know any of these people?'], replies: [
                { label: 'A few of them', hearts: true, answers: [['Then you are in good company!']], then: 'bye' },
                { label: 'Not yet', answers: [['Each of them shaped how I work. Worth following!']], then: 'bye' } ] }
        };
        const late = new Date().getHours() < 5;
        const flow = late ? { ask: ['Working late tonight?'], replies: [
            { label: 'Yes, deadline mode', answers: [['I know that feeling.', 'Hope it goes well. Take a short break too!']], then: 'bye' },
            { label: 'Just exploring', answers: [['Night owls find the best stuff. Enjoy!']], then: 'bye' } ] } : (FLOWS[page] || FLOWS.home);

        /* ---- mascot moods: every orb on the page reacts together ---- */
        const orbs = () => document.querySelectorAll('ai-orb-mascot');
        const mood = (expr, ms) => orbs().forEach((m) => { if (typeof m.triggerReaction === 'function') { if (ms) m.triggerReaction(expr, ms); else m.setExpression(expr); } });
        const moodAfter = (delay, expr, ms) => setTimeout(() => mood(expr, ms), delay);

        /* ---- the bubble ---- */
        let el = null, run = 0, state = 'idle', closeTimer = null, titleTimer = null, savedTitle = '';
        const wait = (ms) => new Promise((r) => setTimeout(r, still.matches ? 0 : ms));
        const rand = (a, b) => a + Math.random() * (b - a);
        const typeTime = (t) => Math.min(2600, Math.max(700, 380 + t.length * 30)) * rand(0.85, 1.15);

        function flashTitle(on) {
            clearInterval(titleTimer);
            if (!on) { if (savedTitle) document.title = savedTitle; return; }
            if (!savedTitle) savedTitle = document.title;
            if (document.visibilityState === 'hidden') {
                let alt = false;
                const tick = () => { document.title = (alt = !alt) ? `(1) ${NAME} messaged you` : `(1) ${savedTitle}`; };
                tick(); titleTimer = setInterval(tick, 1500);
            } else document.title = `(1) ${savedTitle}`;
        }
        function markUnread(on) { const w = widget(); if (w) w.classList.toggle('has-unread', on); }
        function armClose() {
            clearTimeout(closeTimer);
            if (el && document.visibilityState === 'visible' && !el.matches(':hover, :focus-within')) closeTimer = setTimeout(() => close(true), CLOSE_AFTER);
        }
        function close(leaveDot) {
            run++; state = 'idle'; clearTimeout(closeTimer); flashTitle(false); savedTitle = '';
            if (!el) return;
            const node = el; el = null;
            node.classList.add('bubble-closing');
            setTimeout(() => node.remove(), 300);
            markUnread(!!leaveDot);
        }
        function openChat() {
            close(false); markUnread(false);
            const w = widget(); if (!w || isChatOpen()) return;
            const header = document.getElementById('chat-header');
            if (header) header.click(); else { w.classList.remove('chat-collapsed'); w.classList.add('chat-expanded'); }
        }
        function line(text, mine) {
            const thread = el.querySelector('.dm-thread'), p = document.createElement('p');
            p.className = 'dm-msg' + (mine ? ' dm-mine' : ''); p.textContent = text;
            thread.insertBefore(p, thread.querySelector('.dm-typing'));
            const all = thread.querySelectorAll('.dm-msg'); if (all.length > 5) all[0].remove();
        }
        async function say(text, id) {
            const dots = el.querySelector('.dm-typing');
            dots.hidden = false; mood('responding');
            await wait(typeTime(text));
            if (id !== run || !el) { mood('idle'); return false; }
            dots.hidden = true; line(text, false); mood('idle'); return true;
        }
        function burst(btn) {
            if (still.matches) return;
            const r = el.getBoundingClientRect(), b = btn.getBoundingClientRect();
            for (let i = 0; i < 6; i++) {
                const h = document.createElement('span'); h.className = 'dm-heart'; h.textContent = '♥';
                h.style.left = (b.left - r.left + b.width / 2) + 'px'; h.style.top = (b.top - r.top) + 'px';
                h.style.setProperty('--x', Math.round(rand(-50, 50)) + 'px'); h.style.setProperty('--d', (i * 60) + 'ms');
                el.appendChild(h); setTimeout(() => h.remove(), 1400);
            }
        }
        function ctaRow(then) {
            const row = el.querySelector('.dm-cta');
            const primary = then.href ? `<a class="ai-orb-bubble-btn ai-orb-bubble-btn-primary" href="${then.href}">${then.cta}</a>`
                                      : `<button type="button" class="ai-orb-bubble-btn ai-orb-bubble-btn-primary" data-act="chat">${then.cta}</button>`;
            row.innerHTML = primary + '<button type="button" class="ai-orb-bubble-btn" data-act="later">Maybe later</button>';
            row.hidden = false;
        }
        async function reply(choice, btn) {
            const id = run;
            clearTimeout(closeTimer); flashTitle(false);
            if (choice.hearts) { burst(btn); mood('excited', 1800); }
            el.querySelector('.dm-chips').hidden = true;
            line(choice.label, true);
            await wait(rand(600, 1100));
            const group = pick(choice.answers);
            for (const [i, t] of group.entries()) { if (i) await wait(rand(300, 650)); if (!(await say(t, id))) return; }
            if (!choice.hearts) mood('happy', 1400);
            if (choice.then === 'bye') { setTimeout(() => { if (id === run) close(false); }, 5000); return; }
            ctaRow(choice.then); armClose();
        }
        async function show(silent) {
            if (state !== 'idle' || el || isChatOpen() || document.body.classList.contains('drawer-open')) return;
            state = 'open';
            attention = 0; ss.set('greet:active', '0');            /* the next greeting needs fresh attention */
            const id = ++run, compact = phone.matches;
            el = document.createElement('div');
            el.id = 'ai-orb-speech-bubble';
            el.className = 'ai-orb-speech-bubble is-dm' + (compact ? ' is-compact' : '');
            el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
            el.innerHTML = `
                <div class="ai-orb-bubble-header">
                    <div class="dm-who"><span class="dm-avatar" aria-hidden="true"><ai-orb-mascot expression="happy" size="34"></ai-orb-mascot></span><span><b>${NAME}'s AI</b><small>just now</small></span></div>
                    <button class="ai-orb-bubble-close" aria-label="Close" title="Close (Esc)">&times;</button>
                </div>
                <div class="dm-thread"><div class="dm-typing" hidden aria-hidden="true"><i></i><i></i><i></i></div></div>
                <div class="dm-chips" hidden><p class="dm-chips-label">Pick a quick reply</p><div class="dm-chip-list" role="group" aria-label="Quick replies"></div></div>
                <div class="dm-cta ai-orb-bubble-actions" hidden></div>
                <div class="ai-orb-bubble-arrow"></div>`;
            el.addEventListener('click', (e) => {
                const b = e.target.closest('[data-act]');
                if (e.target.closest('.ai-orb-bubble-close') || (b && b.dataset.act === 'later')) { close(false); mood('pout', 1500); return; }
                if (b && b.dataset.act === 'chat') { openChat(); return; }
                if (e.target.closest('a')) close(false);
            });
            el.addEventListener('mouseenter', () => { clearTimeout(closeTimer); flashTitle(false); });
            el.addEventListener('mouseleave', armClose);
            el.addEventListener('focusin', () => flashTitle(false));
            let sx = 0, sy = 0;
            el.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
            el.addEventListener('touchend', (e) => { const t = e.changedTouches[0]; if (t.clientX - sx > 60 || t.clientY - sy > 50) close(true); }, { passive: true });
            document.body.appendChild(el);
            requestAnimationFrame(() => el && el.classList.add('is-in'));
            mood('surprised');
            flashTitle(true);
            if (!silent) await wait(650);              /* a beat of surprise before it starts typing */
            if (id !== run) return;

            const lines = [greeting(), pick(flow.ask)];
            for (const [i, t] of lines.entries()) {
                if (i && !silent) await wait(rand(350, 750));
                if (id !== run) return;
                if (silent) line(t, false); else if (!(await say(t, id))) return;
            }
            const list = el.querySelector('.dm-chip-list');
            flow.replies.forEach((r) => {
                const b = document.createElement('button'); b.type = 'button'; b.className = 'dm-chip'; b.textContent = r.label;
                b.addEventListener('click', (e) => { e.stopPropagation(); reply(r, b); });
                list.appendChild(b);
            });
            el.querySelector('.dm-chips').hidden = false;
            mood('happy', 1500);
            armClose();
        }

        /* ---- attention tracking (nahian.bd logic) ---- */
        const blocked = (ignoreHidden) => {
            if (!ignoreHidden && document.visibilityState !== 'visible') return true;
            if (isChatOpen() || document.querySelector('dialog[open]') || document.body.classList.contains('drawer-open')) return true;
            const a = document.activeElement;
            if (a && a.matches && a.matches('input, textarea, select, [contenteditable]')) return true;
            return !!(window.getSelection && String(window.getSelection()));
        };
        const ready = () => (attention >= 120000 || (attention >= 60000 && (num(ss.get('greet:pages')) >= 2 || depth >= 0.5))) && Date.now() - lastMove >= 2500;
        const touch = () => { lastMove = lastActive = Date.now(); };
        ['scroll', 'wheel', 'keydown', 'touchmove'].forEach((t) => addEventListener(t, touch, { passive: true }));
        ['pointermove', 'pointerdown'].forEach((t) => addEventListener(t, () => { lastActive = Date.now(); }, { passive: true }));
        addEventListener('scroll', () => { depth = Math.max(depth, (scrollY + innerHeight) / document.documentElement.scrollHeight); }, { passive: true });
        setInterval(() => {
            if (state !== 'idle' || document.visibilityState !== 'visible') return;
            if (Date.now() - lastActive > IDLE) return;
            attention += 1000; ss.set('greet:active', String(attention));
            if (ready() && !blocked()) show(false);
        }, 1000);
        let hiddenTimer = null;
        document.addEventListener('visibilitychange', () => {
            clearTimeout(hiddenTimer);
            if (document.visibilityState === 'hidden') {
                clearTimeout(closeTimer);
                if (state === 'idle' && attention >= 45000 && !blocked(true)) hiddenTimer = setTimeout(() => { if (document.visibilityState === 'hidden') show(true); }, rand(5000, 12000));
            } else { touch(); if (el) { flashTitle(true); armClose(); } }
        });
        document.addEventListener('mouseout', (e) => {
            if (e.relatedTarget || e.clientY > 0 || state !== 'idle' || attention < 30000) return;
            if (window.matchMedia('(pointer: fine)').matches && !blocked()) show(false);
        });

        /* ---- phones: tuck the orb away while scrolling down, bring it back on scroll up ---- */
        let lastY = window.scrollY, ticking = false;
        addEventListener('scroll', () => {
            if (ticking) return; ticking = true;
            requestAnimationFrame(() => {
                const w = widget(), y = window.scrollY;
                if (w && phone.matches && !isChatOpen() && !el) {
                    if (y > lastY + 6 && y > 120) w.classList.add('ai-tucked');
                    else if (y < lastY - 6 || y <= 120) w.classList.remove('ai-tucked');
                }
                lastY = y; ticking = false;
            });
        }, { passive: true });

        /* ---- keyboard: Esc closes; "/" opens the chat (when not typing somewhere) ---- */
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && el) { close(false); mood('pout', 1500); return; }
            if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
                const t = e.target;
                if (t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName))) return;
                e.preventDefault(); openChat();
                setTimeout(() => { const i = document.getElementById('chat-input'); if (i) i.focus(); }, 350);
            }
        });

        /* typing in the chat box: the orb watches what you write */
        const input = document.getElementById('chat-input');
        let typingTimer = null;
        if (input) input.addEventListener('input', () => {
            orbs().forEach((m) => { if (m.expression === 'idle' || m.expression === 'looking-left') m.setExpression('looking-left'); });
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => orbs().forEach((m) => { if (m.expression === 'looking-left') m.setExpression('idle'); }), 1200);
        });

        /* tapping the orb again and again: a playful frown, then a smile */
        let taps = [];
        const header = document.getElementById('chat-header');
        if (header) header.addEventListener('pointerdown', () => {
            const now = Date.now(); taps = taps.filter((t) => now - t < 1800); taps.push(now);
            if (taps.length >= 4) { taps = []; mood('angry', 1200); moodAfter(1250, 'happy', 1200); }
        });

        /* opening the chat any other way clears the greeting and the dot */
        const w = widget();
        if (w) w.addEventListener('click', () => { if (el) close(false); markUnread(false); });

        /* test hook: AIOrbGreeting.show() */
        window.AIOrbGreeting = { show: () => show(false) };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProactiveGreeting);
    } else {
        initProactiveGreeting();
    }

    window.AIOrbMascot = AIOrbMascot;
})();
