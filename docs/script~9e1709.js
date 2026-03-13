document.addEventListener('DOMContentLoaded', () => {

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

        handle.onmousedown = dragMouseDown;
        handle.ontouchstart = dragMouseDown;

        function dragMouseDown(e) {
            e.preventDefault();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);

            pos3 = clientX;
            pos4 = clientY;

            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            document.ontouchend = closeDragElement;
            document.ontouchmove = elementDrag;

            const rect = element.getBoundingClientRect();

            element.style.left = rect.left + 'px';
            element.style.top = rect.top + 'px';
            element.style.position = 'fixed';
            element.style.bottom = 'auto';
            element.style.right = 'auto';
            element.style.margin = '0';
            element.style.transform = 'none';
        }

        function elementDrag(e) {
            e.preventDefault();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);

            pos1 = pos3 - clientX;
            pos2 = pos4 - clientY;
            pos3 = clientX;
            pos4 = clientY;

            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
            document.ontouchend = null;
            document.ontouchmove = null;
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
       7. LIVE SERVER RESOURCE MONITOR & UPTIME
    ========================================== */
    const cpuVal = document.getElementById('mon-cpu');
    const cpuBar = document.getElementById('mon-cpu-bar');
    const ramVal = document.getElementById('mon-ram');
    const ramBar = document.getElementById('mon-ram-bar');
    const netVal = document.getElementById('mon-net');

    if (cpuVal && ramVal && netVal) {
        let lastMouseX = 0, lastMouseY = 0, mouseSpeed = 0;

        window.addEventListener('mousemove', (e) => {
            let dx = e.clientX - lastMouseX;
            let dy = e.clientY - lastMouseY;
            mouseSpeed = Math.min(Math.sqrt(dx * dx + dy * dy) * 2, 100);
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        });

        setInterval(() => {
            mouseSpeed = Math.max(mouseSpeed - 5, 2);
            let cpuDisplay = Math.floor(mouseSpeed);
            cpuVal.innerText = cpuDisplay + '%';
            cpuBar.style.width = cpuDisplay + '%';
            cpuBar.style.backgroundColor = cpuDisplay > 80 ? '#ef4444' : 'var(--accent-1)';
        }, 100);

        window.addEventListener('scroll', () => {
            let scrollY = window.scrollY || document.documentElement.scrollTop;
            let maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            let ramPercent = Math.floor((scrollY / maxScroll) * 60) + 12;
            ramVal.innerText = ramPercent + '%';
            ramBar.style.width = ramPercent + '%';
            document.getElementById('scroll-progress').style.width = ((scrollY / maxScroll) * 100) + "%";
        });

        window.addEventListener('click', () => {
            netVal.innerText = "TX/RX";
            netVal.className = "ping-active";
            setTimeout(() => { netVal.innerText = "IDLE"; netVal.className = "ping-idle"; }, 200);
        });
    }

    const launchDate = new Date('2026-02-21T20:50:00+06:00').getTime();
    const uptimeEl = document.getElementById('uptime-counter');
    if (uptimeEl) {
        setInterval(() => {
            const now = new Date().getTime();
            const diff = now - launchDate;

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            let timeStr = "";
            if (days > 0) timeStr += days + "d ";
            timeStr += hours + "h " + minutes + "m " + seconds + "s";

            uptimeEl.innerText = timeStr;
        }, 1000);
    }

    // CLOSE BUTTON LOGIC FOR SYS MONITOR
    const closeSys = document.getElementById('close-sys-monitor');
    if (closeSys) {
        // Prevent clicking the X from triggering the dragging system
        closeSys.addEventListener('mousedown', (e) => e.stopPropagation());
        closeSys.addEventListener('touchstart', (e) => e.stopPropagation());
        closeSys.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('sys-monitor').style.display = 'none';
            if (typeof playSound === 'function') playSound('click');
        });
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
            'about': 'I am a Full-Stack Developer and AI Automation Engineer with 2+ years of experience building intelligent web systems. I specialize in integrating LLMs (ChatGPT, Claude, Gemini) to create autonomous workflows that reduce production time by up to 60%. From scalable React applications to advanced Facebook & WhatsApp automation, I build high-performance tools that eliminate manual work and drive digital engagement at scale.',
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
            keywords: [/\b(mehedi|about|who|profile|bio|background|developer|engineer)\b/i],
            response: "Mehedi Hasan is a Full-Stack Developer and AI Automation Engineer with 2+ years of experience. He specializes in building autonomous workflows that reduce production time by up to 60% using LLMs like ChatGPT and Gemini."
        },
        skills: {
            keywords: [/\b(skill|stack|tech|language|toolkit|expert|react|javascript|python|php|node)\b/i],
            response: "Technical Arsenal: HTML5, CSS3, React.js, JavaScript (ES6+), PHP, Node.js, Python, OpenAI API, Gemini API, and specialized automation tools like Puppeteer and n8n."
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
                            { role: "system", content: "You are Mehedi's professional AI assistant. You help users navigate his portfolio. Keep responses concise and technical. Mehedi is a Full-Stack Developer & AI Automation Engineer with 2+ years exp. If you don't know something, suggest contacting him via WhatsApp." },
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
            id: 'file-ai-pipeline',
            name: 'ai_pipeline_v2.py',
            lang: 'Python',
            icon: 'fa-python',
            color: '#3776AB',
            code: `<span class="keyword">import</span> gemini_agent, workflow_orchestrator
<span class="comment"># Scalable AI Automation Pipeline</span>
<span class="keyword">def</span> <span class="function">optimize_workflow</span>(data_stream):
    agent = gemini_agent.load_model(<span class="string">"gemini-1.5-pro"</span>)
    pipeline = workflow_orchestrator.Pipeline(step=<span class="string">"content-gen"</span>)
    <span class="comment">// Reducing production time by up to 60%</span>
    <span class="keyword">return</span> pipeline.execute(agent, data_stream)`
        },
        {
            id: 'file-llm-bot',
            name: 'multi_llm_bot.js',
            lang: 'JavaScript',
            icon: 'fa-js',
            color: '#F7DF1E',
            code: `<span class="keyword">import</span> { ChatGPT, Claude } <span class="keyword">from</span> <span class="string">"@mehedi/ai-core"</span>;
<span class="comment">// High-Performance Intelligent System</span>
<span class="keyword">async function</span> <span class="function">intelligentGateway</span>(query) {
    <span class="keyword">const</span> bot = <span class="keyword">new</span> ChatGPT({ role: <span class="string">"expert-architect"</span> });
    <span class="keyword">const</span> insights = <span class="keyword">await</span> bot.analyze(query);
    <span class="keyword">return</span> Claude.refine(insights, { precision: <span class="string">"max"</span> });
}`
        },
        {
            id: 'file-social-auto',
            name: 'meta_automation.php',
            lang: 'PHP',
            icon: 'fa-php',
            color: '#777BB4',
            code: `<span class="keyword">&lt;?php</span>
<span class="comment">// Bespoke Facebook & WhatsApp Automation</span>
<span class="keyword">class</span> <span class="variable">SocialBot</span> {
    <span class="keyword">public function</span> <span class="function">syncAPI</span>(<span class="variable">$meta_token</span>) {
        <span class="variable">$whatsapp</span> = WhatsApp::connect(<span class="variable">$meta_token</span>);
        <span class="comment">// Eliminating manual inefficiencies</span>
        <span class="keyword">return</span> <span class="variable">$whatsapp</span>->deploy_autonomous_handler();
    }
}`
        }
    ];

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

                // Update UI
                const tabDisplay = document.getElementById('active-tab-display');
                if (tabDisplay) {
                    tabDisplay.innerHTML = `<i class="fa-brands ${file.icon}" style="color: ${file.color};"></i> ${file.name} <i class="fa-solid fa-xmark close-tab"></i>`;
                }
                const statusLang = document.getElementById('status-lang');
                if (statusLang) statusLang.innerText = file.lang;

                generateLines(block);
                if (typeof playSound === 'function') playSound('type');
            });
        });

        // Init first tab display
        const first = TECHNICAL_ARSENAL[0];
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
        "Full-Stack Web Developer",
        "AI Automation Engineer",
        "LLM Integration Specialist",
        "Digital Efficiency Architect"
    ];
    let tIdx = 0, cIdx = 0;
    const typingSpan = document.querySelector(".typing-text");
    const prefixSpan = document.querySelector(".prefix-text");

    if (typingSpan) {
        function type() {
            // Update prefix based on the index
            if (prefixSpan) {
                prefixSpan.textContent = tIdx === 0 ? "I am a" : "I engineer";
            }

            if (cIdx < tArr[tIdx].length) {
                typingSpan.textContent += tArr[tIdx].charAt(cIdx);
                cIdx++; setTimeout(type, 100);
            } else { setTimeout(erase, 2000); }
        }
        function erase() {
            if (cIdx > 0) {
                typingSpan.textContent = tArr[tIdx].substring(0, cIdx - 1);
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
                playSound('click');
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.dataset.filter.toLowerCase();
                projectCards.forEach(card => {
                    const stack = (card.dataset.stack || '').toLowerCase();
                    if (filter === 'all' || stack.includes(filter)) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'perspective(1000px) scale3d(1, 1, 1)';
                        }, 10);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'perspective(1000px) scale3d(0.8, 0.8, 0.8)';
                        setTimeout(() => { if (card.style.opacity === '0') card.style.display = 'none'; }, 400);
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
                    message: "Connection Secure",
                    data: {
                        engineer: "Mehedi",
                        role: "Full-Stack & AI Engineer",
                        architecture: "Scalable",
                        uptime: "99.99%",
                        latency: "24ms",
                        encryption: "RSA-4096",
                        payload: "System protocols validated."
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
// 1. Handle clicking the links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');

        // Let the terminal toggle or empty hashes act normally
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            // Prevent the default jump
            e.preventDefault();

            // Scroll smoothly
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });

            // Create the clean URL (e.g., changing '#projects' to '/projects')
            const cleanUrl = '/' + targetId.substring(1);

            // Update the address bar without reloading the page
            history.pushState(null, null, cleanUrl);
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
        overall: [
            { rank: 1, name: "o1-high (2024-12-17)", strength: "Deep Reasoning & Logic", elo: 1352, status: "stable" },
            { rank: 2, name: "GPT-4o (2024-11-20)", strength: "Multimodal King", elo: 1324, status: "trending" },
            { rank: 3, name: "Claude 3.5 Sonnet", strength: "Nuance & Coding", elo: 1318, status: "stable" },
            { rank: 4, name: "o1-mini", strength: "Fast Reasoning", elo: 1310, status: "stable" },
            { rank: 5, name: "Gemini 1.5 Pro (002)", strength: "2M Token Context", elo: 1298, status: "stable" },
            { rank: 6, name: "Llama 3.1 405B", strength: "Open Source Frontier", elo: 1285, status: "trending" },
            { rank: 7, name: "Grok-2", strength: "Real-time X Data", elo: 1276, status: "new" },
            { rank: 8, name: "Mistral Large 2", strength: "Efficient Powerhouse", elo: 1269, status: "stable" },
            { rank: 9, name: "DeepSeek-V3", strength: "Reasoning & Value", elo: 1262, status: "new" },
            { rank: 10, name: "Claude 3 Opus", strength: "Creative Writing", elo: 1255, status: "stable" },
            { rank: 11, name: "Qwen2.5 72B", strength: "Knowledge & Coding", elo: 1248, status: "trending" }
        ],
        coding: [
            { rank: 1, name: "Claude 3.5 Sonnet", strength: "Advanced Code Generation", elo: 1345, status: "stable" },
            { rank: 2, name: "GPT-4o", strength: "Versatile Debugging", elo: 1322, status: "trending" },
            { rank: 3, name: "o1-high", strength: "Algorithmic Problems", elo: 1315, status: "stable" },
            { rank: 4, name: "DeepSeek Coder V2", strength: "Coding Specialist", elo: 1308, status: "new" },
            { rank: 5, name: "Gemini 1.5 Pro", strength: "Context-aware Coding", elo: 1292, status: "stable" },
            { rank: 6, name: "Llama 3.1 405B", strength: "Logic & Structuring", elo: 1278, status: "trending" },
            { rank: 7, name: "Codestral 22B", strength: "Fast FIM Patterns", elo: 1265, status: "stable" },
            { rank: 8, name: "CodeLlama 70B", strength: "Legacy Support", elo: 1242, status: "stable" },
            { rank: 9, name: "Phind-CodeLlama", strength: "Search Integration", elo: 1235, status: "stable" },
            { rank: 10, name: "Stable Code 3B", strength: "Edge Intelligence", elo: 1210, status: "new" }
        ],
        reasoning: [
            { rank: 1, name: "OpenAI o1-high", strength: "Chain-of-Thought Pro", elo: 1368, status: "stable" },
            { rank: 2, name: "OpenAI o1-mini", strength: "Logical Performance", elo: 1342, status: "stable" },
            { rank: 3, name: "GPT-4o", strength: "General Reasoning", elo: 1310, status: "trending" },
            { rank: 4, name: "Claude 3.5 Sonnet", strength: "Analytical Context", elo: 1302, status: "stable" },
            { rank: 5, name: "Gemini 1.5 Pro", strength: "Reasoning with Data", elo: 1288, status: "stable" },
            { rank: 6, name: "Llama 3.1 405B", strength: "Complex Logic", elo: 1281, status: "trending" },
            { rank: 7, name: "DeepSeek-V3", strength: "Logical Inference", elo: 1272, status: "new" },
            { rank: 8, name: "Grok-2", strength: "Dynamic Reasoning", elo: 1265, status: "new" },
            { rank: 9, name: "Mistral Large 2", strength: "Structured Logic", elo: 1258, status: "stable" },
            { rank: 10, name: "Claude 3 Opus", strength: "Holistic Reasoning", elo: 1245, status: "stable" }
        ]
    };

    let currentCategory = 'overall';

    function renderLeaderboard(category = 'overall') {
        if (!leaderboardBody) return;
        
        leaderboardBody.innerHTML = '';
        const data = AI_DATA[category];
        
        data.forEach((model, index) => {
            const tr = document.createElement('tr');
            tr.style.opacity = '0';
            tr.style.transform = 'translateY(10px)';
            tr.style.transition = `all 0.4s ease ${index * 0.1}s`;
            
            const rankClass = model.rank === 1 ? 'rank-1' : model.rank === 2 ? 'rank-2' : model.rank === 3 ? 'rank-3' : 'rank-other';
            const eloWidth = (model.elo / 1400) * 100;
            const statusClass = `badge-${model.status}`;

            tr.innerHTML = `
                <td class="rank-cell">
                    <div class="rank-pill ${rankClass}">${model.rank}</div>
                </td>
                <td>
                    <div class="model-info-cell">
                        <span class="model-name">${model.name}</span>
                        <span class="model-meta">ARENA_v2.0_CERTIFIED</span>
                    </div>
                </td>
                <td>
                    <span class="strength-tag">${model.strength}</span>
                </td>
                <td class="score-cell">
                    <div class="elo-cell">
                        <div class="elo-bar-bg">
                            <div class="elo-bar-fill" style="width: ${eloWidth}%"></div>
                        </div>
                        <span class="elo-val">${model.elo}</span>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${statusClass}">${model.status}</span>
                </td>
            `;
            leaderboardBody.appendChild(tr);
            
            // Trigger animation
            setTimeout(() => {
                tr.style.opacity = '1';
                tr.style.transform = 'translateY(0)';
            }, 50);
        });

        if (radarSyncVal) {
            radarSyncVal.innerText = new Date().toLocaleTimeString();
        }
    }

    // Tab Logic
    radarTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            radarTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            renderLeaderboard(currentCategory);
        });
    });

    // Initialize
    renderLeaderboard();
    
    // Pulse update logic (every 60s)
    setInterval(() => {
        // Subtle Elo Jitter for "Live" effect across all cats
        Object.keys(AI_DATA).forEach(cat => {
            AI_DATA[cat].forEach(m => {
                m.elo += Math.floor(Math.random() * 3) - 1;
            });
        });
        renderLeaderboard(currentCategory);
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

    // 2. Handle page refreshes or direct links
    const path = window.location.pathname.substring(1);
    if (path && document.getElementById(path)) {
        setTimeout(() => {
            const target = document.getElementById(path);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        }, 100);
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

    console.log("/// Mehedi Portfolio OS Initialized /// Status: NOMINAL");
});
