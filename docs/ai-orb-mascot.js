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
        }

        disconnectedCallback() {
            this._clearIntroSequence();
            if (this._blinkTimeout) clearTimeout(this._blinkTimeout);
            if (this._reactionTimeout) clearTimeout(this._reactionTimeout);
            window.removeEventListener('mousemove', this._boundOnMouseMove);
            document.removeEventListener('mouseleave', this._boundOnMouseLeave);
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
                    // Schedule next recurring sequence 6 seconds after emotion ends
                    this._clearIntroSequence();
                    const t = setTimeout(() => {
                        if (this._expression === 'idle') {
                            this.playIntroSequence();
                        }
                    }, 6000);
                    this._introSequenceTimers.push(t);
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
                                        // Resume gentle idle blinking during the pause
                                        this._scheduleNextBlink();

                                        // 6. Repeat sequence every 6 seconds while in idle state
                                        addTimer(() => {
                                            if (this._expression === 'idle') {
                                                this.playIntroSequence();
                                            }
                                        }, 6000);
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

        _scheduleNextBlink() {
            if (this._blinkTimeout) clearTimeout(this._blinkTimeout);
            // Natural random interval between 3.5s and 6.5s
            const interval = 3500 + Math.random() * 3000;
            this._blinkTimeout = setTimeout(() => {
                if (this._expression === 'idle') {
                    this.classList.add('orb-is-blinking');
                    setTimeout(() => {
                        this.classList.remove('orb-is-blinking');
                        // Occasional natural double blink
                        if (Math.random() < 0.25) {
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
                this.resetLook();
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
                this.lookAt(shiftX, shiftY);
            } else {
                this.resetLook();
            }
        }

        _onMouseLeave() {
            this.resetLook();
        }
    }

    if (!customElements.get('ai-orb-mascot')) {
        customElements.define('ai-orb-mascot', AIOrbMascot);
    }

    /**
     * Proactive Idle Greeting Controller
     * Triggers a smart speech bubble above the mascot if user remains idle at the top for 6 seconds.
     */
    function initProactiveGreeting() {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;
        
        let idleTimer = null;
        let isDismissed = false;
        let bubbleEl = null;

        // Dismissal is remembered only for the current page view (no session-wide suppression),
        // so the greeting reliably appears on each fresh load.
        try { sessionStorage.removeItem('ai_orb_greeted'); } catch (e) {}

        function cancelTimer() {
            if (idleTimer) {
                clearTimeout(idleTimer);
                idleTimer = null;
            }
        }

        // persist=true → explicit user action (close / button / chat): don't show again this session.
        // persist=false → soft hide (e.g. scroll): bubble can re-appear when user is idle at top again.
        function dismissBubble(persist = true) {
            if (persist) {
                isDismissed = true;
                cancelTimer();
            }
            if (!bubbleEl) return;

            const el = bubbleEl;
            bubbleEl = null;
            el.classList.add('bubble-closing');
            setTimeout(() => {
                if (el.parentNode) el.parentNode.removeChild(el);
            }, 300);
        }

        function armTimer() {
            if (isDismissed || bubbleEl || idleTimer) return;
            idleTimer = setTimeout(() => {
                idleTimer = null;
                showBubble();
            }, 6000);
        }

        function openChat() {
            dismissBubble();
            const chatHeader = document.getElementById('chat-header');
            const chatWidget = document.getElementById('ai-chat-widget');
            if (chatWidget && chatWidget.classList.contains('chat-collapsed')) {
                if (chatHeader) {
                    chatHeader.click();
                } else {
                    chatWidget.classList.remove('chat-collapsed');
                    chatWidget.classList.add('chat-expanded');
                }
            }
        }

        function scrollToProjects() {
            dismissBubble();
            const projectsSec = document.getElementById('projects') || document.querySelector('.projects-section');
            if (projectsSec) {
                projectsSec.scrollIntoView({ behavior: 'smooth' });
            }
        }

        function showBubble() {
            if (isDismissed || bubbleEl) return;

            // Only show if user is still near the top and chat isn't already open
            const chatWidget = document.getElementById('ai-chat-widget');
            if (window.scrollY > 40 || (chatWidget && chatWidget.classList.contains('chat-expanded'))) {
                return;
            }

            const mascot = document.getElementById('chat-mascot') || document.querySelector('ai-orb-mascot');
            if (mascot && typeof mascot.triggerReaction === 'function') {
                mascot.triggerReaction('happy', 1400);
            }

            bubbleEl = document.createElement('div');
            bubbleEl.id = 'ai-orb-speech-bubble';
            bubbleEl.className = 'ai-orb-speech-bubble';
            bubbleEl.setAttribute('role', 'dialog');
            bubbleEl.setAttribute('aria-label', 'AI Assistant Greeting');

            bubbleEl.innerHTML = `
                <div class="ai-orb-bubble-header">
                    <div class="ai-orb-bubble-badge-wrap">
                        <span class="ai-orb-bubble-badge">AI Assistant</span>
                        <span class="ai-orb-bubble-wave" aria-hidden="true"><svg class="orb-ico orb-ico-sparkle" viewBox="0 0 20 20" width="18" height="18"><path class="sp-big" d="M9 2 C9.6 6.2 10.8 7.4 15 8 C10.8 8.6 9.6 9.8 9 14 C8.4 9.8 7.2 8.6 3 8 C7.2 7.4 8.4 6.2 9 2 Z"/><path class="sp-small" d="M15.5 12 C15.8 13.6 16.4 14.2 18 14.5 C16.4 14.8 15.8 15.4 15.5 17 C15.2 15.4 14.6 14.8 13 14.5 C14.6 14.2 15.2 13.6 15.5 12 Z"/></svg></span>
                    </div>
                    <button class="ai-orb-bubble-close" aria-label="Close greeting" title="Dismiss">&times;</button>
                </div>
                <p class="ai-orb-bubble-text orb-motion" aria-label="Hi! Curious what Mehedi builds?"><span class="w" style="--i:0" aria-hidden="true">Hi!</span> <span class="w" style="--i:1" aria-hidden="true">Curious</span> <span class="w" style="--i:2" aria-hidden="true">what</span> <span class="w w-name" style="--i:3" aria-hidden="true">Mehedi</span> <span class="w" style="--i:4" aria-hidden="true">builds?</span></p>
                <div class="ai-orb-bubble-actions">
                    <button class="ai-orb-bubble-btn ai-orb-bubble-btn-projects" data-action="projects"><svg class="orb-ico orb-ico-layers" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path class="ly ly-3" d="M2 10.2 L8 13.4 L14 10.2"/><path class="ly ly-2" d="M2 7.6 L8 10.8 L14 7.6"/><path class="ly ly-1" d="M8 2.2 L14 5.2 L8 8.2 L2 5.2 Z"/></svg><span>Projects</span></button>
                    <button class="ai-orb-bubble-btn ai-orb-bubble-btn-primary" data-action="chat"><svg class="orb-ico orb-ico-chat" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path class="ch-bubble" d="M3 2.5 H13 A1.5 1.5 0 0 1 14.5 4 V10 A1.5 1.5 0 0 1 13 11.5 H7 L4 14 V11.5 H3 A1.5 1.5 0 0 1 1.5 10 V4 A1.5 1.5 0 0 1 3 2.5 Z"/><circle class="ch-dot" cx="5.2" cy="7" r="0.95"/><circle class="ch-dot" cx="8" cy="7" r="0.95"/><circle class="ch-dot" cx="10.8" cy="7" r="0.95"/></svg><span>Chat</span></button>
                </div>
                <div class="ai-orb-bubble-arrow"></div>
            `;

            // Close button click
            const closeBtn = bubbleEl.querySelector('.ai-orb-bubble-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dismissBubble();
                });
            }

            // Projects button click
            const projBtn = bubbleEl.querySelector('.ai-orb-bubble-btn-projects');
            if (projBtn) {
                projBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    scrollToProjects();
                });
            }

            // Chat button click
            const chatBtn = bubbleEl.querySelector('.ai-orb-bubble-btn-primary');
            if (chatBtn) {
                chatBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openChat();
                });
            }

            // Clicking body of bubble opens chat
            bubbleEl.addEventListener('click', (e) => {
                if (e.target.closest('.ai-orb-bubble-close') || e.target.closest('.ai-orb-bubble-btn')) return;
                openChat();
            });

            document.body.appendChild(bubbleEl);

        }

        // 6 second idle detection
        armTimer();

        // Scrolling away hides the bubble softly; returning to top re-arms the 6s timer
        const onScroll = () => {
            if (window.scrollY > 30) {
                cancelTimer();
                dismissBubble(false);
            } else {
                armTimer();
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });

        // If user opens chat manually before 6s, cancel timer
        const chatWidget = document.getElementById('ai-chat-widget');
        if (chatWidget) {
            chatWidget.addEventListener('click', () => {
                cancelTimer();
                dismissBubble();
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProactiveGreeting);
    } else {
        initProactiveGreeting();
    }

    window.AIOrbMascot = AIOrbMascot;
})();
