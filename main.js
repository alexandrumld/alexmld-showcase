/* ============================================
   Alexmld Gallery Animation Showcase — JS
   ============================================ */

gsap.registerPlugin(ScrollTrigger);

// ---- Cursor tracking for circular wipe ----
let mouseX = 0.5, mouseY = 0.5;
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX / window.innerWidth;
  mouseY = e.clientY / window.innerHeight;
});

// ---- Floating Nav Active State ----
const sections = document.querySelectorAll('.style-section');
const navLinks = document.querySelectorAll('.nav-link');

sections.forEach((section, i) => {
  ScrollTrigger.create({
    trigger: section,
    start: 'top center',
    end: 'bottom center',
    onEnter: () => setActiveNav(i),
    onEnterBack: () => setActiveNav(i),
  });
});

function setActiveNav(index) {
  navLinks.forEach((link, i) => {
    link.classList.toggle('active', i === index);
  });
}

// ---- Hero Animation ----
gsap.from('.hero-title', {
  y: 80,
  opacity: 0,
  duration: 1.2,
  ease: 'power3.out',
});
gsap.from('.hero-sub', {
  y: 40,
  opacity: 0,
  duration: 1,
  delay: 0.3,
  ease: 'power3.out',
});

/* ==============================
   1. Stacked Cards (3D Peel)
   ============================== */
(function initStackedCards() {
  const container = document.getElementById('stackedCards');
  const cards = gsap.utils.toArray('.project-card', container);

  // Position cards: stack them
  cards.forEach((card, i) => {
    gsap.set(card, {
      zIndex: cards.length - i,
    });
  });

  cards.forEach((card, i) => {
    if (i === cards.length - 1) return; // last card stays

    const isEven = i % 2 === 0;

    ScrollTrigger.create({
      trigger: container,
      start: `${(i / cards.length) * 100}% top`,
      end: `${((i + 1) / cards.length) * 100}% top`,
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const rotateX = isEven ? -25 * progress : 25 * progress;
        const rotateY = isEven ? 15 * progress : -15 * progress;
        const translateY = -200 * progress;
        const translateX = isEven ? 150 * progress : -150 * progress;
        const scale = 1 - 0.4 * progress;
        const opacity = 1 - progress;

        gsap.set(card, {
          transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${translateY}px) translateX(${translateX}px) scale(${scale})`,
          opacity: opacity,
          pointerEvents: progress > 0.5 ? 'none' : 'auto',
        });
      },
    });
  });
})();

/* ==============================
   2. Circular Wipe Reveal
   ============================== */
(function initCircularWipe() {
  const container = document.getElementById('circularWipe');
  const projects = gsap.utils.toArray('.wipe-project', container);
  const progressFill = document.getElementById('wipeProgressFill');

  projects.forEach((project, i) => {
    if (i === 0) return; // first is the base

    const prevProject = projects[i - 1];

    ScrollTrigger.create({
      trigger: container,
      start: `${(i - 1) / (projects.length - 1) * 100}% center`,
      end: `${i / (projects.length - 1) * 100}% center`,
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        // Calculate diagonal radius to cover full viewport
        const w = container.offsetWidth;
        const h = container.offsetHeight;
        const maxRadius = Math.sqrt(w * w + h * h);
        const radius = maxRadius * progress;

        // Use mouse position offset from center
        const cx = mouseX * 100;
        const cy = mouseY * 100;

        project.style.clipPath = `circle(${radius}px at ${cx}% ${cy}%)`;

        // Update progress bar
        if (i === projects.length - 1) {
          progressFill.style.width = `${progress * 100}%`;
        }
      },
    });
  });

  // Overall progress
  ScrollTrigger.create({
    trigger: container,
    start: 'top center',
    end: 'bottom center',
    scrub: true,
    onUpdate: (self) => {
      progressFill.style.width = `${self.progress * 100}%`;
    },
  });
})();

/* ==============================
   3. Disorder → Order
   ============================== */
(function initDisorder() {
  const container = document.getElementById('disorderGrid');
  const cards = gsap.utils.toArray('.disorder-card', container);
  const containerRect = () => container.getBoundingClientRect();
  const isMobile = window.innerWidth < 768;

  // Calculate grid positions
  const cols = isMobile ? 2 : 3;
  const rows = isMobile ? 3 : 2;
  const gap = 16;

  function getGridPositions() {
    const cW = container.offsetWidth;
    const cH = container.offsetHeight;
    const cardW = (cW - gap * (cols - 1)) / cols;
    const cardH = (cH - gap * (rows - 1)) / rows;
    const positions = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        positions.push({
          x: c * (cardW + gap),
          y: r * (cardH + gap),
          w: cardW,
          h: cardH,
        });
      }
    }
    return positions;
  }

  // Random disorder positions
  const disorderData = cards.map(() => ({
    x: (Math.random() - 0.5) * 200,
    y: (Math.random() - 0.5) * 150,
    rotation: (Math.random() - 0.5) * 40,
  }));

  function applyState(progress) {
    const grid = getGridPositions();
    cards.forEach((card, i) => {
      const gp = grid[i];
      if (!gp) return;

      const d = disorderData[i];
      const x = d.x + (gp.x - d.x) * progress;
      const y = d.y + (gp.y - d.y) * progress;
      const r = d.rotation * (1 - progress);

      card.style.width = gp.w + 'px';
      card.style.height = gp.h + 'px';
      card.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`;
    });
  }

  // Set initial disorder
  applyState(0);

  ScrollTrigger.create({
    trigger: container,
    start: 'top 80%',
    end: 'top 20%',
    scrub: true,
    onUpdate: (self) => {
      applyState(self.progress);
    },
  });
})();

/* ==============================
   4. Perspective Tunnel / Z-Axis Zoom
   ============================== */
(function initTunnel() {
  const viewport = document.getElementById('tunnelViewport');
  const cards = gsap.utils.toArray('.tunnel-card', viewport);
  const totalCards = cards.length;

  // Set initial z positions — each card is behind the next
  const zSpacing = 600;

  cards.forEach((card, i) => {
    gsap.set(card, {
      z: (totalCards - 1 - i) * zSpacing,
      scale: 0.5 + i * 0.08,
      opacity: 0.3 + i * 0.1,
    });
  });

  // Animate the tunnel group scroll
  const tunnelTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: viewport,
      start: 'top 10%',
      end: `+=${totalCards * 600}`,
      scrub: true,
      pin: true,
    },
  });

  cards.forEach((card, i) => {
    if (i === 0) return;

    const prevCard = cards[i - 1];

    tunnelTimeline
      .to(prevCard, {
        z: -zSpacing * 2,
        scale: 1.5,
        opacity: 0,
        duration: 1,
        ease: 'power1.in',
      }, i > 1 ? '<+=0.5' : 0)
      .to(card, {
        z: 0,
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: 'power2.out',
      }, '<');
  });
})();

/* ==============================
   5. Typography Morph
   ============================== */
(function initTypoMorph() {
  const container = document.getElementById('typoMorph');
  const projects = gsap.utils.toArray('.typo-project', container);
  const bgColors = projects.map(p => p.dataset.color);

  // Split each title into characters
  projects.forEach((project) => {
    const titleEl = project.querySelector('.typo-title');
    const text = titleEl.dataset.text;
    titleEl.innerHTML = '';
    text.split('').forEach((char) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      titleEl.appendChild(span);
    });
  });

  // Pin the container and animate through each project
  ScrollTrigger.create({
    trigger: container,
    start: 'top top',
    end: `+=${projects.length * 500}`,
    pin: true,
    scrub: true,
    onUpdate: (self) => {
      const progress = self.progress;
      const totalTransitions = projects.length - 1;
      const rawIndex = progress * totalTransitions;
      const currentIndex = Math.floor(rawIndex);
      const transitionProgress = rawIndex - currentIndex;

      // Background color
      const bgColor = bgColors[Math.min(currentIndex, bgColors.length - 1)];
      container.style.backgroundColor = bgColor;

      projects.forEach((project, i) => {
        const chars = project.querySelectorAll('.char');

        if (i < currentIndex) {
          // Fully out
          project.style.opacity = '0';
          project.style.pointerEvents = 'none';
          chars.forEach(c => {
            c.style.opacity = '0';
            c.style.transform = 'translateY(60px) rotateX(-40deg)';
          });
        } else if (i === currentIndex) {
          // Current — fading out or static
          project.style.opacity = i === currentIndex && currentIndex === 0 && transitionProgress < 0.01
            ? '1' : String(Math.max(0, 1 - transitionProgress));
          project.style.pointerEvents = 'auto';

          if (transitionProgress > 0 && i < projects.length - 1) {
            // Exiting — chars stagger out
            chars.forEach((c, ci) => {
              const delay = ci / chars.length;
              const p = Math.max(0, (transitionProgress - delay * 0.5) / (1 - delay * 0.5));
              c.style.opacity = String(1 - p);
              c.style.transform = `translateY(${60 * p}px) rotateX(${-40 * p}deg)`;
            });
          } else {
            // Fully visible
            project.style.opacity = '1';
            chars.forEach(c => {
              c.style.opacity = '1';
              c.style.transform = 'translateY(0) rotateX(0deg)';
            });
          }
        } else if (i === currentIndex + 1) {
          // Entering — chars stagger in
          project.style.opacity = String(Math.min(1, transitionProgress));
          project.style.pointerEvents = transitionProgress > 0.5 ? 'auto' : 'none';

          chars.forEach((c, ci) => {
            const delay = ci / chars.length;
            const p = Math.max(0, (transitionProgress - delay * 0.5) / (1 - delay * 0.5));
            c.style.opacity = String(p);
            c.style.transform = `translateY(${60 * (1 - p)}px) rotateX(${40 * (1 - p)}deg)`;
          });
        } else {
          // Not yet visible
          project.style.opacity = '0';
          project.style.pointerEvents = 'none';
          chars.forEach(c => {
            c.style.opacity = '0';
            c.style.transform = 'translateY(60px) rotateX(40deg)';
          });
        }
      });
    },
  });
})();

/* ==============================
   6. Magnetic Repulsion Grid
   ============================== */
(function initMagnetic() {
  const grid = document.getElementById('magneticGrid');
  const cards = gsap.utils.toArray('.magnetic-card', grid);

  cards.forEach((card, index) => {
    card.addEventListener('mouseenter', () => {
      const hoveredRect = card.getBoundingClientRect();
      const hoveredCenterX = hoveredRect.left + hoveredRect.width / 2;
      const hoveredCenterY = hoveredRect.top + hoveredRect.height / 2;

      cards.forEach((other, otherIndex) => {
        if (otherIndex === index) return;

        const otherRect = other.getBoundingClientRect();
        const otherCenterX = otherRect.left + otherRect.width / 2;
        const otherCenterY = otherRect.top + otherRect.height / 2;

        const dx = otherCenterX - hoveredCenterX;
        const dy = otherCenterY - hoveredCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 600;
        const force = Math.max(0, 1 - distance / maxDist);

        const moveX = (dx / distance) * force * 50;
        const moveY = (dy / distance) * force * 50;

        gsap.to(other, {
          x: moveX,
          y: moveY,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)',
        });
      });
    });

    card.addEventListener('mouseleave', () => {
      cards.forEach((other) => {
        gsap.to(other, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.4)',
        });
      });
    });
  });
})();

/* ==============================
   Section Header Animations
   ============================== */
sections.forEach((section) => {
  const header = section.querySelector('.section-header');
  if (!header) return;

  gsap.from(header.querySelectorAll('.section-num, .section-title, .section-desc'), {
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: header,
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
  });
});

/* ==============================
   Refresh on resize
   ============================== */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    ScrollTrigger.refresh();
  }, 250);
});