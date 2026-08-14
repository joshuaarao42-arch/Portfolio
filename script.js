const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const isMobile = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;

(function initScrollEffects() {
    const progressBar = document.getElementById('progressBar');
    const hero = document.querySelector('.hero');
    let ticking = false;

    function update() {
        ticking = false;

        const winScroll = document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
        if (progressBar) progressBar.style.width = scrolled + '%';

        if (hero && !isMobile && winScroll < window.innerHeight) {
            hero.style.transform = `translateY(${winScroll * 0.3}px)`;
        }
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }, { passive: true });
})();


(function initCursor() {
    if (prefersReducedMotion || !hasFinePointer) return;

    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    document.body.classList.add('fine-pointer');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let started = false;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

        if (!started) {
            started = true;
            document.body.classList.add('cursor-ready');
        }
    });

    const hoverTargets = 'a, button, .stat-card, .dossier-card, .skill-item, .webgl-hero';

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverTargets)) {
            ring.classList.add('hovering');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverTargets)) {
            ring.classList.remove('hovering');
        }
    });

    function trackRing() {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
        requestAnimationFrame(trackRing);
    }
    trackRing();
})();


(function initTilt() {
    if (prefersReducedMotion || !hasFinePointer) return;

    const selectors = '.stat-card, .dossier-card, .skill-item, .spotify-playlist';
    const els = document.querySelectorAll(selectors);
    const MAX_TILT = 6;

    els.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width;
            const py = (e.clientY - rect.top) / rect.height;
            const rotX = (py - 0.5) * -MAX_TILT;
            const rotY = (px - 0.5) * MAX_TILT;
            el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });
})();


(function initHero3D() {
    const container = document.getElementById('webglHero');
    if (!container || typeof THREE === 'undefined') return;
    if (prefersReducedMotion) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true, powerPreference: 'low-power' });
    } catch (err) {
        return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 340;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);
    container.classList.add('webgl-active');

    const group = new THREE.Group();
    scene.add(group);

    const coreGeo = new THREE.IcosahedronGeometry(102, isMobile ? 1 : 2);
    const coreEdges = new THREE.EdgesGeometry(coreGeo);
    const coreMat = new THREE.LineBasicMaterial({ color: 0xd4a574, transparent: true, opacity: 0.5 });
    const core = new THREE.LineSegments(coreEdges, coreMat);
    group.add(core);

    const glowGeo = new THREE.SphereGeometry(56, isMobile ? 18 : 32, isMobile ? 18 : 32);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xfaf9f7, transparent: true, opacity: 0.07 });
    group.add(new THREE.Mesh(glowGeo, glowMat));

    const particleCount = isMobile ? 90 : 240;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const rose = new THREE.Color(0xc44569);
    const gold = new THREE.Color(0xd4a574);

    for (let i = 0; i < particleCount; i++) {
        const r = 126 + Math.random() * 58;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        const c = rose.clone().lerp(gold, Math.random());
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
        size: 3.4,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    group.add(new THREE.Points(particleGeo, particleMat));

    let baseRotY = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let parallaxX = 0;
    let parallaxY = 0;
    let idleTimer = null;
    let autoRotate = true;
    let isVisible = true;
    let rafId = null;

    container.style.cursor = 'grab';
    container.style.touchAction = 'none';

    function wake() {
        autoRotate = false;
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => { autoRotate = true; }, 2200);
    }

    container.addEventListener('pointerdown', (e) => {
        dragging = true;
        wake();
        lastX = e.clientX;
        lastY = e.clientY;
        container.style.cursor = 'grabbing';
    });

    window.addEventListener('pointerup', () => {
        dragging = false;
        container.style.cursor = 'grab';
    }, { passive: true });

    window.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        baseRotY += dx * 0.006;
        group.rotation.x = Math.max(-0.6, Math.min(0.6, group.rotation.x + dy * 0.006));
    }, { passive: true });

    if (!isMobile) {
        document.addEventListener('mousemove', (e) => {
            if (dragging) return;
            parallaxX = ((e.clientX / window.innerWidth) - 0.5) * 0.5;
            parallaxY = ((e.clientY / window.innerHeight) - 0.5) * 0.3;
        }, { passive: true });
    }

    let hintShown = false;
    container.addEventListener('pointerenter', () => {
        if (hintShown) return;
        hintShown = true;
        const hero = container.closest('.hero-visual');
        if (hero) hero.classList.add('hint-ready');
    });

    // Only render while the hero is actually on screen and the tab is active —
    // keeps things smooth instead of burning frames off-screen.
    const visibilityObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => { isVisible = entry.isIntersecting; });
        if (isVisible && rafId === null) animate();
    }, { threshold: 0.01 });
    visibilityObserver.observe(container);

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && isVisible && rafId === null) animate();
    });

    function animate() {
        if (!isVisible || document.hidden) {
            rafId = null;
            return;
        }
        rafId = requestAnimationFrame(animate);
        if (autoRotate) baseRotY += 0.0022;
        group.rotation.y += (baseRotY + parallaxX - group.rotation.y) * 0.06;
        if (!dragging) {
            group.rotation.x += (parallaxY - group.rotation.x) * 0.04;
        }
        core.rotation.y -= 0.0009;
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (!w || !h) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });
})();


const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {

            entry.target.classList.add('visible');

           if (entry.target.classList.contains('skill-item')) {
                const fill = entry.target.querySelector('.skill-fill');
                const width = entry.target.dataset.width;

                setTimeout(() => {
                    fill.style.width = width + '%';
                }, 200);
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal, .timeline-item').forEach(el => {
    revealObserver.observe(el);
});


const shiftObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.3
});

document.querySelectorAll('.shift-text').forEach(el => {
    shiftObserver.observe(el);
});


(function initConfessionModal() {
    const backdrop = document.getElementById('confessionModal');
    const openBtn = document.getElementById('viewAnswerBtn');
    const closeBtn = document.getElementById('confessionModalClose');
    const navContactLink = document.querySelector('a[href="#confession"]');

    if (!backdrop) return;

    const revealTargets = ['confPretitle', 'confTitle', 'confSig', 'confHeart', 'spotifyCard']
        .map(id => document.getElementById(id))
        .filter(Boolean);

    const bodyLines = Array.from(document.querySelectorAll('#confBody p'));

    let revealTimer = null;

    function openModal() {
        backdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
        document.getElementById('particles').classList.add('active');

        clearTimeout(revealTimer);
        revealTargets.forEach(el => el.classList.remove('visible'));
        bodyLines.forEach(el => el.classList.remove('visible'));

        revealTimer = setTimeout(() => {
            document.getElementById('confPretitle').classList.add('visible');

            setTimeout(() => {
                document.getElementById('confTitle').classList.add('visible');
            }, 120);

            bodyLines.forEach((el, i) => {
                setTimeout(() => el.classList.add('visible'), 320 + i * 260);
            });

            const afterBody = 320 + bodyLines.length * 260;
            const tail = ['confSig', 'confHeart', 'spotifyCard']
                .map(id => document.getElementById(id))
                .filter(Boolean);

            tail.forEach((el, i) => {
                setTimeout(() => el.classList.add('visible'), afterBody + i * 150);
            });
        }, 900);
    }

    function closeModal() {
        backdrop.classList.remove('open');
        document.body.style.overflow = '';
        document.getElementById('particles').classList.remove('active');
    }

    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    }

    if (navContactLink) {
        navContactLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && backdrop.classList.contains('open')) {
            closeModal();
        }
    });
})();


function createParticles() {

    const container = document.getElementById('particles');
    const particleColors = ['#c44569', '#6e9fd4', '#d4a574', '#6e9fd4'];
    const count = isMobile ? 12 : 30;

    for (let i = 0; i < count; i++) {

        const particle = document.createElement('div');

        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.width = (Math.random() * 4 + 2) + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = particleColors[i % particleColors.length];

        container.appendChild(particle);
    }
}

createParticles();


document.querySelectorAll('a[href^="#"]:not([href="#confession"])').forEach(anchor => {

    anchor.addEventListener('click', function(e) {

        e.preventDefault();

        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});


(function () {

    const cards = document.querySelectorAll('.dossier-card');
    const details = document.querySelectorAll('.dossier-detail');
    const dossierFinal = document.getElementById('dossierFinal');

    if (!cards.length) return;

    const opened = new Set();
    let meterPlayed = false;

    function playMeter() {
        if (meterPlayed) return;
        meterPlayed = true;

        const fill = document.getElementById('meterFill');
        const marker = document.getElementById('meterMarker');

        setTimeout(() => {
            fill.style.width = '90%';
            marker.style.left = '90%';
            marker.classList.add('visible');
        }, 200);
    }

    cards.forEach(card => {

        card.addEventListener('click', () => {

            const target = card.dataset.target;
            const isActive = card.classList.contains('active');

            cards.forEach(c => c.classList.remove('active'));
            details.forEach(d => d.classList.remove('active'));

            if (!isActive) {
                card.classList.add('active');
                card.classList.add('opened');

                const detail = document.querySelector(
                    `.dossier-detail[data-detail="${target}"]`
                );

                if (detail) {
                    detail.classList.add('active');
                }

                if (target === 'tenpercent') {
                    playMeter();
                }

                opened.add(target);

                if (opened.size === details.length && dossierFinal) {
                    setTimeout(() => {
                        dossierFinal.classList.add('visible');
                    }, 500);
                }
            }
        });
    });
})();


const lockBtn = document.getElementById('lockBtn');
const lockBtnText = document.getElementById('lockBtnText');

const lockMessages = [
    "nice try 😄",
    "this part's off-screen",
    "in person na lang gyud",
    "soon, promise"
];

let lockClicks = 0;

if (lockBtn) {

    lockBtn.addEventListener('click', () => {

        lockBtn.classList.remove('shake');

        void lockBtn.offsetWidth;

        lockBtn.classList.add('shake');

        lockBtnText.textContent =
            lockMessages[lockClicks % lockMessages.length];

        lockClicks++;
    });
}


const waitBtn = document.getElementById('waitBtn');
const waitBtnText = document.getElementById('waitBtnText');
const waitNote = document.getElementById('waitNote');

if (waitBtn) {

    let waited = false;

    waitBtn.addEventListener('click', () => {

        if (waited) return;
        waited = true;

        waitBtn.classList.add('waiting');
        waitBtnText.textContent = '...';

        setTimeout(() => {
            waitBtn.classList.remove('waiting');
            waitBtn.classList.add('done');
            waitBtnText.textContent = 'okay';

            if (waitNote) {
                waitNote.classList.add('visible');
            }
        }, 1100);
    });
}
