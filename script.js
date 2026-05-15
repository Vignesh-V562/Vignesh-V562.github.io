

class NeuralNetworkBG {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.mouse = { x: -1000, y: -1000, active: false };
    this.nodes = [];
    this.numNodes = 80;

    this.resize();
    this.initNodes();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initNodes() {
    this.nodes = [];
    for(let i=0; i<this.numNodes; i++) {
      this.nodes.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        baseColor: `rgba(162, 155, 254, ${Math.random() * 0.6 + 0.2})`
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => { this.resize(); this.initNodes(); });
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.active = true;
    });
    window.addEventListener('mouseout', () => { this.mouse.active = false; });
  }

  update() {
    for(let i=0; i<this.nodes.length; i++) {
      let n = this.nodes[i];

      n.x += n.vx + Math.sin(Date.now() * 0.001 + n.y * 0.01) * 0.1;
      n.y += n.vy + Math.cos(Date.now() * 0.001 + n.x * 0.01) * 0.1;

      if (n.x < 0 || n.x > this.canvas.width) n.vx *= -1;
      if (n.y < 0 || n.y > this.canvas.height) n.vy *= -1;

      if (this.mouse.active) {
        let dx = n.x - this.mouse.x;
        let dy = n.y - this.mouse.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 150) {
          n.x += (dx / dist) * 1.5;
          n.y += (dy / dist) * 1.5;
        }
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const cx = this.mouse.active ? this.mouse.x : this.canvas.width/2;
    const cy = this.mouse.active ? this.mouse.y : this.canvas.height/2;

    const grad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, 600);
    grad.addColorStop(0, 'rgba(108, 92, 231, 0.08)');
    grad.addColorStop(1, 'rgba(108, 92, 231, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for(let i=0; i<this.nodes.length; i++) {
      for(let j=i+1; j<this.nodes.length; j++) {
        let dx = this.nodes[i].x - this.nodes[j].x;
        let dy = this.nodes[i].y - this.nodes[j].y;
        let dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < 130) {
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(162, 155, 254, ${(1 - dist/130) * 0.35})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
          this.ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
          this.ctx.stroke();
        }
      }

      if (this.mouse.active) {
        let dx = this.nodes[i].x - this.mouse.x;
        let dy = this.nodes[i].y - this.mouse.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 200) {
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(108, 92, 231, ${(1 - dist/200) * 0.5})`;
          this.ctx.lineWidth = 1.2;
          this.ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
          this.ctx.lineTo(this.mouse.x, this.mouse.y);
          this.ctx.stroke();
        }
      }

      this.ctx.beginPath();
      this.ctx.fillStyle = this.nodes[i].baseColor;
      this.ctx.arc(this.nodes[i].x, this.nodes[i].y, this.nodes[i].radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}



function initCursor() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;


  if ('ontouchstart' in window) {
    dot.style.display = 'none';
    ring.style.display = 'none';
    return;
  }

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });


  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();


  const hoverTargets = document.querySelectorAll('a, button, [data-hover], .nav-toggle');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.classList.add('hovering');
      dot.style.transform = 'translate(-50%, -50%) scale(0.5)';
    });
    el.addEventListener('mouseleave', () => {
      ring.classList.remove('hovering');
      dot.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  });
}



function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');


  const blob = document.createElement('div');
  blob.classList.add('nav-blob');
  navbar.appendChild(blob);

  const links = document.querySelectorAll('.nav-links a:not(.nav-cv-btn)');

  links.forEach(link => {
    link.addEventListener('mousemove', (e) => {
      const rect = link.getBoundingClientRect();

      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      link.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;


      const navRect = navbar.getBoundingClientRect();
      const blobX = e.clientX - navRect.left;
      const blobY = e.clientY - navRect.top;
      blob.style.transform = `translate(calc(${blobX}px - 50%), calc(${blobY}px - 50%))`;
      blob.style.opacity = '1';
    });

    link.addEventListener('mouseleave', () => {
      link.style.transform = `translate(0px, 0px)`;
      blob.style.opacity = '0';
    });
  });


  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    if (scrollY > 60) {
      navbar.style.background = 'rgba(10, 10, 10, 0.85)';
      navbar.style.backdropFilter = 'blur(30px)';
      navbar.style.padding = '6px 20px';
    } else {
      navbar.style.background = 'rgba(10, 10, 10, 0.75)';
      navbar.style.backdropFilter = 'blur(30px)';
      navbar.style.padding = '8px 24px';
    }
  });


  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = navToggle.querySelectorAll('span');
    if (navLinks.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }
  });


  document.querySelectorAll('.nav-links a:not(.nav-cv-btn)').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        navLinks.classList.remove('open');
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });
  });


  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollPos = window.pageYOffset + 150;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${id}"]`);
        if (active) active.classList.add('active');
      }
    });
  });
}



function initScrollIndicator() {
  const indicator = document.getElementById('scrollIndicator');
  if (!indicator) return;

  window.addEventListener('scroll', () => {
    const opacity = Math.max(0, 1 - window.pageYOffset / 250);
    indicator.style.opacity = opacity;
    indicator.style.pointerEvents = window.pageYOffset > 300 ? 'none' : 'auto';
  });
}



function initTextReveal() {

  const photoWrapper = document.querySelector('.hero-photo-wrapper');
  if (!photoWrapper) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    const parallax = scrollY * 0.3;
    photoWrapper.style.transform = `translateX(-50%) translateY(${parallax}px)`;
  });
}



function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {

        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  reveals.forEach((el, i) => {

    const parent = el.parentElement;
    if (parent && (
      parent.classList.contains('projects-grid') ||
      parent.classList.contains('timeline')
    )) {
      const siblings = Array.from(parent.querySelectorAll('.reveal'));
      const idx = siblings.indexOf(el);
      el.dataset.delay = idx * 100;
    }
    observer.observe(el);
  });
}



function initTiltCards() {
  const cards = document.querySelectorAll('[data-tilt]');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / centerY * -4;
      const rotateY = (x - centerX) / centerX * 4;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.transition = 'transform 0.1s ease-out';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      card.style.transition = 'transform 0.4s ease-out';
    });
  });
}



function initSkillOrbs() {
  const orbs = document.querySelectorAll('.skill-orb');

  orbs.forEach(orb => {
    orb.addEventListener('mousemove', (e) => {
      const rect = orb.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      orb.style.transform = `translate(${x * 0.4}px, ${y * 0.4}px) scale(1.1)`;
    });

    orb.addEventListener('mouseleave', () => {
      orb.style.transform = `translate(0px, 0px) scale(1)`;
    });
  });
}



function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    const originalText = btn.innerHTML;

    btn.innerHTML = '✓ Message Sent!';
    btn.style.background = '#00d26a';
    btn.style.boxShadow = '0 6px 25px rgba(0, 210, 106, 0.3)';

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = '';
      btn.style.boxShadow = '';
      form.reset();
    }, 2500);
  });
}



document.addEventListener('DOMContentLoaded', () => {
  new NeuralNetworkBG('neural-canvas');
  initCursor();
  initNavbar();
  initScrollIndicator();
  initTextReveal();
  initScrollReveal();
  initTiltCards();
  initSkillOrbs();
  initContactForm();

  console.log('🚀 Vignesh V Portfolio — Loaded');
});
