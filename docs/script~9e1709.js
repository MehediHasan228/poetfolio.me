document.addEventListener('DOMContentLoaded', () => {

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

    const soundToggle = document.getElementById('sound-toggler');
    if (soundToggle) {
        soundToggle.innerHTML = isMuted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';

        soundToggle.addEventListener('click', () => {
            isMuted = !isMuted;
            localStorage.setItem('mehedi_muted', isMuted);
            soundToggle.innerHTML = isMuted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
            if (!audioCtx && !isMuted) audioCtx = new AudioContext();
        });
    }

    function playSound(type) {
        if (isMuted) return;
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
                    const skillName = bar.parentElement.previousElementSibling.querySelector('.lang').textContent;
                    let targetWidth = bar.getAttribute('data-width');

                    if (skillName.includes('Full-Stack')) targetWidth = '90%';
                    if (skillName.includes('AI & Automation')) targetWidth = '85%';
                    if (skillName.includes('System Architecture')) targetWidth = '75%';

                    bar.style.width = targetWidth;
                });
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.telemetry-card').forEach(el => telObserver.observe(el));

    /* ==========================================
       3. CUSTOM TRAILING CURSOR
    ========================================== */
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    if (cursorDot && cursorOutline) {
        let rafPending = false;
        window.addEventListener('mousemove', (e) => {
            if (rafPending) return;
            rafPending = true;
            requestAnimationFrame(() => {
                cursorDot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
                cursorOutline.animate({
                    transform: `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
                }, { duration: 400, fill: "forwards" });
                rafPending = false;
            });
        });

        document.querySelectorAll('a, button, input, textarea, select, .chat-header, .file, .mine-tile, .pos-item, .control-btn, .ai-dropzone, .filter-btn, .cli-header, .mines-header, .draggable-header, .mon-title').forEach(el => {
            el.addEventListener('mouseenter', () => cursorOutline.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => cursorOutline.classList.remove('cursor-hover'));
        });
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

        handles.forEach(handle => {
            handle.style.cursor = 'move';
            handle.addEventListener('mousedown', dragStart);
            handle.addEventListener('touchstart', dragStart, { passive: false });
            
            // Prevent standard click if we were dragging
            handle.addEventListener('click', (e) => {
                const now = Date.now();
                if (isDragging || (now - lastDragTime < 150)) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                }
            }, true);
        });

        function dragStart(e) {
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            startY = clientY;
            isDragging = false;
            pos4 = clientY;

            document.addEventListener('mousemove', dragMove);
            document.addEventListener('mouseup', dragEnd);
            document.addEventListener('touchmove', dragMove, { passive: false });
            document.addEventListener('touchend', dragEnd);

            // IMPORTANT: If the element is centered via CSS transform, 
            // we must capture its actual top and use a CSS variable for the Y offset to avoid jumping.
            const rect = element.getBoundingClientRect();
            element.style.top = rect.top + 'px';
            element.style.setProperty('--lb-ty', 'translateY(0)'); 

            // Optimization: Remove transitions during drag for smoothness
            element.style.transition = 'none';
        }

        function dragMove(e) {
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            // Threshold: 5px for mouse, 15px for touch to prevent accidental drags during taps
            const threshold = e.type.startsWith('touch') ? 15 : 5;
            
            if (Math.abs(clientY - startY) > threshold) {
                isDragging = true;
                if (e.cancelable) e.preventDefault();
            }

            if (!isDragging) return;

            pos2 = pos4 - clientY;
            pos4 = clientY;

            let newTop = element.offsetTop - pos2;
            
            // Bound checking (optional but good for UX)
            const padding = 20;
            const viewHeight = window.innerHeight;
            if (newTop < padding) newTop = padding;
            if (newTop > viewHeight - element.offsetHeight - padding) 
                newTop = viewHeight - element.offsetHeight - padding;

            element.style.top = newTop + "px";
            element.style.bottom = 'auto';
            element.style.left = 'auto';
            element.style.right = '0';
            // No transform: none needed here as it's cleared in dragStart
        }

        function dragEnd(e) {
            document.removeEventListener('mousemove', dragMove);
            document.removeEventListener('mouseup', dragEnd);
            document.removeEventListener('touchmove', dragMove);
            document.removeEventListener('touchend', dragEnd);
            
            element.style.transition = ''; 

            if (isDragging) {
                lastDragTime = Date.now();
            }

            // If we didn't drag, it's a click. Signal to other listeners.
            if (!isDragging) {
                const path = e.composedPath ? e.composedPath() : (e.path || []);
                // DON'T dispatch if we clicked on a button or interactive element that should handle itself
                const isControlClick = path.some(el => el && el.tagName && (
                    el.tagName === 'BUTTON' || 
                    el.tagName === 'A' || 
                    (el.classList && el.classList.contains('radar-tab')) ||
                    (el.classList && el.classList.contains('lb-expand-btn'))
                ));
                
                if (!isControlClick) {
                    element.dispatchEvent(new CustomEvent('lb-click', { bubbles: true, composed: true }));
                }
            }
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
    document.querySelectorAll('.magnetic-element').forEach(el => {
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

    document.querySelectorAll('.decrypt-text').forEach(el => decryptObserver.observe(el));

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
            } else {
                const t0 = performance.now();
                fetch('./mehedi-logo.webp', { method: 'HEAD', cache: 'no-store' })
                    .then(() => {
                        currentPing = Math.max(Math.round(performance.now() - t0), 8);
                        if (netVal) netVal.innerText = `${currentPing}ms • ACTIVE`;
                        if (dockPing) dockPing.innerText = `${currentPing}ms`;
                    })
                    .catch(() => {
                        if (netVal) netVal.innerText = `${currentPing}ms • ONLINE`;
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
            response: "System Online. I am Mehedi's AI assistant. How can I help you navigate his portfolio today?"
        },
        identity: {
            keywords: [/\b(mehedi|about|who|profile|bio|background|developer|engineer|architect)\b/i],
            response: "Mehedi Hasan is a Full-Stack Web Developer, AI Automation Engineer, and Digital Efficiency Architect. He specializes in Distributed Systems, Microservices (NestJS, Postgres, Kafka, Redis), Cloud Infrastructure (Docker, Kubernetes, AWS), and autonomous LLM integration (Gemini, Claude)."
        },
        skills: {
            keywords: [/\b(skill|stack|tech|language|toolkit|expert|react|nest|postgres|microservices|redis|kafka|rabbitmq|docker|kubernetes|aws|elk|prometheus|grafana|dsa|system design|networking)\b/i],
            response: "Technical Arsenal:\n• Architecture & Backend: NestJS, Node.js, React.js, PostgreSQL, Distributed Systems, Microservices, DSA & System Design.\n• Event Streaming & Caching: Apache Kafka, RabbitMQ, Redis Cluster.\n• Cloud, DevOps & SRE: AWS, Docker, Kubernetes (K8s), ELK Stack, Prometheus & Grafana.\n• AI & LLMs: Claude Opus 5 / Fable 5.1, Google Gemini 3.1 Pro, DeepSeek-V4, GPT-6 Astra, MCP (Model Context Protocol), LangGraph, PGVector RAG, Python & n8n."
        },
        services: {
            keywords: [/\b(service|hire|price|cost|work|offer|buy|freelance)\b/i],
            response: "Available Services: Basic Web Dev ($150), E-commerce ($300), AI Integration ($400), Full-Stack Apps ($500), API Dev ($200), and Marketing Automation ($250)."
        },
        projects: {
            keywords: [/\b(project|portfolio|build|create|done|example|work|app)\b/i],
            response: "Key Projects: CredenceX AI Lab (Trustworthy MedAI), Sierraromeo.ai (AI Research Agent), Retune.so (AI Chat UI), and specialized enterprise automation bots."
        },
        credencex: {
            keywords: [/\b(credencex|medical|imaging|healthcare|lab|research|xai)\b/i],
            response: "CredenceX AI Research Lab advances trustworthy, explainable (XAI), and deployment-aware AI for medical imaging and clinical decision support in high-stakes healthcare environments. Explore it at credencex.ai."
        },
        contact: {
            keywords: [/\b(contact|email|phone|whatsapp|reach|talk|linkedin|github|connect)\b/i],
            response: "Data Retrieved: Reach Mehedi via WhatsApp at +880 1799-447594 or email at mehedihasan228.cse@gmail.com. GitHub: github.com/MehediHasan228"
        },
        automation: {
            keywords: [/\b(automation|bot|facebook|whatsapp bot|workflow|llm|agent)\b/i],
            response: "Automation Expertise: Mehedi builds autonomous workflows that reduce production time by up to 60%. He specializes in Facebook & WhatsApp API integrations and LLM orchestration."
        },
        smalltalk: {
            keywords: [/\b(joke|funny|laugh)\b/i],
            response: "Why do programmers prefer dark mode? Because light attracts bugs!"
        }
    };

    const DEFAULT_RESPONSE = "Query complete. I currently lack sufficient data to process that request offline. Try asking about Mehedi's skills, projects, services, or how to contact him. For complex queries, please connect via WhatsApp.";

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
        chatHeader.addEventListener('click', () => {
            console.log("[AI_CHAT] Toggle Initiated via Header Click");
            toggleChat();
        });

        function toggleChat() {
            chatWidget.classList.toggle('chat-expanded');
            chatWidget.classList.toggle('chat-collapsed');
            
            const icon = document.getElementById('chat-toggle-icon');
            if (icon) {
                if (chatWidget.classList.contains('chat-expanded')) {
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                } else {
                    icon.classList.remove('fa-chevron-down');
                    icon.classList.add('fa-chevron-up');
                }
            }
            if (typeof playSound === 'function') playSound('click');
        }

        // ── VOICE INPUT ────────────────────────────────────────────────────────
        if (voiceBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            voiceBtn.addEventListener('click', () => {
                voiceBtn.classList.add('mic-active');
                recognition.start();
                if (typeof playSound === 'function') playSound('click');
            });

            recognition.onresult = (e) => {
                const transcript = e.results[0][0].transcript;
                chatInput.value = transcript;
                voiceBtn.classList.remove('mic-active');
                sendChat();
            };

            recognition.onerror = () => {
                voiceBtn.classList.remove('mic-active');
                if (typeof playSound === 'function') playSound('error');
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
            chatBody.appendChild(div);
            chatBody.scrollTop = chatBody.scrollHeight;
            return div;
        }

        function createSmartButtons() {
            const container = document.createElement('div');
            container.className = 'smart-btn-container';
            const buttons = [
            { text: "CredenceX Lab", icon: "fa-microscope" },
            { text: "Who is Mehedi?", icon: "fa-user" },
            { text: "Experience Protocol", icon: "fa-briefcase" },
            { text: "Contact Handshake", icon: "fa-handshake" }
        ];

            buttons.forEach(btn => {
                const b = document.createElement('button');
                b.className = 'smart-btn';
                b.innerHTML = `<i class="fa-solid ${btn.icon}"></i> ${btn.text}`;
                b.onclick = () => {
                    chatInput.value = btn.text;
                    sendChat();
                };
                container.appendChild(b);
            });
            return container;
        }

        // Initial Greeting with Buttons
        setTimeout(() => {
            const welcomeMsg = appendMsg("System Online. I am Mehedi's AI assistant. Select a protocol to begin:", 'bot');
            welcomeMsg.appendChild(createSmartButtons());
        }, 500);

        async function sendChat() {
            const txt = chatInput.value.trim();
            if (!txt) return;

            if (typeof playSound === 'function') playSound('type');
            chatInput.value = '';

            // User Message
            appendMsg(txt, 'user');

            // Bot Response (Simulated Delay for typing feel)
            const typingEl = appendMsg('⬤ ⬤ ⬤', 'bot');
            typingEl.classList.add('typing-indicator');

            try {
                // Primary: Try Local AI Bridge
                const primaryResponse = await fetch('http://localhost:8000/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: "gpt-3.5-turbo",
                        messages: [
                            { role: "system", content: "You are Mehedi's professional AI assistant. You help users navigate his portfolio. Keep responses concise and technical. Mehedi is a Full-Stack Web Developer, AI Automation Engineer, and Digital Efficiency Architect with 4+ years of production experience. If you don't know something, suggest contacting him via WhatsApp." },
                            { role: "user", content: txt }
                        ],
                        temperature: 0.7
                    })
                });

                if (primaryResponse.ok) {
                    const data = await primaryResponse.json();
                    typingEl.textContent = data.choices[0].message.content;
                    return; // Exit if primary succeeds
                }
                throw new Error("Primary Handshake Failed");

            } catch (primaryError) {
                console.warn("[AI_CHAT] Local Bridge Offline. Attempting Secondary Cloud AI...");
                
                try {
                    // Secondary: Free Public AI Fallback (Direct Text Endpoint)
                    const systemPrompt = "You are Mehedi's helpful AI assistant on his portfolio website. Keep responses short (1-2 sentences). Mehedi is a Full-Stack Developer & AI Automation Engineer.\n\nUser: ";
                    const encodedPrompt = encodeURIComponent(systemPrompt + txt);
                    const secondaryResponse = await fetch(`https://text.pollinations.ai/${encodedPrompt}`);

                    if (secondaryResponse.ok) {
                        let reply = await secondaryResponse.text();
                        // Strip any Pollinations deprecation notice injected at the top
                        const noticeMarker = 'Note: Anonymous requests to text.pollinations.ai are NOT affected and will continue to work normally.';
                        if (reply.includes(noticeMarker)) {
                            reply = reply.substring(reply.indexOf(noticeMarker) + noticeMarker.length).trim();
                        }
                        if (reply) {
                            typingEl.textContent = reply;
                            return; // Exit if secondary succeeds
                        }
                        throw new Error("Reply was empty after stripping notice");
                    }
                    throw new Error("Secondary API Failed");

                } catch (secondaryError) {
                    // Tertiary: Hardcoded Rule-Based Fallback
                    console.warn("[AI_CHAT] All APIs Offline. Reverting to Offline Rule-Based Protocol.");
                    typingEl.innerHTML = getBotResponse(txt);
                }
            } finally {
                typingEl.classList.remove('typing-indicator');
                chatBody.scrollTop = chatBody.scrollHeight;
                if (typeof playSound === 'function') playSound('type');
            }
        }

        chatSend.addEventListener('click', sendChat);
        chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendChat(); });
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
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> TRANSMITTING...';

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    // Success logic (mimics React snippet's state.succeeded)
                    form.innerHTML = `
                        <div style="text-align:center; padding: 2.5rem; color: var(--accent-1); font-family: 'Fira Code', monospace; background: rgba(0,0,0,0.3); border-radius: 12px; border: 1px dashed var(--accent-1);">
                            <i class="fa-solid fa-check-double" style="font-size: 3.5rem; margin-bottom: 1.5rem; display: block;"></i>
                            <h3 style="margin-bottom: 0.5rem; letter-spacing: 2px;">SUCCESS: DATA_SYNC_COMPLETE</h3>
                            <p style="color: var(--text-secondary); font-size: 0.9rem;">Thanks for joining! Your payload has been successfully integrated into the system.</p>
                            <button onclick="window.location.reload()" class="btn secondary-btn" style="margin-top: 1.5rem; padding: 0.5rem 1rem; font-size: 0.7rem; border-color: rgba(255,255,255,0.1);">[ RETURN_TO_TERMINAL ]</button>
                        </div>
                    `;
                    if (typeof playSound === 'function') playSound('success');
                    // Scroll to form to ensure success message is seen
                    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    const data = await response.json();
                    if (data.errors) {
                        alert("UPLINK_ERROR: " + data.errors.map(error => error.message).join(", "));
                    } else {
                        alert("ERROR: UPLINK_FAILURE. Status: " + response.status);
                    }
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.innerHTML = originalBtnText;
                    if (typeof playSound === 'function') playSound('error');
                }
            } catch (error) {
                alert("CRITICAL_ERROR: CONNECTION_TIMEOUT. Check your uplink protocol.");
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
    const themes = ['dark', 'cyberpunk', 'light', 'god-mode'];

    let savedTheme = localStorage.getItem('mehedi_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    let cTheme = themes.indexOf(savedTheme) !== -1 ? themes.indexOf(savedTheme) : 0;

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            do { cTheme = (cTheme + 1) % themes.length; } while (themes[cTheme] === 'god-mode');
            document.documentElement.setAttribute('data-theme', themes[cTheme]);
            localStorage.setItem('mehedi_theme', themes[cTheme]);
            if (typeof initParticles === 'function') initParticles();
        });
    }

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

        function initParticles() {
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

        window.addEventListener('resize', initParticles);

        function animateParticles() {
            requestAnimationFrame(animateParticles);

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
                ctx.clearRect(0, 0, innerWidth, innerHeight);
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

                    p.x += p.dx; p.y += p.dy;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
                    ctx.fillStyle = p.col;
                    ctx.fill();
                });

                for (let a = 0; a < pArray.length; a++) {
                    for (let b = a; b < pArray.length; b++) {
                        let d = Math.pow(pArray[a].x - pArray[b].x, 2) + Math.pow(pArray[a].y - pArray[b].y, 2);
                        if (d < 15000) {
                            ctx.strokeStyle = pArray[a].col;
                            ctx.globalAlpha = 1 - (d / 15000);
                            ctx.beginPath();
                            ctx.moveTo(pArray[a].x, pArray[a].y);
                            ctx.lineTo(pArray[b].x, pArray[b].y);
                            ctx.stroke();
                            ctx.globalAlpha = 1;
                        }
                    }
                }
            }
        }
        initParticles();
        animateParticles();
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
        const count = codeEl.innerText.split(/\r\n|\r|\n/).length;
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
        { prefix: "I am a", text: "Full-Stack Web Developer" },
        { prefix: "I am an", text: "AI Automation Engineer" },
        { prefix: "I am an", text: "LLM Integration Specialist" },
        { prefix: "I am a", text: "Digital Efficiency Architect" }
    ];
    let tIdx = 0, cIdx = 0;
    const typingSpan = document.querySelector(".typing-text");
    const prefixSpan = document.querySelector(".prefix-text");

    if (typingSpan) {
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
        setTimeout(type, 1000);
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

    const apiBtn = document.getElementById('api-send');
    if (apiBtn) {
        apiBtn.addEventListener('click', () => {
            playSound('type');
            const out = document.getElementById('api-response');
            out.innerHTML = "<span style='color:var(--accent-1);'>[SYSTEM] Establishing secure handshake with api.mehedi.pro...</span>";

            setTimeout(() => {
                playSound('success');
                const json = {
                    status: 200,
                    message: "Cluster Telemetry Synced",
                    data: {
                        engineer: "Mehedi Hasan",
                        roles: [
                            "Full-Stack Web Developer",
                            "AI Automation Engineer",
                            "LLM Integration Specialist",
                            "Digital Efficiency Architect"
                        ],
                        core_architecture: {
                            backend: "NestJS & Node.js Microservices",
                            persistence: "PostgreSQL with connection pooling (pgBouncer)",
                            cache_layer: "Redis Cluster (99.4% cache hit ratio)",
                            event_bus: "Apache Kafka & RabbitMQ (Zero-Loss At-Least-Once Delivery)",
                            orchestration: "Docker & Kubernetes (K8s pods auto-scaling)",
                            observability: "Prometheus metrics, Grafana dashboards, ELK logging"
                        },
                        runtime_telemetry: {
                            p99_latency: "12ms",
                            cluster_uptime: "99.99%",
                            rate_limiter: "Token Bucket active (Redis)"
                        }
                    }
                };
                out.innerHTML = syntaxHighlight(JSON.stringify(json, undefined, 4));
            }, 800);
        });
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

        modelsList.slice(0, 25).forEach((model, index) => {
            const tr = document.createElement('tr');
            tr.style.opacity = '0';
            tr.style.transform = 'translateY(8px)';
            tr.style.transition = `all 0.25s ease ${index * 0.03}s`;

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

            setTimeout(() => {
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
    const localDataUrl = window.location.pathname.includes('/projects/') ? '../data/arena_leaderboard.json' : './data/arena_leaderboard.json';
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

    loadArenaData();

    // Initial render
    renderSubtabs(currentCategory);
    renderLeaderboard(currentCategory, currentSubcategory);

    // Pulse update logic (every 60s)
    setInterval(() => {
        if (ARENA_STORE) {
            renderLeaderboard(currentCategory, currentSubcategory);
        }
    }, 60000);

    const lbToggleIcon = document.getElementById('lb-toggle-icon');

    if (lbWidget && lbToggleBtn) {
        // Use custom event from draggable logic to avoid click conflict
        lbWidget.addEventListener('lb-click', (e) => {
            toggleLeaderboard();
        });

        // Still allow direct click if not dragging (for desktop reliability)
        // Note: The draggable logic handles this via lb-click, but keeping direct for simple clicks.
        // We check if it was a drag in the handle's listener.
        
        function toggleLeaderboard() {
            // If already in full view, close full view first when collapsing
            if (lbWidget.classList.contains('lb-full-view') && lbWidget.classList.contains('lb-expanded')) {
                lbWidget.classList.remove('lb-full-view');
            }

            lbWidget.classList.toggle('lb-expanded');
            lbWidget.classList.toggle('lb-collapsed');

            // Optionally change the icon state when expanded
            const isExpanded = lbWidget.classList.contains('lb-expanded');

            // Optionally change the icon state when expanded
            if (lbToggleIcon) {
                if (isExpanded) {
                    lbToggleIcon.classList.remove('fa-trophy');
                    lbToggleIcon.classList.add('fa-chevron-right');
                } else {
                    lbToggleIcon.classList.remove('fa-chevron-right');
                    lbToggleIcon.classList.add('fa-trophy');
                }
            }

            if (typeof playSound === 'function') playSound('click');
        }
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
    // 25. SMART SCI-FI SRE LIVE TELEMETRY TICKER
    // ==========================================
    const terminalTicker = document.getElementById('terminal-ticker');
    if (terminalTicker) {
        const telemetryPool = [
            { tag: 'SAWAB ERP', tagClass: 'tag-rag', msg: 'Auto-reconciled <b class="metric-hl">1,420</b> multi-currency transactions • 0 audit error' },
            { tag: 'FINTECH', tagClass: 'tag-stream', msg: 'Payment gateway webhook idempotent lock verified • p99 latency <b class="metric-hl">&lt;14ms</b>' },
            { tag: 'AGENTIC AI', tagClass: 'tag-ai', msg: 'Autonomous Claude &amp; Gemini swarm loop verified via <b class="metric-hl">MCP protocol</b>' },
            { tag: 'PGVECTOR', tagClass: 'tag-sota', msg: 'HNSW semantic index synced: vector similarity match in <b class="metric-hl">11.2ms</b>' },
            { tag: 'DISTRIBUTED', tagClass: 'tag-sre', msg: 'High-concurrency checkout throughput: <b class="metric-hl">12.5k req/s</b> • zero pool drop' },
            { tag: 'KAFKA', tagClass: 'tag-stream', msg: 'Zero-loss event bus throughput: <b class="metric-hl">42.8k msg/sec</b> • 0 packet drops' },
            { tag: 'REDIS', tagClass: 'tag-stream', msg: 'Distributed cluster cache hit ratio: <b class="metric-hl">99.4%</b> • eviction count: 0' },
            { tag: 'K8S / SRE', tagClass: 'tag-sre', msg: 'Multi-zone ingress pods 48/48 online • <b class="metric-hl">99.99%</b> uptime SLA verified' }
        ];

        let poolIndex = 0;
        const formatTime = () => {
            const now = new Date();
            return `[${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}]`;
        };

        // Update existing timestamps to current time initially
        const existingTimes = terminalTicker.querySelectorAll('.log-time');
        existingTimes.forEach((el, idx) => {
            const past = new Date(Date.now() - idx * 6000);
            el.textContent = `[${String(past.getHours()).padStart(2, '0')}:${String(past.getMinutes()).padStart(2, '0')}:${String(past.getSeconds()).padStart(2, '0')}]`;
        });

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

            // Keep max 5 lines
            while (terminalTicker.children.length > 5) {
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

        function setActiveItem(index, triggerScroll = false) {
            if (index < 0 || index >= cards.length) return;

            cards.forEach((card, i) => {
                if (i === index) {
                    card.classList.add('is-active');
                } else {
                    card.classList.remove('is-active');
                }
            });

            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });

            const activePillar = cards[index].dataset.pillar;
            tabs.forEach(tab => {
                if (tab.dataset.pillar === activePillar) {
                    tab.classList.add('active');
                    // Scroll tab pill horizontally inside tabContainer ONLY when user triggers scroll
                    if (triggerScroll && tabContainer && tabContainer.scrollWidth > tabContainer.clientWidth) {
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

            // Scroll carousel card horizontally inside grid ONLY when user triggers scroll
            if (triggerScroll && window.innerWidth <= 768) {
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
            if (window.innerWidth > 768) return;

            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const gridRect = grid.getBoundingClientRect();
                const gridCenter = gridRect.left + gridRect.width / 2;

                let closestIdx = 0;
                let minDistance = Infinity;

                cards.forEach((card, i) => {
                    const cardRect = card.getBoundingClientRect();
                    const cardCenter = cardRect.left + cardRect.width / 2;
                    const distance = Math.abs(gridCenter - cardCenter);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestIdx = i;
                    }
                });

                setActiveItem(closestIdx, false);
            }, 60);
        }, { passive: true });

        cards.forEach((card, i) => {
            card.addEventListener('click', (e) => {
                if (window.innerWidth <= 768 && !card.classList.contains('is-active')) {
                    if (e.target.closest('a, button, .cyber-overlay-btn')) {
                        e.preventDefault();
                    }
                    if (typeof playSound === 'function') playSound('click');
                    setActiveItem(i, true);
                }
            });
        });

        setActiveItem(0, false);
    }

    // Initialize all 4 Mobile App Carousel Sliders
    setupMobileAppCarousel('.arch-pillars-grid', '.arch-pillar-card', '.arch-mobile-tabs', '#archCarouselDots');
    setupMobileAppCarousel('.projects-grid', '.project-card', '.projects-mobile-tabs', '#projectsCarouselDots');
    setupMobileAppCarousel('#ethicalGrid', '.ethical-card', '.ethical-mobile-tabs', '#ethicalDots');
    setupMobileAppCarousel('#deeptechGrid', '#deeptechGrid .archive-card', '.deeptech-mobile-tabs', '#deeptechDots');

    console.log("/// Mehedi Portfolio OS Initialized /// Status: NOMINAL");
});

