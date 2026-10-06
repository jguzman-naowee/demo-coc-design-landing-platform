/* Conmutador flotante Plataforma ⇄ Landing. Conserva la ruta y los filtros al cambiar.
   Uso: <script src="../shared/switcher.js" data-current="platform|landing"></script> */
(function () {
  var cur = document.currentScript.getAttribute('data-current');
  var other = cur === 'platform' ? 'landing' : 'platform';
  var KEY = 'olc-switcher-pos';

  function destinoHash() {
    var h = location.hash || '#/';
    var m = h.match(/^#\/eventos\/([^?]+)(\?.*)?$/);
    if (m) {
      var q = new URLSearchParams(m[2] ? m[2].slice(1) : '');
      var tab = q.get('tab');
      // Pestañas que solo existen en un lado se descartan para caer en la pestaña por defecto.
      if (cur === 'platform' && (tab === 'dashboard' || tab === 'deportistas')) q.delete('tab');
      var s = q.toString();
      return '#/eventos/' + m[1] + (s ? '?' + s : '');
    }
    return cur === 'platform' ? '#/' : '#/eventos';
  }

  // Tipo de evento -> evento demo (estados calculados por OLC.estado).
  var TIPOS = [['P', 'past', 'Evento pasado', 'copa-coc-cali-2026', 'Finalizado'],
    ['N', 'now', 'Evento en curso', 'jja-2026', 'En curso'],
    ['F', 'future', 'Evento futuro', 'intercolegiados-2026', 'Próximo']];
  function codigoAbierto() {
    var m = (location.hash || '').match(/^#\/eventos\/([^?]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }
  function tipoActivo() {
    var code = codigoAbierto();
    if (!code || !window.OLC) return null;
    var ev = OLC.eventos().filter(function (e) { return e.code === code; })[0];
    if (!ev) return null;
    var est = OLC.estado(ev);
    for (var i = 0; i < TIPOS.length; i++) if (TIPOS[i][4] === est) return TIPOS[i][1];
    return null;
  }
  // Conserva pestaña y filtros del evento abierto; el día (fecha propia de cada evento) se descarta.
  function hashTipo(code) {
    var h = location.hash || '', m = h.match(/^#\/eventos\/[^?]+(\?.*)?$/);
    var q = new URLSearchParams(m && m[1] ? m[1].slice(1) : '');
    q.delete('dia');
    if (cur === 'platform' && (q.get('tab') === 'dashboard' || q.get('tab') === 'deportistas')) q.delete('tab');
    var s = q.toString();
    return '#/eventos/' + encodeURIComponent(code) + (s ? '?' + s : '');
  }

  function destinoUrl() {
    var path = location.pathname.replace('/' + cur + '/', '/' + other + '/');
    if (path === location.pathname) path = location.pathname.replace(/[^/]*$/, '') + '../' + other + '/';
    return path + destinoHash();
  }

  var css = '.olc-sw{position:fixed;top:10px;right:10px;z-index:2147483000;display:flex;align-items:center;gap:2px;padding:4px;border-radius:999px;background:rgba(27,27,43,.92);box-shadow:0 6px 20px rgba(0,0,0,.25);font:600 13px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#fff;touch-action:none;user-select:none}' +
    '.olc-sw__grip{width:18px;height:28px;display:flex;align-items:center;justify-content:center;cursor:grab;color:#9c9ebf;font-size:14px;letter-spacing:-2px}' +
    '.olc-sw a{display:inline-flex;align-items:center;min-height:36px;padding:0 14px;border-radius:999px;color:#d6d8ee;text-decoration:none;white-space:nowrap}' +
    '.olc-sw a:hover{background:rgba(255,255,255,.12);color:#fff}' +
    '.olc-sw a[aria-current="true"]{background:#fff;color:#1b1b2b;cursor:default}' +
    '.olc-sw a:focus-visible{outline:2px solid #6aa5ff;outline-offset:2px}' +
    '.olc-sw__sep{width:1px;height:20px;margin:0 4px;background:rgba(255,255,255,.22)}' +
    '.olc-sw a.olc-sw__ev{justify-content:center;width:30px;min-height:30px;padding:0;font-size:12px;font-weight:700}' +
    '.olc-sw a.olc-sw__ev[aria-pressed="true"]{background:#fff;color:#1b1b2b;cursor:default}' +
    '@media (max-width:560px){.olc-sw a{padding:0 10px}.olc-sw a.olc-sw__ev{padding:0}.olc-sw__grip{display:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var box = document.createElement('div');
  box.className = 'olc-sw'; box.setAttribute('role', 'navigation'); box.setAttribute('aria-label', 'Cambiar de prototipo');
  box.innerHTML = '<span class="olc-sw__grip" aria-hidden="true" title="Arrastra para mover">⋮⋮</span>' +
    '<a data-t="platform">Plataforma</a><a data-t="landing">Landing</a>' +
    '<span class="olc-sw__sep" aria-hidden="true"></span>' +
    TIPOS.map(function (t) { return '<a class="olc-sw__ev" data-ev="' + t[1] + '" role="button" title="' + t[2] + '" aria-label="' + t[2] + '">' + t[0] + '</a>'; }).join('');
  var aP = box.querySelector('[data-t=platform]'), aL = box.querySelector('[data-t=landing]');
  function pintar() {
    var url = destinoUrl();
    [[aP, 'platform'], [aL, 'landing']].forEach(function (p) {
      var actual = p[1] === cur;
      p[0].setAttribute('aria-current', actual ? 'true' : 'false');
      if (actual) p[0].removeAttribute('href'); else p[0].setAttribute('href', url);
    });
  }
  var evs = box.querySelectorAll('.olc-sw__ev');
  function pintarTipos() {
    var act = tipoActivo();
    Array.prototype.forEach.call(evs, function (a, i) {
      a.setAttribute('aria-pressed', TIPOS[i][1] === act ? 'true' : 'false');
      a.setAttribute('href', hashTipo(TIPOS[i][3]));
    });
  }
  function pintarTodo() { pintar(); pintarTipos(); }
  pintarTodo(); window.addEventListener('hashchange', pintarTodo);
  // En el landing la cabecera pública ocupa la esquina: el conmutador baja justo debajo de ella.
  if (cur === 'landing') box.style.top = '100px';
  document.body.appendChild(box);

  // Se oculta mientras haya un menú o diálogo modal abierto (queda debajo del scrim).
  var tapa = function () {
    var abierto = document.querySelector('dialog[open], .is-open[aria-modal="true"]') || document.body.classList.contains('lp-lock');
    box.style.visibility = abierto ? 'hidden' : '';
  };
  new MutationObserver(tapa).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['open', 'class', 'inert'] });

  // Posición arrastrable y recordada.
  try { var p = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (p) { box.style.top = p.t + 'px'; box.style.right = 'auto'; box.style.left = p.l + 'px'; } } catch (e) {}
  var grip = box.querySelector('.olc-sw__grip'), drag = null;
  grip.addEventListener('pointerdown', function (e) {
    var r = box.getBoundingClientRect(); drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    grip.setPointerCapture(e.pointerId); grip.style.cursor = 'grabbing';
  });
  grip.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var l = Math.max(0, Math.min(innerWidth - box.offsetWidth, e.clientX - drag.dx));
    var t = Math.max(0, Math.min(innerHeight - box.offsetHeight, e.clientY - drag.dy));
    box.style.left = l + 'px'; box.style.top = t + 'px'; box.style.right = 'auto';
  });
  grip.addEventListener('pointerup', function () {
    if (!drag) return; drag = null; grip.style.cursor = 'grab';
    try { sessionStorage.setItem(KEY, JSON.stringify({ t: parseInt(box.style.top, 10), l: parseInt(box.style.left, 10) })); } catch (e) {}
  });
})();
