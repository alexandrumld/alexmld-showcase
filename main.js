/* ============================================
   Alexmld Gallery Animation Showcase — JS
   (Mobile-friendly with gsap.matchMedia)
   ============================================ */

gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();

// ---- Cursor tracking for circular wipe (desktop) ----
let mouseX = 0.5, mouseY = 0.5;
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX / window.innerWidth;
  mouseY = e.clientY / window.innerHeight;
});
// Touch fallback for circular wipe on mobile
document.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0) {
    mouseX = e.touches[0].clientX / window.innerWidth;
    mouseY = e.touches[0].clientY / window.innerHeight;
  }
}, { passive: true });

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
mm.add('(min-width: 769px)', () => {
  // --- Desktop: full 3D peel ---
  const container = document.getElementById('stackedCards');
  const cards = gsap.utils.toArray('.project-card', container);

  cards.forEach((card, i) => {
    gsap.set(card, { zIndex: cards.length - i });
  });

  const triggers = [];

  cards.forEach((card, i) => {
    if (i === cards.length - 1) return;

    const isEven = i % 2 === 0;

    const st = ScrollTrigger.create({
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
    triggers.push(st);
  });

  return () => {
    triggers.forEach(t => t.kill());
    cards.forEach(card => {
      gsap.set(card, { clearProps: 'all' });
    });
  };
});

mm.add('(max-width: 768px)', () => {
  // --- Mobile: simple vertical scroll, fade-in stagger, no 3D ---
  const container = document.getElementById('stackedCards');
  const cards = gsap.utils.toArray('.project-card', container);

  // Stack cards vertically with overlap
  cards.forEach((card, i) => {
    gsap.set(card, {
      position: 'relative',
      zIndex: cards.length - i,
      opacity: 0,
      y: 40,
    });
  });

  const anims = cards.map((card, i) => {
    return gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  return () => {
    anims.forEach(a => a.scrollTrigger && a.scrollTrigger.kill());
    cards.forEach(card => {
      gsap.set(card, { clearProps: 'all' });
    });
  };
});

/* ==============================
   2. Circular Wipe Reveal
   ============================== */
mm.add('(min-width: 769px)', () => {
  // --- Desktop: clip-path circle following cursor ---
  const container = document.getElementById('circularWipe');
  const projects = gsap.utils.toArray('.wipe-project', container);
  const progressFill = document.getElementById('wipeProgressFill');

  const triggers = [];

  projects.forEach((project, i) => {
    if (i === 0) return;

    const st = ScrollTrigger.create({
      trigger: container,
      start: `${(i - 1) / (projects.length - 1) * 100}% center`,
      end: `${i / (projects.length - 1) * 100}% center`,
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const w = container.offsetWidth;
        const h = container.offsetHeight;
        const maxRadius = Math.sqrt(w * w + h * h);
        const radius = maxRadius * progress;

        const cx = mouseX * 100;
        const cy = mouseY * 100;

        project.style.clipPath = `circle(${radius}px at ${cx}% ${cy}%)`;

        if (i === projects.length - 1) {
          progressFill.style.width = `${progress * 100}%`;
        }
      },
    });
    triggers.push(st);
  });

  // Overall progress
  const overallSt = ScrollTrigger.create({
    trigger: container,
    start: 'top center',
    end: 'bottom center',
    scrub: true,
    onUpdate: (self) => {
      progressFill.style.width = `${self.progress * 100}%`;
    },
  });
  triggers.push(overallSt);

  return () => {
    triggers.forEach(t => t.kill());
    projects.forEach(p => {
      p.style.clipPath = '';
    });
  };
});

mm.add('(max-width: 768px)', () => {
  // --- Mobile: simple fade/slide-in, no clip-path ---
  const container = document.getElementById('circularWipe');
  const projects = gsap.utils.toArray('.wipe-project', container);
  const progressFill = document.getElementById('wipeProgressFill');

  // Ensure no clip-path from desktop leaks
  projects.forEach(p => {
    p.style.clipPath = 'none';
  });

  const anims = projects.map((project, i) => {
    // Set initial state
    gsap.set(project, {
      opacity: i === 0 ? 1 : 0,
      y: i === 0 ? 0 : 60,
    });

    if (i === 0) return null;

    return gsap.to(project, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: container,
        start: `${(i / projects.length) * 80 + 10}% center`,
        toggleActions: 'play none none reverse',
      },
    });
  }).filter(Boolean);

  // Simple progress
  const progressSt = ScrollTrigger.create({
    trigger: container,
    start: 'top center',
    end: 'bottom center',
    scrub: true,
    onUpdate: (self) => {
      progressFill.style.width = `${self.progress * 100}%`;
    },
  });

  return () => {
    anims.forEach(a => a.scrollTrigger && a.scrollTrigger.kill());
    progressSt.kill();
    projects.forEach(p => {
      gsap.set(p, { clearProps: 'all' });
      p.style.clipPath = '';
    });
  };
});

/* ==============================
   3. Disorder → Order
   ============================== */
mm.add('(min-width: 769px)', () => {
  // --- Desktop: scatter → grid ---
  const container = document.getElementById('disorderGrid');
  const cards = gsap.utils.toArray('.disorder-card', container);

  const cols = 3;
  const rows = 2;
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

  applyState(0);

  const st = ScrollTrigger.create({
    trigger: container,
    start: 'top 80%',
    end: 'top 20%',
    scrub: true,
    onUpdate: (self) => {
      applyState(self.progress);
    },
  });

  return () => {
    st.kill();
    cards.forEach(card => {
      card.style.width = '';
      card.style.height = '';
      card.style.transform = '';
    });
  };
});

mm.add('(max-width: 768px)', () => {
  // --- Mobile: cards already in grid, simple fade-in stagger ---
  const container = document.getElementById('disorderGrid');
  const cards = gsap.utils.toArray('.disorder-card', container);

  // On mobile, cards are positioned by CSS grid, not JS
  // Reset any absolute positioning artifacts
  cards.forEach(card => {
    card.style.width = '';
    card.style.height = '';
    card.style.transform = '';
  });

  // Fade-in stagger
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: container,
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
  });

  gsap.set(cards, { opacity: 0, y: 30, scale: 0.95 });

  tl.to(cards, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.5,
    stagger: 0.1,
    ease: 'power2.out',
  });

  return () => {
    tl.scrollTrigger && tl.scrollTrigger.kill();
    cards.forEach(card => {
      gsap.set(card, { clearProps: 'all' });
    });
  };
});

/* ==============================
   4. Perspective Tunnel / Z-Axis Zoom
   ============================== */
mm.add('(min-width: 769px)', () => {
  // --- Desktop: 3D tunnel with translateZ ---
  const viewport = document.getElementById('tunnelViewport');
  const cards = gsap.utils.toArray('.tunnel-card', viewport);
  const totalCards = cards.length;
  const zSpacing = 600;

  cards.forEach((card, i) => {
    gsap.set(card, {
      z: (totalCards - 1 - i) * zSpacing,
      scale: 0.5 + i * 0.08,
      opacity: 0.3 + i * 0.1,
    });
  });

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

  return () => {
    tunnelTimeline.scrollTrigger && tunnelTimeline.scrollTrigger.kill();
    tunnelTimeline.kill();
    cards.forEach(card => {
      gsap.set(card, { clearProps: 'all' });
    });
  };
});

mm.add('(max-width: 768px)', () => {
  // --- Mobile: simple vertical scroll with scale-in, no 3D ---
  const viewport = document.getElementById('tunnelViewport');
  const cards = gsap.utils.toArray('.tunnel-card', viewport);

  // Reset any 3D transforms
  cards.forEach((card, i) => {
    gsap.set(card, {
      opacity: 0,
      scale: 0.85,
      y: 50,
      z: '',
    });
  });

  const anims = cards.map((card) => {
    return gsap.to(card, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  return () => {
    anims.forEach(a => a.scrollTrigger && a.scrollTrigger.kill());
    cards.forEach(card => {
      gsap.set(card, { clearProps: 'all' });
    });
  };
});

/* ==============================
   5. Typography Morph
   (Works on both — just needs font adjustments via CSS)
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
  const st = ScrollTrigger.create({
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

      const bgColor = bgColors[Math.min(currentIndex, bgColors.length - 1)];
      container.style.backgroundColor = bgColor;

      projects.forEach((project, i) => {
        const chars = project.querySelectorAll('.char');

        if (i < currentIndex) {
          project.style.opacity = '0';
          project.style.pointerEvents = 'none';
          chars.forEach(c => {
            c.style.opacity = '0';
            c.style.transform = 'translateY(60px) rotateX(-40deg)';
          });
        } else if (i === currentIndex) {
          project.style.opacity = i === currentIndex && currentIndex === 0 && transitionProgress < 0.01
            ? '1' : String(Math.max(0, 1 - transitionProgress));
          project.style.pointerEvents = 'auto';

          if (transitionProgress > 0 && i < projects.length - 1) {
            chars.forEach((c, ci) => {
              const delay = ci / chars.length;
              const p = Math.max(0, (transitionProgress - delay * 0.5) / (1 - delay * 0.5));
              c.style.opacity = String(1 - p);
              c.style.transform = `translateY(${60 * p}px) rotateX(${-40 * p}deg)`;
            });
          } else {
            project.style.opacity = '1';
            chars.forEach(c => {
              c.style.opacity = '1';
              c.style.transform = 'translateY(0) rotateX(0deg)';
            });
          }
        } else if (i === currentIndex + 1) {
          project.style.opacity = String(Math.min(1, transitionProgress));
          project.style.pointerEvents = transitionProgress > 0.5 ? 'auto' : 'none';

          chars.forEach((c, ci) => {
            const delay = ci / chars.length;
            const p = Math.max(0, (transitionProgress - delay * 0.5) / (1 - delay * 0.5));
            c.style.opacity = String(p);
            c.style.transform = `translateY(${60 * (1 - p)}px) rotateX(${40 * (1 - p)}deg)`;
          });
        } else {
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
mm.add('(min-width: 769px)', () => {
  // --- Desktop: full repulsion physics ---
  const grid = document.getElementById('magneticGrid');
  const cards = gsap.utils.toArray('.magnetic-card', grid);

  const enterHandler = (e) => {
    const card = e.currentTarget;
    const hoveredRect = card.getBoundingClientRect();
    const hoveredCenterX = hoveredRect.left + hoveredRect.width / 2;
    const hoveredCenterY = hoveredRect.top + hoveredRect.height / 2;

    cards.forEach((other, otherIndex) => {
      const idx = cards.indexOf(card);
      if (otherIndex === idx) return;

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
  };

  const leaveHandler = () => {
    cards.forEach((other) => {
      gsap.to(other, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.4)',
      });
    });
  };

  cards.forEach(card => {
    card.addEventListener('mouseenter', enterHandler);
    card.addEventListener('mouseleave', leaveHandler);
  });

  return () => {
    cards.forEach(card => {
      card.removeEventListener('mouseenter', enterHandler);
      card.removeEventListener('mouseleave', leaveHandler);
      gsap.set(card, { clearProps: 'all' });
    });
  };
});

mm.add('(max-width: 768px)', () => {
  // --- Mobile: simple grid, hover-scale only (no repulsion math) ---
  const grid = document.getElementById('magneticGrid');
  const cards = gsap.utils.toArray('.magnetic-card', grid);

  // Reset any transforms from desktop
  cards.forEach(card => {
    gsap.set(card, { x: 0, y: 0, clearProps: 'x,y' });
  });

  // Simple tap/hover scale on mobile
  const enterHandler = (e) => {
    gsap.to(e.currentTarget, { scale: 1.04, duration: 0.3, ease: 'power2.out' });
  };
  const leaveHandler = (e) => {
    gsap.to(e.currentTarget, { scale: 1, duration: 0.3, ease: 'power2.out' });
  };

  cards.forEach(card => {
    card.addEventListener('touchstart', enterHandler, { passive: true });
    card.addEventListener('touchend', leaveHandler, { passive: true });
  });

  return () => {
    cards.forEach(card => {
      card.removeEventListener('touchstart', enterHandler);
      card.removeEventListener('touchend', leaveHandler);
      gsap.set(card, { clearProps: 'all' });
    });
  };
});

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