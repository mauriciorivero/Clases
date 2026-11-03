/*
  Presentación interactiva: Transcribe audio con Node.js.
  Secciones: utilidades · resaltado de código · render de diapositivas ·
  escena 2D en Three.js · avatar Byte · navegación y tema.
*/
(function () {
  'use strict';

  const SLIDES = window.SLIDES || [];
  const root = document.documentElement;
  const deck = document.getElementById('deck');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- utilidades ---------- */
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // Texto con `codigo` y **negrita**
  const fmt = (s) =>
    esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  const pad2 = (n) => String(n).padStart(2, '0');
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ }
    }
  };

  /* ---------- resaltado de sintaxis ---------- */
  // Grupos: 1 comentario · 2 cadena · 3 numero · 4 palabra clave · 5 global · 6 CONSTANTE
  //         7 llamada · 8 .metodo( · 9 .propiedad · 10 simbolo
  const JS_RE = new RegExp(
    [
      '(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*)',
      '(\'(?:\\\\.|[^\'\\\\\\n])*\'|"(?:\\\\.|[^"\\\\\\n])*"|`(?:\\\\.|[^`\\\\])*`)',
      '(\\b\\d+(?:\\.\\d+)?\\b)',
      '(\\b(?:const|let|var|function|async|await|return|if|else|throw|new|try|catch|finally|true|false|null|undefined)\\b)',
      '(\\b(?:require|console|process|module|exports|Promise|Error|Buffer|String|JSON|__dirname)\\b)',
      '(\\b[A-Z][A-Z0-9_]{2,}\\b)',
      '([A-Za-z_$][\\w$]*)(?=\\s*\\()',
      '\\.([A-Za-z_$][\\w$]*)(?=\\s*\\()',
      '\\.([A-Za-z_$][\\w$]*)',
      '([{}()\\[\\];,.:=<>!?|&+\\-*\\/])'
    ].join('|'),
    'g'
  );
  const JS_CLASS = { 1: 'c', 2: 's', 3: 'n', 4: 'k', 5: 'b', 6: 'u', 7: 'f', 8: 'f', 9: 'p', 10: 'o' };

  function highlightJS(text) {
    const lines = [[]];
    const push = (cls, str) => {
      const parts = str.split('\n');
      parts.forEach((part, i) => {
        if (i > 0) lines.push([]);
        if (part) lines[lines.length - 1].push(cls ? `<span class="${cls}">${esc(part)}</span>` : esc(part));
      });
    };
    let last = 0;
    let m;
    JS_RE.lastIndex = 0;
    while ((m = JS_RE.exec(text))) {
      if (m.index > last) push('', text.slice(last, m.index));
      const g = m.findIndex((v, i) => i > 0 && v !== undefined);
      if (g === 8 || g === 9) {
        push('o', '.');
        push(JS_CLASS[g], m[g]);
      } else {
        push(JS_CLASS[g], m[0]);
      }
      last = m.index + m[0].length;
    }
    if (last < text.length) push('', text.slice(last));
    return lines.map((l) => l.join(''));
  }

  function highlightShell(rest) {
    return esc(rest)
      .replace(/(&amp;&amp;)/g, '<span class="o">$1</span>')
      .replace(/(\s)(--?[a-zA-Z][\w-]*)/g, '$1<span class="u">$2</span>')
      .replace(/(@[\w/.-]+)/g, '<span class="s">$1</span>');
  }

  function highlightTerm(text) {
    return text.split('\n').map((line) => {
      if (line.startsWith('$ ')) return `<span class="pr">$</span> ${highlightShell(line.slice(2))}`;
      if (line.startsWith('#')) return `<span class="c">${esc(line)}</span>`;
      const tree = line.match(/^([\s│├└─]+)(.*)$/);
      if (tree && /[│├└]/.test(tree[1])) {
        const name = tree[2];
        return `<span class="dim">${esc(tree[1])}</span><span class="${name.endsWith('/') ? 'dir' : 'out'}">${esc(name)}</span>`;
      }
      if (/\/$/.test(line)) return `<span class="dir">${esc(line)}</span>`;
      return `<span class="out">${esc(line)}</span>`;
    });
  }

  function highlightEnv(text) {
    return text.split('\n').map((line) => {
      if (line.startsWith('#')) return `<span class="c">${esc(line)}</span>`;
      const i = line.indexOf('=');
      if (i < 0) return esc(line);
      return `<span class="u">${esc(line.slice(0, i))}</span><span class="o">=</span><span class="s">${esc(line.slice(i + 1))}</span>`;
    });
  }

  function highlightProto(text) {
    return text.split('\n').map((line) => {
      if (/^\s*(\/\*|\*)/.test(line)) return `<span class="c">${esc(line)}</span>`;
      const i = line.indexOf('//');
      const code = i >= 0 ? line.slice(0, i) : line;
      const comment = i >= 0 ? `<span class="c">${esc(line.slice(i))}</span>` : '';
      // una sola pasada para no volver a procesar el HTML ya generado
      const html = esc(code).replace(
        /("[^"]*")|\b(service|rpc|returns|stream|message|enum|import|package|option|syntax)\b|\b([A-Z][A-Za-z0-9_]+)\b|([{}();=])/g,
        (m, str, kw, type) => `<span class="${str ? 's' : kw ? 'k' : type ? 'u' : 'o'}">${m}</span>`
      );
      return html + comment;
    });
  }

  function highlight(lang, text) {
    if (lang === 'proto') return highlightProto(text);
    if (lang === 'js') return highlightJS(text);
    if (lang === 'term') return highlightTerm(text);
    if (lang === 'env') return highlightEnv(text);
    return text.split('\n').map(esc);
  }

  /* ---------- render de diapositivas ---------- */
  const LANG_LABEL = { js: 'JavaScript', term: 'Terminal', env: 'ENV', proto: 'Protobuf' };

  function buildEditor(code, startIndex) {
    const lines = highlight(code.lang, code.text);
    const start = code.start || 1;
    const hints = code.hints || {};
    const marks = code.marks || {};
    const rows = lines.map((html, i) => {
      const n = i + 1;
      const cls = ['ln'];
      if (hints[n]) cls.push('has-hint');
      if (marks[n]) cls.push('mark-' + marks[n]);
      const attrs = hints[n] ? ` tabindex="0" role="button" data-line="${n}"` : '';
      return `<div class="${cls.join(' ')}"${attrs} style="--d:${i * 38}"><span class="no">${start + i}</span><span class="tx">${html || ' '}</span></div>`;
    });
    return `
      <div class="editor" data-anim style="--i:${startIndex}">
        <div class="editor-bar">
          <span class="lights" aria-hidden="true"><i></i><i></i><i></i></span>
          <span class="tab">${esc(code.file)}</span>
          <span class="lang">${LANG_LABEL[code.lang] || ''}</span>
        </div>
        <div class="code-scroll"><div class="code" role="group" aria-label="Código de ${esc(code.file)}">${rows.join('')}</div></div>
      </div>`;
  }

  function buildFlow(items, startIndex) {
    return `<div class="flow">${items
      .map(
        (it, i) => `
      <div class="flow-step" data-anim style="--i:${startIndex + i}">
        <span class="num">${i + 1}</span>
        <div><b>${esc(it.label)}</b><small>${fmt(it.sub)}</small></div>
      </div>`
      )
      .join('')}</div>`;
  }

  function buildSlide(s, index) {
    const isTitle = s.type === 'title';
    const hasRight = !!(s.code || s.diagram);
    const heading = isTitle
      ? `<h1 data-anim style="--i:1"><span class="grad">${fmt(s.title)}</span></h1>`
      : `<h2 data-anim style="--i:1">${fmt(s.title)}</h2>`;
    const bullets = (s.bullets || [])
      .map((b, i) => `<li data-anim style="--i:${3 + i}">${fmt(b)}</li>`)
      .join('');
    const cta = s.code
      ? `<div class="hint-cta" data-anim style="--i:6"><kbd>clic</kbd> en las líneas con punto o en Byte para una pista</div>`
      : '';
    const right = s.code ? buildEditor(s.code, 3) : s.diagram ? buildFlow(s.diagram, 3) : '';
    const sec = document.createElement('section');
    sec.className = 'slide' + (isTitle ? ' title-slide' : '');
    sec.dataset.index = index;
    sec.setAttribute('aria-label', `Diapositiva ${index + 1} de ${SLIDES.length}`);
    sec.innerHTML = `
      <div class="slide-inner${hasRight ? '' : ' no-code'}">
        <div class="copy">
          <span class="kicker" data-anim style="--i:0">${esc(s.kicker || '')}</span>
          ${heading}
          <p class="lead" data-anim style="--i:2">${fmt(s.lead || '')}</p>
          ${bullets ? `<ul class="bullets">${bullets}</ul>` : ''}
          ${cta}
        </div>
        ${right}
      </div>`;
    return sec;
  }

  const slideEls = SLIDES.map(buildSlide);
  slideEls.forEach((el) => deck.appendChild(el));

  /* ---------- escena 2D en Three.js ---------- */
  const Scene2D = (function () {
    const canvas = document.getElementById('bg');
    if (!window.THREE) return null;
    const THREE = window.THREE;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (e) {
      return null; // sin WebGL: la presentacion sigue funcionando sin fondo
    }
    const WORLD_H = 10; // alto del mundo 2D en unidades; el ancho depende del aspecto
    const N = 1400;
    let W = WORLD_H;
    const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, -10, 10);
    const scene = new THREE.Scene();

    // semillas estables por particula
    const r1 = new Float32Array(N), r2 = new Float32Array(N), r3 = new Float32Array(N);
    for (let i = 0; i < N; i++) { r1[i] = Math.random(); r2[i] = Math.random(); r3[i] = Math.random(); }

    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { pos[i * 3] = (r1[i] - 0.5) * 14; pos[i * 3 + 1] = (r2[i] - 0.5) * 10; }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(r3, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uColor: { value: new THREE.Color('#0070f3') },
        uSize: { value: 5 },
        uPR: { value: 1 },
        uAlpha: { value: 0.7 }
      },
      vertexShader: `
        attribute float aSeed;
        uniform float uSize;
        uniform float uPR;
        varying float vA;
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = uSize * uPR * (0.55 + aSeed * 1.1);
          vA = 0.3 + 0.7 * aSeed;
        }`,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uAlpha;
        varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.08, d);
          gl_FragColor = vec4(uColor, a * vA * uAlpha);
        }`
    });
    const points = new THREE.Points(geo, material);
    points.frustumCulled = false;
    scene.add(points);

    /* Cada motivo devuelve el destino (x, y) de la particula i en el instante t */
    const out = [0, 0];
    const TAU = Math.PI * 2;
    const motifs = {
      cloud(i, t) {
        out[0] = (r1[i] - 0.5) * W * 1.05 + Math.sin(t * 0.15 + r3[i] * TAU) * 0.6;
        out[1] = (r2[i] - 0.5) * WORLD_H * 1.05 + Math.cos(t * 0.12 + r1[i] * TAU) * 0.6;
      },
      wave(i, t) {
        const lane = i % 4;
        const u = r1[i];
        const env = 0.5 + 0.5 * Math.sin(u * 5 - t * 0.8);
        out[0] = (u - 0.5) * W * 1.05;
        out[1] = (lane - 1.5) * 0.55 + Math.sin(u * 18 + t * 1.8 + lane * 0.7) * 1.6 * (0.35 + 0.65 * Math.sin(u * Math.PI)) * env + (r2[i] - 0.5) * 0.16;
      },
      pipeline(i, t) {
        const xs = [-0.34, -0.11, 0.11, 0.34];
        const y0 = -3.4;
        const g = i % 6;
        if (g < 4) {
          const a = r2[i] * TAU + t * 0.6 * (g % 2 ? 1 : -1);
          const rad = 0.65 * (0.35 + r1[i] * 0.65);
          out[0] = xs[g] * W + Math.cos(a) * rad;
          out[1] = y0 + Math.sin(a) * rad;
        } else {
          const ph = (t * 0.12 + r1[i]) % 1;
          out[0] = (xs[0] + (xs[3] - xs[0]) * ph) * W;
          out[1] = y0 + Math.sin(ph * 40 + r2[i] * 6) * 0.14;
        }
      },
      grid(i, t) {
        const cols = 40, rows = 35;
        const gx = i % cols, gy = Math.floor(i / cols) % rows;
        out[0] = (gx / (cols - 1) - 0.5) * W * 1.02 + Math.sin(t * 0.8 + gy * 0.4) * 0.1;
        out[1] = (gy / (rows - 1) - 0.5) * WORLD_H * 0.95 + Math.cos(t * 0.8 + gx * 0.4) * 0.1;
      },
      ring(i, t) {
        const k = i % 5;
        const dir = k % 2 ? -1 : 1;
        const a = r1[i] * TAU + t * (0.25 / (1 + k * 0.4)) * dir;
        const rad = (1.6 + k * 1.05) * (0.97 + r2[i] * 0.06);
        out[0] = Math.cos(a) * rad * 1.25;
        out[1] = Math.sin(a) * rad * 0.8;
      },
      stream(i, t) {
        const lane = i % 12;
        const ph = (r1[i] + t * (0.04 + lane * 0.006)) % 1;
        out[0] = (ph - 0.5) * W * 1.1;
        out[1] = (lane / 11 - 0.5) * WORLD_H * 0.8 + Math.sin(ph * 12 + lane) * 0.3;
      },
      rows(i, t) {
        const row = i % 14;
        const len = (0.3 + ((row * 7919) % 100) / 100 * 0.55) * W * 0.55;
        out[0] = -W * 0.32 + r1[i] * len + Math.sin(t * 2 + row) * 0.05;
        out[1] = (6.5 - row) * 0.58 + (r2[i] - 0.5) * 0.12;
      },
      scatter(i, t) {
        out[0] = (r1[i] - 0.5) * W * 1.1 + Math.sin(t * 3 + r2[i] * 20) * 0.35;
        out[1] = (r2[i] - 0.5) * WORLD_H * 1.1 + Math.cos(t * 2.6 + r1[i] * 20) * 0.35;
      },
      burst(i, t) {
        const a = r1[i] * TAU;
        const rad = ((r2[i] + t * 0.08) % 1) * WORLD_H * 0.62;
        out[0] = Math.cos(a) * rad * 1.5;
        out[1] = Math.sin(a) * rad;
      }
    };

    let motif = motifs.cloud;
    const targetColor = new THREE.Color('#0070f3');
    let pulse = 0;
    let mx = 0, my = 0, px = 0, py = 0;
    let isDark = true;
    const timeScale = reduceMotion ? 0.2 : 1;

    function resize() {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      material.uniforms.uPR.value = renderer.getPixelRatio();
      W = WORLD_H * (w / h);
      camera.left = -W / 2; camera.right = W / 2; camera.top = WORLD_H / 2; camera.bottom = -WORLD_H / 2;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', (e) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });
    resize();

    let last = null;
    let t = 0;
    function frame(now) {
      // dt nunca negativo ni enorme (pestaña en segundo plano, primer cuadro)
      const dt = last === null ? 0 : Math.max(0, Math.min((now - last) / 1000, 0.05));
      last = now;
      t += dt * timeScale;
      pulse *= Math.exp(-dt * 2.4);
      material.uniforms.uColor.value.lerp(targetColor, 1 - Math.exp(-dt * 3));

      const p = geo.attributes.position.array;
      for (let i = 0; i < N; i++) {
        motif(i, t);
        let tx = out[0], ty = out[1];
        if (pulse > 0.002) {
          const a = r1[i] * TAU;
          tx += Math.cos(a) * pulse * 3 * (0.4 + r2[i]);
          ty += Math.sin(a) * pulse * 3 * (0.4 + r2[i]);
        }
        const k = 1 - Math.exp(-dt * (1.6 + r3[i] * 2.4));
        p[i * 3] += (tx - p[i * 3]) * k;
        p[i * 3 + 1] += (ty - p[i * 3 + 1]) * k;
      }
      geo.attributes.position.needsUpdate = true;

      px += (mx - px) * 0.04; py += (my - py) * 0.04;
      points.position.set(-px * 0.5, py * 0.5, 0);
      renderer.render(scene, camera);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    return {
      setMotif(name, accent) {
        motif = motifs[name] || motifs.cloud;
        targetColor.set(accent || '#0070f3');
      },
      setTheme(dark) {
        isDark = dark;
        material.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
        material.uniforms.uAlpha.value = dark ? 0.7 : 0.6;
        material.needsUpdate = true;
      },
      pulse() { pulse = 1; }
    };
  })();

  /* ---------- tema claro / oscuro ---------- */
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    store.set('theme', theme);
    if (Scene2D) Scene2D.setTheme(theme === 'dark');
  }
  const queryTheme = new URLSearchParams(location.search).get('theme');
  const savedTheme = (queryTheme === 'light' || queryTheme === 'dark') ? queryTheme : store.get('theme');
  applyTheme(savedTheme || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  document.getElementById('theme-toggle').addEventListener('click', () => {
    applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  /* ---------- avatar Byte ---------- */
  const Avatar = (function () {
    const btn = document.getElementById('avatar');
    const bubble = document.getElementById('bubble');
    const bubbleText = document.getElementById('bubble-text');
    const bubbleMeta = document.getElementById('bubble-meta');
    const ping = document.getElementById('avatar-ping');
    const eyes = document.getElementById('av-eyes');
    const mouth = document.getElementById('av-mouth');
    const MOUTH_IDLE = 'M52 76 Q60 82 68 76';
    const MOUTH_HAPPY = 'M50 74 Q60 88 70 74';
    const used = {};       // pista siguiente por diapositiva
    let hideTimer = 0, calmTimer = 0;
    let current = 0;

    function calm() {
      btn.classList.remove('happy', 'talking');
      mouth.setAttribute('d', MOUTH_IDLE);
    }

    function say(html, meta) {
      bubbleText.innerHTML = html;
      bubbleMeta.textContent = meta || '';
      bubble.hidden = false;
      // reinicia la animacion de aparicion
      bubble.style.animation = 'none';
      void bubble.offsetWidth;
      bubble.style.animation = '';
      btn.classList.remove('hop');
      void btn.offsetWidth;
      btn.classList.add('hop');
      btn.classList.add('happy', 'talking');
      mouth.setAttribute('d', MOUTH_HAPPY);
      ping.classList.remove('on');
      if (Scene2D) Scene2D.pulse();
      clearTimeout(calmTimer);
      calmTimer = setTimeout(calm, 1400);
      clearTimeout(hideTimer);
      hideTimer = setTimeout(close, 16000);
    }

    function close() { bubble.hidden = true; clearTimeout(hideTimer); }

    function hint() {
      const list = (SLIDES[current] && SLIDES[current].hints) || ['¡Estoy aquí para ayudarte!'];
      const k = used[current] || 0;
      used[current] = k + 1;
      say(fmt(list[k % list.length]), `Pista ${(k % list.length) + 1}/${list.length}`);
    }

    function sayLine(slideIndex, line) {
      const code = SLIDES[slideIndex].code;
      const text = code && code.hints && code.hints[line];
      if (text) say(fmt(text), `Línea ${(code.start || 1) + line - 1}`);
    }

    function setSlide(i) {
      current = i;
      close();
      calm();
      ping.classList.add('on');
    }

    btn.addEventListener('click', hint);
    document.getElementById('bubble-close').addEventListener('click', close);

    // los ojos siguen al puntero
    window.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(d / 160, 1) * 4;
      eyes.style.transform = `translate(${(dx / d) * k}px, ${(dy / d) * k}px)`;
    }, { passive: true });

    return { hint, say, sayLine, setSlide, close };
  })();

  /* ---------- navegacion ---------- */
  const dotsEl = document.getElementById('dots');
  const counter = document.getElementById('counter');
  const bar = document.getElementById('progress-bar');
  let cur = -1;
  let busy = 0;

  SLIDES.forEach((s, i) => {
    const b = document.createElement('button');
    b.className = 'dot';
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `Ir a la diapositiva ${i + 1}: ${s.title.replace(/`/g, '')}`);
    b.addEventListener('click', () => go(i));
    dotsEl.appendChild(b);
  });

  function go(n) {
    n = Math.max(0, Math.min(SLIDES.length - 1, n));
    if (n === cur) return;
    const dir = n > cur ? 1 : -1;
    deck.style.setProperty('--dir', dir);
    const prev = slideEls[cur];
    if (prev) {
      prev.classList.remove('active');
      prev.classList.add('leaving');
      const p = prev;
      setTimeout(() => p.classList.remove('leaving'), 460);
    }
    const next = slideEls[n];
    next.classList.remove('leaving');
    next.scrollTop = 0;
    next.classList.add('active');
    next.querySelectorAll('.ln.picked').forEach((el) => el.classList.remove('picked'));
    cur = n;

    const s = SLIDES[n];
    root.style.setProperty('--accent', s.accent || '#0070f3');
    if (Scene2D) Scene2D.setMotif(s.motif, s.accent);
    Array.prototype.forEach.call(dotsEl.children, (d, i) => {
      d.classList.toggle('on', i === n);
      d.setAttribute('aria-selected', i === n ? 'true' : 'false');
    });
    // mantiene visible el punto activo cuando hay muchas diapositivas
    const activeDot = dotsEl.children[n];
    dotsEl.scrollLeft = activeDot.offsetLeft - dotsEl.clientWidth / 2 + activeDot.offsetWidth / 2;
    counter.textContent = `${pad2(n + 1)} / ${pad2(SLIDES.length)}`;
    bar.style.width = `${((n + 1) / SLIDES.length) * 100}%`;
    try { history.replaceState(null, '', `#${n + 1}`); } catch (e) { /* file:// restringido */ }
    Avatar.setSlide(n);
    busy = Date.now();
  }

  const next = () => go(cur + 1);
  const prev = () => go(cur - 1);
  document.getElementById('next').addEventListener('click', next);
  document.getElementById('prev').addEventListener('click', prev);

  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case 'ArrowRight': case 'PageDown': case ' ': e.preventDefault(); next(); break;
      case 'ArrowLeft': case 'PageUp': e.preventDefault(); prev(); break;
      case 'Home': go(0); break;
      case 'End': go(SLIDES.length - 1); break;
      case 'h': case 'H': Avatar.hint(); break;
      case 't': case 'T': document.getElementById('theme-toggle').click(); break;
      case 'Escape': Avatar.close(); break;
      default: break;
    }
  });

  // gesto de deslizar en pantallas tactiles
  let touchX = null;
  deck.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  deck.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 60) (dx < 0 ? next : prev)();
  }, { passive: true });

  /* clic en lineas de codigo con pista */
  deck.addEventListener('click', (e) => {
    const line = e.target.closest('.ln.has-hint');
    if (!line) return;
    const slide = line.closest('.slide');
    slide.querySelectorAll('.ln.picked').forEach((el) => el.classList.remove('picked'));
    line.classList.add('picked');
    Avatar.sayLine(Number(slide.dataset.index), Number(line.dataset.line));
  });
  deck.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('has-hint')) {
      e.preventDefault();
      e.stopPropagation();
      e.target.click();
    }
  });

  /* ---------- arranque ---------- */
  const startAt = parseInt((location.hash || '').replace('#', ''), 10);
  go(Number.isFinite(startAt) ? startAt - 1 : 0);
  // saludo inicial de Byte
  setTimeout(() => { if (cur === 0 && Date.now() - busy > 1200) Avatar.hint(); }, 1800);
})();
