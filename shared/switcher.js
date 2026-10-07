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
  var TIPOS = [['P', 'past', 'Evento finalizado', 'copa-coc-cali-2026', 'Finalizado'],
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
    '.olc-sw a.olc-sw__ic{justify-content:center;width:36px;padding:0}' +
    '.olc-sw a:focus-visible{outline:2px solid #6aa5ff;outline-offset:2px}' +
    '.olc-sw__sep{width:1px;height:20px;margin:0 4px;background:rgba(255,255,255,.22)}' +
    '.olc-sw__sel{display:inline-flex;align-items:center;gap:8px;min-height:36px;padding:0 12px 0 14px;border:0;border-radius:999px;background:rgba(255,255,255,.12);color:#fff;font:inherit;cursor:pointer;white-space:nowrap}' +
    '.olc-sw__sel:hover{background:rgba(255,255,255,.2)}' +
    '.olc-sw__sel:focus-visible{outline:2px solid #6aa5ff;outline-offset:2px}' +
    '.olc-sw__sel svg{flex:none;transition:transform .15s}.olc-sw__sel[aria-expanded="true"] svg{transform:rotate(180deg)}' +
    '.olc-sw__pop{position:fixed;inset:auto;margin:0;min-width:200px;padding:6px;border:0;border-radius:16px;background:rgba(27,27,43,.97);box-shadow:0 10px 28px rgba(0,0,0,.35);color:#fff;font:600 13px/1 -apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif}' +
    '.olc-sw__pop a{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:40px;padding:0 12px;border-radius:10px;color:#d6d8ee;text-decoration:none;white-space:nowrap}' +
    '.olc-sw__pop a:hover{background:rgba(255,255,255,.12);color:#fff}' +
    '.olc-sw__pop a[aria-selected="true"]{background:#fff;color:#1b1b2b}' +
    '.olc-sw__pop a:focus-visible{outline:2px solid #6aa5ff;outline-offset:-2px}' +
    '@media (max-width:560px){.olc-sw a{padding:0 10px}.olc-sw a.olc-sw__ic{padding:0}.olc-sw__grip{display:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* DC-111: Plataforma = engranaje, Landing = planeta (iconos propios del conmutador, sin depender de la hoja de iconos de cada app). */
  var SV = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">';
  var IC_GEAR = SV + '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';
  var IC_PLANETA = SV + '<circle cx="12" cy="12" r="6"/><ellipse cx="12" cy="12" rx="10.5" ry="3.6" transform="rotate(-22 12 12)"/></svg>';

  var box = document.createElement('div');
  box.className = 'olc-sw'; box.setAttribute('role', 'navigation'); box.setAttribute('aria-label', 'Cambiar de prototipo');
  box.innerHTML = '<span class="olc-sw__grip" aria-hidden="true" title="Arrastra para mover">⋮⋮</span>' +
    '<a data-t="platform" class="olc-sw__ic" title="Plataforma" aria-label="Plataforma">' + IC_GEAR + '</a><a data-t="landing" class="olc-sw__ic" title="Landing" aria-label="Landing">' + IC_PLANETA + '</a>' +
    '<span class="olc-sw__sep" aria-hidden="true"></span>' +
    '<button type="button" class="olc-sw__sel" aria-haspopup="listbox" aria-expanded="false" aria-controls="olc-sw-pop" aria-label="Momento del evento"><span class="olc-sw__sel-t">Momento del evento</span>' +
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5"/></svg></button>' +
    '<div id="olc-sw-pop" class="olc-sw__pop" popover="auto" role="listbox" aria-label="Momento del evento">' +
    TIPOS.map(function (t) { return '<a role="option" data-ev="' + t[1] + '">' + t[2] + '</a>'; }).join('') + '</div>';
  var aP = box.querySelector('[data-t=platform]'), aL = box.querySelector('[data-t=landing]');
  function pintar() {
    var url = destinoUrl();
    [[aP, 'platform'], [aL, 'landing']].forEach(function (p) {
      var actual = p[1] === cur;
      p[0].setAttribute('aria-current', actual ? 'true' : 'false');
      if (actual) p[0].removeAttribute('href'); else p[0].setAttribute('href', url);
    });
  }
  var evs = box.querySelectorAll('.olc-sw__pop a'), sel = box.querySelector('.olc-sw__sel'), pop = box.querySelector('.olc-sw__pop');
  function pintarTipos() {
    var act = tipoActivo(), nombre = 'Momento del evento';
    Array.prototype.forEach.call(evs, function (a, i) {
      var on = TIPOS[i][1] === act;
      a.setAttribute('aria-selected', on ? 'true' : 'false');
      a.setAttribute('href', hashTipo(TIPOS[i][3]));
      if (on) nombre = TIPOS[i][2];
    });
    sel.querySelector('.olc-sw__sel-t').textContent = nombre;
  }
  // Popover nativo: se ancla debajo del botón y se cierra al elegir, con Esc o al tocar fuera.
  function ubicarPop() {
    var r = sel.getBoundingClientRect();
    var abajo = r.bottom + 8 + pop.offsetHeight <= innerHeight - 8; // en móvil el conmutador va abajo: abre hacia arriba
    pop.style.top = (abajo ? r.bottom + 8 : Math.max(8, r.top - 8 - pop.offsetHeight)) + 'px';
    pop.style.left = Math.max(8, Math.min(innerWidth - pop.offsetWidth - 8, r.left)) + 'px';
  }
  sel.addEventListener('click', function () {
    if (pop.togglePopover) { pop.togglePopover(); if (pop.matches(':popover-open')) ubicarPop(); }
  });
  pop.addEventListener('toggle', function (e) { sel.setAttribute('aria-expanded', e.newState === 'open' ? 'true' : 'false'); });
  pop.addEventListener('click', function (e) { if (e.target.closest('a') && pop.hidePopover) pop.hidePopover(); });
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
