/* ============================================================
   ANTI-GRAVITY PORTFOLIO — Script
   Anti-gravity particle engine + Dino Run game + UI interactions
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. ANTI-GRAVITY CANVAS ENGINE
     ---------------------------------------------------------- */

  const canvas = document.getElementById('antigravity-canvas');
  const ctx = canvas.getContext('2d');

  // Mouse tracking
  const mouse = { x: -9999, y: -9999 };

  // Configuration
  const CONFIG = {
    particleCount: window.innerWidth < 768 ? 42 : 75,
    repulsionRadius: 150,
    repulsionForce: 0.8,
    connectionDistance: 130,
    connectionOpacity: 0.12,
    drift: 0.15,
    friction: 0.985,
    glyphChance: 0.35,
    accentColor: { r: 0, g: 255, b: 200 },
  };

  const GLYPHS = ['</>', '{ }', '#', '$', 'λ', '>>', '//', '&&', '::', 'fn', '0x', '~$'];

  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle() {
    const isGlyph = Math.random() < CONFIG.glyphChance;
    const opacity = 0.15 + Math.random() * 0.45;
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * CONFIG.drift,
      vy: (Math.random() - 0.5) * CONFIG.drift,
      radius: isGlyph ? 0 : 1.2 + Math.random() * 2,
      opacity: opacity,
      baseOpacity: opacity,
      isGlyph: isGlyph,
      glyph: isGlyph ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : null,
      glyphSize: 10 + Math.random() * 5,
    };
  }

  function initParticles() {
    particles = [];
    for (var i = 0; i < CONFIG.particleCount; i++) {
      particles.push(createParticle());
    }
  }

  function updateParticle(p) {
    var dx = p.x - mouse.x;
    var dy = p.y - mouse.y;
    var distSq = dx * dx + dy * dy;
    var repRadSq = CONFIG.repulsionRadius * CONFIG.repulsionRadius;

    if (distSq < repRadSq && distSq > 1) {
      var dist = Math.sqrt(distSq);
      var force = (CONFIG.repulsionRadius - dist) / CONFIG.repulsionRadius * CONFIG.repulsionForce;
      var nx = dx / dist;
      var ny = dy / dist;
      p.vx += nx * force;
      p.vy += ny * force;
    }

    p.vx *= CONFIG.friction;
    p.vy *= CONFIG.friction;
    p.vx += (Math.random() - 0.5) * 0.02;
    p.vy += (Math.random() - 0.5) * 0.02;
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -20) p.x = canvas.width + 20;
    if (p.x > canvas.width + 20) p.x = -20;
    if (p.y < -20) p.y = canvas.height + 20;
    if (p.y > canvas.height + 20) p.y = -20;
  }

  function drawParticle(p) {
    var r = CONFIG.accentColor.r, g = CONFIG.accentColor.g, b = CONFIG.accentColor.b;
    if (p.isGlyph) {
      ctx.save();
      ctx.font = p.glyphSize + "px 'JetBrains Mono', monospace";
      ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (p.opacity * 0.6) + ')';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.glyph, p.x, p.y);
      ctx.restore();
    } else {
      var gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
      gradient.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',' + p.opacity + ')');
      gradient.addColorStop(0.5, 'rgba(' + r + ',' + g + ',' + b + ',' + (p.opacity * 0.3) + ')');
      gradient.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (p.opacity * 0.9) + ')';
      ctx.fill();
    }
  }

  function drawConnections() {
    var r = CONFIG.accentColor.r, g = CONFIG.accentColor.g, b = CONFIG.accentColor.b;
    var maxDist = CONFIG.connectionDistance;
    var maxDistSq = maxDist * maxDist;
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var distSq = dx * dx + dy * dy;
        if (distSq < maxDistSq) {
          var dist = Math.sqrt(distSq);
          var opacity = (1 - dist / maxDist) * CONFIG.connectionOpacity;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particles.length; i++) updateParticle(particles[i]);
    drawConnections();
    for (var i = 0; i < particles.length; i++) drawParticle(particles[i]);
    requestAnimationFrame(animateParticles);
  }

  // Mouse events on DOCUMENT (not canvas) — works over all content
  document.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  document.addEventListener('mouseleave', function () {
    mouse.x = -9999;
    mouse.y = -9999;
  });
  document.addEventListener('touchmove', function (e) {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  }, { passive: true });
  document.addEventListener('touchend', function () {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener('resize', function () {
    resize();
    var newCount = window.innerWidth < 768 ? 42 : 75;
    if (Math.abs(newCount - particles.length) > 10) {
      CONFIG.particleCount = newCount;
      initParticles();
    }
  });

  resize();
  initParticles();
  animateParticles();


  /* ----------------------------------------------------------
     2. CAT RUN MINI-GAME (Relaxed Pace)
     ---------------------------------------------------------- */

  var catCanvas = document.getElementById('cat-game');
  var catCtx = catCanvas.getContext('2d');
  var catWrap = document.getElementById('catWrap');
  var catHint = document.getElementById('catHint');

  // --- Scale-aware sizing ---
  var BASE_W = 500;
  var BASE_H = 120;

  function getCatScale() {
    var parentW = catWrap.clientWidth;
    var canvasW = Math.min(parentW, BASE_W);
    return canvasW / BASE_W;
  }

  function resizeCatCanvas() {
    var scale = getCatScale();
    catCanvas.width = Math.floor(BASE_W * scale);
    catCanvas.height = Math.floor(BASE_H * scale);
  }

  // --- Load high score from localStorage ---
  var storedHigh = 0;
  try { storedHigh = parseInt(localStorage.getItem('catRunHighScore'), 10) || 0; } catch (e) {}

  // --- Game state ---
  var CAT = {
    running: false,
    gameOver: false,
    started: false,
    score: 0,
    highScore: storedHigh,
    speed: 2,        // slower base speed (was 3)
    frame: 0,
  };

  // Cat character (base coords)
  var cat = { x: 40, y: 0, w: 22, h: 18, vy: 0, grounded: true };
  var GRAVITY = 0.38;      // slower gravity (was 0.55)
  var JUMP_VEL = -7.5;     // gentler jump (was -9)
  var GROUND_Y = BASE_H - 20;

  // Obstacles — bigger gaps for relaxed pace
  var obstacles = [];
  var OBS_MIN_GAP = 140;   // (was 90)
  var OBS_MAX_GAP = 240;   // (was 160)
  var nextObsIn = 80;

  function resetCat() {
    cat.y = GROUND_Y - cat.h;
    cat.vy = 0;
    cat.grounded = true;
    obstacles = [];
    nextObsIn = 80;
    CAT.score = 0;
    CAT.speed = 2;
    CAT.frame = 0;
    CAT.gameOver = false;
  }

  function spawnObstacle() {
    var type = Math.random() < 0.5 ? 'yarn' : 'server';
    var h, w;
    if (type === 'yarn') {
      var r = 5 + Math.random() * 4;
      w = r * 2; h = r * 2;
    } else {
      h = 18 + Math.random() * 8;
      w = 10 + Math.random() * 4;
    }
    obstacles.push({
      x: BASE_W + 10,
      y: GROUND_Y - h,
      w: w,
      h: h,
      type: type,
    });
    nextObsIn = OBS_MIN_GAP + Math.random() * (OBS_MAX_GAP - OBS_MIN_GAP);
  }

  function catJump() {
    if (cat.grounded) {
      cat.vy = JUMP_VEL;
      cat.grounded = false;
    }
  }

  function updateCatGame() {
    if (!CAT.running || CAT.gameOver) return;

    CAT.frame++;
    CAT.score = Math.floor(CAT.frame / 8); // slower scoring (was /6)

    // Gentler speed ramp
    CAT.speed = 2 + CAT.score * 0.005;  // (was 3 + score*0.008)

    // Gravity
    cat.vy += GRAVITY;
    cat.y += cat.vy;
    if (cat.y >= GROUND_Y - cat.h) {
      cat.y = GROUND_Y - cat.h;
      cat.vy = 0;
      cat.grounded = true;
    }

    // Obstacles
    nextObsIn -= CAT.speed;
    if (nextObsIn <= 0) spawnObstacle();

    for (var i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].x -= CAT.speed;
      if (obstacles[i].x + obstacles[i].w < 0) {
        obstacles.splice(i, 1);
        continue;
      }
      // Collision (AABB with margin)
      var o = obstacles[i];
      var margin = 3;
      if (
        cat.x + margin < o.x + o.w &&
        cat.x + cat.w - margin > o.x &&
        cat.y + margin < o.y + o.h &&
        cat.y + cat.h - margin > o.y
      ) {
        CAT.gameOver = true;
        CAT.running = false;
        if (CAT.score > CAT.highScore) {
          CAT.highScore = CAT.score;
          try { localStorage.setItem('catRunHighScore', CAT.highScore); } catch (e) {}
        }
      }
    }
  }

  function drawCatGame() {
    var s = getCatScale();
    catCtx.clearRect(0, 0, catCanvas.width, catCanvas.height);
    catCtx.save();
    catCtx.scale(s, s);

    var col = '#00ffc8';
    catCtx.strokeStyle = col;
    catCtx.fillStyle = col;
    catCtx.lineWidth = 1.5;

    // Ground line
    catCtx.beginPath();
    catCtx.moveTo(0, GROUND_Y);
    catCtx.lineTo(BASE_W, GROUND_Y);
    catCtx.globalAlpha = 0.3;
    catCtx.stroke();
    catCtx.globalAlpha = 1;

    if (!CAT.started) {
      drawCatChar(cat.x, GROUND_Y - cat.h, cat.w, cat.h, col, false);
      catCtx.restore();
      return;
    }

    // Draw cat
    drawCatChar(cat.x, cat.y, cat.w, cat.h, col, !cat.grounded);

    // Draw obstacles
    for (var i = 0; i < obstacles.length; i++) {
      var o = obstacles[i];
      if (o.type === 'yarn') {
        drawYarnBall(o.x, o.y, o.w, o.h, col);
      } else {
        drawServer(o.x, o.y, o.w, o.h, col);
      }
    }

    // Score (top-right of canvas)
    catCtx.font = "bold 10px 'JetBrains Mono', monospace";
    catCtx.fillStyle = col;
    catCtx.textAlign = 'right';
    catCtx.globalAlpha = 0.7;
    catCtx.fillText('Score: ' + CAT.score, BASE_W - 8, 16);
    catCtx.globalAlpha = 0.4;
    catCtx.fillText('High: ' + CAT.highScore, BASE_W - 8, 28);
    catCtx.globalAlpha = 1;

    // Game over overlay
    if (CAT.gameOver) {
      catCtx.fillStyle = col;
      catCtx.globalAlpha = 0.8;
      catCtx.font = "bold 14px 'JetBrains Mono', monospace";
      catCtx.textAlign = 'center';
      catCtx.fillText('GAME OVER', BASE_W / 2, BASE_H / 2 - 6);
      catCtx.font = "10px 'JetBrains Mono', monospace";
      catCtx.globalAlpha = 0.5;
      catCtx.fillText('Press Space or tap to restart', BASE_W / 2, BASE_H / 2 + 10);
      catCtx.globalAlpha = 1;
    }

    catCtx.restore();
  }

  // --- Draw cat character (stroke art with ears, tail, whiskers) ---
  function drawCatChar(x, y, w, h, col, jumping) {
    catCtx.strokeStyle = col;
    catCtx.fillStyle = col;
    catCtx.lineWidth = 1.5;

    // Body (rounded rectangle approximation)
    catCtx.beginPath();
    catCtx.rect(x + 2, y + 5, w - 4, h - 5);
    catCtx.stroke();

    // Head
    catCtx.beginPath();
    catCtx.rect(x + w - 10, y + 1, 11, 9);
    catCtx.stroke();

    // Ears (two triangles on top of head)
    catCtx.beginPath();
    catCtx.moveTo(x + w - 9, y + 1);
    catCtx.lineTo(x + w - 7, y - 5);
    catCtx.lineTo(x + w - 4, y + 1);
    catCtx.stroke();
    catCtx.beginPath();
    catCtx.moveTo(x + w - 2, y + 1);
    catCtx.lineTo(x + w, y - 5);
    catCtx.lineTo(x + w + 2, y + 1);
    catCtx.stroke();

    // Eyes
    catCtx.fillRect(x + w - 5, y + 4, 2, 2);
    catCtx.fillRect(x + w + 0, y + 4, 2, 2);

    // Whiskers
    catCtx.globalAlpha = 0.5;
    catCtx.beginPath();
    catCtx.moveTo(x + w + 1, y + 7);
    catCtx.lineTo(x + w + 7, y + 5);
    catCtx.moveTo(x + w + 1, y + 8);
    catCtx.lineTo(x + w + 7, y + 9);
    catCtx.stroke();
    catCtx.globalAlpha = 1;

    // Tail (curved behind body)
    catCtx.beginPath();
    catCtx.moveTo(x + 2, y + 7);
    catCtx.quadraticCurveTo(x - 6, y - 2, x - 3, y - 6);
    catCtx.stroke();

    // Legs (animated when running)
    if (!jumping) {
      var legFrame = (CAT.frame % 16 < 8) ? 0 : 3;
      catCtx.beginPath();
      // Front legs
      catCtx.moveTo(x + w - 6, y + h - 2);
      catCtx.lineTo(x + w - 6, y + h + legFrame);
      catCtx.moveTo(x + w - 10, y + h - 2);
      catCtx.lineTo(x + w - 10, y + h - legFrame);
      // Back legs
      catCtx.moveTo(x + 5, y + h - 2);
      catCtx.lineTo(x + 5, y + h + legFrame);
      catCtx.moveTo(x + 9, y + h - 2);
      catCtx.lineTo(x + 9, y + h - legFrame);
      catCtx.stroke();
    } else {
      // Tucked legs during jump
      catCtx.beginPath();
      catCtx.moveTo(x + w - 6, y + h - 2);
      catCtx.lineTo(x + w - 3, y + h + 1);
      catCtx.moveTo(x + w - 10, y + h - 2);
      catCtx.lineTo(x + w - 13, y + h + 1);
      catCtx.moveTo(x + 5, y + h - 2);
      catCtx.lineTo(x + 8, y + h + 1);
      catCtx.moveTo(x + 9, y + h - 2);
      catCtx.lineTo(x + 6, y + h + 1);
      catCtx.stroke();
    }
  }

  // --- Draw yarn ball obstacle (circle with cross-hatching) ---
  function drawYarnBall(x, y, w, h, col) {
    var cx = x + w / 2;
    var cy = y + h / 2;
    var r = w / 2;
    catCtx.strokeStyle = col;
    catCtx.lineWidth = 1.5;

    // Outer circle
    catCtx.beginPath();
    catCtx.arc(cx, cy, r, 0, Math.PI * 2);
    catCtx.stroke();

    // Cross-hatching lines inside
    catCtx.globalAlpha = 0.4;
    catCtx.beginPath();
    catCtx.moveTo(cx - r * 0.6, cy - r * 0.6);
    catCtx.lineTo(cx + r * 0.6, cy + r * 0.6);
    catCtx.moveTo(cx + r * 0.6, cy - r * 0.6);
    catCtx.lineTo(cx - r * 0.6, cy + r * 0.6);
    catCtx.moveTo(cx, cy - r * 0.8);
    catCtx.lineTo(cx, cy + r * 0.8);
    catCtx.stroke();
    catCtx.globalAlpha = 1;
  }

  // --- Draw server rack obstacle ---
  function drawServer(x, y, w, h, col) {
    catCtx.strokeStyle = col;
    catCtx.lineWidth = 1.5;
    catCtx.beginPath();
    catCtx.rect(x, y, w, h);
    catCtx.stroke();
    var rows = Math.floor(h / 8);
    for (var i = 1; i < rows; i++) {
      catCtx.beginPath();
      catCtx.moveTo(x, y + i * 8);
      catCtx.lineTo(x + w, y + i * 8);
      catCtx.globalAlpha = 0.4;
      catCtx.stroke();
      catCtx.globalAlpha = 1;
    }
    for (var i = 0; i < rows; i++) {
      catCtx.fillStyle = col;
      catCtx.fillRect(x + 2, y + i * 8 + 3, 2, 2);
    }
  }

  // --- Game loop ---
  function catLoop() {
    updateCatGame();
    drawCatGame();
    requestAnimationFrame(catLoop);
  }

  function startOrRestartCat() {
    if (!CAT.started) {
      CAT.started = true;
      if (catHint) catHint.style.display = 'none';
    }
    if (CAT.gameOver || !CAT.running) {
      resetCat();
      CAT.running = true;
    }
    catJump();
  }

  // --- Input: Spacebar (only when hero in view) ---
  var heroSection = document.getElementById('hero');

  function isHeroInView() {
    var rect = heroSection.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }

  document.addEventListener('keydown', function (e) {
    if (e.code === 'Space' && isHeroInView()) {
      e.preventDefault();
      startOrRestartCat();
    }
  });

  // --- Input: Click / Tap on canvas only ---
  catCanvas.addEventListener('click', function (e) {
    e.preventDefault();
    startOrRestartCat();
  });

  catCanvas.addEventListener('touchstart', function (e) {
    e.preventDefault();
    startOrRestartCat();
  }, { passive: false });

  // --- Resize cat canvas ---
  window.addEventListener('resize', resizeCatCanvas);
  resizeCatCanvas();
  resetCat();
  catLoop();


  /* ----------------------------------------------------------
     3. TYPING ANIMATION
     ---------------------------------------------------------- */

  var typingTarget = document.getElementById('typedText');
  var phrases = [
    'Backend & Software Engineering Intern',
    'B.Tech CSE @ IIIT Kalyani (2023-2027)',
    'Open Source Advocate & Community Builder',
  ];
  var phraseIdx = 0;
  var charIdx = 0;
  var isDeleting = false;
  var TYPING_SPEED = 70;
  var DELETING_SPEED = 40;
  var PAUSE_AFTER_TYPE = 2000;
  var PAUSE_AFTER_DELETE = 400;

  function typeLoop() {
    var currentPhrase = phrases[phraseIdx];
    if (!isDeleting) {
      typingTarget.textContent = currentPhrase.substring(0, charIdx + 1);
      charIdx++;
      if (charIdx === currentPhrase.length) {
        isDeleting = true;
        setTimeout(typeLoop, PAUSE_AFTER_TYPE);
        return;
      }
      setTimeout(typeLoop, TYPING_SPEED + Math.random() * 30);
    } else {
      typingTarget.textContent = currentPhrase.substring(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(typeLoop, PAUSE_AFTER_DELETE);
        return;
      }
      setTimeout(typeLoop, DELETING_SPEED);
    }
  }

  setTimeout(typeLoop, 1200);


  /* ----------------------------------------------------------
     4. NAVBAR
     ---------------------------------------------------------- */

  var navbar = document.getElementById('navbar');
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');

  // Blur/border on scroll
  window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile hamburger toggle
  hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close mobile nav on link click
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });


  /* ----------------------------------------------------------
     4b. ACTIVE NAV LINK ON SCROLL
     ---------------------------------------------------------- */

  var navAnchors = document.querySelectorAll('.nav__links a[data-nav]');
  var sectionIds = [];
  navAnchors.forEach(function (a) { sectionIds.push(a.getAttribute('data-nav')); });

  function updateActiveNav() {
    var scrollY = window.scrollY + navbar.offsetHeight + 80;
    var activeId = sectionIds[0]; // default to first

    for (var i = sectionIds.length - 1; i >= 0; i--) {
      var sec = document.getElementById(sectionIds[i]);
      if (sec && sec.offsetTop <= scrollY) {
        activeId = sectionIds[i];
        break;
      }
    }

    navAnchors.forEach(function (a) {
      if (a.getAttribute('data-nav') === activeId) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav(); // set initial state


  /* ----------------------------------------------------------
     4c. CONTACT DROPDOWN
     ---------------------------------------------------------- */

  var contactBtn = document.getElementById('contactBtn');
  var contactDropdown = document.getElementById('contactDropdown');

  if (contactBtn && contactDropdown) {
    contactBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      contactDropdown.classList.toggle('open');
      contactBtn.classList.toggle('active');
    });

    document.addEventListener('click', function (e) {
      if (!contactDropdown.contains(e.target) && !contactBtn.contains(e.target)) {
        contactDropdown.classList.remove('open');
        contactBtn.classList.remove('active');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        contactDropdown.classList.remove('open');
        contactBtn.classList.remove('active');
      }
    });
  }


  /* ----------------------------------------------------------
     5. SECTION REVEAL ON SCROLL (Intersection Observer)
     ---------------------------------------------------------- */

  var sections = document.querySelectorAll('[data-section]');

  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        sectionObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px',
  });

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });


  /* ----------------------------------------------------------
     6. SMOOTH SCROLL
     ---------------------------------------------------------- */

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var navHeight = navbar.offsetHeight;
        var targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  });

})();