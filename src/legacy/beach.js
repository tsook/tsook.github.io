// beach.js

const VERTEX_SHADER = `
precision mediump float;
attribute vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

// --- CONTROL UNIFORMS (Sent from JS) ---
uniform float u_phase;           // 0.0 to 1.0 (Current wave progress)
uniform float u_surgeSplit;      // 0.3 = fast surge, 0.7 = slow surge
uniform float u_dryingTime;      // Absolute seconds since water started retreating
uniform float u_waveReach;       // How far this specific wave goes
uniform float u_foamIntensity;   // How white/frothy this specific wave is

// --- STATIC CONFIG ---
uniform vec3 u_colorInk;
uniform vec3 u_colorPaper;
uniform float u_tideLevel;
uniform float u_sandWetness;
uniform float u_foamOpacity;
uniform float u_foamScale;

// --- NOISE FUNCTIONS ---
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ; m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 3; i++) {
        value += amplitude * snoise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

float getBayer(float x, float y) {
    int ix = int(mod(x, 4.0));
    int iy = int(mod(y, 4.0));
    if (iy == 0) { if (ix == 0) return 0.0/16.0; if (ix == 1) return 8.0/16.0; if (ix == 2) return 2.0/16.0; return 10.0/16.0; }
    if (iy == 1) { if (ix == 0) return 12.0/16.0; if (ix == 1) return 4.0/16.0; if (ix == 2) return 14.0/16.0; return 6.0/16.0; }
    if (iy == 2) { if (ix == 0) return 3.0/16.0; if (ix == 1) return 11.0/16.0; if (ix == 2) return 1.0/16.0; return 9.0/16.0; }
    if (iy == 3) { if (ix == 0) return 15.0/16.0; if (ix == 1) return 7.0/16.0; if (ix == 2) return 13.0/16.0; return 5.0/16.0; }
    return 0.0;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 pos = st;
    pos.x *= u_resolution.x / u_resolution.y;

    // --- PHYSICS (Controlled by JS) ---
    float surge = 0.0;
    float currentFoam = 0.0;
    
    if (u_phase < u_surgeSplit) {
        // SURGE
        float p = u_phase / u_surgeSplit;
        surge = smoothstep(0.0, 1.0, p); 
        currentFoam = smoothstep(0.0, 1.0, p);
    } else {
        // RETREAT
        float p = (u_phase - u_surgeSplit) / (1.0 - u_surgeSplit);
        surge = 1.0 - smoothstep(0.0, 1.0, p);
        surge = mix(surge, 1.0 - pow(p, 1.5), 0.5);
        currentFoam = 1.0 - p; 
    }
    
    currentFoam *= u_foamIntensity;

    float globalTide = sin(u_time * 0.2) * 0.05; 
    
    // --- POSITIONING ---
    float shoreBase = (st.x + st.y); 
    vec2 flowDir = vec2(-1.0, -1.0); 
    float edgeNoise = fbm(pos * 3.0 + flowDir * u_time * 0.1) * 0.05;

    float currentLevel = u_tideLevel - (surge * u_waveReach) - globalTide;
    float maxReachLevel = u_tideLevel - u_waveReach - globalTide;

    float dist = currentLevel - (shoreBase + edgeNoise);

    // --- DRYING ---
    float dryingFactor = exp(-u_dryingTime * 0.5); 

    // --- RENDER ---
    float brightness = 0.0;
    float foamStaticPos = snoise(pos * u_foamScale + vec2(u_time * 0.1)); 

    if (dist < 0.0) {
        // === WATER ===
        float depth = abs(dist);
        brightness = 0.2 + (1.0 - smoothstep(0.0, 0.5, depth)) * 0.3;

        float caustic = snoise(pos * 15.0 + flowDir * u_time * 0.5);
        caustic = pow(caustic * 0.5 + 0.5, 3.0); 
        brightness += caustic * 0.2;

        // --- DENSE FOAM LIP ---
        float foamLip = smoothstep(-0.08, 0.0, dist); 
        if (foamLip > 0.01) {
            // Tighter thresholds (0.1, 0.5) make the foam clumps bigger and more solid.
            float lipMask = smoothstep(0.1, 0.5, foamStaticPos);
            // Higher multiplier (1.2) makes it intensely white.
            brightness += lipMask * foamLip * 1.2 * currentFoam;
        }

    } else {
        // === SAND ===
        float isWithinReach = smoothstep(maxReachLevel, maxReachLevel + 0.1, shoreBase + edgeNoise);
        float wetness = isWithinReach * dryingFactor;
        wetness *= exp(-dist * 0.5);

        float wetSandDarkness = wetness * u_sandWetness; 
        brightness = 0.85 - wetSandDarkness;

        brightness += snoise(pos * 150.0) * 0.05;
    }

    // --- DITHERING ---
    float threshold = getBayer(gl_FragCoord.x, gl_FragCoord.y);
    float dithered = step(threshold, brightness);
    
    vec3 color = mix(u_colorInk, u_colorPaper, dithered);
    gl_FragColor = vec4(color, 1.0);
}
`;

// --- HELPER CLASSES & FUNCTIONS ---

function random(min, max) {
  return Math.random() * (max - min) + min;
}

class WaveController {
  constructor() {
    this.startTime = 0;
    this.duration = 8.0;
    this.surgeSplit = 0.3;
    this.reach = 0.6;
    this.foamIntensity = 1.0;
    this.phase = 0.0;
    this.dryingTime = 10.0;
    this.lastRetreatTime = -10.0;
    this.isRetreating = false;
  }

  update(currentTime) {
    const elapsed = currentTime - this.startTime;
    this.phase = elapsed / this.duration;

    if (this.phase >= 1.0) {
      this.startNewWave(currentTime);
    }

    if (!this.isRetreating && this.phase > this.surgeSplit) {
      this.isRetreating = true;
      this.lastRetreatTime = currentTime;
    }

    if (this.isRetreating) {
      this.dryingTime = currentTime - this.lastRetreatTime;
    } else {
      this.dryingTime = currentTime - this.lastRetreatTime;
    }
  }

  startNewWave(currentTime) {
    this.startTime = currentTime;
    this.phase = 0.0;
    this.isRetreating = false;

    // Randomize physics for "Organic" feel
    this.duration = random(6.0, 12.0);
    this.surgeSplit = random(0.2, 0.4);
    this.reach = random(0.55, 0.65);
    this.foamIntensity = random(0.7, 1.2);
  }
}

function hexToRGB(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

// --- MAIN EXPORT ---

export function initBeachAnimation(canvasEl) {
  const gl = canvasEl.getContext('webgl');
  if (!gl) {
    console.error('WebGL not supported');
    return;
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vertexShader || !fragmentShader) return;

  const program = createProgram(gl, vertexShader, fragmentShader);
  if (!program) return;

  const positionAttributeLocation = gl.getAttribLocation(program, "position");
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

  // --- CONFIGURATION ---
  const config = {
    inkColor: '#1F2933', // Deep Graphite
    paperColor: '#F2F4F6', // Cool Pale Grey
    tideLevel: 1.50,
    foamOpacity: 0.5,
    foamScale: 60.0,
    sandWetness: 0.55,
  };

  // --- UNIFORM LOCATIONS ---
  const locs = {
    resolution: gl.getUniformLocation(program, "u_resolution"),
    time: gl.getUniformLocation(program, "u_time"),
    phase: gl.getUniformLocation(program, "u_phase"),
    surgeSplit: gl.getUniformLocation(program, "u_surgeSplit"),
    dryingTime: gl.getUniformLocation(program, "u_dryingTime"),
    waveReach: gl.getUniformLocation(program, "u_waveReach"),
    foamIntensity: gl.getUniformLocation(program, "u_foamIntensity"),
    colorInk: gl.getUniformLocation(program, "u_colorInk"),
    colorPaper: gl.getUniformLocation(program, "u_colorPaper"),
    tideLevel: gl.getUniformLocation(program, "u_tideLevel"),
    foamOpacity: gl.getUniformLocation(program, "u_foamOpacity"),
    foamScale: gl.getUniformLocation(program, "u_foamScale"),
    sandWetness: gl.getUniformLocation(program, "u_sandWetness"),
  };

  const waveController = new WaveController();

  function resize() {
    const displayWidth = canvasEl.clientWidth;
    const displayHeight = canvasEl.clientHeight;
    if (canvasEl.width !== displayWidth || canvasEl.height !== displayHeight) {
      canvasEl.width = displayWidth;
      canvasEl.height = displayHeight;
    }
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  }

  function render(time) {
    resize();
    time *= 0.001; // Convert to seconds

    // Update Physics
    waveController.update(time);

    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // Dynamic Uniforms
    gl.uniform2f(locs.resolution, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(locs.time, time);
    gl.uniform1f(locs.phase, waveController.phase);
    gl.uniform1f(locs.surgeSplit, waveController.surgeSplit);
    gl.uniform1f(locs.dryingTime, waveController.dryingTime);
    gl.uniform1f(locs.waveReach, waveController.reach);
    gl.uniform1f(locs.foamIntensity, waveController.foamIntensity);

    // Static Uniforms
    gl.uniform3fv(locs.colorInk, hexToRGB(config.inkColor));
    gl.uniform3fv(locs.colorPaper, hexToRGB(config.paperColor));
    gl.uniform1f(locs.tideLevel, config.tideLevel);
    gl.uniform1f(locs.foamOpacity, config.foamOpacity);
    gl.uniform1f(locs.foamScale, config.foamScale);
    gl.uniform1f(locs.sandWetness, config.sandWetness);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}