(function(){
  "use strict";
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var dotsWrap = document.getElementById('dots');
  var counter = document.getElementById('counter');
  var prog = document.getElementById('prog');
  var prevBtn = document.getElementById('prev');
  var nextBtn = document.getElementById('next');
  var tipEl = document.getElementById('tip');
  var bubble = document.getElementById('bubble');
  var buddyBtn = document.getElementById('buddy-btn');
  var buddyBody = document.getElementById('buddy-body');
  var mouth = document.getElementById('mouth');
  var eyeL = document.getElementById('eye-l');
  var eyeR = document.getElementById('eye-r');

  var pad = function(n){ return (n < 10 ? '0' : '') + n; };

  /* ---------- consejos y gestos del avatar ---------- */
  var MOUTHS = {
    happy: 'M26 42 Q32 47 38 42',
    teach: 'M26 43 L38 43',
    think: 'M27 43 Q32 40 37 44',
    wow:   'M28 42 Q32 48 36 42 Q32 45 28 42'
  };
  var TIPS = [
    ['happy', 'Hola, soy <b>Nodito</b>. Te acompaño en los 8 pasos. Cuando quieras silencio, haz clic en mí.'],
    ['teach', 'Un módulo es <b>un archivo</b>. Nada más. Lo que cambia es cómo le pides lo que tiene adentro.'],
    ['teach', 'La línea <code>"type"</code> del <code>package.json</code> manda sobre todos los <code>.js</code> del proyecto. Cámbiala y cambia todo.'],
    ['happy', 'Vas a escribir las mismas cuatro funciones dos veces. Es a propósito: así la única diferencia será la sintaxis.'],
    ['think', 'Si una función no aparece en <code>module.exports</code>, es <b>privada</b>. Pruébalo: saca <code>divide</code> de la lista y mira el error.'],
    ['teach', 'El objeto que devuelve <code>require()</code> es el mismo que el módulo puso en <code>module.exports</code>. Literalmente el mismo.'],
    ['teach', 'Sin la extensión <code>.mjs</code>, Node.js leería este archivo como CommonJS y <code>export</code> fallaría.'],
    ['wow', 'Compara la salida del paso 4 con esta: <b>idénticas</b>. Dos sintaxis, un mismo resultado.'],
    ['think', 'La ruta de <code>readFile</code> se mide desde donde corres el comando, no desde el archivo. Es el error que más confunde.'],
    ['wow', '<code>added 2 packages</code> y solo pediste uno: <code>is-odd</code> trae <code>is-number</code> consigo.'],
    ['teach', 'Si tuvieras que quedarte con una idea: <code>require</code> es síncrono, <code>import</code> se analiza antes de ejecutar.'],
    ['think', 'Node.js revisa nativos, después <code>node_modules/</code>, y solo con <code>./</code> va directo a tu archivo.'],
    ['happy', '¡Lo armaste completo! Ahora rompe el código a propósito: ahí es donde de verdad se aprende.'],
    ['teach', 'Ocho ejercicios. No los leas: <b>escríbelos</b>. El error que te salga en el camino es la clase de verdad.']
  ];

  function setMood(mood){
    if (mouth) mouth.setAttribute('d', MOUTHS[mood] || MOUTHS.happy);
    var r = mood === 'wow' ? 6.2 : (mood === 'think' ? 4.6 : 5.4);
    if (eyeL) eyeL.setAttribute('r', r);
    if (eyeR) eyeR.setAttribute('r', r);
  }
  function hop(){
    if (REDUCE || !buddyBody) return;
    buddyBody.classList.remove('bob');
    buddyBody.classList.remove('hop');
    void buddyBody.getBoundingClientRect();
    buddyBody.classList.add('hop');
    setTimeout(function(){
      buddyBody.classList.remove('hop');
      buddyBody.classList.add('bob');
    }, 620);
  }
  buddyBtn.addEventListener('click', function(){
    var open = bubble.hidden;
    bubble.hidden = !open;
    buddyBtn.setAttribute('aria-expanded', String(open));
    hop();
  });

  /* ---------- puntos de navegación ---------- */
  slides.forEach(function(s, i){
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', 'Diapositiva ' + (i + 1) + ' de ' + slides.length);
    b.addEventListener('click', function(){ go(i); });
    dotsWrap.appendChild(b);
  });
  var dots = Array.prototype.slice.call(dotsWrap.children);

  var ACCENTS = { cjs:'--c-cjs', esm:'--c-esm', nat:'--c-nat', ext:'--c-ext', neu:'--c-neu' };
  var current = 0;
  var onSlide = null;

  function go(i, firstRun){
    i = Math.max(0, Math.min(slides.length - 1, i));
    if (i === current && !firstRun) return;
    var prevIdx = current;
    current = i;

    slides.forEach(function(s, k){
      if (k === i) {
        s.hidden = false;
        s.classList.remove('enter');
        void s.getBoundingClientRect();
        s.classList.add('enter');
        s.scrollTop = 0;
      } else {
        s.hidden = true;
        s.classList.remove('enter');
      }
    });

    var key = slides[i].getAttribute('data-accent') || 'neu';
    document.documentElement.style.setProperty('--accent', 'var(' + (ACCENTS[key] || ACCENTS.neu) + ')');

    dots.forEach(function(d, k){ d.setAttribute('aria-current', String(k === i)); });
    counter.textContent = pad(i + 1) + ' / ' + pad(slides.length);
    prog.style.width = (i / (slides.length - 1) * 100) + '%';
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === slides.length - 1;

    var tip = TIPS[i] || TIPS[0];
    setMood(tip[0]);
    tipEl.innerHTML = tip[1];
    if (prevIdx !== i) hop();

    if (onSlide) onSlide(slides[i].getAttribute('data-diagram'));
  }

  prevBtn.addEventListener('click', function(){ go(current - 1); });
  nextBtn.addEventListener('click', function(){ go(current + 1); });

  document.addEventListener('keydown', function(e){
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault(); go(current + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault(); go(current - 1);
    } else if (e.key === 'Home') {
      e.preventDefault(); go(0);
    } else if (e.key === 'End') {
      e.preventDefault(); go(slides.length - 1);
    }
  });

  var tx = 0, ty = 0;
  document.addEventListener('touchstart', function(e){
    tx = e.changedTouches[0].clientX; ty = e.changedTouches[0].clientY;
  }, {passive:true});
  document.addEventListener('touchend', function(e){
    var dx = e.changedTouches[0].clientX - tx;
    var dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.6) go(current + (dx < 0 ? 1 : -1));
  }, {passive:true});

  /* ---------- campo y diagramas en three.js (2D) ---------- */
  var DIAGRAMS = {
    overview: {
      nodes: [
        {id:'node', label:'Node.js', x:.5, y:.5, on:true},
        {id:'cjs', label:'require()', x:.13, y:.2},
        {id:'esm', label:'import', x:.87, y:.2},
        {id:'nat', label:'fs · path', x:.13, y:.82},
        {id:'ext', label:'npm', x:.87, y:.82}
      ],
      edges: [['node','cjs'],['node','esm'],['node','nat'],['node','ext']]
    },
    tree: {
      nodes: [
        {id:'src', label:'src/', x:.12, y:.5, on:true},
        {id:'a', label:'commonJS/', x:.66, y:.12},
        {id:'b', label:'esModulesJS/', x:.66, y:.37},
        {id:'c', label:'native/', x:.66, y:.63},
        {id:'d', label:'externalModule/', x:.66, y:.88}
      ],
      edges: [['src','a'],['src','b'],['src','c'],['src','d']]
    },
    'cjs-export': {
      nodes: [
        {id:'fn', label:'add · divide', x:.14, y:.5},
        {id:'ex', label:'module.exports', x:.52, y:.5, on:true},
        {id:'out', label:'otros archivos', x:.88, y:.5}
      ],
      edges: [['fn','ex'],['ex','out']]
    },
    'cjs-require': {
      nodes: [
        {id:'main', label:'main.js', x:.16, y:.5, on:true},
        {id:'math', label:'math.js', x:.84, y:.5}
      ],
      edges: [['main','math'],['math','main']]
    },
    'esm-export': {
      nodes: [
        {id:'m', label:'math.mjs', x:.18, y:.5, on:true},
        {id:'a', label:'export add', x:.74, y:.22},
        {id:'b', label:'export divide', x:.74, y:.74}
      ],
      edges: [['m','a'],['m','b']]
    },
    'esm-import': {
      nodes: [
        {id:'main', label:'main.js', x:.16, y:.5, on:true},
        {id:'math', label:'math.mjs', x:.84, y:.5}
      ],
      edges: [['main','math'],['math','main']]
    },
    native: {
      nodes: [
        {id:'main', label:'native.js', x:.14, y:.24, on:true},
        {id:'fs', label:'fs.readFile', x:.52, y:.24},
        {id:'disk', label:'archivoTexto.txt', x:.86, y:.5},
        {id:'cb', label:'callback', x:.52, y:.78},
        {id:'log', label:'console.log', x:.14, y:.78}
      ],
      edges: [['main','fs'],['fs','disk'],['disk','cb'],['cb','log']]
    },
    external: {
      nodes: [
        {id:'cmd', label:'npm i is-odd', x:.16, y:.18, on:true},
        {id:'reg', label:'registro npm', x:.82, y:.18},
        {id:'nm', label:'node_modules/', x:.82, y:.74},
        {id:'main', label:"require('is-odd')", x:.2, y:.74}
      ],
      edges: [['cmd','reg'],['reg','nm'],['nm','main']]
    },
    compare: {
      nodes: [
        {id:'r', label:'require()', x:.2, y:.22, on:true},
        {id:'me', label:'module.exports', x:.2, y:.78},
        {id:'i', label:'import', x:.8, y:.22, on:true},
        {id:'e', label:'export', x:.8, y:.78}
      ],
      edges: [['r','me'],['i','e']]
    },
    resolution: {
      nodes: [
        {id:'q', label:'require(x)', x:.1, y:.5, on:true},
        {id:'n', label:'¿nativo?', x:.37, y:.5},
        {id:'m', label:'¿node_modules?', x:.65, y:.5},
        {id:'f', label:'./archivo', x:.91, y:.5}
      ],
      edges: [['q','n'],['n','m'],['m','f']]
    },
    closing: {
      nodes: [
        {id:'ok', label:'proyecto listo', x:.5, y:.5, on:true},
        {id:'a', label:'require', x:.13, y:.18},
        {id:'b', label:'import', x:.87, y:.18},
        {id:'c', label:'fs', x:.13, y:.82},
        {id:'d', label:'npm', x:.87, y:.82}
      ],
      edges: [['a','ok'],['b','ok'],['c','ok'],['d','ok']]
    },
    exercises: {
      nodes: [
        {id:'you', label:'tu turno', x:.5, y:.5, on:true},
        {id:'a', label:'2 · CommonJS', x:.11, y:.5},
        {id:'b', label:'2 · ES Modules', x:.31, y:.5},
        {id:'c', label:'2 · nativos', x:.7, y:.5},
        {id:'d', label:'2 · externos', x:.9, y:.5}
      ],
      edges: [['a','you'],['b','you'],['c','you'],['d','you']]
    }
  };

  if (!window.THREE) {
    document.body.classList.add('no-gl');
    go(0, true);
    return;
  }

  var canvas = document.getElementById('gl');
  var renderer, camera, scene, bgMesh, dots3, diagGroup;
  var live = { nodes: [], edges: [] };
  var W = 0, H = 0, DPR = 1;
  var measure = document.createElement('canvas').getContext('2d');

  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (err) {
    document.body.classList.add('no-gl');
    go(0, true);
    return;
  }

  DPR = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(DPR);
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(0, 1, 0, 1, -500, 500);
  diagGroup = new THREE.Group();
  scene.add(diagGroup);

  function cssVar(name){
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  function accentHex(){
    var v = cssVar('--accent');
    if (v.indexOf('var(') === 0) v = cssVar(v.slice(4, -1).trim());
    return v || '#8fa0b3';
  }
  function isLight(){
    var bg = cssVar('--bg');
    return bg.indexOf('#f') === 0 || bg.indexOf('#F') === 0;
  }

  /* fondo: dos manchas de luz muy suaves que respiran */
  var bgUniforms = {
    uTime: { value: 0 },
    uA: { value: new THREE.Color('#5aa9f8') },
    uB: { value: new THREE.Color('#68cf8c') },
    uAlpha: { value: 0.26 }
  };
  bgMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.ShaderMaterial({
      uniforms: bgUniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: [
        'varying vec2 vUv;',
        'void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }'
      ].join('\n'),
      fragmentShader: [
        'varying vec2 vUv;',
        'uniform float uTime; uniform vec3 uA; uniform vec3 uB; uniform float uAlpha;',
        'float blob(vec2 p, vec2 c, float r){ return smoothstep(r, 0.0, length((p-c)*vec2(1.0,1.35))); }',
        'void main(){',
        '  float t = uTime * 0.055;',
        '  float b1 = blob(vUv, vec2(0.22 + 0.11*sin(t), 0.26 + 0.09*cos(t*0.82)), 0.52);',
        '  float b2 = blob(vUv, vec2(0.81 + 0.09*cos(t*0.71), 0.74 + 0.10*sin(t*1.07)), 0.56);',
        '  vec3 col = mix(uA, uB, clamp(b2 * 1.25, 0.0, 1.0));',
        '  float a = (b1 * 0.6 + b2 * 0.55) * uAlpha;',
        '  gl_FragColor = vec4(col, a);',
        '}'
      ].join('\n')
    })
  );
  bgMesh.position.z = -30;
  scene.add(bgMesh);

  /* partículas: polvo lento, como el ruido de un editor en reposo */
  var PCOUNT = 420;
  var pPos = new Float32Array(PCOUNT * 3);
  var pVel = new Float32Array(PCOUNT * 2);
  var pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  var spriteCanvas = document.createElement('canvas');
  spriteCanvas.width = spriteCanvas.height = 32;
  var sctx = spriteCanvas.getContext('2d');
  var grd = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  sctx.fillStyle = grd;
  sctx.fillRect(0, 0, 32, 32);
  var pMat = new THREE.PointsMaterial({
    size: 3.2, sizeAttenuation: false, transparent: true,
    opacity: 0.5, depthWrite: false,
    map: new THREE.CanvasTexture(spriteCanvas)
  });
  dots3 = new THREE.Points(pGeo, pMat);
  dots3.position.z = -20;
  scene.add(dots3);

  function seedParticles(){
    for (var i = 0; i < PCOUNT; i++){
      pPos[i*3] = Math.random() * W;
      pPos[i*3+1] = Math.random() * H;
      pPos[i*3+2] = 0;
      pVel[i*2] = (Math.random() - 0.5) * 0.17;
      pVel[i*2+1] = -0.06 - Math.random() * 0.17;
    }
    pGeo.attributes.position.needsUpdate = true;
  }

  function roundRect(g, x, y, w, h, r){
    g.beginPath();
    g.moveTo(x + r, y);
    g.lineTo(x + w - r, y);
    g.quadraticCurveTo(x + w, y, x + w, y + r);
    g.lineTo(x + w, y + h - r);
    g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    g.lineTo(x + r, y + h);
    g.quadraticCurveTo(x, y + h, x, y + h - r);
    g.lineTo(x, y + r);
    g.quadraticCurveTo(x, y, x + r, y);
    g.closePath();
  }
  function rgba(hex, a){
    var h = (hex || '#8fa0b3').replace('#','');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var n = parseInt(h, 16);
    return 'rgba(' + ((n>>16)&255) + ',' + ((n>>8)&255) + ',' + (n&255) + ',' + a + ')';
  }

  function nodeMesh(label, on, acc, light){
    var fs = Math.max(11, Math.min(14, Math.round(W / 92)));
    var font = '500 ' + fs + 'px "Geist Mono", ui-monospace, monospace';
    measure.font = font;
    var tw = measure.measureText(label).width;
    var w = Math.ceil(tw + 30), h = fs + 22;
    var c = document.createElement('canvas');
    c.width = Math.ceil(w * DPR); c.height = Math.ceil(h * DPR);
    var g = c.getContext('2d');
    g.scale(DPR, DPR);
    g.font = font;
    g.textBaseline = 'middle';
    roundRect(g, 1.2, 1.2, w - 2.4, h - 2.4, 9);
    g.fillStyle = on ? rgba(acc, light ? 0.14 : 0.17) : (light ? 'rgba(110,125,145,0.09)' : 'rgba(150,170,195,0.07)');
    g.fill();
    g.strokeStyle = on ? rgba(acc, 0.8) : (light ? 'rgba(90,105,125,0.34)' : 'rgba(165,185,210,0.26)');
    g.lineWidth = on ? 1.7 : 1.2;
    g.stroke();
    g.fillStyle = on ? acc : (light ? 'rgba(70,85,102,0.95)' : 'rgba(176,192,212,0.92)');
    g.fillText(label, 15, h / 2 + 0.5);
    var tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    return new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
    );
  }

  function clearDiagram(){
    for (var i = diagGroup.children.length - 1; i >= 0; i--){
      var o = diagGroup.children[i];
      diagGroup.remove(o);
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        // pMat.map es el sprite compartido de las partículas: no se libera aquí.
        if (o.material.map && o.material.map !== pMat.map) o.material.map.dispose();
        o.material.dispose();
      }
    }
    live.nodes = []; live.edges = [];
  }

  var activeKey = null;
  var slotEl = null;
  var born = 0;

  function buildDiagram(key){
    clearDiagram();
    activeKey = key;
    slotEl = null;
    if (!key || !DIAGRAMS[key]) return;
    var slide = slides[current];
    slotEl = slide ? slide.querySelector('.diagram[data-diagram="' + key + '"]') : null;
    if (!slotEl) return;

    var spec = DIAGRAMS[key];
    var acc = accentHex();
    var light = isLight();
    var byId = {};

    spec.nodes.forEach(function(n){
      var m = nodeMesh(n.label, !!n.on, acc, light);
      m.position.z = 2;
      diagGroup.add(m);
      var rec = { mesh: m, spec: n };
      byId[n.id] = rec;
      live.nodes.push(rec);
    });

    spec.edges.forEach(function(e, idx){
      var a = byId[e[0]], b = byId[e[1]];
      if (!a || !b) return;
      var lineMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(acc),
          transparent: true, opacity: light ? 0.3 : 0.26, depthWrite: false
        })
      );
      lineMesh.position.z = 0;
      diagGroup.add(lineMesh);
      var pulse = new THREE.Mesh(
        new THREE.PlaneGeometry(7, 7),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(acc), map: pMat.map,
          transparent: true, opacity: 0.95, depthWrite: false
        })
      );
      pulse.position.z = 1;
      diagGroup.add(pulse);
      live.edges.push({ line: lineMesh, pulse: pulse, a: a, b: b, phase: idx * 0.26 });
    });

    born = performance.now();
  }

  function layout(now){
    if (!slotEl || !live.nodes.length) { diagGroup.visible = false; return; }
    var r = slotEl.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) { diagGroup.visible = false; return; }
    diagGroup.visible = true;

    var age = REDUCE ? 1 : Math.min(1, (now - born) / 620);
    var ease = 1 - Math.pow(1 - age, 3);
    var light = isLight();

    live.nodes.forEach(function(rec, i){
      var stagger = REDUCE ? 1 : Math.max(0, Math.min(1, (age - i * 0.07) / 0.5));
      var se = 1 - Math.pow(1 - stagger, 3);
      rec.mesh.position.x = r.left + rec.spec.x * r.width;
      rec.mesh.position.y = r.top + rec.spec.y * r.height;
      rec.mesh.scale.setScalar(0.88 + 0.12 * se);
      rec.mesh.material.opacity = se;
    });

    live.edges.forEach(function(ed){
      var ax = ed.a.mesh.position.x, ay = ed.a.mesh.position.y;
      var bx = ed.b.mesh.position.x, by = ed.b.mesh.position.y;
      var dx = bx - ax, dy = by - ay;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      ed.line.position.set(ax + dx / 2, ay + dy / 2, 0);
      ed.line.rotation.z = Math.atan2(dy, dx);
      ed.line.scale.set(len * ease, 1.5, 1);
      ed.line.material.opacity = (light ? 0.3 : 0.26) * ease;

      if (REDUCE) {
        ed.pulse.visible = false;
        return;
      }
      ed.pulse.visible = age > 0.5;
      var t = ((now / 1000) * 0.42 + ed.phase) % 1;
      var fade = Math.sin(Math.PI * Math.min(1, Math.max(0, t)));
      ed.pulse.position.set(ax + dx * t, ay + dy * t, 1);
      ed.pulse.material.opacity = fade * 0.9 * ease;
      ed.pulse.scale.setScalar(0.8 + fade * 0.5);
    });
  }

  function themeSync(){
    var light = isLight();
    var acc = accentHex();
    bgUniforms.uA.value.set(acc);
    bgUniforms.uB.value.set(light ? '#7aa0c8' : '#4a6fa5');
    bgUniforms.uAlpha.value = light ? 0.17 : 0.3;
    pMat.color.set(light ? '#8b97a6' : '#9fb4cc');
    pMat.opacity = light ? 0.34 : 0.46;
  }

  function resize(){
    W = window.innerWidth;
    H = window.innerHeight;
    renderer.setSize(W, H, false);
    camera.left = 0; camera.right = W;
    camera.top = 0; camera.bottom = H;
    camera.updateProjectionMatrix();
    bgMesh.scale.set(W * 1.02, H * 1.02, 1);
    bgMesh.position.set(W / 2, H / 2, -30);
    seedParticles();
    themeSync();
    if (activeKey) buildDiagram(activeKey);
  }

  var t0 = performance.now();
  function frame(now){
    var dt = Math.min(48, now - t0); t0 = now;
    if (!REDUCE) {
      bgUniforms.uTime.value = now / 1000;
      for (var i = 0; i < PCOUNT; i++){
        pPos[i*3] += pVel[i*2] * (dt / 16);
        pPos[i*3+1] += pVel[i*2+1] * (dt / 16);
        if (pPos[i*3+1] < -8) { pPos[i*3+1] = H + 8; pPos[i*3] = Math.random() * W; }
        if (pPos[i*3] < -8) pPos[i*3] = W + 8;
        if (pPos[i*3] > W + 8) pPos[i*3] = -8;
      }
      pGeo.attributes.position.needsUpdate = true;
    }
    layout(now);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  onSlide = function(key){
    themeSync();
    buildDiagram(key);
  };

  var rt;
  window.addEventListener('resize', function(){
    clearTimeout(rt);
    rt = setTimeout(resize, 140);
  });
  var mqDark = window.matchMedia('(prefers-color-scheme: dark)');
  if (mqDark.addEventListener) mqDark.addEventListener('change', function(){ setTimeout(resize, 60); });

  /* el deck recuerda en qué paso iba si la página se vuelve a publicar */
  var boot = function(state){
    resize();
    go((state && typeof state.i === 'number') ? state.i : 0, true);
    requestAnimationFrame(frame);
  };
  if (window.claude && window.claude.hot && window.claude.hot.snapshot) {
    window.claude.hot.snapshot(function(){ return { i: current }; });
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function(){
      if (activeKey) buildDiagram(activeKey);
    });
  }
  if (window.claude && window.claude.hot && window.claude.hot.ready) {
    window.claude.hot.ready(boot);
  } else {
    boot((window.claude && window.claude.hot && window.claude.hot.data) || {});
  }
})();
