/*
 * Escena 2D con three.js.
 * - Cámara ortográfica en píxeles CSS: 1 unidad = 1 px, así el "escenario" se alinea con un <div class="stage">.
 * - Fondo: rejilla de puntos que reacciona al mouse y a los cambios de diapositiva, más glifos de código flotando.
 * - Escenario: archivos, carpetas y el módulo fs animados con resortes para ilustrar cada paso.
 */
window.Deck = window.Deck || {};
(function (Deck) {
  'use strict';

  const listeners = {};
  const emit = (evt, v) => (listeners[evt] || []).forEach((fn) => fn(v));
  // init() puede correr antes que app.js (fuentes en caché): hasta entonces no hay estado ni escenario.
  const pending = { state: null, el: null };

  const api = {
    ready: false,
    on(evt, fn) { (listeners[evt] = listeners[evt] || []).push(fn); },
    setState(name) { pending.state = name; },
    setStageEl(el) { pending.el = el; },
    pulse() {},
    confetti() {},
    setTheme() {},
    renderNow() {},
  };
  Deck.scene = api;

  const T = window.THREE;
  const canvas = document.getElementById('scene');
  if (!T || !canvas) {
    document.documentElement.classList.add('no-webgl');
    return;
  }

  const fontLoads = document.fonts && document.fonts.load
    ? Promise.all([document.fonts.load('500 16px "Geist Mono"'), document.fonts.load('700 16px "Geist Mono"')])
    : Promise.resolve();
  Promise.race([fontLoads, new Promise((r) => setTimeout(r, 2500))])
    .catch(() => {})
    .then(init);

  function init() {
    let renderer;
    try {
      renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch (e) {
      document.documentElement.classList.add('no-webgl');
      return;
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(DPR);
    renderer.setClearColor(0x000000, 0);

    let W = window.innerWidth;
    let H = window.innerHeight;
    renderer.setSize(W, H, false);

    const scene = new T.Scene();
    const camera = new T.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, -500, 500);
    camera.position.z = 100;

    /* ---------- Paleta (se lee de las variables CSS del tema) ---------- */
    const P = {};
    const PALETTE = {
      dot: '--scene-dot', accent: '--accent', accent2: '--accent-2', pink: '--pink', amber: '--amber',
      paper: '--scene-paper', paperEdge: '--scene-paper-edge', ink: '--scene-ink',
      folder: '--scene-folder', folderTab: '--scene-folder-tab', node: '--scene-node', nodeEdge: '--scene-node-edge',
      js: '--scene-js', pkg: '--scene-pkg', label: '--fg-muted', glyph: '--scene-glyph', shadow: '--scene-shadow',
    };
    function readPalette() {
      const cs = getComputedStyle(document.documentElement);
      Object.keys(PALETTE).forEach((k) => { P[k] = cs.getPropertyValue(PALETTE[k]).trim() || '#888888'; });
      P.white = '#ffffff';
      P.jsInk = '#1a1a1a';
    }
    readPalette();

    const tinted = [];
    const redraws = [];

    function M(key, base) {
      const m = new T.MeshBasicMaterial({ color: new T.Color(P[key]), transparent: true, depthWrite: false, depthTest: false });
      m.userData.base = base == null ? 1 : base;
      tinted.push({ m, key });
      return m;
    }

    /* ---------- Texto como textura de canvas ---------- */
    const TEXT_RES = 4;
    function makeText(initial, o) {
      o = o || {};
      const size = o.size || 13;
      const weight = o.weight || 500;
      const family = o.family || '"Geist Mono", ui-monospace, monospace';
      const cvs = document.createElement('canvas');
      const ctx = cvs.getContext('2d');
      const tex = new T.CanvasTexture(cvs);
      tex.minFilter = T.LinearFilter;
      tex.generateMipmaps = false;
      const mat = new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false });
      mat.userData.base = o.base == null ? 1 : o.base;
      const mesh = new T.Mesh(new T.PlaneGeometry(1, 1), mat);
      let text = initial;
      function draw() {
        const px = size * TEXT_RES;
        const font = `${weight} ${px}px ${family}`;
        ctx.font = font;
        const w = Math.max(4, Math.ceil(ctx.measureText(text).width + px * 0.6));
        const h = Math.ceil(px * 1.5);
        cvs.width = w;
        cvs.height = h;
        ctx.font = font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = P[o.key || 'label'];
        ctx.fillText(text, w / 2, h / 2 + px * 0.04);
        // El tamaño del canvas puede cambiar: hay que liberar la textura para volver a subirla.
        tex.dispose();
        tex.needsUpdate = true;
        mesh.scale.set(w / TEXT_RES, h / TEXT_RES, 1);
      }
      draw();
      redraws.push(draw);
      return { mesh, set(v) { if (v !== text) { text = v; draw(); } } };
    }

    /* ---------- Formas ---------- */
    function roundRect(w, h, r) {
      const s = new T.Shape();
      const x0 = -w / 2; const x1 = w / 2; const y0 = -h / 2; const y1 = h / 2;
      s.moveTo(x0 + r, y0);
      s.lineTo(x1 - r, y0); s.quadraticCurveTo(x1, y0, x1, y0 + r);
      s.lineTo(x1, y1 - r); s.quadraticCurveTo(x1, y1, x1 - r, y1);
      s.lineTo(x0 + r, y1); s.quadraticCurveTo(x0, y1, x0, y1 - r);
      s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0);
      return s;
    }
    function docShape(w, h, f, r) {
      const s = new T.Shape();
      const x0 = -w / 2; const x1 = w / 2; const y0 = -h / 2; const y1 = h / 2;
      s.moveTo(x0 + r, y0);
      s.lineTo(x1 - r, y0); s.quadraticCurveTo(x1, y0, x1, y0 + r);
      s.lineTo(x1, y1 - f); s.lineTo(x1 - f, y1);
      s.lineTo(x0 + r, y1); s.quadraticCurveTo(x0, y1, x0, y1 - r);
      s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0);
      return s;
    }
    function foldShape(w, h, f) {
      const s = new T.Shape();
      s.moveTo(w / 2 - f, h / 2);
      s.lineTo(w / 2 - f + 3, h / 2 - f + 3);
      s.quadraticCurveTo(w / 2 - f, h / 2 - f, w / 2 - f + 4, h / 2 - f);
      s.lineTo(w / 2, h / 2 - f);
      s.lineTo(w / 2 - f, h / 2);
      return s;
    }
    function folderShape(w, h, r, tab) {
      const s = new T.Shape();
      const x0 = -w / 2; const x1 = w / 2; const y0 = -h / 2; const y1 = h / 2;
      const tx = x0 + w * 0.42;
      s.moveTo(x0 + r, y0);
      s.lineTo(x1 - r, y0); s.quadraticCurveTo(x1, y0, x1, y0 + r);
      s.lineTo(x1, y1 - r); s.quadraticCurveTo(x1, y1, x1 - r, y1);
      s.lineTo(tx + 12, y1); s.lineTo(tx, y1 + tab);
      s.lineTo(x0 + r, y1 + tab); s.quadraticCurveTo(x0, y1 + tab, x0, y1 + tab - r);
      s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0);
      return s;
    }

    const shadowTex = (() => {
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      const g = c.getContext('2d');
      const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0, 'rgba(255,255,255,1)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, 64, 64);
      return new T.CanvasTexture(c);
    })();
    function shadowMesh(w, y) {
      const m = M('shadow', 0.32);
      m.map = shadowTex;
      const mesh = new T.Mesh(new T.PlaneGeometry(w, 24), m);
      mesh.position.set(0, y, -1);
      return mesh;
    }

    /* ---------- Objetos del escenario ---------- */
    const stage = new T.Group();
    scene.add(stage);
    const DESIGN_W = 480;
    const DESIGN_H = 340;
    const objs = {};
    const objList = [];

    function makeObj(name, z) {
      const g = new T.Group();
      g.position.z = z;
      g.visible = false;
      stage.add(g);
      const o = {
        name, g, z, w: 0, h: 0, mats: [],
        cur: { x: 0, y: 0, s: 0.4, o: 0, r: 0 },
        vel: { x: 0, y: 0, s: 0, r: 0 },
        tgt: { x: 0, y: 0, s: 0.4, o: 0, r: 0 },
        shown: false, wasShown: false, snap: false, bob: 1, phase: Math.random() * Math.PI * 2,
      };
      o.add = (mesh) => {
        g.add(mesh);
        o.mats.push(mesh.material);
        return mesh;
      };
      objs[name] = o;
      objList.push(o);
      return o;
    }

    function addLabel(o, text, y, z) {
      const lb = makeText(text, { size: 13, weight: 500 });
      lb.mesh.position.set(0, y, z == null ? 0.3 : z);
      o.add(lb.mesh);
      o.label = lb;
      o.defaultLabel = text;
    }

    function makeDoc(name, z, opt) {
      const w = opt.w; const h = opt.h;
      const f = Math.round(Math.min(w, h) * 0.2);
      const o = makeObj(name, z);
      o.w = w; o.h = h;
      o.add(shadowMesh(w * 1.25, -h / 2 - 4));
      const stroke = o.add(new T.Mesh(new T.ShapeGeometry(docShape(w + 3, h + 3, f + 1, 10)), M('paperEdge')));
      stroke.position.z = -0.2;
      o.add(new T.Mesh(new T.ShapeGeometry(docShape(w, h, f, 9)), M('paper')));
      const fold = o.add(new T.Mesh(new T.ShapeGeometry(foldShape(w, h, f)), M('paperEdge')));
      fold.position.z = 0.05;

      let top = h / 2 - 28;
      if (opt.badge) {
        const bw = opt.badge.w || 34;
        const pill = o.add(new T.Mesh(new T.ShapeGeometry(roundRect(bw, 20, 6)), M(opt.badge.key)));
        pill.position.set(-w / 2 + 12 + bw / 2, h / 2 - 22, 0.1);
        const tx = makeText(opt.badge.text, { size: 11, weight: 700, key: opt.badge.ink });
        tx.mesh.position.set(pill.position.x, pill.position.y, 0.2);
        o.add(tx.mesh);
        top = h / 2 - 48;
      }

      o.bars = [];
      for (let i = 0; i < (opt.bars || 0); i++) {
        const geo = new T.PlaneGeometry(1, 7);
        geo.translate(0.5, 0, 0);
        const key = opt.barKeys ? opt.barKeys[i % opt.barKeys.length] : 'ink';
        const bar = o.add(new T.Mesh(geo, M(key)));
        bar.position.set(-w / 2 + 14, top - i * 15, 0.1);
        bar.scale.x = 0.0001;
        o.bars.push({ mesh: bar, cur: 0, vel: 0, tgt: 0, full: w - 28 });
      }
      o.defaultBars = opt.defaultBars || null;

      if (opt.beam) {
        const beam = new T.Group();
        const glow = new T.Mesh(new T.PlaneGeometry(w + 18, 22), M('accent', 0.16));
        const line = new T.Mesh(new T.PlaneGeometry(w + 18, 3), M('accent', 0.95));
        beam.add(glow); beam.add(line);
        o.mats.push(glow.material, line.material);
        beam.position.z = 0.4;
        beam.visible = false;
        o.g.add(beam);
        o.beam = beam;
        o.beamP = null;
      }
      if (opt.label != null) addLabel(o, opt.label, -h / 2 - 22);
      return o;
    }

    function makeFolder(name, z, opt) {
      const w = opt.w || 136; const h = opt.h || 96;
      const o = makeObj(name, z);
      o.w = w; o.h = h;
      o.add(shadowMesh(w * 1.2, -h / 2 - 4));
      o.add(new T.Mesh(new T.ShapeGeometry(folderShape(w, h, 10, 14)), M('folderTab')));
      const front = o.add(new T.Mesh(new T.ShapeGeometry(roundRect(w, h * 0.8, 10)), M('folder')));
      front.position.set(0, -h * 0.1, 3);
      const shine = o.add(new T.Mesh(new T.PlaneGeometry(w - 30, 2.5), M('white', 0.35)));
      shine.position.set(0, h * 0.3 - 9, 3.1);
      if (opt.label) addLabel(o, opt.label, -h / 2 - 22, 3.2);
      return o;
    }

    function makeHex(name, z, opt) {
      const r = opt.r || 50;
      const o = makeObj(name, z);
      o.w = r * 2; o.h = r * 2;
      o.add(shadowMesh(r * 2.3, -r - 4));
      const edge = o.add(new T.Mesh(new T.CircleGeometry(r + 4, 6), M('nodeEdge')));
      edge.rotation.z = Math.PI / 6;
      edge.position.z = -0.2;
      const fill = o.add(new T.Mesh(new T.CircleGeometry(r, 6), M('node')));
      fill.rotation.z = Math.PI / 6;
      const tx = makeText('fs', { size: 30, weight: 700, key: 'white' });
      tx.mesh.position.z = 0.2;
      o.add(tx.mesh);
      if (opt.label) addLabel(o, opt.label, -r - 24);
      return o;
    }

    function makeOp(name, z) {
      const o = makeObj(name, z);
      const tx = makeText('', { size: 15, weight: 600, key: 'accent' });
      o.add(tx.mesh);
      o.text = tx;
      o.fixedBob = 0;
      return o;
    }

    makeFolder('src', 4, { label: 'src/' });
    makeFolder('backup', 4, { label: 'copias/' });
    makeFolder('temp', 4, { label: './temporal' });
    makeFolder('dest', 4, { label: '~/destino_node' });
    makeHex('mod', 7, { r: 50, label: 'módulo fs' });
    makeDoc('pkg', 8, { w: 84, h: 104, label: 'package.json', badge: { text: '{ }', key: 'pkg', ink: 'white' }, bars: 4, defaultBars: [0.6, 0.8, 0.5, 0.7] });
    makeDoc('fsjs', 9, { w: 84, h: 104, label: 'fs.js', badge: { text: 'JS', key: 'js', ink: 'jsInk' }, bars: 4, barKeys: ['accent', 'pink', 'ink', 'accent2'], defaultBars: [0.7, 0.5, 0.82, 0.4] });
    makeDoc('doc', 10, { w: 124, h: 156, label: 'ejemplo.txt', bars: 5, beam: true });
    makeDoc('copy', 12, { w: 124, h: 156, bars: 5 });
    makeOp('op', 30);

    /* ---------- Partículas ---------- */
    const MAXP = reduce ? 300 : 800;
    const pPos = new Float32Array(MAXP * 3);
    const pCol = new Float32Array(MAXP * 3);
    const pSize = new Float32Array(MAXP);
    const pAlpha = new Float32Array(MAXP);
    const pGeo = new T.BufferGeometry();
    pGeo.setAttribute('position', new T.BufferAttribute(pPos, 3));
    pGeo.setAttribute('aColor', new T.BufferAttribute(pCol, 3));
    pGeo.setAttribute('aSize', new T.BufferAttribute(pSize, 1));
    pGeo.setAttribute('aAlpha', new T.BufferAttribute(pAlpha, 1));
    const pMat = new T.ShaderMaterial({
      uniforms: { uScale: { value: 1 }, uDpr: { value: DPR } },
      vertexShader: `
        attribute vec3 aColor; attribute float aSize; attribute float aAlpha;
        uniform float uScale; uniform float uDpr;
        varying vec3 vColor; varying float vAlpha;
        void main() {
          vColor = aColor; vAlpha = aAlpha;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uScale * uDpr;
        }`,
      fragmentShader: `
        varying vec3 vColor; varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          gl_FragColor = vec4(vColor, smoothstep(0.5, 0.2, d) * vAlpha);
        }`,
      transparent: true, depthWrite: false, depthTest: false,
    });
    const points = new T.Points(pGeo, pMat);
    points.frustumCulled = false;
    points.position.z = 40;
    stage.add(points);

    const parts = Array.from({ length: MAXP }, () => ({ alive: false, size: 0, r: 0, g: 0, b: 0 }));
    let pCursor = 0;
    const tmpColor = new T.Color();

    function spawn() {
      for (let i = 0; i < MAXP; i++) {
        const idx = (pCursor + i) % MAXP;
        if (!parts[idx].alive) { pCursor = (idx + 1) % MAXP; return parts[idx]; }
      }
      const p = parts[pCursor];
      pCursor = (pCursor + 1) % MAXP;
      return p;
    }
    function tint(p, key) {
      tmpColor.set(P[key] || key);
      p.r = tmpColor.r; p.g = tmpColor.g; p.b = tmpColor.b;
    }
    const rand = (a, b) => a + Math.random() * (b - a);

    function burst(x, y, w, h, n, keys, o) {
      o = o || {};
      for (let i = 0; i < n; i++) {
        const p = spawn();
        p.alive = true; p.mode = 0;
        p.x = x + (Math.random() - 0.5) * w;
        p.y = y + (Math.random() - 0.5) * h;
        const ang = Math.atan2(p.y - y, p.x - x) + (Math.random() - 0.5) * 0.9;
        const sp = (o.speed || 160) * rand(0.4, 1.4);
        p.vx = Math.cos(ang) * sp;
        p.vy = Math.sin(ang) * sp + (o.lift || 60);
        p.grav = o.gravity == null ? -260 : o.gravity;
        p.drag = o.drag == null ? 1.6 : o.drag;
        p.life = 0;
        p.max = (o.life || 1.1) * rand(0.6, 1.3);
        p.size = (o.size || 6) * rand(0.5, 1.5);
        tint(p, keys[i % keys.length]);
      }
    }
    function flowParticle(ax, ay, bx, by, key, o) {
      o = o || {};
      const p = spawn();
      p.alive = true; p.mode = 1;
      p.ax = ax; p.ay = ay; p.bx = bx; p.by = by;
      const dx = bx - ax; const dy = by - ay;
      const len = Math.hypot(dx, dy) || 1;
      const off = (Math.random() - 0.5) * (o.spread || 90) + (o.arc || 40);
      p.cx = (ax + bx) / 2 - (dy / len) * off;
      p.cy = (ay + by) / 2 + (dx / len) * off;
      p.life = 0;
      p.max = (o.life || 0.95) * rand(0.8, 1.2);
      p.size = (o.size || 5) * rand(0.6, 1.4);
      tint(p, key);
    }
    function sparkle(x, y, w, h, n, key) {
      for (let i = 0; i < n; i++) {
        const p = spawn();
        p.alive = true; p.mode = 2;
        const side = Math.random() < 0.5;
        p.x = x + (side ? (Math.random() < 0.5 ? -1 : 1) * w / 2 : (Math.random() - 0.5) * w);
        p.y = y + (side ? (Math.random() - 0.5) * h : (Math.random() < 0.5 ? -1 : 1) * h / 2);
        p.vx = rand(-14, 14); p.vy = rand(18, 46);
        p.grav = 0; p.drag = 0.4;
        p.life = 0; p.max = rand(0.9, 1.7);
        p.size = rand(4, 8);
        tint(p, key || 'accent2');
      }
    }
    function confetti(x, y, n) {
      const keys = ['accent', 'accent2', 'pink', 'js', 'amber'];
      for (let i = 0; i < n; i++) {
        const p = spawn();
        p.alive = true; p.mode = 0;
        p.x = x + rand(-10, 10); p.y = y + rand(-10, 10);
        const ang = Math.PI / 2 + rand(-1.1, 1.1);
        const sp = rand(200, 420);
        p.vx = Math.cos(ang) * sp; p.vy = Math.sin(ang) * sp;
        p.grav = -520; p.drag = 1.1;
        p.life = 0; p.max = rand(1.4, 2.4);
        p.size = rand(6, 11);
        tint(p, keys[i % keys.length]);
      }
    }
    const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    function stepParticles(dt) {
      for (let i = 0; i < MAXP; i++) {
        const p = parts[i];
        let a = 0;
        if (p.alive) {
          p.life += dt;
          const k = p.life / p.max;
          if (k >= 1) {
            p.alive = false;
          } else if (p.mode === 1) {
            const t = easeInOut(k); const u = 1 - t;
            p.x = u * u * p.ax + 2 * u * t * p.cx + t * t * p.bx;
            p.y = u * u * p.ay + 2 * u * t * p.cy + t * t * p.by;
            a = Math.sin(Math.PI * k);
          } else {
            const damp = Math.exp(-p.drag * dt);
            p.vx *= damp;
            p.vy = p.vy * damp + p.grav * dt;
            p.x += p.vx * dt; p.y += p.vy * dt;
            a = p.mode === 2 ? (0.55 + 0.45 * Math.sin(p.life * 16)) * (1 - k) : 1 - k * k;
          }
        }
        pPos[i * 3] = p.alive ? p.x : 0;
        pPos[i * 3 + 1] = p.alive ? p.y : 0;
        pCol[i * 3] = p.r; pCol[i * 3 + 1] = p.g; pCol[i * 3 + 2] = p.b;
        pSize[i] = p.size;
        pAlpha[i] = p.alive ? a : 0;
      }
      pGeo.attributes.position.needsUpdate = true;
      pGeo.attributes.aColor.needsUpdate = true;
      pGeo.attributes.aSize.needsUpdate = true;
      pGeo.attributes.aAlpha.needsUpdate = true;
    }

    /* ---------- Fondo: rejilla de puntos ---------- */
    const gridMat = new T.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new T.Vector2(-99999, -99999) },
        uPulse: { value: new T.Vector3(0, 0, 99) },
        uColor: { value: new T.Color(P.dot) },
        uAccent: { value: new T.Color(P.accent) },
        uDpr: { value: DPR },
        uWave: { value: reduce ? 0 : 1 },
      },
      vertexShader: `
        uniform float uTime; uniform vec2 uMouse; uniform vec3 uPulse; uniform float uDpr; uniform float uWave;
        varying float vA; varying float vM;
        void main() {
          vec2 p = position.xy;
          float m = smoothstep(210.0, 0.0, distance(p, uMouse));
          float pd = distance(p, uPulse.xy);
          float ring = uPulse.z * 1100.0;
          float pulse = exp(-pow((pd - ring) / 70.0, 2.0)) * exp(-uPulse.z * 1.8);
          float wave = 0.5 + 0.5 * sin(p.x * 0.011 + p.y * 0.007 + uTime * 0.9 * uWave);
          p += normalize(p - uMouse + vec2(0.001)) * m * 14.0;
          p += normalize(p - uPulse.xy + vec2(0.001)) * pulse * 10.0;
          vA = 0.26 + 0.24 * wave + 0.55 * m + 0.9 * pulse;
          vM = clamp(m * 1.2 + pulse, 0.0, 1.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, position.z, 1.0);
          gl_PointSize = (1.7 + 0.7 * wave + 2.2 * m + 3.0 * pulse) * uDpr;
        }`,
      fragmentShader: `
        uniform vec3 uColor; uniform vec3 uAccent;
        varying float vA; varying float vM;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          gl_FragColor = vec4(mix(uColor, uAccent, vM), min(smoothstep(0.5, 0.15, d) * vA, 1.0));
        }`,
      transparent: true, depthWrite: false, depthTest: false,
    });
    let grid = null;
    function buildGrid() {
      if (grid) { scene.remove(grid); grid.geometry.dispose(); }
      const gap = W < 700 ? 24 : 30;
      const cols = Math.ceil(W / gap) + 2;
      const rows = Math.ceil(H / gap) + 2;
      const arr = new Float32Array(cols * rows * 3);
      let k = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          arr[k++] = (c - (cols - 1) / 2) * gap;
          arr[k++] = (r - (rows - 1) / 2) * gap;
          arr[k++] = -100;
        }
      }
      const geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.BufferAttribute(arr, 3));
      grid = new T.Points(geo, gridMat);
      grid.frustumCulled = false;
      scene.add(grid);
    }
    buildGrid();

    /* ---------- Fondo: glifos de código ---------- */
    const GLYPHS = ['{ }', '( )', ';', '=>', 'fs', '</>', '[ ]', '//', '.txt', 'utf-8', '\\n', 'const', 'node', 'Sync'];
    const glyphs = GLYPHS.map((g) => {
      const t = makeText(g, { size: rand(14, 30), weight: 500, key: 'glyph' });
      t.mesh.position.set(rand(-W / 2, W / 2), rand(-H / 2, H / 2), -60);
      t.mesh.rotation.z = rand(-0.25, 0.25);
      scene.add(t.mesh);
      return { mesh: t.mesh, speed: rand(6, 16), depth: rand(0.3, 1), baseX: t.mesh.position.x, phase: rand(0, 6) };
    });

    const mouse = { x: 0, y: 0, nx: 0, ny: 0 };
    window.addEventListener('pointermove', (e) => {
      mouse.x = e.clientX - W / 2;
      mouse.y = H / 2 - e.clientY;
      mouse.nx = mouse.x / (W / 2);
      mouse.ny = mouse.y / (H / 2);
      gridMat.uniforms.uMouse.value.set(mouse.x, mouse.y);
    }, { passive: true });
    document.addEventListener('pointerleave', () => gridMat.uniforms.uMouse.value.set(-99999, -99999));

    function stepGlyphs(dt, time) {
      glyphs.forEach((g) => {
        if (!reduce) g.mesh.position.y += g.speed * dt;
        if (g.mesh.position.y > H / 2 + 60) {
          g.mesh.position.y = -H / 2 - 60;
          g.baseX = rand(-W / 2, W / 2);
        }
        g.mesh.position.x = g.baseX + Math.sin(time * 0.2 + g.phase) * 20 - mouse.nx * 18 * g.depth;
      });
    }

    /* ---------- Alineación del escenario con el DOM ---------- */
    let stageEl = pending.el;
    let stageScale = 1;
    function updateStage() {
      if (!stageEl) { stage.visible = false; return; }
      const r = stageEl.getBoundingClientRect();
      if (r.width < 10 || r.height < 10) { stage.visible = false; return; }
      stage.visible = true;
      stageScale = Math.max(0.4, Math.min(r.width / DESIGN_W, r.height / DESIGN_H)) * 0.96;
      stage.position.set(r.left + r.width / 2 - W / 2, H / 2 - (r.top + r.height / 2), 0);
      stage.scale.set(stageScale, stageScale, 1);
      pMat.uniforms.uScale.value = stageScale;
    }

    /* ---------- Física de resortes para cada objeto ---------- */
    const PROPS = ['x', 'y', 's', 'r'];
    let time = 0;
    function stepObj(o, dt) {
      const cur = o.cur; const v = o.vel; const tg = o.tgt;
      if (o.snap) {
        PROPS.forEach((p) => { cur[p] = tg[p]; v[p] = 0; });
        cur.o = tg.o;
      } else {
        PROPS.forEach((p) => {
          v[p] += (170 * (tg[p] - cur[p]) - 18 * v[p]) * dt;
          cur[p] += v[p] * dt;
        });
        cur.o += (tg.o - cur.o) * (1 - Math.exp(-dt * 9));
      }
      if (o.bars) {
        o.bars.forEach((b) => {
          if (o.snap) { b.cur = b.tgt; b.vel = 0; } else {
            b.vel += (140 * (b.tgt - b.cur) - 17 * b.vel) * dt;
            b.cur += b.vel * dt;
          }
          b.mesh.scale.x = Math.max(0.0001, b.cur * b.full);
          b.mesh.visible = b.cur > 0.003;
        });
      }
      const op = Math.max(0, Math.min(1, cur.o));
      o.g.visible = op > 0.004;
      o.wasShown = o.shown;
      if (!o.g.visible) return;
      const bob = reduce ? 0 : Math.sin(time * 1.3 + o.phase) * 3.5 * o.bob;
      o.g.position.x = cur.x;
      o.g.position.y = cur.y + bob;
      const s = Math.max(cur.s, 0.001);
      o.g.scale.set(s, s, 1);
      o.g.rotation.z = cur.r + (reduce ? 0 : Math.sin(time * 0.9 + o.phase) * 0.025 * o.bob);
      o.mats.forEach((m) => { m.opacity = m.userData.base * op; });
      if (o.beam) {
        if (o.beamP == null) o.beam.visible = false;
        else {
          o.beam.visible = true;
          o.beam.position.y = o.h / 2 - 18 - o.beamP * (o.h - 36);
        }
      }
    }

    /* ---------- Guiones de cada estado ---------- */
    let state = null;
    let stateName = null;
    let stateT0 = 0;
    let fired = new Set();
    let acc = {};
    let lastPhase = -1;

    const ctx = {
      t: 0,
      dt: 0,
      show(name, x, y, s, o) {
        const ob = objs[name];
        if (!ob) return;
        o = o || {};
        s = s == null ? 1 : s;
        ob.shown = true;
        const tg = ob.tgt;
        tg.x = x; tg.y = y; tg.s = s; tg.o = o.o == null ? 1 : o.o; tg.r = o.r || 0;
        ob.snap = !!o.snap;
        ob.bob = o.bob != null ? o.bob : (ob.fixedBob != null ? ob.fixedBob : 1);
        ob.g.position.z = o.z == null ? ob.z : o.z;
        const popIn = !ob.wasShown && ob.cur.o < 0.04;
        if (popIn && !ob.snap) {
          // Aparece "saltando": parte pequeño y el resorte lo lleva a su tamaño.
          ob.cur.x = x; ob.cur.y = y; ob.cur.s = s * 0.3; ob.vel.s = 0;
          ob.cur.r = tg.r + (Math.random() - 0.5) * 0.4;
          if (ob.bars) ob.bars.forEach((b) => { b.cur = 0; b.vel = 0; });
        }
        if (ob.bars) {
          const b = o.bars || ob.defaultBars || [];
          ob.bars.forEach((bar, i) => { bar.tgt = b[i] != null ? b[i] : 0; });
        }
        if (ob.beam) ob.beamP = o.beam == null ? null : o.beam;
        if (ob.text && o.text != null) ob.text.set(o.text);
        if (ob.label && ob.defaultLabel) ob.label.set(o.label || ob.defaultLabel);
      },
      once(id) {
        if (fired.has(id)) return false;
        fired.add(id);
        return true;
      },
      cyc(period) {
        const k = Math.floor(this.t / period);
        return { k, t: this.t - k * period };
      },
      flow(id, ax, ay, bx, by, key, rate, o) {
        acc[id] = (acc[id] || 0) + this.dt;
        const step = 1 / (reduce ? rate / 2 : rate);
        while (acc[id] > step) { acc[id] -= step; flowParticle(ax, ay, bx, by, key, o); }
      },
      every(id, rate, fn) {
        acc[id] = (acc[id] || 0) + this.dt;
        const step = 1 / rate;
        while (acc[id] > step) { acc[id] -= step; fn(); }
      },
      shatter(name) {
        const ob = objs[name];
        const s = ob.cur.s;
        burst(ob.cur.x, ob.cur.y, ob.w * s, ob.h * s, reduce ? 40 : 120, ['ink', 'paperEdge', 'accent', 'ink', 'pink'], { speed: 210, life: 1.3, size: 7, gravity: -330, lift: 90 });
        ob.cur.o = 0;
      },
      sparkle,
      confetti,
      phase(p) {
        if (p !== lastPhase) { lastPhase = p; emit('phase', p); }
      },
    };

    function typingBars(t) {
      const L = [0.86, 0.7, 0.92, 0.55, 0.78];
      const c = t % 6.5;
      if (c > 5.8) return L.map(() => 0);
      const p = Math.min(c / 4.2, 1) * L.length;
      return L.map((w, i) => w * Math.max(0, Math.min(1, p - i)));
    }
    const BARS_1 = [0.86];
    const BARS_3 = [0.86, 0, 0.92, 0.5];

    function treeState(bars, label, beam) {
      return {
        update(c) {
          c.show('pkg', -170, 66, 0.74, { r: -0.05 });
          c.show('src', -170, -74, 0.74);
          c.show('doc', 70, 4, 1.15, { bars, beam: beam ? (c.t % 2.2) / 2.2 : null });
          const { k, t } = c.cyc(2.4);
          if (t > 0.1 && c.once('s' + k)) c.sparkle(70, 4, 150, 180, 8);
          c.show('op', 70, -146, 1, { text: label });
        },
      };
    }

    const STATES = {
      cover: {
        update(c) {
          c.show('doc', 0, 4, 1.12, { bars: typingBars(c.t) });
          c.show('pkg', -178, 74, 0.8, { r: -0.14 });
          c.show('fsjs', 180, 66, 0.84, { r: 0.12 });
          c.show('src', -168, -90, 0.74, { r: 0.05 });
          c.show('mod', 176, -92, 0.76, { r: -0.06 });
          const { k, t } = c.cyc(1.8);
          if (t > 0.2 && c.once('sp' + k)) c.sparkle(0, 4, 150, 180, 10);
        },
      },
      cycle: {
        update(c) {
          const PH = 2.6;
          const { k, t } = c.cyc(PH * 4);
          const ph = Math.floor(t / PH);
          const lt = t - ph * PH;
          c.phase(ph);
          c.show('op', 0, -140, 1, { text: ['writeFileSync()', 'readFileSync()', 'appendFileSync()', 'unlinkSync()'][ph] });
          if (ph === 0) {
            c.show('doc', 0, 18, 1.1, { bars: lt > 0.35 ? BARS_1 : [0] });
            if (lt > 0.3 && c.once('s' + k)) c.sparkle(0, 18, 140, 170, 12);
          } else if (ph === 1) {
            c.show('doc', 0, 18, 1.1, { bars: BARS_1, beam: Math.min(lt / (PH * 0.8), 1) });
          } else if (ph === 2) {
            c.show('doc', 0, 18, 1.1, { bars: lt > 0.3 ? BARS_3 : BARS_1 });
            if (lt > 0.3 && c.once('a' + k)) c.sparkle(0, -10, 120, 60, 10, 'pink');
          } else if (lt < 0.7) {
            c.show('doc', 0, 18, 1.1, { bars: BARS_3 });
          } else if (c.once('x' + k)) {
            c.shatter('doc');
          }
        },
      },
      init: {
        update(c) {
          c.show('pkg', 0, 16, 1.5);
          if (c.t > 0.25 && c.once('a')) c.sparkle(0, 16, 140, 170, 18);
          c.show('op', 0, -150, 1, { text: 'npm init -y' });
        },
      },
      mkdir: {
        update(c) {
          c.show('pkg', -165, 40, 0.9, { r: -0.08 });
          c.show('src', 50, -6, 1.4);
          if (c.t > 0.8) {
            c.show('fsjs', 50, 32, 0.78, { r: 0.06, z: 5.5, bob: 0.3 });
            if (c.once('a')) c.sparkle(50, 40, 90, 90, 12);
          }
          c.show('op', 0, -152, 1, { text: 'src/fs.js' });
        },
      },
      module: {
        update(c) {
          c.show('fsjs', -140, 10, 1.3);
          c.show('mod', 140, 10, 1.25);
          c.flow('m', 140, 10, -140, 10, 'node', 18, { arc: 50 });
          c.show('op', 0, -150, 1, { text: "require('fs')" });
        },
      },
      write: {
        update(c) {
          c.show('fsjs', -150, 10, 1.1);
          if (c.t > 0.4) {
            c.show('doc', 100, 10, 1.12, { bars: c.t > 0.9 ? BARS_1 : [0] });
            if (c.once('s')) c.sparkle(100, 10, 140, 175, 14);
          }
          c.flow('w', -150, 10, 100, 10, 'accent', 14, { arc: 60 });
          c.show('op', 0, -150, 1, { text: 'writeFileSync()' });
        },
      },
      tree1: treeState(BARS_1, 'ejemplo.txt creado'),
      tree2: treeState(BARS_1, 'File content: Hola…', true),
      tree3: treeState(BARS_3, 'ejemplo.txt actualizado'),
      read: {
        update(c) {
          c.show('fsjs', -150, 10, 1.1);
          c.show('doc', 100, 10, 1.12, { bars: BARS_1, beam: (c.t % 1.8) / 1.8 });
          c.flow('r', 100, 10, -150, 10, 'accent2', 14, { arc: -60 });
          c.show('op', 0, -150, 1, { text: "readFileSync(…, 'utf-8')" });
        },
      },
      append: {
        update(c) {
          const { k, t } = c.cyc(4);
          c.show('fsjs', -150, 10, 1.1);
          c.show('doc', 100, 10, 1.12, { bars: t > 0.7 ? BARS_3 : BARS_1 });
          c.flow('ap', -150, 10, 100, 10, 'pink', 14, { arc: 60 });
          if (t > 0.7 && c.once('s' + k)) c.sparkle(100, -16, 120, 60, 12, 'pink');
          c.show('op', 0, -150, 1, { text: 'appendFileSync()' });
        },
      },
      del: {
        update(c) {
          const { k, t } = c.cyc(3.4);
          c.show('fsjs', -150, 10, 1.1);
          if (t > 0.8 && t < 1.6) c.flow('d', -150, 10, 100, 10, 'pink', 22, { arc: 40 });
          if (t < 1.6) c.show('doc', 100, 10, 1.12, { bars: BARS_3 });
          else if (c.once('x' + k)) c.shatter('doc');
          c.show('op', 0, -150, 1, { text: 'unlinkSync()' });
        },
      },
      copy: {
        update(c) {
          const BX = 140; const BY = -20;
          const { k, t } = c.cyc(5.2);
          c.show('backup', BX, BY, 1.2);
          if (t < 2.6) c.show('doc', -130, 10, 1.0, { bars: BARS_3 });
          else if (c.once('x' + k)) c.shatter('doc');
          if (t > 0.6) {
            const p = Math.min((t - 0.6) / 1.3, 1);
            const e = easeInOut(p); const u = 1 - e;
            const sx = -130; const sy = 10; const ex = BX; const ey = BY + 26; const cx = 0; const cy = 150;
            const x = u * u * sx + 2 * u * e * cx + e * e * ex;
            const y = u * u * sy + 2 * u * e * cy + e * e * ey;
            c.show('copy', x, y, 1.0 - 0.48 * e, { bars: BARS_3, snap: true, r: Math.sin(e * Math.PI) * 0.25, z: p < 1 ? 20 : 5.5, bob: 0 });
            if (p < 1) c.every('tr', 40, () => c.sparkle(x, y, 30, 30, 1, 'accent'));
            else if (c.once('in' + k)) c.sparkle(BX, BY + 30, 120, 60, 14);
          }
          c.show('op', 0, -152, 1, { text: t < 2.6 ? 'copyFileSync()' : 'unlinkSync()' });
        },
      },
      move: {
        update(c) {
          const AX = -150; const BX = 150; const Y = -30; const SY = Y + 30;
          const { k, t } = c.cyc(5.6);
          c.show('temp', AX, Y, 1.15);
          c.show('dest', BX, Y, 1.15);
          let x = AX; let y = SY; let s = 0.55; let z = 5.5; let r = 0;
          const flying = t > 1.1 && t < 2.9;
          if (flying) {
            const e = easeInOut((t - 1.1) / 1.8); const u = 1 - e;
            x = u * u * AX + e * e * BX;
            y = u * u * SY + 2 * u * e * (SY + 190) + e * e * SY;
            s = 0.55 + Math.sin(e * Math.PI) * 0.3;
            z = 20;
            r = Math.sin(e * Math.PI * 2) * 0.2;
            c.every('tr', 40, () => c.sparkle(x, y, 24, 24, 1, 'accent'));
          } else if (t >= 2.9) {
            x = BX;
            if (c.once('in' + k)) c.sparkle(BX, SY, 110, 60, 14);
          }
          if (t < 4.9) c.show('doc', x, y, s, { bars: BARS_3, snap: flying, z, r, bob: flying ? 0 : 0.4, label: 'nota.txt' });
          c.show('op', 0, -152, 1, { text: 'renameSync(origen, destino)' });
        },
      },
      finale: {
        update(c) {
          const names = ['pkg', 'fsjs', 'src', 'mod'];
          c.show('doc', 0, 0, 1.0, { bars: BARS_3 });
          names.forEach((n, i) => {
            const a = c.t * 0.35 + i * Math.PI / 2;
            c.show(n, Math.cos(a) * 165, Math.sin(a) * 100, 0.62, { r: Math.sin(a) * 0.1 });
          });
          const { k } = c.cyc(2.4);
          if (c.once('c' + k)) c.confetti(rand(-150, 150), rand(40, 100), reduce ? 20 : 46);
        },
      },
    };

    function setState(name) {
      if (name === stateName) return;
      stateName = name;
      state = STATES[name] || STATES.cover;
      stateT0 = time;
      fired = new Set();
      acc = {};
      lastPhase = -1;
    }

    /* ---------- Pulso al cambiar de diapositiva ---------- */
    let pulseQueued = false;
    let pulseT0 = -100;

    /* ---------- Bucle principal ---------- */
    let last = performance.now();
    function frame() {
      requestAnimationFrame(frame);
      // El timestamp de rAF puede quedar detrás de performance.now(): un dt negativo descontrola los resortes.
      const now = performance.now();
      const dt = Math.min(Math.max((now - last) / 1000, 0), 1 / 30);
      last = now;
      time += dt;

      updateStage();
      if (pulseQueued) {
        pulseQueued = false;
        pulseT0 = time;
        gridMat.uniforms.uPulse.value.x = stage.position.x;
        gridMat.uniforms.uPulse.value.y = stage.position.y;
      }
      gridMat.uniforms.uPulse.value.z = Math.min(time - pulseT0, 99);
      gridMat.uniforms.uTime.value = time;

      ctx.t = time - stateT0;
      ctx.dt = dt;
      objList.forEach((o) => { o.shown = false; });
      if (state) state.update(ctx);
      objList.forEach((o) => {
        if (!o.shown) {
          o.tgt.o = 0;
          o.snap = false;
          if (o.beam) o.beamP = null;
        }
        stepObj(o, dt);
      });
      stepParticles(dt);
      stepGlyphs(dt, time);
      renderer.render(scene, camera);
    }

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      camera.left = -W / 2; camera.right = W / 2; camera.top = H / 2; camera.bottom = -H / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H, false);
      buildGrid();
    }
    window.addEventListener('resize', resize);

    function applyTheme() {
      readPalette();
      tinted.forEach(({ m, key }) => m.color.set(P[key]));
      redraws.forEach((draw) => draw());
      gridMat.uniforms.uColor.value.set(P.dot);
      gridMat.uniforms.uAccent.value.set(P.accent);
    }
    document.addEventListener('themechange', applyTheme);

    // API pública
    api.setState = setState;
    api.setStageEl = (el) => { stageEl = el; };
    api.pulse = () => { pulseQueued = true; };
    api.confetti = () => {
      for (let i = 0; i < 3; i++) setTimeout(() => confetti(rand(-160, 160), rand(-40, 60), reduce ? 20 : 50), i * 220);
    };
    api.setTheme = applyTheme;
    api.renderNow = () => renderer.render(scene, camera);
    api.ready = true;

    if (pending.state) setState(pending.state);
    stageEl = pending.el;
    document.documentElement.classList.add('webgl-ready');
    requestAnimationFrame(frame);
  }
})(window.Deck);
