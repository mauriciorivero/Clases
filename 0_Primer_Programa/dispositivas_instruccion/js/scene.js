/* Fondo en 2D con three.js: cámara ortográfica, sprites de símbolos de código, cuadrícula de puntos y un anillo de pulso. */
(function (App) {
  'use strict';

  App.startScene = function () {
    if (!window.THREE) return;
    var cv = App.$('#bg'), R;
    try { R = new THREE.WebGLRenderer({ canvas: cv, antialias: true }); } catch (e) { return; }
    R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    R.setClearColor(0x0a0a0b, 1);

    var scene = new THREE.Scene();
    var cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
    var W = 0, H = 0, grid = null, sprites = [], cache = {};
    var GL = ['{', '}', '(', ')', ';', '=>', '</>', '[ ]', '0', '1', '$', '>_', '"', '=', '+', '//', '*', '&&'];
    var COLS = [0xffffff, 0xffffff, 0xffffff, 0x3b9eff, 0x50e3c2, 0xff6bb5];

    function tex(t) {
      if (cache[t]) return cache[t];
      var c = document.createElement('canvas'); c.width = c.height = 128;
      var x = c.getContext('2d');
      x.fillStyle = '#fff'; x.font = '500 64px "Geist Mono",ui-monospace,monospace';
      x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(t, 64, 68);
      var tt = new THREE.CanvasTexture(c); tt.minFilter = THREE.LinearFilter;
      return (cache[t] = tt);
    }

    function build() {
      sprites.forEach(function (s) { scene.remove(s.o); });
      sprites = [];
      var n = Math.round(Math.min(60, Math.max(22, W * H / 26000)));
      for (var i = 0; i < n; i++) {
        var d = .25 + Math.random() * .75, size = 34 + d * 46;
        var m = new THREE.SpriteMaterial({ map: tex(GL[i % GL.length]), color: COLS[Math.floor(Math.random() * COLS.length)], transparent: true, opacity: .05 + d * .11, depthWrite: false });
        var o = new THREE.Sprite(m); o.scale.set(size, size, 1); scene.add(o);
        sprites.push({ o: o, x: (Math.random() - .5) * W, y: (Math.random() - .5) * H, d: d, v: 6 + Math.random() * 14, ph: Math.random() * 6.28, kx: 0, ky: 0, rot: (Math.random() - .5) * .3, base: m.opacity });
      }
    }

    function dots() {
      if (grid) { scene.remove(grid); grid.geometry.dispose(); }
      var gap = 40, pts = [];
      for (var x = -W / 2 + gap / 2; x < W / 2; x += gap) for (var y = -H / 2 + gap / 2; y < H / 2; y += gap) pts.push(x, y, -5);
      var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      grid = new THREE.Points(g, new THREE.PointsMaterial({ color: 0x2a2a30, size: 2, sizeAttenuation: false }));
      scene.add(grid);
    }

    var ring = new THREE.Mesh(new THREE.RingGeometry(.985, 1, 128), new THREE.MeshBasicMaterial({ color: 0x3b9eff, transparent: true, opacity: 0, depthWrite: false }));
    ring.scale.set(.001, .001, 1); scene.add(ring);
    var ringT = 1;

    /* Da un empujón a todos los símbolos y lanza la onda. */
    App.kick = function (s) {
      if (App.REDUCED) return;
      sprites.forEach(function (p) {
        var a = Math.random() * 6.28, f = (120 + Math.random() * 220) * s * p.d;
        p.kx += Math.cos(a) * f; p.ky += Math.sin(a) * f;
      });
      ringT = 0;
    };

    var last = 0, t = 0, sx = 0, sy = 0;
    function frame(now) {
      var dt = Math.min(.05, (now - last) / 1000 || 0); last = now;
      if (App.REDUCED) dt = 0;
      t += dt;
      sx += (App.pointer.x - sx) * .04; sy += (App.pointer.y - sy) * .04;
      sprites.forEach(function (p) {
        p.y += p.v * p.d * dt; p.x += Math.sin(t * .4 + p.ph) * 8 * dt;
        p.x += p.kx * dt; p.y += p.ky * dt;
        var f = Math.pow(.02, dt); p.kx *= f; p.ky *= f;
        if (p.y > H / 2 + 60) { p.y = -H / 2 - 60; p.x = (Math.random() - .5) * W; }
        if (p.x > W / 2 + 60) p.x = -W / 2 - 60;
        if (p.x < -W / 2 - 60) p.x = W / 2 + 60;
        p.o.position.set(p.x - sx * 60 * p.d, p.y + sy * 60 * p.d, 0);
        p.o.material.rotation = Math.sin(t * .5 + p.ph) * p.rot;
        var speed = Math.min(1, (Math.abs(p.kx) + Math.abs(p.ky)) / 200);
        p.o.material.opacity = p.base + speed * .25;
      });
      if (grid) grid.position.set(-sx * 14, sy * 14, 0);
      if (ringT < 1) {
        ringT += dt / 1.4;
        var e = 1 - Math.pow(1 - Math.min(ringT, 1), 3), r = e * Math.max(W, H) * .62;
        ring.scale.set(r, r, 1); ring.material.opacity = .4 * (1 - e);
      } else ring.material.opacity = 0;
      R.render(scene, cam);
      if (!App.REDUCED) requestAnimationFrame(frame);
    }

    function size() {
      W = innerWidth; H = innerHeight;
      R.setSize(W, H);
      cam.left = -W / 2; cam.right = W / 2; cam.top = H / 2; cam.bottom = -H / 2; cam.updateProjectionMatrix();
      build(); dots();
      if (App.REDUCED) frame(0);
    }
    window.addEventListener('resize', size);
    size();
    if (!App.REDUCED) requestAnimationFrame(frame);
  };
})(window.App);
