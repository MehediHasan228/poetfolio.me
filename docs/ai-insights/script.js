/* --- AI INSIGHTS PAGE SCRIPT (DYNAMIC CMS V1.5) --- */

document.addEventListener('DOMContentLoaded', () => {
    initNeuralHero();
    initSimulationGraph();
    loadInsights(); // Fetch from JSON
});

/**
 * Fetch and Render Insights from JSON
 */
async function loadInsights() {
    const grid = document.getElementById('insights-grid');
    if (!grid) return;

    try {
        const res = await fetch('../data/posts.json?v=' + Date.now()); 
        if (!res.ok) throw new Error('DATA_LOAD_FAILURE');
        const posts = await res.json();
        
        renderBlogGrid(posts);
        setupFilters(posts);
    } catch (err) {
        console.error('CMS Error:', err);
        grid.innerHTML = `
            <div style="text-align:center; grid-column: 1/-1; padding: 50px;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; color: #ef4444;"></i>
                <p style="margin-top: 15px; color: var(--text-secondary); font-family: 'Fira Code', monospace;">
                    CRITICAL_ERROR: Failed to sync intelligence nodes. Check posts.json.
                </p>
            </div>
        `;
    }
}

/**
 * Render the Grid with high-end layout
 */
function renderBlogGrid(posts) {
    const grid = document.getElementById('insights-grid');
    if (posts.length === 0) {
        grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; padding: 50px;">No encrypted articles found in this protocol.</p>';
        return;
    }
    
    grid.innerHTML = posts.map((post, idx) => `
        <article class="blog-card glass-card magnetic-element hover-sound">
            <div class="blog-img-wrapper">
                <img src="${post.image}" alt="${post.title}" onerror="this.src='./img/reasoning.png'">
                <div class="neural-tag">${post.model}</div>
                ${post.isNew ? '<div class="new-badge">LATEST</div>' : ''}
            </div>
            <div class="blog-content">
                <div class="blog-meta">
                    <span>${post.date}</span> 
                    <span class="dot"></span> 
                    <span>${post.readTime}</span>
                    <span class="category-tag">${post.category}</span>
                </div>
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <a href="#" class="read-btn" onclick="openArticle(${post.id})">READ_TRANSCRIPT <i class="fa-solid fa-arrow-right-long"></i></a>
            </div>
        </article>
    `).join('');
}

/**
 * Setup Category Filters
 */
function setupFilters(allPosts) {
    const categories = ['All', ...new Set(allPosts.map(p => p.category))];
    const existingFilter = document.querySelector('.filter-container');
    if (existingFilter) existingFilter.remove();

    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container container';
    filterContainer.innerHTML = categories.map(cat => `
        <button class="filter-btn ${cat === 'All' ? 'active' : ''}" onclick="filterPosts('${cat}')">${cat}</button>
    `).join('');
    
    const main = document.querySelector('main');
    main.insertBefore(filterContainer, document.getElementById('insights-grid'));
}

window.filterPosts = async (category) => {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === category);
    });

    const res = await fetch('../data/posts.json');
    let posts = await res.json();
    
    if (category !== 'All') {
        posts = posts.filter(p => p.category === category);
    }
    
    renderBlogGrid(posts);
};

window.openArticle = (id) => {
    alert('Accessing encrypted article node [ID: ' + id + ']. Full view implementation pending.');
};

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
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.radius = Math.random() * 1.5;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';ctx.fill();
        }
    }

    for (let i = 0; i < 80; i++) particles.push(new Particle());

    const animate = () => {
        ctx.clearRect(0, 0, width, height);
        particles.forEach((p, idx) => {
            p.update();p.draw();
            for (let j = idx + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();ctx.moveTo(p.x, p.y);ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${1 - dist / 150})`;
                    ctx.lineWidth = 0.5;ctx.stroke();
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
        points.push({ x: i * spacing, y: height / 2, targetY: height / 2, speed: 0.1 });
    }

    const animateGraph = () => {
        ctx.clearRect(0, 0, width, height);
        
        ctx.beginPath();
        ctx.strokeStyle = '#06b6d4';ctx.lineWidth = 2;
        
        points.forEach((p, i) => {
            if (Math.random() < 0.02) p.targetY = height / 2 + (Math.random() - 0.5) * height * 0.7;
            else if (Math.abs(p.y - p.targetY) < 1) p.targetY = height / 2;
            p.y += (p.targetY - p.y) * p.speed;
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
        
        ctx.lineTo(width, height); ctx.lineTo(0, height);
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, 'rgba(6, 182, 212, 0.2)');grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = grad; ctx.fill();
        
        requestAnimationFrame(animateGraph);
    };

    const updateStats = (() => {
        let lastUpdate = 0;
        const powerEl = document.getElementById('sync-power');
        return () => {
            const now = Date.now();
            if (now - lastUpdate > 1000) {
                if (powerEl) powerEl.textContent = (20 + Math.random() * 15).toFixed(1) + ' TFLOPS';
                lastUpdate = now;
            }
        };
    })();

    animateGraph();
}
