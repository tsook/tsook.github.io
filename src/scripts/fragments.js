// ============================================
// fragments.js — Severance-Inspired Living Grid
// Constant drift, breathing, gravity wells,
// disentanglement, cursor attraction, paper mode
// ============================================

// ── Configuration ──────────────────────────────

const CONFIG = {
  inkColor: '#1F2933', // Deep Graphite
  paperColor: '#F2F4F6', // Cool Pale Grey

  // Grid — dense, Severance/Lumon-style
  fragmentCount: 200,
  gridCellW: 70,
  gridCellH: 40,
  gridFillRatio: 0.85,

  // Size tiers — uniform font size, depth via opacity
  tiers: {
    small: { fontSize: [10, 11], opacity: [0.10, 0.25], weight: 0.35 },
    medium: { fontSize: [10, 12], opacity: [0.25, 0.50], weight: 0.35 },
    large: { fontSize: [11, 12], opacity: [0.50, 0.80], weight: 0.30 },
  },

  // Physics — strict grid lock
  springStiffness: 0.08,
  damping: 0.85,

  // Constant ambient drift (Brownian)
  driftStrength: 0.06,
  driftInterval: [0.05, 0.25],

  // Collision avoidance — minimal, rely on grid springs
  separationRadius: 50,
  separationStrength: 0.1,

  // Breathing
  breathAmpRange: [0.02, 0.08],
  breathFreqRange: [0.2, 0.7],

  // Cursor — Lumon bulge effect (ball pushing on fabric)
  cursorRadius: 130,
  cursorPushStrength: 55,
  cursorScaleBoost: 0.7,      // max scale increase at cursor center
  cursorOpacityBoost: 0.4,    // max opacity increase at cursor center
  cursorHoldTime: 1.8,        // seconds before hold triggers merge
  cursorClickDisentangle: true,

  // Neighbor Merges
  mergeInterval: [2.0, 10.0], // Wide range, infrequent for calm feel
  mergeDistance: 120, // Search radius
  mergeDuration: 2.0, // Animation time
  connectionLineDuration: 2.5, // Line persistence

  // Disentanglement
  disentangleInterval: [4, 14], // Wide range, infrequent
  disentangleBurstForce: 0.8,
  disentangleRippleDuration: 0.6,
  disentangleSplitDuration: 0.5,
  windUpDuration: 0.5, // Shake before split

  // Particles
  particleCount: 6,
  // Physics
  springStiffness: 0.04,
  springDamping: 0.15,
  separationRadius: 56,
  separationStrength: 0.5,
  maxSpeed: 8,

  // Glitch
  glitchProbability: 0.002,

  // Cloud dither — Bayer 8×8 ordered dither over a vortex-swirl brightness field.
  // Three animated vortex centers rotate coordinate space, layered with domain warp
  // and directional FBM bands to produce organic swirling cloud / wave patterns.
  cloudDither: {
    step: 3,              // dot grid spacing (px)
    dotSize: 1.5,         // dot size (px)
    // Opacity scales with brightness: low wave → faint dots, high wave → opaque dots
    alphaLow: 0.04,       // dot opacity at brightness floor
    alphaHigh: 0.28,      // dot opacity at full brightness
    waveFloor: 0.28,      // brightness below this → zero dots (hard trough cutoff)

    // Vortex swirl — 3 centers orbit the canvas in slow ellipses
    vortexSpeed: 0.07,
    vortexStrength: 1.8,
    vortexSizeScale: 0.38,

    // Domain warp — 3 counter-rotating layers for chaotic, organic motion
    warpAmp: 90, warpFreq: 0.006, warpSpeed: 0.20,
    warpAmp2: 55, warpFreq2: 0.013, warpSpeed2: -0.15,
    warpAmp3: 28, warpFreq3: 0.026, warpSpeed3: 0.09, // high-freq chaos layer

    // Turbulence FBM — 1−|sin| per octave gives wispy filament edges
    fbmOctaves: 6,
    fbmBaseFreq: 0.0038,  // base spatial frequency
    fbmLacunarity: 2.05,  // frequency multiplier per octave
    fbmGain: 0.52,        // amplitude multiplier per octave
    // Per-octave direction vectors + time speeds (spread across angles for variety)
    fbmDirs: [
      { ax: 0.809, ay: 0.588, speed: 0.17 },
      { ax: -0.588, ay: 0.809, speed: -0.11 },
      { ax: 0.309, ay: -0.951, speed: 0.08 },
      { ax: 0.951, ay: 0.309, speed: -0.14 },
      { ax: -0.809, ay: 0.588, speed: 0.06 },
      { ax: 0.000, ay: 1.000, speed: -0.09 },
    ],
  },

  // Flash / scramble durations
  flashDuration: 0.4,
  scrambleDuration: 0.5,

  // Merged glow duration
  mergedGlowDuration: 3.0,

};

// ── Character sets ─────────────────────────────

const NOISE_CHARS = '░▒▓█│─┌┐└┘├┤┬┴┼·∙';
const GLITCH_CHARS = '!@#$%^&*<>{}[]|\\/?~₿∆Ω∑∏λ';

const FONT_VARIANTS = [
  'GeistPixelSquare', 'GeistPixelGrid', 'GeistPixelCircle',
  'GeistPixelTriangle', 'GeistPixelLine',
];

const GLITCH_TYPES = { NONE: 0, CHAR_SWAP: 1, FONT_FLICKER: 2, SCRAMBLE: 3, SHIFT: 4 };
const TIER_NAMES = ['small', 'medium', 'large'];

// ── Utility ────────────────────────────────────

function lerp(a, b, t) { return a + (b - a) * t; }
function random(min, max) { return Math.random() * (max - min) + min; }
function randomInt(min, max) { return Math.floor(random(min, max + 1)); }
function dist(x1, y1, x2, y2) { return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2); }
function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomChar(cs) { return cs[Math.floor(Math.random() * cs.length)]; }

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickTier() {
  const r = Math.random();
  if (r < CONFIG.tiers.small.weight) return 'small';
  if (r < CONFIG.tiers.small.weight + CONFIG.tiers.medium.weight) return 'medium';
  return 'large';
}

function gridToWorld(col, row) {
  return {
    x: col * CONFIG.gridCellW + CONFIG.gridCellW / 2,
    y: row * CONFIG.gridCellH + CONFIG.gridCellH / 2,
  };
}


// ── Fragment ───────────────────────────────────

class Fragment {
  constructor(text, col, row, sizeTier, fontSize, baseOpacity) {
    this.text = text;
    this.originalText = text;
    this.displayText = text;
    this.sizeTier = sizeTier;
    this.fontSize = fontSize;
    this.baseOpacity = baseOpacity;
    this.opacity = 0;
    this.targetOpacity = baseOpacity;
    this.visible = true;

    const pos = gridToWorld(col, row);
    this.homeX = pos.x;
    this.homeY = pos.y;
    this.x = pos.x;
    this.y = pos.y;

    // Paper animation compatibility
    this.targetX = pos.x;
    this.targetY = pos.y;

    // Physics
    this.vx = 0;
    this.vy = 0;
    this.springHome = true;

    // Constant ambient drift
    this.driftTimer = random(CONFIG.driftInterval[0], CONFIG.driftInterval[1]);

    // Breathing
    this.breathPhase = random(0, Math.PI * 2);
    this.breathFreq = random(CONFIG.breathFreqRange[0], CONFIG.breathFreqRange[1]);
    this.breathAmp = random(CONFIG.breathAmpRange[0], CONFIG.breathAmpRange[1]);

    // Merge state
    this.isMerged = false;
    this.mergedTimer = 0;

    // Visual effects
    this.rotation = random(-0.02, 0.02);
    this.flashTimer = 0;

    // Glitch state
    this.glitchType = GLITCH_TYPES.NONE;
    this.glitchTimer = 0;
    this.glitchDuration = 0;
    this.displayFont = 0;
    this.shiftX = 0;
    this.scrambleProgress = 0;

    // Paper mode flag
    this.paperMode = false;
    this.shaking = false;
    this.active = true;

    // Cursor Lumon influence (0–1)
    this.cursorInfluence = 0;

    // Gradual setup
    this.startDelay = 0;
  }

  setHome(col, row) {
    const pos = gridToWorld(col, row);
    this.homeX = pos.x;
    this.homeY = pos.y;
  }

  setText(t) {
    this.text = t;
    this.originalText = t;
    this.displayText = t;
  }

  getCenter() {
    const charW = this.fontSize * 0.6;
    return {
      x: this.x + (this.displayText.length * charW) / 2,
      y: this.y - this.fontSize / 3,
    };
  }

  update(dt, time) {
    if (this.paperMode) {
      this.x = lerp(this.x, this.targetX, 0.06);
      this.y = lerp(this.y, this.targetY, 0.06);
      this.opacity = lerp(this.opacity, this.targetOpacity, 0.04);
      if (this.flashTimer > 0) this.flashTimer -= dt;
      this.updateGlitch(dt);
      return;
    }

    // Gradual appearance (check startDelay)
    if (this.startDelay > 0) {
      this.startDelay -= dt;
      // Keep opacity at 0 until delay is over
      this.opacity = 0;
      if (this.startDelay > 0) return;
    }

    // Constant drift — gentle Brownian impulses
    this.driftTimer -= dt;
    if (this.driftTimer <= 0) {
      this.vx += random(-CONFIG.driftStrength, CONFIG.driftStrength);
      this.vy += random(-CONFIG.driftStrength, CONFIG.driftStrength);
      this.driftTimer = random(CONFIG.driftInterval[0], CONFIG.driftInterval[1]);
    }

    // Spring-to-home
    if (this.springHome) {
      const dx = this.homeX - this.x;
      const dy = this.homeY - this.y;
      this.vx += dx * CONFIG.springStiffness;
      this.vy += dy * CONFIG.springStiffness;
    }

    // Damping
    this.vx *= CONFIG.damping;
    this.vy *= CONFIG.damping;

    // Integrate
    this.x += this.vx;
    this.y += this.vy;

    // Speed limit
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > CONFIG.maxSpeed) {
      this.vx = (this.vx / speed) * CONFIG.maxSpeed;
      this.vy = (this.vy / speed) * CONFIG.maxSpeed;
    }

    // Breathing opacity
    const breathOffset = Math.sin(time * this.breathFreq * Math.PI * 2 + this.breathPhase) * this.breathAmp;
    this.opacity = lerp(this.opacity, this.targetOpacity + breathOffset, 0.04);
    this.opacity = Math.max(0, Math.min(1, this.opacity));

    // Timers
    if (this.mergedTimer > 0) this.mergedTimer -= dt;
    if (this.flashTimer > 0) this.flashTimer -= dt;

    this.updateGlitch(dt);

    if (this.shaking) {
      this.params = this.params || { shakeX: 0, shakeY: 0 };
      this.params.shakeX = random(-2, 2);
      this.params.shakeY = random(-2, 2);
    } else if (this.params) {
      this.params.shakeX = 0;
      this.params.shakeY = 0;
    }
  }

  applyOrganicBounds(w, h, leftOffset = 0) {
    const padding = 60; // Soft cushion zone width
    const softLeftBound = leftOffset + padding;

    if (this.x < softLeftBound) {
      const depth = softLeftBound - this.x;
      // Exponential repulsion force pushing right (weaker so they can drift out)
      this.vx += (depth * depth) * 0.0001;
      // Fade out as it goes deeper into the padding zone
      this.edgeFade = Math.max(0, 1 - (depth / padding));
    } else {
      this.edgeFade = 1;
    }

    // Return true if fragment has drifted completely out of bounds and should be deleted/recycled
    return (this.x < leftOffset || this.x > w + 100 || this.y < -100 || this.y > h + 100);
  }

  recycle(system) {
    // Pick a new home on the right
    const cols = system.gridCols;
    const rows = system.gridRows;
    const leftCol = system.leftGridCol || Math.floor(cols * 0.4);
    const rightCols = Math.max(1, cols - leftCol);

    // Spawn somewhere in the right area
    const col = Math.max(1, leftCol - 1) + Math.floor(Math.random() * Math.max(1, rightCols));
    const row = Math.floor(Math.random() * rows);

    this.setHome(col, row);

    // Instantly move there
    this.x = this.homeX + random(-6, 6);
    this.y = this.homeY + random(-4, 4);
    this.vx = 0;
    this.vy = 0;

    // Reset visuals
    this.opacity = 0;
    this.edgeFade = 1;
    this.startDelay = random(0.5, 2.0); // Wait a bit before fading in
    this.setText(system.mergeEngine.randomWord());
    this.isMerged = false;
    this.mergedTimer = 0;
    this.shaking = false;

    this.resolveGlitch();
    this.flashTimer = 0;
    this.cursorInfluence = 0;
  }

  // ── Glitch effects ──

  updateGlitch(dt) {
    if (this.glitchType !== GLITCH_TYPES.NONE) {
      this.glitchTimer -= dt;
      if (this.glitchTimer <= 0) { this.resolveGlitch(); return; }
      if (this.glitchType === GLITCH_TYPES.CHAR_SWAP && Math.random() < 0.3) {
        this.displayText = this.swapChars(this.originalText, randomInt(1, 3));
      } else if (this.glitchType === GLITCH_TYPES.SCRAMBLE) {
        this.scrambleProgress += dt * 2;
        const rev = Math.floor(this.scrambleProgress * this.originalText.length);
        this.displayText = this.originalText.slice(0, rev) +
          this.scrambleStr(this.originalText.slice(rev));
      }
    } else if (Math.random() < CONFIG.glitchProbability) {
      this.triggerGlitch();
    }
  }

  triggerGlitch() {
    const type = randomChoice([1, 1, 2, 3, 4]);
    this.glitchType = type;
    switch (type) {
      case GLITCH_TYPES.CHAR_SWAP:
        this.glitchDuration = random(0.05, 0.15);
        this.displayText = this.swapChars(this.originalText, randomInt(1, 3));
        break;
      case GLITCH_TYPES.FONT_FLICKER:
        this.glitchDuration = random(0.03, 0.08);
        this.displayFont = randomInt(1, FONT_VARIANTS.length - 1);
        break;
      case GLITCH_TYPES.SCRAMBLE:
        this.glitchDuration = random(0.3, 0.8);
        this.scrambleProgress = 0;
        this.displayText = this.scrambleStr(this.originalText);
        break;
      case GLITCH_TYPES.SHIFT:
        this.glitchDuration = random(0.05, 0.12);
        this.shiftX = random(-5, 5);
        break;
    }
    this.glitchTimer = this.glitchDuration;
  }

  triggerScrambleEffect(dur) {
    this.glitchType = GLITCH_TYPES.SCRAMBLE;
    this.glitchDuration = dur || CONFIG.scrambleDuration;
    this.glitchTimer = this.glitchDuration;
    this.scrambleProgress = 0;
    this.displayText = this.scrambleStr(this.originalText);
  }

  resolveGlitch() {
    this.glitchType = GLITCH_TYPES.NONE;
    this.displayText = this.originalText;
    this.displayFont = 0;
    this.shiftX = 0;
  }

  swapChars(text, count) {
    const c = text.split('');
    for (let i = 0; i < count && i < c.length; i++)
      c[randomInt(0, c.length - 1)] = randomChar(NOISE_CHARS + GLITCH_CHARS);
    return c.join('');
  }

  scrambleStr(text) {
    return text.split('').map(() => randomChar(NOISE_CHARS + GLITCH_CHARS)).join('');
  }

  render(ctx) {
    if (!this.active || (!this.visible && this.opacity < 0.01)) return;
    let alpha = this.opacity;
    let scale = 1;
    if (this.flashTimer > 0) {
      const f = this.flashTimer / CONFIG.flashDuration;
      alpha = Math.min(1, alpha + f * 0.5);
      scale = 1 + f * 0.15;
    }
    if (this.isMerged && this.mergedTimer > 0) {
      alpha = Math.min(1, alpha + 0.1);
    }
    // Cursor Lumon effect — words rise toward viewer near cursor
    if (this.cursorInfluence > 0.01) {
      scale *= 1 + this.cursorInfluence * CONFIG.cursorScaleBoost;
      alpha = Math.min(1, alpha + this.cursorInfluence * CONFIG.cursorOpacityBoost);
    }

    // Apply organic edge fade LAST so hovering doesn't reveal the hidden boundary
    if (this.edgeFade !== undefined) {
      alpha *= this.edgeFade;
    }
    const variant = FONT_VARIANTS[this.displayFont] || FONT_VARIANTS[0];
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(this.x + this.shiftX + (this.params ? this.params.shakeX : 0), this.y + (this.params ? this.params.shakeY : 0));
    ctx.rotate(this.rotation);
    if (scale !== 1) ctx.scale(scale, scale);
    ctx.font = `${this.fontSize}px ${variant}, monospace`;
    ctx.fillStyle = CONFIG.inkColor;
    ctx.fillText(this.displayText, 0, 0);
    // Merged underline
    if (this.isMerged && this.mergedTimer > 0) {
      const tw = ctx.measureText(this.displayText).width;
      ctx.globalAlpha = alpha * 0.5;
      ctx.fillRect(0, 4, tw, 1);
    }
    ctx.restore();
  }
}


// ── Scanline ───────────────────────────────────

class Scanline {
  constructor(h) {
    this.y = random(0, h);
    this.speed = random(15, 50);
    this.thickness = random(1, 3);
    this.opacity = random(0.02, 0.05);
    this.shiftAmount = random(-6, 6);
    this.h = h;
  }

  update(dt) {
    this.y += this.speed * dt;
    if (this.y > this.h + 10) {
      this.y = -10;
      this.speed = random(15, 50);
      this.opacity = random(0.02, 0.05);
      this.shiftAmount = random(-6, 6);
    }
  }

  render(ctx, w) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = CONFIG.inkColor;
    ctx.fillRect(0, this.y, w, this.thickness);
    ctx.restore();
  }

  isInBand(y) {
    return y >= this.y - 8 && y <= this.y + this.thickness + 8;
  }
}


// ── MergeEngine ────────────────────────────────

class MergeEngine {
  constructor(mergeRules, splitRules, wordPool) {
    this.mergeMap = new Map();
    for (const [key, val] of Object.entries(mergeRules || {})) {
      this.mergeMap.set(key, val);
      const parts = key.split('+');
      if (parts.length === 2) this.mergeMap.set(parts[1] + '+' + parts[0], val);
    }
    this.splitMap = new Map(Object.entries(splitRules || {}));
    this.wordPool = wordPool || [];
  }

  tryMerge(a, b) {
    return this.mergeMap.get(a + '+' + b) || null;
  }

  trySplit(text) {
    const parts = this.splitMap.get(text);
    if (!parts) return null;
    // Filter: only accept splits where every part is a real word (>= 3 chars)
    // This avoids suffixes like "ization", "ation", "ual", "ing", "ive", etc.
    const allReal = parts.every(p => p.length >= 3 && !this.isSuffix(p));
    if (allReal) return parts;
    // Fallback: return two random words from pool instead
    return [randomChoice(this.wordPool), randomChoice(this.wordPool)];
  }

  isSuffix(word) {
    const suffixes = ['ation', 'tion', 'sion', 'ment', 'ness', 'ity', 'ize',
      'ization', 'ual', 'ive', 'ing', 'ence', 'ance', 'able', 'ible', 'ous',
      'ful', 'less', 'ly', 'er', 'or', 'ist', 'ism', 'al', 'ial'];
    return suffixes.includes(word.toLowerCase());
  }

  randomWord() {
    return randomChoice(this.wordPool);
  }
}


// ── FlashLine (merge/split visual) ─────────────

class FlashLine {
  constructor(x1, y1, x2, y2, dur, fragA, fragB, persistent = false) {
    this.x1 = x1; this.y1 = y1; this.x2 = x2; this.y2 = y2;
    this.fragA = fragA || null;
    this.fragB = fragB || null;
    this.timer = dur; this.duration = dur;
    this.persistent = persistent;
  }

  update(dt) {
    if (!this.persistent) this.timer -= dt;
    // Track fragment centers if linked
    if (this.fragA) {
      const c = this.fragA.getCenter();
      this.x1 = c.x; this.y1 = c.y;
    }
    if (this.fragB) {
      const c = this.fragB.getCenter();
      this.x2 = c.x; this.y2 = c.y;
    }
    return this.persistent || this.timer > 0;
  }

  render(ctx) {
    const dx = this.x2 - this.x1, dy = this.y2 - this.y1;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < 3) return; // Skip when points overlap

    const f = this.persistent ? 1.0 : this.timer / this.duration;
    ctx.save();
    ctx.strokeStyle = CONFIG.inkColor;
    ctx.globalAlpha = f * 0.25;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    ctx.lineTo(this.x2, this.y2);
    ctx.stroke();
    ctx.restore();
  }
}


// ── Gravity Well ───────────────────────────────

class GravityWell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = CONFIG.wellRadius;
    this.strength = CONFIG.wellStrength;
    this.timer = CONFIG.wellDuration;
    this.duration = CONFIG.wellDuration;
    this.active = true;
    this.mergeAttempted = false;
  }

  update(dt) {
    this.timer -= dt;
    if (this.timer <= 0) this.active = false;
    return this.active;
  }

  applyForce(frag) {
    const dx = this.x - frag.x;
    const dy = this.y - frag.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > this.radius || d < 1) return;

    const progress = 1 - this.timer / this.duration;
    const ramp = Math.min(1, progress * 3);
    const falloff = 1 - (d / this.radius);
    const force = this.strength * falloff * falloff * ramp;
    frag.vx += (dx / d) * force;
    frag.vy += (dy / d) * force;
  }

  render(ctx) {
    const progress = 1 - this.timer / this.duration;
    const ringRadius = this.radius * 0.3 * progress;
    const alpha = 0.04 * (1 - progress);
    if (alpha < 0.005) return;
    ctx.save();
    ctx.strokeStyle = CONFIG.inkColor;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}


// ── Particle Trail ─────────────────────────────

class ParticleTrail {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.timer = CONFIG.particleFadeDuration;
    this.duration = CONFIG.particleFadeDuration;
    this.size = random(1, 2);
  }

  update(dt) {
    this.vx *= 0.95;
    this.vy *= 0.95;
    this.x += this.vx;
    this.y += this.vy;
    this.timer -= dt;
    return this.timer > 0;
  }

  render(ctx) {
    const alpha = (this.timer / this.duration) * 0.3;
    if (alpha < 0.01) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = CONFIG.inkColor;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.restore();
  }
}


// ── Disentanglement Event ──────────────────────

class DisentanglementEvent {
  constructor(fragment, newWords, system) {
    this.fragment = fragment;
    this.newWords = newWords;  // array of replacement word strings
    this.system = system;
    this.phase = 0;  // 0=windUp+ripple, 1=split+burst, 2=done
    this.timer = CONFIG.windUpDuration;
    this.rippleRadius = 0;
    this.active = true;

    // Start shaking
    this.fragment.shaking = true;
  }

  update(dt) {
    this.timer -= dt;
    if (this.timer <= 0) {
      this.phase++;
      if (this.phase === 1) {
        this.doSplit();
        this.timer = CONFIG.disentangleSplitDuration;
      } else if (this.phase === 2) {
        this.active = false;
      }
    }

    if (this.phase === 0) {
      const progress = 1 - this.timer / CONFIG.windUpDuration;
      // Ripple grows during windup
      this.rippleRadius = progress * 80;
    }

    return this.active;
  }

  doSplit() {
    const frag = this.fragment;
    frag.shaking = false; // Stop shaking

    const words = this.newWords;
    const originX = frag.x;
    const originY = frag.y;

    // Push nearby words outward (ripple effect)
    const rippleRadius = 120;
    const rippleForce = 2.0;
    for (const other of this.system.fragments) {
      if (other === frag || other.paperMode) continue;
      const d = dist(other.x, other.y, originX, originY);
      if (d < rippleRadius && d > 1) {
        const falloff = 1 - d / rippleRadius;
        const push = rippleForce * falloff * falloff;
        other.vx += ((other.x - originX) / d) * push;
        other.vy += ((other.y - originY) / d) * push;
      }
    }

    // Original fragment gets new word
    frag.setText(words[0]);
    frag.flashTimer = CONFIG.flashDuration;
    frag.triggerScrambleEffect(CONFIG.scrambleDuration);
    frag.isMerged = false;
    frag.mergedTimer = 0;

    // Activate fragments for each additional word
    const cols = Math.floor(this.system.bounds.width / CONFIG.gridCellW);
    const rows = Math.floor(this.system.bounds.height / CONFIG.gridCellH);
    const fragCol = Math.round(originX / CONFIG.gridCellW);
    const fragRow = Math.round(originY / CONFIG.gridCellH);
    const usedFrags = [frag]; // track all fragments involved for line drawing

    for (let wi = 1; wi < words.length; wi++) {
      const candidates = this.system.fragments.filter(f =>
        !usedFrags.includes(f) && !f.active && !f.paperMode
      );
      const splitFrag = candidates.length > 0 ? randomChoice(candidates) :
        randomChoice(this.system.fragments.filter(f => !usedFrags.includes(f) && !f.paperMode && f.sizeTier === 'small'));

      if (!splitFrag) continue;

      splitFrag.active = true;
      usedFrags.push(splitFrag);

      const tierCfg = CONFIG.tiers[splitFrag.sizeTier];
      splitFrag.baseOpacity = random(tierCfg.opacity[0], tierCfg.opacity[1]);
      splitFrag.targetOpacity = splitFrag.baseOpacity;
      splitFrag.opacity = 0;

      splitFrag.setText(words[wi]);
      splitFrag.x = originX;
      splitFrag.y = originY;
      splitFrag.flashTimer = CONFIG.flashDuration;
      splitFrag.triggerScrambleEffect(CONFIG.scrambleDuration);

      // Spread in evenly spaced directions
      const angle = (Math.PI * 2 * wi / words.length) + random(-0.3, 0.3);
      splitFrag.vx = Math.cos(angle) * CONFIG.disentangleBurstForce * 0.3;
      splitFrag.vy = Math.sin(angle) * CONFIG.disentangleBurstForce * 0.3;
      splitFrag.springHome = true;

      const newCol = Math.max(0, Math.min(cols - 1, fragCol + randomInt(-4, 4)));
      const newRow = Math.max(0, Math.min(rows - 1, fragRow + randomInt(-3, 3)));
      splitFrag.setHome(newCol, newRow);

      // Tracking line from original to this split fragment
      this.system.flashLines.push(new FlashLine(
        frag.x, frag.y, splitFrag.x, splitFrag.y,
        CONFIG.connectionLineDuration + 1.5, frag, splitFrag
      ));
    }

    // Particle trails from origin
    for (let i = 0; i < CONFIG.particleCount; i++) {
      const a = random(0, Math.PI * 2);
      const spd = random(0.5, 2);
      this.system.particles.push(new ParticleTrail(
        originX, originY,
        Math.cos(a) * spd, Math.sin(a) * spd
      ));
    }
  }



  render(ctx) {
    if (this.phase !== 0) return;
    const alpha = 0.15 * (1 - this.timer / CONFIG.windUpDuration);
    if (alpha < 0.005) return;

    // Draw ripple
    ctx.save();
    ctx.strokeStyle = CONFIG.inkColor;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]); // Dashed ripple
    ctx.beginPath();
    ctx.arc(this.fragment.x, this.fragment.y, this.rippleRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}


// ── Render Helpers ─────────────────────────────

// Bayer 8×8 ordered dither matrix — maps grid cell → threshold [0, 1)
const BAYER_8x8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];
function bayerThreshold(xi, yi) {
  return BAYER_8x8[((yi | 0) & 7)][((xi | 0) & 7)] / 64;
}

function renderCloudDitherBackground(ctx, w, h, time, clearZone) {
  const cd = CONFIG.cloudDither;

  ctx.fillStyle = CONFIG.inkColor;

  const step = cd.step;
  const ds = cd.dotSize;
  const p1 = time * cd.warpSpeed, p2 = time * cd.warpSpeed2, p3 = time * cd.warpSpeed3;
  const vs = cd.vortexSpeed, VR = w * cd.vortexSizeScale;
  const dirs = cd.fbmDirs;
  const floor = cd.waveFloor, range = 1 - floor;
  const alphaLow = cd.alphaLow, alphaDelta = cd.alphaHigh - cd.alphaLow;

  // Three vortex centers orbit the canvas in slow independent ellipses
  const cx = w * 0.5, cy = h * 0.5;
  const vortices = [
    { x: cx + Math.cos(time * vs) * w * 0.28, y: cy + Math.sin(time * vs * 0.70) * h * 0.22, R: VR, str: cd.vortexStrength },
    { x: cx + Math.cos(time * vs * 0.6 + 2.09) * w * 0.24, y: cy + Math.sin(time * vs * 0.90 + 1.00) * h * 0.26, R: VR * 0.80, str: cd.vortexStrength * 0.70 },
    { x: cx + Math.cos(time * vs * 1.3 + 4.19) * w * 0.20, y: cy + Math.sin(time * vs * 0.50 + 2.50) * h * 0.30, R: VR * 0.65, str: cd.vortexStrength * 0.55 },
  ];

  // Alpha buckets — collect dot positions by brightness tier, draw in batches
  // to avoid per-dot globalAlpha changes.
  const NUM_BUCKETS = 8;
  const buckets = Array.from({ length: NUM_BUCKETS }, () => []);

  const coarseStep = step * 4;
  const coarseCols = Math.floor(w / coarseStep) + 2;
  const coarseRows = Math.floor(h / coarseStep) + 2;
  const coarseGrid = new Float32Array(coarseCols * coarseRows);

  for (let cyGrid = 0; cyGrid < coarseRows; cyGrid++) {
    for (let cxGrid = 0; cxGrid < coarseCols; cxGrid++) {
      let sx = cxGrid * coarseStep;
      let sy = cyGrid * coarseStep;

      // 1. Vortex swirl — rotate around each animated center, strongest at core
      for (const v of vortices) {
        const dx = sx - v.x, dy = sy - v.y;
        const d2 = dx * dx + dy * dy;
        const swirl = v.str * v.R * v.R / (d2 + v.R * v.R);
        const cs = Math.cos(swirl), sn = Math.sin(swirl);
        sx = v.x + dx * cs - dy * sn;
        sy = v.y + dx * sn + dy * cs;
      }

      // 2. Three-layer domain warp for chaotic, organic cloud texture
      const wx1 = sx + cd.warpAmp * Math.sin(sx * cd.warpFreq + p1);
      const wy1 = sy + cd.warpAmp * Math.cos(sy * cd.warpFreq - p1 * 0.73);
      const wx2 = wx1 + cd.warpAmp2 * Math.sin(wy1 * cd.warpFreq2 + p2);
      const wy2 = wy1 + cd.warpAmp2 * Math.cos(wx1 * cd.warpFreq2 - p2 * 0.61);
      const wx = wx2 + cd.warpAmp3 * Math.sin(wy2 * cd.warpFreq3 - p3 * 0.88);
      const wy = wy2 + cd.warpAmp3 * Math.cos(wx2 * cd.warpFreq3 + p3 * 1.13);

      // 3. Turbulence FBM
      let brightness = 0, amp = 1.0, total = 0, freq = cd.fbmBaseFreq;
      for (let o = 0; o < cd.fbmOctaves; o++) {
        const d = dirs[o % dirs.length];
        const coord = wx * d.ax + wy * d.ay;
        brightness += amp * (1.0 - Math.abs(Math.sin(coord * freq + time * d.speed)));
        total += amp;
        freq *= cd.fbmLacunarity;
        amp *= cd.fbmGain;
      }
      brightness /= total;

      // 4. Hard trough cutoff + remap
      brightness = Math.max(0, (brightness - floor) / range);
      coarseGrid[cyGrid * coarseCols + cxGrid] = brightness;
    }
  }

  for (let gx = 0; gx < w; gx += step) {
    for (let gy = 0; gy < h; gy += step) {

      const cxGrid = gx / coarseStep;
      const cyGrid = gy / coarseStep;
      const col = Math.floor(cxGrid);
      const row = Math.floor(cyGrid);
      const tx = cxGrid - col;
      const ty = cyGrid - row;

      const idx = row * coarseCols + col;
      const v00 = coarseGrid[idx];
      const v10 = coarseGrid[idx + 1];
      const v01 = coarseGrid[idx + coarseCols];
      const v11 = coarseGrid[idx + coarseCols + 1];

      // Bilinear interpolation
      const brightness = v00 * (1 - tx) * (1 - ty) +
        v10 * tx * (1 - ty) +
        v01 * (1 - tx) * ty +
        v11 * tx * ty;

      // 5. Bayer 8×8 threshold — dithers the density
      if (brightness <= bayerThreshold(gx / step, gy / step)) continue;

      // 6. Bucket by brightness → controls per-dot opacity
      const bi = Math.min(NUM_BUCKETS - 1, brightness * NUM_BUCKETS | 0);
      buckets[bi].push(gx, gy);
    }
  }

  // Draw dots in alpha-sorted batches (only NUM_BUCKETS globalAlpha changes per frame)
  for (let b = 0; b < NUM_BUCKETS; b++) {
    ctx.globalAlpha = alphaLow + ((b + 0.5) / NUM_BUCKETS) * alphaDelta;
    const pts = buckets[b];
    for (let i = 0; i < pts.length; i += 2) ctx.fillRect(pts[i], pts[i + 1], ds, ds);
  }

  ctx.globalAlpha = 1;
}


class NeighborMergeEvent {
  constructor(fragments, system) {
    this.fragments = fragments;
    this.system = system;
    this.timer = CONFIG.mergeDuration;

    // Store original positions
    this.origins = fragments.map(f => ({ x: f.x, y: f.y }));

    // Compute centroid
    this.midX = fragments.reduce((s, f) => s + f.x, 0) / fragments.length;
    this.midY = fragments.reduce((s, f) => s + f.y, 0) / fragments.length;

    for (const f of fragments) f.shaking = true;

    // Chain tracking lines between consecutive fragments
    for (let i = 0; i < fragments.length - 1; i++) {
      this.system.flashLines.push(new FlashLine(
        fragments[i].x, fragments[i].y,
        fragments[i + 1].x, fragments[i + 1].y,
        CONFIG.mergeDuration + 0.5,
        fragments[i], fragments[i + 1]
      ));
    }
  }

  update(dt) {
    this.timer -= dt;
    const progress = 1 - (this.timer / CONFIG.mergeDuration);
    const ease = progress * progress;

    for (let i = 0; i < this.fragments.length; i++) {
      this.fragments[i].x = lerp(this.origins[i].x, this.midX, ease);
      this.fragments[i].y = lerp(this.origins[i].y, this.midY, ease);
    }

    if (this.timer <= 0) {
      this.doMerge();
      return false;
    }
    return true;
  }

  doMerge() {
    const primary = this.fragments[0];
    for (const f of this.fragments) f.shaking = false;

    // Try to find a merge result from any pair
    let mergedText = null;
    for (let i = 0; i < this.fragments.length - 1 && !mergedText; i++) {
      for (let j = i + 1; j < this.fragments.length && !mergedText; j++) {
        mergedText = this.system.mergeEngine.tryMerge(
          this.fragments[i].text, this.fragments[j].text
        );
      }
    }
    if (!mergedText) {
      // Fallback: pick the longest word
      mergedText = this.fragments.reduce(
        (best, f) => f.text.length > best.length ? f.text : best, ''
      );
    }

    primary.setText(mergedText);
    primary.flashTimer = CONFIG.flashDuration;
    primary.triggerScrambleEffect(CONFIG.scrambleDuration);
    primary.isMerged = true;
    primary.mergedTimer = CONFIG.mergedGlowDuration;

    // Others get reassigned to new spots
    for (let i = 1; i < this.fragments.length; i++) {
      const f = this.fragments[i];
      f.setText(this.system.mergeEngine.randomWord());
      const lc2 = this.system.leftGridCol || 0;
      f.setHome(randomInt(lc2, this.system.gridCols - 1), randomInt(0, this.system.gridRows - 1));
      f.x = f.homeX;
      f.y = f.homeY;
      f.opacity = 0;
      f.triggerScrambleEffect(0.5);
    }

    this.system.particles.push(new ParticleTrail(this.midX, this.midY, 0, 0));
  }
}

// ── Paper Animation Data ───────────────────────

const PAPER_ANIMS = {

  // ── Stylette: NL command → round painter's palette ──
  stylette: {
    phases: [
      { // Natural language styling command
        texts: ['"make the heading', 'warmer and', 'more rounded"'],
        pos(cx, cy) {
          return [
            { x: cx - 60, y: cy - 14 },
            { x: cx - 42, y: cy + 4 },
            { x: cx - 42, y: cy + 22 },
          ];
        },
        dur: 3.5,
      },
      { scramble: true, dur: 0.8 },
      { // Palette box — abstract texture swatches at corners
        texts: [
          '+------- palette --------+',
          '###  :::  ...',
          '===  ---  ~~~',
          'AAa  Bbb  CCC',
          '.    ..    ...',
          '+------------------------+',
          '       -> applied',
        ],
        pos(cx, cy) {
          return [
            { x: cx - 68, y: cy - 58 },
            { x: cx - 58, y: cy - 30 },
            { x: cx + 12, y: cy - 30 },
            { x: cx - 58, y: cy + 20 },
            { x: cx + 12, y: cy + 20 },
            { x: cx - 68, y: cy + 48 },
            { x: cx - 30, y: cy + 70 },
          ];
        },
        dur: 4.5,
      },
      { scramble: true, dur: 0.8 },
    ],
  },

  // ── CGL: poem → split blocks → stacked tower ──
  'cells-generators-lenses': {
    phases: [
      { // A short poem (continuous text)
        texts: [
          'light through leaves',
          'falls in patterns',
          'on still water',
        ],
        pos(cx, cy) {
          return [
            { x: cx - 55, y: cy - 16 },
            { x: cx - 55, y: cy + 2 },
            { x: cx - 55, y: cy + 20 },
          ];
        },
        dur: 3.0,
      },
      { scramble: true, dur: 0.8 },
      { // Split into separate blocks (ASCII borders, all 18 chars)
        texts: [
          '+----------------+',
          '| light leaves   |',
          '+----------------+',
          '+----------------+',
          '| falls pattern  |',
          '+----------------+',
          '+----------------+',
          '| still water    |',
          '+----------------+',
        ],
        pos(cx, cy) {
          const lh = 17;
          const x1 = cx - 78, y1 = cy - 46;
          const x2 = cx + 4, y2 = cy - 46;
          const x3 = cx - 36, y3 = cy + 24;
          return [
            { x: x1, y: y1 }, { x: x1, y: y1 + lh }, { x: x1, y: y1 + lh * 2 },
            { x: x2, y: y2 }, { x: x2, y: y2 + lh }, { x: x2, y: y2 + lh * 2 },
            { x: x3, y: y3 }, { x: x3, y: y3 + lh }, { x: x3, y: y3 + lh * 2 },
          ];
        },
        dur: 3.5,
      },
      { scramble: true, dur: 0.8 },
      { // Stacked tower (ASCII borders, shared separators)
        texts: [
          '+----------------+',
          '| still water    |',
          '+----------------+',
          '| falls pattern  |',
          '+----------------+',
          '| light leaves   |',
          '+----------------+',
        ],
        pos(cx, cy) {
          const x = cx - 45;
          const lh = 17;
          const startY = cy - lh * 3;
          return Array.from({ length: 7 }, (_, i) => ({
            x, y: startY + i * lh,
          }));
        },
        dur: 4.0,
      },
      { scramble: true, dur: 0.8 },
    ],
  },

  // ── EvalLM: LLM output → same text + evaluation bars below ──
  evallm: {
    phases: [
      { // LLM output
        texts: [
          'The approach uses a',
          'multi-turn dialogue',
          'to iteratively refine',
          'outputs with explicit',
          'user feedback.',
        ],
        pos(cx, cy) {
          return [
            { x: cx - 65, y: cy - 32 },
            { x: cx - 65, y: cy - 14 },
            { x: cx - 65, y: cy + 4 },
            { x: cx - 65, y: cy + 22 },
            { x: cx - 65, y: cy + 40 },
          ];
        },
        dur: 3.5,
      },
      { scramble: true, dur: 0.8 },
      { // Original text stays, evaluation results appear below
        texts: [
          'The approach uses a',
          'multi-turn dialogue',
          'to iteratively refine',
          'outputs with explicit',
          'user feedback.',
          '────────────────',
          'Clarity  ████████░░ 82%',
          'Fluency  █████████░ 91%',
          'Depth    █████░░░░░ 52%',
          'Relevance ███████░░ 71%',
        ],
        pos(cx, cy) {
          const x = cx - 65;
          return [
            { x, y: cy - 72 },
            { x, y: cy - 54 },
            { x, y: cy - 36 },
            { x, y: cy - 18 },
            { x, y: cy },
            { x, y: cy + 24 },
            { x, y: cy + 46 },
            { x, y: cy + 62 },
            { x, y: cy + 78 },
            { x, y: cy + 94 },
          ];
        },
        dur: 4.5,
      },
      { scramble: true, dur: 0.8 },
    ],
  },

  // ── CUPID: user-right / assistant-left chat → preferences ──
  cupid: {
    phases: [
      { // Chat — user messages right, assistant left
        texts: [
          'keep it casual    >',
          '<  sure thing!',
          'be thorough        >',
          '<  of course',
          'warm tone please   >',
          '<  got it!',
        ],
        pos(cx, cy) {
          const lh = 18;
          return [
            { x: cx - 25, y: cy - lh * 2.5 },
            { x: cx - 75, y: cy - lh * 1.5 },
            { x: cx - 25, y: cy - lh * 0.5 },
            { x: cx - 75, y: cy + lh * 0.5 },
            { x: cx - 25, y: cy + lh * 1.5 },
            { x: cx - 75, y: cy + lh * 2.5 },
          ];
        },
        dur: 4.0,
      },
      { scramble: true, dur: 1.0 },
      { // Extracted preferences (no "avoided" section)
        texts: [
          '── preferences ──',
          '  ✓ casual tone',
          '  ✓ thorough',
          '  ✓ concise',
          '  ✓ warm & friendly',
        ],
        pos(cx, cy) {
          const x = cx - 55;
          const lh = 18;
          return Array.from({ length: 5 }, (_, i) => ({
            x, y: cy - lh * 2 + i * lh,
          }));
        },
        dur: 4.5,
      },
      { scramble: true, dur: 1.0 },
    ],
  },

  // ── Evalet: Outputs -> Embedding Clusters ──
  evalet: {
    phases: [
      { // Fragmented Model Output (Creative Writing)
        texts: [
          'The old robot sat',
          'rusting in the rain.',
          'Its gears were silent,',
          'memory circuits faded.',
          'A bird landed softly',
          'on its metal shoulder.',
        ],
        pos(cx, cy) {
          const lh = 20;
          return Array.from({ length: 6 }, (_, i) => ({
            x: cx - 60 + (i % 2) * 10,
            y: cy - lh * 2.5 + i * lh,
          }));
        },
        dur: 3.5,
      },
      { scramble: true, dur: 0.8 },
      { // Embedding Space Clustering
        texts: [
          '•', '•', '•', '•', '•', '•', // Cluster A dots (0-5)
          '•', '•', '•', '•', '•', '•', // Cluster B dots (6-11)
          '     High Quality',           // 12
          '     Hallucinated/Facts',     // 13
          '+', '+', '+', '+'             // 14, 15, 16, 17 (Corner markers)
        ],
        // Make it look like a connected graph/network
        lines: [
          // Cluster A connections (mesh)
          [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 3], [1, 4],
          // Cluster B connections (mesh)
          [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 6], [6, 9], [7, 10],
          // Inter-cluster weak link
          [2, 6],
          // Bounding Box
          [14, 15], [15, 16], [16, 17], [17, 14]
        ],
        pos(cx, cy) {
          const points = [];

          // Cluster A (Tight, structured)
          const c1 = { cx: cx - 40, cy: cy - 20, r: 35 };
          for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            points.push({
              x: c1.cx + Math.cos(a) * c1.r,
              y: c1.cy + Math.sin(a) * c1.r
            });
          }

          // Cluster B (Loose, chaotic)
          const c2 = { cx: cx + 50, cy: cy + 30, r: 45 };
          for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2 + 0.5; // Offset rotation
            points.push({
              x: c2.cx + Math.cos(a) * c2.r,
              y: c2.cy + Math.sin(a) * c2.r
            });
          }

          // Labels
          points.push({ x: c1.cx, y: c1.cy + 55 }); // Label A
          points.push({ x: c2.cx, y: c2.cy + 55 }); // Label B

          // Bounding Box Corners
          const boxW = 220, boxH = 180;
          points.push({ x: cx - boxW / 2, y: cy - boxH / 2 }); // TL 14
          points.push({ x: cx + boxW / 2, y: cy - boxH / 2 }); // TR 15
          points.push({ x: cx + boxW / 2, y: cy + boxH / 2 }); // BR 16
          points.push({ x: cx - boxW / 2, y: cy + boxH / 2 }); // BL 17

          return points;
        },
        dur: 4.5,
      },
      { scramble: true, dur: 0.8 },
    ],
  },

  // ── DiscoverLLM: Flowering Connection ──
  discoverllm: {
    phases: [
      { // Central Request
        texts: [
          'User: "I want a thing..."',
        ],
        pos(cx, cy) {
          return [{ x: cx, y: cy }];
        },
        dur: 1.5,
      },
      { scramble: true, dur: 0.5 },
      { // Divergence / Options (Flowering)
        texts: [
          'User: "I want a thing..."', // 0: Center
          'Option A?', 'Option B?', 'Option C?', // 1, 2, 3
          'Option D?', 'Option E?', 'Option F?'  // 4, 5, 6
        ],
        // Connect center (0) to all others (1-6)
        lines: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6]],
        pos(cx, cy) {
          const r = 90;
          const offset = -Math.PI / 6; // Rotate so options don't hit center text directly
          const opts = Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2 + offset;
            return {
              x: cx + Math.cos(a) * r,
              y: cy + Math.sin(a) * r,
            };
          });
          return [{ x: cx, y: cy }, ...opts];
        },
        dur: 2.0,
      },
      { scramble: true, dur: 0.5 },
      { // Convergence: Keep options, build on selection
        texts: [
          'User: "I want a thing..."',           // 0
          'Option A?', 'Option B?', 'Option C?', // 1, 2, 3
          'Option D?', 'Option E?', 'Option F?', // 4, 5, 6
          'User: "I want Option C!"',            // 7 (New Selection)
          '-> Concrete Intent'                   // 8 (Result)
        ],
        // Previous lines (0->1..6) + New connection (3->7->8) (Option C is index 3)
        lines: [
          [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
          [3, 7], [7, 8]
        ],
        pos(cx, cy) {
          const r = 90;
          const offset = -Math.PI / 6;

          // Recreate exact positions from prev phase
          const opts = Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2 + offset;
            return {
              x: cx + Math.cos(a) * r,
              y: cy + Math.sin(a) * r,
            };
          });

          // Calculate vector for Option C (index 2 in opts array, i=2)
          // i=2 angle: (2/6)*2PI - PI/6 = 4PI/6 - PI/6 = 3PI/6 = PI/2 (90 deg)
          const cAngle = (2 / 6) * Math.PI * 2 + offset;
          const dirX = Math.cos(cAngle);
          const dirY = Math.sin(cAngle);

          // Extend outwards from C
          const optC = opts[2];
          const selPos = { x: optC.x + dirX * 90, y: optC.y + dirY * 90 };
          const resPos = { x: selPos.x + dirX * 80, y: selPos.y + dirY * 80 };

          return [
            { x: cx, y: cy }, // 0
            ...opts,          // 1-6
            selPos,           // 7
            resPos            // 8
          ];
        },
        dur: 4.5,
      },
      { scramble: true, dur: 0.8 },
    ],
  },
};


// ── Paper Animator ─────────────────────────────

class PaperAnimator {
  constructor(paperId, frags, bounds, system) {
    this.phases = PAPER_ANIMS[paperId].phases;
    this.frags = frags;
    this.bounds = bounds;
    this.system = system;
    this.phaseIdx = 0;
    this.phaseTimer = 0;
    this.activeLines = [];
    this.applyPhase(0);
  }

  update(dt) {
    this.phaseTimer -= dt;
    if (this.phaseTimer <= 0) {
      this.phaseIdx = (this.phaseIdx + 1) % this.phases.length;
      this.applyPhase(this.phaseIdx);
    }
  }

  applyPhase(idx) {
    const phase = this.phases[idx];
    const cx = this.bounds.width * 0.85;
    const cy = this.bounds.height * 0.5;

    // Remove old persistent lines
    this.clearLines();

    if (phase.scramble) {
      this.phaseTimer = phase.dur;
      for (const frag of this.frags) {
        if (frag.opacity > 0.05) {
          frag.triggerScrambleEffect(phase.dur * 0.8);
          frag.flashTimer = CONFIG.flashDuration;
        }
      }
      this.activeLines = []; // Ensure clear
    } else {
      this.phaseTimer = phase.dur;
      const texts = phase.texts;
      const positions = phase.pos(cx, cy);
      for (let i = 0; i < this.frags.length; i++) {
        const frag = this.frags[i];
        if (i < texts.length) {
          frag.setText(texts[i]);
          frag.targetX = positions[i].x;
          frag.targetY = positions[i].y;
          frag.targetOpacity = frag.sizeTier === 'large' ? 0.9 : 0.5;
          frag.visible = true;
        } else {
          frag.targetOpacity = 0;
        }
      }

      // Add connecting lines if specified
      if (phase.lines && this.system) {
        for (const [i1, i2] of phase.lines) {
          if (this.frags[i1] && this.frags[i2]) {
            const line = new FlashLine(0, 0, 0, 0, 1, this.frags[i1], this.frags[i2], true);
            this.system.flashLines.push(line);
            this.activeLines.push(line);
          }
        }
      }
    }
  }

  clearLines() {
    if (this.system && this.activeLines.length > 0) {
      this.system.flashLines = this.system.flashLines.filter(l => !this.activeLines.includes(l));
      this.activeLines = [];
    }
  }

  destroy() {
    this.clearLines();
  }
}


// ── Phantom Fragment (fly-in effect) ──────────

class PhantomFragment {
  // onArrive: called once when fragment reaches ~90% of its journey
  constructor(startX, startY, targetX, targetY, text, duration, onArrive = null) {
    this.x = startX;
    this.y = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.text = text;
    this.duration = duration;
    this.elapsed = 0;
    this.opacity = 0.7;
    this.fontSize = random(9, 13);
    this.active = true;
    this.onArrive = onArrive;
    this.arrived = false;
  }

  update(dt) {
    this.elapsed += dt;
    const t = Math.min(this.elapsed / this.duration, 1);

    // Accelerating approach — ease-in-out quad
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    this.x = lerp(this.x, this.targetX, ease * 0.18);
    this.y = lerp(this.y, this.targetY, ease * 0.18);

    // Opacity: steady → flash spike near arrival → fade out
    if (t < 0.65) {
      this.opacity = 0.7;
    } else if (t < 0.82) {
      // Brief intensity spike as it "lands" — the handoff flash
      const flashT = (t - 0.65) / 0.17;
      this.opacity = 0.7 + 0.5 * Math.sin(flashT * Math.PI);
    } else {
      // Rapid fade after landing
      const exitT = (t - 0.82) / 0.18;
      this.opacity = 0.7 * (1 - exitT);
    }

    // Fire arrival callback at 80% — triggers DOM scramble to start resolving
    if (t >= 0.80 && !this.arrived) {
      this.arrived = true;
      if (this.onArrive) this.onArrive();
    }

    if (t >= 1) this.active = false;
    return this.active;
  }

  render(ctx) {
    if (this.opacity < 0.01) return;
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.font = `${this.fontSize}px ${FONT_VARIANTS[0]}, monospace`;
    ctx.fillStyle = CONFIG.inkColor;
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}


// ── Main Fragment System ───────────────────────

class FragmentSystem {
  constructor(canvas, data, profile) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.data = data;
    this.profile = profile;
    this.fragments = [];
    this.scanlines = [];
    this.flashLines = [];
    this.particles = [];
    this.mergeEvents = [];
    this.disentangleEvents = [];
    this.mergeEngine = null;
    this.mouse = { x: 0, y: 0, active: false };
    this.time = 0;
    this.lastTime = 0;
    this.animId = null;
    this.mode = 'ambient';
    this.activePaper = null;
    this.paperAnimator = null;
    this.bounds = { width: 0, height: 0 };
    this.gridCols = 0;
    this.gridRows = 0;
    this.leftOffset = 0; // x-pixel boundary where fragments can live (right of left panel)

    // Clear zone (for paper detail integration)
    this.clearZone = null;
    this.phantomFragments = [];

    // Timers
    this.mergeTimer = random(CONFIG.mergeInterval[0], CONFIG.mergeInterval[1]);
    this.disentangleTimer = random(CONFIG.disentangleInterval[0], CONFIG.disentangleInterval[1]);

    // Cursor interaction
    this.hoverTimer = 0;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.mouseMovedRecently = false;

    // Bind handlers
    this._onMouseMove = this.handleMouseMove.bind(this);
    this._onMouseLeave = this.handleMouseLeave.bind(this);
    this._onClick = this.handleClick.bind(this);
    this._onTouchStart = this.handleTouchStart.bind(this);
    this._onTouchMove = this.handleTouchMove.bind(this);
    this._onTouchEnd = this.handleTouchEnd.bind(this);
    this._onResize = this.resize.bind(this);
  }

  // ── Init ──

  async init() {
    await this.loadFonts();
    this.resize();
    this.mergeEngine = new MergeEngine(
      this.data.mergeRules, this.data.splitRules, this.data.global
    );
    this.spawnFragments();

    this.canvas.addEventListener('mousemove', this._onMouseMove);
    this.canvas.addEventListener('mouseleave', this._onMouseLeave);
    this.canvas.addEventListener('click', this._onClick);
    this.canvas.addEventListener('touchstart', this._onTouchStart, { passive: true });
    this.canvas.addEventListener('touchmove', this._onTouchMove, { passive: true });
    this.canvas.addEventListener('touchend', this._onTouchEnd, { passive: true });
    window.addEventListener('resize', this._onResize);
    this.lastTime = performance.now() / 1000;
    this.loop();
  }

  async loadFonts() {
    const variants = ['Square', 'Grid', 'Circle', 'Triangle', 'Line'];
    await Promise.all(variants.map(async (v) => {
      try {
        const font = new FontFace(`GeistPixel${v}`, `url(/fonts/GeistPixel-${v}.woff2)`);
        document.fonts.add(await font.load());
      } catch (e) { console.warn(`Font GeistPixel${v} failed:`, e); }
    }));
  }

  resize() {
    const dpr = 1; // Forced to 1 to prevent fans spinning on retina displays
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.bounds = { width: rect.width, height: rect.height };
    this.gridCols = Math.max(1, Math.floor(rect.width / CONFIG.gridCellW));
    this.gridRows = Math.max(1, Math.floor(rect.height / CONFIG.gridCellH));
    // Compute left offset: fragments live only in the right-side area
    const leftPanel = document.querySelector('.left-panel');
    if (leftPanel) {
      const lpRect = leftPanel.getBoundingClientRect();
      const canvasRect = this.canvas.getBoundingClientRect();
      this.leftOffset = Math.max(0, lpRect.right - canvasRect.left + 16);
    } else {
      this.leftOffset = 0;
    }
    this.leftGridCol = Math.ceil(this.leftOffset / CONFIG.gridCellW);
  }

  // ── Clear Zone ──

  setClearZone(rect) {
    this.clearZone = {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      opacity: 0,
      targetOpacity: 1,
    };
  }

  updateClearZone(rect) {
    if (!this.clearZone) return;
    this.clearZone.x = rect.x;
    this.clearZone.y = rect.y;
    this.clearZone.width = rect.width;
    this.clearZone.height = rect.height;
  }

  removeClearZone() {
    if (this.clearZone) {
      this.clearZone.targetOpacity = 0;
    }
  }

  // Spawn phantoms distributed across each DOM element's bounding rect.
  // targets: [{ canvasX, canvasY, canvasW, canvasH, count, duration (ms), onArrive? }]
  // canvasX/Y = top-left corner of element rect; canvasW/H = element size.
  spawnTargetedPhantoms(targets) {
    const visible = this.fragments.filter(f => f.active && !f.paperMode && f.opacity > 0.1);

    for (const target of targets) {
      const { canvasX, canvasY, canvasW = 40, canvasH = 20, count, duration } = target;
      let callbackFired = false;
      const fireOnce = target.onArrive
        ? () => { if (!callbackFired) { callbackFired = true; target.onArrive(); } }
        : null;

      for (let i = 0; i < count; i++) {
        const src = visible.length ? randomChoice(visible) : null;
        const startX = src ? src.x : random(0, this.bounds.width);
        const startY = src ? src.y : random(0, this.bounds.height);
        const text = src ? (src.displayText || '').slice(0, 3) || randomChar(NOISE_CHARS)
          : randomChar(NOISE_CHARS);

        // Distribute landing positions across the full element rect
        const tx = canvasX + random(canvasW * 0.05, canvasW * 0.85);
        const ty = canvasY + random(canvasH * 0.1, canvasH * 0.9);

        // First phantom in each group owns the callback
        const cb = i === 0 ? fireOnce : null;
        this.phantomFragments.push(
          new PhantomFragment(startX, startY, tx, ty, text, duration / 1000, cb)
        );
      }
    }
  }

  // Legacy: send generic phantoms toward the center of a rect (used internally)
  spawnFlyInFragments(targetRect, count = 8) {
    const cx = targetRect.x + targetRect.width / 2;
    const cy = targetRect.y + targetRect.height / 2;
    const visible = this.fragments.filter(f => f.active && !f.paperMode && f.opacity > 0.1);
    for (let i = 0; i < count; i++) {
      const src = visible.length ? randomChoice(visible) : null;
      const startX = src ? src.x : random(0, this.bounds.width);
      const startY = src ? src.y : random(0, this.bounds.height);
      const text = src ? (src.displayText || '').slice(0, 2) || randomChar(NOISE_CHARS)
        : randomChar(NOISE_CHARS);
      const tx = cx + random(-targetRect.width * 0.15, targetRect.width * 0.15);
      const ty = cy + random(-targetRect.height * 0.15, targetRect.height * 0.15);
      this.phantomFragments.push(new PhantomFragment(startX, startY, tx, ty, text, random(0.3, 0.6)));
    }
  }

  // ── Spawning ──

  spawnFragments() {
    this.fragments = [];
    const bioText = this.profile.bioKeywords || "Interaction Design AI Alignment Human-Computer Integration";
    // Strip HTML
    const cleanBio = bioText.replace(/<[^>]*>/g, '');
    const startWords = cleanBio.split(/\s+/).filter(w => w.length > 2);

    const cols = this.gridCols;
    const rows = this.gridRows;
    // leftGridCol = first column that falls in the right-panel area
    const leftCol = this.leftGridCol || Math.floor(cols * 0.4);
    const rightCols = Math.max(1, cols - leftCol);

    // Center of the right-side area for initial word cluster
    const centerX = leftCol + Math.floor(rightCols / 2);
    const centerY = Math.floor(rows / 2);

    // Helper: pick a random col in the right area (allow slight bleed into soft left boundary)
    const rightCol = () => Math.max(1, leftCol - 1) + randomInt(0, rightCols);

    let createdCount = 0;

    // 1. Place starting words spread across the right area — always visible
    for (const word of startWords) {
      if (createdCount >= CONFIG.fragmentCount) break;

      // Spread randomly across right area, with mild center bias. Allow slight bleed left.
      const col = Math.max(1, leftCol - 1 + randomInt(-Math.floor(rightCols * 0.4), Math.floor(rightCols * 0.6)));
      const row = centerY + randomInt(-Math.floor(rows * 0.35), Math.floor(rows * 0.35));

      // Starting words use medium or large tiers for clarity
      const tier = Math.random() < 0.4 ? 'large' : 'medium';
      const fs = random(CONFIG.tiers[tier].fontSize[0], CONFIG.tiers[tier].fontSize[1]);
      const op = random(0.50, 0.85);

      const frag = new Fragment(word, col, row, tier, fs, op);
      frag.targetOpacity = op;
      frag.visible = true;
      frag.active = true;

      // Random jitter for initial position and delay
      frag.x += random(-15, 15);
      frag.y += random(-10, 10);
      frag.startDelay = random(0.5, 4.0); // Slower, more gradual appearance

      this.fragments.push(frag);
      createdCount++;
    }

    // 2. Fill the rest of the pool with inactive fragments, all in right area
    while (createdCount < CONFIG.fragmentCount) {
      const col = rightCol();
      const row = randomInt(0, rows - 1);
      const tier = pickTier();
      const fs = random(CONFIG.tiers[tier].fontSize[0], CONFIG.tiers[tier].fontSize[1]);
      const op = 0;

      const frag = new Fragment("", col, row, tier, fs, op);
      frag.active = false;
      frag.targetOpacity = 0;

      // Random jitter
      frag.x += random(-15, 15);
      frag.y += random(-10, 10);

      this.fragments.push(frag);
      createdCount++;
    }
  }

  // ── Cursor Interaction ──

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
    this.mouse.active = true;

    // Detect if mouse actually moved (vs just sitting still)
    const dx = this.mouse.x - this.lastMouseX;
    const dy = this.mouse.y - this.lastMouseY;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
      this.mouseMovedRecently = true;
      this.hoverTimer = 0; // reset hold timer when moving
    }
    this.lastMouseX = this.mouse.x;
    this.lastMouseY = this.mouse.y;
  }

  handleMouseLeave() {
    this.mouse.active = false;
    this.hoverTimer = 0;
    this.mouseMovedRecently = false;
  }

  handleClick(e) {
    if (!CONFIG.cursorClickDisentangle) return;
    const rect = this.canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    this.triggerClickDisentangle(cx, cy);
  }

  handleTouchStart(e) {
    if (e.touches.length > 0) {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.touches[0].clientX - rect.left;
      this.mouse.y = e.touches[0].clientY - rect.top;
      this.mouse.active = true;
    }
  }

  handleTouchMove(e) {
    if (e.touches.length > 0) {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.touches[0].clientX - rect.left;
      this.mouse.y = e.touches[0].clientY - rect.top;
      this.mouseMovedRecently = true;
      this.hoverTimer = 0;
    }
  }

  handleTouchEnd() {
    this.mouse.active = false;
    this.hoverTimer = 0;
    this.mouseMovedRecently = false;
  }

  // Cursor Lumon effect — ball pushing on fabric, words rise toward viewer
  updateCursor(dt) {
    const mx = this.mouse.x, my = this.mouse.y;

    for (const frag of this.fragments) {
      if (frag.paperMode) {
        frag.cursorInfluence = lerp(frag.cursorInfluence, 0, 0.08);
        continue;
      }

      if (!this.mouse.active) {
        frag.cursorInfluence = lerp(frag.cursorInfluence, 0, 0.08);
        continue;
      }

      const d = dist(frag.x, frag.y, mx, my);
      if (d < CONFIG.cursorRadius) {
        const falloff = 1 - d / CONFIG.cursorRadius;
        const targetInfluence = falloff * falloff;
        frag.cursorInfluence = lerp(frag.cursorInfluence, targetInfluence, 0.12);

        // Push outward from cursor — ball on fabric effect
        if (d > 1) {
          const force = CONFIG.cursorPushStrength * falloff * falloff * dt;
          frag.vx += ((frag.x - mx) / d) * force;
          frag.vy += ((frag.y - my) / d) * force;
        }
      } else {
        frag.cursorInfluence = lerp(frag.cursorInfluence, 0, 0.08);
      }
    }

    if (!this.mouse.active) {
      this.hoverTimer = 0;
      this.mouseMovedRecently = false;
      return;
    }

    // Hold-to-merge: if mouse stays still, increment hold timer
    if (!this.mouseMovedRecently) {
      this.hoverTimer += dt;
      if (this.hoverTimer >= CONFIG.cursorHoldTime) {
        this.triggerHoldMerge(mx, my);
        this.hoverTimer = 0;
      }
    }
    this.mouseMovedRecently = false;
  }

  // Hold = trigger merge near cursor
  triggerHoldMerge(mx, my) {
    const nearby = this.fragments.filter(f =>
      !f.paperMode && dist(f.x, f.y, mx, my) < CONFIG.cursorRadius
    );
    if (nearby.length < 2) return;

    // Sort by distance to cursor
    nearby.sort((a, b) => dist(a.x, a.y, mx, my) - dist(b.x, b.y, mx, my));

    // Try merging closest pairs
    for (let i = 0; i < nearby.length - 1; i++) {
      for (let j = i + 1; j < nearby.length; j++) {
        const merged = this.mergeEngine.tryMerge(nearby[i].text, nearby[j].text);
        if (merged) {
          this.doMerge(nearby[i], nearby[j], merged);
          return;
        }
      }
    }
  }

  // Click = trigger disentangle near cursor (random words)
  triggerClickDisentangle(cx, cy) {
    // Find closest fragment within cursor radius
    let closest = null;
    let closestDist = CONFIG.cursorRadius * 1.5;
    for (const frag of this.fragments) {
      if (frag.paperMode) continue;
      const d = dist(frag.x, frag.y, cx, cy);
      if (d < closestDist) {
        closestDist = d;
        closest = frag;
      }
    }
    if (!closest) return;

    // Disentangle into 2-4 random words from the pool
    const r = Math.random();
    const count = r < 0.6 ? 2 : r < 0.9 ? 3 : 4;
    const words = [];
    for (let i = 0; i < count; i++) words.push(this.mergeEngine.randomWord());
    this.disentangleEvents.push(new DisentanglementEvent(closest, words, this));
  }

  // ── Neighbor Merge Logic ──

  updateNeighborMerges(dt) {
    if (this.fragments.length < 10) return;

    this.mergeTimer -= dt;
    if (this.mergeTimer <= 0) {
      this.tryNeighborMerge();
      this.mergeTimer = random(CONFIG.mergeInterval[0], CONFIG.mergeInterval[1]);
    }

    this.mergeEvents = this.mergeEvents.filter(e => e.update(dt));
  }

  tryNeighborMerge() {
    const active = this.fragments.filter(f => f.active && !f.paperMode && !f.shaking && !f.isMerged);
    if (active.length < 2) return;

    const a = randomChoice(active);

    // Random merge count: 2 (60%), 3 (30%), 4 (10%)
    const r = Math.random();
    const targetCount = r < 0.6 ? 2 : r < 0.9 ? 3 : 4;

    // Find closest neighbors within merge distance
    const candidates = active.filter(f => f !== a);
    candidates.sort((x, y) => dist(a.x, a.y, x.x, x.y) - dist(a.x, a.y, y.x, y.y));

    const group = [a];
    for (const c of candidates) {
      if (group.length >= targetCount) break;
      if (dist(a.x, a.y, c.x, c.y) < CONFIG.mergeDistance) {
        group.push(c);
      }
    }

    if (group.length >= 2) {
      this.mergeEvents.push(new NeighborMergeEvent(group, this));
    }
  }

  doMerge(a, b, mergedText) {
    this.flashLines.push(new FlashLine(a.x, a.y, b.x, b.y, 0.6));

    // a gets the merged text
    a.setText(mergedText);
    a.flashTimer = CONFIG.flashDuration;
    a.triggerScrambleEffect(CONFIG.scrambleDuration);
    a.isMerged = true;
    a.mergedTimer = CONFIG.mergedGlowDuration;
    a.targetOpacity = Math.min(0.85, a.baseOpacity + 0.15);

    // b gets reassigned — new word, new home
    b.setText(this.mergeEngine.randomWord());
    b.triggerScrambleEffect(0.6);
    const lc = this.leftGridCol || 0;
    b.setHome(randomInt(lc, this.gridCols - 1), randomInt(0, this.gridRows - 1));
    b.targetOpacity = b.baseOpacity;
    b.springHome = true;
  }

  // ── Disentanglement Events ──

  updateDisentangleEvents(dt) {
    // 1. Update existing events
    this.disentangleEvents = this.disentangleEvents.filter(e => e.update(dt));

    // 2. Auto-Disentangle (Expansion)
    const activeCount = this.fragments.filter(f => f.active).length;
    let timerSpeed = 1.0;

    // If grid not full, expand aggressively
    if (activeCount < CONFIG.fragmentCount * 0.95) {
      timerSpeed = 4.0;
    }

    this.disentangleTimer -= dt * timerSpeed;

    if (this.disentangleTimer <= 0) {
      this.tryDisentangle();
      this.disentangleTimer = random(CONFIG.disentangleInterval[0], CONFIG.disentangleInterval[1]);
    }
  }

  tryDisentangle() {
    const candidates = this.fragments.filter(f => !f.paperMode && f.active);
    if (candidates.length === 0) return;
    const frag = randomChoice(candidates);

    // Random split count: 2 (60%), 3 (30%), 4 (10%)
    const r = Math.random();
    const count = r < 0.6 ? 2 : r < 0.9 ? 3 : 4;

    const words = [];
    for (let i = 0; i < count; i++) {
      words.push(this.mergeEngine.randomWord());
    }
    this.disentangleEvents.push(new DisentanglementEvent(frag, words, this));
  }

  // ── Update ──

  // Collision avoidance — prevent words from overlapping
  applySeparation() {
    const frags = this.fragments;
    const r = CONFIG.separationRadius;
    const str = CONFIG.separationStrength;
    for (let i = 0; i < frags.length; i++) {
      const a = frags[i];
      if (a.paperMode || !a.active) continue;
      for (let j = i + 1; j < frags.length; j++) {
        const b = frags[j];
        if (b.paperMode || !b.active) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > r) continue;

        if (d < 0.1) {
          // Identical position — push apart randomly
          const angle = random(0, Math.PI * 2);
          a.x += Math.cos(angle) * 8;
          a.y += Math.sin(angle) * 8;
          continue;
        }

        const overlap = (r - d) / r;
        // Cubic falloff — much stronger when very close
        const force = str * overlap * overlap * overlap;
        const nx = dx / d, ny = dy / d;
        a.vx += nx * force;
        a.vy += ny * force;
        b.vx -= nx * force;
        b.vy -= ny * force;

        // Hard position nudge when nearly overlapping
        if (d < r * 0.35) {
          const nudge = (r * 0.35 - d) * 0.4;
          a.x += nx * nudge;
          a.y += ny * nudge;
          b.x -= nx * nudge;
          b.y -= ny * nudge;
        }
      }
    }
  }

  update(dt) {
    this.time += dt;

    // Animate clear zone opacity
    if (this.clearZone) {
      this.clearZone.opacity = lerp(this.clearZone.opacity, this.clearZone.targetOpacity, 0.06);
      if (this.clearZone.targetOpacity === 0 && this.clearZone.opacity < 0.01) {
        this.clearZone = null;
      }
    }

    for (const f of this.fragments) {
      f.update(dt, this.time);
      if (!f.paperMode) {
        if (f.applyOrganicBounds(this.bounds.width, this.bounds.height, this.leftOffset)) {
          f.recycle(this);
        }
      }
    }

    // Clear zone repulsion — push non-paper fragments out of the zone
    if (this.clearZone && this.clearZone.opacity > 0.05) {
      const cz = this.clearZone;
      const margin = 20;
      for (const f of this.fragments) {
        if (f.paperMode || !f.active) continue;
        // Check if fragment overlaps clear zone (with margin)
        if (f.x > cz.x - margin && f.x < cz.x + cz.width + margin &&
          f.y > cz.y - margin && f.y < cz.y + cz.height + margin) {
          // Push to nearest edge
          const toLeft = f.x - cz.x;
          const toRight = (cz.x + cz.width) - f.x;
          const toTop = f.y - cz.y;
          const toBottom = (cz.y + cz.height) - f.y;
          const minDist = Math.min(toLeft, toRight, toTop, toBottom);
          const force = 2.0 * cz.opacity;
          if (minDist === toLeft) f.vx -= force;
          else if (minDist === toRight) f.vx += force;
          else if (minDist === toTop) f.vy -= force;
          else f.vy += force;
        }
      }
    }

    // Prevent words from overlapping
    this.applySeparation();

    this.flashLines = this.flashLines.filter(fl => fl.update(dt));
    this.particles = this.particles.filter(p => p.update(dt));

    // Update phantom fragments
    this.phantomFragments = this.phantomFragments.filter(p => p.update(dt));

    if (this.mode === 'ambient') {
      this.updateCursor(dt);
      this.updateNeighborMerges(dt);
      this.updateDisentangleEvents(dt);
    } else if (this.mode === 'paper' && this.paperAnimator) {
      this.paperAnimator.update(dt);
      this.updateCursor(dt); // Lumon push still works on non-paper fragments
    }
  }

  // ── Render ──

  render() {
    const ctx = this.ctx;
    const w = this.bounds.width, h = this.bounds.height;

    ctx.fillStyle = CONFIG.paperColor;
    ctx.fillRect(0, 0, w, h);
    renderCloudDitherBackground(ctx, w, h, this.time, this.clearZone);

    // Flash lines
    for (const fl of this.flashLines) fl.render(ctx);

    // Gravity wells


    // Disentanglement events
    for (const de of this.disentangleEvents) de.render(ctx);

    // Particles
    for (const p of this.particles) p.render(ctx);

    // Phantom fragments (fly-in effect)
    for (const pf of this.phantomFragments) pf.render(ctx);

    // Fragments sorted by tier (small → large = back → front)
    const tierOrder = ['small', 'medium', 'large'];
    for (const tier of tierOrder) {
      for (const frag of this.fragments) {
        if (frag.sizeTier !== tier) continue;
        frag.render(ctx);
      }
    }
  }

  // ── Loop ──

  loop() {
    const now = performance.now() / 1000;
    const dt = Math.min(now - this.lastTime, 0.05);
    this.lastTime = now;
    this.update(dt);
    const dpr = 1; // Forced to 1
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.render();
    this.animId = requestAnimationFrame(() => this.loop());
  }

  // ── Mode Transitions ──

  // clearZoneRect: canvas-relative rect where the detail overlay sits.
  // Phantom spawning is handled by the caller (panel.js) via spawnTargetedPhantoms().
  morphToPaper(paperId, clearZoneRect = null) {
    if (clearZoneRect) {
      this.setClearZone(clearZoneRect);
    }

    if (!PAPER_ANIMS[paperId]) {
      // Paper without animation — enter paper mode but just dim fragments
      this.mode = 'paper';
      this.activePaper = paperId;
      this.mergeEvents = [];
      this.disentangleEvents = [];

      for (const f of this.fragments) {
        f.targetOpacity = 0.05;
        f.breathAmp = 0.01;
      }
      return;
    }

    this.mode = 'paper';
    this.activePaper = paperId;

    // Cancel ambient events
    this.mergeEvents = [];
    this.disentangleEvents = [];

    const animCfg = PAPER_ANIMS[paperId];
    const maxFrags = Math.max(
      ...animCfg.phases.filter(p => p.texts).map(p => p.texts.length)
    );

    const sorted = [...this.fragments].sort((a, b) => {
      const tierRank = { large: 3, medium: 2, small: 1 };
      return (tierRank[b.sizeTier] || 0) - (tierRank[a.sizeTier] || 0);
    });
    const paperFrags = sorted.slice(0, maxFrags);

    for (const frag of paperFrags) {
      frag.paperMode = true;
      frag.springHome = false;
      frag.vx = 0;
      frag.vy = 0;
    }

    for (const f of this.fragments) {
      if (!paperFrags.includes(f)) {
        f.targetOpacity = 0.05;
        f.breathAmp = 0.01;
      }
    }

    // Clean up previous paper animator if exists
    if (this.paperAnimator) {
      this.paperAnimator.destroy();
    }
    this.paperAnimator = new PaperAnimator(paperId, paperFrags, this.bounds, this);
  }

  morphToAmbient() {
    this.mode = 'ambient';
    this.activePaper = null;
    if (this.paperAnimator) {
      this.paperAnimator.destroy();
      this.paperAnimator = null;
    }

    // Fade out clear zone so fragments flow back
    this.removeClearZone();
    this.phantomFragments = [];

    const cols = this.gridCols, rows = this.gridRows;

    for (const frag of this.fragments) {
      if (frag.paperMode) {
        // Only paper-mode fragments need full reset
        frag.paperMode = false;
        frag.springHome = true;
        frag.setHome(randomInt(0, cols - 1), randomInt(0, rows - 1));
        frag.homeX += random(-6, 6);
        frag.homeY += random(-4, 4);
        frag.setText(this.mergeEngine.randomWord());
        frag.triggerScrambleEffect(random(0.3, 0.7));
        frag.isMerged = false;
        frag.mergedTimer = 0;
      }
      // Restore opacity and breathing for all fragments
      frag.targetOpacity = frag.baseOpacity;
      frag.breathAmp = random(CONFIG.breathAmpRange[0], CONFIG.breathAmpRange[1]);
    }

    this.disentangleTimer = random(CONFIG.disentangleInterval[0], CONFIG.disentangleInterval[1]);
  }

  // ── Cleanup ──

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    this.canvas.removeEventListener('mousemove', this._onMouseMove);
    this.canvas.removeEventListener('mouseleave', this._onMouseLeave);
    this.canvas.removeEventListener('click', this._onClick);
    this.canvas.removeEventListener('touchstart', this._onTouchStart);
    this.canvas.removeEventListener('touchmove', this._onTouchMove);
    this.canvas.removeEventListener('touchend', this._onTouchEnd);
    window.removeEventListener('resize', this._onResize);
  }
}


// ── Init Export ────────────────────────────────
export async function initFragmentAnimation(canvas, data, profile) {
  const system = new FragmentSystem(canvas, data, profile);
  await system.init();
  return system;
}
