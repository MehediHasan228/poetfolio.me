(function () {
    var root = document.documentElement;
    function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function set(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }

    // theme is handled by the shared site script (palette button, key mehedi_theme)
    document.addEventListener('click', function (e) {
        var share = e.target.closest('[data-share]');
        if (share) {
            if (navigator.share) navigator.share({ title: document.title, url: location.href }).catch(function () { });
            else if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { share.setAttribute('title', 'Link copied'); });
        }
    });

    // live local time & smart daypart with SVG icons (no emojis)
    var fmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Dhaka' });
    var hourFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: 'Asia/Dhaka' });

    var DAYPART_SVGS = {
        sunrise: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="daypart-svg"><path d="M12 2v6"/><path d="m4.93 10.93 4.24-4.24"/><path d="m19.07 10.93-4.24-4.24"/><path d="M2 18h20"/><path d="M20 22H2"/><path d="M16 18a4 4 0 0 0-8 0"/></svg>',
        sun: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="daypart-svg"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
        sunset: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="daypart-svg"><path d="M12 10v4"/><path d="m4.93 10.93 4.24 4.24"/><path d="m19.07 10.93-4.24 4.24"/><path d="M2 18h20"/><path d="M20 22H2"/><path d="M16 18a4 4 0 0 0-8 0"/></svg>',
        moon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="daypart-svg"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M19 3v4"/><path d="M21 5h-4"/></svg>'
    };

    function tick() {
        var now = new Date();
        var timeStr = fmt.format(now);
        document.querySelectorAll('[data-time]').forEach(function (el) { el.textContent = timeStr; });

        var h = parseInt(hourFmt.format(now), 10);
        var part = 'Afternoon in Dhaka', svgIcon = DAYPART_SVGS.sun;
        if (h >= 5 && h < 12) {
            part = 'Morning in Dhaka';
            svgIcon = DAYPART_SVGS.sunrise;
        } else if (h >= 12 && h < 17) {
            part = 'Afternoon in Dhaka';
            svgIcon = DAYPART_SVGS.sun;
        } else if (h >= 17 && h < 20) {
            part = 'Evening in Dhaka';
            svgIcon = DAYPART_SVGS.sunset;
        } else if (h >= 20 && h <= 23) {
            part = 'Night in Dhaka';
            svgIcon = DAYPART_SVGS.moon;
        } else {
            part = 'Late night in Dhaka';
            svgIcon = DAYPART_SVGS.moon;
        }

        document.querySelectorAll('[data-daypart]').forEach(function (el) {
            el.innerHTML = '<span class="daypart-icon">' + svgIcon + '</span> <span class="daypart-text">' + part + '</span>';
        });
    }
    tick(); setInterval(tick, 1000);

    // language audio preview
    document.querySelectorAll('.lang-audio-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            var lang = btn.getAttribute('data-lang') || 'en';
            var phrases = {
                'en': 'Hello! Comfortable with British and American English.',
                'bn': 'আসসালামু আলাইকুম! বাংলা আমার মাতৃভাষা।',
                'ar': 'مرحباً، أهلاً وسهلاً بكم'
            };
            if ('speechSynthesis' in window) {
                try {
                    window.speechSynthesis.cancel();
                    var u = new SpeechSynthesisUtterance(phrases[lang] || 'Hello');
                    u.lang = lang === 'en' ? 'en-US' : (lang === 'bn' ? 'bn-BD' : 'ar-SA');
                    u.rate = 0.95;
                    window.speechSynthesis.speak(u);
                } catch (err) {}
            }
            btn.classList.add('playing');
            setTimeout(function () { btn.classList.remove('playing'); }, 1200);
        });
    });

    // tabs
    document.querySelectorAll('[data-tab]').forEach(function (tab) {
        tab.addEventListener('click', function () {
            document.querySelectorAll('[data-tab]').forEach(function (x) { x.setAttribute('aria-selected', x === tab); });
            document.querySelectorAll('[data-panel]').forEach(function (p) { p.hidden = p.dataset.panel !== tab.dataset.tab; });
        });
    });

    // people filter
    var chips = document.querySelectorAll('[data-filter]');
    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            var f = chip.dataset.filter;
            chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip); });
            document.querySelectorAll('.person').forEach(function (p) { p.hidden = !(f === 'all' || p.dataset.platform === f); });
        });
    });
})();
