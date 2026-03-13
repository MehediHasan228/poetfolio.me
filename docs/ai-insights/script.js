/* --- AI INSIGHTS PAGE SCRIPT --- */

document.addEventListener('DOMContentLoaded', () => {
    initNeuralHero();
    initSimulationGraph();
});

/**
 * Neural Heritage Hero Canvas
 */
function initNeuralHero() {
    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, particles = [];

    const resize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';
            ctx.fill();
        }
    }

    for (let i = 0; i < 100; i++) particles.push(new Particle());

    const animate = () => {
        ctx.clearRect(0, 0, width, height);
        
        particles.forEach((p, idx) => {
            p.update();
            p.draw();

            // Connect lines
            for (let j = idx + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${1 - dist / 150})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        });

        requestAnimationFrame(animate);
    };

    animate();
}

/**
 * Live Neuro_Sync Simulation Graph
 */
function initSimulationGraph() {
    const canvas = document.getElementById('simulation-graph');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    
    const resize = () => {
        const rect = canvas.parentNode.getBoundingClientRect();
        width = canvas.width = rect.width;
        height = canvas.height = rect.height;
    };

    window.addEventListener('resize', resize);
    resize();

    let points = [];
    const maxPoints = 50;
    const spacing = width / maxPoints;

    for (let i = 0; i <= maxPoints; i++) {
        points.push({
            x: i * spacing,
            y: height / 2,
            targetY: height / 2,
            speed: 0.05 + Math.random() * 0.1
        });
    }

    const animateGraph = () => {
        ctx.clearRect(0, 0, width, height);

        // Draw Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 50) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
        }
        for (let i = 0; i < height; i += 50) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
        }

        // Update Points
        ctx.beginPath();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';

        points.forEach((p, i) => {
            // Neural simulation logic: occasional spikes
            if (Math.random() < 0.01) {
                p.targetY = height / 2 + (Math.random() - 0.5) * height * 0.8;
            } else if (Math.abs(p.y - p.targetY) < 1) {
                p.targetY = height / 2; // Return to baseline
            }

            // Smooth interpolation
            p.y += (p.targetY - p.y) * p.speed;

            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });

        ctx.stroke();

        // Area Fill
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(6, 182, 212, 0.2)');
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Update Stats
        updateStats();

        requestAnimationFrame(animateGraph);
    };

    const updateStats = (() => {
        let lastUpdate = 0;
        const powerEl = document.getElementById('sync-power');
        const levelEl = document.getElementById('sync-level');
        
        return () => {
            const now = Date.now();
            if (now - lastUpdate > 1000) {
                if (powerEl) powerEl.textContent = (20 + Math.random() * 10).toFixed(1) + ' TFLOPS';
                if (levelEl) levelEl.textContent = (95 + Math.random() * 4.9).toFixed(1) + '%';
                lastUpdate = now;
            }
        };
    })();

    animateGraph();
}
