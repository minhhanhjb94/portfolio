// Retro 2D Platformer Mini-game: "Magic Hall Adventure"
// Features: 4 playable characters with custom sprites & stats, Web Audio API sound generator,
// custom platformer physics with AABB collisions, moving platforms, multiple obstacle types,
// and a gorgeous vector-pixel art engine drawn procedurally on Canvas.

class MagicHallGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.audioCtx = null;

    // Game Loop & State
    this.active = false;
    this.state = 'SELECT'; // SELECT, PLAY, PAUSE, GAMEOVER, VICTORY
    this.selectedChar = 'harry';
    this.score = 0;
    this.coinsCollected = 0;
    this.totalCoinsInLevel = 15;
    this.gameTime = 0;

    // Camera
    this.camera = { x: 0, targetX: 0, width: 800, height: 450 };

    // Player Physics
    this.player = {
      x: 80,
      y: 300,
      vx: 0,
      vy: 0,
      width: 20,
      height: 32,
      grounded: false,
      jumpCount: 0,
      maxJumps: 1,
      invincibilityFrames: 0,
      lives: 3,
      facingLeft: false,
      animationFrame: 0,
      animationTimer: 0
    };

    // Character Configuration
    this.charsConfig = {
      harry: {
        name: 'Harry',
        colorTheme: '#7A2D2D', // Burgundy
        speed: 3.2,
        jumpForce: -8.8,
        gravity: 0.38,
        maxJumps: 1,
        desc: 'Brave Wizard'
      },
      ron: {
        name: 'Ron',
        colorTheme: '#D4944A', // Amber/Orange
        speed: 2.8,
        jumpForce: -9.5,
        gravity: 0.34, // lower gravity (light floaty jump)
        maxJumps: 1,
        desc: 'Loyal Caster'
      },
      hermione: {
        name: 'Hermione',
        colorTheme: '#8A7A68', // Blue-Grey robe
        speed: 3.0,
        jumpForce: -8.2,
        gravity: 0.38,
        maxJumps: 2, // DOUBLE JUMP!
        desc: 'Brilliant Witch'
      },
      dumbledore: {
        name: 'Dumbledore',
        colorTheme: '#DAA520', // Gold robe
        speed: 2.4,
        jumpForce: -8.5,
        gravity: 0.38,
        maxJumps: 1,
        desc: 'Wise Headmaster'
      }
    };

    // Level Entities
    this.platforms = [];
    this.coins = [];
    this.enemies = [];
    this.candles = [];
    this.sparks = []; // visual particle effects
    this.exitPortal = { x: 2260, y: 280, width: 45, height: 90 };

    // Input States
    this.keys = {
      left: false,
      right: false,
      jump: false,
      up: false
    };

    // Level Boundary
    this.levelWidth = 2400;
  }

  init() {
    this.canvas = document.getElementById('game-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.setupCharacterSelect();
    this.setupEventListeners();
    this.renderPortraits();
    this.buildLevel();
    
    // Start drawing loop for the character selection backdrop
    this.animateSelectionBackdrop();
  }

  // ==========================================
  // PROCEDURAL PIXEL ART SPRITES DEFINITIONS
  // ==========================================
  // Custom 12x16 pixel sprites mapped in string matrices
  // Legend:
  // . = transparent
  // H = hair (brown)
  // O = skin (peach)
  // R = red coat
  // S = scarf (gold)
  // P = pants (black)
  // W = wand (tan)
  // G = glasses (black)
  // Y = orange hair
  // B = blue dress
  // A = silver beard
  // M = wizard hat (purple)
  // U = purple robe
  getSpriteGrid(charId, animState, walkCycle) {
    if (charId === 'harry') {
      const hair = 'H', coat = 'R', accent = 'S', skin = 'O';
      if (animState === 'JUMP') {
        return [
          `..${hair}${hair}${hair}${hair}${hair}..`,
          `.${hair}${hair}${hair}${hair}${hair}${hair}${hair}.`,
          `.${hair}${skin}${hair}${skin}${skin}${hair}${skin}.`,
          `.${hair}${skin}${skin}${skin}${skin}${skin}${hair}.`,
          `..${skin}${accent}${accent}${accent}${skin}..`,
          `..${coat}${coat}${coat}${coat}${coat}..`,
          `.${coat}${coat}${coat}${coat}${coat}${coat}.`,
          `.${coat}${coat}${coat}${coat}${coat}${coat}.`,
          `..${accent}${coat}${coat}${accent}..W`,
          `..${accent}${accent}${accent}${accent}...`,
          `...${coat}....${coat}...`,
          `...P....P...`
        ];
      }
      if (animState === 'WALK') {
        const leftLeg = walkCycle === 0 ? 'P' : '.';
        const rightLeg = walkCycle === 1 ? 'P' : '.';
        return [
          `..${hair}${hair}${hair}${hair}${hair}..`,
          `.${hair}${hair}${hair}${hair}${hair}${hair}${hair}.`,
          `.${hair}${skin}${hair}${skin}${skin}${hair}${skin}.`,
          `.${hair}${skin}${skin}${skin}${skin}${skin}${hair}.`,
          `..${skin}${accent}${accent}${accent}${skin}..`,
          `..${coat}${coat}${coat}${coat}${coat}..`,
          `.${coat}${coat}${coat}${coat}${coat}${coat}.`,
          `.${coat}${coat}${coat}${coat}${coat}${coat}.`,
          `..${coat}${coat}${coat}${coat}${coat}..W`,
          `..${coat}${accent}${accent}${coat}....`,
          `...${leftLeg}....${rightLeg}...`,
          `...P....P...`
        ];
      }
      // IDLE
      return [
        `..${hair}${hair}${hair}${hair}${hair}..`,
        `.${hair}${hair}${hair}${hair}${hair}${hair}${hair}.`,
        `.${hair}${skin}${hair}${skin}${skin}${hair}${skin}.`,
        `.${hair}${skin}${skin}${skin}${skin}${skin}${hair}.`,
        `..${skin}${accent}${accent}${accent}${skin}..`,
        `..${coat}${coat}${coat}${coat}${coat}..`,
        `.${coat}${coat}${coat}${coat}${coat}${coat}.`,
        `.${coat}${coat}${coat}${coat}${coat}${coat}.`,
        `..${coat}${coat}${coat}${coat}${coat}..W`,
        `..${coat}${coat}${coat}${coat}${coat}...`,
        `...P....P...`,
        `...P....P...`
      ];
    }

    if (charId === 'ron') {
      const hair = 'Y', coat = 'S', accent = 'H', skin = 'O'; // orange hair, gold sweater
      if (animState === 'JUMP') {
        return [
          `..${hair}${hair}${hair}${hair}${hair}..`,
          `.${hair}${hair}${hair}${hair}${hair}${hair}${hair}.`,
          `.${hair}${skin}${skin}${skin}${skin}${skin}${hair}.`,
          `.${hair}${skin}${skin}${skin}${skin}${skin}${hair}.`,
          `..${skin}${accent}${accent}${accent}${skin}..`,
          `..${coat}${coat}${coat}${coat}${coat}..`,
          `.${coat}${coat}${coat}${coat}${coat}${coat}.`,
          `.${coat}${coat}${coat}${coat}${coat}${coat}.`,
          `..${accent}${coat}${coat}${accent}..W`,
          `..${coat}${coat}${coat}${coat}....`,
          `...${coat}....${coat}...`,
          `...accent..accent.`
        ];
      }
      if (animState === 'WALK') {
        const leftLeg = walkCycle === 0 ? 'accent' : '.';
        const rightLeg = walkCycle === 1 ? 'accent' : '.';
        return [
          `..${hair}${hair}${hair}${hair}${hair}..`,
          `.${hair}${hair}${hair}${hair}${hair}${hair}${hair}.`,
          `.${hair}${skin}${skin}${skin}${skin}${skin}${hair}.`,
          `.${hair}${skin}${skin}${skin}${skin}${skin}${hair}.`,
          `..${skin}${accent}${accent}${accent}${skin}..`,
          `..${coat}${coat}${coat}${coat}${coat}..`,
          `.${coat}${coat}${coat}${coat}${coat}${coat}.`,
          `.${coat}${coat}${coat}${coat}${coat}${coat}.`,
          `..${coat}${coat}${coat}${coat}${coat}..W`,
          `..${coat}${accent}${accent}${coat}....`,
          `...${leftLeg}....${rightLeg}...`,
          `...accent..accent.`
        ];
      }
      return [
        `..${hair}${hair}${hair}${hair}${hair}..`,
        `.${hair}${hair}${hair}${hair}${hair}${hair}${hair}.`,
        `.${hair}${skin}${skin}${skin}${skin}${skin}${hair}.`,
        `.${hair}${skin}${skin}${skin}${skin}${skin}${hair}.`,
        `..${skin}${accent}${accent}${accent}${skin}..`,
        `..${coat}${coat}${coat}${coat}${coat}..`,
        `.${coat}${coat}${coat}${coat}${coat}${coat}.`,
        `.${coat}${coat}${coat}${coat}${coat}${coat}.`,
        `..${coat}${coat}${coat}${coat}${coat}..W`,
        `..${coat}${coat}${coat}${coat}${coat}...`,
        `...accent..accent.`,
        `...accent..accent.`
      ];
    }

    if (charId === 'hermione') {
      const hair = 'H', coat = 'B', accent = 'S', skin = 'O'; // brown hair, blue dress
      if (animState === 'JUMP') {
        return [
          `..${hair}${hair}${hair}${hair}${hair}..`,
          `.${hair}${hair}${hair}${hair}${hair}${hair}${hair}.`,
          `.${hair}${skin}${skin}${skin}${skin}${skin}${hair}.`,
          `.${hair}${skin}${skin}${skin}${skin}${skin}${hair}.`,
          `..${skin}${accent}${accent}${accent}${skin}..`,
          `..${coat}${coat}${coat}${coat}${coat}..`,
          `.${coat}${coat}${coat}${coat}${coat}${coat}.`,
          `.${coat}${coat}${coat}${coat}${coat}${coat}.`,
          `..${accent}${coat}${coat}${accent}..W`,
          `..${coat}${coat}${coat}${coat}....`,
          `...${coat}....${coat}...`,
          `...H....H...`
        ];
      }
      if (animState === 'WALK') {
        const leftLeg = walkCycle === 0 ? 'H' : '.';
        const rightLeg = walkCycle === 1 ? 'H' : '.';
        return [
          `..${hair}${hair}${hair}${hair}${hair}..`,
          `.${hair}${hair}${hair}${hair}${hair}${hair}${hair}.`,
          `.${hair}${skin}${skin}${skin}${skin}${skin}${hair}.`,
          `.${hair}${skin}${skin}${skin}${skin}${skin}${hair}.`,
          `..${skin}${accent}${accent}${accent}${skin}..`,
          `..${coat}${coat}${coat}${coat}${coat}..`,
          `.${coat}${coat}${coat}${coat}${coat}${coat}.`,
          `.${coat}${coat}${coat}${coat}${coat}${coat}.`,
          `..${coat}${coat}${coat}${coat}${coat}..W`,
          `..${coat}${accent}${accent}${coat}....`,
          `...${leftLeg}....${rightLeg}...`,
          `...H....H...`
        ];
      }
      return [
        `..${hair}${hair}${hair}${hair}${hair}..`,
        `.${hair}${hair}${hair}${hair}${hair}${hair}${hair}.`,
        `.${hair}${skin}${skin}${skin}${skin}${skin}${hair}.`,
        `.${hair}${skin}${skin}${skin}${skin}${skin}${hair}.`,
        `..${skin}${accent}${accent}${accent}${skin}..`,
        `..${coat}${coat}${coat}${coat}${coat}..`,
        `.${coat}${coat}${coat}${coat}${coat}${coat}.`,
        `.${coat}${coat}${coat}${coat}${coat}${coat}.`,
        `..${coat}${coat}${coat}${coat}${coat}..W`,
        `..${coat}${coat}${coat}${coat}${coat}...`,
        `...H....H...`,
        `...H....H...`
      ];
    }

    if (charId === 'dumbledore') {
      const beard = 'A', hat = 'M', coat = 'U', skin = 'O'; // silver beard, purple hat/robes
      if (animState === 'JUMP') {
        return [
          `....${hat}${hat}${hat}....`,
          `...${hat}${hat}${hat}${hat}${hat}...`,
          `..${hat}${hat}${hat}${hat}${hat}${hat}..`,
          `.${hat}${skin}${skin}${skin}${skin}${skin}${hat}.`,
          `..${skin}${beard}${beard}${beard}${skin}..`,
          `..${beard}${beard}${beard}${beard}${beard}..`,
          `..${coat}${coat}${coat}${coat}${coat}..`,
          `.${coat}${coat}${coat}${coat}${coat}${coat}.`,
          `.${coat}${coat}${coat}${coat}${coat}${coat}.`,
          `..${coat}${coat}${coat}${coat}${coat}..W`,
          `...${coat}....${coat}...`,
          `...A....A...`
        ];
      }
      if (animState === 'WALK') {
        const leftLeg = walkCycle === 0 ? 'A' : '.';
        const rightLeg = walkCycle === 1 ? 'A' : '.';
        return [
          `....${hat}${hat}${hat}....`,
          `...${hat}${hat}${hat}${hat}${hat}...`,
          `..${hat}${hat}${hat}${hat}${hat}${hat}..`,
          `.${hat}${skin}${skin}${skin}${skin}${skin}${hat}.`,
          `..${skin}${beard}${beard}${beard}${skin}..`,
          `..${beard}${beard}${beard}${beard}${beard}..`,
          `..${coat}${coat}${coat}${coat}${coat}..`,
          `.${coat}${coat}${coat}${coat}${coat}${coat}.`,
          `.${coat}${coat}${coat}${coat}${coat}${coat}.`,
          `..${coat}${coat}${coat}${coat}${coat}..W`,
          `...${leftLeg}....${rightLeg}...`,
          `...A....A...`
        ];
      }
      return [
        `....${hat}${hat}${hat}....`,
        `...${hat}${hat}${hat}${hat}${hat}...`,
        `..${hat}${hat}${hat}${hat}${hat}${hat}..`,
        `.${hat}${skin}${skin}${skin}${skin}${skin}${hat}.`,
        `..${skin}${beard}${beard}${beard}${skin}..`,
        `..${beard}${beard}${beard}${beard}${beard}..`,
        `..${coat}${coat}${coat}${coat}${coat}..`,
        `.${coat}${coat}${coat}${coat}${coat}${coat}.`,
        `.${coat}${coat}${coat}${coat}${coat}${coat}.`,
        `..${coat}${coat}${coat}${coat}${coat}..W`,
        `..${coat}${coat}${coat}${coat}${coat}...`,
        `...A....A...`,
        `...A....A...`
      ];
    }
  }

  // Draw any procedurally defined sprite grid on a 2D canvas context
  drawPixelSprite(ctx, drawX, drawY, grid, pixelSize, facingLeft = false, scale = 1.0) {
    if (!grid) return;
    const cellW = pixelSize * scale;
    const gridRows = grid.length;
    const gridCols = grid[0].length;
    const halfWidth = (gridCols * cellW) / 2;

    ctx.save();
    ctx.translate(drawX, drawY);

    if (facingLeft) {
      ctx.scale(-1, 1);
      ctx.translate(-gridCols * cellW, 0);
    }

    // Color code mapping index
    const colorMap = {
      // Hair
      'H': '#5C3D2E', // Brown wood hair
      // Skin
      'O': '#FAD7A0', // Peach
      // Red
      'R': '#7A2D2D', // Burgundy
      // Gold
      'S': '#DAA520', // Warm Gold
      // Pants
      'P': '#302030', // Deep black-purple
      // Wand
      'W': '#B8860B', // Dark wood wand
      // Orange hair
      'Y': '#D4944A', // Orange hair
      // Blue
      'B': '#5A7D8A', // Muted slate blue
      // Silver beard
      'A': '#E2E6E8', // Silver
      // Wizard Hat
      'M': '#4F3A5C', // Purple Hat
      // Robes
      'U': '#684F7A'  // Purple robe
    };

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const char = grid[r][c];
        if (char !== '.' && char !== ' ') {
          ctx.fillStyle = colorMap[char] || '#FFFFFF';
          ctx.fillRect(c * cellW, r * cellW, cellW + 0.5, cellW + 0.5);
        }
      }
    }

    ctx.restore();
  }

  // Renders static high quality faces for the selection overlays
  renderPortraits() {
    const portraitCanvases = document.querySelectorAll('.char-portrait-canvas');
    portraitCanvases.forEach(canvas => {
      const charId = canvas.closest('.char-card').getAttribute('data-char');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 32, 32);

      // Procedural pixel coordinates for faces (12x12 zoom)
      // Custom matrices mapping heads only
      let headMatrix = [];
      if (charId === 'harry') {
        headMatrix = [
          '..HHHHHH..',
          '.HHHHHHHH.',
          'HHHHHHHHHH',
          'HHOOHOOHHH',
          'HOOGOGGOHH',
          'HOOOOOOOHH',
          'HHOOOOOHHH',
          '.HOSSSOHH.',
          '..RSSSRR..'
        ];
      } else if (charId === 'ron') {
        headMatrix = [
          '..YYYYYY..',
          '.YYYYYYYY.',
          'YYYYYYYYYY',
          'YYOOOOUYYY',
          'YOOOOOOOYY',
          'YOOOOOOOYY',
          'YYOOOOOYYY',
          '.YYSSSYY..',
          '..SSSSSS..'
        ];
      } else if (charId === 'hermione') {
        headMatrix = [
          '..HHHHHH..',
          '.HHHHHHHH.',
          'HHHHHHHHHH',
          'HHOOOOOHHH',
          'HOOOOOOOHH',
          'HOOOOOOOHH',
          'HHOOOOOHHH',
          '.HOSSSOHH.',
          '..BBBBBB..'
        ];
      } else if (charId === 'dumbledore') {
        headMatrix = [
          '...MMM....',
          '..MMMMM...',
          '.MMMMMMM..',
          'MMOOOOMMM.',
          'MOOGOGOMM.',
          'MOOOOOOMM.',
          'MAAAAAMM..',
          'AAAAAAA...',
          '.UUUUU....'
        ];
      }

      // Draw portrait zoomed in
      this.drawPixelSprite(ctx, 4, 3, headMatrix, 2.2, false);
    });
  }

  // ==========================================
  // PROCEDURAL WEB AUDIO SYNTH MUSIC & SFX
  // ==========================================
  initAudio() {
    if (this.audioCtx) return;
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  playCoinSound() {
    this.initAudio();
    if (!this.audioCtx) return;

    const t = this.audioCtx.currentTime;
    
    // Low chime C5 (523Hz)
    const osc1 = this.audioCtx.createOscillator();
    const gain1 = this.audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, t);
    gain1.gain.setValueAtTime(0.08, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc1.connect(gain1);
    gain1.connect(this.audioCtx.destination);
    osc1.start(t);
    osc1.stop(t + 0.09);

    // High chime G5 (784Hz) after brief offset
    setTimeout(() => {
      const t2 = this.audioCtx.currentTime;
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, t2);
      gain2.gain.setValueAtTime(0.12, t2);
      gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.25);

      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(t2);
      osc2.stop(t2 + 0.26);
    }, 60);
  }

  playJumpSound() {
    this.initAudio();
    if (!this.audioCtx) return;

    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(580, t + 0.14);
    
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  playHurtSound() {
    this.initAudio();
    if (!this.audioCtx) return;

    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.linearRampToValueAtTime(60, t + 0.2);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  playGameOverSound() {
    this.initAudio();
    if (!this.audioCtx) return;

    const t = this.audioCtx.currentTime;
    const chords = [329.63, 293.66, 261.63, 246.94]; // E4, D4, C4, B3 descending sadness
    
    chords.forEach((freq, idx) => {
      const tStart = t + idx * 0.18;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, tStart);
      gain.gain.setValueAtTime(0.08, tStart);
      gain.gain.linearRampToValueAtTime(0.001, tStart + 0.4);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(tStart);
      osc.stop(tStart + 0.45);
    });
  }

  playWinSound() {
    this.initAudio();
    if (!this.audioCtx) return;

    const t = this.audioCtx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 523.25, 783.99]; // C4, E4, G4, C5, E5, C5, G5 triumph!
    
    notes.forEach((freq, idx) => {
      const tStart = t + idx * 0.1;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, tStart);
      
      const vol = idx === notes.length - 1 ? 0.15 : 0.08;
      gain.gain.setValueAtTime(vol, tStart);
      gain.gain.exponentialRampToValueAtTime(0.001, tStart + 0.5);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(tStart);
      osc.stop(tStart + 0.55);
    });
  }

  // ==========================================
  // LEVEL BUILDER & WORLD OBJECT GENERATORS
  // ==========================================
  buildLevel() {
    this.platforms = [];
    this.coins = [];
    this.enemies = [];
    this.candles = [];
    this.sparks = [];

    // 1. Structural Platforms & Floor
    // Format: x, y, w, h, isMoving, movingRange (min, max), isVertical
    this.platforms = [
      // Floor sections with gaps
      { x: 0, y: 410, w: 580, h: 40, isMoving: false },
      { x: 670, y: 410, w: 600, h: 40, isMoving: false }, // Gap 1 at 580-670
      { x: 1370, y: 410, w: 1030, h: 40, isMoving: false }, // Gap 2 at 1270-1370

      // Grand Hall Pillars & Floating steps
      { x: 180, y: 310, w: 90, h: 16, isMoving: false },
      { x: 320, y: 220, w: 110, h: 16, isMoving: false }, // Enchanted step 1
      { x: 470, y: 150, w: 80, h: 16, isMoving: false },

      // VERTICAL MOVING STAIRCASE
      { x: 740, y: 280, w: 85, h: 16, isMoving: true, minVal: 160, maxVal: 340, speed: 1.0, isVertical: true, val: 240 },
      
      { x: 880, y: 320, w: 110, h: 16, isMoving: false },
      { x: 1040, y: 230, w: 80, h: 16, isMoving: false },

      // HORIZONTAL MOVING STAIRCASE
      { x: 1180, y: 150, w: 90, h: 16, isMoving: true, minVal: 1160, maxVal: 1340, speed: 1.2, isVertical: false, val: 1220 },

      { x: 1470, y: 320, w: 90, h: 16, isMoving: false },
      { x: 1620, y: 230, w: 120, h: 16, isMoving: false },
      { x: 1790, y: 150, w: 80, h: 16, isMoving: false },
      { x: 1940, y: 260, w: 140, h: 16, isMoving: false },

      // Final Portal base pedestal
      { x: 2180, y: 370, w: 180, h: 40, isMoving: false }
    ];

    // 2. Spinning Magical Coins (15 coins total)
    const coinPlacements = [
      { x: 220, y: 275 }, { x: 370, y: 185 }, { x: 510, y: 115 },
      { x: 625, y: 360 }, // hovering over gap 1
      { x: 780, y: 130 }, { x: 930, y: 285 }, { x: 1080, y: 195 },
      { x: 1250, y: 110 }, { x: 1320, y: 365 }, // hovering over gap 2
      { x: 1515, y: 285 }, { x: 1680, y: 195 }, { x: 1830, y: 115 },
      { x: 2010, y: 225 }, { x: 2120, y: 350 }, { x: 2210, y: 330 }
    ];
    this.coins = coinPlacements.map((pos, id) => ({
      id,
      x: pos.x,
      y: pos.y,
      width: 14,
      height: 14,
      collected: false,
      pulsePhase: Math.random() * Math.PI
    }));

    // 3. Castle Grand Hall Decorative Candles
    for (let i = 0; i < 28; i++) {
      this.candles.push({
        x: Math.random() * (this.levelWidth - 100) + 50,
        y: Math.random() * 140 + 30, // upper ceiling area
        floatPhase: Math.random() * Math.PI * 2,
        floatSpeed: Math.random() * 0.02 + 0.01
      });
    }

    // 4. Hazards & Obstacles
    // Main Dementor soul-guardians (patrol ground)
    this.enemies.push({
      type: 'dementor',
      x: 820,
      y: 370,
      width: 24,
      height: 38,
      minX: 700,
      maxX: 1180,
      speed: 1.25,
      direction: 1,
      floatPhase: 0
    });

    this.enemies.push({
      type: 'dementor',
      x: 1720,
      y: 370,
      width: 24,
      height: 38,
      minX: 1420,
      maxX: 2050,
      speed: 1.35,
      direction: -1,
      floatPhase: Math.PI / 2
    });

    // Flapping Books (Sine wave patterns in air)
    this.enemies.push({
      type: 'book',
      x: 430,
      y: 260,
      width: 22,
      height: 16,
      baseY: 260,
      minX: 300,
      maxX: 520,
      speed: 1.0,
      direction: -1,
      sinPhase: 0
    });

    this.enemies.push({
      type: 'book',
      x: 1120,
      y: 280,
      width: 22,
      height: 16,
      baseY: 280,
      minX: 1000,
      maxX: 1220,
      speed: 1.15,
      direction: 1,
      sinPhase: Math.PI
    });

    // Ghost Flames (resting on steps)
    this.enemies.push({ type: 'flame', x: 370, y: 204, width: 14, height: 16, pulsePhase: 0 });
    this.enemies.push({ type: 'flame', x: 1070, y: 214, width: 14, height: 16, pulsePhase: Math.PI/3 });
    this.enemies.push({ type: 'flame', x: 1670, y: 214, width: 14, height: 16, pulsePhase: Math.PI*2/3 });
  }

  // ==========================================
  // EVENT LISTENERS & DOM HOOKS
  // ==========================================
  setupCharacterSelect() {
    const cards = document.querySelectorAll('.char-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.selectedChar = card.getAttribute('data-char');
        this.playCoinSound(); // cute retro sound click indicator
      });
    });

    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.startGame();
      });
    }
  }

  setupEventListeners() {
    // Keyboard inputs
    window.addEventListener('keydown', (e) => {
      if (!this.active || this.state !== 'PLAY') return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        if (!this.keys.jump) {
          this.triggerPlayerJump();
        }
        this.keys.jump = true;
        this.keys.up = true;
      }

      // Prevent scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        this.keys.jump = false;
        this.keys.up = false;
      }
    });

    // Pause UI controls
    document.getElementById('game-pause-btn')?.addEventListener('click', () => this.pauseGame());
    document.getElementById('resume-game-btn')?.addEventListener('click', () => this.resumeGame());
    document.getElementById('restart-game-btn')?.addEventListener('click', () => this.restartGame());
    document.getElementById('retry-game-btn')?.addEventListener('click', () => this.restartGame());
    document.getElementById('play-again-btn')?.addEventListener('click', () => this.restartGame());
    
    // Character selection triggers
    const returnSelect = () => {
      this.state = 'SELECT';
      document.getElementById('game-pause-overlay').classList.add('hidden');
      document.getElementById('game-over-overlay').classList.add('hidden');
      document.getElementById('game-victory-overlay').classList.add('hidden');
      document.getElementById('game-char-select').classList.remove('hidden');
      document.getElementById('game-hud').classList.add('hidden');
      document.getElementById('game-touch-controls').classList.add('hidden');
      this.playCoinSound();
    };

    document.getElementById('quit-game-btn')?.addEventListener('click', returnSelect);
    document.getElementById('select-char-game-btn')?.addEventListener('click', returnSelect);
    document.getElementById('back-to-select-btn')?.addEventListener('click', returnSelect);

    // Touch Mobile controller bindings
    const handleTouch = (btnId, keyState) => {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (keyState === 'jump') {
          this.triggerPlayerJump();
        } else {
          this.keys[keyState] = true;
        }
      });
      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (keyState !== 'jump') {
          this.keys[keyState] = false;
        }
      });
    };

    handleTouch('btn-touch-left', 'left');
    handleTouch('btn-touch-right', 'right');
    handleTouch('btn-touch-jump', 'jump');
  }

  // ==========================================
  // GAME FLOW CONTROLLER
  // ==========================================
  startGame() {
    this.initAudio();
    this.active = true;
    this.state = 'PLAY';
    this.score = 0;
    this.coinsCollected = 0;
    this.gameTime = 0;

    // Apply selected hero physical configurations
    const char = this.charsConfig[this.selectedChar];
    this.player.lives = 3;
    this.player.invincibilityFrames = 0;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.x = 80;
    this.player.y = 300;
    this.player.grounded = false;
    this.player.jumpCount = 0;
    this.player.maxJumps = char.maxJumps;

    this.buildLevel();

    // Toggle HUD & Canvas screen layouts
    document.getElementById('game-char-select').classList.add('hidden');
    document.getElementById('game-hud').classList.remove('hidden');

    // Detect mobile touch interface to activate visual gamepad
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      document.getElementById('game-touch-controls').classList.remove('hidden');
    }

    this.updateHud();
    this.playWinSound(); // nice arpeggio starting queue
  }

  pauseGame() {
    if (this.state !== 'PLAY') return;
    this.state = 'PAUSE';
    document.getElementById('game-pause-overlay').classList.remove('hidden');
    this.playCoinSound();
  }

  resumeGame() {
    if (this.state !== 'PAUSE') return;
    this.state = 'PLAY';
    document.getElementById('game-pause-overlay').classList.add('hidden');
    this.playCoinSound();
  }

  restartGame() {
    document.getElementById('game-pause-overlay').classList.add('hidden');
    document.getElementById('game-over-overlay').classList.add('hidden');
    document.getElementById('game-victory-overlay').classList.add('hidden');
    this.startGame();
  }

  triggerPlayerJump() {
    const char = this.charsConfig[this.selectedChar];
    if (this.player.grounded) {
      this.player.vy = char.jumpForce;
      this.player.grounded = false;
      this.player.jumpCount = 1;
      this.playJumpSound();
      this.spawnSparkTrail(this.player.x + this.player.width/2, this.player.y + this.player.height, 8, char.colorTheme);
    } else if (this.player.jumpCount < this.player.maxJumps) {
      // Double Jump mechanics
      this.player.vy = char.jumpForce * 0.95;
      this.player.jumpCount++;
      this.playJumpSound();
      this.spawnSparkTrail(this.player.x + this.player.width/2, this.player.y + this.player.height, 12, '#DAA520');
    }
  }

  loseLife() {
    if (this.player.invincibilityFrames > 0) return;
    this.player.lives--;
    this.player.invincibilityFrames = 60; // ~1s invincibility frames
    this.playHurtSound();
    this.spawnSparkTrail(this.player.x + this.player.width/2, this.player.y + this.player.height/2, 15, '#FF4500');

    if (this.player.lives <= 0) {
      this.gameOver();
    } else {
      this.updateHud();
    }
  }

  gameOver() {
    this.state = 'GAMEOVER';
    document.getElementById('game-over-overlay').classList.remove('hidden');
    document.getElementById('game-touch-controls').classList.add('hidden');
    this.playGameOverSound();
  }

  triggerVictory() {
    this.state = 'VICTORY';
    this.active = false;
    
    // Calculate final score
    const finalScore = this.coinsCollected * 100 + Math.max(0, 1000 - Math.floor(this.gameTime / 60));
    
    document.getElementById('victory-hero-name').innerText = this.charsConfig[this.selectedChar].name;
    document.getElementById('victory-coins-count').innerText = `${this.coinsCollected} / ${this.totalCoinsInLevel}`;
    document.getElementById('victory-score').innerText = finalScore;

    document.getElementById('game-victory-overlay').classList.remove('hidden');
    document.getElementById('game-touch-controls').classList.add('hidden');
    this.playWinSound();
  }

  updateHud() {
    const livesContainer = document.getElementById('hud-lives');
    if (livesContainer) {
      livesContainer.innerHTML = '❤️'.repeat(Math.max(0, this.player.lives));
    }
    const coinsContainer = document.getElementById('hud-coins');
    if (coinsContainer) {
      coinsContainer.innerText = `${this.coinsCollected} / ${this.totalCoinsInLevel}`;
    }
  }

  // ==========================================
  // PHYSICS ENGINE & COLLISION SOLVER
  // ==========================================
  updatePhysics() {
    const char = this.charsConfig[this.selectedChar];

    // 1. Horizontal movement
    let accX = 0;
    if (this.keys.left) accX -= 0.35;
    if (this.keys.right) accX += 0.35;

    // Apply friction and cap speeds
    this.player.vx += accX;
    this.player.vx *= 0.82; // damping friction
    if (Math.abs(this.player.vx) > char.speed) {
      this.player.vx = Math.sign(this.player.vx) * char.speed;
    }

    // Facing direction
    if (this.player.vx < -0.2) this.player.facingLeft = true;
    if (this.player.vx > 0.2) this.player.facingLeft = false;

    // 2. Vertical movement (Gravity)
    this.player.vy += char.gravity;
    const maxFallSpeed = 9.5;
    if (this.player.vy > maxFallSpeed) this.player.vy = maxFallSpeed;

    // 3. Move platforms
    this.platforms.forEach(plat => {
      if (plat.isMoving) {
        plat.val += plat.speed;
        if (plat.val > plat.maxVal || plat.val < plat.minVal) {
          plat.speed = -plat.speed;
        }
        if (plat.isVertical) {
          plat.y = plat.val;
        } else {
          plat.x = plat.val;
        }
      }
    });

    // 4. Update coordinates & apply AABB collisions
    this.player.x += this.player.vx;
    this.resolvePlatformCollisions(true); // Horizontal collision solve

    this.player.y += this.player.vy;
    this.player.grounded = false;
    this.resolvePlatformCollisions(false); // Vertical collision solve

    // 5. Level Bounds
    if (this.player.x < 0) this.player.x = 0;
    if (this.player.x > this.levelWidth - this.player.width) this.player.x = this.levelWidth - this.player.width;

    // Death in Endless Pits
    if (this.player.y > 450) {
      this.loseLife();
      // Respawn at safe local coordinates if still alive
      if (this.player.lives > 0) {
        this.player.x = Math.max(80, this.player.x - 220);
        this.player.y = 150;
        this.player.vx = 0;
        this.player.vy = 0;
      }
    }

    // 6. Visual emitter mechanics (Albus Spark trails)
    if (this.selectedChar === 'dumbledore' && Math.abs(this.player.vx) > 0.5 && this.player.grounded && Math.random() < 0.2) {
      this.spawnSparkTrail(this.player.x + (this.player.facingLeft ? this.player.width : 0), this.player.y + this.player.height - 4, 1, '#DAA520');
    }

    // 7. Tick game timers
    this.gameTime++;
    if (this.player.invincibilityFrames > 0) this.player.invincibilityFrames--;
  }

  resolvePlatformCollisions(isHorizontal) {
    const px = this.player.x;
    const py = this.player.y;
    const pw = this.player.width;
    const ph = this.player.height;

    this.platforms.forEach(plat => {
      // AABB Box intersection check
      if (px + pw > plat.x && px < plat.x + plat.w &&
          py + ph > plat.y && py < plat.y + plat.h) {
        
        if (isHorizontal) {
          // Resolve X
          if (this.player.vx > 0) {
            this.player.x = plat.x - pw;
          } else if (this.player.vx < 0) {
            this.player.x = plat.x + plat.w;
          }
          this.player.vx = 0;
        } else {
          // Resolve Y
          if (this.player.vy > 0) {
            // Landing on platform top
            this.player.y = plat.y - ph;
            this.player.grounded = true;
            this.player.jumpCount = 0;
            
            // Ride moving platforms
            if (plat.isMoving && !plat.isVertical) {
              this.player.x += plat.speed;
            }
          } else if (this.player.vy < 0) {
            // Bonk head on ceiling
            this.player.y = plat.y + plat.h;
          }
          this.player.vy = 0;
        }
      }
    });
  }

  checkEntityCollisions() {
    const px = this.player.x;
    const py = this.player.y;
    const pw = this.player.width;
    const ph = this.player.height;

    // 1. Coins Collection
    this.coins.forEach(coin => {
      if (!coin.collected &&
          px + pw > coin.x && px < coin.x + coin.width &&
          py + ph > coin.y && py < coin.y + coin.height) {
        coin.collected = true;
        this.coinsCollected++;
        this.playCoinSound();
        this.spawnSparkTrail(coin.x + 7, coin.y + 7, 8, '#DAA520');
        this.updateHud();
      }
    });

    // 2. Hazard Collisions
    if (this.player.invincibilityFrames === 0) {
      this.enemies.forEach(enemy => {
        if (px + pw > enemy.x && px < enemy.x + enemy.width &&
            py + ph > enemy.y && py < enemy.y + enemy.height) {
          this.loseLife();
        }
      });
    }

    // 3. Victory Portal Check
    if (px + pw > this.exitPortal.x && px < this.exitPortal.x + this.exitPortal.width &&
        py + ph > this.exitPortal.y && py < this.exitPortal.y + this.exitPortal.height) {
      this.triggerVictory();
    }
  }

  // ==========================================
  // ENEMIES & ORNAMENT PARTICLES UPDATE
  // ==========================================
  updateEntities() {
    // 1. Dementors and Flying Books patrollers
    this.enemies.forEach(enemy => {
      if (enemy.type === 'dementor') {
        enemy.x += enemy.speed * enemy.direction;
        enemy.floatPhase += 0.05;
        enemy.y = 370 + Math.sin(enemy.floatPhase) * 6; // bobbing up and down

        if (enemy.x > enemy.maxX) {
          enemy.x = enemy.maxX;
          enemy.direction = -1;
        } else if (enemy.x < enemy.minX) {
          enemy.x = enemy.minX;
          enemy.direction = 1;
        }
      } else if (enemy.type === 'book') {
        enemy.x += enemy.speed * enemy.direction;
        enemy.sinPhase += 0.04;
        enemy.y = enemy.baseY + Math.sin(enemy.sinPhase) * 24; // flying sine wave

        if (enemy.x > enemy.maxX) {
          enemy.x = enemy.maxX;
          enemy.direction = -1;
        } else if (enemy.x < enemy.minX) {
          enemy.x = enemy.minX;
          enemy.direction = 1;
        }
      } else if (enemy.type === 'flame') {
        enemy.pulsePhase += 0.1;
      }
    });

    // 2. Sparks and debris particles
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.alpha -= 0.025;
      if (s.alpha <= 0) {
        this.sparks.splice(i, 1);
      }
    }
  }

  spawnSparkTrail(x, y, count, colorHex) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.2 + 0.8;
      this.sparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        alpha: 1.0,
        size: Math.random() * 2.5 + 1.2,
        color: colorHex
      });
    }
  }

  // ==========================================
  // RETRO CORE GRAPHICS RENDER LOOP
  // ==========================================
  draw() {
    this.ctx.clearRect(0, 0, 800, 450);

    // 1. Camera horizontal lerping
    const targetCamX = this.player.x - 300;
    this.camera.x += (targetCamX - this.camera.x) * 0.08;
    this.camera.x = Math.max(0, Math.min(this.levelWidth - 800, this.camera.x));

    this.ctx.save();
    this.ctx.translate(-this.camera.x, 0);

    // 2. Draw Sunset Gothic Windows & Castle Pillars
    this.drawCastleBackground();

    // 3. Draw exit magical portal Exit
    this.drawExitPortal();

    // 4. Draw structural platforms
    this.drawPlatforms();

    // 5. Draw decorative candles
    this.drawDecorativeCandles();

    // 6. Draw glowing magical coins
    this.drawCoins();

    // 7. Draw hazards
    this.drawHazards();

    // 8. Draw visual spark trails
    this.drawSparks();

    // 9. Draw player wizard (blink when invincible)
    if (this.player.invincibilityFrames === 0 || Math.floor(this.player.invincibilityFrames / 4) % 2 === 0) {
      const state = this.player.grounded
        ? (Math.abs(this.player.vx) > 0.4 ? 'WALK' : 'IDLE')
        : 'JUMP';
      
      const frame = Math.floor(this.gameTime / 6) % 2;
      const grid = this.getSpriteGrid(this.selectedChar, state, frame);
      
      this.drawPixelSprite(
        this.ctx,
        this.player.x - 2,
        this.player.y,
        grid,
        2.6,
        this.player.facingLeft
      );
    }

    this.ctx.restore();
  }

  drawCastleBackground() {
    // Warm deep purple-sunset backdrop gradient is already configured via CSS wrapper background
    const scrollX = this.camera.x;
    
    // Draw 3 distant sunsets in background arch windows (parallax scrolling)
    const windowInterval = 600;
    for (let i = 0; i < 5; i++) {
      const windowX = i * windowInterval + 180 - scrollX * 0.3; // Parallax
      
      // Draw Window sunset arch light glow
      const grad = this.ctx.createLinearGradient(windowX, 60, windowX, 280);
      grad.addColorStop(0, '#B83A3A'); // sunset burgundy
      grad.addColorStop(0.5, '#D4944A'); // amber orange
      grad.addColorStop(1, '#2A182A'); // deep purple base
      
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(windowX + 50, 110, 50, Math.PI, 0); // Arch top
      this.ctx.rect(windowX, 110, 100, 150);
      this.ctx.fill();

      // Window stone traceries
      this.ctx.strokeStyle = '#2b1b24';
      this.ctx.lineWidth = 4;
      this.ctx.strokeRect(windowX, 110, 100, 150);
      this.ctx.beginPath();
      this.ctx.arc(windowX + 50, 110, 50, Math.PI, 0);
      this.ctx.stroke();

      // Vertical glass panes
      this.ctx.strokeStyle = 'rgba(43,27,36,0.3)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(windowX + 50, 60);
      this.ctx.lineTo(windowX + 50, 260);
      this.ctx.moveTo(windowX + 25, 110);
      this.ctx.lineTo(windowX + 25, 260);
      this.ctx.moveTo(windowX + 75, 110);
      this.ctx.lineTo(windowX + 75, 260);
      this.ctx.stroke();
    }

    // Distant dark stone pillars
    for (let i = 0; i < 8; i++) {
      const pillarX = i * 400 + 100 - scrollX * 0.55;
      this.ctx.fillStyle = 'rgba(40, 26, 36, 0.45)';
      this.ctx.fillRect(pillarX, 0, 45, 410);
    }
  }

  drawPlatforms() {
    this.platforms.forEach(plat => {
      // Wood base plate with a gold ornamental pixelated trim
      this.ctx.fillStyle = '#5C3D2E'; // Wood brown
      this.ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

      // Gold top border
      this.ctx.fillStyle = '#B8860B';
      this.ctx.fillRect(plat.x, plat.y, plat.w, 3);

      // Brick texturing blocks
      this.ctx.fillStyle = '#452A1E'; // Dark brown blocks
      const brickW = 40;
      for (let bx = 0; bx < plat.w; bx += brickW) {
        this.ctx.fillRect(plat.x + bx, plat.y + 6, 2, plat.h - 8);
        this.ctx.fillRect(plat.x + bx + 12, plat.y + 12, 16, 2);
      }
    });
  }

  drawDecorativeCandles() {
    this.candles.forEach(cand => {
      cand.floatPhase += cand.floatSpeed;
      const floatOffset = Math.sin(cand.floatPhase) * 6;
      const cy = cand.y + floatOffset;

      // Candle glowing flame aura
      const grad = this.ctx.createRadialGradient(cand.x + 3, cy - 2, 0, cand.x + 3, cy - 2, 16);
      grad.addColorStop(0, 'rgba(212, 148, 74, 0.8)');
      grad.addColorStop(0.5, 'rgba(218, 165, 32, 0.25)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(cand.x + 3, cy - 2, 16, 0, Math.PI * 2);
      this.ctx.fill();

      // Flame center
      this.ctx.fillStyle = '#FFA500';
      this.ctx.beginPath();
      this.ctx.ellipse(cand.x + 3, cy - 1, 1.8, 3.2, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Wax body
      this.ctx.fillStyle = '#FDF8F0';
      this.ctx.fillRect(cand.x, cy + 2, 6, 12);

      // Wax drips
      this.ctx.fillStyle = '#FAF3E8';
      this.ctx.fillRect(cand.x - 1, cy + 2, 1, 3);
      this.ctx.fillRect(cand.x + 2, cy + 4, 1, 4);
    });
  }

  drawCoins() {
    this.coins.forEach(coin => {
      if (coin.collected) return;

      coin.pulsePhase += 0.05;
      const spinScale = Math.sin(coin.pulsePhase);
      const cx = coin.x + 7;
      const cy = coin.y + 7;

      // Glow halo
      const grad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, 14);
      grad.addColorStop(0, 'rgba(218, 165, 32, 0.45)');
      grad.addColorStop(0.6, 'rgba(218, 165, 32, 0.1)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      this.ctx.fill();

      // Drawing spinning coin
      this.ctx.save();
      this.ctx.translate(cx, cy);
      this.ctx.scale(spinScale, 1.0);

      this.ctx.fillStyle = '#DAA520'; // Bright Gold
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 6, 0, Math.PI * 2);
      this.ctx.fill();

      // Core details
      this.ctx.fillStyle = '#FFF0C8';
      this.ctx.beginPath();
      this.ctx.arc(-1, -1, 1.5, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    });
  }

  drawHazards() {
    this.enemies.forEach(enemy => {
      if (enemy.type === 'dementor') {
        // Pixel soul guardian patroller
        // Legend:
        // C = Cloak (black-blue)
        // E = Eyes (cyan glow)
        // P = Puffs (smoke grey)
        const dementorGrid = [
          '....CCCC....',
          '...CCCCCC...',
          '..CCECCECC..',
          '..CCCCCCCC..',
          '..CCCCCCCC..',
          '...CCCCCC...',
          '....CCCC....',
          '...CCCCCC...',
          '..C.CCCC.C..',
          '.C..CCCC..C.',
          '....C..C....',
          '....C..C....'
        ];
        
        const cMap = {
          'C': '#362D3D', // Dark mystical purple
          'E': '#00FFFF', // Glowing cyan eyes
          'P': '#5A4A3A'
        };

        const facingLeft = enemy.direction === -1;
        this.ctx.save();
        this.ctx.translate(enemy.x, enemy.y);
        if (facingLeft) {
          this.ctx.scale(-1, 1);
          this.ctx.translate(-24, 0);
        }
        
        // Draw floaty cloak lines
        for (let r = 0; r < 12; r++) {
          for (let c = 0; c < 12; c++) {
            const char = dementorGrid[r][c];
            if (char !== '.') {
              this.ctx.fillStyle = cMap[char];
              this.ctx.fillRect(c * 2, r * 3, 2, 3);
            }
          }
        }
        this.ctx.restore();

      } else if (enemy.type === 'book') {
        // Flapping magical spelling book patroller
        const pageFlap = Math.sin(enemy.sinPhase * 2.5) * 6;
        this.ctx.save();
        this.ctx.translate(enemy.x + 11, enemy.y + 8);
        this.ctx.rotate(enemy.direction * 0.1);

        // Brown Book Spine
        this.ctx.fillStyle = '#7A2D2D'; // burgundy leather cover
        this.ctx.fillRect(-2, -8, 4, 16);

        // Flapping white pages
        this.ctx.fillStyle = '#FFFFFF';
        // Left Page
        this.ctx.beginPath();
        this.ctx.moveTo(0, -7);
        this.ctx.lineTo(-9, -6 + pageFlap);
        this.ctx.lineTo(-9, 6 + pageFlap);
        this.ctx.lineTo(0, 7);
        this.ctx.closePath();
        this.ctx.fill();

        // Right Page
        this.ctx.beginPath();
        this.ctx.moveTo(0, -7);
        this.ctx.lineTo(9, -6 + pageFlap);
        this.ctx.lineTo(9, 6 + pageFlap);
        this.ctx.lineTo(0, 7);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.restore();

      } else if (enemy.type === 'flame') {
        // Static ghost flame resters on platforms
        const scale = 1.0 + Math.sin(enemy.pulsePhase) * 0.15;
        this.ctx.save();
        this.ctx.translate(enemy.x + 7, enemy.y + 8);
        this.ctx.scale(scale, scale);

        // Blue glow aura
        const grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 12);
        grad.addColorStop(0, 'rgba(0, 191, 255, 0.7)');
        grad.addColorStop(0.5, 'rgba(0, 0, 255, 0.25)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 12, 0, Math.PI * 2);
        this.ctx.fill();

        // Flame pixels
        this.ctx.fillStyle = '#00BFFF';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -7);
        this.ctx.quadraticCurveTo(-4, -2, -4, 4);
        this.ctx.quadraticCurveTo(0, 7, 4, 4);
        this.ctx.quadraticCurveTo(4, -2, 0, -7);
        this.ctx.fill();

        // Core
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 2, 1.5, 3.5, 0, 0, Math.PI*2);
        this.ctx.fill();

        this.ctx.restore();
      }
    });
  }

  drawExitPortal() {
    const px = this.exitPortal.x;
    const py = this.exitPortal.y;
    const pw = this.exitPortal.width;
    const ph = this.exitPortal.height;

    // Glowing swirling exit galaxy door
    const swirlPhase = this.gameTime * 0.05;
    
    // Core swirls
    const grad = this.ctx.createRadialGradient(px + pw/2, py + ph/2, 0, px + pw/2, py + ph/2, pw);
    grad.addColorStop(0, '#DAA520'); // glowing exit gold core
    grad.addColorStop(0.4, '#7A2D2D'); // swirling burgundy
    grad.addColorStop(0.8, '#362D3D'); // dark purple boundaries
    grad.addColorStop(1, 'rgba(0,0,0,0.85)');

    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.ellipse(px + pw/2, py + ph/2, pw/2, ph/2, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Swirling spark particles
    this.ctx.strokeStyle = 'rgba(218, 165, 32, 0.35)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.ellipse(px + pw/2, py + ph/2, pw/3, ph/3, swirlPhase, 0, Math.PI * 2);
    this.ctx.stroke();

    // Portal ornate stone columns frames
    this.ctx.strokeStyle = '#B8860B';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.ellipse(px + pw/2, py + ph/2, pw/2, ph/2, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    // Arch pillars decorations
    this.ctx.fillStyle = '#5C3D2E';
    this.ctx.fillRect(px - 6, py + ph - 8, 8, 12);
    this.ctx.fillRect(px + pw - 2, py + ph - 8, 8, 12);
  }

  drawSparks() {
    this.sparks.forEach(s => {
      this.ctx.fillStyle = s.color;
      this.ctx.globalAlpha = s.alpha;
      this.ctx.fillRect(s.x, s.y, s.size, s.size);
    });
    this.ctx.globalAlpha = 1.0; // reset
  }

  // ==========================================
  // STATIC CHARACTER SELECTION SCREEN ANIMATOR
  // ==========================================
  animateSelectionBackdrop() {
    if (this.state !== 'SELECT') return;

    this.ctx.clearRect(0, 0, 800, 450);

    // Render a gorgeous stationary scenic library backdrop inside grand selection overlays
    const grad = this.ctx.createLinearGradient(400, 0, 400, 450);
    grad.addColorStop(0, '#2e1824'); // Sunset burgundy sky
    grad.addColorStop(0.5, '#4a2530'); 
    grad.addColorStop(1, '#1e141a');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, 800, 450);

    // DISTANT BACKGROUND ARCH WINDOW
    const wX = 350;
    const wGrad = this.ctx.createLinearGradient(wX, 80, wX, 320);
    wGrad.addColorStop(0, '#B83A3A'); 
    wGrad.addColorStop(0.5, '#D4944A');
    wGrad.addColorStop(1, '#2A182A');
    this.ctx.fillStyle = wGrad;
    this.ctx.beginPath();
    this.ctx.arc(wX + 50, 130, 50, Math.PI, 0); 
    this.ctx.rect(wX, 130, 100, 190);
    this.ctx.fill();

    // Windows stroke
    this.ctx.strokeStyle = '#1e141a';
    this.ctx.lineWidth = 6;
    this.ctx.beginPath();
    this.ctx.arc(wX + 50, 130, 50, Math.PI, 0);
    this.ctx.rect(wX, 130, 100, 190);
    this.ctx.stroke();

    // Floor base board
    this.ctx.fillStyle = '#5C3D2E';
    this.ctx.fillRect(0, 360, 800, 90);
    this.ctx.fillStyle = '#B8860B';
    this.ctx.fillRect(0, 360, 800, 3);

    // Floating candles in select screen!
    const selectCandles = [
      { x: 120, y: 150, phase: 0 },
      { x: 240, y: 100, phase: Math.PI/3 },
      { x: 560, y: 120, phase: Math.PI*2/3 },
      { x: 680, y: 160, phase: Math.PI }
    ];

    const t = Date.now() * 0.003;
    selectCandles.forEach(cand => {
      const cy = cand.y + Math.sin(t + cand.phase) * 6;
      
      const flameGrad = this.ctx.createRadialGradient(cand.x + 3, cy - 2, 0, cand.x + 3, cy - 2, 14);
      flameGrad.addColorStop(0, 'rgba(212, 148, 74, 0.7)');
      flameGrad.addColorStop(0.6, 'rgba(218, 165, 32, 0.15)');
      flameGrad.addColorStop(1, 'rgba(0,0,0,0)');
      this.ctx.fillStyle = flameGrad;
      this.ctx.beginPath();
      this.ctx.arc(cand.x + 3, cy - 2, 14, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#FDF8F0';
      this.ctx.fillRect(cand.x, cy + 2, 6, 12);
    });

    // Subtitle watermark select header
    this.ctx.font = '24px "Playfair Display", Georgia, serif';
    this.ctx.fillStyle = 'rgba(218, 165, 32, 0.05)';
    this.ctx.textAlign = 'center';
    this.ctx.fillText("MAGIC HALL ADVENTURE", 400, 240);

    requestAnimationFrame(() => this.animateSelectionBackdrop());
  }

  // ==========================================
  // CORE RUNNER TICK
  // ==========================================
  tick() {
    if (!this.active) return;

    if (this.state === 'PLAY') {
      this.updatePhysics();
      this.checkEntityCollisions();
      this.updateEntities();
      this.draw();
    }

    requestAnimationFrame(() => this.tick());
  }
}

// Instantiate and hook Mini Game on DOM content ready
window.addEventListener('DOMContentLoaded', () => {
  const game = new MagicHallGame();
  game.init();

  // Expose game start listener loops
  const startBtn = document.getElementById('start-game-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      game.tick();
    });
  }

  // Handle Pause Resume click states on overlay keys
  document.getElementById('quit-game-btn')?.addEventListener('click', () => {
    game.animateSelectionBackdrop();
  });
  document.getElementById('select-char-game-btn')?.addEventListener('click', () => {
    game.animateSelectionBackdrop();
  });
  document.getElementById('back-to-select-btn')?.addEventListener('click', () => {
    game.animateSelectionBackdrop();
  });
});
