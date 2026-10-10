import { createMicroSlats } from './micro-slats.js';

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

function getCurrentTheme() {
    const rootTheme = document.documentElement.getAttribute('data-theme');
    if (rootTheme && THEME_PRESETS[rootTheme]) return rootTheme;
    const bodyTheme = document.body ? document.body.getAttribute('data-theme') : null;
    if (bodyTheme && THEME_PRESETS[bodyTheme]) return bodyTheme;
    try {
        const saved = localStorage.getItem('mehedi_theme');
        if (saved && THEME_PRESETS[saved]) return saved;
    } catch(e) {}
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

export function initSlats() {
    const targets = document.querySelectorAll('[data-slats-canvas]');
    if (!targets.length) return;

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

    document.addEventListener('click', (e) => {
        if (e.target.closest('#theme-toggler, .theme-btn, [data-theme-toggle]')) {
            setTimeout(updateAllSlats, 20);
            setTimeout(updateAllSlats, 100);
            setTimeout(updateAllSlats, 300);
        }
    });

    window.addEventListener('storage', (e) => {
        if (e.key === 'mehedi_theme') {
            updateAllSlats();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSlats);
} else {
    initSlats();
}
