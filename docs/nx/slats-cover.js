const THEME_PRESETS = {
    'dark': {
        backgroundColor: '#0b1120',
        color: '#00f2fe',
        glintColor: '#e0f9ff'
    },
    'light': {
        backgroundColor: '#f8fafc',
        color: '#2563eb',
        glintColor: '#ffffff'
    },
    'cyberpunk': {
        backgroundColor: '#09090b',
        color: '#f43f5e',
        glintColor: '#fef08a'
    },
    'mint': {
        backgroundColor: '#f4faf7',
        color: '#10b981',
        glintColor: '#ffffff'
    },
    'god-mode': {
        backgroundColor: '#000000',
        color: '#00ff00',
        glintColor: '#dcfce7'
    }
};

// site storage can be blocked (then touching it throws): it is read only through this
function storedTheme() {
    try { return localStorage.getItem('mehedi_theme'); } catch (e) { return null; }
}

function getCurrentTheme() {
    const rootTheme = document.documentElement.getAttribute('data-theme');
    if (rootTheme && THEME_PRESETS[rootTheme]) return rootTheme;
    const bodyTheme = document.body ? document.body.getAttribute('data-theme') : null;
    if (bodyTheme && THEME_PRESETS[bodyTheme]) return bodyTheme;
    const saved = storedTheme();
    if (saved && THEME_PRESETS[saved]) return saved;
    if (document.documentElement.classList.contains('light')) return 'light';
    return 'dark';
}

function getSlatsColors() {
    const theme = getCurrentTheme();
    const preset = THEME_PRESETS[theme] || THEME_PRESETS.dark;

    const cs = getComputedStyle(document.documentElement);
    const bg = cs.getPropertyValue('--slats-bg').trim();
    const col = cs.getPropertyValue('--slats-color').trim();
    const glint = cs.getPropertyValue('--slats-glint').trim();

    return {
        backgroundColor: bg || preset.backgroundColor,
        color: col || preset.color,
        glintColor: glint || preset.glintColor
    };
}

let instances = [];

export function updateAllSlats() {
    const colors = getSlatsColors();
    instances.forEach(inst => {
        try {
            if (inst && typeof inst.set === 'function') {
                inst.set(colors);
            }
        } catch (e) {
            console.warn('Failed to update slats colors:', e);
        }
    });
}

export async function initSlats() {
    const targets = document.querySelectorAll('[data-slats-canvas]');
    if (!targets.length) return;

    const { createMicroSlats } = await import('./micro-slats.js');
    const colors = getSlatsColors();

    targets.forEach(el => {
        if (el.__slatsInstance) return;
        try {
            const instance = createMicroSlats(el, {
                preset: 'swell',
                ...colors,
                slatWidth: 8,
                slatHeight: 20,
                gap: 3,
                cursorSize: 48,
                trail: 1.6,
                swirl: 0.4
            });
            if (instance) {
                el.__slatsInstance = instance;
                instances.push(instance);
                requestAnimationFrame(() => {
                    el.style.opacity = '1';
                });
            }
        } catch (err) {
            console.warn('MicroSlats init failed:', err);
        }
    });

    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            if (m.attributeName === 'data-theme' || m.attributeName === 'class') {
                updateAllSlats();
                break;
            }
        }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    if (document.body) {
        observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    }

    window.addEventListener('storage', (e) => {
        if (e.key === 'mehedi_theme') {
            updateAllSlats();
        }
    });
}

// without a GPU (PageSpeed's test machine has none) WebGL is drawn on the CPU, so the cover
// starts with the visitor's first input; until then the CSS slat pattern shows. It starts once that input has been
// answered, after the frame that shows it: a press first ends (its click, or a scroll taking over), and the WebGL set-up
// comes after the next frame. Set up inside a tap, it held a slow phone's first tap back by about 80 ms.
const START_EVENTS = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'];
const PRESS_ENDS = ['click', 'pointercancel', 'touchcancel'];
let begun = false;

function begin() {
    if (begun) return;
    begun = true;
    PRESS_ENDS.forEach(t => window.removeEventListener(t, begin));
    requestAnimationFrame(() => setTimeout(() => {
        initSlats().catch(err => console.warn('MicroSlats load failed:', err));
    }, 0));
}

function startOnFirstInput(e) {
    START_EVENTS.forEach(t => window.removeEventListener(t, startOnFirstInput));
    if (e.type !== 'pointerdown' && e.type !== 'touchstart') { begin(); return; }
    PRESS_ENDS.forEach(t => window.addEventListener(t, begin, { passive: true }));
    setTimeout(begin, 1000);   // a long press, or a press whose click never came
}

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    START_EVENTS.forEach(t => window.addEventListener(t, startOnFirstInput, { passive: true }));
}
