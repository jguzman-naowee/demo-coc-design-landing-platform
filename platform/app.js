/* Shell de la plataforma (Naowee Suite): router hash, listado, detalle y ctx de las tabs. */
(function () {
  'use strict';
  var OLC = window.OLC;
  var $main = document.getElementById('nws-main');
  var $top = document.getElementById('nws-topbar');

  var TABS = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'deportes', label: 'Deportes' },
    { id: 'calendario-resultados', label: 'Calendario y resultados' },
    { id: 'medalleria', label: 'Medallería' },
    { id: 'deportistas', label: 'Deportistas' }
  ];
  var DEFAULT_TAB = 'calendario-resultados';
  var PARAMS = ['sexo', 'colombia', 'dia', 'deporte', 'q', 'tab', 'prueba'];
  /* Menú del MF real (src/config/menu.ts); las rutas son hash del prototipo. */
  var MENU = [
    { id: 'olympic-cycle-dashboard', label: 'Dashboard Ciclo Olímpico', route: '#/dashboards', icon: 'view-columns', section: 'ANALÍTICA' },
    { id: 'data-dashboards', label: 'Dashboards', route: '#/analytics/dashboards', icon: 'view-columns' },
    { id: 'data-reports', label: 'Reportes', route: '#/analytics/reports', icon: 'file' },
    { id: 'events', label: 'Eventos', route: '#/eventos', icon: 'categories', section: 'EVENTOS' },
    { id: 'management', label: 'Gestión deportiva', route: '#/management', icon: 'avatar', section: 'DIRECTORIO' },
    { id: 'users', label: 'Gestión de usuarios', route: '#/users', icon: 'user' }
  ];
  var EMPTY = { '/analytics/dashboards': 'Dashboards', '/analytics/reports': 'Reportes', '/management': 'Gestión deportiva', '/users': 'Gestión de usuarios' };
  var YO = 'Laura Marcela Ortiz'; // usuario de la demo: «Mis eventos» = eventos que gestiona

  /* ---------- utilidades ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function icon(name, cls) {
    return '<span class="nwt-icon ' + (cls || '') + '" aria-hidden="true"><i class="naotech-icon-' + name + '"></i></span>';
  }
  var ESTADO_TEMA = { 'En curso': 'informative', 'Próximo': 'neutral', 'Finalizado': 'positive' };
  function badge(texto, tema, extra) {
    return '<span class="nwt-badge nwt-badge--vignette nws-badge ' + (extra || '') + '" nwt-variant="quiet" nwt-theme="' + tema +
      '"><span class="nwt-badge__content"><span class="nwt-badge__label">' + esc(texto) + '</span></span></span>';
  }
  function badgeEstado(est, sinPunto) {
    var b = badge(est, ESTADO_TEMA[est] || 'neutral', sinPunto ? 'nws-badge--nodot' : '');
    return sinPunto ? b.replace(' nwt-badge--vignette', '') : b;
  }
  function badgeCiclo() {
    return '<span class="nwt-badge nws-badge nws-badge--ciclo" nwt-variant="quiet" nwt-theme="secondary"><span class="nwt-badge__content"><span class="nwt-badge__label">Ciclo Olímpico</span></span></span>';
  }
  /* DC-133: estado, ciclo y alcance como iconos con title y texto accesible */
  var ST_CLS = { 'En curso': 'on', 'Próximo': 'next', 'Finalizado': 'end' };
  function dotEstado(est) {
    return '<span class="nws-ico nws-st nws-st--' + ST_CLS[est] + '" role="img" tabindex="0" aria-label="Estado: ' + est + '" title="' + est + '"></span>';
  }
  function icoCiclo() {
    return '<span class="nws-ico nws-ico--ciclo" role="img" tabindex="0" aria-label="Ciclo Olímpico" title="Ciclo Olímpico"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="6.5" cy="9" r="4"/><circle cx="12" cy="9" r="4"/><circle cx="17.5" cy="9" r="4"/><circle cx="9.25" cy="15" r="4"/><circle cx="14.75" cy="15" r="4"/></svg></span>';
  }
  function icoAlcance(e) {
    return '<span class="nws-ico nws-ico--alc" role="img" tabindex="0" aria-label="' + alcanceTxt(e) + '" title="' + alcanceTxt(e) + '"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg></span>';
  }
  /* Tiempo del evento, siempre derivado de las fechas contra OLC.HOY. */
  function dif(a, b) { return Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000); }
  function corta(iso) { return OLC.fechaCorta(iso).replace(/ \d{4}$/, ''); }
  function tiempoEvento(e) {
    var est = e.estado || OLC.estado(e); e = Object.assign({}, e, { estado: est });
    if (e.estado === 'Finalizado') return 'Finalizó el ' + corta(e.fin);
    if (e.estado === 'Próximo') { var n = dif(OLC.HOY, e.inicio); return n === 1 ? 'Falta 1 día' : 'Faltan ' + n + ' días'; }
    return 'Día ' + (dif(e.inicio, OLC.HOY) + 1) + ' de ' + (dif(e.inicio, e.fin) + 1);
  }
  function ciudad(lugar) { return String(lugar || '').split(',')[0]; }
  function alcanceTxt(e) { var n = e.paises; return 'Internacional' + (n > 0 ? ' · ' + n + (n === 1 ? ' país' : ' países') : ''); }
  function iniciales(n) { return String(n).split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(); }
  function whenDefined(tag, fn) { if (window.customElements) customElements.whenDefined(tag).then(fn); }

  /* ---------- hash ---------- */
  function parseHash() {
    var h = location.hash.replace(/^#/, '') || '/eventos';
    var q = h.indexOf('?');
    var path = q < 0 ? h : h.slice(0, q);
    var params = {};
    if (q >= 0) {
      h.slice(q + 1).split('&').forEach(function (kv) {
        if (!kv) return;
        var i = kv.indexOf('=');
        var k = decodeURIComponent(i < 0 ? kv : kv.slice(0, i));
        var v = i < 0 ? '' : decodeURIComponent(kv.slice(i + 1).replace(/\+/g, ' '));
        if (PARAMS.indexOf(k) >= 0 && v !== '') params[k] = v;
      });
    }
    var m = path.match(/^\/eventos\/([^/]+)\/?$/);
    var s = path.replace(/\/$/, '');
    if (s === '/dashboards') return { view: 'dashboard', code: s, params: params };
    if (EMPTY[s]) return { view: 'vacia', code: s, params: params };
    return { view: m ? 'detalle' : 'listado', code: m ? decodeURIComponent(m[1]) : null, params: params };
  }
  function buildHash(code, params) {
    var base = code ? '#/eventos/' + encodeURIComponent(code) : '#/eventos';
    var parts = [];
    PARAMS.forEach(function (k) {
      if (params[k] != null && params[k] !== '') parts.push(k + '=' + encodeURIComponent(params[k]));
    });
    return base + (parts.length ? '?' + parts.join('&') : '');
  }
  function merge(params, patch) {
    var o = {};
    Object.keys(params).forEach(function (k) { o[k] = params[k]; });
    Object.keys(patch || {}).forEach(function (k) {
      if (patch[k] == null || patch[k] === '') delete o[k]; else o[k] = patch[k];
    });
    return o;
  }

  /* ---------- foco: se conserva al re-renderizar una tab ---------- */
  function pathOf(root, el) {
    var p = [];
    while (el && el !== root) { var par = el.parentNode; if (!par) return null; p.unshift(Array.prototype.indexOf.call(par.children, el)); el = par; }
    return el === root ? p : null;
  }
  function resolve(root, p) {
    var el = root;
    for (var i = 0; i < p.length; i++) { el = el && el.children[p[i]]; }
    return el;
  }

  /* ---------- estado del shell ---------- */
  var state = { code: null, view: null };
  var listUi = { scope: 'mine', estado: 'todos', q: '', page: 1, vista: 'tarjetas', mes: '2026-10' };
  var tabUi = {}; // ctx.ui por evento: sobrevive a los re-render
  var PAGE_SIZE = 12; // cabe todo el catálogo (11): «Todos» no esconde en pág. 2 los de «Mis eventos»

  function setTop(partes) {
    var h = '<div class="nws-topbar__in"><span class="nws-topbar__brand">Naowee Suite</span>';
    partes.forEach(function (p) {
      h += '<span class="nws-topbar__sep" aria-hidden="true">/</span>';
      h += p.href ? '<a href="' + p.href + '">' + esc(p.t) + '</a>' : '<span aria-current="page">' + esc(p.t) + '</span>';
    });
    $top.innerHTML = '<nav aria-label="Miga de pan">' + h + '</div></nav>';
  }

  /* ---------- side panel (nwt-sidebar) ---------- */
  var $side = document.getElementById('nws-sidebar');
  var $menuBtn = document.getElementById('nws-menubtn');
  var viaMenu = false; // el drawer se cerró por navegar: el foco va al contenido, no al botón
  function menuActivo(route) {
    return route.view === 'dashboard' ? 'olympic-cycle-dashboard' : route.view === 'vacia' ? MENU.filter(function (m) { return m.route === '#' + route.code; })[0].id : 'events';
  }
  function syncMenu(route) {
    var act = menuActivo(route);
    $side.menus = MENU.map(function (m) { return Object.assign({}, m, { active: m.id === act }); });
  }
  function drawerMode() { return window.matchMedia('(max-width:960px)').matches; }
  function syncInert(open) { if (drawerMode() && !open) $side.setAttribute('inert', ''); else $side.removeAttribute('inert'); }
  function marcarActivo() {
    $side.querySelectorAll('.nwt-sidebar__menu__link[aria-current]').forEach(function (a) { a.removeAttribute('aria-current'); });
    var a = $side.querySelector('.nwt-sidebar__menu__item--active > .nwt-sidebar__menu__link');
    if (a) a.setAttribute('aria-current', 'page');
    var o = $side.querySelector('.nwt-sidebar__footer__logout'); // sin sesión: inerte, no oculto
    if (o && !o.hasAttribute('aria-disabled')) { o.setAttribute('aria-disabled', 'true'); o.title = 'No incluido en este prototipo'; }
  }
  new MutationObserver(marcarActivo).observe($side, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  $side.addEventListener('nwtMenuClick', function (e) {
    var r = e.detail && e.detail.route;
    if (!r) return;
    viaMenu = true;
    if (r === location.hash) render(); else location.hash = r;
    if ($side.closeDrawer) $side.closeDrawer();
  });
    $side.addEventListener('nwtOpenChange', function (e) {
    var open = !!e.detail;
    $menuBtn.setAttribute('aria-expanded', String(open));
    syncInert(open);
    if (open) { var f = $side.querySelector('.nwt-sidebar__toolbar__button'); if (f) f.focus(); }
    else if (!viaMenu && drawerMode()) $menuBtn.focus();
    viaMenu = false;
  });
  /* Foco atrapado mientras el drawer está abierto. */
  $side.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !drawerMode() || $menuBtn.getAttribute('aria-expanded') !== 'true') return;
    var fs = $side.querySelectorAll('a[href],button:not([disabled])');
    if (!fs.length) return;
    var first = fs[0], last = fs[fs.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  document.addEventListener('click', function (e) {
    if ($menuBtn.getAttribute('aria-expanded') === 'true' && !$side.contains(e.target) && !$menuBtn.contains(e.target)) $side.closeDrawer();
  });
  $menuBtn.addEventListener('click', function () { if ($side.openDrawer) { $side.removeAttribute('inert'); $side.openDrawer(); } });
  window.matchMedia('(max-width:960px)').addEventListener('change', function () { $menuBtn.setAttribute('aria-expanded', 'false'); syncInert(false); });
  syncInert(false);

  /* ---------- vistas del menú sin pantalla propia ---------- */
  function renderSimple(route) {
    var vacia = route.view === 'vacia';
    var titulo = vacia ? EMPTY[route.code] : 'Dashboard Ciclo Olímpico';
    setTop([{ t: titulo }]);
    $main.innerHTML = '<div class="nws-page"><h1 id="nws-h1" class="nwt-h5-font-bold" tabindex="-1">' + esc(titulo) + '</h1>' +
      (vacia ? '<div class="nws-empty nws-empty--page"><b>' + esc(titulo) + '</b><span class="nws-muted">No incluido en este prototipo</span></div>'
        : '<div class="nws-reserved" role="img" aria-label="Espacio reservado para el Dashboard Ciclo Olímpico"><b>Dashboard Ciclo Olímpico</b><span>Se redefine en otro frente</span></div>') + '</div>';
    document.title = titulo + ' · Naowee Suite';
  }

  /* ---------- listado ---------- */
  var EST_KEY = { curso: 'En curso', proximo: 'Próximo', finalizado: 'Finalizado' };
  var EST_ORD = { 'En curso': 0, 'Próximo': 1, 'Finalizado': 2 };
  var EST_SEC = { 'En curso': 'En curso', 'Próximo': 'Próximos', 'Finalizado': 'Finalizados' };
  function eventosFiltrados(sinEstado) {
    var q = listUi.q.trim().toLowerCase();
    return OLC.eventos().filter(function (e) {
      if (listUi.scope === 'mine' && e.gestor.nombre !== YO) return false;
      if (!sinEstado && listUi.estado !== 'todos' && e.estado !== EST_KEY[listUi.estado]) return false;
      if (q) {
        var hay = [e.nombre, e.lugar, e.organismo, alcanceTxt(e)].concat(e.sedes || []);
        if (!hay.some(function (s) { return String(s).toLowerCase().indexOf(q) >= 0; })) return false;
      }
      return true;
    }).sort(function (a, b) {
      // En curso, luego Próximos (el más cercano primero) y al final Finalizados (el más reciente primero)
      if (a.estado !== b.estado) return EST_ORD[a.estado] - EST_ORD[b.estado];
      return a.estado === 'Finalizado' ? (a.inicio < b.inicio ? 1 : -1) : (a.inicio < b.inicio ? -1 : 1);
    });
  }
  /* Solo los filtros de estado que tienen eventos en el alcance y la búsqueda actuales. */
  function itemsEstado() {
    var ex = {}; eventosFiltrados(true).forEach(function (e) { ex[e.estado] = 1; });
    var items = [{ id: 'todos', label: 'Todos', value: 'todos' }];
    [['curso', 'En curso'], ['proximo', 'Próximos'], ['finalizado', 'Finalizados']].forEach(function (x) { if (ex[EST_KEY[x[0]]]) items.push({ id: x[0], label: x[1], value: x[0] }); });
    return items.length > 2 ? items : [];
  }
  function syncEstado() {
    var tg = document.querySelector('#nws-estado nwt-tag-group'), items = itemsEstado();
    if (listUi.estado !== 'todos' && !items.some(function (i) { return i.value === listUi.estado; })) listUi.estado = 'todos';
    var box = document.getElementById('nws-estado'); if (box) box.hidden = !items.length;
    if (tg && items.length) { tg.items = items; tg.value = listUi.estado; }
  }

  function cardHtml(e) {
    return '<article class="ec nws-ec" ><div class="ec-body">' +
      '<div class="ec-top"><div class="ec-t"><h3 class="ec-title nwt-smalltext-font-bold"><a class="ec-main" href="#/eventos/' + encodeURIComponent(e.code) + '">' + esc(e.nombre) + '</a></h3>' +
      '<div class="ec-sub">' + icoAlcance(e) + (e.ciclo ? icoCiclo() : '') + '</div></div>' +
      dotEstado(e.estado) + '</div>' +
      '<div class="ec-meta">' +
      '<div class="ec-row">' + icon('calendar') + '<span><strong>' + OLC.fechaCorta(e.inicio) + '</strong> — ' + OLC.fechaCorta(e.fin) + '</span></div>' +
      '<div class="ec-row">' + icon('gps-pin') + '<span>' + esc(ciudad(e.lugar)) + '</span></div>' +
      '<div class="ec-row ec-when ec-when--' + { 'En curso': 'on', 'Próximo': 'next', 'Finalizado': 'end' }[e.estado] + '">' + icon('dispatch-time') + '<span>' + esc(tiempoEvento(e)) + '</span></div>' +
      '</div></div>' +
      '<div class="ec-foot' + (e.estado === 'Finalizado' ? ' ec-foot--two' : '') + '">' +
      (e.estado === 'Finalizado' ? '<a class="ec-link ec-link--med" href="#/eventos/' + encodeURIComponent(e.code) + '?tab=medalleria">Ver medallería ' + icon('arrow-right') + '</a>' : '') +
      '<span class="ec-link">Ver detalle ' + icon('arrow-right') + '</span></div></article>';
  }

  function filaHtml(e) {
    var href = '#/eventos/' + encodeURIComponent(e.code);
    return '<li class="nws-row"><span class="nws-row__st">' + dotEstado(e.estado) + '</span>' +
      '<a class="nws-row__name nwt-smalltext-font-bold" href="' + href + '">' + esc(e.nombre) + '</a>' +
      '<span class="nws-row__ciclo">' + (e.ciclo ? icoCiclo() : '') + '</span>' +
      '<span class="nws-row__fechas nwt-caption-font-regular">' + icon('calendar') + '<span><strong>' + OLC.fechaCorta(e.inicio) + '</strong> – ' + OLC.fechaCorta(e.fin) + '</span></span>' +
      '<span class="nws-row__lugar nwt-caption-font-regular">' + icon('gps-pin') + '<span>' + esc(ciudad(e.lugar)) + '</span></span>' +
      '<span class="nws-row__alc nwt-caption-font-regular">' + icoAlcance(e) + '<span>' + esc(alcanceTxt(e)) + '</span></span>' +
      '<a class="ec-link nws-row__ver" href="' + href + '" aria-label="Ver detalle de ' + esc(e.nombre) + '">Ver detalle ' + icon('arrow-right') + '</a></li>';
  }
  function itemsHtml(arr) {
    return listUi.vista === 'lista' ? '<ul class="nws-lista" aria-label="Eventos">' + arr.map(filaHtml).join('') + '</ul>' : '<div class="nws-cards">' + arr.map(cardHtml).join('') + '</div>';
  }

  /* calendario mensual con barras que abarcan días */
  function calendarHtml(evs) {
    var p = listUi.mes.split('-'), y = +p[0], m = +p[1] - 1;
    var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
    var first = new Date(y, m, 1, 12);
    var start = new Date(first); start.setDate(1 - ((first.getDay() + 6) % 7)); // lunes
    var weeks = [];
    for (var w = 0; w < 6; w++) {
      var days = [];
      for (var d = 0; d < 7; d++) { var dt = new Date(start); dt.setDate(start.getDate() + w * 7 + d); days.push(dt); }
      if (w >= 4 && days[0].getMonth() !== m) break;
      weeks.push(days);
    }
    var tema = { 'En curso': 'on', 'Próximo': 'next', 'Finalizado': 'end' };
    var h = '<div class="nws-cal"><div class="nws-cal__nav"><button type="button" class="nws-iconbtn" data-mes="-1" aria-label="Mes anterior">' + icon('chevron-left') + '</button>' +
      '<h3 class="nwt-smalltext-font-bold" aria-live="polite">' + MESES[m][0].toUpperCase() + MESES[m].slice(1) + ' de ' + y + '</h3>' +
      '<button type="button" class="nws-iconbtn" data-mes="1" aria-label="Mes siguiente">' + icon('chevron-right') + '</button>' +
      '<button type="button" class="nws-linkbtn" data-mes="hoy">Hoy</button></div>';
    h += '<div class="nws-cal__dow" aria-hidden="true">' + ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(function (x) { return '<span>' + x + '</span>'; }).join('') + '</div>';
    weeks.forEach(function (days) {
      var a = iso(days[0]), b = iso(days[6]);
      var bars = evs.filter(function (e) { return e.inicio <= b && e.fin >= a; }).sort(function (x, z) { return x.inicio < z.inicio ? -1 : 1; });
      var lanes = [];
      bars.forEach(function (e) {
        var c0 = Math.max(0, days.findIndex(function (dd) { return iso(dd) >= e.inicio; })), c1 = 6;
        for (var i = 0; i < 7; i++) if (iso(days[i]) <= e.fin) c1 = i;
        if (e.inicio > a) { for (var j = 0; j < 7; j++) if (iso(days[j]) === e.inicio) c0 = j; } else c0 = 0;
        var lane = 0;
        while (lanes[lane] && lanes[lane].some(function (r) { return !(c1 < r[0] || c0 > r[1]); })) lane++;
        (lanes[lane] = lanes[lane] || []).push([c0, c1]);
        e._p = { c0: c0, c1: c1, lane: lane, ini: e.inicio >= a, fin: e.fin <= b };
      });
      h += '<div class="nws-cal__week" style="--lanes:' + Math.max(lanes.length, 1) + '"><div class="nws-cal__days">' +
        days.map(function (dd) {
          var out = dd.getMonth() !== m, hoy = iso(dd) === OLC.HOY;
          return '<div class="nws-cal__day' + (out ? ' is-out' : '') + '"><span class="' + (hoy ? 'is-today' : '') + '"' + (hoy ? ' aria-label="Hoy, ' + dd.getDate() + '"' : '') + '>' + dd.getDate() + '</span></div>';
        }).join('') + '</div>';
      bars.forEach(function (e) {
        var r = e._p;
        h += '<a class="nws-cal__bar nws-cal__bar--' + tema[e.estado] + (r.ini ? ' is-start' : '') + (r.fin ? ' is-end' : '') + '" href="#/eventos/' + encodeURIComponent(e.code) +
          '" style="grid-column:' + (r.c0 + 1) + '/' + (r.c1 + 2) + ';grid-row:' + (r.lane + 1) + '" title="' + esc(e.nombre + ' · ' + e.estado) + '">' + esc(e.nombre) + '<span class="nws-sr"> · ' + e.estado + '</span></a>';
      });
      h += '</div>';
    });
    return h + '</div>';
  }

  function renderResultados() {
    var box = document.getElementById('nws-results');
    var evs = eventosFiltrados();
    var cuenta = document.getElementById('nws-count');
    if (listUi.vista === 'calendario') {
      cuenta.textContent = evs.length + (evs.length === 1 ? ' evento' : ' eventos');
      box.innerHTML = evs.length ? calendarHtml(evs) : emptyHtml();
      box.querySelectorAll('[data-mes]').forEach(function (b) {
        b.addEventListener('click', function () {
          var v = b.getAttribute('data-mes'), p = listUi.mes.split('-'), d;
          if (v === 'hoy') d = new Date(OLC.HOY + 'T12:00:00'); else d = new Date(+p[0], +p[1] - 1 + (+v), 1, 12);
          listUi.mes = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
          var f = b.getAttribute('data-mes');
          renderResultados();
          var again = box.querySelector('[data-mes="' + f + '"]'); if (again) again.focus();
        });
      });
      return;
    }
    var pages = Math.max(1, Math.ceil(evs.length / PAGE_SIZE));
    if (listUi.page > pages) listUi.page = pages;
    var slice = evs.slice((listUi.page - 1) * PAGE_SIZE, listUi.page * PAGE_SIZE);
    cuenta.textContent = evs.length + (evs.length === 1 ? ' evento' : ' eventos');
    if (!evs.length) { box.innerHTML = emptyHtml(); return; }
    var h = '';
    if (listUi.estado === 'todos') {
      // secciones por estado: solo las que tienen eventos
      var cont = {}; evs.forEach(function (e) { cont[e.estado] = (cont[e.estado] || 0) + 1; });
      var ult = null, abierto = false, grupo = [];
      var cerrar = function () { if (abierto) h += itemsHtml(grupo) + '</section>'; };
      slice.forEach(function (e) {
        if (e.estado !== ult) {
          cerrar();
          h += '<section class="nws-sec" aria-labelledby="nws-sec-' + EST_ORD[e.estado] + '"><h2 class="nws-sec__t nwt-smalltext-font-bold" id="nws-sec-' + EST_ORD[e.estado] + '">' + EST_SEC[e.estado] + '<span class="nws-sec__n">' + cont[e.estado] + '</span></h2>';
          ult = e.estado; abierto = true; grupo = [];
        }
        grupo.push(e);
      });
      cerrar();
    } else h = itemsHtml(slice);
    h += '<div class="nws-bar">';
    if (pages > 1) {
      h += '<nav class="nws-pager" aria-label="Paginación"><button type="button" data-pg="' + (listUi.page - 1) + '" aria-label="Página anterior"' + (listUi.page === 1 ? ' disabled' : '') + '>' + icon('chevron-left') + '</button>';
      for (var i = 1; i <= pages; i++) h += '<button type="button" data-pg="' + i + '"' + (i === listUi.page ? ' aria-current="page"' : '') + '>' + i + '</button>';
      h += '<button type="button" data-pg="' + (listUi.page + 1) + '" aria-label="Página siguiente"' + (listUi.page === pages ? ' disabled' : '') + '>' + icon('chevron-right') + '</button></nav>';
    }
    box.innerHTML = h + '</div>';
    box.querySelectorAll('[data-pg]').forEach(function (b) {
      b.addEventListener('click', function () { listUi.page = +b.getAttribute('data-pg'); renderResultados(); var s = box.querySelector('.nws-cards a, .nws-lista a'); if (s) s.focus(); });
    });
    // tarjeta entera clicable: el enlace del título hace de ancla accesible
    box.querySelectorAll('.nws-ec').forEach(function (c) {
      c.addEventListener('click', function (ev) { if (ev.target.closest('a')) return; location.hash = c.querySelector('a.ec-main').getAttribute('href'); });
    });
  }

  function emptyHtml() {
    return '<div class="nws-empty"><p class="nwt-smalltext-font-bold">No hay eventos con estos criterios</p><p class="nwt-caption-font-regular nws-muted">Prueba con otro estado o borra la búsqueda.</p></div>';
  }

  function renderListado() {
    setTop([{ t: 'Eventos' }]);
    $main.innerHTML =
      '<div class="nws-page nws-events-list">' +
      '<div class="nws-events-header"><div class="nws-events-header__description"><h1 class="nwt-h5-font-bold" id="nws-h1" tabindex="-1">Eventos</h1>' +
      '<small class="nwt-smalltext-font-regular">Consulta los eventos a los que tienes acceso.</small></div></div>' +
      '<div class="nws-events-catalog">' +
      '<div class="nws-scope" id="nws-scope"></div>' +
      '<div class="nws-events-catalog__header">' +
      '<div class="nwt-searchbox nws-search"><label class="nwt-searchbox__container">' + icon('search') +
      '<input class="nwt-searchbox__input" type="search" id="nws-q" placeholder="Buscar evento, lugar u organismo…" aria-label="Buscar evento, lugar u organismo" value="' + esc(listUi.q) + '"></label></div>' +
      '<div class="nws-events-catalog__filters"><div id="nws-estado"></div>' +
      '<div class="nws-seg" role="group" aria-label="Vista">' + [['tarjetas', 'view-grid', 'Vista de tarjetas'], ['lista', 'view-list', 'Vista de lista'], ['calendario', 'calendar', 'Vista de calendario']].map(function (v) {
        return '<button type="button" data-vista="' + v[0] + '" aria-pressed="' + (listUi.vista === v[0]) + '" aria-label="' + v[2] + '" title="' + v[2] + '">' + icon(v[1]) + '</button>';
      }).join('') + '</div></div></div>' +
      '<p class="nwt-caption-font-regular nws-muted" id="nws-count" role="status" aria-live="polite"></p>' +
      '<div id="nws-results"></div></div></div>';

    var scope = document.getElementById('nws-scope');
    scope.innerHTML = '<nwt-tabs auto-width></nwt-tabs>';
    var tabs = scope.firstChild;
    whenDefined('nwt-tabs', function () {
      tabs.items = [{ id: 'mine', label: 'Mis eventos', value: 'mine' }, { id: 'all', label: 'Todos los eventos', value: 'all' }];
      tabs.value = listUi.scope;
      tabs.addEventListener('nwtChange', function (e) { listUi.scope = e.detail; listUi.page = 1; syncEstado(); renderResultados(); });
    });
    var est = document.getElementById('nws-estado');
    est.innerHTML = '<nwt-tag-group nwt-size="medium" aria-label="Filtrar por estado"></nwt-tag-group>';
    var tg = est.firstChild;
    whenDefined('nwt-tag-group', function () {
      syncEstado();
      tg.addEventListener('nwtChange', function (e) { listUi.estado = e.detail; listUi.page = 1; renderResultados(); });
    });
    document.getElementById('nws-q').addEventListener('input', function (e) { listUi.q = e.target.value; listUi.page = 1; syncEstado(); renderResultados(); });
    $main.querySelectorAll('[data-vista]').forEach(function (b) {
      b.addEventListener('click', function () {
        listUi.vista = b.getAttribute('data-vista');
        $main.querySelectorAll('[data-vista]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        renderResultados();
      });
    });
    syncEstado();
    renderResultados();
  }

  /* ---------- detalle ---------- */
  function stripCol(ic, lbl, val, extra) {
    return '<div class="nws-event-detail__column"><span class="nws-event-detail__label">' + icon(ic) + lbl + '</span>' +
      (extra ? '<span class="nws-event-detail__valrow"><span class="nwt-smalltext-font-bold">' + esc(val) + '</span>' + extra + '</span>' : '<span class="nwt-smalltext-font-bold">' + esc(val) + '</span>') + '</div>';
  }

  function varianteFoto(code) {
    var n = 0; code = String(code || ''); for (var i = 0; i < code.length; i++) n += code.charCodeAt(i);
    return ['', ' nws-ph--b', ' nws-ph--c'][n % 3];
  }

  /* La descripción del fixture trae una nota técnica entre paréntesis: no es texto de usuario. */
  function limpiarDesc(t) { return String(t || '').replace(/\s*\(descripción derivada[^)]*\)/i, ''); }
  function cabeceraHtml(data) {
    var e = data.evento, est = data.estado;
    var h = '<header class="nws-event-detail__head nws-ph' + varianteFoto(e.code || data.code || e.nombre) + '" aria-label="Encabezado del evento"><span class="nws-ph__tag">Foto del evento</span><div class="nws-event-detail__veil"></div>' +
      '<div class="nws-event-detail__hero-in"><a class="nws-iconbtn nws-iconbtn--lg nws-event-detail__back" href="#/eventos" aria-label="Volver a eventos">' + icon('arrow-left') + '</a>' +
      '<div class="nws-event-detail__titlebox"><div class="nws-event-detail__badges">' + (e.ciclo ? '<span class="nws-event-detail__cycle">Ciclo Olímpico</span>' : '') +
      (est === 'Finalizado' ? '' : '<span class="nws-event-detail__when">' + esc(tiempoEvento(data.evento)) + '</span>') +
      '</div>' +
      '<h1 class="nws-event-detail__name" id="nws-h1" tabindex="-1">' + esc(e.nombre) + '</h1>' +
      (e.descripcion ? '<p class="nws-event-detail__lead">' + esc(limpiarDesc(e.descripcion)) + '</p>' : '') + '</div></div></header>';
    h += '<div class="nws-event-detail__card"><div class="nws-event-detail__strip">' +
      stripCol('calendar', 'Fecha de inicio', OLC.fechaCorta(e.inicio)) + stripCol('calendar', 'Fecha final', OLC.fechaCorta(e.fin), badgeEstado(est, true)) +
      stripCol('gps-pin', 'Lugar', e.lugar) + stripCol('real-estate', 'Organismo', e.organismo) + stripCol('home', 'Alcance', alcanceTxt(e)) + '</div>';
    if (e.sedes && e.sedes.length) {
      h += '<div class="nws-event-detail__venues"><span class="nws-event-detail__label">' + icon('gps-pin-filled') + 'Sedes<span class="nws-event-detail__venues-count">' + e.sedes.length + '</span></span>' +
        '<ul class="nws-event-detail__venues-list" aria-label="Sedes del evento">' + e.sedes.map(function (s) { return '<li class="nws-event-detail__venue nwt-smalltext-font-regular">' + esc(s) + '</li>'; }).join('') + '</ul></div>';
    }
    h += '</div>';
    h += '<div class="nws-event-detail__card"><div class="nws-event-detail__strip nws-event-detail__strip--foot">' +
      '<div class="nws-event-detail__column" role="group" aria-label="Gestor asignado"><div class="nws-event-detail__manager">' +
      '<span class="nws-avatar" aria-hidden="true">' + esc(iniciales(e.gestor.nombre)) + '</span><div class="nws-event-detail__manager-meta"><span class="nwt-smalltext-font-bold">' + esc(e.gestor.nombre) + '</span><small class="nwt-caption-font-regular">' + esc(e.gestor.rol) + '</small></div></div></div>'  + '</div></div>';
    return h;
  }

  function renderDetalle(route) {
    var data;
    try { data = OLC.datosDe(route.code); } catch (err) { data = null; }
    if (!data || !data.evento) {
      setTop([{ t: 'Eventos', href: '#/eventos' }, { t: 'Evento no encontrado' }]);
      $main.innerHTML = '<div class="nws-page nws-event-detail"><div class="nws-empty nws-empty--page"><h1 class="nwt-h5-font-bold" id="nws-h1" tabindex="-1">No encontramos este evento</h1>' +
        '<p class="nwt-smalltext-font-regular nws-muted">El código «' + esc(route.code) + '» no corresponde a ningún evento.</p><a class="nws-btn" href="#/eventos">Volver a eventos</a></div></div>';
      return;
    }
    setTop([{ t: 'Eventos', href: '#/eventos' }, { t: data.evento.nombre }]);
    $main.innerHTML = '<div class="nws-page nws-event-detail">' + cabeceraHtml(data) +
      '<div class="nws-event-detail-tabs"><div class="nws-event-detail-tabs__strip" id="nws-tabstrip"></div>' +
      '<div class="nws-event-detail-tabs__panel" id="nws-panel" role="tabpanel" aria-label="Contenido de la sección"></div></div></div>';
    state.data = data;
    var strip = document.getElementById('nws-tabstrip');
    strip.innerHTML = '<nwt-tabs auto-width></nwt-tabs>';
    state.tabsEl = strip.firstChild;
    whenDefined('nwt-tabs', function () {
      state.tabsEl.items = visibleTabs(data).map(function (t) { return { id: t.id, label: t.label, value: t.id }; });
      state.tabsEl.value = currentTab(route);
      state.tabsEl.addEventListener('nwtChange', function (e) {
        var r = parseHash();
        if (e.detail !== currentTab(r)) location.hash = buildHash(r.code, merge(r.params, { tab: e.detail }));
      });
    });
    state.data = data;
    renderPanel(route);
  }

  /* Pestañas visibles: Medallería solo con medallas; Deportistas solo si hay pruebas con inscritos
     (los inscritos existen desde antes de competir, así que en eventos Próximos se mantiene). */
  function visibleTabs(data) {
    return TABS.filter(function (t) {
      if (!data) return true;
      if (t.id === 'medalleria') return data.medallero().length > 0;
      if (t.id === 'deportistas') return data.pruebas.length > 0;
      return true;
    });
  }
  function currentTab(route) {
    var vis = visibleTabs(state.data), t = route.params.tab;
    if (vis.some(function (x) { return x.id === t; })) return t;
    return vis.some(function (x) { return x.id === DEFAULT_TAB; }) ? DEFAULT_TAB : vis[0].id;
  }

  function renderPanel(route) {
    var panel = document.getElementById('nws-panel');
    var tab = currentTab(route);
    var data = state.data;
    var tabsRoot = panel;
    var before = document.activeElement && panel.contains(document.activeElement) ? pathOf(panel, document.activeElement) : null;
    var beforeTab = state.lastTab;
    state.lastTab = tab;
    var ui = (tabUi[route.code] = tabUi[route.code] || {});
    var ctx = {
      audience: 'platform', data: data, event: data.evento, params: route.params, ui: ui,
      go: function (patch) {
        var r = parseHash();
        var next = buildHash(r.code, merge(r.params, patch));
        if (next === location.hash) { renderPanel(parseHash()); } else { location.hash = next; }
      },
      href: function (patch) { var r = parseHash(); return buildHash(r.code, merge(r.params, patch)); }
    };
    panel.setAttribute('aria-label', (TABS.filter(function (t) { return t.id === tab; })[0] || {}).label);
    if (tab === 'dashboard') {
      panel.innerHTML = '<div class="nws-reserved" role="img" aria-label="Espacio reservado para el dashboard del evento"><b>Dashboard del evento</b>' +
        '<span>Dashboard del evento — se redefine en otro frente. Este espacio queda reservado, sin cambios.</span></div>';
    } else if (window.Tabs && window.Tabs[tab] && typeof window.Tabs[tab].render === 'function') {
      try { window.Tabs[tab].render(panel, ctx); } catch (err) {
        console.error('Tab «' + tab + '»', err);
        panel.innerHTML = '<div class="nws-reserved"><b>No se pudo mostrar esta sección</b><span>Intenta recargar la página.</span></div>';
      }
    } else {
      panel.innerHTML = '<div class="nws-reserved"><b>Sección en construcción</b><span>Esta sección aún no está disponible.</span></div>';
    }
    if (before && beforeTab === tab) {
      var el = resolve(tabsRoot, before);
      if (el && el.focus) el.focus({ preventScroll: true });
    }
  }

  /* ---------- router ---------- */
  function render() {
    var route = parseHash();
    syncMenu(route);
    var sameDetail = route.view === 'detalle' && state.view === 'detalle' && state.code === route.code && document.getElementById('nws-panel');
    if (sameDetail) {
      if (state.tabsEl && state.tabsEl.value !== currentTab(route)) state.tabsEl.value = currentTab(route);
      renderPanel(route);
      return;
    }
    var cambioVista = !(state.view === route.view && state.code === route.code);
    state.view = route.view; state.code = route.code; state.lastTab = null;
    if (route.view === 'detalle') renderDetalle(route); else if (route.view === 'listado') renderListado(); else renderSimple(route);
    if (cambioVista) {
      window.scrollTo(0, 0);
      var h1 = document.getElementById('nws-h1');
      if (h1 && state.focusReady) h1.focus({ preventScroll: true });
    }
    state.focusReady = true;
    if (route.view === 'dashboard' || route.view === 'vacia') return;
    document.title = (route.view === 'detalle' && state.data && state.data.evento ? state.data.evento.nombre : 'Eventos') + ' · Naowee Suite';
  }

  window.addEventListener('hashchange', render);
  render();
})();
