/* ============================================
   S. PRAVEEN PORTFOLIO — script.js
   ============================================ */

/* ── NAV ─────────────────────────────────── */
const nav        = document.getElementById('nav');
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

/* ── MOLECULAR PARTICLE CANVAS ───────────── */
(function initCanvas() {
  const canvas = document.getElementById('moleculeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, nodes, mouse = { x: -9999, y: -9999 };
  const NODE_COUNT = 70;
  const CONNECT_DIST = 140;
  const MOUSE_REPEL = 100;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function randomNode() {
    const colors = ['#00D4FF', '#7B2FFF', '#00FFB3', '#4A9FD4'];
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r:  Math.random() * 2 + 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulse: Math.random() * Math.PI * 2,
    };
  }

  function init() {
    resize();
    nodes = Array.from({ length: NODE_COUNT }, randomNode);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Update + draw nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.pulse += 0.02;

      // Mouse repulsion
      const dx = n.x - mouse.x;
      const dy = n.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_REPEL) {
        const force = (MOUSE_REPEL - dist) / MOUSE_REPEL * 0.8;
        n.vx += (dx / dist) * force;
        n.vy += (dy / dist) * force;
      }

      n.vx *= 0.995;
      n.vy *= 0.995;
      n.x += n.vx;
      n.y += n.vy;

      // Bounce
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      n.x = Math.max(0, Math.min(W, n.x));
      n.y = Math.max(0, Math.min(H, n.y));

      // Draw node
      const pulseR = n.r + Math.sin(n.pulse) * 0.5;
      ctx.beginPath();
      ctx.arc(n.x, n.y, pulseR, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.globalAlpha = 0.75;
      ctx.fill();

      // Glow
      ctx.beginPath();
      ctx.arc(n.x, n.y, pulseR * 3, 0, Math.PI * 2);
      const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, pulseR * 3);
      grd.addColorStop(0, n.color + '33');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.globalAlpha = 0.4;
      ctx.fill();

      // Connect edges
      for (let j = i + 1; j < nodes.length; j++) {
        const m = nodes[j];
        const ex = n.x - m.x;
        const ey = n.y - m.y;
        const ed = Math.sqrt(ex * ex + ey * ey);
        if (ed < CONNECT_DIST) {
          const alpha = (1 - ed / CONNECT_DIST) * 0.3;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(m.x, m.y);
          ctx.strokeStyle = n.color;
          ctx.lineWidth = 0.8;
          ctx.globalAlpha = alpha;
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener('resize', () => { resize(); });
  init();
  draw();
})();

/* ── INTERSECTION OBSERVER ───────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delay = parseInt(el.dataset.delay || 0);
      setTimeout(() => el.classList.add('visible'), delay);
      revealObserver.unobserve(el);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
  revealObserver.observe(el);
});

/* ── SKILL BARS ──────────────────────────── */
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-card').forEach(card => {
  skillObserver.observe(card);
});

/* ── WORKFLOW STEP HOVER ─────────────────── */
document.querySelectorAll('.workflow__step').forEach((step, i) => {
  step.style.animationDelay = `${i * 0.1}s`;
  step.addEventListener('mouseenter', () => {
    step.querySelector('.step__node').style.transform = 'scale(1.15)';
  });
  step.addEventListener('mouseleave', () => {
    step.querySelector('.step__node').style.transform = '';
  });
});

/* ── SMOOTH ANCHOR SCROLLING ─────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 72;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── ACTIVE NAV LINK ─────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav__links a');

const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.style.color = 'var(--c-cyan)';
        }
      });
    }
  });
}, { rootMargin: '-30% 0px -60% 0px' });

sections.forEach(s => activeObserver.observe(s));

/* ── HERO STAGGER ANIMATION ──────────────── */
(function heroEntrance() {
  const els = document.querySelectorAll('.hero__content .reveal-up');
  els.forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.12 + 0.1}s`;
    setTimeout(() => el.classList.add('visible'), 100);
  });
})();

/* ── PROJECT CARD TILT ───────────────────── */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const rx = (e.clientY - cy) / rect.height * 6;
    const ry = (cx - e.clientX) / rect.width  * 6;
    card.style.transform = `translateY(-6px) perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ── TYPING CURSOR IN HERO TITLE ─────────── */
(function typingEffect() {
  const titles = [
    'AI-Assisted Web Application Developer',
    'Scientific Visualization Creator',
    'Blender Python Learner',
    'Chemistry App Builder',
  ];
  const el = document.querySelector('.hero__title--primary');
  if (!el) return;
  let ti = 0, ci = 0, deleting = false;

  function type() {
    const current = titles[ti];
    if (!deleting) {
      el.textContent = current.slice(0, ++ci);
      if (ci === current.length) {
        deleting = true;
        setTimeout(type, 2200);
        return;
      }
    } else {
      el.textContent = current.slice(0, --ci);
      if (ci === 0) {
        deleting = false;
        ti = (ti + 1) % titles.length;
      }
    }
    setTimeout(type, deleting ? 40 : 65);
  }
  setTimeout(type, 1500);
})();

/* ── COUNTER ANIMATION ───────────────────── */
(function animateCounters() {
  const counters = document.querySelectorAll('.stat__num');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const text = el.textContent;
      const num = parseInt(text);
      if (isNaN(num)) return;
      let start = 0;
      const dur = 1200;
      const step = timestamp => {
        if (!start) start = timestamp;
        const prog = Math.min((timestamp - start) / dur, 1);
        el.textContent = Math.floor(prog * num) + text.replace(/\d+/, '');
        if (prog < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
})();
