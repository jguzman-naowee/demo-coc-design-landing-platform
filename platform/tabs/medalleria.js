/* Utilidades compartidas de las pestañas de la plataforma (se antepone a cada tab; idempotente). */
(function () {
  if (window.NWS) return;
  var SX = { F: 'Femenino', M: 'Masculino', X: 'Mixto' };
  var N = {};
  N.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  N.norm = function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  N.num = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
  N.hash = function (s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  /* Símbolos ♂/♀; Mixto superpone ambos. Color heredado del texto (currentColor). */
  N.sexIco = function (sx) {
    var p = { M: '<circle cx="8" cy="12" r="4.5"/><path d="M11.5 8.5L17 3m-4.5 0H17v4.5"/>', F: '<circle cx="10" cy="7.5" r="4.5"/><path d="M10 12v6m-3-3h6"/>', X: '<circle cx="8" cy="12" r="4"/><path d="M11 9l5.5-5.5m-4 0h4v4M8 16v3m-2-1.5h4"/>' };
    return '<svg class="nwtab-sx__g" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + p[sx] + '</svg>';
  };
  N.sexTag = function (sx) { return '<span class="nwtab-sx nwtab-sx--' + sx + '">' + N.sexIco(sx) + SX[sx] + '</span>'; };
  N.badge = function (est) {
    var k = est === 'Finalizado' ? 'done' : est === 'En vivo' ? 'live' : 'prog';
    return '<span class="nwtab-st nwtab-st--' + k + '">' + N.esc(est) + '</span>';
  };
  N.cc = function (iso, nombre) {
    if (!iso) return '';
    var b = OLC.bandera(iso, 20);
    return '<span class="nwtab-cc" title="' + N.esc(nombre || OLC.paisNombre(iso)) + '">' +
      (b ? '<img class="nwtab-cc__f" src="' + N.esc(b.src) + '" srcset="' + N.esc(b.srcset) + '" width="20" height="15" alt="" loading="lazy" decoding="async" onerror="this.remove()">' : '') +
      '<span>' + N.esc(String(iso).toUpperCase()) + '</span></span>';
  };
  /* Bandera sola para filas de resultado; sin imagen (país null o error de carga) queda el ISO en texto pequeño. */
  N.flag = function (iso, nombre) {
    if (!iso) return '';
    var b = OLC.bandera(iso, 20), c = N.esc(String(iso).toUpperCase());
    return '<span class="nwtab-fl' + (b ? '' : ' is-x') + '" title="' + N.esc(nombre || OLC.paisNombre(iso)) + '">' +
      (b ? '<img src="' + N.esc(b.src) + '" srcset="' + N.esc(b.srcset) + '" width="20" height="15" alt="" loading="lazy" decoding="async" onerror="this.parentNode.className+=\' is-x\';this.remove()">' : '') +
      '<span class="nwtab-fl__c">' + c + '</span></span>';
  };
  N.ico = function (name) {
    var p = {
      chev: '<path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      arrow: '<path d="M4 10h11m-4-4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      search: '<circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
      left: '<path d="M12 5l-5 5 5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      right: '<path d="M8 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      podium: '<path d="M2.5 17.5h15M7 17.5V9h6v8.5M2.5 17.5v-5H7M13 17.5v-3h4.5v3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 2.5l1.1 2.2 2.4.3-1.7 1.7.4 2.3L10 8l-2.2 1 .4-2.3-1.7-1.7 2.4-.3z" fill="currentColor"/>',
      medal: '<circle cx="10" cy="12" r="5" fill="currentColor"/><path d="M6.5 2.5L9 7m4.5-4.5L11 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
      /* deportes */
      ball: '<circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M2.8 8.5c4 1.5 10.4 1.5 14.4 0M10 2.5c-2.5 3.3-2.5 11.7 0 15M10 2.5c2.5 3.3 2.5 11.7 0 15" fill="none" stroke="currentColor" stroke-width="1.4"/>',
      waves: '<path d="M2 7c2-2 4 2 6 0s4 2 6 0 3 0 4 0M2 12c2-2 4 2 6 0s4 2 6 0 3 0 4 0M2 17c2-2 4 2 6 0s4 2 6 0 3 0 4 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
      run: '<circle cx="12" cy="4" r="2" fill="currentColor"/><path d="M10 8l-3 3 3 2-1 5M10 8l4 1 2 3M7 11l-3 1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
      bike: '<circle cx="5" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="15" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 13l3-6h5l2 6M8 7L10 13h5M12 5h2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
      bell: '<path d="M2 8v4m3-6v8m10-8v8m3-6v4M5 10h10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
      fight: '<circle cx="7" cy="5" r="2" fill="currentColor"/><circle cx="14" cy="6" r="2" fill="currentColor"/><path d="M4 17l1-6 3-2 3 2 1 6M12 17l1-5 3-1 1 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
      star: '<path d="M10 2.5l2.3 4.8 5.2.7-3.8 3.6.9 5.2L10 14.3l-4.6 2.5.9-5.2L2.5 8l5.2-.7z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
      gym: '<circle cx="6" cy="5" r="2.6" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="14" cy="5" r="2.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M6 7.6V11m8-3.4V11M10 11v6.5M6 11h8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
      glove: '<path d="M6 9V5.5a2.5 2.5 0 015 0V9h3.5a1.5 1.5 0 011.5 1.5v2A5 5 0 0111.5 17.5H9A4 4 0 015 13.5V9z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M6 14h8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
      paddle: '<circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M11.5 11.5L17 17" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'
    };
    return '<svg class="nwtab-i" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">' + (p[name] || p.star) + '</svg>';
  };
  var DEP_ICO = { atletismo: 'run', natacion: 'waves', judo: 'fight', boxeo: 'glove', lucha: 'fight', ciclismo: 'bike', gimnasia: 'gym', pesas: 'bell', taekwondo: 'fight', 'tenis-mesa': 'paddle', voleibol: 'ball', baloncesto: 'ball', balonmano: 'ball', 'futbol-sala': 'ball' };
  N.depIco = function (code) { return N.ico(DEP_ICO[code] || 'star'); };
  N.ord = function (n) { return n + '.º'; };
  N.medalName = function (pos) { return pos === 1 ? 'Oro' : pos === 2 ? 'Plata' : pos === 3 ? 'Bronce' : ''; };
  N.medalDot = function (k) { return '<i class="nwtab-md nwtab-md--' + k + '" aria-hidden="true"></i>'; };
  /* Cambia un parámetro global y devuelve el foco al control que lo disparó (el shell re-renderiza todo). */
  N.go = function (ctx, patch, key) {
    ctx.go(patch);
    N.refocus(key);
  };
  N.refocus = function (key, caret) {
    if (!key) return;
    var f = function () {
      var t = document.querySelector('[data-k="' + key + '"]');
      if (!t) return false;
      if (document.activeElement !== t) { t.focus({ preventScroll: true }); if (caret != null && t.setSelectionRange) { try { t.setSelectionRange(caret, caret); } catch (e) { } } }
      return true;
    };
    if (!f()) requestAnimationFrame(f);
  };
  /* Filtro de sexo (segmentado). */
  N.sexBar = function (params, extra) {
    var cur = params.sexo || '';
    var opts = [['', 'Todos', ''], ['F', 'Femenino', 'F'], ['M', 'Masculino', 'M'], ['X', 'Mixto', 'X']];
    return '<div class="nwtab-sxbar__seg" role="group" aria-label="Filtrar por género"><span class="nwtab-lbl" aria-hidden="true">Género</span><div class="nwtab-seg">' +
      opts.map(function (o) {
        return '<button type="button" class="nwtab-seg__b" data-k="sx-' + (o[0] || 'T') + '" data-sx="' + o[0] + '" aria-pressed="' + (cur === o[0]) + '">' + (o[2] ? N.sexIco(o[2]) : '') + o[1] + '</button>';
      }).join('') + '</div></div>' + (extra || '');
  };
  /* Colombia es filtro solo si participa en alguna prueba del evento (data.colombia.participa = n.º de pruebas). */
  N.hayColombia = function (data) { return !!(data.colombia && data.colombia.participa > 0); };
  N.colOn = function (params, data) { return N.hayColombia(data) && String(params.colombia) !== '0'; };
  N.colSwitch = function (params, data) {
    if (!N.hayColombia(data)) return '';
    var on = N.colOn(params, data); /* ausente = encendido; 0 = apagado */
    return '<button type="button" class="nwtab-sw" role="switch" aria-checked="' + on + '" data-k="col" data-col="' + (on ? '0' : '') + '"><span class="nwtab-sw__t" aria-hidden="true"><i></i></span><span class="nwtab-sw__l"><span>Solo pruebas</span> <span>con Colombianos</span></span></button>';
  };
  N.bindBar = function (el, ctx) {
    el.querySelectorAll('[data-sx]').forEach(function (b) {
      b.addEventListener('click', function () { N.go(ctx, { sexo: b.getAttribute('data-sx') }, b.getAttribute('data-k')); });
    });
    var c = el.querySelector('[data-col]');
    if (c) c.addEventListener('click', function () { N.go(ctx, { colombia: c.getAttribute('data-col') }, 'col'); });
  };
  /* Enlaces internos: el clic navega por ctx.go sin recargar. */
  N.bindLinks = function (el, ctx) {
    el.querySelectorAll('a[data-patch]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        var patch = JSON.parse(a.getAttribute('data-patch'));
        N.go(ctx, patch, a.getAttribute('data-k'));
      });
    });
  };
  N.sexOk = function (p, params) { return !params.sexo || p.sexo === params.sexo; };
  /* Estado respecto al tiempo: SIEMPRE derivado de las fechas contra OLC.HOY. */
  N.dif = function (a, b) { return Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000); };
  N.tiempoDia = function (iso) { return iso < OLC.HOY ? 'Pasada' : iso === OLC.HOY ? 'Hoy' : 'Próxima'; };
  N.estadoPrueba = function (p) {
    if (p.estado === 'En vivo') return 'En vivo';
    if (p.fecha < OLC.HOY) return 'Finalizado';
    if (p.fecha > OLC.HOY) return 'Programado';
    return p.estado;
  };
  N.faltan = function (iso) { var n = N.dif(OLC.HOY, iso); return n === 1 ? 'Falta 1 día' : 'Faltan ' + n + ' días'; };
  N.tiempoBadge = function (t) { return '<span class="nwtab-tm nwtab-tm--' + (t === 'Pasada' ? 'pas' : t === 'Hoy' ? 'hoy' : 'fut') + '">' + t + '</span>'; };
  N.corta = function (iso) { var s = OLC.fechaCorta(iso); return s.replace(/ \d{4}$/, ''); };
  window.NWS = N;
})();
/* Pestaña Medallería (plataforma): tarjetas, General | Por deporte y tabla Top 5 + Colombia fijada. */
(function () {
  var N = window.NWS, esc = N.esc;
  window.Tabs = window.Tabs || {};

  function celda(n) { return n ? '<span class="nwtab-n">' + n + '</span>' : '<span class="nwtab-n is-0">0</span>'; }
  function fila(r, col, etiqueta) {
    return '<tr' + (col ? ' class="nwtab-co"' : '') + '><td class="nwtab-c1"><span class="nwtab-pos">' + (r.pos || '—') + '</span></td><td><span class="nwtab-dg">' + N.cc(r.pais, r.paisNombre) + '<span class="nwtab-dn">' + esc(r.paisNombre) + '</span>' + (etiqueta ? '<span class="nwtab-cot">' + etiqueta + '</span>' : '') + '</span></td>' +
      '<td class="nwtab-r">' + celda(r.oro) + '</td><td class="nwtab-r">' + celda(r.plata) + '</td><td class="nwtab-r">' + celda(r.bronce) + '</td><td class="nwtab-r"><b class="nwtab-n nwtab-n--t">' + r.total + '</b></td></tr>';
  }

  function render(el, ctx) {
    var data = ctx.data, pr = ctx.params, ui = ctx.ui.me = ctx.ui.me || {};
    var general = data.medallero();
    var conMed = data.deportes.filter(function (d) { return data.medallero(d.codigo).length; });
    var depOk = conMed.some(function (d) { return d.codigo === pr.deporte; });
    var dep = depOk ? pr.deporte : (conMed[0] && conMed[0].codigo) || '';
    var modo = conMed.length ? (ui.modo || (depOk ? 'deporte' : 'general')) : 'general';
    var filas = modo === 'deporte' ? data.medallero(dep) : general;
    var nom = 'países', nCol = data.colombia ? data.colombia.participa : 0;

    var h = '<section class="nwtab-tab nwtab-me" aria-label="Medallería">';
    if (!general.length) {
      h += '<div class="nwtab-emptyb nwtab-emptyb--lg"><b>Aún no hay medallas.' + (nCol ? ' Colombia compite en ' + nCol + (nCol === 1 ? ' prueba.' : ' pruebas.') : '') + '</b><span>El medallero por país se arma a medida que terminan las pruebas.</span></div></section>';
      el.innerHTML = h; return;
    }
    var tot = filas.reduce(function (a, r) { a.o += r.oro; a.p += r.plata; a.b += r.bronce; a.t += r.total; return a; }, { o: 0, p: 0, b: 0, t: 0 });
    h += '<div class="nwtab-tot"><div class="nwtab-card"><span class="nwtab-card__l">' + N.medalDot('oro') + 'Oro</span><b class="nwtab-card__v">' + tot.o + '</b></div><div class="nwtab-card"><span class="nwtab-card__l">' + N.medalDot('plata') + 'Plata</span><b class="nwtab-card__v">' + tot.p + '</b></div><div class="nwtab-card"><span class="nwtab-card__l">' + N.medalDot('bronce') + 'Bronce</span><b class="nwtab-card__v">' + tot.b + '</b></div><div class="nwtab-card nwtab-card--t"><span class="nwtab-card__l">Total de medallas</span><b class="nwtab-card__v">' + tot.t + '</b></div></div>';
    h += '<div class="nwtab-mebar"><div class="nwtab-seg" role="group" aria-label="Alcance del medallero"><button type="button" class="nwtab-seg__b" data-k="m-gen" data-modo="general" aria-pressed="' + (modo === 'general') + '">General</button><button type="button" class="nwtab-seg__b" data-k="m-dep" data-modo="deporte" aria-pressed="' + (modo === 'deporte') + '">Por deporte</button></div>';
    if (modo === 'deporte') h += '<label class="nwtab-fld"><span class="nwtab-lbl">Deporte</span><select class="nwtab-sel" data-k="m-sel" data-sel="1">' + conMed.map(function (d) { return '<option value="' + d.codigo + '"' + (d.codigo === dep ? ' selected' : '') + '>' + esc(d.nombre) + '</option>'; }).join('') + '</select></label>';
    h += '</div>';

    if (!filas.length) {
      h += '<div class="nwtab-emptyb"><b>Este deporte todavía no tiene medallas.</b><span>Elija otro deporte o vuelva al medallero general.</span></div>';
    } else {
      var colPart = data.pruebas.some(function (p) { return (modo !== 'deporte' || p.deporte === dep) && p.participa; });
      var full = !!ui.full, top = full ? filas : filas.slice(0, 5), pin = null, colIdx = -1;
      colIdx = filas.map(function (r) { return r.pais; }).indexOf('CO');
      if (colIdx >= 5 && !full) pin = filas[colIdx];
      h += '<div class="nwtab-tw"><table class="nwtab-tb nwtab-tb--me"><caption class="nwtab-sr">Medallero ' + (modo === 'deporte' ? 'de ' + esc((data.deportes.filter(function (d) { return d.codigo === dep; })[0] || {}).nombre) : 'general') + '</caption><thead><tr><th scope="col" class="nwtab-c1">Pos.</th><th scope="col">' + 'País' + '</th><th scope="col" class="nwtab-r"><span class="nwtab-mh">' + N.medalDot('oro') + 'Oro</span></th><th scope="col" class="nwtab-r"><span class="nwtab-mh">' + N.medalDot('plata') + 'Plata</span></th><th scope="col" class="nwtab-r"><span class="nwtab-mh">' + N.medalDot('bronce') + 'Bronce</span></th><th scope="col" class="nwtab-r">Total</th></tr></thead><tbody>';
      top.forEach(function (r) { h += fila(r, r.pais === 'CO', r.pais === 'CO' ? 'Tu país' : ''); });
      if (pin) h += '<tr class="nwtab-gap"><td colspan="6"><span><i aria-hidden="true">···</i>Colombia · posición ' + pin.pos + ' de ' + filas.length + '</span></td></tr>' + fila(pin, true, 'Tu país');
      else if (colPart && colIdx < 0) h += '<tr class="nwtab-gap"><td colspan="6"><span><i aria-hidden="true">···</i>Colombia · sin medallas todavía</span></td></tr>' + fila({ pos: 0, pais: 'CO', paisNombre: 'Colombia', oro: 0, plata: 0, bronce: 0, total: 0 }, true, 'Tu país');
      h += '</tbody></table></div>';
      if (filas.length > 5) h += '<div class="nwtab-me__ft"><button type="button" class="nwtab-btn nwtab-btn--p" data-k="m-full" data-full="1" aria-expanded="' + full + '">' + (full ? 'Ver solo el Top 5' : 'Ver medallero completo (' + filas.length + ' ' + nom + ')') + '</button></div>';
    }
    h += '</section>';
    el.innerHTML = h;

    el.querySelectorAll('[data-modo]').forEach(function (b) { b.addEventListener('click', function () { ui.modo = b.getAttribute('data-modo'); ui.full = false; if (ui.modo === 'deporte' && pr.deporte !== dep) { ctx.go({ deporte: dep }); } else { window.Tabs['medalleria'].render(el, ctx); } N.refocus(b.getAttribute('data-k')); }); });
    var s = el.querySelector('[data-sel]'); if (s) s.addEventListener('change', function () { ui.full = false; N.go(ctx, { deporte: s.value }, 'm-sel'); });
    var f = el.querySelector('[data-full]'); if (f) f.addEventListener('click', function () { ui.full = !ui.full; window.Tabs['medalleria'].render(el, ctx); N.refocus('m-full'); });
  }

  window.Tabs['medalleria'] = { render: render };
})();
