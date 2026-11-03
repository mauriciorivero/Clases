/*
 * Escena 2D con three.js (cámara ortográfica en píxeles).
 * Capas: rejilla de puntos con ondas · figuras flotantes (paquetes, llaves, símbolos de código)
 * unidas como un grafo de dependencias · partículas para estallidos y confeti.
 * Reacciona al cambio de diapositiva (paneo con parallax y onda expansiva), al puntero y al tema.
 */
(function () {
  'use strict';

  var THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
  var canvas = document.getElementById('stage');
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var api = { ready: false, burst: function () {}, celebrate: function () {} };
  window.Stage = api;

  function fail(err) {
    root.classList.add('no-stage');
    if (err) console.warn('[stage] Fondo animado no disponible:', err);
  }

  if (!canvas) return;
  import(THREE_URL).then(function (THREE) {
    var fontReady = document.fonts && document.fonts.load
      ? Promise.race([document.fonts.load('600 64px "Geist Mono"'), new Promise(function (r) { setTimeout(r, 1500); })])
      : Promise.resolve();
    return fontReady.then(function () { start(THREE); }, function () { start(THREE); });
  }).catch(fail);

  function start(THREE) {
    THREE.ColorManagement.enabled = false;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch (e) { fail(e); return; }
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    var W = window.innerWidth;
    var H = window.innerHeight;
    renderer.setSize(W, H, false);

    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, -100, 100);
    camera.position.z = 10;

    /* ---------- Colores del tema ---------- */
    var col = {
      dot: new THREE.Color('#ffffff'),
      line: new THREE.Color('#ffffff'),
      shape: new THREE.Color('#ffffff'),
      accent: new THREE.Color('#52a8ff'),
      accentTarget: new THREE.Color('#52a8ff'),
      strength: 1,
      light: false
    };
    var PHASE_INDEX = { intro: 1, '0': 0, '1': 1, '2': 2, '3': 3, final: 0 };

    function cssVar(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }
    function phaseColor(n) { return cssVar((col.light ? '--p' : '--pd') + n) || '#52a8ff'; }

    function readTheme() {
      col.light = root.getAttribute('data-theme') === 'light';
      col.dot.set(cssVar('--scene-dot') || '#ffffff');
      col.line.set(cssVar('--scene-line') || '#ffffff');
      col.shape.set(cssVar('--scene-shape') || '#ffffff');
      col.strength = parseFloat(cssVar('--scene-strength')) || 1;
      readAccent(true);
    }
    function readAccent(instant) {
      var n = PHASE_INDEX[root.getAttribute('data-phase')];
      col.accentTarget.set(phaseColor(n === undefined ? 1 : n));
      if (instant) col.accent.copy(col.accentTarget);
    }

    /* ---------- Rejilla de puntos ---------- */
    var SP = 34;
    var gridMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uOffset: { value: 0 },
        uSpan: { value: 1 },
        uHalf: { value: new THREE.Vector2(W / 2, H / 2) },
        uMouse: { value: new THREE.Vector2(99999, 99999) },
        uRippleC: { value: new THREE.Vector2(0, 0) },
        uRippleR: { value: 0 },
        uRippleS: { value: 0 },
        uColor: { value: col.dot },
        uAccent: { value: col.accent },
        uOpacity: { value: 0.22 },
        uPR: { value: renderer.getPixelRatio() }
      },
      vertexShader: [
        'uniform float uTime; uniform float uOffset; uniform float uSpan; uniform float uPR;',
        'uniform float uRippleR; uniform float uRippleS;',
        'uniform vec2 uHalf; uniform vec2 uMouse; uniform vec2 uRippleC;',
        'varying float vAlpha; varying float vAccent;',
        'void main() {',
        '  vec3 p = position;',
        '  p.x = mod(p.x + uOffset + uSpan * 0.5, uSpan) - uSpan * 0.5;',
        '  float wave = sin(p.x * 0.011 + uTime * 0.7) * cos(p.y * 0.013 - uTime * 0.5);',
        '  vec2 dm = p.xy - uMouse; float md = length(dm);',
        '  float m = smoothstep(210.0, 0.0, md);',
        '  if (md > 0.001) p.xy += dm / md * m * 9.0;',
        '  float rd = distance(p.xy, uRippleC);',
        '  float band = exp(-pow((rd - uRippleR) / 48.0, 2.0)) * uRippleS;',
        '  vec2 q = p.xy / uHalf;',
        '  float vig = 1.0 - smoothstep(0.3, 1.3, length(q * vec2(0.85, 1.0)));',
        '  vAlpha = (0.5 + 0.28 * wave + 0.9 * m + 1.4 * band) * (0.3 + 0.7 * vig);',
        '  vAccent = clamp(m * 0.9 + band * 1.3, 0.0, 1.0);',
        '  gl_PointSize = (1.8 + 0.5 * wave + 1.6 * m + 2.6 * band) * uPR;',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 uColor; uniform vec3 uAccent; uniform float uOpacity;',
        'varying float vAlpha; varying float vAccent;',
        'void main() {',
        '  float d = length(gl_PointCoord - 0.5);',
        '  if (d > 0.5) discard;',
        '  float a = smoothstep(0.5, 0.15, d);',
        '  gl_FragColor = vec4(mix(uColor, uAccent, vAccent), a * vAlpha * uOpacity);',
        '}'
      ].join('\n')
    });
    var grid = new THREE.Points(new THREE.BufferGeometry(), gridMat);
    grid.frustumCulled = false;
    scene.add(grid);

    function buildGrid() {
      var cols = Math.ceil((W + SP * 4) / SP);
      var rows = Math.ceil((H + SP * 4) / SP);
      var pos = new Float32Array(cols * rows * 3);
      var k = 0;
      for (var c = 0; c < cols; c++) {
        for (var r = 0; r < rows; r++) {
          pos[k++] = (c - cols / 2) * SP;
          pos[k++] = (r - rows / 2) * SP;
          pos[k++] = 0;
        }
      }
      grid.geometry.dispose();
      grid.geometry = new THREE.BufferGeometry();
      grid.geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      gridMat.uniforms.uSpan.value = cols * SP;
      gridMat.uniforms.uHalf.value.set(W / 2, H / 2);
    }

    /* ---------- Figuras flotantes ---------- */
    function v(x, y) { return new THREE.Vector3(x, y, 0); }

    function roundedRect(w, h, r) {
      var pts = [];
      var corners = [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, 0.5], [-w / 2 + r, -h / 2 + r, 1], [w / 2 - r, -h / 2 + r, 1.5]];
      corners.forEach(function (c) {
        for (var i = 0; i <= 6; i++) {
          var a = (c[2] + i / 12) * Math.PI;
          pts.push(v(c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r));
        }
      });
      return pts;
    }
    function polygon(n, rad, rot) {
      var pts = [];
      for (var i = 0; i < n; i++) {
        var a = rot + i / n * Math.PI * 2;
        pts.push(v(Math.cos(a) * rad, Math.sin(a) * rad));
      }
      return pts;
    }

    function makeLineObject(kind, mat) {
      var g;
      if (kind === 'box') return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(roundedRect(1, 1, 0.24)), mat);
      if (kind === 'ring') return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(polygon(48, 0.5, 0)), mat);
      if (kind === 'tri') return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(polygon(3, 0.55, Math.PI / 2)), mat);
      if (kind === 'plus') {
        return new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([v(-0.4, 0), v(0.4, 0), v(0, -0.4), v(0, 0.4)]), mat);
      }
      // 'pkg': cubo isométrico, como el ícono de un paquete
      g = new THREE.Group();
      var hex = polygon(6, 0.55, Math.PI / 2);
      g.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(hex), mat));
      g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([v(0, 0), hex[1], v(0, 0), hex[5], v(0, 0), hex[3]]), mat));
      return g;
    }

    var GLYPHS = ['{ }', '</>', '( )', '=>', ';', 'npm', '[ ]', '.js', '&&', '$_', '//', 'λ'];
    var glyphCache = {};
    function glyphTexture(text) {
      if (glyphCache[text]) return glyphCache[text];
      var c = document.createElement('canvas');
      var ctx = c.getContext('2d');
      var font = '600 64px "Geist Mono", ui-monospace, monospace';
      ctx.font = font;
      var w = Math.ceil(ctx.measureText(text).width) + 28;
      c.width = w;
      c.height = 96;
      ctx.font = font;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, w / 2, 50);
      var tex = new THREE.CanvasTexture(c);
      tex.minFilter = THREE.LinearFilter;
      glyphCache[text] = { tex: tex, aspect: w / 96 };
      return glyphCache[text];
    }

    var shapes = [];
    var shapeGroup = new THREE.Group();
    scene.add(shapeGroup);
    var KINDS = ['pkg', 'glyph', 'box', 'ring', 'glyph', 'pkg', 'tri', 'plus', 'glyph', 'box'];

    function rand(a, b) { return a + Math.random() * (b - a); }

    function buildShapes() {
      shapes.forEach(function (s) { shapeGroup.remove(s.obj); });
      shapes = [];
      var count = W < 760 ? 14 : W < 1200 ? 22 : 28;
      var spanX = W + 360;
      for (var i = 0; i < count; i++) {
        var kind = KINDS[i % KINDS.length];
        var depth = rand(0.25, 1);
        var s = {
          kind: kind,
          depth: depth,
          x0: (i / count) * spanX - spanX / 2 + rand(-40, 40),
          y0: rand(-H / 2 - 20, H / 2 + 20),
          size: (kind === 'glyph' ? rand(16, 30) : rand(18, 54)) * (0.6 + depth * 0.6),
          rot: rand(0, Math.PI * 2),
          rs: rand(-0.25, 0.25),
          fa: rand(6, 22),
          ff: rand(0.25, 0.6),
          ph: rand(0, Math.PI * 2),
          accent: Math.random() < 0.34,
          base: rand(0.08, 0.18) + depth * 0.16,
          ox: 0, oy: 0, vx: 0, vy: 0,
          x: 0, y: 0
        };
        if (kind === 'glyph') {
          var gt = glyphTexture(GLYPHS[i % GLYPHS.length]);
          s.mat = new THREE.SpriteMaterial({ map: gt.tex, transparent: true, depthWrite: false });
          s.obj = new THREE.Sprite(s.mat);
          s.aspect = gt.aspect;
        } else {
          s.mat = new THREE.LineBasicMaterial({ transparent: true, depthWrite: false });
          s.obj = makeLineObject(kind, s.mat);
        }
        shapeGroup.add(s.obj);
        shapes.push(s);
      }
      linkGeo.setDrawRange(0, 0);
    }

    /* ---------- Conexiones (grafo de dependencias) ---------- */
    var MAX_SEG = 28 * 27 / 2;
    var linkPos = new Float32Array(MAX_SEG * 6);
    var linkCol = new Float32Array(MAX_SEG * 8);
    var linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute('position', new THREE.BufferAttribute(linkPos, 3).setUsage(THREE.DynamicDrawUsage));
    linkGeo.setAttribute('color', new THREE.BufferAttribute(linkCol, 4).setUsage(THREE.DynamicDrawUsage));
    var links = new THREE.LineSegments(linkGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false }));
    links.frustumCulled = false;
    scene.add(links);

    /* ---------- Partículas ---------- */
    var PMAX = 800;
    var pPos = new Float32Array(PMAX * 3);
    var pCol = new Float32Array(PMAX * 3);
    var pSize = new Float32Array(PMAX);
    var pAlpha = new Float32Array(PMAX);
    var pRot = new Float32Array(PMAX);
    var pShape = new Float32Array(PMAX);
    var parts = [];
    for (var pi = 0; pi < PMAX; pi++) parts.push({ alive: false });
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3).setUsage(THREE.DynamicDrawUsage));
    pGeo.setAttribute('aColor', new THREE.BufferAttribute(pCol, 3).setUsage(THREE.DynamicDrawUsage));
    pGeo.setAttribute('aSize', new THREE.BufferAttribute(pSize, 1).setUsage(THREE.DynamicDrawUsage));
    pGeo.setAttribute('aAlpha', new THREE.BufferAttribute(pAlpha, 1).setUsage(THREE.DynamicDrawUsage));
    pGeo.setAttribute('aRot', new THREE.BufferAttribute(pRot, 1).setUsage(THREE.DynamicDrawUsage));
    pGeo.setAttribute('aShape', new THREE.BufferAttribute(pShape, 1).setUsage(THREE.DynamicDrawUsage));
    var pMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uPR: { value: renderer.getPixelRatio() } },
      vertexShader: [
        'attribute vec3 aColor; attribute float aSize; attribute float aAlpha; attribute float aRot; attribute float aShape;',
        'uniform float uPR;',
        'varying vec3 vColor; varying float vAlpha; varying float vRot; varying float vShape;',
        'void main() {',
        '  vColor = aColor; vAlpha = aAlpha; vRot = aRot; vShape = aShape;',
        '  gl_PointSize = aSize * uPR;',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'varying vec3 vColor; varying float vAlpha; varying float vRot; varying float vShape;',
        'void main() {',
        '  vec2 c = gl_PointCoord - 0.5;',
        '  float s = sin(vRot); float co = cos(vRot);',
        '  c = mat2(co, -s, s, co) * c;',
        '  float a;',
        '  if (vShape < 0.5) { a = smoothstep(0.5, 0.3, length(c)); }',
        '  else { vec2 q = abs(c); a = step(q.x, 0.46) * step(q.y, 0.2); }',
        '  if (a <= 0.0) discard;',
        '  gl_FragColor = vec4(vColor, a * vAlpha);',
        '}'
      ].join('\n')
    });
    var points = new THREE.Points(pGeo, pMat);
    points.frustumCulled = false;
    scene.add(points);
    var pCursor = 0;
    var pActive = 0;

    function spawn(o) {
      for (var n = 0; n < PMAX; n++) {
        var idx = (pCursor + n) % PMAX;
        if (!parts[idx].alive) {
          pCursor = (idx + 1) % PMAX;
          var p = parts[idx];
          p.alive = true;
          p.x = o.x; p.y = o.y; p.vx = o.vx; p.vy = o.vy;
          p.g = o.g; p.drag = o.drag || 0.9;
          p.life = p.max = o.life;
          p.size = o.size; p.shape = o.shape; p.rot = o.rot || 0; p.vr = o.vr || 0;
          p.sway = o.sway || 0; p.swayF = o.swayF || 3; p.t = Math.random() * 10;
          pCol[idx * 3] = o.color.r; pCol[idx * 3 + 1] = o.color.g; pCol[idx * 3 + 2] = o.color.b;
          pShape[idx] = o.shape;
          pActive++;
          return;
        }
      }
    }

    function palette() {
      return [0, 1, 2, 3].map(function (n) { return new THREE.Color(phaseColor(n)); }).concat([col.accent.clone()]);
    }

    function burst(clientX, clientY, o) {
      o = o || {};
      var x = clientX - W / 2;
      var y = H / 2 - clientY;
      var pal = palette();
      var count = reduceMotion ? 6 : (o.count || 24);
      for (var i = 0; i < count; i++) {
        var ang = rand(Math.PI * 0.15, Math.PI * 0.95);
        var sp = rand(140, 460);
        spawn({
          x: x, y: y,
          vx: Math.cos(ang) * sp * (Math.random() < 0.5 ? -1 : 1) * 0.8,
          vy: Math.sin(ang) * sp,
          g: 620, drag: 1.6,
          life: rand(0.6, 1.2),
          size: rand(4, 8),
          shape: Math.random() < 0.35 ? 1 : 0,
          rot: rand(0, 6.28), vr: rand(-8, 8),
          color: pal[i % pal.length]
        });
      }
    }

    function celebrate() {
      var pal = palette();
      var n = reduceMotion ? 40 : (W < 760 ? 120 : 220);
      for (var i = 0; i < n; i++) {
        spawn({
          x: rand(-W / 2, W / 2), y: H / 2 + rand(10, 260),
          vx: rand(-40, 40), vy: rand(-220, -60),
          g: 90, drag: 0.4,
          life: rand(3.2, 5),
          size: rand(8, 13), shape: 1,
          rot: rand(0, 6.28), vr: rand(-5, 5),
          sway: rand(20, 60), swayF: rand(1.5, 3.5),
          color: pal[i % pal.length]
        });
      }
      if (reduceMotion) return;
      // Dos "cañones" laterales
      [-1, 1].forEach(function (side) {
        for (var k = 0; k < 70; k++) {
          var ang = (side < 0 ? rand(55, 80) : rand(100, 125)) * Math.PI / 180;
          var sp = rand(620, 1000);
          spawn({
            x: side * (W / 2 - 10), y: -H / 2 + 10,
            vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
            g: 700, drag: 1.1,
            life: rand(2, 3.2),
            size: rand(7, 12), shape: Math.random() < 0.8 ? 1 : 0,
            rot: rand(0, 6.28), vr: rand(-9, 9),
            sway: rand(10, 30), swayF: rand(2, 4),
            color: pal[k % pal.length]
          });
        }
      });
    }

    /* ---------- Estado de animación ---------- */
    var mouse = { x: 99999, y: 99999, nx: 0, ny: 0, snx: 0, sny: 0 };
    var camX = 0;
    var camTarget = 0;
    var spin = 0;
    var ripple = { r: 0, s: 0, max: 1 };

    function panFor(index) { return index * Math.min(W, 1400) * 0.42; }

    window.addEventListener('pointermove', function (e) {
      mouse.x = e.clientX - W / 2;
      mouse.y = H / 2 - e.clientY;
      mouse.nx = (e.clientX / W - 0.5) * 2;
      mouse.ny = (0.5 - e.clientY / H) * 2;
    }, { passive: true });
    document.addEventListener('pointerleave', function () { mouse.x = mouse.y = 99999; });

    document.addEventListener('slidechange', function (e) {
      var d = e.detail;
      camTarget = panFor(d.index);
      if (reduceMotion) camX = camTarget;
      readAccent(false);
      if (reduceMotion) return;
      spin = 1;
      ripple.r = 0;
      ripple.s = 1;
      ripple.max = Math.hypot(W, H);
      gridMat.uniforms.uRippleC.value.set(d.dir > 0 ? W * 0.22 : -W * 0.22, rand(-H * 0.1, H * 0.1));
      shapes.forEach(function (s) {
        s.vx += -d.dir * rand(2, 7) * s.depth;
        s.vy += rand(-3, 3) * s.depth;
      });
    });

    document.addEventListener('themechange', function () {
      // Espera a que el CSS aplique las nuevas variables
      requestAnimationFrame(readTheme);
    });

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        W = window.innerWidth;
        H = window.innerHeight;
        renderer.setSize(W, H, false);
        camera.left = -W / 2; camera.right = W / 2; camera.top = H / 2; camera.bottom = -H / 2;
        camera.updateProjectionMatrix();
        buildGrid();
        buildShapes();
        camX = camTarget = panFor(Number(root.getAttribute('data-slide')) || 0);
      }, 120);
    });

    /* ---------- Bucle ---------- */
    var last = performance.now();
    var time = 0;
    var LINK_D = 210;
    var tmp = new THREE.Color();

    function tick(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      var tScale = reduceMotion ? 0.2 : 1;
      time += dt * tScale;

      camX += (camTarget - camX) * (1 - Math.exp(-dt * 2.6));
      spin *= Math.exp(-dt * 1.4);
      mouse.snx += (mouse.nx - mouse.snx) * (1 - Math.exp(-dt * 3));
      mouse.sny += (mouse.ny - mouse.sny) * (1 - Math.exp(-dt * 3));
      col.accent.lerp(col.accentTarget, 1 - Math.exp(-dt * 3));

      // Onda expansiva
      if (ripple.s > 0) {
        ripple.r += dt * 950;
        ripple.s = Math.max(0, 1 - ripple.r / ripple.max);
      }
      var gu = gridMat.uniforms;
      gu.uTime.value = time;
      gu.uOffset.value = -camX * 0.18;
      gu.uMouse.value.set(mouse.x, mouse.y);
      gu.uRippleR.value = ripple.r;
      gu.uRippleS.value = ripple.s;
      gu.uOpacity.value = (col.light ? 0.3 : 0.24) * col.strength;

      // Figuras
      var spanX = W + 360;
      var f = Math.min(1, dt * 60);
      for (var i = 0; i < shapes.length; i++) {
        var s = shapes[i];
        var x = s.x0 - camX * s.depth * 0.7 + mouse.snx * 22 * s.depth;
        x = ((x + spanX / 2) % spanX + spanX) % spanX - spanX / 2;
        var y = s.y0 + Math.sin(time * s.ff + s.ph) * s.fa + mouse.sny * 14 * s.depth;

        // Repulsión suave del puntero + resorte de regreso
        var dx = x + s.ox - mouse.x;
        var dy = y + s.oy - mouse.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 170 * 170 && d2 > 0.01) {
          var d = Math.sqrt(d2);
          var force = (1 - d / 170) * 1.6;
          s.vx += dx / d * force * f;
          s.vy += dy / d * force * f;
        }
        s.vx += -s.ox * 0.02 * f;
        s.vy += -s.oy * 0.02 * f;
        s.vx *= Math.pow(0.9, f);
        s.vy *= Math.pow(0.9, f);
        s.ox += s.vx * f;
        s.oy += s.vy * f;

        s.x = x + s.ox;
        s.y = y + s.oy;
        s.rot += s.rs * (1 + spin * 6) * dt * tScale;

        s.obj.position.set(s.x, s.y, 0);
        var pulse = 1 + Math.sin(time * 1.3 + s.ph) * 0.04;
        if (s.kind === 'glyph') {
          s.obj.scale.set(s.size * s.aspect * pulse, s.size * pulse, 1);
          s.mat.rotation = Math.sin(s.rot) * 0.25;
        } else {
          s.obj.scale.set(s.size * pulse, s.size * pulse, 1);
          s.obj.rotation.z = s.rot;
        }
        s.mat.color.copy(s.accent ? col.accent : col.shape);
        // Más visibles hacia los bordes, discretas detrás del contenido
        var edge = Math.max(Math.abs(s.x) / (W / 2), Math.abs(s.y) / (H / 2));
        var edgeK = 0.3 + 0.7 * Math.min(1, Math.max(0, (edge - 0.45) / 0.5));
        s.edgeK = edgeK;
        s.mat.opacity = s.base * edgeK * col.strength * (s.accent ? 1.5 : 1) * (col.light ? 0.85 : 1);
      }

      // Conexiones
      var seg = 0;
      for (var a = 0; a < shapes.length; a++) {
        var A = shapes[a];
        for (var b = a + 1; b < shapes.length; b++) {
          var B = shapes[b];
          var lx = A.x - B.x;
          var ly = A.y - B.y;
          var ld = lx * lx + ly * ly;
          if (ld > LINK_D * LINK_D) continue;
          var t = 1 - Math.sqrt(ld) / LINK_D;
          var alpha = t * t * 0.3 * col.strength * Math.min(A.depth, B.depth) * Math.min(A.edgeK, B.edgeK);
          tmp.copy(A.accent || B.accent ? col.accent : col.line);
          var p6 = seg * 6;
          var p8 = seg * 8;
          linkPos[p6] = A.x; linkPos[p6 + 1] = A.y; linkPos[p6 + 2] = 0;
          linkPos[p6 + 3] = B.x; linkPos[p6 + 4] = B.y; linkPos[p6 + 5] = 0;
          linkCol[p8] = linkCol[p8 + 4] = tmp.r;
          linkCol[p8 + 1] = linkCol[p8 + 5] = tmp.g;
          linkCol[p8 + 2] = linkCol[p8 + 6] = tmp.b;
          linkCol[p8 + 3] = linkCol[p8 + 7] = alpha;
          seg++;
        }
      }
      linkGeo.setDrawRange(0, seg * 2);
      linkGeo.attributes.position.needsUpdate = true;
      linkGeo.attributes.color.needsUpdate = true;

      // Partículas
      if (pActive > 0) {
        for (var k = 0; k < PMAX; k++) {
          var p = parts[k];
          if (!p.alive) continue;
          p.life -= dt;
          if (p.life <= 0) {
            p.alive = false;
            pActive--;
            pAlpha[k] = 0;
            pSize[k] = 0;
            continue;
          }
          p.t += dt;
          p.vy -= p.g * dt;
          var drag = Math.exp(-p.drag * dt);
          p.vx *= drag;
          p.vy *= drag;
          p.x += p.vx * dt + Math.sin(p.t * p.swayF) * p.sway * dt;
          p.y += p.vy * dt;
          p.rot += p.vr * dt;
          pPos[k * 3] = p.x;
          pPos[k * 3 + 1] = p.y;
          pPos[k * 3 + 2] = 1;
          pSize[k] = p.size;
          pRot[k] = p.rot;
          pAlpha[k] = Math.min(1, (p.life / p.max) * 2.5);
        }
        pGeo.attributes.position.needsUpdate = true;
        pGeo.attributes.aSize.needsUpdate = true;
        pGeo.attributes.aAlpha.needsUpdate = true;
        pGeo.attributes.aRot.needsUpdate = true;
        pGeo.attributes.aColor.needsUpdate = true;
        pGeo.attributes.aShape.needsUpdate = true;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }

    /* ---------- Arranque ---------- */
    readTheme();
    buildGrid();
    buildShapes();
    camX = camTarget = panFor(Number(root.getAttribute('data-slide')) || 0);

    api.ready = true;
    api.burst = burst;
    api.celebrate = celebrate;

    requestAnimationFrame(function (t) {
      last = t;
      canvas.classList.add('is-ready');
      tick(t);
    });
  }
})();
