// Gryffindor-Inspired Magical Academy Theme Emitter
// Dual Canvas:
// 1. Background Canvas: A beautiful sunset library sky gradient layered with multi-layer
//    parallax castle tower silhouettes, glowing flickering windows, pulsing wall torches emitting sparks,
//    ambient slow-floating gold embers, and soft expanding smoke/fog layers.
// 2. Cursor Canvas: Subtle, magical, cinematic warm golden sparks with bright cream cores.

class ParticleSystem {
  constructor() {
    this.bgCanvas = null;
    this.bgCtx = null;
    this.fgCanvas = null;
    this.fgCtx = null;

    this.bgParticles = [];
    this.cursorTrail = [];
    this.castleTorches = [];
    this.castleWindows = [];

    this.mouse = { x: 0, y: 0, lastX: 0, lastY: 0, speed: 0, active: false };
    this.maxBgParticles = 80; // sparks + fog puffs, increased for visual richness
    this.time = 0;
  }

  init() {
    this.bgCanvas = document.getElementById('background-canvas');
    this.fgCanvas = document.getElementById('magic-canvas');

    if (!this.bgCanvas || !this.fgCanvas) return;

    this.bgCtx = this.bgCanvas.getContext('2d');
    this.fgCtx = this.fgCanvas.getContext('2d');

    this.resizeCanvases();
    window.addEventListener('resize', () => this.resizeCanvases());

    // Mouse tracking
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    window.addEventListener('mouseout', () => { this.mouse.active = false; });

    // Initialize background floating elements & fog
    for (let i = 0; i < this.maxBgParticles; i++) {
      this.bgParticles.push(this.createBgParticle(true));
    }



    this.setupCastleDecorations();
    // this.setupOwlCursor();
    this.animate();
  }

  resizeCanvases() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.bgCanvas.width = w;
    this.bgCanvas.height = h;
    this.fgCanvas.width = w;
    this.fgCanvas.height = h;
    this.setupCastleDecorations();
  }

  // Pre-calculate positions of castle torches and windows so they align to the silhouettes
  setupCastleDecorations() {
    const w = window.innerWidth;
    
    // We position windows and torches relative to the castle facade percentages
    this.castleWindows = [
      { relX: 0.12, relY: 0.52, sizeW: 4, sizeH: 8,  phase: Math.random() * Math.PI },
      { relX: 0.12, relY: 0.58, sizeW: 4, sizeH: 8,  phase: Math.random() * Math.PI },
      { relX: 0.38, relY: 0.65, sizeW: 6, sizeH: 10, phase: Math.random() * Math.PI },
      { relX: 0.45, relY: 0.65, sizeW: 6, sizeH: 10, phase: Math.random() * Math.PI },
      { relX: 0.58, relY: 0.44, sizeW: 3, sizeH: 7,  phase: Math.random() * Math.PI },
      { relX: 0.58, relY: 0.48, sizeW: 3, sizeH: 7,  phase: Math.random() * Math.PI },
      { relX: 0.77, relY: 0.58, sizeW: 4, sizeH: 8,  phase: Math.random() * Math.PI }
    ];

    this.castleTorches = [
      { relX: 0.35, relY: 0.72, phase: 0 },
      { relX: 0.48, relY: 0.72, phase: Math.PI / 2 },
      { relX: 0.74, relY: 0.68, phase: Math.PI }
    ];
  }

  createBgParticle(randomY = false, forceType = null) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Distribute particle types:
    // - 75% warm sparks / gold embers
    // - 25% misty smoke / soft cinematic fog puffs
    const type = forceType || (Math.random() > 0.25 ? 'ember' : 'fog');
    const sizeMult = type === 'fog' ? 35 : 1;

    return {
      type: type,
      x: Math.random() * w,
      y: randomY ? Math.random() * h : h + 20,
      size: (Math.random() * 1.6 + 0.4) * sizeMult,
      speedY: type === 'fog' 
        ? -(Math.random() * 0.12 + 0.03) // fog is extremely slow
        : -(Math.random() * 0.28 + 0.05), // embers rise steadily
      speedX: (Math.random() - 0.5) * 0.1,
      alpha: 0,
      maxAlpha: type === 'fog'
        ? Math.random() * 0.015 + 0.005 // highly transparent misty puffs
        : Math.random() * 0.12 + 0.04,   // flickering warm sparks
      fadeIn: true,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: Math.random() * 0.015 + 0.005,
      // Gold/Amber candlelight tones
      color: Math.random() > 0.5
        ? [218, 165, 32]   // Antique Gold
        : [212, 148, 74]   // Sunset Amber
    };
  }


  handleMouseMove(e) {
    this.mouse.active = true;
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;

    const dx = this.mouse.x - this.mouse.lastX;
    const dy = this.mouse.y - this.mouse.lastY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    this.mouse.speed = dist;

    this.mouse.lastX = this.mouse.x;
    this.mouse.lastY = this.mouse.y;

    // Spawn minimalist magical sparks smoothly as cursor moves
    if (dist > 1.2 && this.cursorTrail.length < 16) {
      this.cursorTrail.push({
        x: this.mouse.x,
        y: this.mouse.y,
        vx: (Math.random() - 0.5) * 0.5 + dx * 0.05,
        vy: (Math.random() - 0.5) * 0.5 + dy * 0.05 - 0.12, // slight upward drift
        alpha: 1.0,
        size: Math.random() * 2.2 + 1.2,
        decay: 0.018 + Math.random() * 0.01
      });

      // Add a very subtle, fine, glittering golden dust effect drifting from the tip of the wand when moved
      if (Math.random() < 0.35) {
        this.cursorTrail.push({
          x: this.mouse.x + (Math.random() - 0.5) * 3,
          y: this.mouse.y + (Math.random() - 0.5) * 3,
          vx: (Math.random() - 0.5) * 0.2 + dx * 0.02,
          vy: -Math.random() * 0.2 - 0.05, // very slow drift up
          alpha: 0.7,
          size: Math.random() * 0.8 + 0.4, // extremely tiny gold dust
          decay: 0.01 + Math.random() * 0.008 // stays slightly longer but very dim
        });
      }
    }
  }

  drawBackground() {
    const w = this.bgCanvas.width;
    const h = this.bgCanvas.height;
    this.time += 0.016;

    this.bgCtx.clearRect(0, 0, w, h);

    // Dynamic sparks & fog layers render directly over the castle_sunset_bg.png background
    this.bgParticles.forEach((p, idx) => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.x += Math.sin(p.y * 0.004 + this.time * 0.2) * 0.08; // swaying movement

      // Handle fading
      if (p.fadeIn && p.alpha < p.maxAlpha) {
        p.alpha += 0.0015;
        if (p.alpha >= p.maxAlpha) p.fadeIn = false;
      }

      // Recycle offscreen particles
      if (p.y < -40 || p.x < -40 || p.x > w + 40) {
        this.bgParticles[idx] = this.createBgParticle(false);
        return;
      }

      if (p.type === 'ember') {
        const [r, g, b] = p.color;
        this.bgCtx.beginPath();
        this.bgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.bgCtx.fillStyle = `rgba(${r},${g},${b},${p.alpha})`;
        this.bgCtx.fill();
        
        // Embers glowing halos
        this.bgCtx.beginPath();
        this.bgCtx.arc(p.x, p.y, p.size * 2.8, 0, Math.PI * 2);
        this.bgCtx.fillStyle = `rgba(${r},${g},${b},${p.alpha * 0.25})`;
        this.bgCtx.fill();
      } else if (p.type === 'fog') {
        const fGrad = this.bgCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        fGrad.addColorStop(0, `rgba(250, 240, 224, ${p.alpha})`);
        fGrad.addColorStop(0.5, `rgba(244, 234, 212, ${p.alpha * 0.3})`);
        fGrad.addColorStop(1, 'rgba(0,0,0,0)');
        
        this.bgCtx.fillStyle = fGrad;
        this.bgCtx.beginPath();
        this.bgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.bgCtx.fill();
      }
    });


  }

  // Draw procedural vector silhouettes of castle spires, battlements and bridges (disabled in favor of high-fidelity background image)
  drawCastleLayer(layer, scrollY, w, h) {
    return; // bypassed

    // Configure scroll reactive parallax offsets
    let parallaxY = 0;
    let fillStyle = '';

    if (layer === 1) {
      // Far layer
      parallaxY = h * 0.16 + scrollY * 0.12;
      fillStyle = 'rgba(106, 37, 52, 0.14)'; // Soft faint plum-burgundy shadow
    } else {
      // Middle layer
      parallaxY = h * 0.24 + scrollY * 0.22;
      fillStyle = 'rgba(92, 26, 36, 0.24)';  // Closer warmer rich burgundy-brown facade shadow
    }

    this.bgCtx.fillStyle = fillStyle;
    this.bgCtx.beginPath();

    // Procedural Castle Silhouettes vector path mapping
    if (layer === 1) {
      // --- FAR LAYER VECTOR PATH ---
      // Distant giant keep (left)
      const x1 = w * 0.16;
      const y1 = h - parallaxY - 240;
      this.bgCtx.moveTo(x1, h);
      this.bgCtx.lineTo(x1, y1);
      this.bgCtx.lineTo(x1 + 60, y1);
      this.bgCtx.lineTo(x1 + 60, h);

      // Tower spire 1 (middle-left)
      const x2 = w * 0.28;
      const y2 = h - parallaxY - 320;
      this.bgCtx.moveTo(x2, h);
      this.bgCtx.lineTo(x2, y2);
      this.bgCtx.lineTo(x2 + 20, y2 - 40); // Cone top
      this.bgCtx.lineTo(x2 + 40, y2);
      this.bgCtx.lineTo(x2 + 40, h);

      // Distant grand clock tower keep (middle-right)
      const x3 = w * 0.48;
      const y3 = h - parallaxY - 260;
      this.bgCtx.moveTo(x3, h);
      this.bgCtx.lineTo(x3, y3);
      this.bgCtx.lineTo(x3 + 80, y3);
      // Battlements
      this.bgCtx.lineTo(x3 + 80, y3 + 12);
      this.bgCtx.lineTo(x3 + 95, y3 + 12);
      this.bgCtx.lineTo(x3 + 95, h);

      // Far spire 2 (right)
      const x4 = w * 0.72;
      const y4 = h - parallaxY - 340;
      this.bgCtx.moveTo(x4, h);
      this.bgCtx.lineTo(x4, y4);
      this.bgCtx.lineTo(x4 + 18, y4 - 35);
      this.bgCtx.lineTo(x4 + 36, y4);
      this.bgCtx.lineTo(x4 + 36, h);

    } else {
      // --- MIDDLE LAYER FACADE VECTOR PATH ---
      // Left sharp spired tower
      const x1 = w * 0.1;
      const y1 = h - parallaxY - 280;
      this.bgCtx.moveTo(x1, h);
      this.bgCtx.lineTo(x1, y1);
      this.bgCtx.lineTo(x1 + 16, y1 - 32); // spire cone
      this.bgCtx.lineTo(x1 + 32, y1);
      this.bgCtx.lineTo(x1 + 32, h);

      // Main Academy facade keep & battlements (middle-left)
      const x2 = w * 0.32;
      const y2 = h - parallaxY - 180;
      this.bgCtx.moveTo(x2, h);
      this.bgCtx.lineTo(x2, y2);
      // Draw brick-crenelation battlements
      const creW = 16;
      for (let bx = x2; bx < x2 + 150; bx += creW * 2) {
        this.bgCtx.lineTo(bx, y2);
        this.bgCtx.lineTo(bx, y2 + 10);
        this.bgCtx.lineTo(bx + creW, y2 + 10);
        this.bgCtx.lineTo(bx + creW, y2);
        this.bgCtx.lineTo(bx + creW * 2, y2);
      }
      this.bgCtx.lineTo(x2 + 150, h);

      // Academy Grand Bell Tower
      const x3 = w * 0.54;
      const y3 = h - parallaxY - 290;
      this.bgCtx.moveTo(x3, h);
      this.bgCtx.lineTo(x3, y3);
      this.bgCtx.lineTo(x3 + 24, y3 - 35);
      this.bgCtx.lineTo(x3 + 48, y3);
      this.bgCtx.lineTo(x3 + 48, h);

      // Connect Spanning Bridge to right tower
      const bridgeY = h - parallaxY - 110;
      const xB = w * 0.58;
      this.bgCtx.moveTo(xB, h);
      this.bgCtx.lineTo(xB, bridgeY);
      this.bgCtx.lineTo(xB + 100, bridgeY);
      this.bgCtx.lineTo(xB + 100, h);

      // Right facade tower
      const x4 = w * 0.74;
      const y4 = h - parallaxY - 230;
      this.bgCtx.moveTo(x4, h);
      this.bgCtx.lineTo(x4, y4);
      this.bgCtx.lineTo(x4 + 18, y4 - 28);
      this.bgCtx.lineTo(x4 + 36, y4);
      this.bgCtx.lineTo(x4 + 36, h);
    }

    this.bgCtx.closePath();
    this.bgCtx.fill();

    // 5. Draw interactive details on middle layer
    if (layer === 2) {
      this.drawCastleWindows(parallaxY, w, h);
      this.drawCastleTorches(parallaxY, w, h);
    }

    this.bgCtx.restore();
  }

  // Draw cozy flickering golden windows nested in the silhouettes
  drawCastleWindows(parallaxY, w, h) {
    this.castleWindows.forEach(win => {
      const wx = w * win.relX;
      const wy = h - parallaxY - (h * win.relY * 0.5);

      win.phase += 0.04;
      // Soft flickering candle lights formula
      const flicker = 0.55 + Math.sin(win.phase) * 0.22;

      this.bgCtx.fillStyle = `rgba(255, 220, 100, ${flicker * 0.6})`;
      this.bgCtx.fillRect(wx - win.sizeW/2, wy, win.sizeW, win.sizeH);

      // Add slight window halo glow
      const winGrad = this.bgCtx.createRadialGradient(wx, wy + win.sizeH/2, 0, wx, wy + win.sizeH/2, win.sizeH * 1.5);
      winGrad.addColorStop(0, `rgba(255, 212, 50, ${flicker * 0.25})`);
      winGrad.addColorStop(1, 'rgba(0,0,0,0)');
      this.bgCtx.fillStyle = winGrad;
      this.bgCtx.beginPath();
      this.bgCtx.arc(wx, wy + win.sizeH/2, win.sizeH * 1.5, 0, Math.PI * 2);
      this.bgCtx.fill();
    });
  }

  // Draw wall torches emitting tiny embers
  drawCastleTorches(parallaxY, w, h) {
    this.castleTorches.forEach(t => {
      const tx = w * t.relX;
      const ty = h - parallaxY - (h * t.relY * 0.5);

      t.phase += 0.08;
      const pulse = 4 + Math.sin(t.phase) * 0.8;

      // Draw torch amber flame glow
      const fGrad = this.bgCtx.createRadialGradient(tx, ty, 0, tx, ty, pulse * 2.8);
      fGrad.addColorStop(0, 'rgba(235, 120, 40, 0.7)');
      fGrad.addColorStop(0.4, 'rgba(218, 165, 32, 0.25)');
      fGrad.addColorStop(1, 'rgba(0,0,0,0)');
      
      this.bgCtx.fillStyle = fGrad;
      this.bgCtx.beginPath();
      this.bgCtx.arc(tx, ty, pulse * 2.8, 0, Math.PI * 2);
      this.bgCtx.fill();

      // Flame center
      this.bgCtx.fillStyle = '#FFA500';
      this.bgCtx.beginPath();
      this.bgCtx.arc(tx, ty, pulse * 0.6, 0, Math.PI * 2);
      this.bgCtx.fill();

      // Periodically spawn tiny rising background spark embers from wall torches
      if (Math.random() < 0.04) {
        this.bgParticles.push({
          type: 'ember',
          x: tx + (Math.random() - 0.5) * 4,
          y: ty - 4,
          size: Math.random() * 0.8 + 0.3,
          speedY: -(Math.random() * 0.2 + 0.08),
          speedX: (Math.random() - 0.5) * 0.08,
          alpha: 1.0,
          maxAlpha: 0.9,
          fadeIn: false,
          phase: Math.random() * Math.PI,
          phaseSpeed: 0.01,
          color: [212, 148, 74]
        });
      }
    });
  }

  drawForeground() {
    this.fgCtx.clearRect(0, 0, this.fgCanvas.width, this.fgCanvas.height);

    // 1. Cozy candlelight aura at the mouse position
    if (this.mouse.active) {
      const mGrad = this.fgCtx.createRadialGradient(
        this.mouse.x, this.mouse.y, 0,
        this.mouse.x, this.mouse.y, 25
      );
      mGrad.addColorStop(0, 'rgba(218, 165, 32, 0.06)');
      mGrad.addColorStop(0.6, 'rgba(212, 148, 74, 0.02)');
      mGrad.addColorStop(1, 'rgba(0,0,0,0)');
      this.fgCtx.fillStyle = mGrad;
      this.fgCtx.fillRect(this.mouse.x - 25, this.mouse.y - 25, 50, 50);
    }

    // 2. Render refined glowing spark cursor trail
    for (let i = this.cursorTrail.length - 1; i >= 0; i--) {
      const p = this.cursorTrail[i];
      
      // Update coordinates
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.cursorTrail.splice(i, 1);
        continue;
      }

      // Golden outer glow
      this.fgCtx.beginPath();
      this.fgCtx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
      this.fgCtx.fillStyle = `rgba(197, 155, 39, ${p.alpha * 0.22})`;
      this.fgCtx.fill();

      // Outer gold circle shell
      this.fgCtx.beginPath();
      this.fgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.fgCtx.fillStyle = `rgba(197, 155, 39, ${p.alpha * 0.8})`;
      this.fgCtx.fill();

      // Cream white center core
      this.fgCtx.beginPath();
      this.fgCtx.arc(p.x, p.y, p.size * 0.35, 0, Math.PI * 2);
      this.fgCtx.fillStyle = `rgba(255, 248, 225, ${p.alpha * 0.95})`;
      this.fgCtx.fill();
    }
  }

  animate() {
    this.drawBackground();
    this.drawForeground();
    requestAnimationFrame(() => this.animate());
  }

  setupOwlCursor() {
    const owlCursorImg = new Image();
    owlCursorImg.src = 'hedwig.png';
    owlCursorImg.onload = () => {
      const cursorSize = 32; 
      
      const normalCanvas = document.createElement('canvas');
      normalCanvas.width = cursorSize;
      normalCanvas.height = cursorSize;
      const normalCtx = normalCanvas.getContext('2d');
      normalCtx.drawImage(owlCursorImg, 0, 0, cursorSize, cursorSize);
      const normalDataUrl = normalCanvas.toDataURL();

      const hoverCanvas = document.createElement('canvas');
      hoverCanvas.width = cursorSize;
      hoverCanvas.height = cursorSize;
      const hoverCtx = hoverCanvas.getContext('2d');
      
      const glow = hoverCtx.createRadialGradient(cursorSize/2, cursorSize/2, 0, cursorSize/2, cursorSize/2, cursorSize/2);
      glow.addColorStop(0, 'rgba(197, 155, 39, 0.48)');
      glow.addColorStop(0.5, 'rgba(197, 155, 39, 0.12)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      hoverCtx.fillStyle = glow;
      hoverCtx.beginPath();
      hoverCtx.arc(cursorSize/2, cursorSize/2, cursorSize/2, 0, Math.PI * 2);
      hoverCtx.fill();
      
      hoverCtx.drawImage(owlCursorImg, 0, 0, cursorSize, cursorSize);
      const hoverDataUrl = hoverCanvas.toDataURL();

      const styleId = 'owl-cursor-style';
      let styleElement = document.getElementById(styleId);
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      styleElement.innerHTML = `
        html, body {
          cursor: url("${normalDataUrl}") 16 16, auto !important;
        }
        a, button, select, input[type='submit'], input[type='button'], .btn-primary, .btn-secondary, .owl-toggle, .lang-toggle, .mobile-nav-link, .sidebar-link, [role='button'], .char-card, .touch-btn, .pixel-btn {
          cursor: url("${hoverDataUrl}") 16 16, pointer !important;
        }
      `;
    };
  }
}

// Instantiate and initialize Particle System on content ready
window.addEventListener('DOMContentLoaded', () => {
  const system = new ParticleSystem();
  system.init();
});
