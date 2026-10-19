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

    /* ===================================================================
     * Visitor sense: reads how this visitor browses so the greeting and the
     * chat can meet them where they are. Everything stays in this tab
     * (sessionStorage); only a one-line summary goes to the AI, and only
     * when the visitor opens the chat themselves.
     * =================================================================== */
    const VisitorSense = (() => {
        const KEY = 'vs:v1';
        const TECH = /\b(kafka|nestjs|nest|langgraph|langchain|mcp|rag|pgvector|postgres(ql)?|redis|rabbitmq|docker|kubernetes|k8s|aws|react|next\.?js|typescript|python|fastapi|laravel|flutter|ollama|claude|openai|gemini|llm|agent|microservices?|erp|n8n|whisper|vat|payroll)\b/i;
        const ITEMS = [
            ['.project-card, .proj, .work2-row', 'project'],
            ['.exp-item-modern', 'experience'],
            ['.edu, .cert-card', 'education'],
            ['.svc2-card, .svc-card, .home-svc', 'service'],
            ['.person', 'person'],
            ['.nl-card, .nl-bm, .nl-ch, .nl-feature', 'library'],
            ['.arch-unified-card', 'architecture'],
            ['.sk', 'skills']
        ];
        let st;
        try { st = JSON.parse(sessionStorage.getItem(KEY)); } catch (e) { st = null; }
        if (!st || typeof st !== 'object') st = {};
        st.dwell = st.dwell || {}; st.kind = st.kind || {}; st.revisits = st.revisits || {}; st.chips = st.chips || {};
        st.clicks = st.clicks || {}; st.pages = st.pages || []; st.scroll = st.scroll || { fast: 0, slow: 0, back: 0 }; st.revAt = st.revAt || {};
        const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
        let started = false;

        function label(el, kind) {
            if (kind === 'experience') {
                const t = el.querySelector('h3'), sub = el.querySelector('.exp-sub');
                const co = sub && sub.firstChild && sub.firstChild.nodeType === 3 ? sub.firstChild.textContent.trim() : '';
                return ((t ? t.textContent.trim() : 'a role') + (co ? ' at ' + co : '')).slice(0, 60);
            }
            const h = el.querySelector('h3, h4, .nl-card-title, .svc2-title, b, strong');
            return (h ? h.textContent : el.textContent).replace(/\s+/g, ' ').trim().slice(0, 48);
        }

        function start() {
            if (started) return; started = true;
            if (!st.pages.includes(location.pathname)) st.pages.push(location.pathname);
            st.pages = st.pages.slice(-20);
            save();

            /* what is on screen, and which item sits in the middle of it */
            const items = [];
            ITEMS.forEach(([sel, kind]) => document.querySelectorAll(sel).forEach((el) => { if (!items.some((x) => x.el === el)) items.push({ el, kind, label: label(el, kind) }); }));
            const visible = new Set();
            if ('IntersectionObserver' in window && items.length) {
                const io = new IntersectionObserver((es) => es.forEach((e) => {
                    const it = items.find((x) => x.el === e.target);
                    if (!it) return;
                    const big = e.intersectionRect.height >= Math.min(e.boundingClientRect.height * 0.5, window.innerHeight * 0.35);
                    if (e.isIntersecting && big) visible.add(it); else visible.delete(it);
                }), { threshold: [0, 0.25, 0.5, 0.75, 1] });
                items.forEach((it) => io.observe(it.el));
            }

            /* scrolling style: fast skimming vs slow reading, and scrolling back up to re-read */
            let lastY = window.scrollY, lastT = performance.now(), lastActive = Date.now(), scrollingFast = false;
            addEventListener('scroll', () => {
                const now = performance.now(), y = window.scrollY, dt = Math.max(16, now - lastT), dy = y - lastY;
                lastActive = Date.now();
                if (dt > 300) { lastY = y; lastT = now; return; }        /* first event of a new gesture: no speed yet */
                const speed = Math.abs(dy) / dt * 1000;
                scrollingFast = speed > 1800;
                if (scrollingFast) st.scroll.fast += dt; else if (speed < 700) st.scroll.slow += dt;
                if (dy < 0) st.scroll.back += -dy;
                lastY = y; lastT = now; lastActive = Date.now();
            }, { passive: true });
            ['pointermove', 'pointerdown', 'keydown', 'touchstart'].forEach((t) => addEventListener(t, () => { lastActive = Date.now(); }, { passive: true }));

            /* one second at a time: the item in the middle of the screen earns the time; leaving and coming back is a revisit */
            const lastFocusAt = {}; let current = null, glances = 0, lastGlance = 0;
            setInterval(() => {
                save();
                if (document.visibilityState !== 'visible' || Date.now() - lastActive > 20000 || scrollingFast || !visible.size) { current = null; return; }
                const mid = window.innerHeight / 2;
                let best = null, bestD = Infinity;
                visible.forEach((it) => { const r = it.el.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - mid); if (d < bestD) { bestD = d; best = it; } });
                if (!best) return;
                const now = Date.now(), l = best.label;
                if (current !== l) {
                    if (lastFocusAt[l] && now - lastFocusAt[l] > 6000 && (st.dwell[l] || 0) >= 3000) { st.revisits[l] = (st.revisits[l] || 0) + 1; st.revAt[l] = now; }
                    current = l;
                }
                lastFocusAt[l] = now;
                const before = st.dwell[l] || 0;
                st.dwell[l] = before + 1000; st.kind[l] = best.kind;
                /* the orb quietly looks at what the visitor is reading, now and then */
                if (before < 5000 && st.dwell[l] >= 5000 && glances < 3 && now - lastGlance > 45000) {
                    const m = document.getElementById('chat-mascot'), w = document.getElementById('ai-chat-widget');
                    if (m && w && w.classList.contains('chat-collapsed') && !document.getElementById('ai-orb-speech-bubble') && m.expression === 'idle' && typeof m.triggerReaction === 'function') {
                        const r = best.el.getBoundingClientRect(), o = m.getBoundingClientRect();
                        m.triggerReaction(r.left + r.width / 2 < o.left ? 'looking-left' : 'looking-right', 1600);
                        glances++; lastGlance = now;
                    }
                }
                save();
            }, 1000);

            /* words they highlight or copy */
            let selTimer = 0;
            const takeSelection = (copied) => {
                const sel = window.getSelection && window.getSelection();
                const a = document.activeElement;
                if (!sel || (a && a.matches && a.matches('input, textarea'))) return;
                if (sel.anchorNode && sel.anchorNode.parentElement && sel.anchorNode.parentElement.closest('#ai-chat-widget, #ai-orb-speech-bubble')) return;
                const t = String(sel).replace(/\s+/g, ' ').trim();
                if (t.length < 2 || t.length > 40) return;
                st.sel = { t, at: Date.now(), copied: !!copied }; save();
            };
            document.addEventListener('selectionchange', () => { clearTimeout(selTimer); selTimer = setTimeout(() => takeSelection(false), 700); });
            document.addEventListener('copy', () => takeSelection(true));

            /* tools they hover, and what they click */
            let chipAt = 0;
            document.addEventListener('pointerover', (e) => {
                const c = e.target.closest && e.target.closest('[data-ask]');
                if (!c || Date.now() - chipAt < 1500) return;
                chipAt = Date.now(); st.chips[c.dataset.ask] = (st.chips[c.dataset.ask] || 0) + 1; save();
            }, { passive: true });
            document.addEventListener('click', (e) => {
                const a = e.target.closest && e.target.closest('a[href], [data-discuss], .chat-fit-card, .svc2-card');
                if (!a) return;
                const h = a.getAttribute('href') || '';
                const k = /\.pdf/i.test(h) ? 'cv' : /github\.com/i.test(h) ? 'github' : /linkedin\.com/i.test(h) ? 'linkedin'
                    : /wa\.me|whatsapp/i.test(h) ? 'whatsapp' : /^mailto:/i.test(h) ? 'email'
                    : a.matches('[data-discuss], .chat-fit-card') ? 'discuss' : a.matches('.svc2-card') ? 'service' : '';
                if (k) { st.clicks[k] = (st.clicks[k] || 0) + 1; save(); }
            }, true);
        }

        function profile() {
            let from = ''; try { from = sessionStorage.getItem('greet:from') || ''; } catch (e) {}
            const has = (p) => st.pages.some((x) => x.indexOf(p) !== -1);
            const kd = (k) => Object.keys(st.dwell).filter((l) => st.kind[l] === k).reduce((a, l) => a + st.dwell[l], 0);
            const s = { recruiter: 0, technical: 0, client: 0, personal: 0 };
            if (/linkedin/i.test(from)) s.recruiter += 3;
            if (/github|dev|reddit/i.test(from)) s.technical += 3;
            if (st.clicks.cv) s.recruiter += 3;
            if (st.clicks.linkedin) s.recruiter += 1;
            if (kd('experience') + kd('education') > 15000) s.recruiter += 2;
            if (has('/profile/')) s.recruiter += 1;
            if (st.clicks.github) s.technical += 2;
            if (has('/stack/') || has('/architecture/')) s.technical += 2;
            if (kd('architecture') + kd('skills') > 10000) s.technical += 2;
            if (Object.values(st.chips).reduce((a, b) => a + b, 0) >= 2) s.technical += 2;
            const sel = st.sel && Date.now() - st.sel.at < 4 * 60000 ? st.sel : null;
            if (sel && TECH.test(sel.t)) s.technical += 2;
            if (st.clicks.whatsapp || st.clicks.email || st.clicks.discuss) s.client += 3;
            if (st.clicks.service || kd('service') > 8000) s.client += 3;
            if (has('/contact/')) s.client += 2;
            if (kd('project') > 30000) { s.technical += 1; s.client += 1; }
            if (has('/people/')) s.personal += 2;
            if (has('/library/')) s.personal += 2;
            if (kd('library') + kd('person') > 20000) s.personal += 2;
            const ranked = Object.entries(s).sort((a, b) => b[1] - a[1]);
            const persona = ranked[0][1] >= 3 ? ranked[0][0] : 'explorer';
            const timed = st.scroll.fast + st.scroll.slow;
            const totalDwell = Object.values(st.dwell).reduce((a, b) => a + b, 0);
            const style = timed > 1500 && st.scroll.fast / timed > 0.45 ? 'scanner' : (totalDwell > 40000 && st.scroll.fast / Math.max(timed, 1) < 0.2 ? 'reader' : 'browser');
            const top = Object.entries(st.dwell).filter(([, ms]) => ms >= 5000).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([l]) => l);
            const rev = Object.entries(st.revisits).sort((a, b) => b[1] - a[1] || (st.revAt[b[0]] || 0) - (st.revAt[a[0]] || 0))[0];
            const expRead = Object.keys(st.dwell).filter((l) => st.kind[l] === 'experience' && st.dwell[l] >= 4000).length;
            return {
                persona, scores: s, style, from, pages: st.pages.length,
                top, topKind: top[0] ? st.kind[top[0]] : null, topMs: top[0] ? st.dwell[top[0]] : 0,
                revisited: rev && rev[1] >= 1 ? rev[0] : null, revisitedKind: rev ? st.kind[rev[0]] : null,
                selected: sel ? sel.t : null, selectedTech: !!(sel && TECH.test(sel.t)),
                expRead, serviceMs: kd('service'), clicks: Object.assign({}, st.clicks)
            };
        }

        /* the one line the AI sees, only when the visitor opens the chat */
        function line() {
            const v = profile(), bits = [];
            const who = { recruiter: 'likely recruiting or hiring', technical: 'likely technical (a developer or tech lead)', client: 'likely a potential client weighing a project', personal: 'curious about me as a person', explorer: 'just exploring' }[v.persona];
            bits.push(who);
            bits.push({ scanner: 'skims fast', reader: 'reads carefully', browser: 'browses at a normal pace' }[v.style]);
            if (v.top.length) bits.push('spent most time on: ' + v.top.join(', '));
            if (v.revisited) bits.push('came back to: ' + v.revisited);
            if (v.selected) bits.push('highlighted "' + v.selected + '"');
            if (v.from) bits.push('came from ' + v.from);
            bits.push(window.matchMedia('(max-width: 767px)').matches ? 'on a phone' : 'on a computer');
            return bits.join('; ').replace(/[\u0000-\u001f]/g, ' ').slice(0, 380);
        }

        return { start, profile, line };
    })();
    window.MehediVisitor = { profile: () => VisitorSense.profile(), line: () => VisitorSense.line() };

    /**
     * Proactive greeting, modelled on nahian.bd's "DM toast":
     *  - counts *active* attention (tab visible and the visitor interacted in the last 20s), kept per session across pages
     *  - shows after 2 min of attention, or 1 min plus (2+ pages or half-way down a page), once the visitor pauses for 2.5s
     *  - a visitor who sits still (no scrolling for 20s) gets it at 45s on the page, and it steps aside after 20s
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
        const IDLE = 20000, DAY = 864e5;
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
            try {
                const ref = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : '';
                const NAMES = { 'linkedin.com': 'LinkedIn', 'lnkd.in': 'LinkedIn', 'github.com': 'GitHub', 'facebook.com': 'Facebook', 'm.facebook.com': 'Facebook', 'l.facebook.com': 'Facebook',
                    'x.com': 'X', 't.co': 'X', 'twitter.com': 'X', 'google.com': 'Google', 'bing.com': 'Bing', 'youtube.com': 'YouTube', 'reddit.com': 'Reddit', 'dev.to': 'DEV', 'medium.com': 'Medium' };
                if (ref && ref !== location.hostname.replace(/^www\./, '')) {
                    const key = Object.keys(NAMES).find((k) => ref === k || ref.endsWith('.' + k));
                    ss.set('greet:from', key ? NAMES[key] : ref);
                }
            } catch (e) {}
        }
        try {
            const seenPaths = JSON.parse(ss.get('greet:paths') || '[]');
            if (!seenPaths.includes(location.pathname)) seenPaths.push(location.pathname);
            ss.set('greet:paths', JSON.stringify(seenPaths.slice(-50)));
            ss.set('greet:pages', String(seenPaths.length));
        } catch (e) {}
        let attention = num(ss.get('greet:active'));

        /* ---- how often: phones once per visit, desktop twice (10 min apart); a dismissal ends it for the visit,
           two visits in a row dismissed means three quiet days; talking to it also ends it for the visit ---- */
        const coarse = window.matchMedia('(pointer: coarse)');
        const phoneLike = () => phone.matches || coarse.matches;
        let fromStill = false;                                   /* shown to a visitor sitting still: steps aside sooner */
        const CLOSE_AFTER = () => (phoneLike() ? 18000 : fromStill ? 20000 : 30000);
        const pageStart = Date.now(), visitId = ss.get('greet:start');
        const readDismissals = () => { try { return JSON.parse(ls.get('greet:dismissals') || '[]'); } catch (e) { return []; } };
        function snoozed() {
            const d = readDismissals();
            if (d.length < 2) return false;
            const [a, b] = d.slice(-2);
            return a.v !== b.v && Date.now() - b.t < 3 * DAY;
        }
        function canShow() {
            if (ss.get('greet:done') === '1' || snoozed()) return false;
            if (Date.now() - pageStart < 45000) return false;
            const shown = num(ss.get('greet:shown'));
            if (shown >= (phoneLike() ? 1 : 2)) return false;
            if (shown && Date.now() - num(ss.get('greet:shownAt')) < 10 * 60000) return false;
            return true;
        }
        function dismissed() {
            ss.set('greet:done', '1');
            const d = readDismissals().filter((x) => x.v !== visitId);
            d.push({ t: Date.now(), v: visitId });
            ls.set('greet:dismissals', JSON.stringify(d.slice(-4)));
        }
        function engaged() { ss.set('greet:done', '1'); ls.set('greet:dismissals', '[]'); }

        /* the project card in view the longest (projects page), remembered for this visit */
        const focusTime = new Map(), inView = new Set();
        const cards = [...document.querySelectorAll('.proj-body h3')].map((h) => ({ title: h.textContent.trim(), node: h.closest('[class*="proj-card"], article, li') || h.parentElement.parentElement }));
        if (cards.length && 'IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries) => entries.forEach((e) => {
                const c = cards.find((x) => x.node === e.target);
                if (c) { if (e.isIntersecting) inView.add(c.title); else inView.delete(c.title); }
            }), { threshold: 0.6 });
            cards.forEach((c) => io.observe(c.node));
            // the card under the pointer counts first; otherwise the only card on screen (phones show one at a time)
            let hovered = null;
            document.addEventListener('pointerover', (e) => { const c = cards.find((x) => x.node.contains(e.target)); hovered = c ? c.title : null; }, { passive: true });
            setInterval(() => {
                if (document.visibilityState !== 'visible' || Date.now() - lastActive > 20000) return;
                const t = hovered && inView.has(hovered) ? hovered : (inView.size === 1 ? [...inView][0] : null);
                if (!t) return;
                const secs = (focusTime.get(t) || 0) + 1;
                focusTime.set(t, secs);
                const best = JSON.parse(ss.get('greet:focus') || 'null');
                if (secs >= 6 && (!best || secs > best.s || best.t === t)) ss.set('greet:focus', JSON.stringify({ t, s: secs }));
            }, 1000);
        }
        const focusItem = () => { try { const f = JSON.parse(ss.get('greet:focus') || 'null'); return f && f.t; } catch (e) { return null; } };
        let depth = 0, lastActive = Date.now(), lastMove = Date.now();

        /* ---- what to say ---- */
        const pick = (a) => a[Math.floor(Math.random() * a.length)];
        const sound = (t) => { if (typeof window.siteSound === 'function') window.siteSound(t); };
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
            if (apart === 0) return pick(['Assalamu alaikum!', 'Hi there!']);
            if (h < 5) return `It's ${clockIn()} where you are. Thanks for spending part of your night here.`;
            if (apart >= 3) return pick([`Hello from ${CITY}, where it's ${clockIn(TZ)} right now.`, `Hi! It's ${clockIn(TZ)} here in ${CITY}.`]);
            if (h < 12) return pick(['Good morning!', "Morning! Hope your day's off to a good start."]);
            if (h >= 18) return pick(['Good evening!', "Hi! Hope your evening's going well."]);
            return pick(['Hi there!', 'Hello!']);
        }
        function observation() {
            const focus = focusItem(), from = ss.get('greet:from'), pages = num(ss.get('greet:pages')), minutes = Math.round(attention / 60000);
            if (focus) return `You spent a while on ${focus}.`;
            if (from) return pick([`Thanks for coming over from ${from}!`, `So glad you found me through ${from}.`]);
            if (depth > 0.9) return 'You read all the way through. That really means a lot.';
            if (pages >= 3) return `You've looked through ${pages} pages already. Thanks for taking a proper look.`;
            if (minutes >= 2) return `You've spent ${minutes} minutes here. Thank you for that.`;
            return null;
        }
        const CHAT = { cta: 'Ask my AI', action: 'chat' };
        const TALK = { cta: "Let's talk", href: rootHref + 'contact/' };
        const OPEN = ['Let me open the chat and tell you properly.', 'Opening the chat for that, one sec.', 'Good question. Let me answer it properly in the chat.'];
        const FLOWS = {
            home: () => ({ ask: ['What brings you here today?', 'So, what brings you here?'], replies: [
                { label: 'Hiring', hearts: true, ai: 'Give me the 30-second pitch: why should I hire you?' },
                { label: 'I have a project', project: true },
                { label: 'Just curious', answers: [['Curiosity is always welcome here.', 'Here is the 30-second version of me.']], ai: 'Introduce yourself in 30 seconds' } ] }),
            profile: () => ({ ask: ['Hiring, or exploring a collaboration?', 'Looking for someone to build with?'], replies: [
                { label: 'Hiring', hearts: true, ai: 'Give me the 30-second pitch: why should I hire you?' },
                { label: 'A project', project: true },
                { label: 'Just looking', answers: [['No worries. Make yourself at home.']], then: 'bye' } ] }),
            projects: () => {
                const f = focusItem();
                if (f) return { ask: [`Want the story behind ${f}?`, `Curious how I built ${f}?`], replies: [
                    { label: 'Yes, tell me', hearts: true, ai: `Tell me the story behind ${f}. What was the hardest part?` },
                    { label: 'I have a similar idea', project: true },
                    { label: 'Just looking', answers: [['Of course, take your time!']], then: 'bye' } ] };
                return { ask: ['What kind of work are you looking for?', 'Building something of your own?'], replies: [
                    { label: 'AI & agents', ai: 'What AI and agent systems have you built?' },
                    { label: 'ERP & business apps', ai: 'Tell me about your ERP and business systems work' },
                    { label: 'I have a project', hearts: true, project: true } ] };
            },
            stack: () => ({ ask: ['Curious why I pick the tools I do?'], replies: [
                { label: 'Why NestJS + Kafka?', ai: 'Why do you use NestJS with Kafka?' },
                { label: 'Your AI stack', ai: 'Walk me through your AI stack' },
                { label: 'Just browsing', answers: [['Enjoy! Everything here is something I use in production.']], then: 'bye' } ] }),
            architecture: () => ({ ask: ['Want me to walk you through one of these systems?'], replies: [
                { label: 'The NGO ERP', ai: 'Walk me through the NGO ERP architecture' },
                { label: 'How you design', ai: 'How do you approach system design?' },
                { label: 'Just browsing', answers: [['Sure. Take your time with the diagrams.']], then: 'bye' } ] }),
            library: () => ({ ask: ['Looking for something to learn next?', 'Want a recommendation from my library?'], replies: [
                { label: 'Recommend me one', hearts: true, ai: 'Recommend one thing from your library I should learn next' },
                { label: 'Your daily AI tools', ai: 'Which AI tools do you use every day?' },
                { label: 'Just browsing', answers: [['Enjoy! Everything here is something I actually use.']], then: 'bye' } ] }),
            people: () => ({ ask: ['Know any of them already?'], replies: [
                { label: 'A few of them', hearts: true, answers: [['Then you are in good company!']], ai: 'Who on this list influenced you the most, and why?' },
                { label: 'Not yet', answers: [['Then you are in for a treat.', 'Start with the first one, you will not regret it.']], then: 'bye' } ] })
        };
        /* ---- reading the visitor: what they highlighted, came back to, or lingered on, and who they seem to be ---- */
        const cvHref = () => { const c = document.getElementById('hero-link-cv'); return c ? c.getAttribute('href') : rootHref + 'uploads/Mehedi_Hasan_CV.pdf?v=2'; };
        const quote = (t) => `“${t}”`;
        const BYE = (t) => ({ label: t || 'Just browsing', answers: [['Sure, take your time.'], ['No rush. I am right here if you need me.']], then: 'bye' });
        function insight() {
            let v = null;
            try { v = window.MehediVisitor && window.MehediVisitor.profile(); } catch (e) { v = null; }
            if (!v) return null;
            const sel = v.selected;
            if (sel && /@|\+?\d[\d\s-]{7,}/.test(sel)) return { strong: true, say: 'Saving my contact? Smart move.', ask: ['WhatsApp is the fastest way to reach me. Want to say hi now?'], replies: [
                { label: 'Open WhatsApp', href: 'https://wa.me/8801799447594?text=' + encodeURIComponent('Hi Mehedi, I found you through your portfolio.'), hearts: true },
                { label: 'Ask something first', ai: 'What kind of work are you open to right now?' }, BYE('Later') ] };
            if (sel && v.selectedTech) return { strong: true, say: `You highlighted ${quote(sel)}.`, ask: [`Want to know how I use ${sel} in real work?`, `Curious where ${sel} fits in my systems?`], replies: [
                { label: 'Yes, show me', hearts: true, ai: `How do you use ${sel} in your real projects?` },
                { label: 'Why you chose it', ai: `Why did you choose ${sel} over the alternatives?` }, BYE('Just noting it') ] };
            if (sel && sel.length >= 4) return { strong: true, say: `Something caught your eye: ${quote(sel)}.`, ask: ['Want me to tell you more about it?'], replies: [
                { label: 'Yes, tell me', hearts: true, ai: `Tell me more about "${sel}"` }, BYE('No, all good') ] };
            if (v.revisited) {
                const t = v.revisited, k = v.revisitedKind;
                if (k === 'project') return { strong: true, say: `You keep coming back to ${t}.`, ask: ['Want the story behind it?', 'Shall I tell you how I built it?'], replies: [
                    { label: 'Yes, tell me', hearts: true, ai: `Tell me the story behind ${t}. What was the hardest part?` },
                    { label: 'I need something similar', project: true }, BYE('Just looking') ] };
                if (k === 'experience') return { strong: true, say: `You came back to my time as ${t}.`, ask: ['Want to know what I actually did there?'], replies: [
                    { label: 'Yes, tell me', hearts: true, ai: `What did you actually do as ${t}, and what did you ship?` },
                    { label: 'Get the CV', href: cvHref() }, BYE('Just reading') ] };
                if (k === 'person') return { strong: true, say: `You keep coming back to ${t}.`, ask: ['Want to know why they are on my list?'], replies: [
                    { label: 'Yes, why?', hearts: true, ai: `Why is ${t} on your list, and what did you learn from them?` }, BYE('Just curious') ] };
                if (k === 'library') return { strong: true, say: `${t} caught your eye twice.`, ask: ['Want to know why I keep it in my library?'], replies: [
                    { label: 'Yes, why?', hearts: true, ai: `Why do you recommend ${t}?` },
                    { label: 'Recommend another', ai: 'Recommend one more thing from your library I should try' }, BYE() ] };
                if (k === 'service') return { strong: true, say: `You came back to ${t}.`, ask: ['Have something like this in mind?'], replies: [
                    { label: 'Yes, I do', hearts: true, project: true },
                    { label: 'How you work', ai: `How do you approach ${t} work, from brief to delivery?` }, BYE('Just looking') ] };
                return { strong: true, say: `You came back to ${t}.`, ask: ['Want me to go deeper on it?'], replies: [
                    { label: 'Yes, go deeper', hearts: true, ai: `Go deeper on ${t}` }, BYE() ] };
            }
            if (v.persona === 'client') return { say: 'Looks like you might have something to build.', ask: ['Want a quick, honest check on whether I am the right fit?'], replies: [
                { label: 'Yes, check the fit', hearts: true, project: true },
                { label: 'How you work', ai: 'How do you work with clients, from brief to delivery?' }, BYE('Not yet') ] };
            if (v.persona === 'recruiter' && v.style === 'scanner') return { say: 'You move fast, so here is the short version.', ask: ['My pitch in three lines, or straight to the CV?'], replies: [
                { label: '3-line pitch', hearts: true, ai: 'Give me your pitch in 3 short lines: who you are, what you ship, why hire you.' },
                { label: 'Get the CV', href: cvHref() }, BYE('Not now') ] };
            if (v.persona === 'recruiter' || v.expRead >= 3) return { say: v.expRead >= 3 ? 'You read through my experience carefully. Thank you.' : 'Looks like you are checking my background.', ask: ['Hiring for a role?', 'Is this for a role you are hiring for?'], replies: [
                { label: 'Yes, hiring', hearts: true, ai: 'Give me the 30-second pitch: why should I hire you?' },
                { label: 'Get the CV', href: cvHref() }, BYE('Just reading') ] };
            if (v.persona === 'technical') return { say: v.clicks.github ? 'Saw you checking my GitHub. A fellow builder, then.' : 'Looks like you speak tech.', ask: ['Want the architecture behind one of my systems?', 'Shall I show you how one of my systems works inside?'], replies: [
                { label: 'Show me', hearts: true, ai: 'Walk me through the architecture of your most complex system' },
                { label: 'Why NestJS + Kafka?', ai: 'Why do you use NestJS with Kafka?' }, BYE() ] };
            if (v.persona === 'personal') return { say: 'You seem curious about me, not just my work.', ask: ['Want to get to know me a little?', 'Fancy a chat that is not about work?'], replies: [
                { label: 'Tell me about you', hearts: true, ai: 'Tell me a bit about yourself outside of work' },
                { label: 'Tell me a joke', ai: 'Tell me a joke' }, BYE() ] };
            if (v.top.length && v.topMs >= 20000) {
                const t = v.top[0], k = v.topKind;
                const ai = k === 'project' ? `Tell me the story behind ${t}. What was the hardest part?` : k === 'experience' ? `What did you actually do as ${t}?`
                    : k === 'person' ? `Why is ${t} on your list?` : k === 'library' ? `Why do you recommend ${t}?` : `Tell me more about ${t}`;
                return { say: `You spent a while on ${t}.`, ask: ['Want the story behind it?', 'Shall I tell you more about it?'], replies: [
                    { label: 'Yes, tell me', hearts: true, ai }, k === 'project' ? { label: 'I need something similar', project: true } : { label: 'Tell me a joke', ai: 'Tell me a joke' }, BYE() ] };
            }
            return null;
        }
        const late = new Date().getHours() < 5;
        const pickFlow = () => (late ? { ask: ['Working late tonight?'], replies: [
            { label: 'Yes, deadline mode', answers: [['I know that feeling.', 'Hope it goes well. Take a short break too!']], then: 'bye' },
            { label: 'Just exploring', answers: [['Night owls find the best stuff. Enjoy!']], then: 'bye' } ] } : (FLOWS[page] || FLOWS.home)());
        let flow = null;

        /* ---- mascot moods: every orb on the page reacts together ---- */
        const orbs = () => document.querySelectorAll('ai-orb-mascot');
        const mood = (expr, ms) => orbs().forEach((m) => { if (typeof m.triggerReaction === 'function') { if (ms) m.triggerReaction(expr, ms); else m.setExpression(expr); } });
        const moodAfter = (delay, expr, ms) => setTimeout(() => mood(expr, ms), delay);

        /* ---- the bubble ---- */
        let el = null, run = 0, state = 'idle', closeTimer = null, titleTimer = null, savedTitle = '';
        let openY = 0, touchedBubble = false;
        const wait = (ms) => new Promise((r) => setTimeout(r, still.matches ? 0 : ms));
        const rand = (a, b) => a + Math.random() * (b - a);
        const typeTime = (t) => Math.min(2600, Math.max(700, 380 + t.length * 30)) * rand(0.85, 1.15);

        function flashTitle(on) {
            clearInterval(titleTimer);
            if (!on) { if (savedTitle) document.title = savedTitle; return; }
            if (phoneLike()) return;
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
            if (el && document.visibilityState === 'visible' && !el.matches(':hover, :focus-within')) closeTimer = setTimeout(() => close(true), CLOSE_AFTER());
        }
        function close(leaveDot) {
            run++; state = 'idle'; fromStill = false; clearTimeout(closeTimer); flashTitle(false); savedTitle = '';
            if (!el) return;
            const node = el; el = null;
            node.classList.add('bubble-closing');
            setTimeout(() => node.remove(), 300);
            markUnread(!!leaveDot);
        }
        function openChat() {
            const lines = el ? [...el.querySelectorAll('.dm-msg')].map((m) => ({ mine: m.classList.contains('dm-mine'), text: m.textContent })) : [];
            if (lines.length && window.MehediChat && typeof window.MehediChat.importGreeting === 'function') window.MehediChat.importGreeting(lines);
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
            dots.hidden = true; line(text, false); sound('message'); mood('idle'); return true;
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
            engaged();
            clearTimeout(closeTimer); flashTitle(false);
            if (choice.hearts) { burst(btn); mood('excited', 1800); }
            sound(choice.hearts ? 'love' : 'pop');
            el.querySelector('.dm-chips').hidden = true;
            line(choice.label, true);
            await wait(rand(600, 1100));
            const group = choice.answers ? pick(choice.answers) : [pick(OPEN)];
            for (const [i, t] of group.entries()) { if (i) await wait(rand(300, 650)); if (!(await say(t, id))) return; }
            if (!choice.hearts) mood('happy', 1400);
            if ((choice.ai || choice.project) && window.MehediChat) {
                await wait(650);
                if (id !== run) return;
                openChat();
                setTimeout(() => { if (choice.project) window.MehediChat.discuss(); else window.MehediChat.ask(choice.ai); }, 350);
                return;
            }
            if (choice.then === 'bye') { setTimeout(() => { if (id === run) close(false); }, 5000); return; }
            ctaRow(choice.then); armClose();
        }
        async function show(silent) {
            if (state !== 'idle' || el || isChatOpen() || document.body.classList.contains('drawer-open')) { fromStill = false; return; }
            state = 'open';
            attention = 0; ss.set('greet:active', '0');            /* the next greeting needs fresh attention */
            ss.set('greet:shown', String(num(ss.get('greet:shown')) + 1)); ss.set('greet:shownAt', String(Date.now()));
            openY = window.scrollY; touchedBubble = false;
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
                if (e.target.closest('.ai-orb-bubble-close') || (b && b.dataset.act === 'later')) { dismissed(); close(false); mood('pout', 1500); return; }
                if (b && b.dataset.act === 'chat') { engaged(); openChat(); return; }
                if (e.target.closest('a')) close(false);
            });
            el.addEventListener('mouseenter', () => { clearTimeout(closeTimer); flashTitle(false); });
            el.addEventListener('mouseleave', armClose);
            el.addEventListener('focusin', () => flashTitle(false));
            let sx = 0, sy = 0;
            el.addEventListener('pointerdown', () => { touchedBubble = true; }, { passive: true });
            el.addEventListener('touchstart', (e) => { touchedBubble = true; sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
            /* a clear swipe to the right puts it away; vertical moves are left to the page */
            el.addEventListener('touchend', (e) => { const t = e.changedTouches[0]; if (t.clientX - sx > 60 && Math.abs(t.clientY - sy) < 40) { dismissed(); close(true); } }, { passive: true });
            document.body.appendChild(el);
            { const w = widget(); if (w) w.classList.remove('ai-dodge', 'ai-tucked'); }
            requestAnimationFrame(() => el && el.classList.add('is-in'));
            mood('surprised');
            flashTitle(true);
            if (!silent) await wait(650);              /* a beat of surprise before it starts typing */
            if (id !== run) return;

            const known = late ? null : insight();
            flow = known || pickFlow();
            const seen = known ? known.say : observation();
            const lines = [(!seen || Math.random() < 0.5) ? greeting() : null, seen, pick(flow.ask)].filter(Boolean);
            for (const [i, t] of lines.entries()) {
                if (i && !silent) await wait(rand(350, 750));
                if (id !== run) return;
                if (silent) line(t, false); else if (!(await say(t, id))) return;
            }
            const list = el.querySelector('.dm-chip-list');
            flow.replies.forEach((r) => {
                if (r.href) {
                    const a = document.createElement('a'); a.className = 'dm-chip'; a.href = r.href; a.textContent = r.label; a.target = '_blank'; a.rel = 'noopener';
                    a.addEventListener('click', (e) => { e.stopPropagation(); engaged(); if (r.hearts) burst(a); sound('pop'); setTimeout(() => close(false), 400); });
                    list.appendChild(a); return;
                }
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
        let touching = false, prevY = window.scrollY, stableTicks = 0;
        addEventListener('touchstart', () => { touching = true; }, { passive: true });
        ['touchend', 'touchcancel'].forEach((t) => addEventListener(t, () => { touching = false; }, { passive: true }));
        const keyboardOpen = () => !!(window.visualViewport && window.visualViewport.height < window.innerHeight * 0.75);
        const paused = () => !touching && stableTicks >= 2 && !keyboardOpen() && Date.now() - lastMove >= (phoneLike() ? 4000 : 2500);
        const strongInsight = () => { const i = insight(); return !!(i && i.strong); };
        /* sitting still is the calmest moment: no scrolling for 20s (canShow keeps it to 45s+ on the page) */
        const stillReady = () => Date.now() - lastMove >= 20000 && paused() && canShow();
        const ready = () => (attention >= 120000 || (attention >= 60000 && (num(ss.get('greet:pages')) >= 2 || depth >= 0.5)) || (attention >= 40000 && strongInsight())) && paused() && canShow();
        const touch = () => { lastMove = lastActive = Date.now(); };
        ['scroll', 'wheel', 'keydown', 'touchmove'].forEach((t) => addEventListener(t, touch, { passive: true }));
        ['pointermove', 'pointerdown'].forEach((t) => addEventListener(t, () => { lastActive = Date.now(); }, { passive: true }));
        addEventListener('scroll', () => { depth = Math.max(depth, (scrollY + innerHeight) / document.documentElement.scrollHeight); }, { passive: true });
        setInterval(() => {
            const y = window.scrollY; stableTicks = y === prevY ? stableTicks + 1 : 0; prevY = y;
            if (state !== 'idle' || document.visibilityState !== 'visible') return;
            if (Date.now() - lastActive <= IDLE) { attention += 1000; ss.set('greet:active', String(attention)); }
            if (blocked()) return;
            if (ready()) show(false);
            else if (stillReady()) { fromStill = true; show(false); }
        }, 1000);
        let hiddenTimer = null;
        document.addEventListener('visibilitychange', () => {
            clearTimeout(hiddenTimer);
            if (document.visibilityState === 'hidden') {
                clearTimeout(closeTimer);
                if (state === 'idle' && !phoneLike() && attention >= 45000 && canShow() && !blocked(true)) hiddenTimer = setTimeout(() => { if (document.visibilityState === 'hidden') show(true); }, rand(5000, 12000));
            } else { touch(); if (el) { flashTitle(true); armClose(); } }
        });
        document.addEventListener('mouseout', (e) => {
            if (e.relatedTarget || e.clientY > 0 || state !== 'idle' || attention < 30000) return;
            if (window.matchMedia('(pointer: fine)').matches && canShow() && !blocked()) show(false);
        });

        /* ---- scrolling: the orb tucks away only after a real move (40px), and an untouched greeting steps aside ---- */
        let lastY = window.scrollY, travel = 0, ticking = false;
        addEventListener('scroll', () => {
            if (ticking) return; ticking = true;
            requestAnimationFrame(() => {
                const w = widget(), y = window.scrollY, dy = y - lastY;
                travel = (dy > 0) === (travel > 0) ? travel + dy : dy;
                if (el && !touchedBubble && Math.abs(y - openY) > 40) { dismissed(); close(true); }
                if (w && phone.matches && !isChatOpen() && !el) {
                    if (travel > 40 && y > 120) w.classList.add('ai-tucked');
                    else if (travel < -40 || y <= 120) w.classList.remove('ai-tucked');
                }
                lastY = y; ticking = false;
            });
        }, { passive: true });

        /* ---- keyboard: Esc closes; "/" opens the chat (when not typing somewhere) ---- */
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && el) { dismissed(); close(false); mood('pout', 1500); return; }
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
        if (w) w.addEventListener('click', () => { if (el) { engaged(); close(false); } markUnread(false); });

        /* test hook: AIOrbGreeting.show() */
        window.AIOrbGreeting = { show: () => show(false), insight };
    }

    /* a page prerendered in the background starts counting only once the visitor actually opens it */
    const startGreeting = () => {
        const go = () => { VisitorSense.start(); initProactiveGreeting(); };
        if (document.prerendering) document.addEventListener('prerenderingchange', go, { once: true });
        else go();
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startGreeting);
    } else {
        startGreeting();
    }

    window.AIOrbMascot = AIOrbMascot;
})();
