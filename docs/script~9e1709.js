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
        window.addEventListener('mousemove', (e) => {
            cursorDot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            cursorOutline.animate({
                transform: `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
            }, { duration: 400, fill: "forwards" });
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
            'about': 'Results-driven Full-Stack Web Developer and AI Automation Engineer with over 2+ years of experience architecting modern web applications and intelligent systems. Specialist in LLM integration, scalable automation pipelines, and AI-driven content workflows.',
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
       9. AI CHAT WIDGET — OPENROUTER AI
       ==========================================
       Powered by OpenRouter (Gemini, Llama, etc.)
       Get your key → https://openrouter.ai/keys
    ========================================== */
    /* ==========================================
       9. AI CHAT WIDGET — OPENROUTER AI
       ==========================================
       Powered by OpenRouter (Gemini, Llama, etc.)
       Get your key → https://openrouter.ai/keys
    ========================================== */
    const chatWidget = document.getElementById('ai-chat-widget');
    const chatHeader = document.getElementById('chat-header');
    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const voiceBtn = document.getElementById('voice-btn');

    // ── CONFIG ─────────────────────────────────────────────────────────────────
    const OPENROUTER_API_KEY = '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';
    const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
    const AI_MODEL = "meta-llama/llama-3.2-3b-instruct:free"; 

    // ── SYSTEM PROMPT: Mehedi's Full Technical Persona ─────────────────────────
    const SYSTEM_INSTRUCTION = `You are an advanced AI assistant representing Mehedi Hasan on his personal portfolio site (mehedi.pro.bd).
Your role: Be his technical representative — answer questions about his skills, projects, experience and availability to hire.

== IDENTITY ==
Name: Mehedi Hasan
Title: Full-Stack Web Developer & AI Automation Engineer
Location: Bangladesh
Experience: 2+ years
Email: mehedihasan228.cse@gmail.com
Phone/WhatsApp: +880 1799-447594
LinkedIn: linkedin.com/in/mehedi-hasan-2859383b4
GitHub: github.com/MehediHasan228

== SKILLS & STACK ==
Frontend: HTML5, CSS3, React.js, Bootstrap, JavaScript (ES6+)
Backend: PHP, Node.js, Python
AI/LLM: OpenAI API, Google Gemini API, Claude (Anthropic), LangChain, Ollama (local LLMs), Hugging Face
Automation: Facebook Graph API, WhatsApp Business API, Puppeteer, Selenium, Python scripting
Databases: MySQL, MongoDB
Tools: Git, GitHub, VS Code, Linux CLI, Postman, n8n, Zapier
Cloud/Deploy: GitHub Pages, VPS, cPanel

== ACHIEVEMENTS ==
- Reduced content production time by 60% using AI-driven automation workflows
- Integrated LLM APIs into enterprise systems for scalable AI-driven operations
- Built Facebook & WhatsApp automation bots serving enterprise clients
- Deployed multi-LLM orchestration pipelines (ChatGPT + Claude + Gemini)

== ACTIVE PROJECTS ==
1. Sierraromeo.ai — AI Research Agent: Python + LLM APIs, generates research summaries & marketing content (~50% work reduction)
2. Retune.so — AI Chat Web App: HTML/CSS/JS + Bootstrap, conversational AI web interface
3. HR & Payroll System — Full-stack HRMS with attendance, payroll, reporting (Ongoing)
4. AI Hostel Management — AI-assisted room allocation and student records (Ongoing)
5. AI Meal Planner (Savora) — AI-powered meal planning and grocery management app

== SERVICES OFFERED (with prices) ==
- Basic Web Development: $150
- E-commerce Development: $300
- AI Integration Service: $400
- Full-Stack Web App: $500
- API Development: $200
- UI/UX Design: $120
- Marketing Automation Bot: $250

== PERSONAL VALUES ==
Mehedi approaches work with discipline rooted in Islamic principles — precision, integrity, and delivering excellence. He practices Daily Quran recitation (Tafakkur) and sees technology as a trust to be used responsibly.

== YOUR TONE ==
- Technical and futuristic (this is a dev portfolio with a D-I-P cyberpunk aesthetic)
- Professional but approachable
- Use occasional tech-themed phrases: "Query received", "Processing...", "Data retrieved", "System online"
- Keep responses concise (2-4 sentences unless asked for more detail)
- If asked to hire, always share: WhatsApp +8801799447594 or email mehedihasan228.cse@gmail.com
- NEVER make up projects or skills not listed above`;

    // ── CONVERSATION STATE ─────────────────────────────────────────────────────
    let chatMessages = [
        { role: 'system', content: SYSTEM_INSTRUCTION }
    ];

    // ── CHAT WIDGET TOGGLE ─────────────────────────────────────────────────────
    if (chatWidget && chatHeader) {

        chatHeader.addEventListener('click', () => {
            chatWidget.classList.toggle('chat-expanded');
            chatWidget.classList.toggle('chat-collapsed');
            const icon = document.getElementById('chat-toggle-icon');
            if (icon) {
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
            }
            if (typeof playSound === 'function') playSound('click');
        });

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

        // ── HELPER: Append a message bubble ────────────────────────────────────
        function appendMsg(text, role) {
            const div = document.createElement('div');
            div.className = `message ${role === 'user' ? 'user-msg' : 'bot-msg'}`;
            div.textContent = text;
            chatBody.appendChild(div);
            if (chatBody.lastElementChild) {
                chatBody.lastElementChild.scrollIntoView({ behavior: 'smooth' });
            }
            return div;
        }

        // ── SEND MESSAGE ────────────────────────────────────────────────────────
        async function sendChat() {
            const txt = chatInput.value.trim();
            if (!txt) return;

            if (typeof playSound === 'function') playSound('type');
            chatInput.value = '';

            // Show user message
            appendMsg(txt, 'user');

            // Push to message history
            chatMessages.push({ role: 'user', content: txt });

            // Show typing indicator
            const typingEl = appendMsg('⬤ ⬤ ⬤', 'bot');

            try {
                console.log('Initiating OpenRouter Request...', { model: AI_MODEL, messages: chatMessages.length });
                const response = await fetch(OPENROUTER_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                        'HTTP-Referer': 'https://mehedi.pro.bd',
                        'X-Title': 'Mehedi Portfolio'
                    },
                    body: JSON.stringify({
                        model: AI_MODEL,
                        messages: chatMessages,
                        temperature: 0.7,
                        max_tokens: 512
                    })
                });

                if (!response.ok) {
                    const errData = await response.json();
                    console.error('OpenRouter Error Response:', errData);
                    const code = response.status;
                    const msg = errData.error?.message || errData.message || `HTTP ${code}`;
                    throw new Error(`[${code}] ${msg}`);
                }

                const data = await response.json();
                console.log('OpenRouter Success:', data);
                const reply = data.choices?.[0]?.message?.content
                    || 'No response received from AI core.';

                // Push AI reply to history
                chatMessages.push({ role: 'assistant', content: reply });

                // Replace typing indicator with response
                typingEl.textContent = reply;

            } catch (err) {
                console.error('Final Chat Error Detail:', err);
                typingEl.textContent = `⚠ ${err.message}`;
            }

            if (chatBody.lastElementChild) {
                chatBody.lastElementChild.scrollIntoView({ behavior: 'smooth' });
            }
            if (typeof playSound === 'function') playSound('type');
        }

        chatSend.addEventListener('click', sendChat);
        chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendChat(); });
    }





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
});

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

// 2. Handle page refreshes or direct links
const path = window.location.pathname.substring(1);
if (path && document.getElementById(path)) {
    // Scroll to the section if it exists on the page
    setTimeout(() => {
        document.getElementById(path).scrollIntoView({ behavior: 'smooth' });
    }, 100);
}
