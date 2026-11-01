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
// starts with the visitor's first input; until then the cover's soft colour blobs show. It starts once that input has been
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

// A real GPU (any phone or laptop) draws the cover for next to nothing, so there it starts by itself once the page is
// idle after load, with no input; only where WebGL would be drawn on the CPU does it wait as above.
// failIfMajorPerformanceCaveat should make the context fail then, but Chrome lets SwiftShader through, so the renderer's
// name is checked too (where a browser hides it, the masked name is a real GPU's). The test context is made in a worker:
// without a GPU, making one holds its thread for 40-240 ms, which on the page would be a long task.
const GPU_TEST = `try {
    const gl = new OffscreenCanvas(1, 1).getContext('webgl2', { failIfMajorPerformanceCaveat: true });
    let fast = false;
    if (gl) {
        const info = gl.getExtension('WEBGL_debug_renderer_info');
        const name = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || '');
        fast = !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(name);
        const lose = gl.getExtension('WEBGL_lose_context');
        if (lose) lose.loseContext();
    }
    postMessage(fast);
} catch (e) { postMessage(false); }`;
function gpuDrawsWebGL() {
    return new Promise((resolve) => {
        if (!('Worker' in window) || !('OffscreenCanvas' in window)) { resolve(false); return; }
        let url, worker;
        try {
            url = URL.createObjectURL(new Blob([GPU_TEST], { type: 'text/javascript' }));
            worker = new Worker(url);
        } catch (e) { resolve(false); return; }
        const done = (fast) => { resolve(fast); worker.terminate(); URL.revokeObjectURL(url); };
        worker.onmessage = (e) => done(e.data === true);
        worker.onerror = () => done(false);
        setTimeout(() => done(false), 5000);
    });
}

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    START_EVENTS.forEach(t => window.addEventListener(t, startOnFirstInput, { passive: true }));
    const startIfFast = () => gpuDrawsWebGL().then((fast) => {
        if (!fast || begun) return;
        START_EVENTS.forEach(t => window.removeEventListener(t, startOnFirstInput));
        begin();
    });
    const whenIdle = () => { if ('requestIdleCallback' in window) requestIdleCallback(startIfFast, { timeout: 2000 }); else setTimeout(startIfFast, 200); };
    if (document.readyState === 'complete') whenIdle(); else window.addEventListener('load', whenIdle, { once: true });
}
