/* Shell del landing: router hash, contexto de tabs, portada y detalle. */
(function () {
  'use strict';

  var OLC = window.OLC;
  var app = document.getElementById('app');

  /* ── Utilidades ─────────────────────────────────────────────────── */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function dias(a, b) { return Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000); }
  function tone(estado) { return estado === 'En curso' ? 'live' : estado === 'Próximo' ? 'soon' : 'done'; }
  function pill(estado, photo) {
    return '<span class="lp-pill lp-pill--' + tone(estado) + (photo ? ' lp-pill--photo' : '') + '">' + esc(estado) + '</span>';
  }
  function variante(code) {
    var n = 0; for (var i = 0; i < code.length; i++) n += code.charCodeAt(i);
    return ['', ' lp-ph--b', ' lp-ph--c'][n % 3];
  }
  /* Texto temporal del evento, siempre derivado de OLC.HOY. */
  function cuando(ev, estado) {
    if (estado === 'Próximo') { var n = dias(OLC.HOY, ev.inicio); return n === 1 ? 'Falta 1 día' : 'Faltan ' + n + ' días'; }
    if (estado === 'En curso') return 'Día ' + (dias(ev.inicio, OLC.HOY) + 1) + ' de ' + (dias(ev.inicio, ev.fin) + 1);
    return 'Finalizó el ' + OLC.fechaCorta(ev.fin);
  }

  var IC = {
    cal: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    pin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    org: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 21V7l8-4 8 4v14M9 21v-6h6v6M9 10h.01M15 10h.01"/></svg>',
    globe: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
    arrow: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    trophy: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M8 4h8v6a4 4 0 0 1-8 0V4zM8 6H4v1a3 3 0 0 0 4 3M16 6h4v1a3 3 0 0 1-4 3M12 14v4M8 21h8M10 18h4"/></svg>',
    check: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
    empty: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M9 15h6"/></svg>',
    menu: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    prev: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    pause: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
    play: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg>',
    msg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
    ig: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>',
    fb: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/></svg>',
    x: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 4h4l12 16h-4zM20 4l-7 8M4 20l7-8"/></svg>',
    yt: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor"/></svg>'
  };

  /* ── Router ─────────────────────────────────────────────────────── */
  function parseHash() {
    var h = location.hash.replace(/^#/, '') || '/';
    var q = h.indexOf('?');
    var path = q >= 0 ? h.slice(0, q) : h;
    var params = {};
    if (q >= 0) new URLSearchParams(h.slice(q + 1)).forEach(function (v, k) { if (v !== '') params[k] = v; });
    var m = path.match(/^\/eventos\/([^/]+)\/?$/);
    if (m) return { view: 'detail', code: decodeURIComponent(m[1]), params: params, path: path };
    if (path === '/eventos') return { view: 'list', params: params, path: path };
    return { view: 'home', params: params, path: path };
  }
  function build(path, params) {
    var sp = new URLSearchParams();
    Object.keys(params).forEach(function (k) { if (params[k] !== '' && params[k] != null) sp.set(k, params[k]); });
    var s = sp.toString();
    return '#' + path + (s ? '?' + s : '');
  }
  function merge(params, patch) {
    var out = {};
    Object.keys(params).forEach(function (k) { out[k] = params[k]; });
    Object.keys(patch || {}).forEach(function (k) {
      if (patch[k] === '' || patch[k] == null) delete out[k]; else out[k] = String(patch[k]);
    });
    return out;
  }

  var uiStore = {};
  var lastPath = null;
  var lastTab = null;

  /* DC-047: con los tabs ya pegados, al cambiar de pestaña el scroll queda donde empieza su contenido; si aún se ve el hero no se mueve. */
  function alInicio(y) {
    var nav = document.querySelector('.lp-tabnav'), info = document.getElementById('lp-info'), pnl = document.getElementById('lp-panel');
    var cont = info && !info.hidden ? info : pnl, st = getComputedStyle(document.documentElement);
    if (!nav || !cont) return y;
    var hh = parseFloat(st.getPropertyValue('--lp-hh')) || 0, nh = nav.getBoundingClientRect().height;
    var pegado = y >= nav.getBoundingClientRect().top + window.scrollY - hh - 1;
    if (!pegado) return y;
    return Math.max(0, Math.round(cont.getBoundingClientRect().top + window.scrollY - hh - nh));
  }

  function render() {
    var r = parseHash();
    var changed = r.path !== lastPath;
    var y = window.scrollY;
    var out = r.view === 'detail' ? detailView(r) : r.view === 'list' ? listView(r) : homeView(r);
    /* Mismo evento: solo cambia el panel; la nav pegada y el header no se reemplazan (DC-092). */
    if (!changed && out.panel && document.getElementById('lp-panel') && document.querySelector('.lp-tabnav')) {
      var cambio = out.panel(); window.scrollTo({ top: cambio ? alInicio(y) : y, behavior: 'instant' }); lastPath = r.path; return;
    }
    timers.forEach(clearInterval); timers = [];
    document.title = out.title + ' · Ciclo Olímpico';
    app.innerHTML = header() + '<main id="lp-main" tabindex="-1">' + out.html + '</main>' + footer();
    document.body.classList.remove('lp-lock');
    wireChrome();
    if (out.after) out.after();
    window.scrollTo(0, changed ? 0 : y);
    if (pendingGo) { var t = $(pendingGo); pendingGo = null; if (t) t.scrollIntoView(); }
    lastPath = r.path;
  }
  window.addEventListener('hashchange', render);

  /* ── Datos y ayudas de la portada ───────────────────────────────── */
  var REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  var ROTULO = { 'En curso': 'En competencia', 'Próximo': 'Próximamente', 'Finalizado': 'Finalizado' };
  /* Cifras fijas del sitio real (fixtures/home.ts): ganan sobre el API, no se calculan. */
  var CIFRAS = [['10', 'Eventos al año aproximadamente'], ['40', 'Deportes'], ['500', 'Deportistas']];
  var STATS_FOTOS = [
    ['stats/stats-judo-suramericanos.webp', 'Judo, Campeonato Suramericano'],
    ['stats/stats-bowling-panamericano.webp', 'Bowling, Panamericano'],
    ['stats/stats-gimnasia-centroamericanos.webp', 'Gimnasia, Centroamericanos']
  ];
  /* Afiche por code del prototipo: solo coincidencias exactas; el resto queda en degradado. */
  var FOTO = { 'suramericanos-sante-fe-2026': 'afiches/event-jssf2026.webp', 'intercolegiados-2026': 'afiches/event-jin2026.webp' };
  var HERO_FOTO = { 'intercolegiados-2026': 'hero/hero-intercolegiados.webp' };
  var PARTNERS = [
    ['odesur', 'Organización Deportiva Suramericana', 'org'], ['odebol', 'Organización Deportiva Bolivariana', 'org'],
    ['world-games', 'The World Games', 'org'], ['wada', 'World Anti-doping Agency', 'org'], ['mindeporte', 'Ministerio del Deporte', 'org'],
    ['coi', 'COI', 'org'], ['anoc', 'ANOC', 'org'], ['panam', 'Panam Sports', 'org'], ['centro-caribe', 'Centro Caribe Sports', 'org'],
    ['abinbev', 'AB InBev', 'top'], ['airbnb', 'Airbnb', 'top'], ['alibaba', 'Alibaba', 'top'], ['allianz', 'Allianz', 'top'], ['atos', 'Atos', 'top'],
    ['bridgestone', 'Bridgestone', 'top'], ['cocacola', 'Coca-Cola', 'top'], ['deloitte', 'Deloitte', 'top'], ['intel', 'Intel', 'top'],
    ['omega', 'Omega', 'top'], ['pg', 'P&G', 'top'], ['samsung', 'Samsung', 'top'], ['toyota', 'Toyota', 'top'], ['visa', 'Visa', 'top'],
    ['smartfit', 'Smart Fit', 'pat'], ['positiva', 'Positiva', 'pat'], ['totto', 'TOTTO', 'pat'], ['rcn-radio', 'RCN Radio', 'pat'], ['canal-rcn', 'Canal RCN', 'pat']
  ];
  var PARTNER_TABS = [{ id: 'org', label: 'Organizaciones' }, { id: 'top', label: 'Programa TOP' }, { id: 'pat', label: 'Patrocinadores' }];
  var PIE = [
    ['Comité', ['Información general', 'Historia del COC', 'Presidente', 'Federaciones', 'Ciclo Olímpico', 'Noticias']],
    ['Olimpismo', ['Educación en valores olímpicos', 'Academia Olímpica Colombiana', 'Comité Pierre de Coubertín']],
    ['Programas', ['Atletas', 'Equidad de género en el deporte', 'Sostenibilidad y Legado', 'Promoción de valores olímpicos']]
  ];
  var timers = [];
  var closeMenu = function () {};
  var menuKey = null;
  var pendingGo = null;
  var supportTries = 0;

  function $(id) { return document.getElementById(id); }
  function pillR(estado, photo) {
    return '<span class="lp-pill lp-pill--' + tone(estado) + (photo ? ' lp-pill--photo' : '') + '">' + ROTULO[estado] + '</span>';
  }
  function dmy(iso) { var d = new Date(iso + 'T12:00:00'); return { m: MESES[d.getMonth()], d: d.getDate(), y: d.getFullYear() }; }
  /* Estilo del date_label del API: «Jul 20 – Ago 8 2026». */
  function dateLabel(ev) {
    var a = dmy(ev.inicio), b = dmy(ev.fin);
    if (a.y !== b.y) return a.m + ' ' + a.d + ' ' + a.y + ' – ' + b.m + ' ' + b.d + ' ' + b.y;
    return a.m + ' ' + a.d + ' – ' + (a.m === b.m ? '' : b.m + ' ') + b.d + ' ' + a.y;
  }
  function addMonths(iso, n) {
    var d = new Date(iso + 'T12:00:00'); d.setMonth(d.getMonth() + n);
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function fotoImg(code, hero) {
    var f = hero ? (HERO_FOTO[code] || 'hero/hero-default.webp') : FOTO[code];
    return f ? '<img src="assets/' + f + '" alt=""' + (hero ? '' : ' loading="lazy"') + '>' : '<span class="lp-ph__tag">Foto del evento</span>';
  }
  function fallbackImg(file, alt, fb, cls) {
    return '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="assets/' + file + '" alt="' + esc(alt) + '"' + (fb != null ? ' data-fb="' + esc(fb) + '"' : '') + '>';
  }
  /* Si un recurso no carga, se muestra el degradado o el texto equivalente. */
  document.addEventListener('error', function (e) {
    var t = e.target;
    if (!t || t.tagName !== 'IMG') return;
    var fb = t.getAttribute('data-fb');
    if (fb == null) { t.remove(); return; }
    var s = document.createElement('span'); s.className = 'lp-fb'; s.textContent = fb; t.replaceWith(s);
  }, true);

  function agrupar() {
    var evs = OLC.eventos();
    var g = { 'En curso': [], 'Próximo': [], 'Finalizado': [] };
    evs.forEach(function (e) { g[e.estado].push(e); });
    g['En curso'].sort(function (a, b) { return a.inicio < b.inicio ? -1 : 1; });
    g['Próximo'].sort(function (a, b) { return a.inicio < b.inicio ? -1 : 1; });
    g['Finalizado'].sort(function (a, b) { return a.inicio < b.inicio ? 1 : -1; });
    return g;
  }
  /* Horizonte del home y del hero: 6 meses hacia adelante; /eventos no recorta. */
  function proximosEnHorizonte(g) {
    var lim = addMonths(OLC.HOY, 6);
    return g['Próximo'].filter(function (e) { return e.inicio <= lim; });
  }

  /* Carrusel con avance automático: respeta reduced-motion, se pausa al pasar/enfocar y tiene botón. */
  function rotor(o) {
    var cur = 0, playing = !REDUCE && o.n > 1, held = false;
    function go(i) { cur = (i + o.n) % o.n; o.show(cur); }
    function sync() {
      if (o.btn) {
        o.btn.setAttribute('aria-label', playing ? o.pause : o.play);
        o.btn.innerHTML = playing ? IC.pause : IC.play;
      }
      if (o.live) o.live.setAttribute('aria-live', playing ? 'off' : 'polite');
    }
    if (o.btn) {
      if (REDUCE || o.n < 2) o.btn.hidden = true;
      o.btn.addEventListener('click', function () { playing = !playing; sync(); });
    }
    o.region.addEventListener('mouseenter', function () { held = true; });
    o.region.addEventListener('mouseleave', function () { held = false; });
    o.region.addEventListener('focusin', function () { held = true; });
    o.region.addEventListener('focusout', function () { held = false; });
    if (!REDUCE && o.n > 1) timers.push(setInterval(function () { if (playing && !held && !document.hidden) go(cur + 1); }, o.ms));
    sync(); go(0);
    return { go: go, next: function () { go(cur + 1); }, prev: function () { go(cur - 1); } };
  }

  /* Pestañas «parent»: role=tab, flechas/Inicio/Fin y foco que sigue a la selección. */
  function tabsHtml(pref, items, sel, label) {
    return '<div class="lp-tabs" role="tablist" aria-label="' + esc(label) + '">' + items.map(function (t) {
      return '<button type="button" role="tab" id="' + pref + '-t-' + t.id + '" data-tab="' + t.id + '" aria-selected="' + (t.id === sel) + '" aria-controls="' + pref + '-p" tabindex="' + (t.id === sel ? 0 : -1) + '">' + t.label + '</button>';
    }).join('') + '</div>';
  }
  function wireTabs(root, onPick) {
    var list = root.querySelector('[role="tablist"]'); if (!list) return;
    var btns = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { onPick(b.getAttribute('data-tab')); });
      b.addEventListener('keydown', function (e) {
        var to = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? btns.length - 1 : null;
        if (to == null) return;
        e.preventDefault();
        onPick(btns[(to + btns.length) % btns.length].getAttribute('data-tab'), true);
      });
    });
  }
  function refocusTab(root, id) {
    var b = root.querySelector('[data-tab="' + id + '"]'); if (b) b.focus({ preventScroll: true });
  }

  function vacio(msg, desc) {
    return '<div class="lp-nada"><div class="lp-nada__card" aria-hidden="true"><i></i><i></i><i></i></div>' +
      '<p class="lp-nada__t">' + msg + '</p>' + (desc ? '<p class="lp-nada__d">' + desc + '</p>' : '') + '</div>';
  }

  /* Tarjeta-afiche: foto a sangre con degradado y texto encima. «Próximo» no navega. */
  function card(e, h) {
    var go = e.estado !== 'Próximo', tid = 'ect-' + e.code;
    return '<article class="ec' + (go ? '' : ' ec--off') + (FOTO[e.code] ? ' ec--foto' : '') + '"><div class="ec__img lp-ph' + variante(e.code) + '">' + fotoImg(e.code) + '</div>' +
      '<div class="ec__shade" aria-hidden="true"></div><div class="ec__body">' + pillR(e.estado, true) +
      '<' + h + ' class="ec__t" id="' + tid + '">' + esc(e.nombre) + '</' + h + '><p class="ec__d">' + dateLabel(e) + ' · ' + esc(e.lugar) + '</p></div>' +
      (go ? '<a class="ec__go" href="#/eventos/' + encodeURIComponent(e.code) + '" aria-labelledby="' + tid + '"></a>' : '') + '</article>';
  }
  function pastRow(e) {
    return '<li class="lp-past__row"><div class="lp-past__img lp-ph' + variante(e.code) + '">' + fotoImg(e.code) + '</div><div class="lp-past__b">' +
      pillR(e.estado) + '<h4>' + esc(e.nombre) + '</h4><p>' + dateLabel(e) + ' · ' + esc(e.lugar) + '</p>' +
      '<a class="lp-past__a" href="#/eventos/' + encodeURIComponent(e.code) + '" aria-label="Ver resultados de ' + esc(e.nombre) + '">Ver resultados <span aria-hidden="true">→</span></a></div></li>';
  }

  /* ── Cabecera y pie ─────────────────────────────────────────────── */
  function logo() {
    return '<a class="lp-logo" href="#/">' + fallbackImg('logos/logo-header.webp', 'Colombia Comité Olímpico · Eventos', 'Comité Olímpico · Eventos') + '</a>';
  }
  function header() {
    var login = function (cls) { return '<button type="button" class="lp-login ' + cls + '" data-inert title="Enlace de ejemplo en el prototipo">Iniciar sesión</button>'; };
    return '<header class="lp-header"><div class="lp-wrap lp-header__in">' + logo() +
      '<nav class="lp-nav" aria-label="Principal"><a href="#/" data-goto="eventos">Eventos</a></nav>' + login('lp-login--bar') +
      '<span class="lp-hdiv" aria-hidden="true"></span>' +
      '<button type="button" class="lp-menu" id="lp-menu" aria-expanded="false" aria-controls="lp-drawer" aria-haspopup="dialog"><span class="lp-menu__dots" aria-hidden="true">•••</span><span class="lp-menu__t">Menú</span></button>' +
      '</div></header><div class="lp-ovl" id="lp-ovl"></div>' +
      '<aside class="lp-drawer" id="lp-drawer" role="dialog" aria-modal="true" aria-label="Menú principal" inert>' +
      '<button type="button" class="lp-drawer__x" id="lp-menu-x"><span>Cerrar el menú</span>' + IC.close + '</button>' +
      '<nav class="lp-drawer__nav" aria-label="Menú"><a href="#/">Inicio</a><a href="#/" data-goto="eventos">Eventos</a></nav>' + login('lp-login--lg') + '</aside>';
  }
  function footer() {
    var inert = function (txt) { return '<a href="#" data-inert>' + txt + '</a>'; };
    var cols = PIE.map(function (c) {
      return '<div><h2>' + c[0] + '</h2><ul>' + c[1].map(function (t) { return '<li>' + inert(t) + '</li>'; }).join('') + '</ul></div>';
    }).join('');
    var soc = [['Instagram', IC.ig], ['Facebook', IC.fb], ['X', IC.x], ['YouTube', IC.yt]].map(function (s) {
      return '<li><a href="#" data-inert aria-label="' + s[0] + '" title="Enlace de ejemplo">' + s[1] + '</a></li>';
    }).join('');
    return '<footer class="lp-footer"><div class="lp-peak" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>' +
      '<div class="lp-wrap lp-footer__in"><a class="lp-footer__logo" href="#/">' + fallbackImg('logos/logo-footer.webp', 'Comité Olímpico Colombiano', 'Comité Olímpico Colombiano') + '</a>' +
      '<nav class="lp-footer__cols" aria-label="Mapa del sitio">' + cols +
      '<div><h2>Redes</h2><ul class="lp-social">' + soc + '</ul><h2 class="lp-footer__sup">Soporte</h2>' +
      '<button type="button" class="lp-supbtn" data-support>' + IC.msg + 'Reporta novedad</button></div></nav></div>' +
      '<p class="lp-wrap lp-copy">© 2026 Comité Olímpico Colombiano · Todos los derechos reservados</p></footer>' +
      '<dialog class="lp-dlg" id="lp-support" aria-labelledby="lp-dlg-t"><div class="lp-dlg__in" id="lp-dlg-box"></div></dialog>';
  }

  function wireChrome() {
    var b = $('lp-menu'), d = $('lp-drawer'), o = $('lp-ovl'), x = $('lp-menu-x');
    var open = false;
    function set(on, back) {
      open = on;
      d.classList.toggle('is-open', on); o.classList.toggle('is-open', on);
      if (on) d.removeAttribute('inert'); else d.setAttribute('inert', '');
      b.setAttribute('aria-expanded', on ? 'true' : 'false');
      document.body.classList.toggle('lp-lock', on);
      if (on) x.focus(); else if (back) b.focus();
    }
    closeMenu = function () { if (open) set(false, false); };
    b.addEventListener('click', function () { set(!open, true); });
    x.addEventListener('click', function () { set(false, true); });
    o.addEventListener('click', function () { set(false, true); });
    d.addEventListener('click', function (e) { if (e.target.closest('a[href]')) set(false, false); });
    menuKey = function (e) {
      if (!open) return;
      if (e.key === 'Escape') { e.preventDefault(); set(false, true); return; }
      if (e.key !== 'Tab') return;
      var f = Array.prototype.slice.call(d.querySelectorAll('a[href],button:not([disabled])'));
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (f.indexOf(document.activeElement) < 0) { e.preventDefault(); first.focus(); }
    };
    wireSupport();
  }
  document.addEventListener('keydown', function (e) { if (menuKey) menuKey(e); });
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-skip],[data-inert],[data-goto]');
    if (!t) return;
    if (t.hasAttribute('data-skip')) { e.preventDefault(); var m = $('lp-main'); if (m) m.focus(); return; }
    if (t.hasAttribute('data-inert')) { e.preventDefault(); return; }
    e.preventDefault(); closeMenu();
    var id = t.getAttribute('data-goto'), p = parseHash();
    if (p.view === 'home') { var s = $(id); if (s) s.scrollIntoView(); }
    else { pendingGo = id; location.hash = '#/'; }
  });

  /* ── Portada ────────────────────────────────────────────────────── */
  var homeState = { tab: 'todos', partners: 'org' };

  function heroSlides() {
    var g = agrupar();
    var s = g['En curso'].concat(proximosEnHorizonte(g));
    return (s.length ? s : g['Finalizado']).slice(0, 3);
  }
  function heroHtml() {
    var sl = heroSlides(); if (!sl.length) return '';
    var slides = sl.map(function (e, i) {
      var h = i === 0 ? 'h1' : 'h2';
      var cta = e.estado === 'Próximo' ? '' : '<a class="lp-cta" href="#/eventos/' + encodeURIComponent(e.code) + '">' + (e.estado === 'Finalizado' ? 'Ver resultados' : 'Ver el evento') + ' ' + IC.arrow + '</a>';
      return '<div class="lp-slide" role="group" aria-roledescription="diapositiva" aria-label="' + (i + 1) + ' de ' + sl.length + '">' +
        '<div class="lp-ph' + variante(e.code) + '">' + fotoImg(e.code, true) + '</div><div class="lp-hero__veil"></div>' +
        '<div class="lp-wrap lp-slide__in"><div class="lp-slide__copy"><span class="lp-badge">' + ROTULO[e.estado] + '</span>' +
        '<' + h + '>' + esc(e.nombre) + '</' + h + '>' + (limpiarDesc(e.descripcion) ? '<p>' + esc(limpiarDesc(e.descripcion)) + '</p>' : '') + cta + '</div></div></div>';
    }).join('');
    return '<section class="lp-hero" id="lp-hero" aria-roledescription="carrusel" aria-label="Eventos destacados"><div class="lp-slides">' + slides + '</div></section>';
  }
  function wireHero() {
    var root = $('lp-hero'); if (!root) return;
    var slides = root.querySelectorAll('.lp-slide');
    var r = rotor({
      n: slides.length, ms: 8000, region: root, live: root.querySelector('.lp-slides'),
      show: function (i) {
        Array.prototype.forEach.call(slides, function (s, k) {
          s.classList.toggle('is-on', k === i);
          s.setAttribute('aria-hidden', k === i ? 'false' : 'true');
          if (k === i) s.removeAttribute('inert'); else s.setAttribute('inert', '');
        });
      }
    });
    return r;
  }

  function statsHtml() {
    var fotos = STATS_FOTOS.map(function (f, i) {
      return '<li class="lp-sc__s" data-i="' + i + '"><div class="lp-ph' + ['', ' lp-ph--b', ' lp-ph--c'][i] + '">' + fallbackImg(f[0], f[1]) + '</div></li>';
    }).join('');
    return '<section class="lp-stats" aria-label="El punto de encuentro del deporte nacional"><div class="lp-wrap lp-stats__in">' +
      '<div><span class="lp-stats__bar" aria-hidden="true"></span><h2 class="lp-h2">El punto de encuentro del deporte nacional</h2>' +
      '<p class="lp-stats__lead">Centralizamos cronogramas, escenarios, resultados y galerías de cada competencia organizada por el Comité Olímpico Colombiano. ¡Para que no te pierdas de nada!</p>' +
      '<p class="lp-stats__tag">Una sola casa para el deporte colombiano</p></div>' +
      '<div class="lp-sc" id="lp-sc" role="group" aria-roledescription="carrusel" aria-label="Fotos de eventos"><ul class="lp-sc__stage">' + fotos + '</ul>' +
      '<button type="button" class="lp-hbtn lp-sc__pause" aria-label="Pausar las fotos"></button></div>' +
      '<ul class="lp-stats__grid">' + CIFRAS.map(function (s) { return '<li class="lp-stat"><strong>' + s[0] + '</strong><span>' + s[1] + '</span></li>'; }).join('') + '</ul></div></section>';
  }
  function wireStats() {
    var root = $('lp-sc'); if (!root) return;
    var s = root.querySelectorAll('.lp-sc__s'), n = s.length;
    rotor({
      n: n, ms: 3000, region: root, live: root.querySelector('.lp-sc__stage'), btn: root.querySelector('.lp-sc__pause'), pause: 'Pausar las fotos', play: 'Reanudar las fotos',
      show: function (i) {
        Array.prototype.forEach.call(s, function (el, k) {
          var pos = (k - i + n) % n;
          el.className = 'lp-sc__s ' + (pos === 0 ? 'is-act' : pos === 1 ? 'is-next' : 'is-prev');
          el.setAttribute('aria-hidden', pos === 0 ? 'false' : 'true');
        });
      }
    });
  }

  function homeEvents() {
    var g = agrupar(), live = g['En curso'], soon = proximosEnHorizonte(g), past = g['Finalizado'].slice(0, 5);
    var CUR = 6;
    var sets = { todos: live.concat(soon), live: live, soon: soon };
    var tab = homeState.tab;
    var list = sets[tab].slice(0, CUR);
    var msg = {
      todos: ['No hay eventos en curso ni próximos por ahora.', ''],
      live: ['No hay eventos en curso por ahora.', 'Cuando un evento inicie, lo verás aquí. Mientras tanto puedes revisar lo que viene.'],
      soon: ['No hay eventos próximos por ahora.', '']
    }[tab];
    var panel = list.length ? '<div class="lp-cards">' + list.map(function (e) { return card(e, 'h3'); }).join('') + '</div>' : vacio(msg[0], msg[1]);
    return tabsHtml('lp-h', [{ id: 'todos', label: 'Todos' }, { id: 'live', label: 'En curso' }, { id: 'soon', label: 'Próximamente' }], tab, 'Filtrar eventos por estado') +
      '<div class="lp-tpanel" role="tabpanel" id="lp-h-p" aria-labelledby="lp-h-t-' + tab + '">' + panel + '</div>' +
      '<div class="lp-past"><h3>Eventos anteriores</h3>' + (past.length ? '<ul>' + past.map(pastRow).join('') + '</ul>' : '<p class="lp-past__none">Aún no hay eventos finalizados.</p>') + '</div>' +
      '<div class="lp-more"><a class="lp-cta lp-cta--dark lp-cta--lg" href="#/eventos?estado=todos">Ver todos los eventos</a></div>';
  }
  function wireHomeEvents() {
    var box = $('lp-events-box'); if (!box) return;
    function pick(id, kb) {
      homeState.tab = id;
      var y = window.scrollY;
      box.innerHTML = homeEvents();
      window.scrollTo(0, y);
      wireTabs(box, pick);
      var p = box.querySelector('.lp-tpanel'); if (p && !REDUCE) p.classList.add('lp-tpanel--in');
      if (kb) refocusTab(box, id);
    }
    wireTabs(box, pick);
  }

  function partnersHtml() {
    var sel = homeState.partners;
    var items = PARTNERS.filter(function (p) { return p[2] === sel; });
    var track = items.map(function (p) {
      return '<li class="lp-asoc"><figure>' + fallbackImg('asociados/' + p[0] + '.webp', p[1], p[1], 'lp-asoc__img') + '<figcaption>' + esc(p[1]) + '</figcaption></figure></li>';
    }).join('');
    return tabsHtml('lp-pt', PARTNER_TABS, sel, 'Tipo de asociado') +
      '<div class="lp-pcar" role="tabpanel" id="lp-pt-p" aria-labelledby="lp-pt-t-' + sel + '"><button type="button" class="lp-hbtn lp-hbtn--g" data-s="-1" aria-label="Asociados anteriores">' + IC.prev + '</button>' +
      '<ul class="lp-ptrack" tabindex="0" aria-label="Asociados">' + track + '</ul><button type="button" class="lp-hbtn lp-hbtn--g" data-s="1" aria-label="Asociados siguientes">' + IC.next + '</button></div>';
  }
  function wirePartners() {
    var box = $('lp-partners-box'); if (!box) return;
    function scroller() {
      var tr = box.querySelector('.lp-ptrack');
      Array.prototype.forEach.call(box.querySelectorAll('[data-s]'), function (b) {
        b.addEventListener('click', function () { tr.scrollBy({ left: parseInt(b.getAttribute('data-s'), 10) * tr.clientWidth * 0.8, behavior: REDUCE ? 'auto' : 'smooth' }); });
      });
    }
    function pick(id, kb) {
      homeState.partners = id;
      box.innerHTML = partnersHtml();
      wireTabs(box, pick); scroller();
      if (kb) refocusTab(box, id);
    }
    wireTabs(box, pick); scroller();
  }

  function homeView() {
    var html = heroHtml() + statsHtml() +
      '<section class="lp-events" id="eventos" aria-labelledby="lp-events-h"><div class="lp-wrap"><div class="lp-events__head"><span class="lp-eyebrow">No te pierdas los</span>' +
      '<h2 class="lp-h2" id="lp-events-h">Eventos del Ciclo Olímpico</h2></div><div id="lp-events-box">' + homeEvents() + '</div></div></section>' +
      '<section class="lp-partners" aria-labelledby="lp-pt-h"><div class="lp-wrap"><h2 class="lp-h2 lp-partners__h" id="lp-pt-h">Asociados olímpicos</h2><div id="lp-partners-box">' + partnersHtml() + '</div></div></section>';
    return { title: 'Eventos', html: html, after: function () { wireHero(); wireStats(); wireHomeEvents(); wirePartners(); } };
  }

  /* ── Listado /eventos (página propia, un solo panel) ────────────── */
  var LISTA_TABS = [
    { id: 'en-competencia', label: 'En competencia', key: 'En curso', vacio: ['No hay eventos en competencia por ahora.', 'Cuando un evento inicie, lo verás aquí. Mientras tanto puedes revisar lo que viene.'] },
    { id: 'proximos', label: 'Próximos', key: 'Próximo', vacio: ['No hay eventos próximos por ahora.', ''] },
    { id: 'finalizados', label: 'Finalizados', key: 'Finalizado', vacio: ['Aún no hay eventos finalizados.', ''] },
    { id: 'todos', label: 'Todos', key: null, vacio: ['No hay eventos disponibles por ahora.', ''] }
  ];
  var ALIAS_ESTADO = { 'en-curso': 'en-competencia', 'proxima': 'proximos', 'proximo': 'proximos', 'finalizado': 'finalizados' };
  function listaPorTab(g, t) {
    return t.key ? g[t.key] : g['En curso'].concat(g['Próximo'], g['Finalizado']);
  }
  function listaHtml(sel) {
    var g = agrupar();
    var items = LISTA_TABS.map(function (t) { return { id: t.id, label: t.label + ' (' + listaPorTab(g, t).length + ')' }; });
    var t = LISTA_TABS.filter(function (x) { return x.id === sel; })[0];
    var l = listaPorTab(g, t);
    return tabsHtml('lp-l', items, sel, 'Filtrar eventos por estado') +
      '<div class="lp-tpanel" role="tabpanel" id="lp-l-p" aria-labelledby="lp-l-t-' + sel + '">' +
      (l.length ? '<div class="lp-cards">' + l.map(function (e) { return card(e, 'h3'); }).join('') + '</div>' : vacio(t.vacio[0], t.vacio[1])) + '</div>';
  }
  function listView(r) {
    var g = agrupar();
    var want = ALIAS_ESTADO[r.params.estado] || r.params.estado;
    var sel = LISTA_TABS.filter(function (t) { return t.id === want; })[0];
    if (!sel) {
      /* Sin ?estado= válido: primer grupo con contenido (en competencia, próximos, todos). */
      sel = LISTA_TABS[0];
      if (!g['En curso'].length) sel = g['Próximo'].length ? LISTA_TABS[1] : LISTA_TABS[3];
    }
    var html = '<section class="lp-list"><div class="lp-wrap"><a class="lp-volver" href="#/" aria-label="Volver al inicio">← Volver</a>' +
      '<div class="lp-events__head lp-list__head"><span class="lp-eyebrow">No te pierdas los</span><h1 class="lp-h2">Eventos del Ciclo Olímpico</h1></div>' +
      '<div id="lp-list-box">' + listaHtml(sel.id) + '</div></div></section>';
    return { title: 'Eventos del Ciclo Olímpico', html: html, after: function () {
      var box = $('lp-list-box');
      function pick(id, kb) {
        history.replaceState(null, '', build('/eventos', { estado: id }));
        box.innerHTML = listaHtml(id);
        wireTabs(box, pick);
        var p = box.querySelector('.lp-tpanel'); if (p && !REDUCE) p.classList.add('lp-tpanel--in');
        if (kb) refocusTab(box, id);
      }
      wireTabs(box, pick);
    } };
  }

  /* ── Soporte: diálogo «Reporta una novedad» ─────────────────────── */
  function field(id, label, inner) {
    return '<div class="lp-field" data-field="' + id + '"><label for="' + id + '">' + label + '</label>' + inner +
      '<span class="lp-field__err" id="' + id + '-err" role="alert"></span></div>';
  }
  function soporteForm() {
    return '<div class="lp-dlg__head"><h2 id="lp-dlg-t">Reporta una novedad</h2><button type="button" class="lp-dlg__x" data-dlg-close aria-label="Cerrar">' + IC.close + '</button></div>' +
      '<form class="lp-form lp-form--dlg" id="lp-form" novalidate>' +
      field('sp-nombre', 'Nombre', '<input id="sp-nombre" name="nombre" autocomplete="name" aria-describedby="sp-nombre-err">') +
      field('sp-correo', 'Correo', '<input id="sp-correo" name="correo" type="email" autocomplete="email" placeholder="nombre@correo.com" aria-describedby="sp-correo-err">') +
      field('sp-mensaje', '¿Qué pasó?', '<textarea id="sp-mensaje" name="mensaje" aria-describedby="sp-mensaje-err"></textarea>') +
      field('sp-archivo', 'Adjuntar captura <small>(opcional)</small>', '<input id="sp-archivo" name="archivo" type="file" accept="image/*" aria-describedby="sp-archivo-err">') +
      '<p class="lp-form__err" id="lp-form-err" role="alert" hidden>No pudimos enviarlo. Lo que escribiste sigue aquí; inténtalo de nuevo en unos minutos.</p>' +
      '<button type="submit" class="lp-cta" id="lp-send">Enviar</button></form>';
  }
  function wireForm(dlg) {
    var form = $('lp-form'); if (!form) return;
    var rules = {
      'sp-nombre': function (el) { return el.value.trim() ? '' : 'Escribe tu nombre.'; },
      'sp-correo': function (el) {
        var v = el.value.trim();
        return !v ? 'Escribe tu correo.' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Escribe un correo válido, como nombre@correo.com.';
      },
      'sp-mensaje': function (el) {
        var v = el.value.trim();
        return !v ? 'Cuéntanos qué pasó.' : v.length < 10 ? 'Danos un poco más de detalle (mínimo 10 caracteres).' : '';
      },
      'sp-archivo': function (el) {
        var f = el.files && el.files[0];
        return !f ? '' : !/^image\//.test(f.type) ? 'Adjunta una imagen.' : f.size > 2 * 1024 * 1024 ? 'La imagen pesa más de 2 MB.' : '';
      }
    };
    function check(id) {
      var el = $(id), msg = rules[id](el);
      el.closest('.lp-field').classList.toggle('is-bad', !!msg);
      $(id + '-err').textContent = msg;
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    Object.keys(rules).forEach(function (id) {
      var el = $(id), f = el.closest('.lp-field');
      el.addEventListener('blur', function () { if (el.value !== '' || f.classList.contains('is-bad')) check(id); });
      el.addEventListener(id === 'sp-archivo' ? 'change' : 'input', function () { if (f.classList.contains('is-bad') || id === 'sp-archivo') check(id); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var primero = null;
      Object.keys(rules).forEach(function (id) { if (!check(id) && !primero) primero = id; });
      if (primero) { $(primero).focus(); return; }
      var btn = $('lp-send'), correo = $('sp-correo').value.trim();
      btn.disabled = true; btn.textContent = 'Enviando…'; $('lp-form-err').hidden = true;
      /* Simulación del real: el primer envío falla y el segundo pasa. */
      setTimeout(function () {
        supportTries++;
        if (supportTries % 2 === 1) {
          btn.disabled = false; btn.textContent = 'Reintentar'; $('lp-form-err').hidden = false; return;
        }
        $('lp-dlg-box').innerHTML = '<div class="lp-form__ok" role="status"><i>' + IC.check + '</i><h2 id="lp-dlg-t">Recibimos tu reporte</h2>' +
          '<p>Enviamos la confirmación a <b>' + esc(correo) + '</b>.</p><p class="lp-form__case">Número de caso <b>COC-' + String(100000 + Math.floor(Math.random() * 900000)) + '</b></p>' +
          '<button type="button" class="lp-cta" data-dlg-close>Cerrar</button></div>';
        var c = dlg.querySelector('[data-dlg-close].lp-cta'); if (c) c.focus();
      }, 700);
    });
  }
  function wireSupport() {
    var dlg = $('lp-support'); if (!dlg) return;
    Array.prototype.forEach.call(app.querySelectorAll('[data-support]'), function (b) {
      b.addEventListener('click', function () {
        $('lp-dlg-box').innerHTML = soporteForm();
        wireForm(dlg);
        if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
        document.body.classList.add('lp-lock');
        $('sp-nombre').focus();
      });
    });
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || e.target.closest('[data-dlg-close]')) dlg.close();
    });
    dlg.addEventListener('close', function () { document.body.classList.remove('lp-lock'); });
  }

  /* ── Detalle ────────────────────────────────────────────────────── */
  var TABS = {
    'calendario-resultados': 'Calendario y resultados',
    'medalleria': 'Medallería',
    'deportes': 'Deportes',
    'informacion': 'Información'
  };
  /* Información primero y por defecto en todo evento; Deportes le sigue. */
  var ORDEN_TABS = ['informacion', 'deportes', 'calendario-resultados', 'medalleria'];
  /* DC-043: un evento Próximo aún no tiene resultados, así que la pestaña solo dice «Calendario». */
  function etiquetaCalendario(estado) { return estado === 'Próximo' ? 'Calendario' : TABS['calendario-resultados']; }

  /* La descripción del fixture trae una nota técnica entre paréntesis: no es texto de usuario. */
  function limpiarDesc(t) { return String(t || '').replace(/\s*\(descripción derivada[^)]*\)/i, ''); }
  /* Contador del hero (DC-002/003): el texto va fuera y solo la cifra (9/15, 59) en el chip; el aria-label lleva el texto completo. */
  function contador(ev, estado) {
    var w = function (t) { return '<span class="lp-ctd__w" aria-hidden="true">' + t + '</span>'; };
    var n = function (v) { return '<span class="lp-ctd__n" aria-hidden="true">' + v + '</span>'; };
    var inner, label;
    if (estado === 'Próximo') {
      var d = dias(OLC.HOY, ev.inicio);
      label = d === 1 ? '1 día que falta' : d + ' días que faltan';
      inner = w(d === 1 ? 'Día que falta' : 'Días que faltan') + n(d);
    } else if (estado === 'En curso') {
      var a = dias(ev.inicio, OLC.HOY) + 1, t = dias(ev.inicio, ev.fin) + 1;
      label = 'Día ' + a + ' de ' + t;
      inner = w('Día') + n(a + '/' + t);
    } else return '';
    return '<div class="lp-ctd" role="group" aria-label="' + label + '">' + inner + '</div>';
  }

  /* Migas + tabs pegadas (DC-002): los tabs se anclan bajo el header y las migas, cuya altura se mide. */
  var crumbRO = null;
  function wireTabnav() {
    if (crumbRO) { crumbRO.disconnect(); crumbRO = null; }
    var crumb = document.querySelector('.lp-crumb'), hd = document.querySelector('.lp-header'), nav = document.querySelector('.lp-tabnav');
    if (!crumb || !hd) return;
    var root = document.documentElement.style;
    function set() {
      var h = hd.getBoundingClientRect().height;
      root.setProperty('--lp-hd', (h + 1) + 'px');
      root.setProperty('--lp-hh', (h + 1 + crumb.getBoundingClientRect().height) + 'px');
      if (nav) root.setProperty('--lp-nav-h', nav.getBoundingClientRect().height + 'px'); /* alto real de los tabs pegados */
    }
    set();
    if (window.ResizeObserver) { crumbRO = new ResizeObserver(set); crumbRO.observe(crumb); if (nav) crumbRO.observe(nav); }
  }
  window.addEventListener('resize', function () { if (document.querySelector('.lp-tabnav')) wireTabnav(); });

  function detailView(r) {
    var data = OLC.datosDe(r.code);
    if (!data) {
      return { title: 'Evento no encontrado', html:
        '<div class="lp-wrap" style="padding-top:64px;padding-bottom:24px"><div class="lp-void">' + IC.empty +
        '<strong>No encontramos este evento.</strong><p>Puede que el enlace esté incompleto o que el evento ya no esté disponible.</p>' +
        '<a class="lp-cta" href="#/eventos">Volver a eventos</a></div></div>' };
    }
    var ev = data.evento, estado = data.estado;
    /* Medallería solo existe si ya hay medallas (un evento Próximo no tiene). */
    var orden = ORDEN_TABS.filter(function (t) { return t !== 'medalleria' || data.medallero().length > 0; });
    var tab = orden.indexOf(r.params.tab) >= 0 ? r.params.tab : orden[0];
    var ui = uiStore[ev.code] || (uiStore[ev.code] = {});
    var nav = orden.map(function (t) {
      return '<a href="' + build(r.path, merge(r.params, { tab: t })) + '"' + (t === tab ? ' aria-current="page"' : '') + '>' + (t === 'calendario-resultados' ? etiquetaCalendario(estado) : TABS[t]) + '</a>';
    }).join('');
    var sedes = ev.sedes || [];
    /* DC-112: el hero va entre el breadcrumb y la nav, fuera del panel; el contador sube a la fila de badges. */
    var hero =
      '<section class="lp-dhero" aria-label="Encabezado del evento"><div class="lp-ph' + variante(ev.code) + '"><span class="lp-ph__tag">Foto del evento</span></div>' +
      '<div class="lp-hero__veil"></div><div class="lp-wrap lp-dhero__in"><div class="lp-dhero__copy">' +
      ((ev.ciclo || contador(ev, estado)) ? '<div class="lp-dhero__badges">' + (ev.ciclo ? '<span class="lp-cycle">Ciclo Olímpico</span>' : '') + contador(ev, estado) + '</div>' : '') +
      '<h2 class="lp-dhero__title">' + esc(ev.nombre) + '</h2><p>' + esc(limpiarDesc(ev.descripcion)) + '</p></div></div></section>';
    var info =
      '<section class="lp-facts" aria-label="Datos del evento"><div class="lp-wrap"><div class="lp-facts__card"><dl class="lp-dl">' +
      fact(IC.cal, 'Fecha de inicio', OLC.fechaCorta(ev.inicio)) + fact(IC.cal, 'Fecha final', '<span class="lp-fact__row">' + OLC.fechaCorta(ev.fin) + pill(estado) + '</span>') + fact(IC.pin, 'Lugar', esc(ev.lugar)) +
      fact(IC.org, 'Organismo', esc(ev.organismo)) + fact(IC.globe, 'Alcance', 'Internacional · ' + data.evento.paises + ' países') +
      (sedes.length ? '<div class="lp-fact lp-fact--full"><dt>' + IC.pin + 'Sedes <b>' + sedes.length + '</b></dt><dd><ul class="lp-fsedes" aria-label="Sedes del evento">' +
      sedes.map(function (x) { return '<li class="lp-chip">' + esc(x) + '</li>'; }).join('') + '</ul></dd></div>' : '') + '</dl></div></div></section>';
    var html =
      '<div class="lp-crumb"><div class="lp-wrap"><nav aria-label="Migas de pan"><ol><li><a href="#/eventos" aria-label="Volver a eventos">' + IC.prev + 'Eventos</a></li>' +
      '<li><span class="lp-crumb__sep" aria-hidden="true">/</span><span class="lp-crumb__cur" aria-current="page">' + esc(ev.nombre) + '</span></li></ol></nav></div></div>' +
      '<h1 class="lp-sr">' + esc(ev.nombre) + '</h1>' + hero +
            '<nav class="lp-tabnav" aria-label="Secciones del evento"><div class="lp-tabnav__rel"><div class="lp-wrap lp-tabnav__row"><div class="lp-tabnav__strip">' + nav + '</div></div><span class="lp-tabnav__fade" aria-hidden="true"></span></div></nav>' +
      '<div id="lp-info"' + (tab === 'informacion' ? '' : ' hidden') + '>' + info + '</div>' +
      '<div class="lp-wrap lp-panel' + (lastTab !== null && lastTab !== r.code + tab ? ' lp-panel--in' : '') + '"' + (tab === 'informacion' ? ' hidden' : '') + ' id="lp-panel"></div>';
    lastTab = r.code + tab;

    var ctx = {
      audience: 'landing', data: tab === 'deportes' || tab === 'calendario-resultados' ? OLC.soloColombia(data) : data, event: ev, params: r.params, ui: ui,
      go: function (patch) {
        var h = build(r.path, merge(parseHash().params, patch));
        if (h === location.hash) render(); else location.hash = h;
      },
      href: function (patch) { return build(r.path, merge(parseHash().params, patch)); }
    };
    /* Render parcial: actualiza pestaña activa y enlaces de la nav, y vuelve a pintar solo #lp-panel. */
    function panel() {
      var el = document.getElementById('lp-panel'), root = el.parentNode;
      var ant = document.activeElement, ruta = ant && el.contains(ant) ? rutaDe(el, ant) : null;
      var cambioTab = el.getAttribute('data-tab') !== tab;
      var infoEl = document.getElementById('lp-info');
      infoEl.hidden = tab !== 'informacion'; el.hidden = tab === 'informacion';
      root.querySelectorAll('.lp-tabnav__strip a').forEach(function (a, i) {
        a.setAttribute('href', build(r.path, merge(r.params, { tab: orden[i] })));
        if (orden[i] === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
      });
      if (cambioTab) {
        if (el._lpMiniOff) el._lpMiniOff();
        el.setAttribute('data-tab', tab);
        el.classList.remove('lp-panel--in'); void el.offsetWidth; el.classList.add('lp-panel--in');
        var cur = root.querySelector('.lp-tabnav__strip a[aria-current]');
        if (cur) cur.parentNode.scrollLeft = cur.offsetLeft - 20;
      }
      pintar(el);
      if (ruta && !el.contains(document.activeElement)) { var f = resolverRuta(el, ruta); if (f && f.focus) f.focus({ preventScroll: true }); }
      return cambioTab;
    }
    function pintar(el) {
      if (tab === 'informacion') { el.innerHTML = ''; return; }
      var mod = window.Tabs && window.Tabs[tab];
      if (!mod) { el.innerHTML = '<div class="lp-wip">Sección en construcción</div>'; return; }
      try { mod.render(el, ctx); }
      catch (err) { el.innerHTML = '<div class="lp-wip">No se pudo mostrar esta sección.</div>'; if (window.console) console.error(err); }
    }
    return { title: ev.nombre, html: html, panel: panel, after: function () {
      wireTabnav();
      var el = document.getElementById('lp-panel');
      var strip = el.parentNode.querySelector('.lp-tabnav__strip a[aria-current]');
      if (strip && strip.scrollIntoView) { var sc = strip.parentNode; sc.scrollLeft = strip.offsetLeft - 20; }
      el.setAttribute('data-tab', tab);
      pintar(el);
    } };
  }
  /* Ruta de hijos hasta el control enfocado, para devolverle el foco tras repintar el panel. */
  function rutaDe(raiz, n) {
    var p = [];
    while (n && n !== raiz) { p.unshift(Array.prototype.indexOf.call(n.parentNode.children, n)); n = n.parentNode; }
    return p;
  }
  function resolverRuta(raiz, p) {
    var n = raiz;
    for (var i = 0; i < p.length && n; i++) n = n.children[p[i]];
    return n;
  }
  function fact(icon, label, value) {
    return '<div class="lp-fact"><dt>' + icon + label + '</dt><dd>' + value + '</dd></div>';
  }

  /* FAB «Volver arriba» (DC-180): vive fuera de #app para sobrevivir a cada render. */
  var fab = document.createElement('button');
  fab.type = 'button'; fab.className = 'lp-fab'; fab.setAttribute('aria-label', 'Volver arriba');
  fab.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(fab);
  var FAB_UMBRAL_VH = 1.2, FAB_HIST = 5, fabRaf = 0;
  function modalAbierto() {
    if (document.querySelector('.lp-drawer.is-open, dialog[open]')) return true;
    return Array.prototype.some.call(document.querySelectorAll('[aria-modal="true"]'), function (m) {
      return !m.inert && getComputedStyle(m).visibility !== 'hidden';
    });
  }
  function fabUpdate() {
    fabRaf = 0;
    /* DC-196: aparece a 1.2 alturas de pantalla; histéresis de ±5px para que no parpadee en el umbral. */
    var umbral = FAB_UMBRAL_VH * window.innerHeight, enc = fab.classList.contains('is-on');
    var on = window.scrollY >= (enc ? umbral - FAB_HIST : umbral + FAB_HIST) && !modalAbierto();
    fab.classList.toggle('is-on', on);
    var sw = document.querySelector('.olc-sw'), up = false;
    if (sw) {
      var s = sw.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
      up = !(vw - 24 <= s.left || vw - 72 >= s.right || vh - 24 <= s.top || vh - 72 >= s.bottom);
    }
    fab.classList.toggle('lp-fab--up', up);
  }
  function fabSched() { if (!fabRaf) fabRaf = requestAnimationFrame(fabUpdate); }
  ['scroll', 'resize', 'pointermove', 'pointerup'].forEach(function (ev) { window.addEventListener(ev, fabSched, { passive: true }); });
  new MutationObserver(fabSched).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class', 'open', 'inert', 'style'] });
  fab.addEventListener('click', function () {
    var red = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: red ? 'auto' : 'smooth' });
    var m = $('lp-main'); if (m) m.focus({ preventScroll: true });
  });

  render();
  fabSched();
})();
