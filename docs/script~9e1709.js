document.addEventListener('DOMContentLoaded', async () => {
    // The first screen (and the hero photo, the page's largest paint) draws before all the set-up below runs; a hidden
    // or prerendering tab, where no frame comes, starts after 100 ms.
    await new Promise((go) => { let done = false; const once = () => { if (!done) { done = true; setTimeout(go, 0); } }; requestAnimationFrame(once); setTimeout(once, 100); });

    // Respect the OS "reduce motion" setting for the heavy decorative effects.
    const PREFERS_REDUCED_MOTION = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    // Ensure mobile browsers always open cleanly at top if no hash in URL
    if (!window.location.hash) {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);
    }

    /* ==========================================
       0. GAMIFIED SECURITY CLEARANCE
    ========================================== */
    let clearance = parseInt(localStorage.getItem('mehedi_clearance')) || 1;
    const clrDisplay = document.getElementById('clearance-level');

    function updateClearance(level) {
        if (level > clearance) {
            clearance = level;
            localStorage.setItem('mehedi_clearance', clearance);
            if (typeof playSound === 'function') playSound('success');
        }
        if (clrDisplay) {
            if (clearance === 1) clrDisplay.innerText = "LVL 1 (GUEST)";
            if (clearance === 2) clrDisplay.innerText = "LVL 2 (HACKER)";
            if (clearance === 3) clrDisplay.innerText = "LVL 3 (ENGINEER)";
            if (clearance >= 4) {
                clrDisplay.innerText = "LVL MAX (ROOT)";
                clrDisplay.style.color = "#ef4444";
                clrDisplay.style.textShadow = "0 0 8px #ef4444";
            }
        }
    }
    updateClearance(clearance);

    /* ==========================================
       1. SYNTHESIZED TACTILE UI AUDIO
    ========================================== */
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx;
    let isMuted = localStorage.getItem('mehedi_muted') === 'true';

    function updateSoundIcons() {
        const iconHtml = isMuted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
        document.querySelectorAll('#sound-toggler, .sound-btn').forEach(btn => {
            btn.innerHTML = iconHtml;
        });
    }
    updateSoundIcons();

    document.addEventListener('click', (e) => {
        const soundBtn = e.target.closest('#sound-toggler, .sound-btn');
        if (soundBtn) {
            e.preventDefault();
            isMuted = !isMuted;
            localStorage.setItem('mehedi_muted', isMuted);
            updateSoundIcons();
            if (!audioCtx && !isMuted) audioCtx = new AudioContext();
        }
    });

    window.siteSound = (type) => { try { playSound(type); } catch (e) {} };
    function playSound(type) {
        if (isMuted) return;
        // Browsers keep audio silent until the first tap or key, so don't wake the audio engine before then.
        if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
        if (!audioCtx) audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        if (type === 'hover') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05);
            gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.05);
        } else if (type === 'message') {
            // two soft rising notes, like a DM arriving
            osc.type = 'sine';
            osc.frequency.setValueAtTime(660, audioCtx.currentTime);
            osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08);
            gainNode.gain.setValueAtTime(0.035, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.22);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.22);
        } else if (type === 'pop') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(780, audioCtx.currentTime + 0.06);
            gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.08);
        } else if (type === 'love') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(700, audioCtx.currentTime);
            osc.frequency.setValueAtTime(940, audioCtx.currentTime + 0.07);
            osc.frequency.setValueAtTime(1180, audioCtx.currentTime + 0.14);
            gainNode.gain.setValueAtTime(0.035, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
        } else if (type === 'click' || type === 'type') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.05);
        } else if (type === 'cash') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(800, audioCtx.currentTime);
            osc.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.2);
        } else if (type === 'error') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
        } else if (type === 'success') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            osc.frequency.setValueAtTime(900, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
        }
    }

    function playCinematicShockwaveSound() {
        if (isMuted) return;
        if (!audioCtx) audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const t = audioCtx.currentTime;

        try {
            // 1. Cinematic sub-acoustic pulse (warm spatial impulse)
            const subOsc = audioCtx.createOscillator();
            const subGain = audioCtx.createGain();
            subOsc.type = 'sine';
            subOsc.frequency.setValueAtTime(68, t);
            subOsc.frequency.exponentialRampToValueAtTime(36, t + 0.28);
            subGain.gain.setValueAtTime(0.06, t);
            subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
            subOsc.connect(subGain);
            subGain.connect(audioCtx.destination);
            subOsc.start(t);
            subOsc.stop(t + 0.3);

            // 2. High-tech sci-fi fluid water wave sweep (resonant, organic)
            const waveOsc = audioCtx.createOscillator();
            const waveGain = audioCtx.createGain();
            waveOsc.type = 'sine';
            waveOsc.frequency.setValueAtTime(340, t);
            waveOsc.frequency.exponentialRampToValueAtTime(720, t + 0.07);
            waveOsc.frequency.exponentialRampToValueAtTime(260, t + 0.36);
            waveGain.gain.setValueAtTime(0.045, t);
            waveGain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
            waveOsc.connect(waveGain);
            waveGain.connect(audioCtx.destination);
            waveOsc.start(t);
            waveOsc.stop(t + 0.38);

            // 3. Sci-fi crystalline harmonic shimmer (holographic water chime)
            const chimeOsc = audioCtx.createOscillator();
            const chimeGain = audioCtx.createGain();
            chimeOsc.type = 'sine';
            chimeOsc.frequency.setValueAtTime(960, t + 0.04);
            chimeOsc.frequency.exponentialRampToValueAtTime(620, t + 0.35);
            chimeGain.gain.setValueAtTime(0.016, t + 0.04);
            chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
            chimeOsc.connect(chimeGain);
            chimeGain.connect(audioCtx.destination);
            chimeOsc.start(t + 0.04);
            chimeOsc.stop(t + 0.42);
        } catch (err) {
            console.warn('Audio synthesis notice:', err);
        }
    }

    document.querySelectorAll('.hover-sound, a, button').forEach(el => {
        el.addEventListener('mouseenter', () => playSound('hover'));
        el.addEventListener('click', () => playSound('click'));
    });

    /* ==========================================
       2. SCROLL REVEAL & TELEMETRY ANIMATION
    ========================================== */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.hidden').forEach((el) => {
        observer.observe(el);
    });

    const telObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.tel-bar-fill').forEach(bar => {
                    const targetWidth = bar.getAttribute('data-width') || '100%';
                    bar.style.width = targetWidth;
                });
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.telemetry-card').forEach(el => telObserver.observe(el));

    /* ==========================================
       3. CURSOR FOLLOWER
    ========================================== */
    // The system cursor stays. On mouse devices a soft ring trails it: one animation-frame loop that stops once the ring
    // has caught up. It grows around anything clickable, tightens while the button is down and steps aside over text
    // fields; the checks are delegated, so links and buttons added later count too.
    const cursorOutline = document.querySelector('.cursor-outline');
    if (cursorOutline && matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const CLICKABLE = 'a[href], button, [role="button"], select, label, summary, .hover-sound';
        const TEXT = 'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="button"]):not([type="submit"]), textarea, [contenteditable="true"]';
        let x = -100, y = -100, rx = x, ry = y, raf = 0;
        const follow = () => {
            rx += (x - rx) * 0.28;
            ry += (y - ry) * 0.28;
            cursorOutline.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
            raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.2 ? requestAnimationFrame(follow) : 0;
        };
        window.addEventListener('pointermove', (e) => {
            if (e.pointerType !== 'mouse') return;
            x = e.clientX;
            y = e.clientY;
            if (!cursorOutline.classList.contains('is-on')) { rx = x; ry = y; cursorOutline.classList.add('is-on'); }
            if (!raf) raf = requestAnimationFrame(follow);
        }, { passive: true });
        document.addEventListener('pointerover', (e) => {
            const t = e.target instanceof Element ? e.target : null;
            const text = !!(t && t.closest(TEXT));
            cursorOutline.classList.toggle('is-text', text);
            cursorOutline.classList.toggle('cursor-hover', !text && !!(t && t.closest(CLICKABLE)));
        }, { passive: true });
        window.addEventListener('pointerdown', () => cursorOutline.classList.add('is-down'), { passive: true });
        window.addEventListener('pointerup', () => cursorOutline.classList.remove('is-down'), { passive: true });
        document.documentElement.addEventListener('pointerleave', () => cursorOutline.classList.remove('is-on'));
        window.addEventListener('blur', () => cursorOutline.classList.remove('is-on'));
    }

    /* ==========================================
       4. DRAGGABLE WINDOWS OS LOGIC (UPGRADED)
    ========================================== */
    function makeDraggable(element, handle) {
        if (!element || !handle) return;
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        handle.classList.add('draggable-header');
        handle.style.cursor = 'grab';

        handle.addEventListener('mousedown', dragMouseDown);
        handle.addEventListener('touchstart', dragMouseDown, { passive: false });

        function dragMouseDown(e) {
            // Ignore if clicking on interactive controls (buttons, links, badges)
            if (e.target.closest('button') || e.target.closest('.mon-btn') || e.target.closest('a')) return;

            if (e.type === 'mousedown') {
                e.preventDefault();
            }
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);

            pos3 = clientX;
            pos4 = clientY;

            // Disable CSS transitions while dragging to prevent lag and stutters
            element.style.transition = 'none';
            handle.style.cursor = 'grabbing';

            // Snap initial position from getBoundingClientRect to avoid jumping from percentages
            const rect = element.getBoundingClientRect();
            element.style.left = rect.left + 'px';
            element.style.top = rect.top + 'px';
            element.style.position = 'fixed';
            element.style.bottom = 'auto';
            element.style.right = 'auto';
            element.style.margin = '0';
            element.style.transform = 'none';

            document.addEventListener('mouseup', closeDragElement);
            document.addEventListener('mousemove', elementDrag);
            document.addEventListener('touchend', closeDragElement);
            document.addEventListener('touchmove', elementDrag, { passive: false });
        }

        function elementDrag(e) {
            e.preventDefault();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);

            pos1 = pos3 - clientX;
            pos2 = pos4 - clientY;
            pos3 = clientX;
            pos4 = clientY;

            let curTop = parseFloat(element.style.top) || element.getBoundingClientRect().top;
            let curLeft = parseFloat(element.style.left) || element.getBoundingClientRect().left;

            const maxLeft = Math.max(window.innerWidth - element.offsetWidth, 0);
            const maxTop = Math.max(window.innerHeight - element.offsetHeight, 0);

            let newTop = Math.min(Math.max(curTop - pos2, 10), maxTop - 10);
            let newLeft = Math.min(Math.max(curLeft - pos1, 10), maxLeft - 10);

            element.style.top = newTop + "px";
            element.style.left = newLeft + "px";
        }

        function closeDragElement() {
            element.style.transition = '';
            handle.style.cursor = 'grab';
            document.removeEventListener('mouseup', closeDragElement);
            document.removeEventListener('mousemove', elementDrag);
            document.removeEventListener('touchend', closeDragElement);
            document.removeEventListener('touchmove', elementDrag);
        }
    }

    makeDraggable(document.querySelector('.cli-container'), document.querySelector('.cli-header'));
    makeDraggable(document.querySelector('.mines-container'), document.querySelector('.mines-header'));
    makeDraggable(document.getElementById('sys-monitor'), document.querySelector('#sys-monitor .mon-title'));
    
    function makeVerticalEdgeDraggable(element, handles) {
        if (!element || !handles) return;
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        let isDragging = false;
        let startY = 0;
        let lastDragTime = 0;

        // Restore saved position on mobile
        try {
            const savedTop = localStorage.getItem('poetfolio_lb_mobile_top');
            if (savedTop && window.innerWidth <= 860) {
                element.style.setProperty('--lb-mobile-top', savedTop + 'px');
                element.style.setProperty('--lb-mobile-transform', 'none');
            }
        } catch(err) {}

        handles.forEach(handle => {
            if (handle.classList.contains('lb-toggle')) {
                handle.style.cursor = 'pointer';
            } else {
                handle.style.cursor = 'move';
            }
            handle.addEventListener('mousedown', dragStart);
            handle.addEventListener('touchstart', dragStart, { passive: false });
            
            // Prevent click if we were actively dragging
            handle.addEventListener('click', (e) => {
                const now = Date.now();
                if (isDragging || (now - lastDragTime < 320)) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                }
            }, true);
        });

        function dragStart(e) {
            // If modal is expanded and handle is the toggle, don't drag
            if (element.classList.contains('lb-expanded') && e.target.closest('.lb-toggle')) return;

            const isTouch = e.type === 'touchstart';
            const clientY = isTouch ? (e.touches && e.touches[0].clientY) : e.clientY;
            startY = clientY;
            isDragging = false;
            let hasMoved = false;

            const rect = element.getBoundingClientRect();
            const startElemTop = rect.top;
            pos4 = clientY;
            // on touch, a quick swipe scrolls the page; the tab only moves after a short press-and-hold
            let armed = !isTouch, cancelled = false;
            const holdTimer = isTouch ? setTimeout(() => {
                if (cancelled) return;
                armed = true;
                element.classList.add('is-tab-dragging');
                if (navigator.vibrate) { try { navigator.vibrate(10); } catch (err) {} }
            }, 280) : 0;

            function onMove(ev) {
                const moveY = ev.touches ? ev.touches[0].clientY : ev.clientY;
                const diffY = Math.abs(moveY - startY);
                if (!armed) { if (diffY > 8) { cancelled = true; clearTimeout(holdTimer); } return; }
                if (diffY > 8) {
                    hasMoved = true;
                    isDragging = true;
                    if (ev.cancelable) ev.preventDefault();
                    element.classList.add('is-tab-dragging');

                    if (window.innerWidth <= 860) {
                        const winH = window.innerHeight;
                        const tabH = element.offsetHeight || 50;
                        const minTop = 60;
                        const maxTop = winH - tabH - 60;
                        const newTop = Math.max(minTop, Math.min(maxTop, startElemTop + (moveY - startY)));
                        element.style.setProperty('--lb-mobile-top', newTop + 'px');
                        element.style.setProperty('--lb-mobile-transform', 'none');
                    } else {
                        pos2 = pos4 - moveY;
                        pos4 = moveY;
                        let newTop = element.offsetTop - pos2;
                        const padding = 20;
                        const viewHeight = window.innerHeight;
                        if (newTop < padding) newTop = padding;
                        if (newTop > viewHeight - element.offsetHeight - padding) 
                            newTop = viewHeight - element.offsetHeight - padding;
                        element.style.top = newTop + "px";
                        element.style.setProperty('--lb-ty', 'translateY(0)');
                    }
                }
            }

            function onEnd() {
                clearTimeout(holdTimer);
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onEnd);
                document.removeEventListener('touchmove', onMove);
                document.removeEventListener('touchend', onEnd);
                document.removeEventListener('touchcancel', onEnd);
                element.classList.remove('is-tab-dragging');

                if (hasMoved) {
                    lastDragTime = Date.now();
                    setTimeout(() => { isDragging = false; }, 250);
                    if (window.innerWidth <= 860) {
                        try {
                            const curTop = element.style.getPropertyValue('--lb-mobile-top');
                            if (curTop) localStorage.setItem('poetfolio_lb_mobile_top', parseFloat(curTop));
                        } catch(err) {}
                    }
                } else {
                    isDragging = false;
                }
            }

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onEnd);
            document.addEventListener('touchmove', onMove, { passive: false });
            document.addEventListener('touchend', onEnd);
            document.addEventListener('touchcancel', onEnd);
        }
    }

    const lbWidget = document.getElementById('leaderboard-widget');
    const lbToggleBtn = document.querySelector('.lb-toggle');
    const lbHeaderHandle = document.querySelector('#leaderboard-widget .radar-title-group');
    
    if (lbWidget && lbToggleBtn && lbHeaderHandle) {
        makeVerticalEdgeDraggable(lbWidget, [lbToggleBtn, lbHeaderHandle]);
    }

    /* ==========================================
       5. MAGNETIC ELEMENTS & 3D TILT
    ========================================== */
    if (!PREFERS_REDUCED_MOTION) document.querySelectorAll('.magnetic-element').forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
            el.style.transform = `translate(${x}px, ${y}px)`;
            el.style.transition = 'none';
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = `translate(0px, 0px)`;
            el.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
        });
    });

    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const tiltX = ((e.clientY - rect.top - (rect.height / 2)) / (rect.height / 2)) * -8;
            const tiltY = ((e.clientX - rect.left - (rect.width / 2)) / (rect.width / 2)) * 8;
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });

    /* ==========================================
       5.1 APPLE CINEMATIC 3D DEPTH CONTROLLER (PARALLAX + GYROSCOPE + DYNAMIC LIGHTING)
    ========================================== */
    function initCinematicDepth() {
        const cards = document.querySelectorAll('.cinematic-depth-card');
        if (!cards.length) return;

        cards.forEach(card => {
            const wrapper = card.closest('.cinematic-depth-wrapper') || card;
            const heroSection = card.closest('header.hero') || document.querySelector('header.hero') || document.body;
            const bgLayer = card.querySelector('.layer-bg');
            const subject = card.querySelector('.layer-subject');
            const frontArmyLayer = card.querySelector('.layer-army-front') || card.querySelector('.layer-tools');
            const midArmyLayer = card.querySelector('.layer-army-mid');
            const rearArmyLayer = card.querySelector('.layer-army-rear') || card.querySelector('.layer-models');
            const glare = card.querySelector('.layer-glare');
            const rimLight = card.querySelector('.layer-rimlight');

            // Tag army units unambiguously as flank-left or flank-right
            card.querySelectorAll('.army-unit-wrap').forEach(el => {
                if (/\br[123]-l\d+\b/.test(el.className)) el.classList.add('flank-left');
                if (/\br[123]-r\d+\b/.test(el.className)) el.classList.add('flank-right');
            });

            // Physics state
            let currentCardRotX = 0;
            let currentCardRotY = 0;
            let currentSubjX = 0;
            let currentSubjY = 0;
            let currentIntensity = 0;

            let targetCardRotX = 0;
            let targetCardRotY = 0;
            let targetSubjX = 0;
            let targetSubjY = 0;
            let targetIntensity = 0;

            let currentNormX = 0;
            let currentNormY = 0;
            let targetNormX = 0;
            let targetNormY = 0;

            let isDirectHover = false;
            let isHeroActive = false;
            let isGyroActive = false;
            let isScrollDeployed = false;
            let isDeploymentUnlocked = false;
            let lastGyroGamma = null;
            let isShakingActive = false;
            let shakeEndTimer = null;
            let lastShakeTime = 0;
            let baseBeta = null;
            let baseGamma = null;
            let lastAccX = null, lastAccY = null, lastAccZ = null;
            let rafId = null;

            // Maximum values (Apple spatial depth standards: pure horizontal 3D depth, locked vertically)
            const MAX_ROTATION_X = 2.4;
            const MAX_ROTATION_Y = 2.4; // degrees (subtle, natural iPhone stereoscopic horizontal rotation)
            const MAX_SUBJECT_SHIFT = 6.0; // px (pure horizontal spatial depth drift)

            function render() {
                // Spring / Lerp smoothing
                const factor = isGyroActive ? 0.12 : 0.085;
                currentCardRotX += (targetCardRotX - currentCardRotX) * factor;
                currentCardRotY += (targetCardRotY - currentCardRotY) * factor;
                currentSubjX += (targetSubjX - currentSubjX) * factor;
                currentSubjY += (targetSubjY - currentSubjY) * factor;
                currentIntensity += (targetIntensity - currentIntensity) * factor;
                currentNormX += (targetNormX - currentNormX) * factor;
                currentNormY += (targetNormY - currentNormY) * factor;

                // 1. Subtle horizontal card angle (Pure left-right 3D without any vertical stretch)
                card.style.transform = `perspective(1200px) rotateY(${currentCardRotY.toFixed(2)}deg)`;

                // 2. Background counter-shift (iPhone 3D Depth Parallax: horizontal opposite drift)
                if (bgLayer) {
                    bgLayer.style.transform = `translate3d(${(-currentSubjX * 0.65).toFixed(2)}px, 0px, 0) scale(1.03)`;
                }

                // 3. Foreground Subject Shift (horizontal only, locked vertically so it never shifts down)
                if (subject) {
                    subject.style.transform = `translate3d(${currentSubjX.toFixed(2)}px, 0px, 0)`;
                }

                // 4. Multi-Depth Spatial Layers Shift (Rank 1 moves faster, Rank 3 moves deeper in perspective)
                if (frontArmyLayer) {
                    frontArmyLayer.style.transform = `translate3d(${(currentSubjX * 0.95).toFixed(2)}px, 0px, 0)`;
                }
                if (midArmyLayer) {
                    midArmyLayer.style.transform = `translate3d(${(currentSubjX * 0.55).toFixed(2)}px, 0px, 0)`;
                }
                if (rearArmyLayer) {
                    rearArmyLayer.style.transform = `translate3d(${(currentSubjX * 0.20).toFixed(2)}px, 0px, 0)`;
                }



                // Check motion settle
                const isMoving = Math.abs(targetCardRotX - currentCardRotX) > 0.02 ||
                                 Math.abs(targetCardRotY - currentCardRotY) > 0.02 ||
                                 Math.abs(targetSubjX - currentSubjX) > 0.05 ||
                                 Math.abs(targetSubjY - currentSubjY) > 0.05 ||
                                 Math.abs(targetIntensity - currentIntensity) > 0.02;

                if (isHeroActive || isGyroActive || isMoving) {
                    rafId = requestAnimationFrame(render);
                } else {
                    rafId = null;
                }
            }

            function startRender() {
                if (PREFERS_REDUCED_MOTION) return;
                if (!rafId) {
                    rafId = requestAnimationFrame(render);
                }
            }

            function computeTargets(clientX, clientY, directHover) {
                const rect = card.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                // Normalized -1 to 1 based on card size with smooth bounds
                const rawNormX = (clientX - centerX) / (rect.width / 2);
                const rawNormY = (clientY - centerY) / (rect.height / 2);
                targetNormX = Math.max(-1, Math.min(1, rawNormX));
                targetNormY = Math.max(-1, Math.min(1, rawNormY));

                // Direct hover gets full intensity (1.0), ambient hero motion gets refined subtle intensity (0.38)
                isDirectHover = directHover;
                targetIntensity = directHover ? 1.0 : 0.38;

                targetCardRotX = 0;
                targetCardRotY = targetNormX * MAX_ROTATION_Y * targetIntensity;
                targetSubjX = targetNormX * MAX_SUBJECT_SHIFT * targetIntensity;
                // Vertical shift locked to 0 so the photo never shifts or grows downwards
                targetSubjY = 0;

                isHeroActive = true;
                startRender();
            }

            function resetTargets() {
                targetCardRotX = 0;
                targetCardRotY = 0;
                targetSubjX = 0;
                targetSubjY = 0;
                targetNormX = 0;
                targetNormY = 0;
                targetIntensity = 0;
                isDirectHover = false;
                isHeroActive = false;
                startRender();
            }

            let isShockwaveRunning = false;

            function triggerCinematicShockwave(clientX, clientY) {
                if (isShockwaveRunning) return;
                isShockwaveRunning = true;

                // 1. Synthesize audio
                if (typeof playCinematicShockwaveSound === 'function') {
                    playCinematicShockwaveSound();
                }

                // 2. Lock both flanks visible with shockwave impulse
                card.classList.add('is-active', 'is-shockwave-active');
                card.setAttribute('data-active-flank', 'all');

                const rect = card.getBoundingClientRect();
                const clickX = (clientX && clientX > 0) ? (clientX - rect.left) : (rect.width / 2);
                const clickY = (clientY && clientY > 0) ? (clientY - rect.top) : (rect.height / 2);

                card.style.setProperty('--wave-cx', `${clickX}px`);
                card.style.setProperty('--wave-cy', `${clickY}px`);

                // Staggered Sci-Fi Water Wave for all cyber-units on both flanks (পানির ঢেউ)
                const units = card.querySelectorAll('.cyber-unit');
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const maxDist = Math.hypot(centerX, centerY);

                units.forEach(unit => {
                    const uRect = unit.getBoundingClientRect();
                    const uX = (uRect.left + uRect.width / 2) - rect.left;
                    const uY = (uRect.top + uRect.height / 2) - rect.top;

                    // Calculate radial distance from wave origin
                    const dist = Math.hypot(uX - clickX, uY - clickY);
                    // Wave propagation speed: expands smoothly outwards (0 to ~400ms delay)
                    const rippleDelay = Math.max(0.04, (dist / maxDist) * 0.42);

                    setTimeout(() => {
                        unit.classList.remove('ripple-wave-active');
                        void unit.offsetWidth; // Force reflow
                        unit.classList.add('ripple-wave-active');
                    }, rippleDelay * 1000);

                    setTimeout(() => {
                        unit.classList.remove('ripple-wave-active');
                    }, (rippleDelay + 1.0) * 1000);
                });

                // Cleanup wave state
                setTimeout(() => {
                    card.classList.remove('is-shockwave-active');
                    isShockwaveRunning = false;
                    if (!card.matches(':hover') && !wrapper.matches(':hover')) {
                        card.classList.remove('is-active');
                        card.removeAttribute('data-active-flank');
                    }
                }, 1250);
            }

            function updateActiveFlank(clientX) {
                if (isShockwaveRunning) return;
                const rect = card.getBoundingClientRect();
                if (!rect.width) return;
                const ratioX = (clientX - rect.left) / rect.width;
                if (ratioX < 0.36) {
                    card.setAttribute('data-active-flank', 'left');
                } else if (ratioX > 0.64) {
                    card.setAttribute('data-active-flank', 'right');
                } else {
                    card.setAttribute('data-active-flank', 'all');
                }
            }

            // 1. Direct Card Hover (Full Cinematic Inspection & Spatial Badges Reveal)
            wrapper.addEventListener('mouseenter', (e) => {
                card.classList.add('is-active');
                updateActiveFlank(e.clientX);
            });

            wrapper.addEventListener('mousemove', (e) => {
                e.stopPropagation();
                computeTargets(e.clientX, e.clientY, true);
                updateActiveFlank(e.clientX);
            });

            wrapper.addEventListener('mouseleave', () => {
                if (isShockwaveRunning) return;
                isDirectHover = false;
                if (isScrollDeployed) {
                    card.classList.add('is-active', 'is-scroll-deployed');
                    card.setAttribute('data-active-flank', 'all');
                    targetIntensity = 0.55;
                } else {
                    card.classList.remove('is-active');
                    card.removeAttribute('data-active-flank');
                    targetIntensity = 0.38;
                }
                startRender();
            });

            // 2. Cinematic Shockwave & Sci-Fi Water Ripple on Center Click / Tap
            wrapper.addEventListener('click', (e) => {
                if (e.target.closest('.unit-popup') || e.target.closest('a') || e.target.closest('button')) return;
                const rect = card.getBoundingClientRect();
                if (!rect.width) return;
                const ratioX = (e.clientX - rect.left) / rect.width;

                const isCenterZone = ratioX >= 0.28 && ratioX <= 0.72;
                const isBothFlanksActive = card.getAttribute('data-active-flank') === 'all';

                if (isCenterZone || isBothFlanksActive) {
                    triggerCinematicShockwave(e.clientX, e.clientY);
                }
            });

            // 3. Smart Tooltip Collision Prevention & Viewport Clamping (Guaranteed visible bounds on desktop)
            card.querySelectorAll('.cyber-unit').forEach(unit => {
                unit.addEventListener('mouseenter', () => {
                    if (window.innerWidth <= 768) return; // Mobile uses vertical above/below positioning!
                    const popup = unit.querySelector('.unit-popup');
                    if (!popup) return;
                    requestAnimationFrame(() => {
                        const r = popup.getBoundingClientRect();
                        const pad = 12;
                        let dx = 0;
                        if (r.right > window.innerWidth - pad) {
                            dx = (window.innerWidth - pad) - r.right;
                        } else if (r.left < pad) {
                            dx = pad - r.left;
                        }
                        if (dx !== 0) {
                            popup.style.setProperty('transform', `translateY(-50%) translateX(${dx}px) scale(1)`, 'important');
                        }
                    });
                });
                unit.addEventListener('mouseleave', () => {
                    const popup = unit.querySelector('.unit-popup');
                    if (popup) popup.style.transform = '';
                });

                // Mobile touch / tap to inspect unit popup (toggles popup above/below unit)
                unit.addEventListener('click', (e) => {
                    if (window.innerWidth <= 768) {
                        e.stopPropagation();
                        const wasActive = unit.classList.contains('popup-active');
                        card.querySelectorAll('.cyber-unit.popup-active').forEach(u => u.classList.remove('popup-active'));
                        if (!wasActive) {
                            unit.classList.add('popup-active');
                        }
                    }
                });
            });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.cyber-unit')) {
                    card.querySelectorAll('.cyber-unit.popup-active').forEach(u => u.classList.remove('popup-active'));
                }
            });

            if (heroSection) {
                heroSection.addEventListener('mousemove', (e) => {
                    if (!isDirectHover) {
                        computeTargets(e.clientX, e.clientY, false);
                    }
                });

                heroSection.addEventListener('mouseleave', () => {
                    if (isScrollDeployed) {
                        card.classList.add('is-active', 'is-scroll-deployed');
                        card.setAttribute('data-active-flank', 'all');
                    } else {
                        card.classList.remove('is-active');
                        card.removeAttribute('data-active-flank');
                        resetTargets();
                    }
                });
            }

            // 4. Auto-Reveal on Scroll (স্ক্রল বা টাচ করার পরে লোগো আনলক হবে)
            function handleHeroScroll() {
                if (!card || isShakingActive) return;

                const rect = card.getBoundingClientRect();
                const winHeight = window.innerHeight || document.documentElement.clientHeight;
                const scrollY = window.scrollY || window.pageYOffset;
                const isMobile = window.innerWidth <= 860;

                // Check if hero card is currently in viewport
                const isHeroVisible = rect.top < winHeight * 0.92 && rect.bottom > winHeight * 0.08;

                if (scrollY > 25 && isHeroVisible) {
                    isDeploymentUnlocked = true;
                    if (!isScrollDeployed) {
                        isScrollDeployed = true;
                        // Scroll reveals the floating logos on mobile too (not only desktop)
                        card.classList.add('is-active', 'is-scroll-deployed');
                        if (!isDirectHover) {
                            card.setAttribute('data-active-flank', 'all');
                        }
                    }
                    if (!isDirectHover && !isGyroActive) {
                        // Subtle reactive tilt & dynamic 3D depth shift as user scrolls down
                        const scrollProgress = Math.min(1, (scrollY - 20) / 280);
                        targetCardRotX = -scrollProgress * 6.5;
                        targetIntensity = 0.50 + scrollProgress * 0.35;
                        startRender();
                    }
                } else if (scrollY <= 15) {
                    if (isScrollDeployed) {
                        isScrollDeployed = false;
                        card.classList.remove('is-scroll-deployed');
                        if (!isDirectHover && !isGyroActive) {
                            card.classList.remove('is-active');
                            card.removeAttribute('data-active-flank');
                            resetTargets();
                        }
                    }
                } else if (!isHeroVisible && isScrollDeployed) {
                    // Out of screen view: silently reset so it re-deploys cleanly on scroll back
                    isScrollDeployed = false;
                    card.classList.remove('is-scroll-deployed');
                    if (!isDirectHover && !isGyroActive) {
                        card.classList.remove('is-active');
                        card.removeAttribute('data-active-flank');
                        resetTargets();
                    }
                }
            }

            window.addEventListener('scroll', handleHeroScroll, { passive: true });
            // Global touch anywhere on page unlocks flank deployment
            window.addEventListener('touchstart', () => {
                isDeploymentUnlocked = true;
            }, { passive: true });
            // Initial run in case loaded midway, with the next frame: its measuring would lay the page out inside the start-up task
            requestAnimationFrame(handleHeroScroll);

            // 5. Mobile Touch Events (Drag & Pan Interaction)
            wrapper.addEventListener('touchstart', (e) => {
                isDeploymentUnlocked = true;
                if (e.touches && e.touches[0]) {
                    computeTargets(e.touches[0].clientX, e.touches[0].clientY, true);
                    const rect = card.getBoundingClientRect();
                    const ratioX = (e.touches[0].clientX - rect.left) / rect.width;
                    if (ratioX < 0.46) {
                        card.setAttribute('data-active-flank', 'left');
                        card.classList.add('is-active');
                    } else if (ratioX > 0.54) {
                        card.setAttribute('data-active-flank', 'right');
                        card.classList.add('is-active');
                    } else {
                        card.removeAttribute('data-active-flank');
                        card.classList.remove('is-active');
                    }
                }
            }, { passive: true });

            wrapper.addEventListener('touchmove', (e) => {
                isDeploymentUnlocked = true;
                if (e.touches && e.touches[0]) {
                    computeTargets(e.touches[0].clientX, e.touches[0].clientY, true);
                    const rect = card.getBoundingClientRect();
                    const ratioX = (e.touches[0].clientX - rect.left) / rect.width;
                    if (ratioX < 0.46) {
                        card.setAttribute('data-active-flank', 'left');
                        card.classList.add('is-active');
                    } else if (ratioX > 0.54) {
                        card.setAttribute('data-active-flank', 'right');
                        card.classList.add('is-active');
                    } else {
                        card.removeAttribute('data-active-flank');
                        card.classList.remove('is-active');
                    }
                }
            }, { passive: true });

            wrapper.addEventListener('touchend', () => {
                if (isShockwaveRunning) return;
                const isMobile = window.innerWidth <= 860;
                if (isMobile) {
                    if (baseGamma !== null && lastGyroGamma !== null && isDeploymentUnlocked) {
                        const currentDeltaGamma = lastGyroGamma - baseGamma;
                        if (currentDeltaGamma > 3.5) {
                            card.setAttribute('data-active-flank', 'right');
                            card.classList.add('is-active');
                        } else if (currentDeltaGamma < -3.5) {
                            card.setAttribute('data-active-flank', 'left');
                            card.classList.add('is-active');
                        } else if (isScrollDeployed) {
                            card.setAttribute('data-active-flank', 'all');
                            card.classList.add('is-active', 'is-scroll-deployed');
                        } else {
                            card.removeAttribute('data-active-flank');
                            card.classList.remove('is-active');
                        }
                    } else if (isScrollDeployed) {
                        card.setAttribute('data-active-flank', 'all');
                        card.classList.add('is-active', 'is-scroll-deployed');
                    } else {
                        card.removeAttribute('data-active-flank');
                        card.classList.remove('is-active');
                    }
                    resetTargets();
                } else if (isScrollDeployed) {
                    card.classList.add('is-active', 'is-scroll-deployed');
                    card.setAttribute('data-active-flank', 'all');
                } else {
                    card.classList.remove('is-active');
                    card.removeAttribute('data-active-flank');
                    resetTargets();
                }
            });

            // 5. Mobile Gyroscope 3D Tilt & Kinetic Shake Surge (iPhone & Android)
            function handleOrientation(e) {
                if (e.beta === null || e.gamma === null) return;
                isGyroActive = true;
                lastGyroGamma = e.gamma;

                // Dynamic baseline drift: smoothly adapts to user hand posture
                if (baseBeta === null) {
                    baseBeta = e.beta;
                    baseGamma = e.gamma;
                } else {
                    baseBeta += (e.beta - baseBeta) * 0.015;
                    baseGamma += (e.gamma - baseGamma) * 0.015;
                }

                const deltaGamma = e.gamma - baseGamma;
                const deltaBeta = e.beta - baseBeta;

                // Responsive tilt mapping (-18 to +18 degrees = full 3D range)
                targetNormX = Math.max(-1, Math.min(1, deltaGamma / 18));
                targetNormY = Math.max(-1, Math.min(1, deltaBeta / 18));
                targetIntensity = Math.min(1.0, Math.sqrt(targetNormX * targetNormX + targetNormY * targetNormY) * 1.25);

                targetCardRotX = -targetNormY * (MAX_ROTATION_X * 1.25);
                targetCardRotY = targetNormX * (MAX_ROTATION_Y * 1.25);
                targetSubjX = targetNormX * (MAX_SUBJECT_SHIFT * 1.35);
                targetSubjY = targetNormY * (MAX_SUBJECT_SHIFT * 1.35);

                // Highlight flank according to phone tilt direction
                if (!isShakingActive && !isDirectHover) {
                    const isMobile = window.innerWidth <= 860;
                    if (!isDeploymentUnlocked) {
                        // Locked on initial open: ONLY 3D photo vibe, no logos on either side
                        card.removeAttribute('data-active-flank');
                        card.classList.remove('is-active');
                    } else if (isMobile) {
                        // Unlocked after scroll or touch:
                        // Tilt phone RIGHT -> ONLY right logos emerge, left side completely empty
                        // Tilt phone LEFT -> ONLY left logos emerge, right side completely empty
                        // Neutral posture -> both flanks tucked behind and empty
                        if (deltaGamma > 3.5) {
                            card.setAttribute('data-active-flank', 'right');
                            card.classList.add('is-active');
                        } else if (deltaGamma < -3.5) {
                            card.setAttribute('data-active-flank', 'left');
                            card.classList.add('is-active');
                        } else if (isScrollDeployed) {
                            card.setAttribute('data-active-flank', 'all');
                            card.classList.add('is-active');
                        } else {
                            card.removeAttribute('data-active-flank');
                            card.classList.remove('is-active');
                        }
                    } else {
                        if (deltaGamma < -6) {
                            card.setAttribute('data-active-flank', 'left');
                            card.classList.add('is-active');
                        } else if (deltaGamma > 6) {
                            card.setAttribute('data-active-flank', 'right');
                            card.classList.add('is-active');
                        } else if (isScrollDeployed) {
                            card.setAttribute('data-active-flank', 'all');
                            card.classList.add('is-active');
                        } else {
                            card.removeAttribute('data-active-flank');
                            card.classList.remove('is-active');
                        }
                    }
                }

                startRender();
            }

            // 5. Kinetic Mobile Shake Detection (ঝাঁকালে লোগো ভেসে উঠে কাঁপতে থাকবে)
            function handleMotion(e) {
                const acc = e.accelerationIncludingGravity || e.acceleration;
                if (!acc) return;
                const x = acc.x || 0;
                const y = acc.y || 0;
                const z = acc.z || 0;

                if (lastAccX === null) {
                    lastAccX = x; lastAccY = y; lastAccZ = z;
                    return;
                }

                const deltaX = Math.abs(x - lastAccX);
                const deltaY = Math.abs(y - lastAccY);
                const deltaZ = Math.abs(z - lastAccZ);
                const shakeForce = deltaX + deltaY + deltaZ;

                // Threshold for vigorous shake
                if (shakeForce > 21) {
                    const now = Date.now();
                    if (now - lastShakeTime > 120) {
                        lastShakeTime = now;
                        triggerKineticShake(shakeForce);
                    }
                }

                lastAccX = x; lastAccY = y; lastAccZ = z;
            }

            function triggerKineticShake(force) {
                if (!isShakingActive) {
                    isShakingActive = true;
                    card.classList.add('is-kinetic-shaking');
                    card.classList.add('is-active');
                    card.setAttribute('data-active-flank', 'all');

                    // Subtle mobile haptic vibration if supported
                    if (navigator.vibrate) {
                        try { navigator.vibrate([40, 30, 50]); } catch(err) {}
                    }
                    if (typeof playSound === 'function') {
                        playSound('hover');
                    }
                }

                // Shake persists while shaking + settles 2.2 seconds after stopping
                if (shakeEndTimer) clearTimeout(shakeEndTimer);
                shakeEndTimer = setTimeout(() => {
                    isShakingActive = false;
                    card.classList.remove('is-kinetic-shaking');
                    card.classList.remove('is-active');
                    card.removeAttribute('data-active-flank');
                }, 2200);
            }

            // Enable Orientation and Motion Sensors (iOS permission + Android automatic)
            function initMotionAndGyro() {
                if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                    DeviceOrientationEvent.requestPermission().then(res => {
                        if (res === 'granted') {
                            window.addEventListener('deviceorientation', handleOrientation, { passive: true });
                        }
                    }).catch(() => {});
                } else if (window.DeviceOrientationEvent) {
                    window.addEventListener('deviceorientation', handleOrientation, { passive: true });
                }

                if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
                    DeviceMotionEvent.requestPermission().then(res => {
                        if (res === 'granted') {
                            window.addEventListener('devicemotion', handleMotion, { passive: true });
                        }
                    }).catch(() => {});
                } else if (window.DeviceMotionEvent) {
                    window.addEventListener('devicemotion', handleMotion, { passive: true });
                }
            }

            // Bind sensor permissions to user gesture
            document.addEventListener('touchstart', initMotionAndGyro, { once: true, passive: true });
            document.addEventListener('click', initMotionAndGyro, { once: true, passive: true });
        });
    }

    initCinematicDepth();

    // The portrait card's 35 tool logos (data-src) only show once the card is hovered or opened, so they load 3 s after
    // the page has, or the moment the card is touched, instead of alongside the first screen.
    const depthCard = document.getElementById('hero-depth-container');
    if (depthCard) {
        const loadLogos = () => depthCard.querySelectorAll('img[data-src]').forEach((img) => { img.src = img.dataset.src; img.removeAttribute('data-src'); });
        ['pointerenter', 'touchstart', 'focusin'].forEach((t) => depthCard.addEventListener(t, loadLogos, { once: true, passive: true }));
        const whenIdle = () => setTimeout(() => ('requestIdleCallback' in window ? requestIdleCallback(loadLogos, { timeout: 2000 }) : loadLogos()), 3000);
        if (document.readyState === 'complete') whenIdle();
        else window.addEventListener('load', whenIdle, { once: true });
    }

    /* ==========================================
       6. MATRIX DECRYPTION EFFECT
    ========================================== */
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*0123456789";

    function decryptText(element) {
        if (element.dataset.decrypted === "true") return;
        element.dataset.decrypted = "true";

        let iterations = 0;
        const finalValue = element.dataset.value;
        const originalHTML = element.innerHTML;

        const interval = setInterval(() => {
            element.innerText = finalValue.split("")
                .map((letter, index) => {
                    if (index < iterations) return finalValue[index];
                    return letters[Math.floor(Math.random() * letters.length)];
                })
                .join("");

            if (iterations >= finalValue.length) {
                clearInterval(interval);
                element.innerHTML = originalHTML;
            }
            iterations += 1 / 3;
            if (iterations % 1 === 0) playSound('type');
        }, 30);
    }

    const decryptObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) decryptText(entry.target);
        });
    }, { threshold: 0.8 });

    document.querySelectorAll('.decrypt-text').forEach(el => {
        // The hero heading is the first big thing painted (the page's LCP), so it reads plainly on load and decrypts on mouse hover.
        if (el.closest('#home')) {
            el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') decryptText(el); });
            return;
        }
        decryptObserver.observe(el);
    });

    /* ==========================================
       7. LIVE SERVER & CLIENT TELEMETRY COCKPIT
    ========================================== */
    const sysMonitor = document.getElementById('sys-monitor');
    const sysDock = document.getElementById('sys-monitor-dock');
    const cpuVal = document.getElementById('mon-cpu');
    const cpuBar = document.getElementById('mon-cpu-bar');
    const ramVal = document.getElementById('mon-ram');
    const ramBar = document.getElementById('mon-ram-bar');
    const netVal = document.getElementById('mon-net');
    const fpsVal = document.getElementById('mon-fps');
    const fpsBar = document.getElementById('mon-fps-bar');
    const dockFps = document.getElementById('dock-fps');
    const dockPing = document.getElementById('dock-ping');
    const hudNavPing = document.getElementById('hud-nav-ping');
    const monMiniFps = document.getElementById('mon-mini-fps');
    const clrBtn = document.getElementById('clearance-level');
    const diagBtn = document.getElementById('mon-diag-btn');
    const minBtn = document.getElementById('mon-minimize-btn');
    const closeSys = document.getElementById('close-sys-monitor');

    if (sysMonitor) {
        // 1. Real-time Framerate / GPU Render Telemetry
        let frameCount = 0;
        let lastFpsTimestamp = performance.now();
        let currentFps = 60;

        function calcFps(now) {
            frameCount++;
            if (now - lastFpsTimestamp >= 1000) {
                currentFps = Math.min(Math.round((frameCount * 1000) / (now - lastFpsTimestamp)), 120);
                frameCount = 0;
                lastFpsTimestamp = now;

                if (fpsVal) {
                    fpsVal.innerText = `${currentFps} FPS`;
                    fpsVal.style.color = currentFps >= 50 ? '#10b981' : (currentFps >= 30 ? '#fbbf24' : '#ef4444');
                }
                if (fpsBar) {
                    const pct = Math.min(Math.round((currentFps / 60) * 100), 100);
                    fpsBar.style.width = `${pct}%`;
                    fpsBar.style.background = currentFps >= 50 ? '#10b981' : (currentFps >= 30 ? '#fbbf24' : '#ef4444');
                }
                if (dockFps) dockFps.innerText = `${currentFps} FPS`;
                if (monMiniFps) monMiniFps.innerText = `${currentFps} FPS`;
            }
            requestAnimationFrame(calcFps);
        }
        requestAnimationFrame(calcFps);

        // 2. Real-time CPU & Activity Load
        let targetCpu = 4;
        let currentCpu = 4;
        let lastMouseX = 0, lastMouseY = 0;

        window.addEventListener('mousemove', (e) => {
            let dx = Math.abs(e.clientX - lastMouseX);
            let dy = Math.abs(e.clientY - lastMouseY);
            let speed = Math.min(Math.sqrt(dx * dx + dy * dy), 40);
            targetCpu = Math.min(Math.max(Math.round(4 + speed * 1.5), 2), 85);
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        }, { passive: true });

        setInterval(() => {
            targetCpu = Math.max(targetCpu - 2, 2 + Math.floor(Math.random() * 4));
            currentCpu += (targetCpu - currentCpu) * 0.3;
            const displayCpu = Math.round(currentCpu);

            if (cpuVal && cpuBar) {
                cpuVal.innerText = `${displayCpu}%`;
                cpuBar.style.width = `${displayCpu}%`;
                cpuBar.style.backgroundColor = displayCpu > 70 ? '#ef4444' : 'var(--accent-1)';
            }
        }, 120);

        // 3. Real JS Heap Memory or Scroll-Pressure Telemetry
        function updateMemory() {
            let ramPercent = 18;
            let label = '18%';
            if (window.performance && window.performance.memory) {
                const mem = window.performance.memory;
                ramPercent = Math.min(Math.max(Math.round((mem.usedJSHeapSize / mem.totalJSHeapSize) * 100), 10), 90);
                const usedMB = Math.round(mem.usedJSHeapSize / (1024 * 1024));
                label = `${usedMB}MB (${ramPercent}%)`;
            } else {
                let scrollY = window.scrollY || document.documentElement.scrollTop;
                let maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
                ramPercent = Math.floor((scrollY / maxScroll) * 45) + 16;
                label = `${ramPercent}%`;
            }

            if (ramVal && ramBar) {
                ramVal.innerText = label;
                ramBar.style.width = `${ramPercent}%`;
            }
        }
        window.addEventListener('scroll', updateMemory, { passive: true });
        setInterval(updateMemory, 3000);
        updateMemory();

        // 4. Real Network Telemetry & Ping
        let currentPing = 18;
        function measureNetwork() {
            if (navigator.connection && navigator.connection.rtt) {
                currentPing = navigator.connection.rtt;
                if (netVal) netVal.innerText = `${currentPing}ms • ${navigator.onLine ? 'STABLE' : 'OFFLINE'}`;
                if (dockPing) dockPing.innerText = `${currentPing}ms`;
                if (hudNavPing) hudNavPing.innerText = `${currentPing}ms`;
            } else {
                const t0 = performance.now();
                fetch('./mehedi-logo.webp', { method: 'HEAD', cache: 'no-store' })
                    .then(() => {
                        currentPing = Math.max(Math.round(performance.now() - t0), 8);
                        if (netVal) netVal.innerText = `${currentPing}ms • ACTIVE`;
                        if (dockPing) dockPing.innerText = `${currentPing}ms`;
                        if (hudNavPing) hudNavPing.innerText = `${currentPing}ms`;
                    })
                    .catch(() => {
                        if (netVal) netVal.innerText = `${currentPing}ms • ONLINE`;
                        if (hudNavPing) hudNavPing.innerText = `${currentPing}ms`;
                    });
            }
        }
        measureNetwork();
        setInterval(measureNetwork, 15000);

        window.addEventListener('click', () => {
            if (netVal) {
                netVal.innerText = `TX/RX ${currentPing}ms`;
                netVal.className = "ping-active";
                setTimeout(() => {
                    if (netVal) {
                        netVal.innerText = `${currentPing}ms • IDLE`;
                        netVal.className = "ping-idle";
                    }
                }, 300);
            }
        });

        // 5. Interactive Clearance Level Cycle
        const clearanceLevels = [
            { level: 'LVL 1 (GUEST)', color: '#fbbf24', role: 'Guest Protocol Active' },
            { level: 'LVL 2 (RECRUITER)', color: '#00f2fe', role: 'Executive Access Granted' },
            { level: 'LVL 3 (ARCHITECT)', color: '#10b981', role: 'Root Engineering Clearance' }
        ];
        let clrIdx = 0;

        if (clrBtn) {
            clrBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                clrIdx = (clrIdx + 1) % clearanceLevels.length;
                const activeClr = clearanceLevels[clrIdx];
                clrBtn.innerText = activeClr.level;
                clrBtn.style.color = activeClr.color;
                clrBtn.style.borderColor = activeClr.color;
                clrBtn.style.background = `${activeClr.color}22`;

                if (typeof playSound === 'function') playSound('success');
                if (typeof showToast === 'function') {
                    showToast(`[ACCESS GRANTED] ${activeClr.role}`, 'success');
                }
            });
        }

        // 6. Interactive Diagnostic Benchmark
        if (diagBtn) {
            diagBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                diagBtn.disabled = true;
                const prevHtml = diagBtn.innerHTML;
                diagBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> BENCHMARKING...';
                if (typeof playSound === 'function') playSound('type');

                let progress = 0;
                const diagInterval = setInterval(() => {
                    progress += 25;
                    targetCpu = Math.min(progress + 20, 95);
                    if (progress >= 100) {
                        clearInterval(diagInterval);
                        targetCpu = 4;
                        diagBtn.innerHTML = '<i class="fa-solid fa-check"></i> 100% HEALTHY';
                        diagBtn.style.background = '#10b981';
                        diagBtn.style.color = '#ffffff';
                        if (typeof playSound === 'function') playSound('success');
                        setTimeout(() => {
                            diagBtn.innerHTML = prevHtml;
                            diagBtn.disabled = false;
                            diagBtn.style.background = '';
                            diagBtn.style.color = '';
                        }, 2500);
                    }
                }, 400);
            });
        }

        // 7. Minimize to Dock Controls
        if (minBtn) {
            minBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                sysMonitor.style.display = 'none';
                if (sysDock) sysDock.classList.remove('hidden');
                if (typeof playSound === 'function') playSound('click');
            });
        }

        if (closeSys) {
            closeSys.addEventListener('click', (e) => {
                e.stopPropagation();
                sysMonitor.style.display = 'none';
                if (sysDock) sysDock.classList.remove('hidden');
                if (typeof playSound === 'function') playSound('click');
            });
        }

        if (sysDock) {
            sysDock.addEventListener('click', () => {
                sysDock.classList.add('hidden');
                sysMonitor.style.display = 'block';
                if (typeof playSound === 'function') playSound('success');
            });
        }

        // Mobile HUD Nano Telemetry Badge Interactive Tap
        const mobileNavBadge = document.querySelector('.mobile-nav-pill-badge');
        if (mobileNavBadge) {
            mobileNavBadge.addEventListener('click', (e) => {
                e.stopPropagation();
                if (typeof playSound === 'function') playSound('click');
                if (sysMonitor) {
                    sysMonitor.style.display = 'block';
                    if (sysDock) sysDock.classList.add('hidden');
                } else if (typeof showToast === 'function') {
                    showToast(`[SYS_TELEMETRY] Operational • Latency: ${currentPing}ms`, 'success');
                }
            });
        }
    }

    /* ==========================================
       8. FULL CLI HACKER TERMINAL
    ========================================== */
    const cliToggle = document.getElementById('cli-toggle');
    const cliTerminal = document.getElementById('cli-terminal');
    const cliClose = document.getElementById('close-cli');
    const cliInput = document.getElementById('cli-input');
    const cliOutput = document.getElementById('cli-output');

    if (cliToggle && cliTerminal) {
        cliToggle.addEventListener('click', (e) => {
            e.preventDefault();
            cliTerminal.classList.add('active');
            cliInput.focus();
            playSound('success');
        });

        cliClose.addEventListener('click', () => cliTerminal.classList.remove('active'));

        const cliCommands = {
            'help': 'Available commands: help, about, skills, projects, clear, exit, vault, solarsmash, hw-scan, deep-dive',
            'about': 'I am a Full-Stack Web Developer, AI Automation Engineer, and Digital Efficiency Architect with 4+ years of production experience building intelligent web systems, distributed microservices (NestJS, Postgres, Kafka, Redis), and autonomous LLM workflows.',
            'skills': 'Languages: PHP, JavaScript, SQL, Liquid.\nFrameworks: Tailwind, Laravel.\nTools: Git, VS Code, Cloudflare, openclaw, Antigravity, claude.',
            'projects': 'Accessing secure database... Use the GUI interface on the main portal to view VIP projects.',
            'sudo': 'Nice try. This incident will be reported.',
            'ls': 'index.php  style.css  script.js  db_connect.php  nuclear.php',
            'vault': 'ACCESSING SECURE NUMISMATIC VAULT...\n\n   ___________________\n  /                   \\\n |  1917 ONE RUPEE   |\n |   BRITISH INDIA   |\n  \\___________________/\n\n   ___________________\n  /                   \\\n |    1948 1 RUPEE   |\n |     PAKISTAN      |\n  \\___________________/',
            'solarsmash': 'INITIATING TITAN DIAGNOSTIC...\nTARGET: MOON TITAN\nWEAPON: PLANETARY LASER\n[||||||||||||||||||||] 100%\nCRITICAL HIT. CORE DESTABILIZED.\nMISSION COMPLETE.'
        };

        cliInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const val = cliInput.value.trim().toLowerCase();
                cliInput.value = '';
                playSound('type');

                cliOutput.innerHTML += `<div><span class="sys">root@mehedi.pro:~$</span> ${val}</div>`;

                if (val === 'clear') {
                    cliOutput.innerHTML = '';
                } else if (val === 'exit') {
                    cliTerminal.classList.remove('active');
                } else if (val === 'deep-dive') {
                    deepDiveMode = !deepDiveMode;
                    cliOutput.innerHTML += `<div style="color:var(--accent-1); margin-top:5px;">[SYSTEM] Deep Dive Matrix mode ${deepDiveMode ? 'ACTIVATED' : 'DEACTIVATED'}.</div>`;
                    updateClearance(4);
                } else if (val === 'hw-scan') {
                    cliOutput.innerHTML += `<div style="color:var(--accent-1); margin-top:5px;">[SYSTEM] Commencing Hardware Diagnostic...</div>`;
                    cliInput.disabled = true;

                    const frames = [
                        "[||........] Scanning Antenna Arrays...",
                        "[||||......] Calibrating PIN Diodes...",
                        "[||||||....] Testing Microwave Frequencies...",
                        "[||||||||..] Bypassing Thermal Limits...",
                        "[||||||||||] Hardware Nominal. S-Parameters Stable."
                    ];

                    let fIdx = 0;
                    const scanInt = setInterval(() => {
                        if (fIdx < frames.length) {
                            cliOutput.innerHTML += `<div style="color:#fbbf24;">${frames[fIdx]}</div>`;
                            cliOutput.scrollTop = cliOutput.scrollHeight;
                            playSound('type');
                            fIdx++;
                        } else {
                            clearInterval(scanInt);
                            cliInput.disabled = false;
                            cliInput.focus();
                            playSound('success');
                            updateClearance(3);
                        }
                    }, 600);

                } else if (cliCommands[val]) {
                    cliOutput.innerHTML += `<div style="color:#d4d4d4;">${cliCommands[val].replace(/\n/g, '<br>')}</div>`;
                    if (val === 'vault') updateClearance(2);
                } else if (val !== '') {
                    cliOutput.innerHTML += `<div class="err">bash: ${val}: command not found</div>`;
                }

                cliOutput.scrollTop = cliOutput.scrollHeight;
            }
        });
    }

    /* ==========================================
       9. AI CHAT WIDGET — GEMINI AI (REAL CHATBOT)
       ==========================================
       Powered by Google Gemini 1.5 Flash (Free API)
       Get your free key → https://aistudio.google.com/app/apikey
    ========================================== */
    /* ==========================================
       9. AI CHAT WIDGET — RULE-BASED BOT
    ========================================== */
    const chatWidget = document.getElementById('ai-chat-widget');
    const chatHeader = document.getElementById('chat-header');
    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const voiceBtn = document.getElementById('voice-btn');

    // ── KNOWLEDGE BASE ─────────────────────────────────────────────────────────
    const KNOWLEDGE_BASE = {
        greetings: {
            keywords: [/\b(hi|hello|hey|greetings|howdy|sup|hola)\b/i, /\bhow are you\b/i, /\bwho are you\b/i],
            response: "System Online. I am Mehedi's AI assistant. How can I help you explore his systems, architectures, or deployed projects today?"
        },
        identity: {
            keywords: [/\b(mehedi|about|who|profile|bio|background|developer|engineer|architect)\b/i],
            response: "Mehedi Hasan is a Full-Stack Web Developer, Distributed Systems Architect, and Autonomous AI Engineer. He specializes in Microservices (NestJS, Postgres, Kafka, RabbitMQ, Docker), Cloud Infrastructure, and AI Agent workflows (LangGraph, MCP, Ollama)."
        },
        skills: {
            keywords: [/\b(skill|stack|tech|language|toolkit|expert|react|nest|postgres|microservices|redis|kafka|rabbitmq|docker|kubernetes|aws|elk|prometheus|grafana|dsa|system design|networking)\b/i],
            response: "Technical Arsenal:\n• Architecture & Backend: NestJS, Laravel, Node.js, React 19, TypeScript, PostgreSQL, Distributed Systems, Microservices, DSA & System Design.\n• Event Streaming & Caching: Apache Kafka, RabbitMQ, Redis Cluster.\n• Cloud, DevOps & SRE: AWS, Docker, Kubernetes (K8s), CI/CD, Prometheus & Grafana.\n• AI & Agents: LangGraph, MCP (Model Context Protocol), Local LLMs (Ollama, DeepSeek), Claude, Gemini, PGVector RAG, Python & n8n."
        },
        services: {
            keywords: [/\b(service|hire|price|cost|work|offer|buy|freelance)\b/i],
            response: "Engineering Services:\n• Autonomous AI & Swarms ($450+)\n• Distributed Cloud Systems ($550+)\n• Full-Stack Web Engineering ($350+)\n• API & Workflow Automation ($250+)\nYou can select required systems in the Service Terminal to generate a custom deployment invoice."
        },
        projects: {
            keywords: [/\b(project|portfolio|build|create|done|example|work|app|erp|sawab|karbar|hostel)\b/i],
            response: "Featured Deployments:\n• SAWAB NGO ERP (Frappe, ERPNext, Next.js: HR, payroll, grants, micro-investment; live demo)\n• Karbar ERP — BD Business Suite (Laravel, Filament, NBR VAT & Payroll)\n• SAWAB Bangladesh Enterprise Platform & Foundation Portal\n• AI Video Making Engine & AI Hostel Management\n• Autonomous AI Swarms & Local LLM Sandbox"
        },
        credencex: {
            keywords: [/\b(credencex|medical|imaging|healthcare|lab|research|xai)\b/i],
            response: "CredenceX AI Research Lab advances trustworthy, explainable (XAI), and deployment-aware AI for medical imaging and clinical decision support in high-stakes healthcare environments."
        },
        contact: {
            keywords: [/\b(contact|email|phone|whatsapp|reach|talk|linkedin|github|connect)\b/i],
            response: "Connect with Mehedi:\n• WhatsApp: +880 1799-447594\n• Email: mehedihasan228.cse@gmail.com\n• GitHub: github.com/MehediHasan228"
        },
        automation: {
            keywords: [/\b(automation|bot|facebook|whatsapp bot|workflow|llm|agent)\b/i],
            response: "Autonomous Workflows: Mehedi builds event-driven autonomous pipelines (n8n, LangGraph, RabbitMQ) and AI swarms that cut manual overhead by up to 60%."
        },
        smalltalk: {
            keywords: [/\b(joke|funny|laugh)\b/i],
            response: "Why do programmers prefer dark mode? Because light attracts bugs!"
        }
    };

    // Chat Worker URL (chat-worker/). Empty = use the free fallback. After `wrangler deploy`, paste the URL here,
    // e.g. 'https://mehedi-chat.<your-subdomain>.workers.dev'
    const CHAT_API_URL = 'https://mehedi-chat.rajnieem.workers.dev';

    const CHAT_PROFILE = "You are Mehedi Hasan, replying in the first person to a visitor on your portfolio site (mehedi.pro.bd); you are an AI version of him, so say so if asked. Answer in the visitor's language, warmly and briefly: 1-3 short sentences. Never invent facts, prices or dates, and never commit to work or deadlines. " +
        "Facts: Mehedi is an AI-native software engineer in Bangladesh with 4+ years in production. Backend and systems: NestJS, Laravel, Node.js, PostgreSQL, Redis, Kafka, RabbitMQ, Docker, Kubernetes, AWS, CI/CD. Frontend: React, TypeScript, Flutter. AI: LangGraph, MCP, RAG with PGVector, local LLMs via Ollama, Claude, Gemini, n8n automations. " +
        "Work: SAWAB's multi-organisation NGO ERP (Frappe, ERPNext, Next.js; live demo), HR and payroll systems with AI modules, Karbar ERP (VAT and payroll for Bangladesh), the SAWAB Bangladesh platform, and autonomous AI agent swarms. Open to freelance and contract work. " +
        "Contact: WhatsApp +880 1799-447594, email mehedihasan228.cse@gmail.com, GitHub github.com/MehediHasan228. If unsure, invite them to message you on WhatsApp.";

    const DEFAULT_RESPONSE = "Query complete. Try asking about Mehedi's skills, enterprise ERPs, cloud architectures, AI services, or how to reach him directly.";

    // ── CHAT FUNCTIONS ─────────────────────────────────────────────────────────
    function getBotResponse(input) {
        for (const key in KNOWLEDGE_BASE) {
            if (KNOWLEDGE_BASE[key].keywords.some(regex => regex.test(input))) {
                return KNOWLEDGE_BASE[key].response;
            }
        }
        return DEFAULT_RESPONSE;
    }

    if (chatWidget && chatHeader) {
        // AI Orb Mascot Reference
        const getMascot = () => document.getElementById('chat-mascot') || chatWidget.querySelector('ai-orb-mascot');

        chatHeader.addEventListener('click', (e) => {
            if (e.target.closest('.chat-head-btn')) return;
            toggleChat();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && chatWidget.classList.contains('chat-expanded') && !document.getElementById('ai-orb-speech-bubble')) toggleChat();
        });

        // Interactive AI Orb Mascot touch & hover feedback
        chatWidget.addEventListener('mouseenter', () => {
            chatWidget.classList.add('grok-hovered');
            const mascot = getMascot();
            if (mascot && mascot.expression === 'idle') {
                mascot.triggerReaction('excited', 1200);
            }
        });
        chatWidget.addEventListener('mouseleave', () => {
            chatWidget.classList.remove('grok-hovered');
            const mascot = getMascot();
            if (mascot && mascot.expression === 'excited') {
                mascot.setExpression('idle');
            }
        });
        chatWidget.addEventListener('touchstart', () => {
            chatWidget.classList.add('grok-hovered');
            const mascot = getMascot();
            if (mascot && mascot.expression === 'idle') {
                mascot.triggerReaction('excited', 1200);
            }
        }, { passive: true });
        chatWidget.addEventListener('touchend', () => {
            setTimeout(() => {
                chatWidget.classList.remove('grok-hovered');
                const mascot = getMascot();
                if (mascot && mascot.expression === 'excited') {
                    mascot.setExpression('idle');
                }
            }, 1400);
        }, { passive: true });

        function toggleChat() {
            chatWidget.classList.toggle('chat-expanded');
            chatWidget.classList.toggle('chat-collapsed');
            
            // Clear any inline styles from keyboard sync when toggling
            chatWidget.style.bottom = '';
            chatWidget.style.maxHeight = '';
            
            const mascot = getMascot();
            const icon = document.getElementById('chat-toggle-icon');
            if (icon) {
                if (chatWidget.classList.contains('chat-expanded')) {
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                    
                    // USER OPENS CHAT:
                    // -> Blink
                    // -> Slight excited expression
                    // -> Tiny bounce
                    // -> Return to normal
                    if (mascot) {
                        mascot.setExpression('blink');
                        setTimeout(() => {
                            if (chatWidget.classList.contains('chat-expanded')) {
                                mascot.triggerReaction('excited', 1400);
                            }
                        }, 140);
                    }

                    setTimeout(() => {
                        if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
                    }, 100);
                    if (window.matchMedia('(pointer: fine)').matches) setTimeout(() => chatInput.focus({ preventScroll: true }), 260);
                } else {
                    icon.classList.remove('fa-chevron-down');
                    icon.classList.add('fa-chevron-up');
                    if (mascot) {
                        mascot.setExpression('idle');
                    }
                }
            }
            if (typeof playSound === 'function') playSound('click');
        }

        // ── VOICE INPUT (LIVE STREAMING TRANSCRIPTION) ─────────────────────────
        if (voiceBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true; // Stream words in real-time as spoken
            recognition.lang = navigator.language || 'en-US';

            let isListening = false;

            voiceBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isListening) {
                    recognition.stop();
                    return;
                }
                try {
                    recognition.start();
                } catch (err) {
                    console.warn('[VOICE] Recognition start error:', err);
                }
            });

            recognition.onstart = () => {
                isListening = true;
                voiceBtn.classList.add('mic-active');
                chatInput.placeholder = "Listening... speak now";
                chatInput.focus();
                const mascot = getMascot();
                if (mascot) mascot.setExpression('surprised');
                if (typeof playSound === 'function') playSound('click');
            };

            recognition.onresult = (e) => {
                let speechText = '';
                for (let i = 0; i < e.results.length; ++i) {
                    speechText += e.results[i][0].transcript;
                }
                if (speechText) {
                    chatInput.value = speechText;
                    syncComposer();
                    chatInput.focus();
                }
            };

            recognition.onerror = (e) => {
                console.warn('[VOICE] Error:', e.error);
                isListening = false;
                voiceBtn.classList.remove('mic-active');
                chatInput.placeholder = "Ask about projects, stack, hiring…";
                const mascot = getMascot();
                if (mascot) mascot.triggerReaction('error', 1800);
                if (typeof playSound === 'function') playSound('error');
            };

            recognition.onend = () => {
                isListening = false;
                voiceBtn.classList.remove('mic-active');
                chatInput.placeholder = "Ask about projects, stack, hiring…";
                chatInput.focus();
                const mascot = getMascot();
                if (mascot && mascot.expression === 'surprised') {
                    mascot.setExpression('idle');
                }
            };
        } else if (voiceBtn) {
            voiceBtn.style.display = 'none';
        }

        function appendMsg(text, role, isHTML = false) {
            const div = document.createElement('div');
            div.className = `message ${role === 'user' ? 'user-msg' : 'bot-msg'}`;
            if (isHTML) {
                div.innerHTML = text;
            } else {
                div.textContent = text;
            }
            chatBody.querySelectorAll('.chat-followups').forEach((n) => n.remove());
            chatBody.appendChild(div);
            chatBody.scrollTop = chatBody.scrollHeight;
            return div;
        }

        // The conversation survives page changes for this visit
        const LOG_KEY = 'chat:log', USED_KEY = 'chat:used';
        const store = {
            get: (k, d) => { try { return JSON.parse(sessionStorage.getItem(k)) || d; } catch (e) { return d; } },
            set: (k, v) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
        };
        const remember = (role, html, text) => { const log = store.get(LOG_KEY, []); log.push({ r: role, h: html, t: text || '' }); store.set(LOG_KEY, log.slice(-30)); };
        const markUsed = (key) => { const u = store.get(USED_KEY, []); if (!u.includes(key)) { u.push(key); store.set(USED_KEY, u); } };
        const esc = (str) => String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

        // Plain model text -> tidy HTML: paragraphs, bullet lists, **bold**, `code`, links
        function formatReply(raw) {
            let html = '', list = false;
            esc(String(raw).trim()).split(/\n+/).forEach((ln) => {
                const m = ln.match(/^\s*(?:[-*\u2022]|\d+[.)])\s+(.*)$/);
                if (m) { if (!list) { html += '<ul>'; list = true; } html += '<li>' + m[1] + '</li>'; }
                else if (ln.trim() && !/^\s*(?:[-*\u2022]|\d+[.)])\s*$/.test(ln)) { if (list) { html += '</ul>'; list = false; } html += '<p>' + ln + '</p>'; }
            });
            if (list) html += '</ul>';
            return html
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/`([^`]+)`/g, '<code>$1</code>')
                .replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
        }

        // Lines of a fresh reply rise in one after another
        function settle(el) {
            [...el.children].forEach((c, i) => c.style.setProperty('--i', i));
            el.classList.add('is-new');
        }

        function setBusy(on) { chatWidget.classList.toggle('is-busy', on); }
        function syncComposer() {
            chatWidget.classList.toggle('has-text', !!chatInput.value.trim());
            // the box grows with the text, up to four lines
            if (chatInput.tagName === 'TEXTAREA') { chatInput.style.height = ''; if (chatInput.value) chatInput.style.height = Math.min(chatInput.scrollHeight, 112) + 'px'; }
        }
        chatInput.addEventListener('input', syncComposer);

        // Animated inline icons for the quick-action chips (colour = currentColor)
        const CHIP_ICONS = {
            user: '<svg class="chip-ico ci-user" viewBox="0 0 16 16" aria-hidden="true"><circle class="ci-head" cx="8" cy="5.2" r="2.6"/><path class="ci-body" d="M2.6 14c.6-3 2.7-4.6 5.4-4.6s4.8 1.6 5.4 4.6"/></svg>',
            layers: '<svg class="chip-ico ci-layers" viewBox="0 0 16 16" aria-hidden="true"><path class="ly ly-3" d="M2 10.2 L8 13.4 L14 10.2"/><path class="ly ly-2" d="M2 7.6 L8 10.8 L14 7.6"/><path class="ly ly-1" d="M8 2.2 L14 5.2 L8 8.2 L2 5.2 Z"/></svg>',
            briefcase: '<svg class="chip-ico ci-brief" viewBox="0 0 16 16" aria-hidden="true"><path d="M5.6 4.2V3.1c0-.6.4-1 1-1h2.8c.6 0 1 .4 1 1v1.1"/><rect class="ci-case" x="1.8" y="4.2" width="12.4" height="8.6" rx="1.6"/><path d="M1.8 8h12.4"/><circle class="ci-clasp" cx="8" cy="8" r="0.9"/></svg>',
            phone: '<svg class="chip-ico ci-phone" viewBox="0 0 16 16" aria-hidden="true"><path class="ci-handset" d="M3.2 2h2.4l1.1 3-1.5 1c.7 1.5 1.8 2.6 3.3 3.3l1-1.5 3 1.1v2.4c0 .7-.6 1.2-1.3 1.2C6.7 13.3 2.7 9.3 2 3.3 2 2.600 2.500 2 3.200 2z"/><path class="ci-wave ci-w1" d="M10 2.6c1.8.4 3 1.600 3.400 3.400"/><path class="ci-wave ci-w2" d="M9.800 4.800c.9.200 1.500.8 1.700 1.700"/></svg>'
        };

        // Rich, instant local replies (no network) so the quick actions always feel immediate
        function chipReplies() {
            const onHome = !!document.getElementById('projects');
            const projectsHref = onHome ? '#projects' : (location.pathname.indexOf('/projects/') !== -1 ? './' : './index.html#projects');
            const cvEl = document.getElementById('hero-link-cv');
            const cvHref = cvEl ? cvEl.getAttribute('href') : ((location.pathname.indexOf('/projects/') !== -1 ? '../' : './') + 'uploads/Mehedi_Hasan_CV.pdf?v=2');
            const wa = (msg) => 'https://wa.me/8801799447594?text=' + encodeURIComponent(msg);
            const act = (href, label, ext) => `<a class="chat-action" href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}>${label}</a>`;
            return {
                about: {
                    q: 'Who is Mehedi?',
                    a: `I'm <strong>Mehedi Hasan</strong>, an AI-native software engineer.<br>I design distributed systems (NestJS, Kafka, PostgreSQL) and AI agents (LangGraph, MCP, local LLMs), with 4+ years in production.<div class="chat-actions">${act(cvHref, 'Download my CV')}</div>`
                },
                projects: {
                    q: 'View Projects',
                    a: `A few things I've built:<br>• <strong>SAWAB NGO ERP</strong> — HR, payroll, grants and accounts (live demo)<br>• <strong>HR &amp; Payroll</strong> — BD compliance suite<br>• <strong>Karbar ERP</strong> — VAT &amp; payroll<br>• <strong>Autonomous AI swarms</strong> — local LLM sandbox<div class="chat-actions">${act(projectsHref, 'See my projects')}</div>`
                },
                hire: {
                    q: 'Hire / Collaborate',
                    a: `I'm open to <strong>freelance &amp; contract</strong> work: AI agents, ERP and enterprise systems, cloud and automation.<br>The quickest start is a short brief: scope, timeline and budget.<div class="chat-actions">${act(wa('Hi Mehedi, I would like to discuss a project.'), 'Message me on WhatsApp', true)}</div>`
                },
                call: {
                    q: 'Book a Call',
                    a: `Happy to talk! Message me on WhatsApp and we'll pick a time that suits you.<div class="chat-actions">${act(wa('Hi Mehedi, I would like to book a call.'), 'Book a call on WhatsApp', true)}</div>`
                }
            };
        }

        // Instant, hand-written answers (no network) for the two action intents
        const QUICK = [
            { key: 'hire', text: 'Hire / Collaborate', bn: 'কাজের প্রস্তাব', icon: CHIP_ICONS.briefcase },
            { key: 'call', text: 'Book a Call', bn: 'কল বুক করুন', icon: CHIP_ICONS.phone }
        ];
        const SPARK = '<svg class="chip-ico ci-spark" viewBox="0 0 16 16" aria-hidden="true"><path d="M7.5 1.8c.4 2.9 1.3 3.8 4.2 4.2-2.9.4-3.8 1.3-4.2 4.2-.4-2.9-1.3-3.8-4.2-4.2 2.9-.4 3.8-1.3 4.2-4.2z"/><path d="M12.6 9.6c.2 1.2.6 1.6 1.8 1.8-1.2.2-1.6.6-1.8 1.8-.2-1.2-.6-1.6-1.8-1.8 1.2-.2 1.6-.6 1.8-1.8z"/></svg>';
        const TARGET = '<svg class="chip-ico ci-target" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.2"/><circle class="ci-ring" cx="8" cy="8" r="3.4"/><circle class="ci-dot" cx="8" cy="8" r="0.9"/></svg>';

        // Questions that suit the page the visitor is on; these go to the real AI
        const PAGE_PROMPTS = {
            home: { en: ['Introduce yourself in 30 seconds', 'What makes you different?', 'What are you building right now?'],
                    bn: ['৩০ সেকেন্ডে নিজের পরিচয় দিন', 'আপনাকে অন্যদের থেকে আলাদা করে কী?', 'এখন কী নিয়ে কাজ করছেন?'] },
            profile: { en: ['Summarize your experience', 'What are your strongest skills?', 'How have you used AI at work?'],
                       bn: ['আপনার অভিজ্ঞতার সারসংক্ষেপ দিন', 'আপনার সবচেয়ে শক্তিশালী দক্ষতা কী?', 'কাজে AI কীভাবে ব্যবহার করেছেন?'] },
            projects: { en: ['Which project was the hardest?', 'How did you build Karbar ERP?', 'Which of your projects use AI?'],
                        bn: ['সবচেয়ে কঠিন প্রজেক্ট কোনটা ছিল?', 'Karbar ERP কীভাবে বানিয়েছেন?', 'কোন প্রজেক্টে AI আছে?'] },
            stack: { en: ['Why NestJS with Kafka?', 'How deep is your AI stack?', 'What do you use for DevOps?'],
                     bn: ['NestJS আর Kafka কেন?', 'আপনার AI স্ট্যাক কতটা গভীর?', 'DevOps-এ কী ব্যবহার করেন?'] },
            architecture: { en: ['How do you approach system design?', 'How do you keep systems reliable?', 'Walk me through the NGO ERP'],
                            bn: ['সিস্টেম ডিজাইন কীভাবে করেন?', 'সিস্টেম নির্ভরযোগ্য রাখেন কীভাবে?', 'NGO ERP-টা বুঝিয়ে বলুন'] },
            library: { en: ['What are you learning right now?', 'Which AI tools do you use daily?', 'Recommend a channel from your list'],
                       bn: ['এখন কী শিখছেন?', 'প্রতিদিন কোন AI টুল ব্যবহার করেন?', 'আপনার তালিকা থেকে একটা চ্যানেল সাজেস্ট করুন'] },
            contact: { en: ["What's the best way to reach you?", 'Are you open to freelance work?', 'Do you work remotely?'],
                       bn: ['যোগাযোগের সবচেয়ে ভালো উপায় কী?', 'ফ্রিল্যান্স কাজ করেন?', 'রিমোটে কাজ করেন?'] }
        };
        const pageKey = () => {
            const p = location.pathname;
            const hit = ['profile', 'projects', 'stack', 'architecture', 'library', 'contact'].find((k) => p.indexOf('/' + k + '/') !== -1);
            return hit || 'home';
        };
        const EXAMPLES = {
            en: ['Have you used Kafka in production?', 'Can you build a RAG system?', 'Do you work remotely?', 'Tell me a joke', 'What did you build at Jibika?', 'Which LLMs have you shipped with?'],
            bn: ['প্রোডাকশনে Kafka ব্যবহার করেছেন?', 'RAG সিস্টেম বানাতে পারেন?', 'রিমোটে কাজ করেন?', 'একটা জোক শোনান', 'Jibika-তে কী বানিয়েছেন?', 'কোন কোন LLM নিয়ে কাজ করেছেন?']
        };
        // What this visitor seems to be here for (read in the browser by ai-orb-mascot.js); null until it is clear
        const visitor = () => { try { return window.MehediVisitor ? window.MehediVisitor.profile() : null; } catch (e) { return null; } };
        const PERSONA_PROMPTS = {
            recruiter: { en: ['Give me your pitch in 3 lines', 'Why should I hire you?'], bn: ['৩ লাইনে নিজের পিচ দিন', 'আপনাকে কেন নেব?'] },
            technical: { en: ['Walk me through your hardest architecture', 'How do you build AI agents?'], bn: ['সবচেয়ে কঠিন আর্কিটেকচারটা বুঝিয়ে বলুন', 'AI এজেন্ট কীভাবে বানান?'] },
            client: { en: ['What kind of projects do you take on?', 'How do you work with clients?'], bn: ['কেমন প্রজেক্ট নেন?', 'ক্লায়েন্টের সাথে কীভাবে কাজ করেন?'] },
            personal: { en: ['Tell me about yourself outside work', 'Tell me a joke'], bn: ['কাজের বাইরে আপনি কেমন মানুষ?', 'একটা জোক শোনান'] }
        };
        // Page questions, led by what this visitor is clearly into: a word they highlighted, then their persona
        function prompts(L) {
            const v = visitor(), base = PAGE_PROMPTS[pageKey()][L], out = [];
            if (v && v.selected && v.selectedTech) out.push(L === 'bn' ? `${v.selected} কীভাবে ব্যবহার করেন?` : `How do you use ${v.selected}?`);
            if (v && PERSONA_PROMPTS[v.persona]) out.push(...PERSONA_PROMPTS[v.persona][L]);
            base.forEach((q) => out.push(q));
            return [...new Set(out)].slice(0, 3);
        }
        const T = {
            en: { sub: 'Ask me anything about my work.', fitT: 'Discuss your project', fitS: "Tell me what you're building, I'll be honest if I can help", mode: 'Project discussion', end: 'End',
                  label: 'Suggested here', swap: 'বাংলায়', back: 'Welcome back', ask: 'Ask: ', fitAsk: "Tell me what you want to build. I'll compare it with my real projects and tell you honestly whether I can do it.", steps: ['Describe your idea', 'Get an honest fit check', 'Send me the brief'], exLabel: 'Or start from an example',
                  fitPh: 'e.g. An HR app with AI reports, React + NestJS, 3 months', fitOff: "I can't review projects here right now, but I read every brief myself. Send it to me directly:" },
            bn: { sub: 'আমার কাজ নিয়ে যা খুশি জিজ্ঞেস করুন।', fitT: 'আপনার প্রজেক্ট নিয়ে আলোচনা', fitS: 'কী বানাতে চান বলুন, পারব কিনা সৎভাবে জানাব', mode: 'প্রজেক্ট আলোচনা', end: 'শেষ করুন',
                  label: 'এই পাতার জন্য', swap: 'English', back: 'আবার স্বাগতম', ask: 'জিজ্ঞেস করুন: ', fitAsk: 'কী বানাতে চান লিখুন। আমার আসল প্রজেক্টের সাথে মিলিয়ে সৎভাবে জানাব আমি এটা করতে পারব কিনা।', steps: ['আইডিয়া লিখুন', 'সৎ মূল্যায়ন পান', 'আমাকে ব্রিফ পাঠান'], exLabel: 'অথবা একটা উদাহরণ দিয়ে শুরু করুন',
                  fitPh: 'যেমন: AI রিপোর্টসহ একটা HR অ্যাপ, React + NestJS, ৩ মাস', fitOff: 'এই মুহূর্তে এখানে প্রজেক্ট রিভিউ করা যাচ্ছে না, তবে প্রতিটা ব্রিফ আমি নিজে পড়ি। সরাসরি পাঠান:' }
        };
        const EX_ICONS = {
            store: '<svg class="chip-ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 2.5h2l1.6 7.2h7.4l1.5-5.2H4.2"/><circle cx="6.5" cy="12.8" r="1"/><circle cx="11.5" cy="12.8" r="1"/></svg>',
            bot: '<svg class="chip-ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 3h11v7.5h-6l-3 2.5v-2.5h-2z"/><path d="M8 5.2v2.6M6.7 6.5h2.6"/></svg>',
            team: '<svg class="chip-ico" viewBox="0 0 16 16" aria-hidden="true"><circle cx="6" cy="5.5" r="2.2"/><path d="M2 13c.4-2.4 2-3.7 4-3.7s3.6 1.3 4 3.7"/><path d="M10.6 3.5a2 2 0 0 1 0 4M12 9.5c1.3.4 2.2 1.6 2.5 3.5"/></svg>',
            pin: '<svg class="chip-ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 14.2s-4.6-4.3-4.6-7.7a4.6 4.6 0 0 1 9.2 0c0 3.4-4.6 7.7-4.6 7.7z"/><circle cx="8" cy="6.5" r="1.6"/></svg>'
        };
        const PROJECT_EXAMPLES = {
            en: [
                { i: 'store', label: 'Online store', text: 'An online store for my clothing brand with bKash and Nagad payments, inventory and an admin panel. Around 500 products.' },
                { i: 'bot', label: 'AI chatbot', text: 'An AI chatbot on our website that answers customer questions from our company documents and policies.' },
                { i: 'team', label: 'HR & payroll', text: 'An HR and payroll system for 150 employees with attendance, leave, salary sheets and tax deductions.' },
                { i: 'pin', label: 'Delivery app', text: 'A mobile app for 30 delivery riders with live GPS tracking, order status and an admin dashboard.' }
            ],
            bn: [
                { i: 'store', label: 'অনলাইন স্টোর', text: 'আমার পোশাকের ব্র্যান্ডের জন্য একটা অনলাইন স্টোর, bKash ও Nagad পেমেন্ট, স্টক ম্যানেজমেন্ট আর অ্যাডমিন প্যানেলসহ। প্রায় ৫০০টা পণ্য।' },
                { i: 'bot', label: 'AI চ্যাটবট', text: 'আমাদের ওয়েবসাইটে একটা AI চ্যাটবট, যেটা কোম্পানির ডকুমেন্ট আর নীতিমালা থেকে কাস্টমারের প্রশ্নের উত্তর দেবে।' },
                { i: 'team', label: 'HR ও পেরোল', text: '১৫০ জন কর্মীর জন্য HR ও পেরোল সিস্টেম: হাজিরা, ছুটি, বেতন শিট আর ট্যাক্স কাটা।' },
                { i: 'pin', label: 'ডেলিভারি অ্যাপ', text: '৩০ জন ডেলিভারি রাইডারের জন্য মোবাইল অ্যাপ: লাইভ GPS ট্র্যাকিং, অর্ডার স্ট্যাটাস আর অ্যাডমিন ড্যাশবোর্ড।' }
            ]
        };
        const prefs = {
            get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
            set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }
        };
        const lang = () => (prefs.get('chat:lang') === 'bn' ? 'bn' : 'en');
        // Project discussion stays on for the whole conversation (and across pages) until ended
        let fitMode = !!store.get('chat:project', false);
        const brief = () => String(store.get('chat:brief', '') || '');
        const modeBar = document.createElement('div');
        modeBar.className = 'chat-mode-bar';
        modeBar.hidden = true;
        const inputArea = chatWidget.querySelector('.chat-input-area');
        if (inputArea) inputArea.before(modeBar);
        function setProject(on) {
            fitMode = on; store.set('chat:project', on);
            if (!on) store.set('chat:brief', '');
            chatWidget.classList.toggle('is-fit', on);
            const t = T[lang()];
            modeBar.hidden = !on;
            modeBar.innerHTML = `<span>${TARGET}${t.mode}</span><button type="button">${t.end}</button>`;
            modeBar.querySelector('button').onclick = () => { setProject(false); followUps(); chatInput.focus({ preventScroll: true }); };
            if (on) chatInput.placeholder = t.fitPh; else rotatePlaceholder(true);
        }

        // The conversation has started: the intro shrinks and the starters step aside
        function beginThread() {
            const hero = chatBody.querySelector('.chat-hero');
            if (hero) hero.classList.add('is-compact');
            chatBody.querySelectorAll('.chat-starters').forEach((n) => n.remove());
        }

        function askStarter(key) {
            if (chatWidget.classList.contains('is-busy')) return;
            const reply = chipReplies()[key];
            if (!reply) return;
            beginThread(); markUsed(key); setBusy(true);
            if (typeof playSound === 'function') playSound('type');
            appendMsg(esc(reply.q), 'user', true); remember('user', esc(reply.q), reply.q);
            const mascot = getMascot();
            if (mascot) mascot.setExpression('thinking');
            const typingEl = appendMsg('<span class="chat-dots" aria-label="Typing"><i></i><i></i><i></i></span>', 'bot', true);
            typingEl.classList.add('typing-indicator');
            setTimeout(() => {
                typingEl.classList.remove('typing-indicator');
                typingEl.innerHTML = reply.a; settle(typingEl);
                remember('bot', reply.a, typingEl.textContent);
                setBusy(false); followUps();
                if (mascot) mascot.triggerReaction('excited', 1600);
            }, 650);
        }

        // A suggested question goes to the AI exactly as if the visitor typed it
        function askAI(q) {
            if (chatWidget.classList.contains('is-busy')) return;
            if (typeof playSound === 'function') playSound('pop');
            markUsed(q);
            chatInput.value = q; syncComposer();
            sendChat();
        }

        // Fit check: ask for the brief, then the next message is assessed against his real work
        function startFit() {
            if (chatWidget.classList.contains('is-busy')) return;
            const t = T[lang()];
            // the box is focused for a mouse only, as when the chat opens: on a phone the keyboard would cover the steps
            // and the examples; the visitor taps the box (or an example) when ready
            const typeHere = () => { if (window.matchMedia('(pointer: fine)').matches) chatInput.focus({ preventScroll: true }); };
            if (fitMode) { typeHere(); return; }
            beginThread(); markUsed('fit');
            setProject(true);
            const msg = appendMsg(`<p class="chat-fit-ask">${TARGET}<span>${esc(t.fitAsk)}</span></p><ol class="chat-steps">${t.steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>`, 'bot', true);
            settle(msg); remember('bot', msg.innerHTML, t.fitAsk);
            followUps();
            typeHere();
            const mascot = getMascot();
            if (mascot) mascot.triggerReaction('happy', 1200);
        }

        function createSmartButtons() {
            const t = T[lang()], L = lang();
            const box = document.createElement('div');
            box.className = 'chat-starters';
            const fit = document.createElement('button');
            fit.type = 'button'; fit.className = 'chat-fit-card'; fit.style.setProperty('--i', 0);
            fit.innerHTML = `<span class="cs-ico">${TARGET}</span><span class="cs-text"><b>${t.fitT}</b><small>${t.fitS}</small></span><span class="cs-go" aria-hidden="true">\u2192</span>`;
            fit.onclick = startFit;
            box.appendChild(fit);
            prompts(L).forEach((q, i) => {
                const b = document.createElement('button');
                b.type = 'button'; b.className = 'chat-prompt'; b.style.setProperty('--i', i + 1);
                b.innerHTML = `${SPARK}<span>${esc(q)}</span>`;
                b.onclick = () => askAI(q);
                box.appendChild(b);
            });
            return box;
        }

        function projectExamples() {
            const t = T[lang()];
            const box = document.createElement('div');
            box.className = 'chat-followups chat-examples';
            box.setAttribute('role', 'group'); box.setAttribute('aria-label', t.exLabel);
            box.innerHTML = `<p class="chat-examples-label">${esc(t.exLabel)}</p>`;
            PROJECT_EXAMPLES[lang()].forEach((x) => {
                const b = document.createElement('button');
                b.type = 'button'; b.className = 'chat-example';
                b.style.setProperty('--i', PROJECT_EXAMPLES[lang()].indexOf(x));
                b.innerHTML = `<span class="ex-ico">${EX_ICONS[x.i]}</span><span>${esc(x.label)}</span>`;
                b.onclick = () => {
                    chatInput.value = x.text; syncComposer();
                    chatInput.focus({ preventScroll: true });
                    chatInput.setSelectionRange(x.text.length, x.text.length);
                    if (inputArea) { inputArea.classList.remove('is-prefilled'); void inputArea.offsetWidth; inputArea.classList.add('is-prefilled'); }
                };
                box.appendChild(b);
            });
            chatBody.appendChild(box);
            chatBody.scrollTop = chatBody.scrollHeight;
        }

        function followUps(nexts) {
            chatBody.querySelectorAll('.chat-followups').forEach((n) => n.remove());
            if (fitMode && !(nexts && nexts.length) && !brief()) { projectExamples(); return; }
            const used = store.get(USED_KEY, []);
            const items = [];
            (nexts || []).forEach((q) => items.push({ html: `${SPARK}<span>${esc(q)}</span>`, go: () => askAI(q), ai: true }));
            if (!items.length && !fitMode) {
                prompts(lang()).filter((q) => !used.includes(q)).slice(0, 2)
                    .forEach((q) => items.push({ html: `${SPARK}<span>${esc(q)}</span>`, go: () => askAI(q), ai: true }));
                if (!used.includes('fit') && !fitMode) items.push({ html: `${TARGET}<span>${esc(T[lang()].fitT)}</span>`, go: startFit });
                QUICK.filter((x) => !used.includes(x.key))
                    .forEach((x) => items.push({ html: `${x.icon}<span>${lang() === 'bn' ? x.bn : x.text}</span>`, go: () => askStarter(x.key) }));
            }
            if (!items.length) return;
            const row = document.createElement('div');
            row.className = 'chat-followups';
            row.setAttribute('role', 'group'); row.setAttribute('aria-label', 'Suggested questions');
            items.slice(0, 3).forEach((x) => {
                const b = document.createElement('button');
                b.type = 'button'; b.className = 'chat-followup' + (x.ai ? ' is-ai' : '');
                b.innerHTML = x.html;
                b.onclick = x.go;
                row.appendChild(b);
            });
            chatBody.appendChild(row);
            chatBody.scrollTop = chatBody.scrollHeight;
        }

        function hello() {
            if (lang() === 'bn') return 'আসসালামু আলাইকুম';
            const h = new Date().getHours();
            return h < 5 ? 'Up late?' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
        }
        // The opening line reads the visit like the greeting does: returning, referrer, pages, page, hour
        function heroText() {
            const bn = lang() === 'bn';
            const num = (v) => Number(v) || 0;
            const ssGet = (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } };
            const visits = num(prefs.get('greet:visits')), awayRaw = ssGet('greet:away'), away = awayRaw === null ? null : num(awayRaw);
            const pages = num(ssGet('greet:pages')), from = ssGet('greet:from'), page = pageKey(), h = new Date().getHours();
            const ask = bn ? 'আমার কাজ নিয়ে যা খুশি জিজ্ঞেস করুন।' : 'Ask me anything about my work.';
            if (visits > 1 && away !== null) {
                if (away > 1) return { title: bn ? 'আবার স্বাগতম!' : 'Welcome back!', sub: bn ? `${away} দিন পর দেখা হলো। কী জানতে চান?` : `It's been ${away} days. What would you like to know?` };
                return { title: bn ? 'আবার স্বাগতম!' : 'Welcome back!', sub: bn ? 'আবার দেখা হয়ে ভালো লাগলো। ' + ask : 'Good to see you again. ' + ask };
            }
            const v = visitor();
            if (v && v.selected && v.selectedTech) return { title: hello(), sub: bn ? `“${v.selected}” হাইলাইট করেছেন দেখলাম। আমি এটা কীভাবে ব্যবহার করি, জিজ্ঞেস করুন।` : `I saw you highlight “${v.selected}”. Ask me how I use it.` };
            if (v && v.revisited) return { title: hello(), sub: bn ? `${v.revisited}-এ বারবার ফিরে আসছেন। এটা নিয়ে যা খুশি জিজ্ঞেস করুন।` : `You keep coming back to ${v.revisited}. Ask me anything about it.` };
            if (from) return { title: hello(), sub: bn ? `${from} থেকে আসার জন্য ধন্যবাদ। ` + ask : `Thanks for coming over from ${from}. ` + ask };
            if (v && v.persona === 'personal') return { title: hello(), sub: bn ? 'কাজ ছাড়াও আমাকে নিয়ে যা খুশি জিজ্ঞেস করুন, একটা জোকও চাইতে পারেন।' : 'Ask me anything, work or not. You can even ask for a joke.' };
            if (page === 'projects') return { title: hello(), sub: bn ? 'আমার প্রজেক্ট দেখছেন? যেকোনোটার পেছনের গল্প জিজ্ঞেস করুন।' : 'Looking at my projects? Ask me the story behind one.' };
            if (pages >= 3) return { title: hello(), sub: bn ? `${pages}টা পাতা ঘুরে দেখেছেন। কী খুঁজছেন, বলুন?` : `You've explored ${pages} pages. What can I help you find?` };
            if (h < 5) return { title: bn ? 'এত রাতে জেগে?' : 'Up late?', sub: ask };
            return { title: hello(), sub: ask };
        }

        function renderHome() {
            const ht = heroText();
            chatBody.innerHTML = '';
            const hero = document.createElement('div');
            hero.className = 'chat-hero';
            hero.innerHTML = `<span class="chat-hero-orb" aria-hidden="true"><ai-orb-mascot expression="happy" size="52"></ai-orb-mascot></span>`
                + `<h3 class="chat-hero-title">${esc(ht.title)} <span class="chat-wave" aria-hidden="true">\u{1F44B}</span></h3>`
                + `<p class="chat-hero-sub">${esc(ht.sub)}</p>`;
            chatBody.appendChild(hero);
            syncLangBtn();
            const log = store.get(LOG_KEY, []);
            if (!log.length) { chatBody.appendChild(createSmartButtons()); return; }
            hero.classList.add('is-compact');
            log.forEach((m) => (Array.isArray(m.h) ? m.h : [m.h]).forEach((h) => appendMsg(h, m.r, true)));
            followUps();
        }

        // The placeholder cycles through real example questions while the box is empty
        let phIndex = 0, phTimer = null;
        function rotatePlaceholder(now) {
            clearTimeout(phTimer);
            const tick = () => {
                if (chatWidget.classList.contains('chat-expanded') && !fitMode && !chatInput.value && document.visibilityState === 'visible') {
                    const list = EXAMPLES[lang()];
                    chatInput.placeholder = T[lang()].ask + list[phIndex++ % list.length];
                }
                phTimer = setTimeout(tick, 3400);
            };
            if (now) tick(); else phTimer = setTimeout(tick, 3400);
        }
        rotatePlaceholder(true);
        if (fitMode) setProject(true);
        chatHeader.addEventListener('click', () => { if (chatWidget.classList.contains('chat-expanded')) { prefs.set('chat:seen', String(Date.now())); rotatePlaceholder(true); } });

        const langBtn = document.getElementById('chat-lang');
        function syncLangBtn() {
            if (!langBtn) return;
            const bn = lang() === 'bn';
            langBtn.textContent = bn ? 'EN' : 'বাং';
            langBtn.title = bn ? 'Switch to English' : 'বাংলায় দেখুন';
            langBtn.setAttribute('aria-label', langBtn.title);
            langBtn.setAttribute('lang', bn ? 'en' : 'bn');
        }
        if (langBtn) langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            prefs.set('chat:lang', lang() === 'bn' ? 'en' : 'bn');
            const log = store.get(LOG_KEY, []);
            if (log.length) { const sub = chatBody.querySelector('.chat-hero-sub'); if (sub) sub.textContent = T[lang()].sub; followUps(); syncLangBtn(); }
            else renderHome();
            if (fitMode) setProject(true); else rotatePlaceholder(true);
        });

        const resetBtn = document.getElementById('chat-reset');
        if (resetBtn) resetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (chatWidget.classList.contains('is-busy')) return;
            store.set(LOG_KEY, []); store.set(USED_KEY, []);
            setProject(false);
            renderHome();
            const mascot = getMascot();
            if (mascot) mascot.triggerReaction('happy', 1200);
            if (window.matchMedia('(pointer: fine)').matches) chatInput.focus({ preventScroll: true });
        });

        // Initial Clean Chat Greeting
        setTimeout(() => {
            if (chatBody) renderHome();
        }, 150);

        // ── CHAT WORKER (streaming) ───────────────────────────────────────────────
        const chatApi = () => String(window.MEHEDI_CHAT_API || CHAT_API_URL || '').replace(/\/+$/, '');
        const TAG_RE = /\[\[(src|act|next|fit):([^\]]{1,120})\]\]/g;
        // the model ends with [[src:/page/]] [[act:cv]] tags: never show them, not even half-streamed
        const visible = (raw) => raw.replace(TAG_RE, '').replace(/\[\[?[^\]]*$/, '').trim();
        const SITE_PAGES = { '/': 'Home', '/profile/': 'Profile', '/projects/': 'Projects', '/stack/': 'Stack', '/architecture/': 'Architecture', '/people/': 'People', '/contact/': 'Contact', '/library/': 'Library' };
        const siteRoot = () => {
            const l = document.querySelector('a.logo-link');
            return l ? new URL(l.getAttribute('href'), location.href).href.replace(/index\.html$/, '').replace(/#.*$/, '') : location.origin + '/';
        };
        const waHref = (msg) => 'https://wa.me/8801799447594?text=' + encodeURIComponent(msg);
        const FIT_LABEL = {
            en: { strong: 'Strong fit', good: 'Good fit', partial: 'Partial fit', low: 'Low fit' },
            bn: { strong: 'খুব উপযুক্ত', good: 'উপযুক্ত', partial: 'আংশিক উপযুক্ত', low: 'কম উপযুক্ত' }
        };
        const FIT_LEVEL = { strong: 4, good: 3, partial: 2, low: 1 };
        function actionLinks() {
            const root = siteRoot();
            const cvEl = document.getElementById('hero-link-cv');
            const act = (href, label, ext) => `<a class="chat-action" href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}>${label}</a>`;
            return {
                cv: act(cvEl ? cvEl.getAttribute('href') : root + 'uploads/Mehedi_Hasan_CV.pdf?v=2', 'Download CV'),
                whatsapp: act('https://wa.me/8801799447594?text=' + encodeURIComponent('Hi Mehedi, I found you through your portfolio.'), 'WhatsApp', true),
                email: act('mailto:mehedihasan228.cse@gmail.com', 'Email'),
                projects: act(root + 'projects/', 'See projects'),
                contact: act(root + 'contact/', 'Contact')
            };
        }
        function addExtras(first, last, raw, opts = {}) {
            const tags = [...raw.matchAll(TAG_RE)].map((m) => [m[1], m[2].trim()]);
            const links = actionLinks();
            if (opts.brief) {
                links.whatsapp = `<a class="chat-action" href="${waHref('Hi Mehedi, I discussed my project with your portfolio AI. My project: ' + opts.brief.slice(0, 600))}" target="_blank" rel="noopener">${opts.bn ? 'আমাকে ব্রিফ পাঠান' : 'Send me this brief'}</a>`;
            }
            const fit = (tags.find((t) => t[0] === 'fit') || [])[1];
            let acts = [...new Set(tags.filter((t) => t[0] === 'act').map((t) => t[1]))].filter((k) => links[k]);
            if (opts.brief && fit) acts = ['whatsapp'];
            if (!acts.length && /whats\s?app|হোয়াটসঅ্যাপ/i.test(visible(raw))) acts = ['whatsapp'];
            acts = acts.slice(0, 1);
            const srcs = [...new Set(tags.filter((t) => t[0] === 'src').map((t) => t[1]))].filter((p) => SITE_PAGES[p]).slice(0, 2);
            if (fit && FIT_LEVEL[fit.toLowerCase()]) {
                const k = fit.toLowerCase(), v = document.createElement('div');
                v.className = 'chat-fit-verdict is-' + k;
                v.style.setProperty('--lvl', FIT_LEVEL[k]);
                v.innerHTML = `<span class="fv-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span><b>${FIT_LABEL[opts.bn ? 'bn' : 'en'][k]}</b>`;
                first.prepend(v);
            }
            if (acts.length || srcs.length) {
                const row = document.createElement('div');
                row.className = 'chat-meta';
                row.innerHTML = (acts.length ? `<div class="chat-actions">${links[acts[0]]}</div>` : '<span></span>')
                    + (srcs.length ? `<span class="chat-src"><button type="button" class="chat-src-btn" aria-expanded="false" title="${opts.bn ? 'সূত্র' : 'Sources'}" aria-label="${opts.bn ? 'সূত্র দেখুন' : 'Show sources'}">i</button>`
                        + `<span class="chat-src-list" hidden>${srcs.map((p) => `<a href="${siteRoot() + p.replace(/^\//, '')}">${SITE_PAGES[p]}</a>`).join('')}</span></span>` : '');
                last.appendChild(row);
            }
            // one tag per question; some models put two in one tag, split by ";", "|" or ", What…"
            return [...new Set(tags.filter((t) => t[0] === 'next').flatMap((t) => t[1].split(/\s*[;|]\s*|,\s+(?=[A-Z])/)).map((q) => q.trim()))]
                .filter((q) => q.length > 3).slice(0, 2);
        }
        chatBody.addEventListener('click', (e) => {
            const b = e.target.closest('.chat-src-btn');
            if (!b) return;
            const list = b.nextElementSibling, open = b.getAttribute('aria-expanded') !== 'true';
            b.setAttribute('aria-expanded', String(open)); if (list) list.hidden = !open;
        });

        async function streamFromWorker(txt, history, el, mascot, mode) {
            const ctrl = new AbortController();
            let timer = setTimeout(() => ctrl.abort(), 20000);
            const res = await fetch(chatApi() + '/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: ctrl.signal,
                body: JSON.stringify({
                    page: location.pathname,
                    mode: mode || undefined,
                    visitor: (() => { try { return window.MehediVisitor ? window.MehediVisitor.line() : undefined; } catch (e) { return undefined; } })(),
                    messages: [...history.map((m) => ({ role: m.r === 'user' ? 'user' : 'assistant', content: m.t })), { role: 'user', content: txt }]
                })
            });
            if (!res.ok || !res.body) { clearTimeout(timer); throw new Error('Chat worker ' + res.status); }

            const reader = res.body.getReader(), dec = new TextDecoder();
            let buf = '', raw = '', started = false, frame = 0;
            // each blank-line paragraph becomes its own bubble, like a person sending a few short messages
            const bubbles = [el];
            const parts = () => {
                const v = visible(raw).split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
                return v.length > 3 ? [v[0], v[1], v.slice(2).join('\n')] : v;
            };
            const paint = () => {
                frame = 0;
                parts().forEach((seg, i) => {
                    let b = bubbles[i];
                    if (!b) {
                        bubbles[i - 1].classList.remove('is-streaming');
                        b = appendMsg('', 'bot', true); b.classList.add('is-streaming', 'is-new');
                        bubbles.push(b);
                        if (typeof playSound === 'function') playSound('message');
                    }
                    b.innerHTML = formatReply(seg);
                });
                chatBody.scrollTop = chatBody.scrollHeight;
            };
            try {
                for (;;) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    clearTimeout(timer); timer = setTimeout(() => ctrl.abort(), 15000);   // stalled stream
                    buf += dec.decode(value, { stream: true });
                    const lines = buf.split('\n'); buf = lines.pop();
                    for (const line of lines) {
                        const l = line.trim();
                        if (!l.startsWith('data:')) continue;
                        const data = l.slice(5).trim();
                        if (!data || data === '[DONE]') continue;
                        try {
                            const c = JSON.parse(data).choices;
                            const d = c && c[0] && (c[0].delta || c[0].message);
                            if (d && typeof d.content === 'string') raw += d.content;
                        } catch (e) { /* keep-alive or partial line */ }
                    }
                    if (!started && visible(raw)) {
                        started = true;
                        el.classList.remove('typing-indicator'); el.classList.add('is-streaming');
                        if (mascot) mascot.setExpression('responding');
                        if (typeof playSound === 'function') playSound('message');
                    }
                    if (started && !frame) frame = requestAnimationFrame(paint);
                }
            } catch (e) {
                if (!visible(raw)) throw e;       // nothing arrived: let the fallback answer instead
            } finally {
                clearTimeout(timer);
            }
            if (!visible(raw)) throw new Error('Empty reply');
            if (frame) cancelAnimationFrame(frame);
            paint();
            while (bubbles.length > Math.max(1, parts().length)) bubbles.pop().remove();
            bubbles.forEach((b) => b.classList.remove('is-streaming'));
            const bn = /[\u0980-\u09FF]/.test(txt);
            const nexts = addExtras(bubbles[0], bubbles[bubbles.length - 1], raw, { brief: mode === 'fit' ? brief() : '', bn });
            return { text: visible(raw), nexts, html: bubbles.map((b) => b.innerHTML) };
        }

        const BYE_RE = /^(thanks?( a lot| so much)?|thank you( so much)?|thx|ty|bye|good ?bye|see you|ok(ay)?,? thanks?|cheers|ধন্যবাদ|অনেক ধন্যবাদ|থ্যাংক ?(স|ইউ)|বাই|আল্লাহ ?হাফেজ|আচ্ছা,? ধন্যবাদ)[\s!.।]*$/i;
        function goodbye(txt) {
            const bn = /[\u0980-\u09FF]/.test(txt);
            const lines = bn ? ['আপনাকেও ধন্যবাদ! যেকোনো সময় আবার আসবেন 👋', 'খুশি হলাম সাহায্য করতে পেরে। ভালো থাকবেন!']
                             : ["You're welcome! Come back anytime 👋", 'Glad I could help. Take care!', 'Anytime! Good luck with what you are building 👋'];
            beginThread(); setBusy(true);
            appendMsg(txt, 'user'); remember('user', esc(txt), txt);
            const dots = appendMsg('<span class="chat-dots" aria-label="Typing"><i></i><i></i><i></i></span>', 'bot', true);
            dots.classList.add('typing-indicator');
            setTimeout(() => {
                const line = lines[Math.floor(Math.random() * lines.length)];
                dots.classList.remove('typing-indicator'); dots.innerHTML = `<p>${esc(line)}</p>`; settle(dots);
                remember('bot', dots.innerHTML, line);
                setBusy(false);
                if (typeof playSound === 'function') playSound('message');
                const mascot = getMascot();
                if (mascot) mascot.triggerReaction('happy', 1800);
                // tuck the panel away unless the visitor is still busy with it
                setTimeout(() => {
                    if (chatWidget.classList.contains('chat-expanded') && !chatInput.value && !chatWidget.matches(':hover')) toggleChat();
                }, 4500);
            }, 750);
        }

        // The greeting bubble hands its conversation over when the visitor opens the chat from it
        window.MehediChat = {
            importGreeting(lines) {
                if (!Array.isArray(lines) || !lines.length) return;
                lines.forEach((l) => remember(l.mine ? 'user' : 'bot', `<p>${esc(l.text)}</p>`, l.text));
                renderHome();
            },
            // the greeting's replies continue here with a real AI answer or the project discussion
            ask(q) { if (q) askAI(q); },
            // for other parts of the page that ask a question (the home dashboard's tools)
            open() { if (chatWidget.classList.contains('chat-collapsed')) toggleChat(); },
            lang: () => lang(),
            discuss() { startFit(); }
        };

        // When no AI answers (the Worker and the free service are both down, e.g. the Gemini credits run out), say so in
        // the visitor's language, then give the sentences of the site's own knowledge file (the one the AI reads) that
        // match the question, with a way to ask Mehedi himself. Small talk, contact and prices keep their set replies.
        let siteSentences = null, siteProjects = [];
        const OFF_STOP = new Set(("how does do did doing what which who whom whose why when where is are was were be been the a an and or of in on at " +
            "to for with about from into his her he him she they them mehedi mehedi's you your yours use uses used using work works working " +
            "can could would will tell me my please explain show give know hi hello hey thanks thank has have had any some").split(' '));
        const ruleKey = (txt) => Object.keys(KNOWLEDGE_BASE).find((k) => KNOWLEDGE_BASE[k].keywords.some((re) => re.test(txt)));
        // Bangla questions: their words point to the English ones the site is written in; tools are names (they lead)
        const BN_WORDS = [
            [/প্রজেক্ট|প্রকল্প/, 'projects'], [/অভিজ্ঞতা|কত বছর|কত দিন/, 'years experience'], [/দক্ষতা|স্কিল|পারেন/, 'skills stack'],
            [/পড়াশোনা|পড়াশুনা|শিক্ষা|ডিগ্রি|বিশ্ববিদ্যালয়|ভার্সিটি|গ্র্যাজুয়েশন/, 'education university degree'],
            [/চাকরি|কোম্পানি|অফিস|বর্তমানে|এখন কোথায়/, 'currently company role'], [/এনজিও/, 'NGO'], [/ভিডিও/, 'video'],
            [/এআই|কৃত্রিম বুদ্ধিমত্তা/, 'AI'], [/এজেন্ট/, 'agents agentic'], [/ইআরপি/, 'ERP'], [/এইচআর/, 'HR HRM'], [/বেতন|পে-?রোল/, 'payroll'],
            [/ভ্যাট|ট্যাক্স/, 'VAT tax'], [/মোবাইল|অ্যাপ/, 'mobile app'], [/ওয়েবসাইট|ওয়েব/, 'web platform'], [/ক্লাউড/, 'cloud'],
            [/ডাটাবেস|ডেটাবেস/, 'database'], [/অটোমেশন|স্বয়ংক্রিয়/, 'automation'], [/ফ্রিল্যান্স|হায়ার|ভাড়া/, 'freelance contract'],
            [/কোথায় থাকেন|ঠিকানা|শহর|দেশ/, 'Dhaka Bangladesh'], [/সার্টিফিকেট|সনদ|কোর্স/, 'certificate course'], [/গবেষণা|রিসার্চ/, 'research'],
            [/ডিজাইন|আর্কিটেকচার/, 'architecture design'], [/নিরাপত্তা|সিকিউরিটি/, 'security'], [/হাজিরা|অ্যাটেনডেন্স/, 'attendance'],
            [/রিয়্যাক্ট|রিঅ্যাক্ট/, 'React', 1], [/নেক্সট/, 'Next.js', 1], [/লারাভেল/, 'Laravel', 1], [/নেস্ট/, 'NestJS', 1], [/ফ্লাটার/, 'Flutter', 1],
            [/ডকার/, 'Docker', 1], [/কাফকা/, 'Kafka', 1], [/রেডিস/, 'Redis', 1], [/পাইথন/, 'Python', 1], [/টাইপস্ক্রিপ্ট/, 'TypeScript', 1],
            [/পোস্টগ্রে/, 'PostgreSQL', 1], [/জেমিনি/, 'Gemini', 1], [/ক্লড|ক্লদ/, 'Claude', 1], [/চ্যাটজিপিটি|ওপেনএআই/, 'OpenAI', 1],
            [/ল্যাংগ্রাফ/, 'LangGraph', 1], [/ফ্র্যাপে|ফ্রাপে/, 'Frappe', 1], [/কুবারনেটিস/, 'Kubernetes', 1], [/এডব্লিউএস/, 'AWS', 1]
        ];
        const BN_HELLO = /সালাম|হ্যালো|হাই\b|কেমন আছেন|কেমন আছো|শুভ (সকাল|সন্ধ্যা|রাত্রি)/;
        const BN_CONTACT = /যোগাযোগ|ফোন|নম্বর|ইমেইল|ই-মেইল|হোয়াটসঅ্যাপ|মেসেজ/;
        const BN_PRICE = /দাম|খরচ|রেট|কত টাকা|প্রাইস|চার্জ/;
        async function offlineReply(txt) {
            const bn = /[ঀ-৿]/.test(txt) || lang() === 'bn';
            const ask = `<div class="chat-actions"><a class="chat-action" href="${waHref((bn ? 'আসসালামু আলাইকুম, একটা প্রশ্ন ছিল: ' : 'Hi Mehedi, a question: ') + txt.slice(0, 400))}" target="_blank" rel="noopener">WhatsApp</a></div>`;
            let key = ruleKey(txt);
            if (BN_CONTACT.test(txt)) key = 'contact';
            else if (BN_PRICE.test(txt)) key = 'services';
            if (key === 'greetings' || BN_HELLO.test(txt)) {
                return formatReply(bn ? 'ভালো আছি, ধন্যবাদ! আমার AI এই মুহূর্তে একটু বিরতিতে আছে, তবে আমার কাজ, প্রজেক্ট বা স্কিল নিয়ে জিজ্ঞেস করলে আমার সাইট থেকে উত্তর দিতে পারব।' :
                    "Hi! My AI is taking a short break right now, but ask me about my work, projects or stack and I'll answer from my site.");
            }
            if (/^(smalltalk|contact|services)$/.test(key || '')) return formatReply(KNOWLEDGE_BASE[key].response);
            const own = txt.match(/[A-Za-z0-9][A-Za-z0-9.+#-]*[A-Za-z0-9+#]|[A-Za-z0-9]/g) || [];
            const mapped = [], mappedNames = [];
            BN_WORDS.forEach(([re, en, name]) => { if (re.test(txt)) en.split(' ').forEach((w) => { mapped.push(w); if (name) mappedNames.push(w.toLowerCase()); }); });
            const words = own.concat(mapped);
            const terms = [...new Set(words.map((w) => w.toLowerCase()).filter((w) => w.length > 1 && !OFF_STOP.has(w)))];
            // names (Kafka, MCP, Claude): capitalised past the first word, any Latin word in a Bangla question, or a tool
            // named in Bangla
            const names = new Set(own.filter((w, i) => /[\u0980-\u09FF]/.test(txt) || (i > 0 && /^[A-Z0-9]/.test(w)) || /[A-Z].*[A-Z]/.test(w))
                .map((w) => w.toLowerCase()).concat(mappedNames).filter((w) => terms.includes(w)));
            let hits = [];
            if (terms.length) {
                try {
                    if (siteSentences === null) {
                        // the knowledge file's prose, sentence by sentence, each with how much its page speaks for his own work
                        // (Profile, Projects, the stack and the architecture count more than the Library and People, which
                        // describe other people's work)
                        const r = await fetch('/ai/knowledge.md');
                        const text = r.ok ? await r.text() : '', seen = new Set();
                        let weight = 1, inProjects = false, project = null;
                        siteSentences = [];
                        text.split(/\n+/).forEach((l) => {
                            const h = l.match(/^#\s+(.*)/);
                            if (h) { weight = /^(Profile|Projects|Tech stack|Architecture|Home)/.test(h[1]) ? 1.4 : /^(Library|People)/.test(h[1]) ? 0.5 : 1; inProjects = /^Projects/.test(h[1]); return; }
                            // the Projects page: each ### heading is a project, the prose under it its description
                            const ph = inProjects && l.match(/^###\s+(.*)/);
                            if (ph) { project = { name: ph[1].trim(), desc: '' }; siteProjects.push(project); return; }
                            if (project && !project.desc && /[.,:;]/.test(l)) project.desc = l.trim();
                            if (/^\s*#/.test(l) || !/[.,:;]/.test(l) || l.trim().split(/\s+/).length < 8) return;   // prose, not headings or tag rows
                            l.replace(/^\s*[-*]\s+/, '').split(/(?<=[.!?])\s+/).forEach((s) => {
                                s = s.trim();
                                if (s.length > 30 && s.length < 320 && !seen.has(s)) { seen.add(s); siteSentences.push({ s, weight }); }
                            });
                        });
                    }
                    const has = (s, w) => new RegExp('(^|[^a-z0-9])' + w.replace(/[.+#-]/g, '\\$&') + '([^a-z0-9]|$)', 'i').test(s);
                    // a rare word (a tool's name) says more about the question than a common one ("projects")
                    const idf = {};
                    terms.forEach((w) => { const df = siteSentences.filter((x) => has(x.s, w)).length; idf[w] = df ? Math.log(1 + siteSentences.length / df) : 0; });
                    // the key word must be there: the rarest name in the question, else its rarest word; words that stand
                    // together in the question ("Claude Code")
                    // count more when they stand together in the sentence too
                    const pool = terms.filter((w) => idf[w] && names.has(w));
                    const key = (pool.length ? pool : terms.filter((w) => idf[w])).sort((a, b) => idf[b] - idf[a])[0];
                    const pairs = terms.slice(1).map((w, i) => terms[i] + ' ' + w);
                    hits = key ? siteSentences.filter((x) => has(x.s, key)).map((x) => ({ s: x.s, score: x.weight * (
                        terms.reduce((n, w) => n + (has(x.s, w) ? idf[w] : 0), 0) +
                        pairs.reduce((n, pr) => n + (x.s.toLowerCase().includes(pr) ? 4 : 0), 0)) }))
                        .sort((a, b) => b.score - a.score).slice(0, 2).map((x) => x.s) : [];
                } catch (e) { hits = []; }
            }
            // a general question about projects (no tool named): the projects themselves, by name
            if (siteProjects.length && !names.size && (terms.some((w) => /^(projects?|portfolio|products?)$/.test(w)) || /প্রজেক্ট|প্রকল্প/.test(txt))) {
                const short = (d) => { let s = d.split(/:\s|\s\(/)[0].trim(); if (s.length > 80) s = s.slice(0, 80).replace(/[\s,]+\S*$/, '') + '…'; return s; };
                const list = siteProjects.slice(0, 6).map((x) => '• **' + x.name + '**: ' + short(x.desc));
                const lead = bn ? 'আমার AI এই মুহূর্তে একটু বিরতিতে আছে, তবে সাইট থেকে আমার কয়েকটা প্রজেক্ট:' : 'My AI is taking a short break right now, but here are some of my projects from the site:';
                return formatReply(lead + '\n' + list.join('\n')) + ask.replace('</div>', `<a class="chat-action" href="/projects/">${bn ? 'সব প্রজেক্ট' : 'All projects'}</a></div>`);
            }
            if (hits.length) {
                const lead = bn ? 'আমার AI এই মুহূর্তে একটু বিরতিতে আছে, তাই আমার সাইটে যা লেখা আছে তা থেকে বলছি:' : 'My AI is taking a short break right now, so here is what my site says:';
                return formatReply(lead + '\n' + hits.map((h) => '• ' + h).join('\n')) + ask;
            }
            if (key) return formatReply(KNOWLEDGE_BASE[key].response);
            return formatReply(bn ? 'আমার AI এই মুহূর্তে একটু বিরতিতে আছে। একটু পরে আবার জিজ্ঞেস করুন, অথবা সরাসরি আমাকে লিখুন:' :
                'My AI is taking a short break right now. Please ask again in a little while, or write to me directly:') + ask;
        }

        async function sendChat() {
            const txt = chatInput.value.trim();
            if (!txt || chatWidget.classList.contains('is-busy')) return;

            if (typeof playSound === 'function') playSound('type');
            chatInput.value = '';
            syncComposer();
            if (BYE_RE.test(txt)) { goodbye(txt); return; }
            const mode = fitMode ? 'fit' : '';
            if (fitMode && brief().length < 600) store.set('chat:brief', (brief() ? brief() + ' | ' : '') + txt);
            let nexts = [];

            // the last few turns give the model context for follow-up questions
            const history = store.get(LOG_KEY, []).filter((m) => m.t).slice(-6);

            // User Message
            beginThread(); setBusy(true);
            appendMsg(txt, 'user'); remember('user', esc(txt), txt);

            // Mascot state: USER SENDS MESSAGE & AI IS PROCESSING -> THINKING
            const mascot = getMascot();
            if (mascot) {
                mascot.setExpression('thinking');
            }

            // Bot Response (Simulated Delay for typing feel)
            const typingEl = appendMsg('<span class="chat-dots" aria-label="Typing"><i></i><i></i><i></i></span>', 'bot', true);
            typingEl.classList.add('typing-indicator');

            let isSuccess = false;
            let isError = false;
            let streamed = false, answerText = '', streamedHtml = null;

            try {
                // Primary: the chat Worker (Gemini / OmniRoute grounded in the site's knowledge base), streamed
                if (!chatApi()) throw new Error('Chat API not configured');
                const r = await streamFromWorker(txt, history, typingEl, mascot, mode);
                answerText = r.text; nexts = r.nexts; streamedHtml = r.html;
                streamed = true;
                isSuccess = true;
            } catch (primaryError) {
                console.warn("[AI_CHAT] Chat worker unavailable, using the free fallback.", primaryError && primaryError.message);

                try {
                    // a fit check needs his real record: without the Worker, hand the brief straight to Mehedi
                    if (mode === 'fit') {
                        const bn = /[\u0980-\u09FF]/.test(txt);
                        typingEl.innerHTML = `<p>${esc(T[bn ? 'bn' : 'en'].fitOff)}</p><div class="chat-actions"><a class="chat-action" href="${waHref('Hi Mehedi, I would like to discuss a project: ' + brief().slice(0, 600))}" target="_blank" rel="noopener">WhatsApp</a></div>`;
                        isSuccess = true;
                        throw 'handled';
                    }
                    // Secondary: Free Public AI Fallback (Direct Text Endpoint)
                    const past = history.slice(-4).map((m) => (m.r === 'user' ? 'User: ' : 'Assistant: ') + m.t.slice(0, 180)).join('\n');
                    const encodedPrompt = encodeURIComponent(CHAT_PROFILE + '\n\n' + (past ? past + '\n' : '') + 'User: ' + txt + '\nAssistant:');
                    const secondaryResponse = await fetch(`https://text.pollinations.ai/${encodedPrompt}`, { signal: AbortSignal.timeout ? AbortSignal.timeout(7000) : undefined });

                    if (secondaryResponse.ok) {
                        let reply = await secondaryResponse.text();
                        // Strip any Pollinations deprecation notice injected at the top
                        const noticeMarker = 'Note: Anonymous requests to text.pollinations.ai are NOT affected and will continue to work normally.';
                        if (reply.includes(noticeMarker)) {
                            reply = reply.substring(reply.indexOf(noticeMarker) + noticeMarker.length).trim();
                        }
                        if (reply) {
                            typingEl.innerHTML = formatReply(reply);
                            isSuccess = true;
                        } else {
                            throw new Error("Reply was empty after stripping notice");
                        }
                    } else {
                        throw new Error("Secondary API Failed");
                    }

                } catch (secondaryError) {
                    if (secondaryError === 'handled') return;
                    // Tertiary: the site's own words (offlineReply above)
                    console.warn("[AI_CHAT] All APIs Offline. Answering from the site's knowledge file.");
                    typingEl.innerHTML = await offlineReply(txt);
                    isSuccess = true;
                }
            } finally {
                typingEl.classList.remove('typing-indicator');
                if (!streamed) settle(typingEl);
                remember('bot', streamedHtml || typingEl.innerHTML, answerText || typingEl.textContent);
                setBusy(false); followUps(nexts);
                chatBody.scrollTop = chatBody.scrollHeight;
                if (typeof playSound === 'function') playSound('type');

                // Update mascot state based on result:
                if (mascot) {
                    if (isError) {
                        mascot.triggerReaction('error', 2200);
                    } else if (isSuccess) {
                        const isFriendly = /\b(hi|hello|hey|thanks|thank you|good|great|awesome|cool|love|nice)\b/i.test(txt);
                        const reaction = isFriendly ? 'happy' : 'excited';
                        mascot.triggerReaction(reaction, 1800);
                    } else {
                        mascot.setExpression('idle');
                    }
                }
            }
        }

        chatSend.addEventListener('click', sendChat);
        // Enter sends, Shift+Enter breaks the line; never send in the middle of IME composition (Bangla keyboards)
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); sendChat(); }
        });

        // Mobile Virtual Keyboard & Viewport Auto-Adjustment
        if (window.visualViewport) {
            const syncMobileViewport = () => {
                if (!chatWidget.classList.contains('chat-expanded')) return;
                if (window.innerWidth <= 768) {
                    const keyboardHeight = window.innerHeight - window.visualViewport.height - (window.visualViewport.offsetTop || 0);
                    if (keyboardHeight > 40) {
                        chatWidget.style.bottom = `${keyboardHeight + 8}px`;
                        chatWidget.style.maxHeight = `${window.visualViewport.height - 16}px`;
                        if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
                    } else {
                        chatWidget.style.bottom = '';
                        chatWidget.style.maxHeight = '';
                    }
                } else {
                    chatWidget.style.bottom = '';
                    chatWidget.style.maxHeight = '';
                }
            };

            window.visualViewport.addEventListener('resize', syncMobileViewport);
            window.visualViewport.addEventListener('scroll', syncMobileViewport);
        }

        // On mobile input focus, ensure input stays in view
        chatInput.addEventListener('focus', () => {
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
                    chatInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 300);
            }
        });
    }


    /* ==========================================
       9.4 WORK WITH ME: SERVICE CARDS FEED THE ONE CONTACT FORM
    ========================================== */
    (function () {
        const cards = [...document.querySelectorAll('.svc2-card')];
        const field = document.getElementById('svc2-services');
        const picked = document.getElementById('svc2-picked');
        if (!cards.length || !field) return;
        const sync = () => {
            const chosen = cards.filter((c) => c.getAttribute('aria-pressed') === 'true').map((c) => c.dataset.service);
            field.value = chosen.join(', ');
            if (picked) picked.textContent = chosen.length ? 'You picked: ' + chosen.join(', ') + '.' : 'Not sure what you need? Just describe it below.';
            if (picked) picked.classList.toggle('has-pick', chosen.length > 0);
        };
        cards.forEach((c) => c.addEventListener('click', () => {
            c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
            if (typeof playSound === 'function') playSound('pop');
            sync();
        }));
    })();

    /* ==========================================
       9.5 FORMSPREE AJAX SUBMISSION (REPLACING REACT LOGIC)
    ========================================== */
    const fpForms = document.querySelectorAll('form[action^="https://formspree.io/f/"]');
    fpForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            // Disable button & visual feedback
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
            const oldNote = form.querySelector('.form-note'); if (oldNote) oldNote.remove();
            const note = (text) => { const n = document.createElement('p'); n.className = 'form-note is-error'; n.setAttribute('role', 'alert'); n.textContent = text; submitBtn.insertAdjacentElement('afterend', n); };

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    // Success logic (mimics React snippet's state.succeeded)
                    form.innerHTML = `
                        <div class="form-done" role="status">
                            <span class="form-done-ico" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
                            <h3>Thanks, your message is on its way.</h3>
                            <p>I read every message myself and will reply by email soon. For anything urgent, <a href="https://wa.me/8801799447594" target="_blank" rel="noopener">message me on WhatsApp</a>.</p>
                        </div>
                    `;
                    if (typeof playSound === 'function') playSound('success');
                    // Scroll to form to ensure success message is seen
                    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    const data = await response.json();
                    note(data.errors ? data.errors.map(error => error.message).join(', ') : "Sorry, that didn't go through. Please try again, or email me directly.");
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.innerHTML = originalBtnText;
                    if (typeof playSound === 'function') playSound('error');
                }
            } catch (error) {
                note("Couldn't reach the server. Check your connection and try again, or message me on WhatsApp.");
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                submitBtn.innerHTML = originalBtnText;
                if (typeof playSound === 'function') playSound('error');
            }
        });
    });

    /* ==========================================
       10. D-I-P HACK & KONAMI GOD MODE
    ========================================== */

    let sCode = ['d', 'i', 'p'], sPos = 0;
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    document.addEventListener('keydown', e => {
        if (e.key === konamiCode[konamiIndex] || e.key.toLowerCase() === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateGodMode();
                konamiIndex = 0;
            }
        } else { konamiIndex = 0; }

        if (e.key.toLowerCase() === sCode[sPos]) {
            sPos++;
            if (sPos === 3) {
                const over = document.getElementById('easter-egg-overlay');
                const term = document.getElementById('hack-terminal');
                over.classList.add('active');
                term.innerHTML = '<span class="hack-cursor"></span>';

                const lines = ["INITIATING OVERRIDE...", "BYPASSING FIREWALL...", "USER IDENTIFIED: MEHEDI", "ROOT ACCESS GRANTED."];
                let lIdx = 0;

                function printLine() {
                    if (lIdx < lines.length) {
                        const l = document.createElement('div');
                        l.textContent = "> " + lines[lIdx];
                        term.insertBefore(l, term.querySelector('.hack-cursor'));
                        lIdx++;
                        playSound('type');
                        setTimeout(printLine, Math.random() * 300 + 100);
                    } else {
                        setTimeout(() => {
                            over.style.background = "#4ade80";
                            term.style.color = "#000";
                            playSound('success');
                            updateClearance(4);
                        }, 600);
                        setTimeout(() => {
                            over.classList.remove('active');
                            setTimeout(() => {
                                over.style.background = "rgba(0,0,0,0.95)";
                                term.style.color = "#4ade80";
                                term.innerHTML = '<span class="hack-cursor"></span>';
                            }, 500);
                        }, 2800);
                    }
                }
                setTimeout(printLine, 400);
                sPos = 0;
            }
        } else { sPos = 0; }
    });

    function activateGodMode() {
        playSound('success');
        document.documentElement.setAttribute('data-theme', 'god-mode');
        localStorage.setItem('mehedi_theme', 'god-mode');
        if (typeof initParticles === 'function') initParticles();
        updateClearance(2);

        setTimeout(() => { alert("/// GOD MODE ACTIVATED /// \nHardware limits bypassed. Root access simulated."); }, 300);
    }

    /* ==========================================
       11. THEME SWITCHER & DEEP DIVE MATRIX
    ========================================== */
    const themeBtn = document.getElementById('theme-toggler');
    const themes = ['dark', 'cyberpunk', 'light', 'mint', 'god-mode'];

    let savedTheme = localStorage.getItem('mehedi_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    let cTheme = themes.indexOf(savedTheme) !== -1 ? themes.indexOf(savedTheme) : 0;

    function cycleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || savedTheme;
        let idx = themes.indexOf(current);
        if (idx === -1) idx = 0;
        do { idx = (idx + 1) % themes.length; } while (themes[idx] === 'god-mode');
        document.documentElement.setAttribute('data-theme', themes[idx]);
        localStorage.setItem('mehedi_theme', themes[idx]);
        if (typeof initParticles === 'function') initParticles();
    }

    document.addEventListener('click', (e) => {
        const tBtn = e.target.closest('#theme-toggler, .theme-btn, [data-theme-toggle]');
        if (tBtn) {
            e.preventDefault();
            cycleTheme();
        }
    });

    const canvas = document.getElementById('particle-canvas');
    let ctx, pArray;
    let mouse = { x: null, y: null, radius: 150 };

    let deepDiveMode = false;
    let matrixDrops = [];
    let matrixFontSize = 16;
    let matrixColumns = 0;

    if (canvas) {
        ctx = canvas.getContext('2d');

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX; mouse.y = e.clientY;
        });

        window.addEventListener('mouseout', () => {
            mouse.x = null; mouse.y = null;
        });

        function initMatrix() {
            matrixColumns = Math.floor(canvas.width / matrixFontSize);
            matrixDrops = [];
            for (let x = 0; x < matrixColumns; x++) matrixDrops[x] = 1;
        }

        // keep: the dots drawn as the page parsed (the hero-net script in the head) start moving from where they are
        function initParticles(keep) {
            if (keep && window.heroParticles && canvas.width === innerWidth && canvas.height === innerHeight) {
                pArray = window.heroParticles;
                initMatrix();
                return true;
            }
            canvas.width = innerWidth;
            canvas.height = innerHeight;
            pArray = [];
            initMatrix();
            const col = getComputedStyle(document.documentElement).getPropertyValue('--particle-color').trim() || '#00f2fe';

            for (let i = 0; i < (innerWidth * innerHeight) / 9000; i++) {
                pArray.push({
                    x: Math.random() * innerWidth, y: Math.random() * innerHeight,
                    dx: (Math.random() - 0.5) * 1.5, dy: (Math.random() - 0.5) * 1.5,
                    s: Math.random() * 2 + 1, col: col
                });
            }
        }

        window.addEventListener('resize', () => initParticles());

        let particlesOn = false, heroInView = true, particleFrame = 0;
        // Phones draw every other frame (~30 fps) and move twice as far each time: the same drift at half the work.
        const PARTICLE_STEP = matchMedia('(pointer: coarse)').matches ? 2 : 1;

        function animateParticles() {
            // Reduced motion: draw a single static frame instead of looping. The loop also rests while the hero is scrolled away.
            particlesOn = !PREFERS_REDUCED_MOTION && heroInView;
            if (particlesOn) requestAnimationFrame(animateParticles);
            if (particlesOn && ++particleFrame % PARTICLE_STEP) return;

            if (deepDiveMode) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#0f0';
                ctx.font = matrixFontSize + 'px "Fira Code", monospace';

                for (let i = 0; i < matrixDrops.length; i++) {
                    const text = String.fromCharCode(0x30A0 + Math.random() * 96);
                    ctx.fillText(text, i * matrixFontSize, matrixDrops[i] * matrixFontSize);
                    if (matrixDrops[i] * matrixFontSize > canvas.height && Math.random() > 0.975) matrixDrops[i] = 0;
                    matrixDrops[i]++;
                }
            } else {
                pArray.forEach(p => {
                    if (p.x >= canvas.width) { p.x = canvas.width; p.dx *= -1; }
                    else if (p.x <= 0) { p.x = 0; p.dx *= -1; }
                    if (p.y >= canvas.height) { p.y = canvas.height; p.dy *= -1; }
                    else if (p.y <= 0) { p.y = 0; p.dy *= -1; }

                    if (mouse.x != null && mouse.y != null) {
                        let dx = mouse.x - p.x; let dy = mouse.y - p.y;
                        let distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < mouse.radius) {
                            const forceDirectionX = dx / distance;
                            const forceDirectionY = dy / distance;
                            const force = (mouse.radius - distance) / mouse.radius;
                            p.x -= forceDirectionX * force * 5;
                            p.y -= forceDirectionY * force * 5;
                        }
                    }

                    p.dx *= 0.98; p.dy *= 0.98;
                    if (Math.abs(p.dx) < 0.3) p.dx = p.dx > 0 ? 0.3 : -0.3;
                    if (Math.abs(p.dy) < 0.3) p.dy = p.dy > 0 ? 0.3 : -0.3;

                    p.x += p.dx * PARTICLE_STEP; p.y += p.dy * PARTICLE_STEP;
                });
                drawParticleNet(ctx, pArray);
            }
        }

        // The page paints first: the particles start once the browser is idle, and rest while the hero is off screen.
        // The first still frame was drawn with the hero; it is drawn here only if the window changed size since.
        if (!initParticles(true)) { heroInView = false; animateParticles(); heroInView = true; }
        const startParticles = () => {
            animateParticles();
            new IntersectionObserver(([entry]) => {
                heroInView = entry.isIntersecting;
                if (heroInView && !particlesOn) animateParticles();
            }).observe(canvas);
        };
        if ('requestIdleCallback' in window) requestIdleCallback(startParticles, { timeout: 3000 });
        else setTimeout(startParticles, 1200);
    }

    /* ==========================================
       12. VS CODE IDE LOGIC (DYNAMIC REFACTOR)
    ========================================== */
    const TECHNICAL_ARSENAL = [
        {
            id: 'file-microservice',
            name: 'order_service.nest.ts',
            lang: 'TypeScript',
            icon: 'fa-node-js',
            color: '#E0234E',
            code: `<span class="keyword">import</span> { Controller, Inject } <span class="keyword">from</span> <span class="string">'@nestjs/common'</span>;
<span class="keyword">import</span> { MessagePattern, Payload } <span class="keyword">from</span> <span class="string">'@nestjs/microservices'</span>;
<span class="keyword">import</span> { ClientKafka } <span class="keyword">from</span> <span class="string">'@nestjs/microservices'</span>;

<span class="comment">// High-Concurrency Event-Driven Microservice</span>
@<span class="function">Controller</span>()
<span class="keyword">export class</span> <span class="function">OrderConsumerController</span> {
    <span class="keyword">constructor</span>(
        @<span class="function">Inject</span>(<span class="string">'KAFKA_SERVICE'</span>) <span class="keyword">private readonly</span> kafkaClient: ClientKafka,
        <span class="keyword">private readonly</span> dbPool: PostgresConnectionPool
    ) {}

    @<span class="function">MessagePattern</span>(<span class="string">'order.checkout.v1'</span>)
    <span class="keyword">async</span> <span class="function">handleOrderEvent</span>(@<span class="function">Payload</span>() data: OrderPayload) {
        <span class="keyword">const</span> client = <span class="keyword">await</span> <span class="keyword">this</span>.dbPool.connect();
        <span class="keyword">try</span> {
            <span class="keyword">await</span> client.query(<span class="string">'BEGIN'</span>);
            <span class="keyword">const</span> record = <span class="keyword">await</span> client.query(
                <span class="string">'INSERT INTO orders(id, amount, status) VALUES($1, $2, $3) RETURNING *'</span>,
                [data.id, data.amount, <span class="string">'PROCESSING'</span>]
            );
            <span class="keyword">await</span> client.query(<span class="string">'COMMIT'</span>);
            <span class="keyword">this</span>.kafkaClient.emit(<span class="string">'order.dispatched'</span>, { orderId: record.rows[0].id });
            <span class="keyword">return</span> { status: <span class="string">'DISPATCHED_TO_PIPELINE'</span>, latency: <span class="string">'1.2ms'</span> };
        } <span class="keyword">catch</span> (err) {
            <span class="keyword">await</span> client.query(<span class="string">'ROLLBACK'</span>);
            <span class="keyword">throw</span> err;
        }
    }
}`,
            blueprint: {
                title: 'Transactional Outbox & Event-Driven Pipeline',
                subtitle: 'High-Concurrency Ingress with ACID Protection & Apache Kafka Pub/Sub',
                badges: ['NestJS Microservices', 'PostgreSQL ACID', 'Apache Kafka', 'Distributed Tx'],
                flow: [
                    { step: 'Step 01 // Ingress', title: 'Order Ingestion', icon: 'fa-arrow-right-to-bracket', desc: 'REST/gRPC checkout payload validated & ingested via NestJS controller.' },
                    { step: 'Step 02 // ACID Tx', title: 'Row-Locked Write', icon: 'fa-database', desc: 'PostgreSQL connection pool executes atomic BEGIN -> INSERT with row locking.' },
                    { step: 'Step 03 // Kafka Emit', title: 'Event Publication', icon: 'fa-network-wired', desc: 'Outbox event emitted to order.dispatched stream with zero packet loss.' },
                    { step: 'Step 04 // Downstream', title: 'Async Sync & Rollback', icon: 'fa-rotate-left', desc: 'Inventory & payment microservices sync; automated rollback on exception.' }
                ],
                metrics: [
                    { value: '1.2ms', label: 'Ingress Latency' },
                    { value: '100% ACID', label: 'Tx Isolation' },
                    { value: '0% Drop', label: 'Kafka Reliability' },
                    { value: '50k+ RPM', label: 'Peak Capacity' }
                ]
            }
        },
        {
            id: 'file-redis-cache',
            name: 'distributed_cache.ts',
            lang: 'TypeScript',
            icon: 'fa-server',
            color: '#DC382D',
            code: `<span class="keyword">import</span> Redis <span class="keyword">from</span> <span class="string">'ioredis'</span>;

<span class="comment">// Redis Cluster Distributed Lock & Rate Limiter (Token Bucket)</span>
<span class="keyword">export class</span> <span class="function">DistributedCacheEngine</span> {
    <span class="keyword">private</span> cluster: Redis.Cluster;

    <span class="keyword">constructor</span>() {
        <span class="keyword">this</span>.cluster = <span class="keyword">new</span> Redis.Cluster([{ host: <span class="string">'redis-cluster'</span>, port: 6379 }]);
    }

    <span class="keyword">async</span> <span class="function">acquireLockAndCache</span>(key: <span class="variable">string</span>, ttlMs: <span class="variable">number</span>, fetchFn: () =&gt; Promise&lt;any&gt;) {
        <span class="keyword">const</span> lockKey = \`lock:\${key}\`;
        <span class="keyword">const</span> acquired = <span class="keyword">await</span> <span class="keyword">this</span>.cluster.set(lockKey, <span class="string">'LOCKED'</span>, <span class="string">'PX'</span>, 3000, <span class="string">'NX'</span>);
        
        <span class="keyword">if</span> (!acquired) {
            <span class="keyword">await</span> <span class="keyword">new</span> Promise(res =&gt; setTimeout(res, 50));
            <span class="keyword">return</span> <span class="keyword">this</span>.cluster.get(key); <span class="comment">// Cache stampede protection</span>
        }

        <span class="keyword">try</span> {
            <span class="keyword">const</span> freshData = <span class="keyword">await</span> fetchFn();
            <span class="keyword">await</span> <span class="keyword">this</span>.cluster.set(key, JSON.stringify(freshData), <span class="string">'PX'</span>, ttlMs);
            <span class="keyword">return</span> freshData;
        } <span class="keyword">finally</span> {
            <span class="keyword">await</span> <span class="keyword">this</span>.cluster.del(lockKey);
        }
    }
}`,
            blueprint: {
                title: 'Distributed Mutex Lock & Cache Stampede Shield',
                subtitle: 'Redis Cluster Engine with NX Mutex & Token Bucket Rate Limiting',
                badges: ['Redis Cluster', 'ioredis', 'Redlock Algorithm', 'Stampede Prevention'],
                flow: [
                    { step: 'Step 01 // Burst Read', title: 'Traffic Ingress', icon: 'fa-bolt', desc: 'High-concurrency read requests hit distributed cache layer simultaneously.' },
                    { step: 'Step 02 // Mutex Lock', title: 'Redlock NX Check', icon: 'fa-lock', desc: 'Acquires atomic distributed lock with 3000ms TTL to prevent dogpiling.' },
                    { step: 'Step 03 // Failsafe Wait', title: 'Wait & Retry (50ms)', icon: 'fa-clock', desc: 'Secondary workers wait and read cached result instead of hitting database.' },
                    { step: 'Step 04 // Hydration', title: 'Atomic Hydration', icon: 'fa-shield-halved', desc: 'Winning worker queries DB once, re-hydrates Redis, and releases mutex.' }
                ],
                metrics: [
                    { value: '99.4%', label: 'Cache Hit Ratio' },
                    { value: '3000ms', label: 'Lock TTL Safety' },
                    { value: 'Zero-Dogpile', label: 'Stampede Guard' },
                    { value: '100k+ OPS', label: 'Redis Throughput' }
                ]
            }
        },
        {
            id: 'file-ai-pipeline',
            name: 'agentic_pipeline.py',
            lang: 'Python',
            icon: 'fa-python',
            color: '#3776AB',
            code: `<span class="keyword">import</span> asyncio
<span class="keyword">from</span> langchain_google_genai <span class="keyword">import</span> ChatGoogleGenerativeAI
<span class="keyword">from</span> pgvector.asyncpg <span class="keyword">import</span> register_vector

<span class="comment"># Autonomous LLM RAG & Orchestration Engine</span>
<span class="keyword">async def</span> <span class="function">orchestrate_inference</span>(query: str, pool):
    model = ChatGoogleGenerativeAI(model=<span class="string">"gemini-1.5-pro"</span>, temperature=0.1)
    
    <span class="comment"># Retrieve context from PostgreSQL PGVector index</span>
    <span class="keyword">async with</span> pool.acquire() <span class="keyword">as</span> conn:
        embeddings = <span class="keyword">await</span> model.aembed_query(query)
        context = <span class="keyword">await</span> conn.fetch(
            <span class="string">"SELECT content FROM knowledge_docs ORDER BY embedding &lt;=&gt; $1 LIMIT 5"</span>,
            embeddings
        )
    
    response = <span class="keyword">await</span> model.ainvoke(f<span class="string">"Context: {context}\\nTask: {query}"</span>)
    <span class="keyword">return</span> {<span class="string">"result"</span>: response.content, <span class="string">"latency_ms"</span>: 18.4}`,
            blueprint: {
                title: 'Autonomous Vector RAG & Agentic Swarm',
                subtitle: 'Enterprise Knowledge Grounding with Gemini 1.5 Pro & PGVector HNSW',
                badges: ['LangChain', 'Gemini 1.5 Pro', 'PGVector HNSW', 'Async Python'],
                flow: [
                    { step: 'Step 01 // Embed', title: 'Semantic Query Parse', icon: 'fa-brain', desc: 'User prompt parsed and converted into dense 768-dim vector embeddings.' },
                    { step: 'Step 02 // Search', title: 'PGVector Cosine Search', icon: 'fa-magnifying-glass-chart', desc: 'HNSW index runs sub-15ms nearest-neighbor semantic cosine similarity match.' },
                    { step: 'Step 03 // Grounding', title: 'Context Fusion', icon: 'fa-layer-group', desc: 'Top-5 authoritative document chunks extracted and injected into prompt context.' },
                    { step: 'Step 04 // Synthesis', title: 'Gemini 1.5 Synthesis', icon: 'fa-wand-magic-sparkles', desc: 'Gemini 1.5 Pro produces hallucination-free answer with exact citations.' }
                ],
                metrics: [
                    { value: '18.4ms', label: 'Retrieval Speed' },
                    { value: '96.8%', label: 'Context Density' },
                    { value: '0% Hallucination', label: 'Strict Grounding' },
                    { value: '1M Tokens', label: 'Context Window' }
                ]
            }
        },
        {
            id: 'file-k8s-infra',
            name: 'k8s_deployment.yaml',
            lang: 'YAML',
            icon: 'fa-docker',
            color: '#326CE5',
            code: `<span class="comment"># Cloud-Native Kubernetes Pod & Prometheus Scraping</span>
<span class="keyword">apiVersion</span>: apps/v1
<span class="keyword">kind</span>: Deployment
<span class="keyword">metadata</span>:
  <span class="keyword">name</span>: nestjs-api-gateway
  <span class="keyword">annotations</span>:
    <span class="string">prometheus.io/scrape</span>: <span class="string">"true"</span>
    <span class="string">prometheus.io/port</span>: <span class="string">"3000"</span>
<span class="keyword">spec</span>:
  <span class="keyword">replicas</span>: 5
  <span class="keyword">strategy</span>:
    <span class="keyword">type</span>: RollingUpdate
  <span class="keyword">template</span>:
    <span class="keyword">spec</span>:
      <span class="keyword">containers</span>:
        - <span class="keyword">name</span>: app
          <span class="keyword">image</span>: mehedi/nest-gateway:v2.4
          <span class="keyword">resources</span>:
            <span class="keyword">limits</span>: { cpu: <span class="string">"1000m"</span>, memory: <span class="string">"1Gi"</span> }
          <span class="keyword">envFrom</span>:
            - <span class="keyword">configMapRef</span>: { name: app-env-config }`,
            blueprint: {
                title: 'Cloud-Native Kubernetes & Auto-Healing Cluster',
                subtitle: 'High-Availability Container Orchestration with Prometheus Telemetry',
                badges: ['AWS EKS', 'Kubernetes Apps/v1', 'Prometheus Scrape', 'RollingUpdate'],
                flow: [
                    { step: 'Step 01 // Routing', title: 'Cloudflare Ingress', icon: 'fa-cloud', desc: 'Global CDN and ingress controller route authenticated traffic to API gateway.' },
                    { step: 'Step 02 // Scaling', title: '5x Pod Replicas', icon: 'fa-cubes', desc: 'Auto-scaled stateless NestJS pods balance CPU/memory load evenly across nodes.' },
                    { step: 'Step 03 // Rollout', title: 'Zero-Downtime Rollout', icon: 'fa-arrows-rotate', desc: 'RollingUpdate strategy swaps container images with zero service interruption.' },
                    { step: 'Step 04 // Metrics', title: 'Prometheus Scrape', icon: 'fa-chart-line', desc: 'Prometheus scrapes port 3000 every 15s to push alerts to Grafana dashboard.' }
                ],
                metrics: [
                    { value: '99.99%', label: 'Production SLA' },
                    { value: '5 Replicas', label: 'Active Redundancy' },
                    { value: '< 3s', label: 'Auto-Healing Time' },
                    { value: '1Gi / 1000m', label: 'Pod Limits' }
                ]
            }
        }
    ];

    let currentArsenalFile = TECHNICAL_ARSENAL[0];
    let currentArsenalView = 'code'; // 'code' | 'blueprint'

    function renderBlueprint(file) {
        const bpContainer = document.getElementById('ide-blueprint-view');
        if (!bpContainer || !file || !file.blueprint) return;
        const bp = file.blueprint;

        bpContainer.innerHTML = `
            <div class="bp-card">
                <div class="bp-header">
                    <div class="bp-title-wrap">
                        <h3><i class="fa-solid fa-diagram-project" style="color: ${file.color};"></i> ${bp.title}</h3>
                        <p>${bp.subtitle}</p>
                    </div>
                    <div class="bp-badges">
                        ${bp.badges.map(b => `<span class="bp-badge">${b}</span>`).join('')}
                    </div>
                </div>

                <div class="bp-flow-container">
                    <div class="bp-flow-title"><i class="fa-solid fa-timeline"></i> Architecture Execution Pipeline</div>
                    <div class="bp-flow-grid">
                        ${bp.flow.map(n => `
                            <div class="bp-node">
                                <div class="bp-node-step">${n.step}</div>
                                <div class="bp-node-title"><i class="fa-solid ${n.icon}" style="color: ${file.color};"></i> ${n.title}</div>
                                <p class="bp-node-desc">${n.desc}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="bp-metrics-grid">
                    ${bp.metrics.map(m => `
                        <div class="bp-metric-box">
                            <div class="bp-metric-value" style="color: ${file.color};">${m.value}</div>
                            <div class="bp-metric-label">${m.label}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    function setArsenalView(mode) {
        currentArsenalView = mode;
        const lineNums = document.getElementById('line-numbers');
        const editorCont = document.getElementById('ide-editor-container');
        const bpView = document.getElementById('ide-blueprint-view');
        const btnCode = document.getElementById('btn-view-code');
        const btnBp = document.getElementById('btn-view-blueprint');

        if (mode === 'code') {
            if (lineNums) lineNums.style.display = 'block';
            if (editorCont) editorCont.style.display = 'block';
            if (bpView) bpView.style.display = 'none';
            if (btnCode) btnCode.classList.add('active');
            if (btnBp) btnBp.classList.remove('active');
        } else {
            if (lineNums) lineNums.style.display = 'none';
            if (editorCont) editorCont.style.display = 'none';
            if (bpView) {
                bpView.style.display = 'block';
                renderBlueprint(currentArsenalFile);
            }
            if (btnCode) btnCode.classList.remove('active');
            if (btnBp) btnBp.classList.add('active');
        }
        if (typeof playSound === 'function') playSound('click');
    }

    function renderArsenal() {
        const fileList = document.getElementById('ide-file-list');
        const editorCont = document.getElementById('ide-editor-container');
        if (!fileList || !editorCont) return;

        fileList.innerHTML = '';
        editorCont.innerHTML = '';

        TECHNICAL_ARSENAL.forEach((file, index) => {
            // Sidebar item
            const li = document.createElement('li');
            li.className = `file hover-sound ${index === 0 ? 'active' : ''}`;
            li.dataset.target = file.id;
            li.dataset.lang = file.lang;
            li.dataset.icon = file.icon;
            li.dataset.color = file.color;
            li.innerHTML = `<i class="fa-brands ${file.icon}" style="color: ${file.color};"></i> ${file.name}`;
            fileList.appendChild(li);

            // Editor block
            const block = document.createElement('div');
            block.className = `code-block ${index === 0 ? 'active' : ''}`;
            block.id = file.id;
            block.innerHTML = `<pre><code>${file.code}</code></pre>`;
            editorCont.appendChild(block);

            li.addEventListener('click', () => {
                document.querySelectorAll('.file').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.code-block').forEach(b => b.classList.remove('active'));

                li.classList.add('active');
                block.classList.add('active');
                currentArsenalFile = file;

                // Update UI
                const tabDisplay = document.getElementById('active-tab-display');
                if (tabDisplay) {
                    tabDisplay.innerHTML = `<i class="fa-brands ${file.icon}" style="color: ${file.color};"></i> ${file.name} <i class="fa-solid fa-xmark close-tab"></i>`;
                }
                const statusLang = document.getElementById('status-lang');
                if (statusLang) statusLang.innerText = file.lang;

                generateLines(block);

                if (currentArsenalView === 'blueprint') {
                    renderBlueprint(file);
                }

                if (typeof playSound === 'function') playSound('type');
            });
        });

        // View toggle listeners
        const btnCode = document.getElementById('btn-view-code');
        const btnBp = document.getElementById('btn-view-blueprint');
        if (btnCode) {
            btnCode.addEventListener('click', () => setArsenalView('code'));
        }
        if (btnBp) {
            btnBp.addEventListener('click', () => setArsenalView('blueprint'));
        }

        // Init first tab display
        const first = TECHNICAL_ARSENAL[0];
        currentArsenalFile = first;
        const tabDisplay = document.getElementById('active-tab-display');
        if (tabDisplay) tabDisplay.innerHTML = `<i class="fa-brands ${first.icon}" style="color: ${first.color};"></i> ${first.name} <i class="fa-solid fa-xmark close-tab"></i>`;
        const statusLang = document.getElementById('status-lang');
        if (statusLang) statusLang.innerText = first.lang;
        generateLines(document.getElementById(first.id));
    }

    function generateLines(codeEl) {
        if (!codeEl) return;
        // textContent: the code sits in a <pre> with real newlines, and unlike innerText it needs no layout
        const count = codeEl.textContent.split(/\r\n|\r|\n/).length;
        const lineNums = document.getElementById('line-numbers');
        if (lineNums) {
            lineNums.innerHTML = Array.from({ length: count }, (_, i) => `<div>${i + 1}</div>`).join('');
        }
    }

    renderArsenal();

    /* ==========================================
       13. TYPEWRITER EFFECT
    ========================================== */
    const tArr = [
        { prefix: "I am an", text: "AI-Native Software Engineer" },
        { prefix: "I am an", text: "LLM Integration Specialist" },
        { prefix: "I am an", text: "Autonomous Agent Developer" },
        { prefix: "I am a", text: "Full-Stack System Architect" }
    ];
    let tIdx = 0, cIdx = 0;
    const typingSpan = document.querySelector(".typing-text");
    const prefixSpan = document.querySelector(".prefix-text");

    if (typingSpan) {
        // The subtitle keeps the height of its tallest phrase (some wrap to two lines), so the centred hero never jumps
        // while phrases type and erase. Measured again once the fonts are in and when the width changes.
        const subtitle = typingSpan.closest('h2');
        let subtitleW = 0;   // the width it was measured at (read with the measuring: innerWidth lays the page out)
        const reserveSubtitle = () => {
            if (!subtitle) return;
            subtitleW = innerWidth;
            const was = [prefixSpan ? prefixSpan.textContent : '', typingSpan.textContent];
            subtitle.style.minHeight = '';
            let tallest = 0;
            tArr.forEach((it) => {
                if (prefixSpan) prefixSpan.textContent = it.prefix;
                typingSpan.textContent = it.text;
                tallest = Math.max(tallest, subtitle.offsetHeight);
            });
            if (prefixSpan) prefixSpan.textContent = was[0];
            typingSpan.textContent = was[1];
            subtitle.style.minHeight = tallest + 'px';
        };
        // Measured with the next frame (the stylesheet holds the height until then): measuring here would lay the page out
        // inside the start-up task, and the fonts may already be in, which runs the .then before this task ends.
        let reserveQueued = false;
        const reserveSoon = () => {
            if (reserveQueued) return;
            reserveQueued = true;
            requestAnimationFrame(() => { reserveQueued = false; reserveSubtitle(); });
        };
        reserveSoon();
        // fonts.ready is read with the frame too: the getter brings style and layout up to date
        if (document.fonts) requestAnimationFrame(() => document.fonts.ready.then(reserveSoon));
        window.addEventListener('resize', () => { if (innerWidth !== subtitleW) reserveSubtitle(); });

        function type() {
            const currentItem = tArr[tIdx];
            if (prefixSpan) {
                prefixSpan.textContent = currentItem.prefix;
            }

            if (cIdx < currentItem.text.length) {
                typingSpan.textContent += currentItem.text.charAt(cIdx);
                cIdx++; setTimeout(type, 100);
            } else { setTimeout(erase, 2000); }
        }
        function erase() {
            const currentItem = tArr[tIdx];
            if (cIdx > 0) {
                typingSpan.textContent = currentItem.text.substring(0, cIdx - 1);
                cIdx--; setTimeout(erase, 50);
            } else {
                tIdx = (tIdx + 1) % tArr.length; setTimeout(type, 500);
            }
        }
        // The first phrase comes written in the page, so the hero reads complete from the first paint; the typing
        // cycle takes over after 5 s (typed in from empty, the title kept changing the first screen for seconds).
        if (typingSpan.textContent === tArr[0].text) { cIdx = tArr[0].text.length; setTimeout(erase, 5000); }
        else setTimeout(type, 1000);
    }

    /* ==========================================
       14. INTERACTIVE POS CHECKOUT TERMINAL
    ========================================== */
    const posItems = document.querySelectorAll('.pos-item');
    const receiptList = document.getElementById('receipt-items');
    const totalVal = document.getElementById('receipt-total-val');
    const hiddenMsg = document.getElementById('pos-hidden-msg');
    const clearCart = document.getElementById('clear-cart');
    const posForm = document.getElementById('pos-form');
    let cart = [];

    if (posForm) {
        function updateCart() {
            receiptList.innerHTML = '';
            let total = 0;
            let msgBuilder = "=== INCOMING DEPLOYMENT REQUEST ===\n\nRequested Services:\n";

            if (cart.length === 0) {
                receiptList.innerHTML = '<li class="empty-cart">Awaiting item selection...</li>';
                hiddenMsg.value = '';
                totalVal.innerText = "0";
                return;
            }

            cart.forEach((item, index) => {
                total += item.price;
                msgBuilder += `- ${item.name} ($${item.price})\n`;
                receiptList.innerHTML += `<li><span>${item.name}</span> <span>$${item.price} <i class="fa-solid fa-xmark remove-item hover-sound" data-idx="${index}" style="color:#ef4444; margin-left:5px;"></i></span></li>`;
            });

            totalVal.innerText = total;
            msgBuilder += `\nEstimated Total: $${total}\n\nPlease reach out to me regarding these systems.`;
            hiddenMsg.value = msgBuilder;

            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    playSound('click');
                    cart.splice(e.target.dataset.idx, 1);
                    updateCart();
                });
            });
        }

        posItems.forEach(btn => {
            btn.addEventListener('click', () => {
                playSound('cash');
                cart.push({ name: btn.dataset.name, price: parseInt(btn.dataset.price) });
                updateCart();
            });
        });

        clearCart.addEventListener('click', () => { playSound('error'); cart = []; updateCart(); });

        posForm.addEventListener('submit', (e) => {
            if (cart.length === 0) { e.preventDefault(); alert("System Error: No services selected for deployment."); }
        });
    }

    /* ==========================================
       15. LIVE DYNAMIC PROJECT FILTERS
    ========================================== */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (typeof playSound === 'function') playSound('click');
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = (btn.dataset.filter || 'all').toLowerCase();
                let matchCount = 0;

                projectCards.forEach(card => {
                    const stack = (card.dataset.stack || '').toLowerCase();
                    const isMatch = filter === 'all' || stack.includes(filter);

                    if (isMatch) {
                        card.classList.remove('is-filtered-out');
                        card.classList.add('show');
                        card.classList.remove('hidden');
                        card.style.display = '';
                        card.style.opacity = '0';
                        card.style.transform = 'perspective(1000px) scale3d(0.94, 0.94, 0.94) translateY(12px)';

                        const delay = Math.min(matchCount * 30, 160);
                        matchCount++;

                        setTimeout(() => {
                            card.style.transition = 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
                            card.style.opacity = '1';
                            card.style.transform = 'perspective(1000px) scale3d(1, 1, 1) translateY(0)';
                        }, delay);
                    } else {
                        card.classList.add('is-filtered-out');
                        card.style.opacity = '0';
                        card.style.transform = 'perspective(1000px) scale3d(0.85, 0.85, 0.85)';
                    }
                });
            });
        });
    }

    /* ==========================================
       16. SELF DESTRUCT MELTDOWN SEQUENCE
    ========================================== */
    const sdBtn = document.getElementById('self-destruct-btn');
    if (sdBtn) {
        sdBtn.addEventListener('click', () => {
            playSound('error');
            document.body.classList.add('meltdown-active');

            const overlay = document.createElement('div');
            overlay.className = 'meltdown-overlay';
            document.body.appendChild(overlay);

            let count = 5;
            const cDown = document.createElement('div');
            cDown.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-size:15rem;color:white;z-index:9999999999;font-family:'Fira Code', monospace;font-weight:bold; text-shadow: 0 0 50px red;";
            document.body.appendChild(cDown);

            const int = setInterval(() => {
                cDown.innerText = count;
                if (count > 0) playSound('click');
                if (count === 0) {
                    clearInterval(int);
                    document.body.innerHTML = '';
                    document.body.style.backgroundColor = '#000';
                    setTimeout(() => { location.reload(); }, 1000);
                }
                count--;
            }, 1000);
        });
    }

    /* ==========================================
       17. NEW: INTERACTIVE API SANDBOX
    ========================================== */
    function syntaxHighlight(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'json-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) { cls = 'json-key'; } else { cls = 'json-string'; }
            } else if (/true|false/.test(match)) { cls = 'json-number'; } else if (/null/.test(match)) { cls = 'json-number'; }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

    const apiPresets = {
        systems: {
            status: 200,
            cluster: "mehedi-prod-us-east",
            uptime: "99.99%",
            nodes: [
                { service: "microservices-mesh", protocol: "gRPC", p99: "11.2ms", status: "HEALTHY" },
                { service: "kafka-event-bus", brokers: 3, throughput: "52.4K msg/s", status: "HEALTHY" },
                { service: "k8s-orchestrator", pods: 24, autoscaling: "ACTIVE", status: "HEALTHY" },
                { service: "ai-cot-agent", model: "Gemini 2.5", latency: "140ms", status: "HEALTHY" }
            ],
            security: { tls: "1.3", ddos_mitigation: "Active", zero_trust: true }
        },
        stack: {
            status: 200,
            engineer: "Mehedi Hasan",
            stack: {
                backend: ["NestJS", "Node.js", "Python", "Go"],
                persistence: ["PostgreSQL", "Redis Cluster", "pgBouncer"],
                streaming: ["Apache Kafka", "RabbitMQ"],
                devops_sre: ["AWS", "Docker", "Kubernetes", "Prometheus", "Grafana"],
                ai_systems: ["LLM Agents", "Vector Embeddings", "LangChain"]
            },
            protocols: ["HTTP/3", "gRPC", "WebSocket"]
        },
        metrics: {
            status: 200,
            telemetry: {
                p99_latency: "11.8ms",
                cache_hit_ratio: "99.4%",
                req_per_second: "4.8K req/s",
                error_rate: "0.001%",
                sla_availability: "99.99%",
                cot_speedup: "4.2x"
            }
        }
    };

    /* ==========================================
       17. DISTRIBUTED ARCHITECTURE TOPOLOGY MESH
    ========================================== */
    const topoNodes = document.querySelectorAll('.topo-node');
    const topoTabs = document.querySelectorAll('.topo-tab');
    const hudTitle = document.getElementById('hud-title');
    const hudMetrics = document.getElementById('hud-metrics');
    const topoWires = document.querySelectorAll('.topo-wire');

    const nodeData = {
        edge: {
            title: "Cloud Edge (Global Anycast CDN)",
            metrics: [
                { icon: "fa-shield-halved", text: "DDoS Protected" },
                { icon: "fa-gauge-high", text: "Latency: 12ms" },
                { icon: "fa-signal", text: "99.999% SLA" }
            ],
            color: "var(--accent-1)"
        },
        gateway: {
            title: "NestJS API Gateway (Microservices Hub)",
            metrics: [
                { icon: "fa-server", text: "Protocol: gRPC / REST" },
                { icon: "fa-lock", text: "Rate Limited" },
                { icon: "fa-microchip", text: "p99 < 8ms" }
            ],
            color: "var(--accent-1)"
        },
        kafka: {
            title: "Kafka Event Bus (High-Throughput Streaming)",
            metrics: [
                { icon: "fa-bolt", text: "52,400 msg/s" },
                { icon: "fa-layer-group", text: "12 Partitions" },
                { icon: "fa-clock", text: "Lag: 0ms" }
            ],
            color: "#f59e0b"
        },
        ai: {
            title: "Autonomous AI Swarm (Multi-Agent Pipeline)",
            metrics: [
                { icon: "fa-robot", text: "Active Agents: 8" },
                { icon: "fa-bolt", text: "4.2x CoT Speedup" },
                { icon: "fa-brain", text: "RAG & LLM Routing" }
            ],
            color: "#a855f7"
        },
        data: {
            title: "PostgreSQL & Distributed Redis Cache",
            metrics: [
                { icon: "fa-database", text: "Multi-AZ Replicas" },
                { icon: "fa-fire-flame-curved", text: "99.4% Cache Hit" },
                { icon: "fa-chart-pie", text: "Pool: 128 Conn" }
            ],
            color: "#38bdf8"
        }
    };

    const HUD_ICONS = {
        'fa-shield-halved': '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;display:inline-block;margin-right:4px;"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
        'fa-gauge-high': '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;display:inline-block;margin-right:4px;"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>',
        'fa-signal': '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;display:inline-block;margin-right:4px;"><path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V4"/></svg>',
        'fa-server': '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;display:inline-block;margin-right:4px;"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>',
        'fa-lock': '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;display:inline-block;margin-right:4px;"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
        'fa-microchip': '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;display:inline-block;margin-right:4px;"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>',
        'fa-bolt': '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;display:inline-block;margin-right:4px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        'fa-layer-group': '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;display:inline-block;margin-right:4px;"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
        'fa-clock': '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;display:inline-block;margin-right:4px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        'fa-robot': '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;display:inline-block;margin-right:4px;"><rect width="18" height="12" x="3" y="6" rx="2"/><path d="M9 11v2"/><path d="M15 11v2"/><path d="M12 2v4"/></svg>',
        'fa-brain': '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;display:inline-block;margin-right:4px;"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z"/></svg>',
        'fa-database': '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;display:inline-block;margin-right:4px;"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>',
        'fa-fire-flame-curved': '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;display:inline-block;margin-right:4px;"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
        'fa-chart-pie': '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;display:inline-block;margin-right:4px;"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>'
    };

    function updateTopoHUD(nodeKey, playSnd) {
        const data = nodeData[nodeKey];
        if (!data || !hudTitle || !hudMetrics) return;

        if (playSnd && typeof playSound === 'function') {
            playSound('hover');
        }

        hudTitle.textContent = data.title;
        hudMetrics.innerHTML = data.metrics.map(m => {
            const iconSvg = HUD_ICONS[m.icon] || `<i class="fa-solid ${m.icon}"></i>`;
            return `<span class="hud-metric-item"><span style="color:${data.color};display:inline-flex;align-items:center;">${iconSvg}</span>${m.text}</span>`;
        }).join('');
    }

    if (topoNodes && topoNodes.length > 0) {
        topoNodes.forEach(node => {
            node.addEventListener('mouseenter', () => {
                const nodeKey = node.getAttribute('data-node');
                topoNodes.forEach(n => n.classList.remove('active'));
                node.classList.add('active');
                updateTopoHUD(nodeKey, false);
            });

            node.addEventListener('click', () => {
                const nodeKey = node.getAttribute('data-node');
                topoNodes.forEach(n => n.classList.remove('active'));
                node.classList.add('active');
                updateTopoHUD(nodeKey, true);
            });
        });
    }

    function setTopoLayer(layer) {
        topoWires.forEach(wire => {
            wire.className.baseVal = "topo-wire";
        });

        if (layer === 'mesh') {
            document.getElementById('wire-edge-gw')?.classList.add('active-stream');
            document.getElementById('wire-gw-kafka')?.classList.add('active-stream', 'stream-kafka');
            document.getElementById('wire-gw-ai')?.classList.add('active-stream', 'stream-ai');
            document.getElementById('wire-kafka-db')?.classList.add('active-stream', 'stream-kafka');
            document.getElementById('wire-ai-db')?.classList.add('active-stream', 'stream-ai');
        } else if (layer === 'pipeline') {
            document.getElementById('wire-edge-gw')?.classList.add('active-stream');
            document.getElementById('wire-gw-kafka')?.classList.add('active-stream', 'stream-kafka');
            document.getElementById('wire-kafka-db')?.classList.add('active-stream', 'stream-kafka');
        } else if (layer === 'ai') {
            document.getElementById('wire-edge-gw')?.classList.add('active-stream');
            document.getElementById('wire-gw-ai')?.classList.add('active-stream', 'stream-ai');
            document.getElementById('wire-ai-db')?.classList.add('active-stream', 'stream-ai');
        }
    }

    if (topoTabs && topoTabs.length > 0) {
        topoTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                topoTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const layer = tab.getAttribute('data-layer') || 'mesh';
                setTopoLayer(layer);
                if (typeof playSound === 'function') playSound('click');
            });
        });

        // Initialize active stream wires
        setTopoLayer('mesh');
    }

    /* ==========================================
       18. DRAG AND DROP AI PROJECT PARSER
    ========================================== */
    const dropzone = document.getElementById('ai-dropzone');
    const fileInput = document.getElementById('fileInput');
    const parseResult = document.getElementById('ai-parse-result');

    if (dropzone) {
        dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
        dropzone.addEventListener('dragleave', () => { dropzone.classList.remove('dragover'); });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault(); dropzone.classList.remove('dragover');
            if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
        });

        dropzone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) handleFile(e.target.files[0]);
        });

        function handleFile(file) {
            if (file.type !== "text/plain") {
                alert("System Error: Only plain text (.txt) requirement files are accepted.");
                return;
            }

            if (typeof playSound === 'function') playSound('type');
            parseResult.style.display = 'block';
            parseResult.innerHTML = "Uploading text payload...<span class='cursor'>&nbsp;</span>";

            const reader = new FileReader();
            reader.onload = function (e) {
                setTimeout(() => {
                    parseResult.innerHTML = "> Analyzing Requirements via Local Matrix...<span class='cursor'>&nbsp;</span>";
                    if (typeof playSound === 'function') playSound('type');

                    setTimeout(() => {
                        if (typeof playSound === 'function') playSound('success');
                        parseResult.innerHTML = `> ANALYSIS COMPLETE
--------------------------------------
[RECOMMENDED SYSTEM ARCHITECTURE]
Frontend: Custom HTML/CSS + Vanilla JS
Backend: PHP 8.x + MySQL (Custom CMS)
API: Open-Source AI Gateway integration
Server: Cloudflare Edge Network Routing
--------------------------------------
> Estimated Deployment Protocol: 14 Days
> Awaiting human verification...`;
                    }, 1800);
                }, 1200);
            };
            reader.readAsText(file);
        }
    }

    /* ==========================================
       19. DIAGNOSTIC PROTOCOL (MINES GAME)
    ========================================== */
    const launchMinesBtn = document.getElementById('launch-mines-btn');
    const minesOverlay = document.getElementById('mines-overlay');
    const closeMines = document.getElementById('close-mines');
    const minesGrid = document.getElementById('mines-grid');
    const minesStatus = document.getElementById('mines-status');
    const promoBox = document.getElementById('promo-code-box');
    const resetMinesBtn = document.getElementById('reset-mines');

    if (launchMinesBtn && minesOverlay) {
        let safeClicks = 0;
        const totalSafeNeeded = 3;
        const totalTiles = 25;
        const mineCount = 5;
        let isGameOver = false;

        function initMinesGame() {
            minesGrid.innerHTML = '';
            minesStatus.innerText = "Awaiting input...";
            minesStatus.style.color = "var(--text-secondary)";
            promoBox.style.display = "none";
            resetMinesBtn.style.display = "none";
            safeClicks = 0;
            isGameOver = false;

            // Generate tiles array
            let tiles = Array(totalTiles).fill('safe');
            for (let i = 0; i < mineCount; i++) {
                tiles[i] = 'mine';
            }
            // Shuffle
            tiles.sort(() => Math.random() - 0.5);

            for (let i = 0; i < totalTiles; i++) {
                const tile = document.createElement('div');
                tile.className = 'mine-tile hover-sound';
                tile.dataset.type = tiles[i];

                tile.addEventListener('click', () => {
                    if (isGameOver || tile.classList.contains('revealed-safe')) return;

                    if (tile.dataset.type === 'mine') {
                        if (typeof playSound === 'function') playSound('error');
                        tile.classList.add('revealed-mine');
                        tile.innerHTML = '<i class="fa-solid fa-bomb"></i>';
                        minesStatus.innerText = "CRITICAL FAILURE. SYSTEM COMPROMISED.";
                        minesStatus.style.color = "#ef4444";
                        isGameOver = true;
                        resetMinesBtn.style.display = "block";
                        revealAllMines();
                    } else {
                        if (typeof playSound === 'function') playSound('click');
                        tile.classList.add('revealed-safe');
                        tile.innerHTML = '<i class="fa-solid fa-gem"></i>';
                        safeClicks++;

                        if (safeClicks >= totalSafeNeeded) {
                            if (typeof playSound === 'function') playSound('success');
                            minesStatus.innerText = "DIAGNOSTIC PASSED. REWARD UNLOCKED.";
                            minesStatus.style.color = "#4ade80";
                            promoBox.style.display = "block";
                            isGameOver = true;
                            resetMinesBtn.style.display = "block";
                            if (clearance < 2) updateClearance(2);
                        } else {
                            minesStatus.innerText = `Nodes Secured: ${safeClicks} / ${totalSafeNeeded}`;
                        }
                    }
                });
                minesGrid.appendChild(tile);
            }
        }

        function revealAllMines() {
            document.querySelectorAll('.mine-tile').forEach(t => {
                if (t.dataset.type === 'mine' && !t.classList.contains('revealed-mine')) {
                    t.style.background = "rgba(239, 68, 68, 0.5)";
                    t.innerHTML = '<i class="fa-solid fa-bomb"></i>';
                }
            });
        }

        launchMinesBtn.addEventListener('click', () => {
            if (typeof playSound === 'function') playSound('success');
            minesOverlay.classList.add('active');
            initMinesGame();
        });

        closeMines.addEventListener('click', () => {
            if (typeof playSound === 'function') playSound('click');
            minesOverlay.classList.remove('active');
        });

        resetMinesBtn.addEventListener('click', () => {
            if (typeof playSound === 'function') playSound('click');
            initMinesGame();
        });
    }

    /* ==========================================
       20. CLEAN URL SMOOTH SCROLLING
    ========================================== */
// 1. Handle in-page smooth scrolling without mutating URL
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');

        // Let the terminal toggle or empty hashes act normally
        if (!targetId || targetId === '#') return;

        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            // Prevent the default abrupt jump
            e.preventDefault();

            // Scroll smoothly to target section
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

    /* ==========================================
       12. AI POWER RADAR — PREMIUM LEADERBOARD
    ========================================== */
    const leaderboardBody = document.getElementById('leaderboard-body');
    const radarSyncVal = document.getElementById('radar-sync-val');
    const radarTabs = document.querySelectorAll('.radar-tab');

    const AI_DATA = {
        agent: [
            { rank: 1, rank_range: "1 ↔ 2", name: "Claude Fable 5.1 (Max)", lab: "Anthropic · Proprietary", net_improvement: "+13.71%", net_margin: "±1.72%", success_rate: "+19.83%", success_margin: "±2.75%", elo: 1388, status: "trending", license: "Proprietary" },
            { rank: 2, rank_range: "1 ↔ 6", name: "GPT 6 Astra (Max)", lab: "OpenAI · Proprietary", net_improvement: "+11.54%", net_margin: "±2.10%", success_rate: "+17.70%", success_margin: "±3.26%", elo: 1374, status: "trending", license: "Proprietary" },
            { rank: 3, rank_range: "2 ↔ 6", name: "Claude Opus 5 (High)", lab: "Anthropic · Proprietary", net_improvement: "+10.25%", net_margin: "±1.41%", success_rate: "+9.24%", success_margin: "±2.94%", elo: 1362, status: "stable", license: "Proprietary" },
            { rank: 4, rank_range: "2 ↔ 6", name: "Claude Opus 5 (Max)", lab: "Anthropic · Proprietary", net_improvement: "+10.16%", net_margin: "±1.55%", success_rate: "+12.41%", success_margin: "±3.04%", elo: 1360, status: "stable", license: "Proprietary" },
            { rank: 5, rank_range: "2 ↔ 8", name: "Claude Fable 5 (High)", lab: "Anthropic · Proprietary", net_improvement: "+8.81%", net_margin: "±1.25%", success_rate: "+5.97%", success_margin: "±2.66%", elo: 1345, status: "stable", license: "Proprietary" },
            { rank: 6, rank_range: "2 ↔ 8", name: "Claude Opus 4.8 (High)", lab: "Anthropic · Proprietary", net_improvement: "+8.19%", net_margin: "±1.27%", success_rate: "+6.28%", success_margin: "±2.47%", elo: 1338, status: "stable", license: "Proprietary" },
            { rank: 7, rank_range: "5 ↔ 13", name: "GPT 5.6 Sol (xHigh)", lab: "OpenAI · Proprietary", net_improvement: "+7.10%", net_margin: "±1.28%", success_rate: "+3.74%", success_margin: "±2.61%", elo: 1329, status: "stable", license: "Proprietary" },
            { rank: 8, rank_range: "7 ↔ 13", name: "Kimi K3 (Max)", lab: "Moonshot · Kimi K3 license", net_improvement: "+6.22%", net_margin: "±0.62%", success_rate: "+11.91%", success_margin: "±1.28%", elo: 1322, status: "trending", license: "Open Weights" },
            { rank: 9, rank_range: "5 ↔ 16", name: "Claude Sonnet 5 (High)", lab: "Anthropic · Proprietary", net_improvement: "+5.97%", net_margin: "±1.62%", success_rate: "+2.88%", success_margin: "±3.34%", elo: 1318, status: "stable", license: "Proprietary" },
            { rank: 10, rank_range: "7 ↔ 17", name: "GPT 5.5 (xHigh)", lab: "OpenAI · Proprietary", net_improvement: "+5.03%", net_margin: "±0.92%", success_rate: "-0.61%", success_margin: "±2.02%", elo: 1310, status: "stable", license: "Proprietary" }
        ],
        chat: [
            { rank: 1, rank_range: "1 ↔ 3", name: "GPT 6 Astra (Max)", lab: "OpenAI · Proprietary", net_improvement: "+14.20%", net_margin: "±1.50%", success_rate: "+22.10%", success_margin: "±2.10%", elo: 1395, status: "trending", license: "Proprietary" },
            { rank: 2, rank_range: "1 ↔ 3", name: "Claude Opus 5 (Max)", lab: "Anthropic · Proprietary", net_improvement: "+13.85%", net_margin: "±1.40%", success_rate: "+21.40%", success_margin: "±2.05%", elo: 1390, status: "trending", license: "Proprietary" },
            { rank: 3, rank_range: "2 ↔ 5", name: "Gemini 3.1 Pro", lab: "Google DeepMind", net_improvement: "+12.10%", net_margin: "±1.60%", success_rate: "+18.70%", success_margin: "±2.30%", elo: 1378, status: "new", license: "Proprietary" },
            { rank: 4, rank_range: "3 ↔ 6", name: "DeepSeek-V4 (Thinking)", lab: "DeepSeek AI", net_improvement: "+11.45%", net_margin: "±1.30%", success_rate: "+19.20%", success_margin: "±1.95%", elo: 1370, status: "trending", license: "Open Source" },
            { rank: 5, rank_range: "4 ↔ 8", name: "Claude Sonnet 5", lab: "Anthropic · Proprietary", net_improvement: "+10.30%", net_margin: "±1.25%", success_rate: "+16.50%", success_margin: "±2.15%", elo: 1358, status: "stable", license: "Proprietary" },
            { rank: 6, rank_range: "5 ↔ 9", name: "GPT 5.6 Sol", lab: "OpenAI · Proprietary", net_improvement: "+9.80%", net_margin: "±1.10%", success_rate: "+14.90%", success_margin: "±1.80%", elo: 1345, status: "stable", license: "Proprietary" }
        ],
        code: [
            { rank: 1, rank_range: "1 ↔ 2", name: "Claude Opus 5 (Max)", lab: "Anthropic · Proprietary", net_improvement: "+16.40%", net_margin: "±1.80%", success_rate: "+24.80%", success_margin: "±2.50%", elo: 1410, status: "trending", license: "Proprietary" },
            { rank: 2, rank_range: "1 ↔ 3", name: "Claude Fable 5.1 (Max)", lab: "Anthropic · Proprietary", net_improvement: "+15.20%", net_margin: "±1.70%", success_rate: "+22.90%", success_margin: "±2.40%", elo: 1398, status: "trending", license: "Proprietary" },
            { rank: 3, rank_range: "2 ↔ 4", name: "GPT 6 Astra (Max)", lab: "OpenAI · Proprietary", net_improvement: "+14.80%", net_margin: "±1.60%", success_rate: "+21.50%", success_margin: "±2.30%", elo: 1392, status: "stable", license: "Proprietary" },
            { rank: 4, rank_range: "3 ↔ 6", name: "Qwen 3.8 Code Agent", lab: "Alibaba Cloud", net_improvement: "+12.90%", net_margin: "±1.20%", success_rate: "+18.70%", success_margin: "±1.90%", elo: 1375, status: "new", license: "Open Source" },
            { rank: 5, rank_range: "4 ↔ 7", name: "DeepSeek Coder V3", lab: "DeepSeek AI", net_improvement: "+12.50%", net_margin: "±1.30%", success_rate: "+19.10%", success_margin: "±1.85%", elo: 1370, status: "trending", license: "Open Source" }
        ],
        image: [
            { rank: 1, rank_range: "1 ↔ 2", name: "Midjourney v7", lab: "Midjourney Inc.", net_improvement: "+18.20%", net_margin: "±1.90%", success_rate: "+26.50%", success_margin: "±2.80%", elo: 1420, status: "trending", license: "Proprietary" },
            { rank: 2, rank_range: "1 ↔ 3", name: "FLUX.1.2 Pro", lab: "Black Forest Labs", net_improvement: "+16.80%", net_margin: "±1.70%", success_rate: "+24.10%", success_margin: "±2.50%", elo: 1405, status: "trending", license: "Proprietary" },
            { rank: 3, rank_range: "2 ↔ 4", name: "Imagen 4", lab: "Google DeepMind", net_improvement: "+15.40%", net_margin: "±1.50%", success_rate: "+21.80%", success_margin: "±2.20%", elo: 1388, status: "new", license: "Proprietary" },
            { rank: 4, rank_range: "3 ↔ 5", name: "Recraft V3", lab: "Recraft AI", net_improvement: "+14.10%", net_margin: "±1.40%", success_rate: "+20.40%", success_margin: "±2.10%", elo: 1372, status: "trending", license: "Proprietary" },
            { rank: 5, rank_range: "4 ↔ 7", name: "DALL-E 4", lab: "OpenAI · Proprietary", net_improvement: "+13.60%", net_margin: "±1.30%", success_rate: "+19.20%", success_margin: "±2.00%", elo: 1365, status: "stable", license: "Proprietary" }
        ],
        video: [
            { rank: 1, rank_range: "1 ↔ 2", name: "Sora 2", lab: "OpenAI · Proprietary", net_improvement: "+19.50%", net_margin: "±2.10%", success_rate: "+28.20%", success_margin: "±3.10%", elo: 1435, status: "trending", license: "Proprietary" },
            { rank: 2, rank_range: "1 ↔ 3", name: "Runway Gen-4 Alpha", lab: "Runway ML", net_improvement: "+17.80%", net_margin: "±1.90%", success_rate: "+25.40%", success_margin: "±2.80%", elo: 1415, status: "trending", license: "Proprietary" },
            { rank: 3, rank_range: "2 ↔ 4", name: "Kling 2.0 Pro", lab: "Kuaishou Technology", net_improvement: "+16.20%", net_margin: "±1.70%", success_rate: "+23.10%", success_margin: "±2.60%", elo: 1395, status: "new", license: "Proprietary" },
            { rank: 4, rank_range: "3 ↔ 6", name: "Luma Dream Machine 2.0", lab: "Luma AI", net_improvement: "+14.90%", net_margin: "±1.50%", success_rate: "+21.60%", success_margin: "±2.30%", elo: 1380, status: "stable", license: "Proprietary" },
            { rank: 5, rank_range: "4 ↔ 7", name: "Hailuo MiniMax Video-02", lab: "MiniMax AI", net_improvement: "+14.10%", net_margin: "±1.40%", success_rate: "+20.20%", success_margin: "±2.20%", elo: 1370, status: "new", license: "Proprietary" }
        ]
    };

    let currentCategory = 'agent';
    let currentSubcategory = 'agent';
    let ARENA_STORE = null;

    const radarSubtabsContainer = document.getElementById('radar-subtabs');
    const thMetricScore = document.getElementById('th-metric-score');
    const thMetricSecondary = document.getElementById('th-metric-secondary');

    function getSubcatData(cat, sub) {
        if (ARENA_STORE && ARENA_STORE.categories && ARENA_STORE.categories[cat]) {
            const subObj = ARENA_STORE.categories[cat].subcategories;
            if (subObj && subObj[sub]) {
                return subObj[sub];
            }
            // Fallback to first available subcategory
            const firstKey = Object.keys(subObj || {})[0];
            if (firstKey) return subObj[firstKey];
        }
        return null;
    }

    function renderSubtabs(cat) {
        if (!radarSubtabsContainer) return;
        radarSubtabsContainer.innerHTML = '';

        let subcats = [];
        if (ARENA_STORE && ARENA_STORE.categories && ARENA_STORE.categories[cat]) {
            const subMap = ARENA_STORE.categories[cat].subcategories || {};
            subcats = Object.keys(subMap).map(k => ({
                key: k,
                title: subMap[k].title || k,
                desc: subMap[k].description || '',
                url: subMap[k].url || `https://arena.ai/leaderboard/${k}`
            }));
        } else {
            // Default subcategories map if JSON not yet loaded
            const defaults = {
                agent: [{ key: 'agent', title: 'Agent', desc: 'Rankings across agent behavior signals', url: 'https://arena.ai/leaderboard/agent' }],
                chat: [
                    { key: 'text', title: 'Text', desc: 'Rankings across text-to-text tasks and more', url: 'https://arena.ai/leaderboard/text' },
                    { key: 'search', title: 'Search', desc: 'Rankings across web search-integrated LLMs', url: 'https://arena.ai/leaderboard/search' },
                    { key: 'vision', title: 'Vision', desc: 'Rankings across multimodal visual models', url: 'https://arena.ai/leaderboard/vision' },
                    { key: 'document', title: 'Document', desc: 'Rankings across document analysis models', url: 'https://arena.ai/leaderboard/document' }
                ],
                code: [
                    { key: 'webdev', title: 'WebDev', desc: 'Rankings across front-end web development tasks', url: 'https://arena.ai/leaderboard/code/webdev' },
                    { key: 'image-to-webdev', title: 'Image-to-WebDev', desc: 'Rankings across image-to-webdev generation models', url: 'https://arena.ai/leaderboard/code/image-to-webdev' }
                ],
                image: [
                    { key: 'text-to-image', title: 'Text-to-Image', desc: 'Rankings across text-to-image generation models', url: 'https://arena.ai/leaderboard/text-to-image' },
                    { key: 'image-edit', title: 'Image Edit', desc: 'Rankings across image editing models', url: 'https://arena.ai/leaderboard/image-edit' }
                ],
                video: [
                    { key: 'text-to-video', title: 'Text-to-Video', desc: 'Rankings across text-to-video generation models', url: 'https://arena.ai/leaderboard/text-to-video' },
                    { key: 'image-to-video', title: 'Image-to-Video', desc: 'Rankings across image-to-video generation models', url: 'https://arena.ai/leaderboard/image-to-video' },
                    { key: 'video-edit', title: 'Video Edit', desc: 'Rankings across video editing models', url: 'https://arena.ai/leaderboard/video-edit' }
                ]
            };
            subcats = defaults[cat] || defaults['agent'];
        }

        if (subcats.length === 0) return;

        // Ensure currentSubcategory belongs to current parent
        const exists = subcats.find(s => s.key === currentSubcategory);
        if (!exists) {
            currentSubcategory = subcats[0].key;
        }

        subcats.forEach(sub => {
            const btn = document.createElement('button');
            btn.className = `radar-subtab ${sub.key === currentSubcategory ? 'active' : ''}`;
            btn.innerText = sub.title;
            btn.dataset.subcat = sub.key;

            btn.addEventListener('click', () => {
                radarSubtabsContainer.querySelectorAll('.radar-subtab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentSubcategory = sub.key;
                renderLeaderboard(currentCategory, currentSubcategory);
            });

            radarSubtabsContainer.appendChild(btn);
        });
    }

    function renderLeaderboard(category = 'agent', subcategory = 'agent') {
        if (!leaderboardBody) return;
        leaderboardBody.innerHTML = '';

        const isAgent = (category === 'agent' || subcategory === 'agent');
        if (thMetricScore) {
            thMetricScore.innerText = isAgent ? 'NET IMPROVEMENT' : 'SCORE / RATING';
        }
        if (thMetricSecondary) {
            thMetricSecondary.innerText = isAgent ? 'CONFIRMED SUCCESS' : 'VOTES / DETAILS';
        }

        let modelsList = [];
        const subData = getSubcatData(category, subcategory);
        if (subData && subData.models && subData.models.length > 0) {
            modelsList = subData.models;
        } else if (AI_DATA[category]) {
            modelsList = AI_DATA[category];
        }

        if (!modelsList || modelsList.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:1.5rem; color:var(--text-secondary);">Loading live Arena models...</td></tr>';
            return;
        }

        // Rows slide in only when the panel is open to see it; into the closed panel they are just placed (animating 25
        // unseen rows re-laid out the table every frame for a second).
        const rowsShow = !!document.querySelector('#leaderboard-widget:not(.lb-collapsed)');
        modelsList.slice(0, 25).forEach((model, index) => {
            const tr = document.createElement('tr');
            if (rowsShow) {
                tr.style.opacity = '0';
                tr.style.transform = 'translateY(8px)';
                tr.style.transition = `all 0.25s ease ${index * 0.03}s`;
            }

            const rankClass = model.rank === 1 ? 'rank-1' : model.rank === 2 ? 'rank-2' : model.rank === 3 ? 'rank-3' : 'rank-other';
            const statusClass = `badge-${model.status || 'stable'}`;

            const scoreStr = String(model.score || model.net_improvement || '');
            const isPositiveNet = !scoreStr.startsWith('-');
            const netColor = isPositiveNet ? '#10b981' : '#ef4444';

            const numVal = parseFloat(scoreStr.replace(/[^0-9.-]/g, '')) || 5;
            let barWidth = 50;
            if (isAgent) {
                barWidth = Math.min(Math.max(numVal * 4.5, 10), 100);
            } else {
                barWidth = Math.min(Math.max(((numVal - 1000) / 800) * 100, 15), 100);
            }

            const secondaryStr = String(model.secondary || model.success_rate || '-');
            const secondaryColor = !secondaryStr.startsWith('-') ? '#10b981' : '#ef4444';

            tr.innerHTML = `
                <td class="rank-cell">
                    <div class="rank-pill ${rankClass}">${model.rank}</div>
                    ${model.rank_range ? `<span style="font-size:0.6rem; color:var(--text-secondary); display:block; margin-top:2px;">${model.rank_range}</span>` : ''}
                </td>
                <td>
                    <div class="model-info-cell">
                        <span class="model-name" style="font-weight:600; color:var(--text-primary); font-size:0.85rem;">${model.name}</span>
                        <span class="model-meta" style="font-size:0.68rem; color:var(--text-secondary);">${model.lab || 'Arena Verified'}</span>
                    </div>
                </td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-family:'Fira Code', monospace; font-size:0.82rem; font-weight:600; color:${netColor};">
                            ${isAgent ? (isPositiveNet ? '▲ ' : '▼ ') : ''}${scoreStr}
                        </span>
                        <div class="lb-score-bar-bg" style="width: 45px; height: 5px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden;">
                            <div style="width: ${barWidth}%; height: 100%; background: ${netColor}; border-radius: 4px;"></div>
                        </div>
                    </div>
                    ${model.score_margin || model.net_margin ? `<span style="font-size:0.62rem; color:var(--text-secondary); display:block;">${model.score_margin || model.net_margin}</span>` : ''}
                </td>
                <td>
                    <span style="font-family:'Fira Code', monospace; font-size:0.82rem; font-weight:600; color:${secondaryColor};">
                        ${secondaryStr}
                    </span>
                    ${model.secondary_margin || model.success_margin ? `<span style="font-size:0.62rem; color:var(--text-secondary); display:block;">${model.secondary_margin || model.success_margin}</span>` : ''}
                </td>
                <td>
                    <span class="status-badge ${statusClass}">${model.license || 'Proprietary'}</span>
                </td>
            `;
            leaderboardBody.appendChild(tr);

            if (rowsShow) setTimeout(() => {
                tr.style.opacity = '1';
                tr.style.transform = 'translateY(0)';
            }, 20);
        });

        if (radarSyncVal) {
            radarSyncVal.innerText = new Date().toLocaleTimeString();
        }
    }

    // Main Tab Logic
    radarTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            radarTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            renderSubtabs(currentCategory);
            renderLeaderboard(currentCategory, currentSubcategory);
        });
    });

    // Dynamic Live Sync with multi-layer cloud fallback (Local -> API -> GitHub Raw CDN)
    const pageDepth = window.location.pathname.replace(/[^/]*$/, '').split('/').filter(Boolean).length;
    const localDataUrl = (pageDepth ? '../'.repeat(pageDepth) : './') + 'data/arena_leaderboard.json';
    const cloudApiUrl = '/api/arena';
    const githubCdnUrl = 'https://raw.githubusercontent.com/MehediHasan228/poetfolio.me/main/docs/data/arena_leaderboard.json';

    async function loadArenaData() {
        // Source 1: Local / relative JSON
        try {
            const res = await fetch(localDataUrl + '?t=' + Date.now());
            if (res.ok) {
                const data = await res.json();
                if (data && data.categories) return applyData(data);
            }
        } catch(e) {}

        // Source 2: Serverless Cloud API (/api/arena)
        try {
            const res = await fetch(cloudApiUrl);
            if (res.ok) {
                const data = await res.json();
                if (data && data.categories) return applyData(data);
            }
        } catch(e) {}

        // Source 3: Direct GitHub Cloud CDN (Works even if PC is off)
        try {
            const res = await fetch(githubCdnUrl + '?t=' + Date.now());
            if (res.ok) {
                const data = await res.json();
                if (data && data.categories) return applyData(data);
            }
        } catch(e) {}

        // Built-in fallback
        renderSubtabs(currentCategory);
        renderLeaderboard(currentCategory, currentSubcategory);
    }

    function applyData(remoteData) {
        ARENA_STORE = remoteData;
        renderSubtabs(currentCategory);
        renderLeaderboard(currentCategory, currentSubcategory);
        if (remoteData.updated_at && radarSyncVal) {
            const d = new Date(remoteData.updated_at);
            radarSyncVal.innerText = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }

    // The live ranking (a fetch) comes 3 s after load, or as soon as the widget is touched; the built-in ranking shows
    // until then, and the first screen doesn't share the network with it.
    let arenaRequested = false;
    const loadArenaOnce = () => { if (!arenaRequested) { arenaRequested = true; loadArenaData(); } };
    const lbWidgetEl = document.getElementById('leaderboard-widget');
    if (lbWidgetEl) ['pointerenter', 'pointerdown', 'focusin'].forEach((t) => lbWidgetEl.addEventListener(t, loadArenaOnce, { once: true, passive: true }));
    if (document.readyState === 'complete') setTimeout(loadArenaOnce, 3000);
    else window.addEventListener('load', () => setTimeout(loadArenaOnce, 3000), { once: true });

    // Initial render, as a task of its own: the widget starts folded, and its rows were the largest piece of the start-up task
    setTimeout(() => {
        renderSubtabs(currentCategory);
        renderLeaderboard(currentCategory, currentSubcategory);
    }, 0);

    // Pulse update logic (every 60s)
    setInterval(() => {
        if (ARENA_STORE) {
            renderLeaderboard(currentCategory, currentSubcategory);
        }
    }, 60000);

    const lbToggleIcon = document.getElementById('lb-toggle-icon');

    if (lbWidget && lbToggleBtn) {
        function openLeaderboard() {
            lbWidget.classList.remove('lb-collapsed', 'lb-closing');
            lbWidget.classList.add('lb-expanded');
            if (lbToggleIcon) {
                lbToggleIcon.classList.remove('fa-chart-simple');
                lbToggleIcon.classList.add('fa-chevron-right');
            }
            if (typeof playSound === 'function') playSound('click');
        }

        function closeLeaderboard() {
            if (!lbWidget.classList.contains('lb-expanded')) return;
            lbWidget.classList.add('lb-closing');
            
            const closeDelay = (window.innerWidth <= 860) ? 260 : 0;
            setTimeout(() => {
                lbWidget.classList.remove('lb-expanded', 'lb-full-view', 'lb-closing');
                lbWidget.classList.add('lb-collapsed');
                if (lbToggleIcon) {
                    lbToggleIcon.classList.remove('fa-chevron-right', 'fa-chart-simple');
                }
            }, closeDelay);

            if (typeof playSound === 'function') playSound('click');
        }

        let lastToggleTime = 0;
        function toggleLeaderboard() {
            const now = Date.now();
            if (now - lastToggleTime < 320) return;
            lastToggleTime = now;

            if (lbWidget.classList.contains('lb-expanded')) {
                closeLeaderboard();
            } else {
                openLeaderboard();
            }
        }

        // Direct tap/click listener for mobile, tablet, and desktop
        lbToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleLeaderboard();
        });

        // Close on clicking outside on desktop and tablet
        document.addEventListener('click', (e) => {
            if (lbWidget.classList.contains('lb-expanded')) {
                if (!lbWidget.contains(e.target)) {
                    closeLeaderboard();
                }
            }
        });

        window.closeLeaderboardWidget = closeLeaderboard;
    }

    // --- LEADERBOARD FULL VIEW TOGGLE ---
    const lbExpandBtn = document.getElementById('lb-expand-btn');
    if (lbExpandBtn && lbWidget) {
        lbExpandBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Don't trigger the toggle collapse
            lbWidget.classList.toggle('lb-full-view');
            
            // Icon transition
            const icon = lbExpandBtn.querySelector('i');
            if (lbWidget.classList.contains('lb-full-view')) {
                icon.classList.remove('fa-expand');
                icon.classList.add('fa-compress');
            } else {
                icon.classList.remove('fa-compress');
                icon.classList.add('fa-expand');
            }
            
            if (typeof playSound === 'function') playSound('click');
        });
    }

    // --- LEADERBOARD CLOSE BUTTON & BACKDROP DISMISS ---
    const lbCloseBtn = document.getElementById('lb-close-btn');
    if (lbCloseBtn && lbWidget) {
        lbCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof window.closeLeaderboardWidget === 'function') {
                window.closeLeaderboardWidget();
            } else {
                lbWidget.classList.remove('lb-expanded', 'lb-full-view');
                lbWidget.classList.add('lb-collapsed');
            }
        });
    }

    // Tap outside to close modal on mobile
    if (lbWidget) {
        lbWidget.addEventListener('click', (e) => {
            if (window.innerWidth <= 860 && lbWidget.classList.contains('lb-expanded')) {
                const isBackdropClick = (e.target === lbWidget);
                if (isBackdropClick) {
                    if (typeof window.closeLeaderboardWidget === 'function') {
                        window.closeLeaderboardWidget();
                    } else {
                        lbWidget.classList.remove('lb-expanded', 'lb-full-view');
                        lbWidget.classList.add('lb-collapsed');
                    }
                }
            }
        });
    }

    // 2. Handle explicit hash direct links (e.g. #projects)
    const hash = (window.location.hash || '').replace('#', '');
    if (hash && document.getElementById(hash)) {
        setTimeout(() => {
            const target = document.getElementById(hash);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        }, 150);
    }

    // --- AI INSIGHTS: TYPEWRITER & TERMINAL LOGIC ---
    function typewriterEffect(element, text, speed = 40, callback = null) {
        if (!element) return;
        let i = 0;
        element.textContent = '';
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else if (callback) {
                callback();
            }
        }
        type();
    }

    const insightsSection = document.getElementById('ai-insights');
    const aiSubtitle = document.getElementById('ai-subtitle');
    const terminalText = document.getElementById('terminal-text');
    
    if (insightsSection && aiSubtitle && terminalText) {
        const insightsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Trigger Header Typewriter
                    typewriterEffect(aiSubtitle, "Exploring the frontier of Autonomous Agents and Neural Networks.", 50);
                    
                    // Trigger Terminal Typewriter with a small delay
                    setTimeout(() => {
                        typewriterEffect(terminalText, "Analyzing 'AI Insights'... [SYSTEM]: This section decodes the complexities of neural architectures and the future of machine cognition. Status: ACTIVE.", 30);
                    }, 1500);
                    
                    // Unobserve to run only once
                    insightsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        insightsObserver.observe(insightsSection);
    }

    // ==========================================
    // 24b. PHONES: THE CHAT ORB STEPS ASIDE WHILE IT WOULD COVER THE HERO BUTTONS
    // ==========================================
    (function () {
        const orb = document.getElementById('ai-chat-widget');
        const targets = [...document.querySelectorAll('.hero-cta-v2 a, .hero-cta-v2 button')];
        if (!orb || !targets.length) return;
        const phone = window.matchMedia('(max-width: 767px)');
        let raf = 0;
        // instead of hiding, the orb lifts just above the hero buttons while they would sit under it;
        // it is measured only when the page is still (never mid-scroll), so the orb never bobs while scrolling
        const check = () => {
            raf = 0;
            orb.classList.remove('ai-dodge');
            if (!phone.matches || !orb.classList.contains('chat-collapsed') || window.scrollY > 400) { orb.style.removeProperty('--ai-lift'); return; }
            const cur = parseFloat(orb.style.getPropertyValue('--ai-lift')) || 0;
            const o = orb.getBoundingClientRect(), top = o.top + cur, bottom = o.bottom + cur;   // where it sits without the lift
            let lift = 0;
            targets.forEach((t) => {
                const r = t.getBoundingClientRect();
                if (!(o.left > r.right || o.right < r.left || top > r.bottom || bottom < r.top)) lift = Math.max(lift, bottom - r.top + 10);
            });
            if (lift) orb.style.setProperty('--ai-lift', Math.min(lift, 140) + 'px'); else orb.style.removeProperty('--ai-lift');
        };
        const queue = () => { if (!raf) raf = requestAnimationFrame(check); };
        let settle = 0;
        const afterScroll = () => { clearTimeout(settle); settle = setTimeout(queue, 150); };
        if ('onscrollend' in window) addEventListener('scrollend', queue, { passive: true });
        else addEventListener('scroll', afterScroll, { passive: true });
        addEventListener('resize', queue);
        setTimeout(check, 400);
        // the greeting bubble points at the orb, so the orb comes back while it is open and re-checks when it closes
        new MutationObserver(queue).observe(document.body, { childList: true });
    })();

    // ==========================================
    // 25. SMART SCI-FI SRE LIVE TELEMETRY TICKER
    // ==========================================
    const terminalTicker = document.getElementById('terminal-ticker');
    if (terminalTicker) {
        const telemetryPool = [
            { tag: 'SAWAB', tagClass: 'tag-rag', msg: 'NGO ERP on Frappe + Next.js: <b class="metric-hl">10 modules</b>, live demo' },
            { tag: 'JIBIKA', tagClass: 'tag-ai', msg: 'AI in HR &amp; payroll software used by <b class="metric-hl">300+ companies</b> • ~50% less manual work' },
            { tag: 'KARBAR', tagClass: 'tag-stream', msg: 'ERP for Bangladesh: NBR VAT (Mushak 6.3, 6.5, 9.1), payroll &amp; TDS' },
            { tag: 'FLUTTER', tagClass: 'tag-sre', msg: 'Mobile app with NID OCR onboarding and GPS duty tracking' },
            { tag: 'AI VIDEO', tagClass: 'tag-sota', msg: 'FastAPI + Whisper pipeline that turns long videos into <b class="metric-hl">9:16</b> clips' },
            { tag: 'DAILY', tagClass: 'tag-ai', msg: 'Claude, OpenAI, Ollama, LangGraph and MCP in my everyday workflow' },
            { tag: 'TQF', tagClass: 'tag-rag', msg: 'Volunteer: keeping tqfbd.org fast and secure for a national non-profit' }
        ];

        let poolIndex = 0;
        const formatTime = () => '$';
        poolIndex = terminalTicker.children.length;   // the first highlights are already on the page

        // Periodic live stream insertion
        setInterval(() => {
            if (document.hidden) return; // Save resources when tab is backgrounded
            const logItem = telemetryPool[poolIndex % telemetryPool.length];
            poolIndex++;

            const p = document.createElement('p');
            p.className = 'log-line';
            p.style.opacity = '0';
            p.style.transform = 'translateY(-6px)';
            p.innerHTML = `<span class="log-time">${formatTime()}</span> <span class="log-tag ${logItem.tagClass}">${logItem.tag}</span> <span class="log-msg">${logItem.msg}</span>`;

            terminalTicker.insertBefore(p, terminalTicker.firstChild);

            // Animate in
            requestAnimationFrame(() => {
                p.style.transition = 'all 0.4s ease';
                p.style.opacity = '1';
                p.style.transform = 'translateY(0)';
            });

            // Keep exactly the three lines the box shows
            while (terminalTicker.children.length > 3) {
                terminalTicker.removeChild(terminalTicker.lastChild);
            }
        }, 4500);
    }

    // ==========================================
    // 26. MOBILE APP CAROUSEL SLIDERS & TABS (ARCH, ETHICAL & DEEP TECH)
    // ==========================================
    function setupMobileAppCarousel(gridSelector, cardSelector, tabContainerSelector, dotContainerSelector) {
        const grid = document.querySelector(gridSelector);
        if (!grid) return;
        const cards = grid.querySelectorAll(cardSelector);
        if (cards.length === 0) return;

        const tabContainer = document.querySelector(tabContainerSelector);
        const tabs = tabContainer ? tabContainer.querySelectorAll('.arch-tab-btn') : [];
        const dotContainer = document.querySelector(dotContainerSelector);
        const dots = dotContainer ? dotContainer.querySelectorAll('.arch-dot') : [];

        // atStart: the first tab already sits at the left edge, so it is not measured and centred (that would lay the page out mid start-up)
        function setActiveItem(index, triggerScroll = false, atStart = false) {
            if (index < 0 || index >= cards.length) return;

            cards.forEach((card, i) => {
                if (i === index) {
                    card.classList.add('is-active', 'sci-fi-active');
                } else {
                    card.classList.remove('is-active', 'sci-fi-active');
                }
            });

            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });

            const activePillar = cards[index].dataset.pillar;
            if (activePillar) {
                tabs.forEach(tab => {
                    if (tab.dataset.pillar === activePillar) {
                        tab.classList.add('active');
                        // Scroll tab pill horizontally inside tabContainer so active tab is always centered
                        if (!atStart && tabContainer && tabContainer.scrollWidth > tabContainer.clientWidth) {
                            const tabLeft = tab.offsetLeft;
                            const tabWidth = tab.offsetWidth;
                            const containerWidth = tabContainer.clientWidth;
                            tabContainer.scrollTo({
                                left: tabLeft - (containerWidth / 2) + (tabWidth / 2),
                                behavior: 'smooth'
                            });
                        }
                    } else {
                        tab.classList.remove('active');
                    }
                });
            }

            // Scroll carousel card horizontally inside grid ONLY when user triggers scroll
            if (triggerScroll && window.innerWidth <= 860) {
                const cardLeft = cards[index].offsetLeft;
                const cardWidth = cards[index].offsetWidth;
                const gridWidth = grid.clientWidth;
                grid.scrollTo({
                    left: cardLeft - (gridWidth / 2) + (cardWidth / 2),
                    behavior: 'smooth'
                });
            }
        }

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const pillar = tab.dataset.pillar;
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                if (typeof playSound === 'function') playSound('type');

                const targetIdx = Array.from(cards).findIndex(c => c.dataset.pillar === pillar);
                if (targetIdx !== -1) {
                    setActiveItem(targetIdx, true);
                }
            });
        });

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                if (typeof playSound === 'function') playSound('click');
                setActiveItem(i, true);
            });
        });

        let scrollTimeout = null;
        grid.addEventListener('scroll', () => {
            if (window.innerWidth > 860) return;

            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const gridRect = grid.getBoundingClientRect();
                const gridCenter = gridRect.left + gridRect.width / 2;

                let closestIdx = 0;
                let minDistance = Infinity;

                cards.forEach((card, i) => {
                    if (card.classList.contains('is-hidden') || card.style.display === 'none') return;
                    const cardRect = card.getBoundingClientRect();
                    const cardCenter = cardRect.left + cardRect.width / 2;
                    const distance = Math.abs(gridCenter - cardCenter);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestIdx = i;
                    }
                });

                setActiveItem(closestIdx, false);
            }, 45);
        }, { passive: true });

        cards.forEach((card, i) => {
            card.addEventListener('click', (e) => {
                if (window.innerWidth <= 860 && !card.classList.contains('is-active')) {
                    if (e.target.closest('a, button, .cyber-overlay-btn')) {
                        e.preventDefault();
                    }
                    if (typeof playSound === 'function') playSound('click');
                    setActiveItem(i, true);
                }
            });
        });

        // Initialize first visible card as active
        const firstVisibleIdx = Array.from(cards).findIndex(c => !c.classList.contains('is-hidden') && c.style.display !== 'none');
        setActiveItem(firstVisibleIdx !== -1 ? firstVisibleIdx : 0, false, firstVisibleIdx <= 0);
    }

    // Initialize all 4 Mobile App Carousel Sliders (Architecture, Deployments, Ethical/Philosophy, DeepTech/Telemetry)
    setupMobileAppCarousel('.arch-unified-grid', '.arch-unified-card', null, null);
    setupMobileAppCarousel('.projects-grid', '.project-card', '.projects-mobile-tabs', '#projectsCarouselDots');
    setupMobileAppCarousel('#ethicalGrid', '.ethical-card', '.ethical-mobile-tabs', '#ethicalDots');
    setupMobileAppCarousel('#deeptechGrid', '#deeptechGrid .archive-card', '.deeptech-mobile-tabs', '#deeptechDots');

    // The carousels start snapping with the visitor's first touch, wheel or key (html.snap-ready in the stylesheet).
    // A snap counts as a scroll, and Chrome stops measuring the largest paint (LCP) at the first scroll, so it must never
    // happen on its own: on a slow first paint a timed snap landed before the hero was measured and the score had no LCP.
    const snapReady = () => document.documentElement.classList.add('snap-ready');
    ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(t => window.addEventListener(t, snapReady, { once: true, passive: true }));

    // Project screenshots (data-bg) load as the projects section comes near, not with the first screen.
    const previews = document.querySelectorAll('.project-preview[data-bg]');
    const showPreviews = () => previews.forEach(el => { el.style.backgroundImage = `url('${el.dataset.bg}')`; });
    const projectsGrid = document.querySelector('.projects-grid');
    if (previews.length && projectsGrid && 'IntersectionObserver' in window) {
        const previewObserver = new IntersectionObserver((entries) => {
            if (!entries.some(e => e.isIntersecting)) return;
            previewObserver.disconnect();
            showPreviews();
        }, { rootMargin: '800px 0px' });
        previewObserver.observe(projectsGrid);
    } else showPreviews();

    // The architecture tags' logos (data-src on the home page) load one by one as they come within 300 px.
    const tagIcons = document.querySelectorAll('img.arch-tag-icon[data-src]');
    const showTagIcon = (img) => { img.src = img.dataset.src; img.removeAttribute('data-src'); };
    if (tagIcons.length && 'IntersectionObserver' in window) {
        const tagObserver = new IntersectionObserver((entries) => entries.forEach((e) => {
            if (!e.isIntersecting) return;
            tagObserver.unobserve(e.target);
            showTagIcon(e.target);
        }), { rootMargin: '300px 0px' });
        tagIcons.forEach((img) => tagObserver.observe(img));
    } else tagIcons.forEach(showTagIcon);

    // Animations that loop forever cost a style pass every frame even off screen (the live dots far down the page, cover
    // blobs). After load each one rests while its element is off screen (.anim-rest in the stylesheet). The portrait
    // card's own loops are paused by the stylesheet until the card is opened.
    const restAnimations = () => {
        if (!('IntersectionObserver' in window) || !document.getAnimations) return;
        const looping = new Set();
        document.getAnimations().forEach((a) => {
            const el = a.effect && a.effect.target;
            if (!(a instanceof CSSAnimation) || !el || el.closest('.cinematic-depth-card')) return;
            if (a.effect.getComputedTiming().iterations === Infinity) looping.add(el);
        });
        const restObserver = new IntersectionObserver((entries) => {
            entries.forEach((e) => e.target.classList.toggle('anim-rest', !e.isIntersecting));
        }, { rootMargin: '120px' });
        looping.forEach((el) => restObserver.observe(el));
    };
    if (document.readyState === 'complete') setTimeout(restAnimations, 300);
    else window.addEventListener('load', () => setTimeout(restAnimations, 300), { once: true });

    // ----------------------------------------------------
    // Unified System Architecture & Enterprise Stack Filters
    // ----------------------------------------------------
    const unifiedFilterBtns = document.querySelectorAll('.arch-unified-filter-btn');
    const unifiedCards = document.querySelectorAll('.arch-unified-card');

    if (unifiedFilterBtns.length > 0 && unifiedCards.length > 0) {
        unifiedFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter || 'pillars';

                unifiedFilterBtns.forEach(b => {
                    const isActive = b === btn;
                    b.classList.toggle('active', isActive);
                    b.setAttribute('aria-selected', isActive ? 'true' : 'false');
                });

                // Center the active button horizontally on mobile
                const container = btn.closest('.arch-unified-filters');
                if (container && window.innerWidth <= 860) {
                    const scrollLeft = btn.offsetLeft - (container.offsetWidth / 2) + (btn.offsetWidth / 2);
                    container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                }

                unifiedCards.forEach(card => {
                    const domain = card.dataset.domain;
                    let shouldShow = false;

                    if (filter === 'pillars') {
                        shouldShow = (domain === 'pillars');
                    } else if (filter === 'all') {
                        shouldShow = (domain !== 'pillars');
                    } else {
                        shouldShow = (domain === filter);
                    }

                    if (shouldShow) {
                        card.classList.remove('is-hidden');
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.96)';
                        requestAnimationFrame(() => {
                            card.style.transition = 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        });
                    } else {
                        card.classList.add('is-hidden');
                    }
                });

                // Reset grid scroll position on mobile when filter changes & activate first visible card
                const grid = document.querySelector('.arch-unified-grid');
                if (grid && window.innerWidth <= 860) {
                    grid.scrollTo({ left: 0, behavior: 'smooth' });
                    setTimeout(() => {
                        const visibleCards = Array.from(unifiedCards).filter(c => !c.classList.contains('is-hidden'));
                        if (visibleCards.length > 0) {
                            unifiedCards.forEach(c => c.classList.remove('is-active', 'sci-fi-active'));
                            visibleCards[0].classList.add('is-active', 'sci-fi-active');
                        }
                    }, 80);
                }

                if (typeof playSound === 'function') playSound('click');
            });
        });
    }

    // ----------------------------------------------------
    // Smart Dynamic Island Collapse on Scroll (Mobile)
    // ----------------------------------------------------
    const mainNav = document.querySelector('nav');
    const mainLogoLink = document.querySelector('.logo-link');

    if (mainNav) {
        const handleNavScroll = () => {
            if (window.innerWidth <= 768) {
                if (window.scrollY > 45) {
                    mainNav.classList.add('nav-scrolled');
                } else {
                    mainNav.classList.remove('nav-scrolled');
                }
            } else {
                mainNav.classList.remove('nav-scrolled');
            }
        };

        window.addEventListener('scroll', handleNavScroll, { passive: true });
        handleNavScroll();

        // Tapping floating logo when scrolled smoothly returns to top
        if (mainLogoLink) {
            mainLogoLink.addEventListener('click', (e) => {
                if (window.innerWidth <= 768 && window.scrollY > 45) {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    if (typeof playSound === 'function') playSound('click');
                }
            });
        }
    }

    console.log("/// Mehedi Portfolio OS Initialized /// Status: NOMINAL");
});

// --- Mobile Menu Drawer Toggle ---
function openMobileMenu() {
    const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');
    const mobileBackdrop = document.getElementById('mobile-menu-backdrop');
    if (mobileMenuDrawer) {
        mobileMenuDrawer.classList.add('drawer-open');
    }
    if (mobileBackdrop) {
        mobileBackdrop.classList.add('active');
    }
    document.body.classList.add('drawer-open');
}

function closeMobileMenu(e) {
    if (e && e.cancelable && e.preventDefault) { e.preventDefault(); }
    if (e && e.stopPropagation) { e.stopPropagation(); }
    const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');
    const mobileBackdrop = document.getElementById('mobile-menu-backdrop');
    if (mobileMenuDrawer) {
        mobileMenuDrawer.classList.remove('drawer-open');
    }
    if (mobileBackdrop) {
        mobileBackdrop.classList.remove('active');
    }
    document.body.classList.remove('drawer-open');
}

function toggleMobileMenu(e) {
    if (e && e.cancelable && e.preventDefault) { e.preventDefault(); }
    if (e && e.stopPropagation) { e.stopPropagation(); }
    const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');
    if (mobileMenuDrawer && mobileMenuDrawer.classList.contains('drawer-open')) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.openMobileMenu = openMobileMenu;

function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');
    const mobileBackdrop = document.getElementById('mobile-menu-backdrop');
    const navLinks = document.querySelectorAll('#mobile-menu-drawer .nav-links a');

    if (mobileMenuToggle && !mobileMenuToggle.getAttribute('onclick')) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    if (mobileMenuClose && !mobileMenuClose.getAttribute('onclick')) {
        mobileMenuClose.addEventListener('click', closeMobileMenu);
    }

    if (mobileBackdrop) {
        mobileBackdrop.addEventListener('click', closeMobileMenu);
        mobileBackdrop.addEventListener('touchend', closeMobileMenu);
    }
    
    // Close drawer when a nav link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
} else {
    initMobileMenu();
}
