/* ============================================
   ALEXMLD — AVANT-GARDE GALLERY SHOWCASE
   main.js — GSAP 3.12.5 + ScrollTrigger
   6 godly animations. Awwwards level.
   ============================================ */

gsap.registerPlugin(ScrollTrigger);

// ─── Global State ───
const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, nX: 0.5, nY: 0.5 };
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.nX = e.clientX / window.innerWidth;
  mouse.nY = e.clientY / window.innerHeight;
});

// ─── Utility: lerp ───
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

// ─── Utility: generate random blob path ───
function randomBlobPath(cx, cy, avgR, points = 8) {
  const pts = [];
  for (let i = 0; i < points; i++) {
    const angle = (Math.PI * 2 / points) * i;
    const r = avgR + (Math.random() - 0.5) * avgR * 0.5;
    pts.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length; i++) {
    const curr = pts[i];
    const next = pts[(i + 1) % pts.length];
    const cpx1 = curr.x + (next.x - curr.x) * 0.5 + (Math.random() - 0.5) * 40;
    const cpy1 = curr.y + (next.y - curr.y) * 0.5 + (Math.random() - 0.5) * 40;
    const cpx2 = next.x - (next.x - curr.x) * 0.5 + (Math.random() - 0.5) * 40;
    const cpy2 = next.y - (next.y - curr.y) * 0.5 + (Math.random() - 0.5) * 40;
    d += ` C${cpx1},${cpy1} ${cpx2},${cpy2} ${next.x},${next.y}`;
  }
  d += 'Z';
  return d;
}

// ─── Hero Animation ───
function initHero() {
  const tl = gsap.timeline({ delay: 0.2 });
  tl.to('.hero-line', {
    y: 0,
    duration: 1.6,
    stagger: 0.15,
    ease: 'expo.out',
  })
  .to('.hero-sub', {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: 'power3.out',
  }, '-=0.8')
  .to('.scroll-hint', {
    opacity: 1,
    duration: 1,
    ease: 'power2.out',
  }, '-=0.4');

  initHeroParticles();
}

function initHeroParticles() {
  const canvas = document.getElementById('heroParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = Math.random() * 1.5 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.15;
      this.vy = (Math.random() - 0.5) * 0.15;
      this.opacity = Math.random() * 0.4 + 0.05;
      this.baseOpacity = this.opacity;
      this.phase = Math.random() * Math.PI * 2;
    }
    update(t) {
      this.x += this.vx;
      this.y += this.vy;
      this.opacity = this.baseOpacity * (0.5 + 0.5 * Math.sin(t * 0.001 + this.phase));
      if (this.x < -10) this.x = w + 10;
      if (this.x > w + 10) this.x = -10;
      if (this.y < -10) this.y = h + 10;
      if (this.y > h + 10) this.y = -10;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 100; i++) particles.push(new Particle());

  let frame = 0;
  function animate(t) {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => { p.update(t); p.draw(); });
    // Connect nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255,255,255,${0.03 * (1 - dist / 120)})`;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate(0);
}

// ─── Floating Nav Active State ───
function initNav() {
  const sections = document.querySelectorAll('.style-section');
  const links = document.querySelectorAll('.nav-link');

  sections.forEach((section, i) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => setActive(i),
      onEnterBack: () => setActive(i),
    });
  });

  function setActive(index) {
    links.forEach(l => l.classList.remove('active'));
    if (links[index]) links[index].classList.add('active');
  }

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        window.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
      }
    });
  });
}

// ─── Section Header Reveals ───
function initSectionHeaders() {
  document.querySelectorAll('.section-header').forEach(header => {
    gsap.from(header.children, {
      y: 50,
      opacity: 0,
      duration: 1.2,
      stagger: 0.12,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: header,
        start: 'top 80%',
        once: true,
      }
    });
  });
}


/* ============================================
   1. KINETIC SCULPTURE — Orbiting Solar System
   ============================================ */
function initKineticSculpture() {
  const cards = document.querySelectorAll('.kinetic-orbit-card');
  const numCards = cards.length;
  const system = document.getElementById('kineticSolarSystem');
  let orbitTime = 0;
  let scrollSpeed = 1;
  let targetSpeed = 1;
  let lastScrollTime = Date.now();
  let activeBreakCard = -1;
  let breakProgress = 0;

  const orbitData = Array.from({ length: numCards }, (_, i) => ({
    radius: 140 + i * 35,
    speed: 0.25 + i * 0.06,
    angleOffset: (Math.PI * 2 / numCards) * i,
    zBase: -150 + i * 40,
    tilt: (Math.random() - 0.5) * 10,
  }));

  let scrollVelocity = 0;
  let prevScrollY = window.scrollY;

  function trackScroll() {
    scrollVelocity = Math.abs(window.scrollY - prevScrollY);
    prevScrollY = window.scrollY;
    if (scrollVelocity > 2) {
      lastScrollTime = Date.now();
      targetSpeed = 1 + Math.min(scrollVelocity * 0.08, 10);
    }
    requestAnimationFrame(trackScroll);
  }
  trackScroll();

  // Main orbit loop
  function animateOrbit() {
    const now = Date.now();
    const isIdle = now - lastScrollTime > 2000;

    // Ease toward target speed
    if (isIdle) {
      targetSpeed = lerp(targetSpeed, 1, 0.02);
    }
    scrollSpeed = lerp(scrollSpeed, targetSpeed, 0.06);
    orbitTime += 0.002 * scrollSpeed;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const centerX = vw / 2;
    const centerY = vh / 2;

    cards.forEach((card, i) => {
      const d = orbitData[i];
      const angle = orbitTime * d.speed + d.angleOffset;
      const x = Math.cos(angle) * d.radius;
      const z = Math.sin(angle) * d.radius;
      const y = Math.sin(angle * 0.7 + d.angleOffset) * 25;
      const depth = (z + d.radius) / (d.radius * 2); // 0 (back) → 1 (front)
      const baseScale = 0.55 + depth * 0.55;
      const baseOpacity = 0.25 + depth * 0.75;

      // If this card is the "break orbit" card
      if (i === activeBreakCard && breakProgress > 0) {
        const bp = breakProgress;
        const breakScale = lerp(baseScale, 2.5, bp);
        const breakZ = lerp(z + d.zBase, 400, bp);
        const breakOpacity = lerp(baseOpacity, 1, Math.min(bp * 2, 1));
        const breakX = lerp(x, 0, bp * bp);
        const breakY = lerp(y, 0, bp * bp);

        gsap.set(card, {
          x: breakX,
          y: breakY,
          z: breakZ,
          scale: breakScale,
          opacity: breakOpacity,
          rotateY: lerp(angle * 30, 0, bp),
          rotateX: lerp(-5, 0, bp),
        });

        // Glow intensifies as it breaks free
        const inner = card.querySelector('.kinetic-card-inner');
        const glowSize = 20 + bp * 60;
        const glowAlpha = 0.2 + bp * 0.5;
        inner.style.boxShadow = `0 0 ${glowSize}px rgba(229,93,135,${glowAlpha}), 0 0 ${glowSize * 2}px rgba(229,93,135,${glowAlpha * 0.3})`;
      } else {
        // Normal orbit with mouse gravitational lensing
        const cardCenterX = centerX + x;
        const cardCenterY = centerY + y;
        const mdx = (mouse.x - cardCenterX) * 0.012;
        const mdy = (mouse.y - cardCenterY) * 0.012;

        gsap.set(card, {
          x: x + mdx,
          y: y + mdy,
          z: z + d.zBase,
          scale: baseScale,
          opacity: (activeBreakCard >= 0 && breakProgress > 0.3) ? baseOpacity * 0.3 : baseOpacity,
          rotateY: angle * (180 / Math.PI) * 0.15,
          rotateX: -8 + Math.sin(angle) * 6,
        });

        // Subtle glow as card passes foreground
        const inner = card.querySelector('.kinetic-card-inner');
        if (depth > 0.75) {
          const glowIntensity = (depth - 0.75) * 4;
          inner.style.boxShadow = `0 0 ${15 * glowIntensity}px rgba(229,93,135,${0.15 * glowIntensity}), 0 15px 50px rgba(0,0,0,0.4)`;
        } else {
          inner.style.boxShadow = '0 15px 50px rgba(0,0,0,0.4)';
        }
      }
    });

    requestAnimationFrame(animateOrbit);
  }

  // ScrollTrigger: break orbit at thresholds
  const section = document.getElementById('style-1');

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.6,
    onUpdate: (self) => {
      const p = self.progress;
      targetSpeed = 1 + Math.abs(self.getVelocity()) * 0.005;
      lastScrollTime = Date.now();

      // Determine which card breaks orbit
      const breakIndex = Math.floor(p * numCards);
      if (breakIndex !== activeBreakCard && breakIndex < numCards) {
        activeBreakCard = breakIndex;
      }

      // Break progress within each segment
      const segSize = 1 / numCards;
      const segProgress = (p % segSize) / segSize;
      // Card breaks in first 40% of segment, holds, then returns in last 20%
      if (segProgress < 0.4) {
        breakProgress = segProgress / 0.4;
      } else if (segProgress < 0.8) {
        breakProgress = 1;
      } else {
        breakProgress = 1 - (segProgress - 0.8) / 0.2;
      }
      breakProgress = clamp(breakProgress, 0, 1);

      // Apply eased break progress
      breakProgress = breakProgress < 0.5
        ? 4 * breakProgress * breakProgress * breakProgress
        : 1 - Math.pow(-2 * breakProgress + 2, 3) / 2; // cubic ease in-out
    }
  });

  animateOrbit();

  // Mobile fallback
  if (window.innerWidth <= 768) {
    const mobileCards = document.querySelectorAll('.mobile-card');
    mobileCards.forEach((card, i) => {
      gsap.to(card, {
        y: -6 - Math.random() * 14,
        duration: 2.5 + Math.random() * 1.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * 0.15,
      });
      gsap.from(card, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          once: true,
        }
      });
    });
  }
}


/* ============================================
   2. SHATTERING GLASS
   ============================================ */
function initShatteringGlass() {
  const projects = document.querySelectorAll('.shatter-project');
  const svgEl = document.getElementById('shatterCracksSvg');
  const fragContainer = document.getElementById('shatterFragments');
  const section = document.getElementById('style-2');
  const numProjects = projects.length;

  // Generate jagged crack path
  function generateCrack(sx, sy, ex, ey, detail = 8) {
    let d = `M${sx.toFixed(1)},${sy.toFixed(1)}`;
    const steps = detail + Math.floor(Math.random() * 4);
    let cx = sx, cy = sy;
    for (let i = 0; i < steps; i++) {
      const t = (i + 1) / steps;
      const targetX = sx + (ex - sx) * t;
      const targetY = sy + (ey - sy) * t;
      const jitter = 40 + Math.random() * 40;
      cx = targetX + (Math.random() - 0.5) * jitter;
      cy = targetY + (Math.random() - 0.5) * jitter;
      d += ` L${cx.toFixed(1)},${cy.toFixed(1)}`;
    }
    return d;
  }

  // Generate branch cracks
  function generateCrackSystem(sx, sy) {
    const paths = [];
    // Main crack — diagonal across screen
    const ex = window.innerWidth - sx + (Math.random() - 0.5) * 200;
    const ey = window.innerHeight - sy + (Math.random() - 0.5) * 200;
    paths.push(generateCrack(sx, sy, ex, ey, 12));

    // Branch cracks
    const numBranches = 3 + Math.floor(Math.random() * 4);
    for (let b = 0; b < numBranches; b++) {
      const bt = 0.2 + Math.random() * 0.6; // point along main crack
      const bx = lerp(sx, ex, bt) + (Math.random() - 0.5) * 80;
      const by = lerp(sy, ey, bt) + (Math.random() - 0.5) * 80;
      const bex = bx + (Math.random() - 0.5) * 300;
      const bey = by + (Math.random() - 0.5) * 300;
      paths.push(generateCrack(bx, by, bex, bey, 5));

      // Sub-branches
      if (Math.random() < 0.5) {
        const sbt = 0.3 + Math.random() * 0.4;
        const sbx = lerp(bx, bex, sbt);
        const sby = lerp(by, bey, sbt);
        paths.push(generateCrack(sbx, sby, sbx + (Math.random() - 0.5) * 150, sby + (Math.random() - 0.5) * 150, 3));
      }
    }
    return paths;
  }

  // Create triangular fragments
  function createFragments(bg) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    fragContainer.innerHTML = '';

    const cols = Math.max(8, Math.floor(vw / 80));
    const rows = Math.max(6, Math.floor(vh / 80));
    const fragW = vw / cols;
    const fragH = vh / rows;
    const fragments = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Two triangles per cell
        for (let tri = 0; tri < 2; tri++) {
          const frag = document.createElement('div');
          frag.className = 'shatter-fragment';

          const clipPath = tri === 0
            ? 'polygon(0 0, 100% 0, 0 100%)'
            : 'polygon(100% 0, 100% 100%, 0 100%)';

          frag.style.cssText = `
            left: ${c * fragW}px;
            top: ${r * fragH}px;
            width: ${fragW + 1}px;
            height: ${fragH + 1}px;
            background: ${bg};
            clip-path: ${clipPath};
            -webkit-clip-path: ${clipPath};
          `;
          fragContainer.appendChild(frag);
          fragments.push(frag);
        }
      }
    }
    return fragments;
  }

  // Shatter animation with physics
  function shatterProject(project, fragments) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    fragments.forEach((frag, i) => {
      const rect = frag.getBoundingClientRect();
      const fx = rect.left + rect.width / 2;
      const fy = rect.top + rect.height / 2;

      // Direction away from crack origin (cursor area)
      const dx = (fx - mouse.x) / window.innerWidth;
      const dy = (fy - mouse.y) / window.innerHeight;
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.3;

      const force = 300 + Math.random() * 800;
      const tx = dx * force / dist + (Math.random() - 0.5) * 200;
      const ty = dy * force / dist + (Math.random() - 0.5) * 200 + 150; // gravity bias
      const rot = (Math.random() - 0.5) * 1440;
      const delay = i * 0.002 + dist * 0.1;

      gsap.to(frag, {
        x: tx,
        y: ty,
        rotation: rot,
        rotateX: (Math.random() - 0.5) * 720,
        rotateY: (Math.random() - 0.5) * 720,
        opacity: 0,
        scale: 0.3 + Math.random() * 0.4,
        duration: 1 + Math.random() * 0.8,
        ease: 'power3.in',
        delay: delay,
        overwrite: 'auto',
      });
    });

    // Screen shake
    document.body.classList.add('screen-shake');
    setTimeout(() => document.body.classList.remove('screen-shake'), 600);

    // Fade original
    gsap.to(project, {
      opacity: 0,
      scale: 1.03,
      duration: 0.4,
      ease: 'power2.in',
    });
  }

  // Track crack origins based on cursor
  let crackOrigin = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  window.addEventListener('mousemove', () => {
    crackOrigin.x = mouse.x;
    crackOrigin.y = mouse.y;
  });

  // Set up scroll-driven crack → shatter for each project
  const shatterState = new Array(numProjects).fill(null).map(() => ({ shattered: false, cracksDrawn: false }));

  projects.forEach((project, index) => {
    if (index === numProjects - 1) return;

    ScrollTrigger.create({
      trigger: section,
      start: () => `${(index / numProjects) * 100 + 2}% top`,
      end: () => `${((index + 1) / numProjects) * 100}% top`,
      scrub: 0.4,
      onUpdate: (self) => {
        const p = self.progress;

        // Phase 1: Crack drawing (0 → 0.5)
        if (p < 0.5) {
          if (!shatterState[index].shattered) {
            svgEl.style.display = 'block';
            svgEl.innerHTML = '';

            const numVisibleCracks = Math.max(1, Math.ceil(p / 0.5 * 6));
            const crackPaths = generateCrackSystem(crackOrigin.x, crackOrigin.y);

            crackPaths.slice(0, numVisibleCracks).forEach(d => {
              const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
              path.setAttribute('d', d);
              const len = 3000;
              path.style.strokeDasharray = `${len}`;
              path.style.strokeDashoffset = `${len * (1 - (p / 0.5))}`;
              path.style.stroke = `rgba(255,255,255,${0.4 + p * 0.6})`;
              path.style.strokeWidth = '1.5';
              path.style.filter = `drop-shadow(0 0 4px rgba(255,255,255,0.5))`;
              svgEl.appendChild(path);
            });
          }
        }

        // Phase 2: Shatter (0.5 → 0.7)
        if (p >= 0.5 && p < 0.7 && !shatterState[index].shattered) {
          shatterState[index].shattered = true;
          svgEl.innerHTML = '';
          svgEl.style.display = 'none';

          const bg = project.style.background || project.style.backgroundImage;
          const fragments = createFragments(bg);
          shatterProject(project, fragments);
        }

        // Phase 3: Clean up
        if (p >= 0.7) {
          project.style.opacity = '0';
          project.style.pointerEvents = 'none';
        }
      },
      onLeaveBack: () => {
        // Reset on scroll back
        shatterState[index].shattered = false;
        project.style.opacity = '1';
        project.style.pointerEvents = '';
        fragContainer.innerHTML = '';
        svgEl.innerHTML = '';
      }
    });
  });

  // Mobile: simple split reveal
  if (window.innerWidth <= 768) {
    projects.forEach((project, i) => {
      if (i === 0) {
        gsap.set(project, { clipPath: 'inset(0% 0% 0% 0%)' });
        return;
      }
      gsap.fromTo(project,
        { clipPath: 'inset(50% 0% 50% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'expo.inOut',
          scrollTrigger: {
            trigger: section,
            start: () => `${(i / numProjects) * 100}% top`,
            end: () => `${((i + 0.4) / numProjects) * 100}% top`,
            scrub: 0.5,
          }
        }
      );
    });
  }
}


/* ============================================
   3. LIQUID MORPH / BLOB REVEALS
   ============================================ */
function initLiquidMorph() {
  const blobPath = document.getElementById('blobClipPath');
  const blobShape = document.getElementById('blobShape');
  const blobTitle = document.getElementById('blobTitle');
  const blobSubtitle = document.getElementById('blobSubtitle');
  const section = document.getElementById('style-3');
  const dripCanvas = document.getElementById('blobDripCanvas');

  if (!blobPath || !blobShape) return;

  const projectNames = ['Project One', 'Project Two', 'Project Three', 'Project Four', 'Project Five', 'Project Six'];
  const projectSubs = ['01 — First Creation', '02 — Second Vision', '03 — Third Dimension', '04 — Fourth Element', '05 — Fifth Sense', '06 — Sixth Horizon'];
  const gradientIds = ['blobGrad0', 'blobGrad1', 'blobGrad2', 'blobGrad3', 'blobGrad4', 'blobGrad5'];

  // Pre-generate multiple blob shapes for morphing
  const cx = 400, cy = 400, r = 300;
  const blobShapes = [
    randomBlobPath(cx, cy, r, 8),
    randomBlobPath(cx, cy, r * 1.05, 10),
    randomBlobPath(cx, cy, r * 0.95, 9),
    randomBlobPath(cx, cy, r * 1.08, 11),
    randomBlobPath(cx, cy, r * 0.92, 8),
  ];

  // Contract shape (for transitions)
  const contractShape = randomBlobPath(cx, cy, 80, 6);

  let currentProject = 0;
  let morphIdx = 0;

  // Breathing — constant subtle shape morph
  function breathe() {
    const next = (morphIdx + 1) % blobShapes.length;
    gsap.to([blobShape, blobPath], {
      attr: { d: blobShapes[next] },
      duration: 4 + Math.random() * 2,
      ease: 'sine.inOut',
      onComplete: () => { morphIdx = next; breathe(); },
    });
  }
  breathe();

  // Idle scale pulse
  gsap.to(blobShape, {
    scale: 1.04,
    transformOrigin: '50% 50%',
    duration: 5,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
  });

  // Mouse tracking — blob follows cursor
  const svgEl = document.getElementById('blobSvg');
  document.addEventListener('mousemove', () => {
    const rx = (mouse.nX - 0.5) * 50;
    const ry = (mouse.nY - 0.5) * 40;
    gsap.to(svgEl, {
      x: rx,
      y: ry,
      duration: 1.2,
      ease: 'power2.out',
    });
  });

  // Scroll-driven project transitions
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.8,
    onUpdate: (self) => {
      const p = self.progress;
      const newIndex = Math.min(Math.floor(p * projectNames.length), projectNames.length - 1);

      if (newIndex !== currentProject) {
        const prevIndex = currentProject;
        currentProject = newIndex;

        // Morph sequence: contract → expand
        const tl = gsap.timeline();
        tl.to([blobShape, blobPath], {
          attr: { d: contractShape },
          duration: 0.3,
          ease: 'expo.in',
        });
        tl.set(blobShape, {
          fill: `url(#${gradientIds[newIndex]})`,
        }, 0.25);
        tl.to([blobShape, blobPath], {
          attr: { d: blobShapes[newIndex % blobShapes.length] },
          duration: 0.5,
          ease: 'expo.out',
        }, 0.3);

        // Text transition
        gsap.to([blobTitle, blobSubtitle], {
          opacity: 0,
          y: -15,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: () => {
            blobTitle.textContent = projectNames[newIndex];
            blobSubtitle.textContent = projectSubs[newIndex];
            gsap.fromTo([blobTitle, blobSubtitle],
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'expo.out' }
            );
          }
        });
      }
    }
  });

  // Drip particles
  initDripParticles(dripCanvas);
}

function initDripParticles(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, drips = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Drip {
    constructor() { this.reset(); }
    reset() {
      this.x = w * 0.3 + Math.random() * w * 0.4;
      this.y = h * 0.45 + (Math.random() - 0.5) * 150;
      this.size = 1 + Math.random() * 3;
      this.vy = 0.3 + Math.random() * 1.5;
      this.gravity = 0.02 + Math.random() * 0.03;
      this.opacity = 0.5 + Math.random() * 0.5;
      this.life = 80 + Math.random() * 60;
    }
    update() {
      this.y += this.vy;
      this.vy += this.gravity;
      this.life--;
      this.opacity *= 0.98;
      if (this.life <= 0 || this.y > h + 10) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(229,93,135,${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 25; i++) drips.push(new Drip());

  function animate() {
    ctx.clearRect(0, 0, w, h);
    drips.forEach(d => { d.update(); d.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
}


/* ============================================
   4. PARALLAX CINEMATIC WIPE (Kubrick Dolly)
   ============================================ */
function initParallaxWipe() {
  const projects = document.querySelectorAll('.wipe-project');
  const splitLine = document.getElementById('wipeSplitLine');
  const blackFlash = document.getElementById('wipeBlackFlash');
  const section = document.getElementById('style-4');
  const numProjects = projects.length;

  projects.forEach((project, i) => {
    const bg = project.querySelector('.wipe-bg');
    const accent = project.querySelector('.wipe-accent');
    const content = project.querySelector('.wipe-content');

    if (i < numProjects - 1) {
      ScrollTrigger.create({
        trigger: section,
        start: () => `${(i / numProjects) * 100 + 3}% top`,
        end: () => `${((i + 1) / numProjects) * 100}% top`,
        scrub: 0.6,
        onUpdate: (self) => {
          const p = self.progress;

          // Phase 1: Parallax build (0 → 0.3)
          if (p < 0.3) {
            const pp = p / 0.3;
            // Slight zoom in on current project
            gsap.set(bg, { scale: 1 + pp * 0.08, filter: `blur(0px)` });
            gsap.set(content, { y: -pp * 10, opacity: 1 });
          }

          // Phase 2: Diagonal split (0.3 → 0.7)
          if (p >= 0.3 && p < 0.7) {
            const sp = (p - 0.3) / 0.4;
            const easedSp = sp < 0.5 ? 4 * sp * sp * sp : 1 - Math.pow(-2 * sp + 2, 3) / 2;

            // Split line
            gsap.set(splitLine, {
              opacity: 1,
              x: -200 + easedSp * window.innerWidth * 3,
              rotation: -45,
              scaleX: 1 + easedSp * 0.5,
            });

            // Current project: split into two halves
            // Top-left slides up-left
            const tl_x = -easedSp * 120;
            const tl_y = -easedSp * 80;
            const tl_rot = -easedSp * 3;
            // Bottom-right slides down-right
            const br_x = easedSp * 120;
            const br_y = easedSp * 80;
            const br_rot = easedSp * 3;

            // Parallax layers at different rates
            gsap.set(bg, {
              x: lerp(0, tl_x, 0.5),
              y: lerp(0, tl_y, 0.5),
              scale: 1 + easedSp * 0.12,
              opacity: 1 - easedSp * 0.6,
              filter: `blur(${easedSp * 6}px)`,
              rotation: tl_rot * 0.3,
            });
            gsap.set(accent, {
              x: lerp(0, tl_x, 1.2),
              y: lerp(0, tl_y, 0.8),
              opacity: 1 - easedSp,
            });
            gsap.set(content, {
              x: lerp(0, tl_x, 2),
              y: lerp(0, tl_y, 1.5),
              opacity: 1 - easedSp,
              rotation: tl_rot * 0.5,
            });

            // Clip-path for the split effect
            // Top-left half clips away
            const clipSplit = 50 + easedSp * 50;
            gsap.set(project, {
              clipPath: `polygon(0 0, ${clipSplit}% 0, ${clipSplit - 20}% 100%, 0 100%)`,
            });

            // Next project settling in
            if (projects[i + 1]) {
              const nextBg = projects[i + 1].querySelector('.wipe-bg');
              const nextContent = projects[i + 1].querySelector('.wipe-content');
              const settleP = Math.max(0, (easedSp - 0.3) / 0.7);
              gsap.set(nextBg, {
                scale: 1.15 - settleP * 0.15,
                filter: `blur(${(1 - settleP) * 8}px)`,
                opacity: 1,
              });
              gsap.set(nextContent, {
                y: (1 - settleP) * 40,
                opacity: settleP,
              });
            }
          }

          // Phase 3: Black flash + clean handoff (0.7 → 1.0)
          if (p >= 0.7) {
            const ep = (p - 0.7) / 0.3;

            // Black flash
            gsap.set(blackFlash, {
              opacity: ep < 0.3 ? ep / 0.3 : ep > 0.7 ? (1 - ep) / 0.3 : 1,
            });

            // Hide split line
            gsap.set(splitLine, { opacity: 0 });

            // Current project gone
            gsap.set(project, { opacity: 0 });

            // Next project fully visible
            if (projects[i + 1]) {
              gsap.set(projects[i + 1], { opacity: 1 });
              gsap.set(projects[i + 1].querySelector('.wipe-bg'), { scale: 1, filter: 'blur(0px)' });
              gsap.set(projects[i + 1].querySelector('.wipe-content'), { y: 0, opacity: 1 });
            }
          }
        },
        onLeaveBack: () => {
          // Reset everything
          gsap.set(project, { clipPath: 'none', opacity: 1 });
          gsap.set(bg, { x: 0, y: 0, scale: 1, opacity: 1, filter: 'blur(0px)', rotation: 0 });
          gsap.set(accent, { x: 0, y: 0, opacity: 1 });
          gsap.set(content, { x: 0, y: 0, opacity: 1, rotation: 0 });
          gsap.set(splitLine, { opacity: 0 });
          gsap.set(blackFlash, { opacity: 0 });
        }
      });
    }

    // Entry scale
    gsap.from(project, {
      scale: 1.08,
      opacity: 0,
      duration: 1.5,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: section,
        start: () => `${(i / numProjects) * 100}% top`,
        once: true,
      }
    });
  });

  // Mobile: horizontal wipe
  if (window.innerWidth <= 768) {
    projects.forEach((project, i) => {
      if (i === 0) return;
      gsap.fromTo(project,
        { clipPath: 'inset(0% 100% 0% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'expo.inOut',
          scrollTrigger: {
            trigger: section,
            start: () => `${(i / numProjects) * 100}% top`,
            end: () => `${((i + 0.4) / numProjects) * 100}% top`,
            scrub: 0.5,
          }
        }
      );
    });
  }
}


/* ============================================
   5. DNA HELIX UNRAVEL
   ============================================ */
function initDNAHelix() {
  const cards = document.querySelectorAll('.helix-card');
  const container = document.getElementById('helixContainer');
  const particleCanvas = document.getElementById('helixParticles');
  const section = document.getElementById('style-5');
  const numCards = cards.length;

  let helixAngle = 0;
  let particleTrails = [];
  let currentPeelIndex = -1;
  let peelProgress = 0;

  const helixRadius = Math.min(220, window.innerWidth * 0.2);
  const helixHeight = 350;
  const baseSpeed = 0.006;

  // Particle system
  if (particleCanvas) {
    const pctx = particleCanvas.getContext('2d');
    let pw, ph;

    function resizeP() {
      pw = particleCanvas.width = window.innerWidth;
      ph = particleCanvas.height = window.innerHeight;
    }
    resizeP();
    window.addEventListener('resize', resizeP);

    function drawParticles() {
      pctx.clearRect(0, 0, pw, ph);
      particleTrails = particleTrails.filter(p => p.life > 0);
      particleTrails.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02;
        p.life--;
        p.opacity *= 0.96;
        p.size *= 0.99;
        pctx.beginPath();
        pctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        pctx.fillStyle = `rgba(229,93,135,${p.opacity})`;
        pctx.fill();
      });
      requestAnimationFrame(drawParticles);
    }
    drawParticles();

    function emitParticle(x, y) {
      particleTrails.push({
        x, y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3 - 1,
        size: 2 + Math.random() * 3,
        opacity: 0.7 + Math.random() * 0.3,
        life: 25 + Math.random() * 25,
      });
    }
    window._helixEmit = emitParticle;
  }

  // Create rung elements (connecting lines between strands)
  const rungs = [];
  for (let i = 0; i < numCards; i++) {
    const rung = document.createElement('div');
    rung.className = 'helix-rung';
    rung.style.cssText = `
      position: absolute;
      width: 2px;
      height: 2px;
      background: rgba(255,255,255,0.15);
      transform-origin: center center;
      pointer-events: none;
      will-change: transform;
      border-radius: 1px;
    `;
    container.appendChild(rung);
    rungs.push(rung);
  }

  // Main rotation loop
  function animateHelix() {
    helixAngle += baseSpeed;

    cards.forEach((card, i) => {
      const strand = card.dataset.strand;
      const angleOffset = strand === 'a' ? 0 : Math.PI;
      const ySpacing = helixHeight / (numCards - 1);
      const verticalPos = (i - numCards / 2 + 0.5) * ySpacing;
      const angle = helixAngle * 3 + angleOffset + (i * Math.PI * 2 / numCards);

      const x = Math.cos(angle) * helixRadius;
      const z = Math.sin(angle) * helixRadius;
      const depth = (z + helixRadius) / (helixRadius * 2);
      const baseScale = 0.45 + depth * 0.55;
      const baseOpacity = 0.2 + depth * 0.8;
      const rotY = -angle * (180 / Math.PI) * 0.4;

      // Peel logic
      if (i === currentPeelIndex && peelProgress > 0) {
        const pp = peelProgress;
        const easeP = pp < 0.5 ? 4 * pp * pp * pp : 1 - Math.pow(-2 * pp + 2, 3) / 2;

        const peelX = lerp(x, 0, easeP);
        const peelY = lerp(verticalPos, 0, easeP);
        const peelZ = lerp(z, 500, easeP);
        const peelScale = lerp(baseScale, 1.4, easeP);
        const peelOpacity = lerp(baseOpacity, 1, Math.min(easeP * 3, 1));
        const peelRotY = lerp(rotY, 0, easeP);

        gsap.set(card, {
          x: peelX,
          y: peelY,
          z: peelZ,
          scale: peelScale,
          opacity: peelOpacity,
          rotateY: peelRotY,
          rotateX: lerp(-12, 0, easeP),
        });

        // Emit particles during peel
        if (easeP > 0.1 && easeP < 0.8 && Math.random() < 0.4) {
          const rect = card.getBoundingClientRect();
          window._helixEmit?.(
            rect.left + rect.width / 2 + (Math.random() - 0.5) * 30,
            rect.top + rect.height / 2 + (Math.random() - 0.5) * 30
          );
        }
      } else {
        // Other cards dim during peel
        const dimFactor = (currentPeelIndex >= 0 && peelProgress > 0.2 && i !== currentPeelIndex) ? 0.4 : 1;
        gsap.set(card, {
          x,
          y: verticalPos,
          z,
          scale: baseScale * dimFactor,
          opacity: baseOpacity * dimFactor,
          rotateY: rotY,
          rotateX: -12,
        });
      }

      // Update rungs
      if (rungs[i]) {
        const rungAngle = helixAngle * 3 + (i * Math.PI * 2 / numCards);
        const rX = Math.cos(rungAngle) * helixRadius;
        const rZ = Math.sin(rungAngle) * helixRadius;
        const rungWidth = Math.abs(Math.cos(rungAngle)) * helixRadius * 2;
        const rungDepth = (rZ + helixRadius) / (helixRadius * 2);

        gsap.set(rungs[i], {
          x: -rX,
          y: verticalPos,
          z: rZ * 0.5,
          scaleX: Math.max(rungWidth, 2),
          scaleY: 1,
          opacity: 0.1 + rungDepth * 0.2,
        });
      }
    });

    requestAnimationFrame(animateHelix);
  }

  // Scroll-driven peel
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.4,
    onUpdate: (self) => {
      const p = self.progress;
      const rawIndex = Math.floor(p * numCards);
      currentPeelIndex = clamp(rawIndex, 0, numCards - 1);

      // Peel progress within each segment
      const segSize = 1 / numCards;
      const segP = (p % segSize) / segSize;
      if (segP < 0.35) {
        peelProgress = segP / 0.35;
      } else if (segP < 0.65) {
        peelProgress = 1;
      } else {
        peelProgress = 1 - (segP - 0.65) / 0.35;
      }
      peelProgress = clamp(peelProgress, 0, 1);
    }
  });

  animateHelix();

  // Mobile: vertical stack with alternating rotation
  if (window.innerWidth <= 768) {
    const helixSection = document.getElementById('style-5');
    cards.forEach((card, i) => {
      gsap.from(card, {
        rotation: i % 2 === 0 ? 5 : -5,
        y: 60,
        opacity: 0,
        duration: 0.9,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          once: true,
        }
      });
    });
  }
}


/* ============================================
   6. VOID COLLAPSE (Singularity)
   ============================================ */
function initVoidCollapse() {
  const projects = document.querySelectorAll('.void-project');
  const singularity = document.getElementById('voidSingularity');
  const flash = document.getElementById('voidFlash');
  const wrapper = document.getElementById('voidProjectWrapper');
  const starCanvas = document.getElementById('voidStarfield');
  const section = document.getElementById('style-6');
  const numProjects = projects.length;

  // Birth colors (warm → cool → warm)
  const birthColors = [
    { r: 255, g: 140, b: 107 },
    { r: 229, g: 93, b: 135 },
    { r: 95, g: 195, b: 228 },
    { r: 76, g: 161, b: 175 },
    { r: 218, g: 100, b: 255 },
    { r: 235, g: 92, b: 67 },
  ];

  // Expansion particles
  let expansionParticles = [];
  const expandCanvas = document.createElement('canvas');
  expandCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:3;';
  document.body.appendChild(expandCanvas);
  const ectx = expandCanvas.getContext('2d');
  let ew, eh;

  function resizeExpand() {
    ew = expandCanvas.width = window.innerWidth;
    eh = expandCanvas.height = window.innerHeight;
  }
  resizeExpand();
  window.addEventListener('resize', resizeExpand);

  function drawExpansionParticles() {
    ectx.clearRect(0, 0, ew, eh);
    expansionParticles = expansionParticles.filter(p => p.life > 0);
    expansionParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.99;
      p.vy *= 0.99;
      p.life--;
      p.opacity *= 0.97;
      p.size *= 0.995;
      ectx.beginPath();
      ectx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ectx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.opacity})`;
      ectx.fill();
    });
    requestAnimationFrame(drawExpansionParticles);
  }
  drawExpansionParticles();

  function emitExpansion(color) {
    const cx = ew / 2;
    const cy = eh / 2;
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8;
      expansionParticles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1 + Math.random() * 4,
        opacity: 0.8 + Math.random() * 0.2,
        life: 40 + Math.random() * 40,
        r: color.r, g: color.g, b: color.b,
      });
    }
  }

  // Starfield
  if (starCanvas) {
    const ctx = starCanvas.getContext('2d');
    let w, h, stars = [];

    function resize() {
      w = starCanvas.width = window.innerWidth;
      h = starCanvas.height = window.innerHeight;
      initStars();
    }

    function initStars() {
      stars = [];
      for (let i = 0; i < 180; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 1.5 + 0.2,
          speed: Math.random() * 0.15 + 0.02,
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.01 + Math.random() * 0.03,
        });
      }
    }

    resize();
    window.addEventListener('resize', resize);

    function drawStars() {
      ctx.clearRect(0, 0, w, h);
      stars.forEach(s => {
        s.twinkle += s.twinkleSpeed;
        const alpha = 0.2 + Math.sin(s.twinkle) * 0.25;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
        s.y += s.speed;
        if (s.y > h + 5) { s.y = -5; s.x = Math.random() * w; }
      });
      requestAnimationFrame(drawStars);
    }
    drawStars();
  }

  // Scroll-driven expansion / collapse
  const projectDuration = 1 / numProjects;
  let lastActiveIndex = -1;

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.3,
    onUpdate: (self) => {
      const p = self.progress;

      projects.forEach((project, i) => {
        const start = i * projectDuration;
        const expandEnd = start + projectDuration * 0.15;
        const holdEnd = start + projectDuration * 0.8;
        const end = start + projectDuration;

        if (p < start) {
          // Not born yet
          gsap.set(project, { scale: 0, opacity: 0, rotation: 0 });
        } else if (p >= start && p < expandEnd) {
          // Expansion
          const ep = (p - start) / (expandEnd - start);
          const eased = 1 - Math.pow(1 - ep, 3); // ease out cubic

          // Emit particles at start of expansion
          if (ep < 0.1 && i !== lastActiveIndex) {
            lastActiveIndex = i;
            emitExpansion(birthColors[i]);
          }

          gsap.set(project, {
            scale: eased,
            opacity: eased,
            rotation: (1 - eased) * 15,
          });

          // Gravitational lens during expansion
          gsap.set(wrapper, {
            scale: 1 + (1 - eased) * 0.06,
          });

          // Flash
          if (ep < 0.05) {
            gsap.set(flash, { opacity: 0.5 });
            gsap.to(flash, { opacity: 0, duration: 0.3, overwrite: 'auto' });
          }
        } else if (p >= expandEnd && p < holdEnd) {
          // Hold — fully visible with subtle breathing
          const breathe = Math.sin((p - expandEnd) * 40) * 0.01;
          gsap.set(project, { scale: 1 + breathe, opacity: 1, rotation: 0 });
          gsap.set(wrapper, { scale: 1 });
        } else if (p >= holdEnd && p < end) {
          // Collapse
          const cp = (p - holdEnd) / (end - holdEnd);
          const eased = cp * cp * cp; // accelerating (ease in cubic)

          gsap.set(project, {
            scale: 1 - eased,
            opacity: 1 - eased * eased,
            rotation: -eased * 20,
          });

          // Gravitational lens during collapse
          gsap.set(wrapper, {
            scale: 1 + eased * 0.1,
          });

          // Flash at collapse end
          if (cp > 0.85) {
            gsap.set(flash, { opacity: 0.4 * ((cp - 0.85) / 0.15) });
          }
        } else {
          // Collapsed
          gsap.set(project, { scale: 0, opacity: 0 });
        }
      });

      // Singularity pulse
      const anyTransitioning = projects.length > 0 && Array.from(projects).some(p => {
        const s = gsap.getProperty(p, 'scale');
        return s > 0.01 && s < 0.99;
      });

      if (anyTransitioning) {
        gsap.set(singularity, { opacity: 0.2 });
      } else if (p > 0.01 && p < 0.99) {
        const pulse = 0.6 + Math.sin(p * 30) * 0.2;
        gsap.set(singularity, { opacity: pulse });
      } else {
        gsap.set(singularity, { opacity: 1 });
      }
    }
  });

  // Mobile
  if (window.innerWidth <= 768) {
    projects.forEach((project, i) => {
      gsap.fromTo(project,
        { scale: 0, opacity: 0 },
        {
          scale: 1, opacity: 1,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: section,
            start: () => `${(i / numProjects) * 100 + 3}% top`,
            end: () => `${((i + 0.3) / numProjects) * 100}% top`,
            scrub: 0.3,
          }
        }
      );
    });
  }
}


/* ============================================
   INIT — Master Orchestrator
   ============================================ */
function init() {
  initHero();
  initNav();
  initSectionHeaders();

  // Desktop animations
  if (window.innerWidth > 768) {
    initKineticSculpture();
    initShatteringGlass();
    initLiquidMorph();
    initParallaxWipe();
    initDNAHelix();
    initVoidCollapse();
  } else {
    // Mobile: run simpler versions
    initKineticSculpture();
    initShatteringGlass();
    initLiquidMorph();
    initParallaxWipe();
    initDNAHelix();
    initVoidCollapse();
  }

  // Refresh ScrollTrigger after everything is set up
  ScrollTrigger.refresh();
}

// Wait for DOM + fonts
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    document.fonts.ready.then(init);
  });
} else {
  document.fonts.ready.then(init);
}