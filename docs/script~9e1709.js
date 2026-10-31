document.addEventListener('DOMContentLoaded', async () => {
    // The first screen (and the hero photo, the page's largest paint) draws before all the set-up below runs; a hidden
    // or prerendering tab, where no frame comes, starts after 100 ms.
    await new Promise((go) => { let done = false; const once = () => { if (!done) { done = true; setTimeout(go, 0); } }; requestAnimationFrame(once); setTimeout(once, 100); });

    // Respect the OS "reduce motion" setting for the heavy decorative effects.
    const PREFERS_REDUCED_MOTION = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    // The browser may refuse site storage (blocked cookies, some private windows): then reading it throws. Every read and
    // write goes through these two, so the page works the same without it and only forgets the visitor's choices.
    const local = {
        get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }
    };
    const session = {
        get: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
        set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} }
    };

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
    let clearance = parseInt(local.get('mehedi_clearance')) || 1;
    const clrDisplay = document.getElementById('clearance-level');

    function updateClearance(level) {
        if (level > clearance) {
            clearance = level;
            local.set('mehedi_clearance', clearance);
            if (typeof playSound === 'function') playSound('success');
        }
        if (clrDisplay) {
            if (clearance === 1) clrDisplay.innerText = "LVL 1 (GUEST)";
            if (clearance === 2) clrDisplay.innerText = "LVL 2 (HACKER)";
            if (clearance === 3) clrDisplay.innerText = "LVL 3 (ENGINEER)";
            if (clearance >= 4) {
                clrDisplay.innerText = "LVL MAX (ROOT)";
                clrDisplay.style.color = "#ef4444";
            }
        }
    }
    updateClearance(clearance);

    /* ==========================================
       1. SYNTHESIZED TACTILE UI AUDIO
    ========================================== */
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx;
    // sound is off until the visitor turns it on; a choice they saved before is kept
    const savedMute = local.get('mehedi_muted');
    let isMuted = savedMute === null ? true : savedMute === 'true';

    // Sound's one control is the last row of the header's theme menu, a menuitemcheckbox: checked while sound is on, its
    // speaker icon showing the same. Toggling it leaves the menu open, with focus on the row.
    function updateSoundIcons() {
        document.querySelectorAll('[data-sound-toggle]').forEach((item) => {
            item.setAttribute('aria-checked', String(!isMuted));
            const ico = item.querySelector('.tm-ico');
            if (ico) ico.className = 'fa-solid ' + (isMuted ? 'fa-volume-xmark' : 'fa-volume-high') + ' tm-ico';
        });
    }
    updateSoundIcons();

    document.addEventListener('click', (e) => {
        const soundBtn = e.target.closest('[data-sound-toggle]');
        if (soundBtn) {
            e.preventDefault();
            isMuted = !isMuted;
            local.set('mehedi_muted', isMuted);
            updateSoundIcons();
            // Safari doesn't focus a clicked button: the row keeps the menu's focus either way
            if (document.activeElement !== soundBtn) soundBtn.focus({ preventScroll: true });
            // turned on, the audio engine starts just after this click has painted: starting it (the browser's audio
            // service, the first time) held the button's new state back
            if (!audioCtx && !isMuted) requestAnimationFrame(() => setTimeout(() => { if (!audioCtx && !isMuted) audioCtx = new AudioContext(); }, 0));
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
    makeDraggable(document.getElementById('sys-monitor'), document.querySelector('#sys-monitor .mon-title'));

    /* ==========================================
       5.1 APPLE CINEMATIC 3D DEPTH CONTROLLER (PARALLAX + GYROSCOPE)
    ========================================== */
    function initCinematicDepth() {
        const cards = document.querySelectorAll('.cinematic-depth-card');
        if (!cards.length) return;

        cards.forEach(card => {
            const wrapper = card.closest('.cinematic-depth-wrapper') || card;
            const heroSection = card.closest('header.hero') || document.querySelector('header.hero') || document.body;
            const bgLayer = card.querySelector('.layer-bg');
            const subject = card.querySelector('.layer-subject');

            // Physics state
            let currentCardRotY = 0;
            let currentSubjX = 0;
            let currentIntensity = 0;

            let targetCardRotY = 0;
            let targetSubjX = 0;
            let targetIntensity = 0;

            let isDirectHover = false;
            let isHeroActive = false;
            let isGyroActive = false;
            let baseGamma = null;
            let rafId = null;

            // Maximum values (Apple spatial depth standards: pure horizontal 3D depth, locked vertically)
            const MAX_ROTATION_Y = 2.4; // degrees (subtle, natural iPhone stereoscopic horizontal rotation)
            const MAX_SUBJECT_SHIFT = 6.0; // px (pure horizontal spatial depth drift)

            function render() {
                // Spring / Lerp smoothing
                const factor = isGyroActive ? 0.12 : 0.085;
                currentCardRotY += (targetCardRotY - currentCardRotY) * factor;
                currentSubjX += (targetSubjX - currentSubjX) * factor;
                currentIntensity += (targetIntensity - currentIntensity) * factor;

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

                // Check motion settle
                const isMoving = Math.abs(targetCardRotY - currentCardRotY) > 0.02 ||
                                 Math.abs(targetSubjX - currentSubjX) > 0.05 ||
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

            function computeTargets(clientX, directHover) {
                const rect = card.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;

                // Normalized -1 to 1 based on card size with smooth bounds
                const normX = Math.max(-1, Math.min(1, (clientX - centerX) / (rect.width / 2)));

                // Direct hover gets full intensity (1.0), ambient hero motion gets refined subtle intensity (0.38)
                isDirectHover = directHover;
                targetIntensity = directHover ? 1.0 : 0.38;

                targetCardRotY = normX * MAX_ROTATION_Y * targetIntensity;
                targetSubjX = normX * MAX_SUBJECT_SHIFT * targetIntensity;

                isHeroActive = true;
                startRender();
            }

            function resetTargets() {
                targetCardRotY = 0;
                targetSubjX = 0;
                targetIntensity = 0;
                isDirectHover = false;
                isHeroActive = false;
                startRender();
            }

            // 1. Direct card hover: full parallax (the photo sharpens with CSS :hover)
            wrapper.addEventListener('mousemove', (e) => {
                e.stopPropagation();
                computeTargets(e.clientX, true);
            });

            wrapper.addEventListener('mouseleave', () => {
                isDirectHover = false;
                targetIntensity = 0.38;
                startRender();
            });

            // 2. Ambient parallax while the mouse moves anywhere over the hero
            if (heroSection) {
                heroSection.addEventListener('mousemove', (e) => {
                    if (!isDirectHover) {
                        computeTargets(e.clientX, false);
                    }
                });

                heroSection.addEventListener('mouseleave', resetTargets);
            }

            // 3. Mobile touch (drag & pan)
            const onTouch = (e) => {
                if (e.touches && e.touches[0]) computeTargets(e.touches[0].clientX, true);
            };
            wrapper.addEventListener('touchstart', onTouch, { passive: true });
            wrapper.addEventListener('touchmove', onTouch, { passive: true });
            wrapper.addEventListener('touchend', resetTargets);

            // 4. Mobile gyroscope 3D tilt (iPhone & Android)
            function handleOrientation(e) {
                if (e.beta === null || e.gamma === null) return;
                isGyroActive = true;

                // Dynamic baseline drift: smoothly adapts to user hand posture
                if (baseGamma === null) {
                    baseGamma = e.gamma;
                } else {
                    baseGamma += (e.gamma - baseGamma) * 0.015;
                }

                // Responsive tilt mapping (-18 to +18 degrees = full 3D range)
                const normX = Math.max(-1, Math.min(1, (e.gamma - baseGamma) / 18));
                targetCardRotY = normX * (MAX_ROTATION_Y * 1.25);
                targetSubjX = normX * (MAX_SUBJECT_SHIFT * 1.35);

                startRender();
            }

            // Enable the orientation sensor (iOS asks permission, Android needs none)
            function initGyro() {
                if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                    DeviceOrientationEvent.requestPermission().then(res => {
                        if (res === 'granted') {
                            window.addEventListener('deviceorientation', handleOrientation, { passive: true });
                        }
                    }).catch(() => {});
                } else if (window.DeviceOrientationEvent) {
                    window.addEventListener('deviceorientation', handleOrientation, { passive: true });
                }
            }

            // Bind sensor permissions to user gesture
            document.addEventListener('touchstart', initGyro, { once: true, passive: true });
            document.addEventListener('click', initGyro, { once: true, passive: true });
        });
    }

    initCinematicDepth();

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
       8. CLI TERMINAL (EASTER EGG)
    ========================================== */
    // Opened with the ` / ~ key (outside text fields). Closed, the overlay is inert, so Tab
    // never lands in it; open, focus goes to the prompt and stays inside, and Esc hands it back to whatever had it.
    const cliTerminal = document.getElementById('cli-terminal');
    const cliClose = document.getElementById('close-cli');
    const cliInput = document.getElementById('cli-input');
    const cliOutput = document.getElementById('cli-output');

    if (cliTerminal && cliInput) {
        let cliReturnFocus = null;
        const openCli = () => {
            if (cliTerminal.classList.contains('active')) return;
            cliReturnFocus = document.activeElement;
            cliTerminal.removeAttribute('inert');
            cliTerminal.classList.add('active');
            cliInput.focus({ preventScroll: true });
            playSound('success');
        };
        const closeCli = () => {
            if (!cliTerminal.classList.contains('active')) return;
            cliTerminal.classList.remove('active');
            cliTerminal.setAttribute('inert', '');
            if (cliReturnFocus && cliReturnFocus.isConnected && cliReturnFocus !== document.body) cliReturnFocus.focus({ preventScroll: true });
            else cliInput.blur();
            cliReturnFocus = null;
        };

        document.addEventListener('keydown', (e) => {
            if ((e.key !== '`' && e.key !== '~') || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
            if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
            e.preventDefault();   // the key only opens the terminal; it isn't typed into the prompt
            openCli();
        });
        // while it is open, Esc and Tab are the terminal's wherever focus has drifted (a click on the backdrop); caught
        // on the way down, so the chat and the menu, which close on Esc too, never see it
        document.addEventListener('keydown', (e) => {
            if (!cliTerminal.classList.contains('active')) return;
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                closeCli();
            } else if (e.key === 'Tab' && cliClose) {
                // the prompt and the close button are the only stops, so Tab moves between them
                e.preventDefault();
                (document.activeElement === cliInput ? cliClose : cliInput).focus();
            }
        }, true);
        cliTerminal.addEventListener('click', (e) => { if (e.target === cliTerminal) closeCli(); });   // the backdrop
        if (cliClose) cliClose.addEventListener('click', closeCli);

        const cliCommands = {
            'help': 'Available commands: help, about, skills, projects, theme, clear, exit, vault, solarsmash, hw-scan',
            'about': 'I am a Full-Stack Web Developer, AI Automation Engineer, and Digital Efficiency Architect with 4+ years of production experience building intelligent web systems, distributed microservices (NestJS, Postgres, Kafka, Redis), and autonomous LLM workflows.',
            'skills': 'Languages: PHP, JavaScript, SQL, Liquid.\nFrameworks: Tailwind, Laravel.\nTools: Git, VS Code, Cloudflare, openclaw, Antigravity, claude.',
            'projects': 'Accessing secure database... Use the GUI interface on the main portal to view VIP projects.',
            'sudo': 'Nice try. This incident will be reported.',
            'ls': 'index.php  style.css  script.js  db_connect.php  nuclear.php',
            'vault': 'ACCESSING SECURE NUMISMATIC VAULT...\n\n   ___________________\n  /                   \\\n |  1917 ONE RUPEE   |\n |   BRITISH INDIA   |\n  \\___________________/\n\n   ___________________\n  /                   \\\n |    1948 1 RUPEE   |\n |     PAKISTAN      |\n  \\___________________/',
            'solarsmash': 'INITIATING TITAN DIAGNOSTIC...\nTARGET: MOON TITAN\nWEAPON: PLANETARY LASER\n[||||||||||||||||||||] 100%\nCRITICAL HIT. CORE DESTABILIZED.\nMISSION COMPLETE.'
        };

        cliInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !cliInput.readOnly) {   // read-only while hw-scan runs
                const val = cliInput.value.trim().toLowerCase();
                cliInput.value = '';
                playSound('type');

                const echo = document.createElement('div');   // what was typed goes in as text, never as markup
                echo.innerHTML = '<span class="sys">root@mehedi.pro:~$</span> ';
                echo.append(val);
                cliOutput.append(echo);

                if (val === 'clear') {
                    cliOutput.innerHTML = '';
                } else if (val === 'exit') {
                    closeCli();
                } else if (val === 'hw-scan') {
                    cliOutput.innerHTML += `<div style="color:var(--accent-1); margin-top:5px;">[SYSTEM] Commencing Hardware Diagnostic...</div>`;
                    cliInput.readOnly = true;   // not disabled: the prompt keeps focus, so Esc and Tab still work

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
                            cliInput.readOnly = false;
                            cliInput.focus();
                            playSound('success');
                            updateClearance(3);
                        }
                    }, 600);

                } else if (val === 'theme' || val.startsWith('theme ')) {
                    // `theme` lists the themes and marks the current one; `theme <name>` switches, like the header's menu
                    const name = val.slice(5).trim();
                    const line = document.createElement('div');
                    line.style.color = '#d4d4d4';
                    if (!name) {
                        const cur = Object.keys(THEME_KEYS).find((n) => THEME_KEYS[n] === document.documentElement.getAttribute('data-theme'));
                        line.textContent = 'Themes: ' + cliThemeNames().map((n) => (n === cur ? n + ' (current)' : n)).join(', ') + '. Usage: theme <name>';
                    } else if (cliTheme(name)) {
                        line.textContent = 'Theme set to ' + name + '.';
                    } else {
                        line.className = 'err';
                        line.textContent = 'theme: unknown theme "' + name + '". Try: ' + cliThemeNames().join(', ');
                    }
                    cliOutput.append(line);
                } else if (cliCommands[val]) {
                    cliOutput.innerHTML += `<div style="color:#d4d4d4;">${cliCommands[val].replace(/\n/g, '<br>')}</div>`;
                    if (val === 'vault') updateClearance(2);
                } else if (val !== '') {
                    const err = document.createElement('div');
                    err.className = 'err';
                    err.textContent = `bash: ${val}: command not found`;
                    cliOutput.append(err);
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

    // Chat Worker URL (chat-worker/). Empty = no AI: every answer comes from the site (offlineReply). After `wrangler
    // deploy`, paste the URL here, e.g. 'https://mehedi-chat.<your-subdomain>.workers.dev'
    const CHAT_API_URL = 'https://mehedi-chat.rajnieem.workers.dev';

    // ── CHAT FUNCTIONS ─────────────────────────────────────────────────────────
    if (chatWidget && chatHeader) {
        // AI Orb Mascot Reference
        const getMascot = () => document.getElementById('chat-mascot') || chatWidget.querySelector('ai-orb-mascot');

        // The header's toggle (the orb and the name) is a button, so the keyboard opens and closes the chat too; the language
        // and new-chat buttons beside it are their own. A click elsewhere on the header still toggles, as before.
        const chatToggle = document.getElementById('chat-toggle');
        chatHeader.addEventListener('click', (e) => {
            if (e.target.closest('.chat-head-btn')) return;
            // detail 0 from the browser: Enter or Space on the toggle. The greeting bubble's own click() has detail 0 too,
            // but is not trusted: a tap on the bubble must not raise the phone keyboard over the panel
            toggleChat(e.detail === 0 && e.isTrusted);
        });
        // Esc closes it and hands focus back to the toggle (when focus was in the chat, or nowhere). The greeting bubble
        // has Esc while it shows.
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape' || e.defaultPrevented || !chatWidget.classList.contains('chat-expanded') || document.getElementById('ai-orb-speech-bubble')) return;
            const nowhere = !document.activeElement || document.activeElement === document.body;
            toggleChat();   // focus in the chat goes back to the toggle there
            if (nowhere && chatToggle) chatToggle.focus({ preventScroll: true });
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

        // On the tab-bar layout the open chat is a sheet over the page: what it covers goes inert, so Tab stays in the chat
        // and the header above it (the menu's drawer and backdrop are the menu's to manage). Like the phone menu, it wakes only
        // what it made inert, and only after the panel's first frame (an inert long page restyles all of it). A turn to the
        // floating layout wakes the page too.
        const chatSheetMQ = window.matchMedia('(max-width: 767.98px), (min-width: 768px) and (max-width: 1023.98px) and (min-height: 600px)');
        let chatMuted = [];
        function syncChatCover() {
            const cover = chatWidget.classList.contains('chat-expanded') && chatSheetMQ.matches;
            if (cover && !chatMuted.length) {
                [].forEach.call(document.body.children, (el) => {
                    if (el === chatWidget || el.tagName === 'NAV' || el.tagName === 'SCRIPT' || el.inert || el.id.startsWith('mobile-menu-')) return;
                    el.inert = true; chatMuted.push(el);
                });
            } else if (!cover && chatMuted.length) {
                chatMuted.forEach((el) => { el.inert = false; }); chatMuted = [];
            }
        }
        chatSheetMQ.addEventListener('change', syncChatCover);

        // Folded, the panel's parts are inert, so Tab passes the widget by; the toggle says whether it is open
        function syncChatState() {
            const open = chatWidget.classList.contains('chat-expanded');
            if (chatToggle) chatToggle.setAttribute('aria-expanded', String(open));
            chatWidget.querySelectorAll('.chat-body, .chat-input-area, .chat-mode-bar, .chat-foot').forEach((el) => { el.inert = !open; });
            requestAnimationFrame(() => setTimeout(syncChatCover, 0));
        }

        // fromKeyboard: opened with Enter or Space, so the message box takes focus at once (with a mouse it does too, a
        // moment later; on a touch screen it waits for a tap, or the keyboard would cover the panel)
        function toggleChat(fromKeyboard = false) {
            chatWidget.classList.toggle('chat-expanded');
            chatWidget.classList.toggle('chat-collapsed');
            const open = chatWidget.classList.contains('chat-expanded');
            // closing with focus inside (a keyboard close, or the panel tucking itself away) gives it back to the toggle
            // before the panel turns inert
            if (!open && chatToggle && chatWidget.contains(document.activeElement) && document.activeElement !== chatToggle) chatToggle.focus({ preventScroll: true });
            syncChatState();

            // Clear any inline styles from keyboard sync when toggling
            chatWidget.style.bottom = '';
            chatWidget.style.maxHeight = '';

            const mascot = getMascot();
            const icon = document.getElementById('chat-toggle-icon');
            if (icon) {
                icon.classList.toggle('fa-chevron-down', open);
                icon.classList.toggle('fa-chevron-up', !open);
            }
            if (open) {
                // USER OPENS CHAT: blink, a slight excited look and a tiny bounce, then back to normal
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
                if (fromKeyboard) chatInput.focus({ preventScroll: true });
                else if (window.matchMedia('(pointer: fine)').matches) setTimeout(() => chatInput.focus({ preventScroll: true }), 260);
            } else if (mascot) {
                mascot.setExpression('idle');
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
            get: (k, d) => { try { return JSON.parse(session.get(k)) || d; } catch (e) { return d; } },
            set: (k, v) => session.set(k, JSON.stringify(v))
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
        const lang = () => (local.get('chat:lang') === 'bn' ? 'bn' : 'en');
        // Project discussion stays on for the whole conversation (and across pages) until ended
        let fitMode = !!store.get('chat:project', false);
        const brief = () => String(store.get('chat:brief', '') || '');
        const modeBar = document.createElement('div');
        modeBar.className = 'chat-mode-bar';
        modeBar.hidden = true;
        const inputArea = chatWidget.querySelector('.chat-input-area');
        if (inputArea) inputArea.before(modeBar);
        syncChatState();
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
            const visits = num(local.get('greet:visits')), awayRaw = session.get('greet:away'), away = awayRaw === null ? null : num(awayRaw);
            const pages = num(session.get('greet:pages')), from = session.get('greet:from'), page = pageKey(), h = new Date().getHours();
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
        chatHeader.addEventListener('click', () => { if (chatWidget.classList.contains('chat-expanded')) { local.set('chat:seen', String(Date.now())); rotatePlaceholder(true); } });

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
            local.set('chat:lang', lang() === 'bn' ? 'en' : 'bn');
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
        const SITE_PAGES = { '/': 'Home', '/profile/': 'Profile', '/projects/': 'Projects', '/architecture/': 'Architecture', '/people/': 'People', '/contact/': 'Contact', '/library/': 'Library' };
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

        // When no AI answers (the Worker is down, e.g. the Gemini credits run out), offlineNote says so in the visitor's
        // language, and this gives the sentences of the site's own knowledge file (the one the AI reads) that match the
        // question, with a way to ask Mehedi himself. Small talk, contact and prices keep their set replies.
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
                return formatReply(bn ? 'ভালো আছি, ধন্যবাদ! আমার কাজ, প্রজেক্ট বা স্কিল নিয়ে জিজ্ঞেস করলে আমার সাইট থেকে উত্তর দিতে পারব।' :
                    "Hi! Ask me about my work, projects or stack and I'll answer from my site.");
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
                const lead = bn ? 'সাইট থেকে আমার কয়েকটা প্রজেক্ট:' : 'Here are some of my projects from the site:';
                return formatReply(lead + '\n' + list.join('\n')) + ask.replace('</div>', `<a class="chat-action" href="/projects/">${bn ? 'সব প্রজেক্ট' : 'All projects'}</a></div>`);
            }
            if (hits.length) {
                const lead = bn ? 'আমার সাইটে যা লেখা আছে তা থেকে বলছি:' : 'Here is what my site says:';
                return formatReply(lead + '\n' + hits.map((h) => '• ' + h).join('\n')) + ask;
            }
            if (key) return formatReply(KNOWLEDGE_BASE[key].response);
            return formatReply(bn ? 'একটু পরে আবার জিজ্ঞেস করুন, অথবা সরাসরি আমাকে লিখুন:' :
                'Please ask again in a little while, or write to me directly:') + ask;
        }

        // One calm line above every answer while the AI is offline, with the page's own WhatsApp and email links
        const OFFLINE_ICON = '<svg class="chip-ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.6 12.5H4a3 3 0 0 1-.4-6 4.3 4.3 0 0 1 7.6-1.4M12.6 7.2A2.7 2.7 0 0 1 12 12.5H7.4"/><path d="M2.5 2.5l11 11"/></svg>';
        function offlineNote(txt) {
            const bn = /[\u0980-\u09FF]/.test(txt) || lang() === 'bn';
            const href = (sel, fallback) => { const a = document.querySelector(sel); return esc(a ? a.getAttribute('href') : fallback); };
            const wa = `<a href="${href('a.whatsapp-btn', 'https://wa.me/8801799447594')}" target="_blank" rel="noopener">WhatsApp</a>`;
            const mail = href('a[href^="mailto:"]', 'mailto:mehedihasan228.cse@gmail.com');
            return `<p class="chat-offline-note">${OFFLINE_ICON}<span>` + (bn
                ? `আমার AI এই মুহূর্তে অফলাইনে আছে — ${wa}-এ মেসেজ দিন বা <a href="${mail}">ইমেইল</a> করুন।`
                : `My AI is offline right now — message me on ${wa} or <a href="${mail}">email</a>.`) + '</span></p>';
        }

        // the header's status line tells the truth: Offline once the Worker fails, Online again when it next answers
        const headSub = chatWidget.querySelector('.chat-header-sub');
        function setLive(on) {
            if (!headSub || headSub.classList.contains('is-off') !== on) return;
            headSub.classList.toggle('is-off', !on);
            headSub.lastChild.textContent = on ? 'Online · replies in seconds' : 'Offline · answers from my site';
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
                setLive(true);
            } catch (primaryError) {
                console.warn("[AI_CHAT] Chat worker unavailable, answering from the site's knowledge file.", primaryError && primaryError.message);
                setLive(false);
                if (mode === 'fit') {
                    // a fit check needs his real record: without the Worker, hand the brief straight to Mehedi
                    const bn = /[\u0980-\u09FF]/.test(txt);
                    typingEl.innerHTML = `<p>${esc(T[bn ? 'bn' : 'en'].fitOff)}</p><div class="chat-actions"><a class="chat-action" href="${waHref('Hi Mehedi, I would like to discuss a project: ' + brief().slice(0, 600))}" target="_blank" rel="noopener">WhatsApp</a></div>`;
                } else {
                    // the site's own words (offlineReply above), under a note that the AI is offline and how to reach him
                    typingEl.innerHTML = offlineNote(txt) + await offlineReply(txt);
                }
                isSuccess = true;
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
       10. KONAMI GOD MODE
    ========================================== */

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
    });

    function activateGodMode() {
        playSound('success');
        // from now on the theme menu lists God mode too
        local.set('mehedi_godmode', '1');
        unlockGodTheme();
        setTheme('god-mode');
        local.set('mehedi_theme', 'god-mode');
        updateClearance(2);

        setTimeout(() => { alert("/// GOD MODE ACTIVATED /// \nHardware limits bypassed. Root access simulated."); }, 300);
    }

    /* ==========================================
       11. THEME SWITCHER
    ========================================== */
    let savedTheme = local.get('mehedi_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // The new theme is painted with transitions off (html.theme-swap, style~): otherwise every element starts its own
    // colour transitions, over a thousand of them, and the click takes up to a second on a slow phone. They come back
    // once that frame is out. Every theme change (the header's menu, the terminal's `theme` command, the Konami code)
    // comes through here.
    function setTheme(t) {
        const root = document.documentElement;
        root.classList.add('theme-swap');
        root.setAttribute('data-theme', t);
        markTheme(t);
        requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-swap')));
    }

    /* The header's theme and sound menu, a WAI-ARIA menu button. It lists the themes by name and marks the current one
       (God mode is listed once the Konami code has unlocked it); after a separator, Sound is its last row, a checkbox.
       Enter, Space or Down opens it on the current theme, Up on the last row; inside, the arrows, Home and End move over
       every row, a letter jumps, Enter or Space picks a theme (and closes the menu) or toggles Sound (it stays open), and
       Esc closes it and hands focus back to the button. Tab, or a click anywhere else, closes it. */
    const themeBtn = document.getElementById('theme-menu-btn');
    const themeMenu = document.getElementById('theme-menu');
    function themeItems() {
        return themeMenu ? [...themeMenu.querySelectorAll('[role^="menuitem"]')].filter((b) => !b.closest('[hidden]')) : [];
    }
    function markTheme(t) {
        if (themeMenu) themeMenu.querySelectorAll('[role="menuitemradio"]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.themeSet === t)));
    }
    function unlockGodTheme() {
        const god = themeMenu && themeMenu.querySelector('[data-god]');
        if (god) god.hidden = false;
    }
    if (local.get('mehedi_godmode') === '1' || savedTheme === 'god-mode') unlockGodTheme();
    markTheme(savedTheme);
    // a theme set elsewhere (the Focus frame or another tab, through focus.js) is marked too, and God mode unlocked there
    // is listed here as well
    new MutationObserver(() => markTheme(document.documentElement.getAttribute('data-theme')))
        .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    // a theme picked in another tab is taken here too (pages without the Focus player have no focus.js to do it), and
    // so is Sound, or this tab's next toggle would write back the state it still holds
    window.addEventListener('storage', (e) => {
        if (e.key === 'mehedi_godmode' && e.newValue === '1') unlockGodTheme();
        if (e.key === 'mehedi_theme' && e.newValue && e.newValue !== document.documentElement.getAttribute('data-theme')) setTheme(e.newValue);
        if (e.key === 'mehedi_muted' && e.newValue !== null) { isMuted = e.newValue === 'true'; updateSoundIcons(); }
    });

    function openThemeMenu(which) {
        themeMenu.hidden = false;
        themeBtn.setAttribute('aria-expanded', 'true');
        const list = themeItems();
        const current = list.findIndex((b) => b.dataset.themeSet && b.getAttribute('aria-checked') === 'true');
        const i = which === 'last' ? list.length - 1 : Math.max(0, current);
        if (list[i]) list[i].focus({ preventScroll: true });
    }
    function closeThemeMenu(backFocus) {
        if (themeMenu.hidden) return;
        themeMenu.hidden = true;
        themeBtn.setAttribute('aria-expanded', 'false');
        if (backFocus) themeBtn.focus({ preventScroll: true });
    }
    if (themeBtn && themeMenu) {
        themeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (themeMenu.hidden) openThemeMenu(); else closeThemeMenu(false);
        });
        themeBtn.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
            e.preventDefault();
            openThemeMenu(e.key === 'ArrowUp' ? 'last' : null);
        });
        themeMenu.addEventListener('click', (e) => {
            const item = e.target.closest('[role="menuitemradio"]');
            if (!item) return;
            const t = item.dataset.themeSet;
            closeThemeMenu(true);
            if (t !== document.documentElement.getAttribute('data-theme')) {
                setTheme(t);
                local.set('mehedi_theme', t);
            }
        });
        themeMenu.addEventListener('keydown', (e) => {
            const list = themeItems(), at = list.indexOf(document.activeElement);
            let next = -1;
            if (e.key === 'ArrowDown') next = (at + 1) % list.length;
            else if (e.key === 'ArrowUp') next = (at - 1 + list.length) % list.length;
            else if (e.key === 'Home') next = 0;
            else if (e.key === 'End') next = list.length - 1;
            else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeThemeMenu(true); return; }
            else if (e.key === 'Tab') { closeThemeMenu(false); return; }
            else if (e.key.length === 1 && /\S/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const k = e.key.toLowerCase();
                for (let n = 1; n <= list.length; n++) {
                    const b = list[(at + n) % list.length];
                    if (b.textContent.trim().toLowerCase().startsWith(k)) { next = (at + n) % list.length; break; }
                }
            }
            if (next < 0) return;
            e.preventDefault();
            list[next].focus({ preventScroll: true });
        });
        document.addEventListener('pointerdown', (e) => {
            if (!themeMenu.hidden && !e.target.closest('.theme-pick')) closeThemeMenu(false);
        });
        // focus that leaves the menu another way (a screen reader's own navigation) closes it too
        themeMenu.addEventListener('focusout', (e) => {
            if (e.relatedTarget && !e.relatedTarget.closest('.theme-pick')) closeThemeMenu(false);
        });
    }

    // the terminal's `theme` command: the names the menu shows (red is the cyberpunk theme in code)
    const THEME_KEYS = { dark: 'dark', red: 'cyberpunk', light: 'light', mint: 'mint', 'god-mode': 'god-mode' };
    const godUnlocked = () => local.get('mehedi_godmode') === '1' || document.documentElement.getAttribute('data-theme') === 'god-mode';
    const cliThemeNames = () => Object.keys(THEME_KEYS).filter((n) => n !== 'god-mode' || godUnlocked());
    function cliTheme(name) {
        if (!cliThemeNames().includes(name)) return false;
        setTheme(THEME_KEYS[name]);
        local.set('mehedi_theme', THEME_KEYS[name]);
        return true;
    }

    /* The hero's dot network. The hero-net script in the head drew its first still frame; here the dots drift, shy
       away from the mouse and rest while the hero is scrolled away. Phones draw every other frame (~30 fps) and move
       twice as far each time; reduced motion keeps the still frame. A theme change only recolours the dots (the theme
       button's click rebuilds and measures nothing) */
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas && canvas.getContext && canvas.getContext('2d');
    if (ctx && typeof window.drawParticleNet === 'function') {
        const mouse = { x: null, y: null, radius: 150 };
        const root = document.documentElement;
        const colour = () => (window.heroNetColors || {})[root.getAttribute('data-theme')] || '#00f2fe';
        let pArray = [];

        window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
        root.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

        // keep: the dots drawn as the page parsed start moving from where they are, even when the size has moved a
        // little (the head measured before the scrollbar existed): false then, as the resized canvas needs a redraw.
        // The size is the root's client size, which on phones does not change as the address bar comes and goes
        function initParticles(keep) {
            const w = root.clientWidth, h = root.clientHeight;
            if (keep && window.heroParticles) {
                pArray = window.heroParticles;
                if (canvas.width === w && canvas.height === h) return true;
                canvas.width = w; canvas.height = h;
                return false;
            }
            canvas.width = w; canvas.height = h;
            const col = colour();
            pArray = [];
            for (let i = 0; i < (w * h) / 9000; i++) {
                pArray.push({ x: Math.random() * w, y: Math.random() * h, dx: (Math.random() - 0.5) * 1.5, dy: (Math.random() - 0.5) * 1.5, s: Math.random() * 2 + 1, col });
            }
            return false;
        }

        let particlesOn = false, heroInView = true, particleFrame = 0;
        const PARTICLE_STEP = matchMedia('(pointer: coarse)').matches ? 2 : 1;

        function animateParticles() {
            particlesOn = heroInView;
            if (particlesOn) requestAnimationFrame(animateParticles);
            if (particlesOn && ++particleFrame % PARTICLE_STEP) return;
            pArray.forEach((p) => {
                if (p.x >= canvas.width) { p.x = canvas.width; p.dx *= -1; }
                else if (p.x <= 0) { p.x = 0; p.dx *= -1; }
                if (p.y >= canvas.height) { p.y = canvas.height; p.dy *= -1; }
                else if (p.y <= 0) { p.y = 0; p.dy *= -1; }
                if (mouse.x != null) {
                    const dx = mouse.x - p.x, dy = mouse.y - p.y, distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius && distance > 0) {
                        const force = (mouse.radius - distance) / mouse.radius;
                        p.x -= (dx / distance) * force * 5;
                        p.y -= (dy / distance) * force * 5;
                    }
                }
                p.dx *= 0.98; p.dy *= 0.98;
                if (Math.abs(p.dx) < 0.3) p.dx = p.dx > 0 ? 0.3 : -0.3;
                if (Math.abs(p.dy) < 0.3) p.dy = p.dy > 0 ? 0.3 : -0.3;
                p.x += p.dx * PARTICLE_STEP; p.y += p.dy * PARTICLE_STEP;
            });
            drawParticleNet(ctx, pArray);
        }

        // a new size rebuilds the dots once the resizing stops; a still network is redrawn at once
        let resizeTimer = 0;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (canvas.width === root.clientWidth && canvas.height === root.clientHeight) return;
                initParticles();
                if (!particlesOn) drawParticleNet(ctx, pArray);
            }, 150);
        });

        new MutationObserver(() => {
            const col = colour();
            if (!pArray.length || pArray[0].col === col) return;
            pArray.forEach((p) => { p.col = col; });
            if (!particlesOn) drawParticleNet(ctx, pArray);
        }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

        // The page paints first: the dots start moving once the browser is idle, never with reduced motion. The first
        // still frame was drawn with the hero; it is drawn here only if the window changed size since.
        if (!initParticles(true)) drawParticleNet(ctx, pArray);
        const startParticles = () => {
            animateParticles();
            new IntersectionObserver(([entry]) => {
                heroInView = entry.isIntersecting;
                if (heroInView && !particlesOn) animateParticles();
            }).observe(canvas);
        };
        if (!PREFERS_REDUCED_MOTION) {
            if ('requestIdleCallback' in window) requestIdleCallback(startParticles, { timeout: 3000 });
            else setTimeout(startParticles, 1200);
        }
    }

    /* ==========================================
       20. CLEAN URL SMOOTH SCROLLING
    ========================================== */
// 1. Handle in-page smooth scrolling without mutating URL
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');

        // Let empty hashes act normally
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

    // A character in no font the site ships (বাং, 👋 and → in the chat) makes the browser search the system's fonts,
    // slowly, the first time it meets it in each font and weight: about 150 ms on a slow phone, which the first open of
    // the chat used to pay. These characters are laid out unseen in the site's fonts a few seconds after load, when the
    // page is idle, so those searches are done when the chat opens. One character in one font and weight at a time, each
    // in an idle moment of its own: all eighteen at once made a single task of 150-300 ms on a slow phone, and a tap that
    // came then waited for all of it.
    // (Not on the visitor's first touch or scroll: the warm-up then landed in that tap's own frame and slowed the menu.)
    const fallbackProbes = [];
    ['Poppins', "'Fira Code',monospace"].forEach((f) => [400, 600, 700].forEach((w) => ['→', '👋', 'বাং'].forEach((c) => fallbackProbes.push([f, w, c]))));
    const warmFallbackFonts = () => {
        const [f, w, c] = fallbackProbes.shift();
        const probe = document.createElement('div');
        probe.setAttribute('aria-hidden', 'true');
        probe.style.cssText = 'position:fixed;left:0;top:0;visibility:hidden;pointer-events:none;white-space:nowrap';
        probe.innerHTML = `<span style="font-family:${f};font-weight:${w}">${c}</span>`;
        document.body.appendChild(probe);
        void probe.offsetWidth;
        probe.remove();
        if (!fallbackProbes.length) return;
        if ('requestIdleCallback' in window) requestIdleCallback(warmFallbackFonts, { timeout: 3000 });
        else setTimeout(warmFallbackFonts, 50);
    };
    const warmLater = () => setTimeout(() => {
        if ('requestIdleCallback' in window) requestIdleCallback(warmFallbackFonts, { timeout: 3000 });
        else warmFallbackFonts();
    }, 3000);
    if (document.readyState === 'complete') warmLater();
    else window.addEventListener('load', warmLater, { once: true });

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

    // Animations that loop forever cost a style pass every frame even off screen (the live dots far down the page, cover
    // blobs). After load each one rests while its element is off screen (.anim-rest in the stylesheet).
    const restAnimations = () => {
        if (!('IntersectionObserver' in window) || !document.getAnimations) return;
        const looping = new Set();
        document.getAnimations().forEach((a) => {
            const el = a.effect && a.effect.target;
            if (!(a instanceof CSSAnimation) || !el) return;
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
