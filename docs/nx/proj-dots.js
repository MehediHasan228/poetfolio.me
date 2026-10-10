/**
 * proj-dots.js — Animated Halftone Matrix Wave for Project Cards
 * Activates on hover: background darkens and matrix dots ripple around cursor.
 */
(function() {
  'use strict';

  function getThemeColors() {
    const root = document.documentElement;
    const theme = root.getAttribute('data-theme') || 'dark';

    if (theme === 'light') {
      return {
        base: [37, 99, 235],       // #2563eb
        crest: [96, 165, 250],     // #60a5fa
        dimAlpha: 0.22,
        maxAlpha: 0.85
      };
    }
    if (theme === 'cyberpunk') {
      return {
        base: [244, 63, 94],       // #f43f5e neon rose
        crest: [254, 240, 138],    // #fef08a yellow
        dimAlpha: 0.25,
        maxAlpha: 0.95
      };
    }
    if (theme === 'mint') {
      return {
        base: [16, 185, 129],       // #10b981 emerald
        crest: [110, 231, 183],     // #6ee7b7 mint
        dimAlpha: 0.22,
        maxAlpha: 0.90
      };
    }
    if (theme === 'god-mode') {
      return {
        base: [0, 255, 70],        // #00ff46 matrix green
        crest: [220, 252, 231],    // #dcfce7
        dimAlpha: 0.28,
        maxAlpha: 0.98
      };
    }
    // Default Dark: Electric Cyan matching the exact site theme (--brand-rgb: 0, 242, 254)
    return {
      base: [0, 242, 254],         // #00f2fe electric cyan
      crest: [165, 243, 252],      // #a5f3fc luminous ice cyan
      dimAlpha: 0.22,
      maxAlpha: 0.94
    };
  }

  function initCardDots(canvas) {
    if (canvas.__dotsInitialized) return;
    canvas.__dotsInitialized = true;

    const card = canvas.closest('.proj');
    if (!card) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = 1;
    let animId = null;
    let isVisible = false;
    let isHovered = false;
    let stopTimeout = null;
    let mouse = { x: -999, y: -999, active: false };
    let time = Math.random() * 40;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function startLoop() {
      if (stopTimeout) {
        clearTimeout(stopTimeout);
        stopTimeout = null;
      }
      if (!animId && isVisible) {
        animId = requestAnimationFrame(draw);
      }
    }

    function updateMouse(e) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }

    card.addEventListener('pointerenter', (e) => {
      isHovered = true;
      updateMouse(e);
      startLoop();
    }, { passive: true });

    card.addEventListener('pointermove', (e) => {
      updateMouse(e);
      if (!animId) startLoop();
    }, { passive: true });

    card.addEventListener('pointerleave', () => {
      isHovered = false;
      mouse.active = false;
      // Keep animating during the 0.45s CSS fade-out transition, then pause to save resources
      stopTimeout = setTimeout(() => {
        if (!isHovered && animId) {
          cancelAnimationFrame(animId);
          animId = null;
          ctx.clearRect(0, 0, width, height);
        }
      }, 500);
    }, { passive: true });

    function draw() {
      if (!isVisible) {
        animId = null;
        return;
      }
      ctx.clearRect(0, 0, width, height);

      const theme = getThemeColors();
      const spacing = 13.0; // pixel distance between dots
      time += 0.015; // Slow, smooth, elegant wave pace

      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      const startX = (width - (cols - 1) * spacing) / 2;
      const startY = (height - (rows - 1) * spacing) / 2;

      for (let i = 0; i < cols; i++) {
        const x = startX + i * spacing;
        for (let j = 0; j < rows; j++) {
          const y = startY + j * spacing;

          // Smooth flowing directional wave (traveling gracefully at ~35 deg angle)
          const diagPos = (x * 0.819 + y * 0.573) * 0.02 - time * 0.85;
          const w1 = Math.sin(diagPos);

          // Counter-harmonic for organic liquid undulation
          const w2 = Math.sin(x * 0.013 - y * 0.021 - time * 0.55);

          // Subtle radial swell from center
          const distCenter = Math.hypot(x - width * 0.5, y - height * 0.5);
          const w3 = Math.sin(distCenter * 0.018 - time * 0.7);

          const combined = w1 * 0.58 + w2 * 0.26 + w3 * 0.16;
          let factor = (combined + 1) * 0.5;

          // Wave shaping: highlights the rolling crests of the wave
          factor = Math.pow(factor, 1.85);

          // Mouse spotlight / smooth expanding ripple
          if (mouse.active) {
            const dist = Math.hypot(x - mouse.x, y - mouse.y);
            const maxDist = 120;
            if (dist < maxDist) {
              const mFactor = Math.pow(1 - dist / maxDist, 1.4);
              const mRipple = Math.sin(dist * 0.075 - time * 1.3) * 0.28 * mFactor;
              factor = Math.min(1.3, factor * (1 - mFactor * 0.35) + mFactor * 0.85 + mRipple);
            }
          }

          const radius = 0.85 + factor * 2.85; // ~0.85px to ~3.7px
          const alpha = theme.dimAlpha + factor * (theme.maxAlpha - theme.dimAlpha);

          // Interpolate between base color and bright crest
          const cr = factor > 0.6 ? Math.min(1, (factor - 0.6) / 0.4) : 0;
          const r = Math.round(theme.base[0] * (1 - cr) + theme.crest[0] * cr);
          const g = Math.round(theme.base[1] * (1 - cr) + theme.crest[1] * cr);
          const b = Math.round(theme.base[2] * (1 - cr) + theme.crest[2] * cr);

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (!isVisible && animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      });
    }, { threshold: 0.05 });

    observer.observe(canvas);

    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(canvas);

    resize();
  }

  function init() {
    const canvases = document.querySelectorAll('.proj-dots-canvas');
    canvases.forEach(initCardDots);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Hook into theme toggles
  document.addEventListener('click', (e) => {
    if (e.target.closest('#theme-toggler, .theme-btn, [data-theme-toggle]')) {
      setTimeout(init, 50);
    }
  });
})();
