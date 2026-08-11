// ─── Progress Bar ───
window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;

    document.getElementById('progressBar').style.width = scrolled + '%';
});


// ─── Reveal on Scroll ───
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {

            entry.target.classList.add('visible');

            // Animate skill bars
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


// ─── Shift Section ───
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


// ─── Confession Section ───
const confessionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {

        if (entry.isIntersecting) {

            document.getElementById('confPretitle').classList.add('visible');
            document.getElementById('confTitle').classList.add('visible');
            document.getElementById('confBody').classList.add('visible');
            document.getElementById('confSig').classList.add('visible');
            document.getElementById('confHeart').classList.add('visible');

            // Reveal the Spotify playlist only inside the confession
            document.getElementById('spotifyCard').classList.add('visible');

            // Start the floating particles
            document.getElementById('particles').classList.add('active');
        }
    });
}, {
    threshold: 0.2
});

const confessionSection = document.querySelector('.confession');

if (confessionSection) {
    confessionObserver.observe(confessionSection);
}


// ─── Create Floating Particles ───
function createParticles() {

    const container = document.getElementById('particles');

    for (let i = 0; i < 30; i++) {

        const particle = document.createElement('div');

        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.width = (Math.random() * 4 + 2) + 'px';
        particle.style.height = particle.style.width;

        container.appendChild(particle);
    }
}

createParticles();


// ─── Smooth Scroll for Anchor Links ───
document.querySelectorAll('a[href^="#"]').forEach(anchor => {

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


// ─── Parallax Effect on Hero ───
window.addEventListener('scroll', () => {

    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');

    if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});


// ─── The Remaining Section: Courage Meter ───
const remainingObserver = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            const fill = document.getElementById('meterFill');
            const marker = document.getElementById('meterMarker');

            setTimeout(() => {
                fill.style.width = '90%';
                marker.style.left = '90%';
                marker.classList.add('visible');
            }, 300);

            remainingObserver.unobserve(entry.target);
        }
    });

}, {
    threshold: 0.4
});

const remainingSection = document.querySelector('.remaining');

if (remainingSection) {
    remainingObserver.observe(remainingSection);
}


// ─── Lock Button ───
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