/* Landing · pestaña «Calendario y resultados» (+ utilidades compartidas LPT para las otras dos tabs). */
(function () {
  'use strict';
  var OLC = window.OLC;

  /* ───────── Utilidades compartidas ───────── */
  var LPT = window.LPT = window.LPT || {};
  LPT.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  };
  LPT.norm = function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  var esc = LPT.esc;

  var P = {
    chev: '<path d="M6 9l6 6 6-6"/>', arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>', left: '<path d="M15 6l-6 6 6 6"/>', right: '<path d="M9 6l6 6-6 6"/>', pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0113 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    medal: '<circle cx="12" cy="15" r="5"/><path d="M8.5 11.5L6 3h4l2 5 2-5h4l-2.5 8.5"/>'
  };
  LPT.svg = function (name, cls) { return '<svg class="lp-i ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (P[name] || '') + '</svg>'; };

  var SPORT = {
    atletismo: '<circle cx="14" cy="5" r="2"/><path d="M13 8l-3 4 3 2 1 5M10 12l-4 1M13 8l4 3 3-1M14 14l4 5"/>',
    natacion: '<circle cx="16" cy="6" r="2"/><path d="M4 13l5-3 4 2 2-2M3 17c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1M3 21c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1"/>',
    ciclismo: '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-8h5l3 8M10 8l3 8M9 6h3"/>',
    pesas: '<path d="M3 10v4M6 8v8M18 8v8M21 10v4M6 12h12"/>',
    baloncesto: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5v17M6 6c3 3 3 9 0 12M18 6c-3 3-3 9 0 12"/>',
    voleibol: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5c-1 4 0 7 4 9.5M5 8c4 0 7 2 9 6M20 14c-4-2-8-1-10 3"/>',
    balonmano: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7l4 3-1.5 5h-5L8 10z"/>',
    'futbol-sala': '<circle cx="12" cy="12" r="8.5"/><path d="M12 8l3.5 2.5-1.3 4h-4.4l-1.3-4zM12 3.5V8M15.5 10.5l4.5-1.5M14.2 14.500l2.800 3.800M9.800 14.500L7 18.300M8.500 10.500L4 9"/>',
    boxeo: '<path d="M7 11V8a4 4 0 018 0v1h2a2 2 0 012 2v3a6 6 0 01-6 6h-1a5 5 0 01-5-5z"/><path d="M7 14h8"/>',
    'tenis-mesa': '<circle cx="10" cy="10" r="6"/><path d="M14.500 14.500L20 20M18 7a1.500 1.500 0 110 .1"/>',
    gimnasia: '<circle cx="12" cy="4.500" r="1.800"/><path d="M4 8h16M12 8v6M9 21l3-7 3 7"/>',
    judo: '<circle cx="8" cy="5" r="2"/><circle cx="17" cy="7" r="2"/><path d="M8 8v5l-3 6M8 13l4 2 5-6M17 9l2 5M12 15l-1 5"/>',
    lucha: '<circle cx="8" cy="5" r="2"/><circle cx="16" cy="5" r="2"/><path d="M8 8l2 5-3 6M16 8l-2 5 3 6M10 13h4"/>',
    taekwondo: '<circle cx="9" cy="5" r="2"/><path d="M9 8v6l-3 6M9 14l4 5M9 10l9-3M9 10l-4 2"/>'
  };
  LPT.sportIcon = function (code) {
    return '<svg class="lp-i" viewBox="0 0 24 24" aria-hidden="true">' + (SPORT[code] || '<circle cx="12" cy="9" r="5"/><path d="M9 13l-2 8 5-3 5 3-2-8"/>') + '</svg>';
  };

  LPT.SEXOS = [['', 'Todos', ''], ['F', 'Femenino', 'f'], ['M', 'Masculino', ''], ['X', 'Mixto', 'x']];
  /* Icono de género (♀ ♂ mixto) y tag con icono + nombre: una sola fuente para Deportes y Calendario. */
  var SXP = { M: '<circle cx="8" cy="12" r="4.5"/><path d="M11.5 8.5L17 3m-4.5 0H17v4.5"/>', F: '<circle cx="10" cy="7.5" r="4.5"/><path d="M10 12v6m-3-3h6"/>', X: '<circle cx="8" cy="12" r="4"/><path d="M11 9l5.5-5.5m-4 0h4v4M8 16v3m-2-1.5h4"/>' };
  LPT.sexoIcon = function (sx) {
    return SXP[sx] ? '<svg class="lp-sxs" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + SXP[sx] + '</svg>' : '';
  };
  LPT.sexoTag = function (sx, nombre) {
    return '<span class="lp-sxi" title="' + esc(nombre) + '">' + LPT.sexoIcon(sx) + '<span>' + esc(nombre) + '</span></span>';
  };
  LPT.estadoBadge = function (est, fila) {
    if (est === 'En vivo') return '<span class="lp-st lp-st-live"><span class="lp-st-d" aria-hidden="true"></span>En vivo</span>';
    if (est === 'Programado' && fila) return '<span class="lp-st-lbl lp-st-lbl-cal">Programada<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="4.5" width="14" height="12.5" rx="2"/><path d="M3 8.5h14M7 2.5v3M13 2.5v3"/></svg></span>'; /* DC-138/158: label + calendario */
    if (est === 'Programado') return '<span class="lp-st lp-st-soon"><span class="lp-st-d" aria-hidden="true"></span>Programada</span>';
    return '<span class="lp-st lp-st-done">Finalizada</span>';
  };

  /* Chip de país: bandera (si hay ISO-2 válido) a la izquierda y el código siempre visible. */
  LPT.cc = function (iso, nombre) {
    if (!iso) return '';
    var b = OLC.bandera(iso, 20);
    return '<span class="lp-cc" title="' + esc(nombre || OLC.paisNombre(iso)) + '">' +
      (b ? '<img class="lp-cc__f" src="' + esc(b.src) + '" srcset="' + esc(b.srcset) + '" width="20" height="15" alt="" loading="lazy" decoding="async" onerror="this.remove()">' : '') +
      '<span>' + esc(String(iso).toUpperCase()) + '</span></span>';
  };

  /* Bandera sola para filas de resultado; sin imagen (o si falla) queda el código ISO en texto. */
  LPT.flag = function (iso, nombre) {
    if (!iso) return '';
    var b = OLC.bandera(iso, 20), c = esc(String(iso).toUpperCase());
    return '<span class="lp-flag" title="' + esc(nombre || OLC.paisNombre(iso)) + '">' +
      (b ? '<img class="lp-flag__i" src="' + esc(b.src) + '" srcset="' + esc(b.srcset) + '" width="20" height="15" alt="" loading="lazy" decoding="async" onerror="this.hidden=true;this.nextSibling.hidden=false">' : '') +
      '<span class="lp-flag__c"' + (b ? ' hidden' : '') + '>' + c + '</span></span>';
  };

  /* Barra global de filtros: sexo (solo los que existen en el evento) + interruptor Colombia si se pide. */
  LPT.sexosDe = function (data) {
    return ['F', 'M', 'X'].filter(function (k) { return data.pruebas.some(function (p) { return p.sexo === k; }); });
  };
  LPT.segSexo = function (ctx) {
    var ex = LPT.sexosDe(ctx.data), sx = ex.indexOf(ctx.params.sexo) >= 0 ? ctx.params.sexo : '';
    if (ex.length < 2) return '';
    var h = '<div class="lp-seg" role="group" aria-label="Género de la prueba">';
    LPT.SEXOS.filter(function (o) { return o[0] === '' || ex.indexOf(o[0]) >= 0; }).forEach(function (o) {
      h += '<button type="button" data-sexo="' + o[0] + '" aria-pressed="' + (sx === o[0]) + '">' + LPT.sexoIcon(o[0]) + '<span>' + o[1] + '</span></button>';
    });
    return h + '</div>';
  };
  LPT.barra = function (ctx, opt) {
    var h = '<div class="lp-bar">';
    if (!(opt && opt.sinSexo)) h += LPT.segSexo(ctx);
    if (opt && opt.interruptor) {
      var on = opt.colombia;
      h += '<div class="lp-tg"><div class="lp-tg-r"><span class="lp-tg-l" id="lp-tg-l">Solo pruebas con Colombianos</span><button type="button" class="lp-tg-sw" role="switch" aria-checked="' + on + '" aria-labelledby="lp-tg-l" data-colombia></button></div></div>';
    }
    return h === '<div class="lp-bar">' ? '' : h + '</div>';
  };
  LPT.bindBarra = function (el, ctx) {
    el.querySelectorAll('[data-sexo]').forEach(function (b) {
      b.addEventListener('click', function () { ctx.go({ sexo: b.getAttribute('data-sexo') }); });
    });
    var sw = el.querySelector('[data-colombia]');
    if (sw) sw.addEventListener('click', function () { ctx.go({ colombia: sw.getAttribute('aria-checked') === 'true' ? '0' : '' }); });
    el.querySelectorAll('[data-col-todas]').forEach(function (b) { b.addEventListener('click', function () { ctx.go({ colombia: '0' }); }); });
  };
  LPT.ordSexo = { F: 0, M: 1, X: 2 };
  LPT.ord = function (n) { return n + '.º'; };

  /* ───────── Calendario y resultados ───────── */
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  
  function medallaDe(pos) { return pos === 1 ? 'Oro' : pos === 2 ? 'Plata' : pos === 3 ? 'Bronce' : ''; }
  function plural(n, s, p) { return n + ' ' + (n === 1 ? s : p); }

  /* Estado temporal de una jornada, derivado de OLC.HOY. */
  function estDia(iso) { return iso < OLC.HOY ? 'Pasada' : iso === OLC.HOY ? 'Hoy' : 'Próxima'; }
  function difDias(a, b) { return Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000); }
  function faltan(iso) { var n = difDias(OLC.HOY, iso); return n === 1 ? 'Mañana' : 'Faltan ' + n + ' días'; }
  function badgeDia(iso) {
    var e = estDia(iso);
    return '<span class="lp-tm lp-tm-' + (e === 'Pasada' ? 'p' : e === 'Hoy' ? 'h' : 'n') + '">' + (e === 'Próxima' ? faltan(iso) : e) + '</span>';
  }
  /* Jornada efectiva: la del hash si tiene pruebas; si no, hoy; si no, la más cercana a hoy. */
  function diaInicial(conPruebas, params) {
    if (params.dia && conPruebas.indexOf(params.dia) >= 0) return params.dia;
    if (conPruebas.indexOf(OLC.HOY) >= 0) return OLC.HOY;
    return conPruebas.slice().sort(function (a, b) { return Math.abs(difDias(OLC.HOY, a)) - Math.abs(difDias(OLC.HOY, b)) || (a < b ? -1 : 1); })[0] || '';
  }

  /* Fechas ISO en UTC: sumar días o un mes calendario sin deriva por horario de verano. */
  function sumaDias(iso, n) { var t = new Date(iso + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); }
  function sumaMes(iso, n) {
    var y = +iso.slice(0, 4), m = +iso.slice(5, 7) - 1 + n, d = +iso.slice(8, 10), ult = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    return new Date(Date.UTC(y, m, Math.min(d, ult))).toISOString().slice(0, 10);
  }
  /* Día seleccionado: el del hash si cae dentro del evento; si no, el comportamiento de siempre, acotado al evento. */
  function diaDeEvento(ev, conPruebas, params) {
    if (params.dia && params.dia >= ev.inicio && params.dia <= ev.fin) return params.dia;
    var d = diaInicial(conPruebas, params) || OLC.HOY;
    return d < ev.inicio ? ev.inicio : d > ev.fin ? ev.fin : d;
  }

  function hayResultado(p) { return p.estado !== 'Programado' && (p.tipo === 'match' ? !!(p.match && p.match.marcador) : p.filas.length > 0); }

  /* Fila de combate: A · marcador · B; ganador en negrita y colombiano resaltado. */
  function filaMatch(f) {
    var lado = function (x, k) {
      return '<div class="lp-vs-' + k + (f.ganador === k ? ' lp-vs-w' : '') + '">' + LPT.flag(x.pais, x.paisNombre) + '<span class="lp-vs-n">' + esc(x.nombre) + (f.ganador === k ? '<span class="lp-sr"> (ganador)</span>' : '') + '</span></div>';
    };
    return '<div class="lp-vs' + (f.colombiano ? ' lp-co' : '') + '">' + lado(f.a, 'a') + '<span class="lp-vs-sc">' + esc(f.marcador || 'vs') + '</span>' + lado(f.b, 'b') + '</div>';
  }

  function tabla(p, completa) {
    if (p.tipo === 'match') return OLC.resultadoFilas(p).map(filaMatch).join('');
    var filas = OLC.resultadoFilas(p, completa ? p.filas.length : 3);
    var conMarca = p.tipoMarca !== '-' && p.filas.some(function (f) { return f.marca != null; }), cols = conMarca ? 3 : 2;
    var h = '<table class="lp-tb"><caption class="lp-sr">' + (p.estado === 'En vivo' ? 'Clasificación parcial' : completa ? 'Resultado completo' : 'Mejores puestos') + ' · ' + esc(p.nombre) + ' ' + esc(p.sexoNombre) + '</caption>' +
      '<thead><tr><th scope="col" class="lp-c1">Puesto</th><th scope="col">Deportista</th>' + (conMarca ? '<th scope="col" class="lp-r">Marca</th>' : '') + '</tr></thead><tbody>';
    var prev = null;
    filas.forEach(function (f) {
      if (f.tipo === 'separador') { prev = f; h += '<tr class="lp-sep"><td colspan="' + cols + '"><span aria-hidden="true">···</span><span class="lp-sr">Puestos intermedios omitidos</span></td></tr>'; return; }
      h += '<tr' + (f.colombiano ? ' class="lp-co' + (prev ? ' lp-out' : '') + '"' : '') + '><td class="lp-c1"><span class="lp-pos lp-p' + (f.puesto <= 3 ? f.puesto : '') + '">' + f.puesto + '</span></td>' +
        '<td><div class="lp-dg">' + LPT.flag(f.pais, f.paisNombre) + '<span class="lp-dl">' + esc(f.deportista) + '</span></div></td>' +
        (conMarca ? '<td class="lp-r lp-mk">' + (f.marca != null ? esc(f.marca) : '—') + '</td>' : '') + '</tr>';
    });
    if (p.estado === 'En vivo') h += '<tr class="lp-part"><td colspan="' + cols + '">Resultado parcial · la clasificación puede cambiar hasta el cierre de la prueba</td></tr>';
    return h + '</tbody></table>';
  }

  /* Medalla de Colombia en la fila colapsada: solo el icono, la mejor de los colombianos de la fase. */
  function medallaFase(p) {
    var orden = { Oro: 1, Plata: 2, Bronce: 3 }, m = '';
    p.colombianos.forEach(function (c) { if (orden[c.medalla] && (!m || orden[c.medalla] < orden[m])) m = c.medalla; });
    if (!m) return '';
    var t = 'Medalla de ' + m.toLowerCase() + ' para Colombia';
    return '<span class="lp-mdi lp-mdi-' + m.toLowerCase() + '" role="img" title="' + t + '" aria-label="' + t + '">' + LPT.svg('medal') + '</span>';
  }

  /* Cuerpo de una fase: se arma al expandir (data-lazy) para no pintar miles de tablas en la carga. */
  function cuerpoFase(p, ctx, comentar) {
    var h = tabla(p, false) + '<button type="button" class="lp-lk lp-lk-c" data-ver="' + esc(p.id) + '" aria-haspopup="dialog">Ver resultado completo<span class="lp-sr"> de ' + esc(p.nombre) + ' ' + esc(p.sexoNombre) + '</span></button>';
    if (comentar === p.id) h += '<div class="lp-cmt"><span class="lp-cmt-l">Comentario</span> ' + (p.estado === 'En vivo' ? 'Quedan intentos por disputar. La clasificación puede cambiar hasta el cierre de la prueba.' : 'Resultado homologado por el juez principal de la prueba.') + '</div>';
    return h;
  }

  function subFase(p) { return esc([p.ronda, p.escenario].filter(Boolean).join(' · ')); }

  function filaPrueba(p, ctx, ui, comentar) {
    if (!hayResultado(p)) {
      /* Sin resultado: solo la cabecera (DC-130: sin chip de colombianos). */
      return '<div class="lp-rr lp-rr-pend"><div class="lp-rr-hd"><div class="lp-rr-wt lp-rr-wt-p"><span class="lp-ttl"><b>' + esc(p.nombre) + '</b>' + LPT.sexoTag(p.sexo, p.sexoNombre) + '</span><span class="lp-sub">' + subFase(p) + '</span></div>' +
        '<div class="lp-rr-ac">' + LPT.estadoBadge(p.estado, true) + '</div></div></div>';
    }
    var abierta = p.id in ui.p ? ui.p[p.id] : (p.estado === 'En vivo' || p.participa);
    return '<div class="lp-rr"><div class="lp-rr-hd">' +
      '<button type="button" class="lp-tgb" data-p="' + esc(p.id) + '" aria-expanded="' + abierta + '" aria-controls="lp-b-' + esc(p.id) + '">' +
      '<span class="lp-rr-wt"><span class="lp-ttl"><b>' + esc(p.nombre) + '</b>' + LPT.sexoTag(p.sexo, p.sexoNombre) + '</span><span class="lp-sub">' + subFase(p) + '</span></span>' +
      '<span class="lp-rr-ac">' + medallaFase(p) + LPT.estadoBadge(p.estado, true) + '</span>' + LPT.svg('chev', 'lp-chev lp-chev-s') + '</button></div>' +
      '<div class="lp-rs" id="lp-b-' + esc(p.id) + '"' + (abierta ? '>' + cuerpoFase(p, ctx, comentar) : ' hidden data-lazy="' + esc(p.id) + '">') + '</div></div>';
  }

  /* Tira horizontal de jornadas: un cuadrado por día con competencias, agrupado por mes. */
  function miniCal(data, ctx, dia, ui, porDia) {
    var meses = [], todos = [], MES3 = MESES.map(function (m) { return m.slice(0, 3); }), SEM3 = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'], ev = data.evento;
    /* Días completos: 1 mes antes del inicio a 1 mes después del fin; solo [inicio, fin] son seleccionables. */
    for (var cur = sumaMes(ev.inicio, -1), tope = sumaMes(ev.fin, 1); cur <= tope; cur = sumaDias(cur, 1)) {
      todos.push(cur); var k0 = cur.slice(0, 7); if (meses.indexOf(k0) < 0) meses.push(k0);
    }
    var ant = dia > ev.inicio ? sumaDias(dia, -1) : '', sig = dia < ev.fin ? sumaDias(dia, 1) : '';
    var nav = function (dir, iso, ic, lab) { return '<button type="button" class="lp-ibtn lp-strip-nav" data-strip-nav="' + dir + '" data-dia-nav="' + (iso || '') + '" aria-label="' + lab + '"' + (iso ? '' : ' disabled') + '>' + LPT.svg(ic) + '</button>'; };
    var h = '<div class="lp-mini"><div class="lp-stripw">' + nav('prev', ant, 'left', 'Días anteriores') + '<div class="lp-strip">' + meses.map(function (k) {
      var mo = +k.slice(5, 7) - 1;
      return '<div class="lp-strip-m" role="group" aria-label="Jornadas de ' + MESES[mo] + '"><div class="lp-strip-d">' + todos.filter(function (d) { return d.slice(0, 7) === k; }).map(function (iso) {
        var dt = new Date(iso + 'T12:00:00'), info = porDia[iso], sel = iso === dia, cd = data.colombia.participa && OLC.colombiaDia(data, iso), co = !!(cd && cd.compite);
        if (iso < ev.inicio || iso > ev.fin) return '<span class="lp-dd off" aria-hidden="true"><span class="lp-dd-m">' + MES3[dt.getMonth()] + '</span><span class="lp-dd-w">' + SEM3[dt.getDay()] + '</span><span class="lp-dd-n">' + dt.getDate() + '</span></span>';
        var e = estDia(iso), c = e === 'Pasada' ? 'past' : e === 'Hoy' ? 'today' : 'fut';
        var bd = co ? OLC.bandera('CO', 40) : null; /* DC-143/144: banda con bandera en la esquina; sin dots */
        var dot = co ? '<span class="lp-dd-band" aria-hidden="true">' + (bd ? '<img src="' + esc(bd.src) + '" srcset="' + esc(bd.srcset) + '" alt="" onerror="this.remove()">' : '') + '</span>' : '';
        var lab = dt.getDate() + ' de ' + MESES[mo] + ', ' + e.toLowerCase() + (info && info.live ? ', en vivo' : '') + ', ' + (info ? plural(info.n, 'competencia', 'competencias') : 'sin competencias') + (co ? ', participan colombianos esta fecha' : '') + (sel ? ', seleccionado' : '');
        return '<button type="button" class="lp-dd ' + ((info || co) ? 'has ' : '') + c + (info && info.live ? ' live' : '') + (co ? ' co' : '') + (sel ? ' sel' : '') + '" data-dia="' + iso + '" aria-pressed="' + sel + '" aria-label="' + lab + '"><span class="lp-dd-m" aria-hidden="true">' + MES3[dt.getMonth()] + '</span><span class="lp-dd-w" aria-hidden="true">' + SEM3[dt.getDay()] + '</span><span class="lp-dd-n" aria-hidden="true">' + dt.getDate() + '</span>' + dot + '</button>';
      }).join('') + '</div></div>';
    }).join('') + '</div>' + nav('next', sig, 'right', 'Días siguientes') + '</div>';
    return h + '</div>';
  }

  function selectField(id, label, val, opts, todos) {
    if (opts.length < 2) return '';
    var h = '<div class="lp-fld"><label for="' + id + '">' + label + '</label><div class="lp-sel"><select id="' + id + '"><option value="">' + todos + '</option>';
    opts.forEach(function (o) { h += '<option value="' + esc(o[0]) + '"' + (o[0] === val ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; });
    return h + '</select>' + LPT.svg('chev') + '</div></div>';
  }

  /* Encabezado de la prueba, común al detalle y al modal (DC-200); idT solo en el modal. */
  function encabezado(p, idT) {
    return '<div class="lp-rr-hd"><div class="lp-rr-wt"><span class="lp-ttl"' + (idT ? ' id="' + idT + '"' : '') + '><b>' + esc(p.nombre) + '</b>' + LPT.sexoTag(p.sexo, p.sexoNombre) + '</span>' +
      '<span class="lp-sub">' + esc(p.deporteNombre) + ' · ' + subFase(p) + ' · ' + esc(OLC.fechaLarga(p.fecha)) + '</span></div><div class="lp-rr-ac">' + LPT.estadoBadge(p.estado) + '</div></div>';
  }

  function detalle(el, ctx, p, modal) {
    var res = hayResultado(p) ? '<div class="lp-rs">' + tabla(p, true) + '</div>' : '<div class="lp-empty"><p>Esta prueba aún no tiene resultados. Se publicarán el ' + esc(OLC.fechaLarga(p.fecha)) + '.</p></div>';
    if (modal) {
      el.innerHTML = '<div class="lp-tab lp-cal lp-mdl-in"><div class="lp-mdl-hd">' + encabezado(p, 'lp-mdl-t') +
        '<button type="button" class="lp-mdl-x" data-x aria-label="Cerrar resultado completo">' + LPT.svg('x') + '</button></div><div class="lp-mdl-bd" tabindex="0">' + res + '</div></div>';
      return;
    }
    el.innerHTML = '<div class="lp-tab lp-cal"><a class="lp-back" href="' + esc(ctx.href({ prueba: '' })) + '">' + LPT.svg('left') + 'Volver al calendario</a>' +
      '<div class="lp-rr lp-rr-solo">' + encabezado(p) + res + '</div></div>';
  }

  /* DC-200: modal 99vh con el detalle; no cambia la vista, el hash ni el scroll de fondo. */
  var modalAct = null;
  function abrirModal(ctx, p, opener, limpiaUrl) {
    if (modalAct) modalAct.cerrar(false);
    var dlg = document.createElement('dialog'), de = document.documentElement, pad = document.body.style.paddingRight;
    dlg.className = 'lp-mdl'; dlg.setAttribute('aria-modal', 'true'); dlg.setAttribute('aria-labelledby', 'lp-mdl-t');
    detalle(dlg, ctx, p, true);
    document.body.appendChild(dlg);
    var sb = window.innerWidth - de.clientWidth;
    de.style.overflow = 'hidden'; if (sb > 0) document.body.style.paddingRight = sb + 'px';
    var hecho = false;
    function cerrar(foco) {
      if (hecho) return; hecho = true; modalAct = null;
      window.removeEventListener('hashchange', alHash);
      de.style.overflow = ''; document.body.style.paddingRight = pad;
      if (dlg.open) dlg.close();
      dlg.remove();
      if (limpiaUrl && ctx.params.prueba) history.replaceState(null, '', ctx.href({ prueba: '' }));
      if (foco !== false && opener && opener.isConnected) opener.focus({ preventScroll: true });
    }
    function alHash() { cerrar(false); }
    window.addEventListener('hashchange', alHash);
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); cerrar(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.closest('[data-x]')) cerrar(); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = Array.prototype.slice.call(dlg.querySelectorAll('button,[href],[tabindex="0"]')), a = document.activeElement;
      if (e.shiftKey && a === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && a === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
    dlg.showModal();
    dlg.querySelector('[data-x]').focus({ preventScroll: true });
    modalAct = { cerrar: cerrar };
  }

  /* Grupos por deporte de un día; el estado abierto/cerrado vive en ui.g (clave día|deporte). */
  function gruposDe(data, iso, rows, ui) {
    return data.deportes.map(function (d) { return { d: d, rows: rows.filter(function (p) { return p.deporte === d.codigo; }) }; }).filter(function (g) { return g.rows.length; }).map(function (g) {
      g.rows.sort(function (a, b) { return a.nombre.localeCompare(b.nombre, 'es', { numeric: true }) || LPT.ordSexo[a.sexo] - LPT.ordSexo[b.sexo]; });
      g.iso = iso; g.key = iso + '|' + g.d.codigo; g.id = 'lp-g-' + iso + '-' + g.d.codigo;
      g.open = g.key in ui.g ? ui.g[g.key] : g.rows.some(function (p) { return p.estado === 'En vivo' || p.participa; });
      return g;
    });
  }

  var IC_ALL = { exp: 'M5 4.5l5 4 5-4M5 11.5l5 4 5-4', con: 'M5 8.5l5-4 5 4M5 15.5l5-4 5 4', mas: 'M4.5 10h.01M10 10h.01M15.5 10h.01' };
  Object.keys(IC_ALL).forEach(function (k) { IC_ALL[k] = '<svg class="lp-i" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false"><path d="' + IC_ALL[k] + '" fill="none" stroke="currentColor" stroke-width="' + (k === 'mas' ? 3 : 2) + '" stroke-linecap="round" stroke-linejoin="round"/></svg>'; });

  function grupoHtml(g, ctx, ui, tag, comentar) {
    var cnt = { Finalizado: 0, 'En vivo': 0, Programado: 0 };
    g.rows.forEach(function (p) { cnt[p.estado]++; });
    var sm = ['<span class="lp-tag">' + plural(g.rows.length, 'prueba', 'pruebas') + '</span>'];
    if (cnt.Finalizado) sm.push('<span class="lp-tag lp-tag-d">' + plural(cnt.Finalizado, 'finalizada', 'finalizadas') + '</span>');
    if (cnt['En vivo']) sm.push('<span class="lp-tag lp-tag-l">' + cnt['En vivo'] + ' en vivo</span>');
    return '<div class="lp-grp"><' + tag + ' class="lp-gh"><button type="button" class="lp-gb" data-g="' + esc(g.key) + '" aria-expanded="' + g.open + '" aria-controls="' + g.id + '">' + LPT.svg('chev', 'lp-chev') +
      '<span class="lp-gi">' + LPT.sportIcon(g.d.codigo) + '</span><span class="lp-gn"><b>' + esc(g.d.nombre) + '</b><span class="lp-gc2">' + esc(g.d.escenario) + '</span></span>' +
      '<span class="lp-gs">' + sm.join('') + '</span></button></' + tag + '>' +
      '<div class="lp-gbody" id="' + g.id + '"' + (g.open ? '' : ' hidden') + '>' + g.rows.map(function (p) { return filaPrueba(p, ctx, ui, comentar); }).join('') + '</div></div>';
  }

  window.Tabs = window.Tabs || {};
  window.Tabs['calendario-resultados'] = {
    render: function (el, ctx) {
      var data = ctx.data, pr = ctx.params;
      var ui = ctx.ui.cal = ctx.ui.cal || {};
      ui.g = ui.g || {}; ui.p = ui.p || {}; ui.d = ui.d || {}; ui.prueba = ui.prueba || ''; ui.ronda = ui.ronda || ''; ui.mes = ui.mes || '';
      /* URL prueba=<id>: el calendario queda de fondo, en la jornada de la prueba, y el modal se abre una vez por URL. */
      var one = pr.prueba && data.pruebas.filter(function (p) { return p.id === pr.prueba; })[0];
      if (one && !pr.dia) { pr = {}; Object.keys(ctx.params).forEach(function (k) { pr[k] = ctx.params[k]; }); pr.dia = one.fecha; }
      var ex = LPT.sexosDe(data);
      var sexo = ex.length > 1 && ex.indexOf(pr.sexo) >= 0 ? pr.sexo : '';
      var hayCol = data.colombia.participa > 0;
      var solo = hayCol && pr.colombia !== '0';
      var depSel = data.deportes.some(function (d) { return d.codigo === pr.deporte; }) ? pr.deporte : '';

      /* opciones de selects: solo las que existen (acotadas por deporte); un select con una única opción no se pinta */
      var enDep = data.pruebas.filter(function (p) { return !depSel || p.deporte === depSel; });
      var nombres = [], rondas = [];
      enDep.forEach(function (p) { if (nombres.indexOf(p.nombre) < 0) nombres.push(p.nombre); if (rondas.indexOf(p.ronda) < 0) rondas.push(p.ronda); });
      nombres.sort(function (a, b) { return a.localeCompare(b, 'es', { numeric: true }); });
      if (nombres.length < 2 || nombres.indexOf(ui.prueba) < 0) ui.prueba = '';
      if (rondas.length < 2 || rondas.indexOf(ui.ronda) < 0) ui.ronda = '';

      var base = data.pruebas.filter(function (p) {
        return (!sexo || p.sexo === sexo) && (!solo || p.participa) &&
          (!depSel || p.deporte === depSel) && (!ui.prueba || p.nombre === ui.prueba) && (!ui.ronda || p.ronda === ui.ronda);
      });
      var filtrando = !!(sexo || solo || depSel || ui.prueba || ui.ronda);
      var porDia = {};
      base.forEach(function (p) { var o = porDia[p.fecha] = porDia[p.fecha] || { n: 0, live: 0 }; o.n++; if (p.estado === 'En vivo') o.live++; });
      var diasCon = data.dias.filter(function (d) { return porDia[d]; });
      var dia = diaDeEvento(data.evento, diasCon, pr);
      var delDia = base.filter(function (p) { return p.fecha === dia; });
      var totalDia = data.pruebas.filter(function (p) { return p.fecha === dia; }).length;

      if (!data.pruebas.length) {
        el.innerHTML = '<div class="lp-tab lp-cal"><div class="lp-empty"><p>Este evento aún no tiene pruebas publicadas.</p></div></div>';
        return;
      }

      /* DC-123: el interruptor abre la caja de filtros, antes de Deporte. */
      var sw = !hayCol ? '' : '<div class="lp-tg"><div class="lp-tg-r"><span class="lp-tg-l" id="lp-tg-l"><span>Solo pruebas</span> <span>con Colombianos</span></span><button type="button" class="lp-tg-sw" role="switch" aria-checked="' + solo + '" aria-labelledby="lp-tg-l" data-colombia></button></div></div>';
      var fl = sw + selectField('lp-f-dep', 'Deporte', depSel, data.deportes.map(function (d) { return [d.codigo, d.nombre]; }), 'Todos los deportes') +
        selectField('lp-f-pru', 'Prueba', ui.prueba, nombres.map(function (n) { return [n, n]; }), 'Todas las pruebas') +
        selectField('lp-f-sex', 'Género', sexo, LPT.sexosDe(data).map(function (k) { return [k, LPT.SEXOS.filter(function (o) { return o[0] === k; })[0][1]]; }), 'Todos') +
        selectField('lp-f-ron', 'Ronda', ui.ronda, rondas.map(function (n) { return [n, n]; }), 'Todas las rondas');
      var h = '<div class="lp-tab lp-cal">' + miniCal(data, ctx, dia, ui, porDia) + '<div class="lp-cr"><aside class="lp-aside" aria-label="Filtros">' +
        (fl ? '<div class="lp-fl">' + fl + '</div>' : '') + '</aside><section class="lp-day" aria-labelledby="lp-h-dia">';

      if (!base.length) {
        h += '<h2 class="lp-sr" id="lp-h-dia">Calendario y resultados</h2><div class="lp-empty"><p>Ninguna prueba coincide con los filtros.</p>' + (solo ? '<button type="button" class="lp-btn" data-col-todas>Mostrar todas las pruebas</button>' : '') + '<button type="button" class="lp-btn" data-limpiar>Limpiar filtros</button></div>';
      } else {
        var titulo = OLC.fechaLarga(dia);
        var tit = '<div class="lp-day-t"><h2 id="lp-h-dia">' + esc(titulo) + '</h2>' + badgeDia(dia) + '</div>';
        h += '<div class="lp-day-hd">' + tit + '<div class="lp-day-r">' +
          '<div class="lp-all"><button type="button" class="lp-all-b" id="lp-all-b" aria-haspopup="menu" aria-expanded="false" aria-controls="lp-all-m" aria-label="Más acciones" title="Más acciones">' + IC_ALL.mas + '</button>' +
          '<div class="lp-all-m" id="lp-all-m" role="menu" aria-label="Pruebas de la jornada" hidden><button type="button" role="menuitem" data-all="1">' + IC_ALL.exp + '<span>Expandir todo</span></button><button type="button" role="menuitem" data-all="0">' + IC_ALL.con + '<span>Contraer todo</span></button></div></div></div></div>';
        var comentar = (delDia.filter(function (p) { return p.estado === 'En vivo' && hayResultado(p); })[0] || delDia.filter(function (p) { return p.estado === 'Finalizado' && hayResultado(p); })[0] || {}).id;
        if (!delDia.length) {
          h += '<div class="lp-empty"><p>No hay competencias' + (solo ? ' con Colombia' : '') + ' este día.</p></div>';
        }
        h += gruposDe(data, dia, delDia, ui).map(function (g) { return grupoHtml(g, ctx, ui, 'h3', comentar); }).join('');
      }
      h += '</section></div></div>';
      el.innerHTML = h;
      LPT.bindBarra(el, ctx);

      /* eventos */
      var redraw = function (focusId) {
        window.Tabs['calendario-resultados'].render(el, ctx);
        var f = focusId && el.querySelector('#' + focusId); if (f) f.focus();
      };
      el.querySelectorAll('[data-dia]').forEach(function (b) {
        b.addEventListener('click', function () {
          var iso = b.getAttribute('data-dia');
          ui.foco = { dia: iso };
          ctx.go({ dia: iso });
        });
      });
      /* DC-172: tooltip fijo (la tira recorta el overflow) al hover/foco del día con Colombia. */
      var tip = document.getElementById('lp-dd-tip');
      if (!tip) { tip = document.createElement('div'); tip.id = 'lp-dd-tip'; tip.className = 'lp-dd-tip'; tip.setAttribute('role', 'tooltip'); tip.hidden = true; tip.textContent = 'Participan Colombianos esta fecha'; document.body.appendChild(tip); }
      var oculta = function () { tip.hidden = true; };
      var muestra = function (b) {
        tip.hidden = false; var r = b.getBoundingClientRect(), w = tip.offsetWidth;
        tip.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px';
        tip.style.top = Math.max(8, r.top - tip.offsetHeight - 8) + 'px';
      };
      oculta();
      /* DC-187: tooltip solo sobre la bandera; con teclado, al foco visible del día. */
      el.querySelectorAll('.lp-dd.co').forEach(function (b) {
        var ban = b.querySelector('.lp-dd-band'); if (!ban) return;
        ban.addEventListener('mouseenter', function () { muestra(ban); });
        ban.addEventListener('mouseleave', oculta);
        b.addEventListener('focus', function () { if (b.matches(':focus-visible')) muestra(ban); });
        b.addEventListener('blur', oculta);
      });
      var tr = el.querySelector('.lp-strip'); if (tr) tr.addEventListener('scroll', oculta);
      /* Flechas: saltan al día anterior/siguiente con competencias (la tira lo recentra al redibujar). */
      el.querySelectorAll('[data-strip-nav]').forEach(function (b) {
        b.addEventListener('click', function () {
          var iso = b.getAttribute('data-dia-nav'); if (!iso) return;
          ui.foco = { dia: iso, nav: b.getAttribute('data-strip-nav') };
          ctx.go({ dia: iso });
        });
      });
      /* Día seleccionado siempre centrado en la tira (sin mover la página en vertical). */
      var tira = el.querySelector('.lp-strip'), cen = tira && tira.querySelector('.lp-dd.sel');
      if (cen) tira.scrollLeft += (cen.getBoundingClientRect().left + cen.offsetWidth / 2) - (tira.getBoundingClientRect().left + tira.clientWidth / 2);
      el.querySelectorAll('[data-mes]').forEach(function (b) {
        b.addEventListener('click', function () { var m = b.getAttribute('data-mes'); if (m) { ui.mes = m; redraw(); } });
      });
      var dep = el.querySelector('#lp-f-dep'), pru = el.querySelector('#lp-f-pru'), ron = el.querySelector('#lp-f-ron');
      if (dep) dep.addEventListener('change', function () { ui.prueba = ''; ctx.go({ deporte: dep.value }); });
      if (pru) pru.addEventListener('change', function () { ui.prueba = pru.value; redraw('lp-f-pru'); });
      if (ron) ron.addEventListener('change', function () { ui.ronda = ron.value; redraw('lp-f-ron'); });
      var sex = el.querySelector('#lp-f-sex');
      if (sex) sex.addEventListener('change', function () { ctx.go({ sexo: sex.value }); });
      var lim = el.querySelector('[data-limpiar]');
      if (lim) lim.addEventListener('click', function () { ui.prueba = ''; ui.ronda = ''; ctx.go({ sexo: '', colombia: '0', deporte: '' }); });

      /* getElementById: los ids de fase traen puntos y no sirven como selector CSS. */
      /* Cuerpos perezosos: el día y la fase se pintan al abrirse por primera vez. */
      var porId = null;
      function llenar(b) {
        if (b.hasAttribute('data-lazy')) {
          if (!porId) { porId = {}; data.pruebas.forEach(function (p) { porId[p.id] = p; }); }
          var p = porId[b.getAttribute('data-lazy')]; b.removeAttribute('data-lazy'); if (p) b.innerHTML = cuerpoFase(p, ctx, comentar);
        }
      }
      function setG(btn, open) {
        btn.setAttribute('aria-expanded', open);
        var b = document.getElementById(btn.getAttribute('aria-controls')); if (b) { b.hidden = !open; if (open) llenar(b); }
      }
      function setP(btn, open) {
        btn.setAttribute('aria-expanded', open);
        var id = btn.getAttribute('data-p'), b = document.getElementById(btn.getAttribute('aria-controls'));
        if (b) { b.hidden = !open; if (open) llenar(b); }
        ui.p[id] = open;
      }
      /* Un solo oyente por jornada (los cuerpos perezosos nacen después de enlazar). */
      el.querySelector('.lp-day').addEventListener('click', function (e) {
        var v = e.target.closest('[data-ver]');
        if (v) { var pv = data.pruebas.filter(function (p) { return p.id === v.getAttribute('data-ver'); })[0]; if (pv) abrirModal(ctx, pv, v, false); return; }
        var b = e.target.closest('[data-g],[data-p]'); if (!b) return;
        var o = b.getAttribute('aria-expanded') !== 'true';
        if (b.hasAttribute('data-g')) { ui.g[b.getAttribute('data-g')] = o; setG(b, o); }
        else setP(b, o);
      });
      var mb = el.querySelector('#lp-all-b'), mm = el.querySelector('#lp-all-m');
      function mItems() { return Array.prototype.slice.call(mm.querySelectorAll('[role=menuitem]')); }
      function mPos() {
        var r = mb.getBoundingClientRect(), w = mm.offsetWidth, vw = document.documentElement.clientWidth;
        mm.style.top = Math.min(r.bottom + 6, window.innerHeight - mm.offsetHeight - 8) + 'px';
        mm.style.left = Math.max(8, Math.min(r.right - w, vw - w - 8)) + 'px';
      }
      function mCerrar(foco) {
        if (!mm || mm.hidden) return;
        mm.hidden = true; mb.setAttribute('aria-expanded', 'false');
        document.removeEventListener('mousedown', mFuera, true); document.removeEventListener('keydown', mTecla, true);
        window.removeEventListener('resize', mPos); window.removeEventListener('scroll', mPos, true);
        if (foco === true) mb.focus();
      }
      function mFuera(e) { if (!el.contains(mb)) return mCerrar(); if (!mm.contains(e.target) && !mb.contains(e.target)) mCerrar(); }
      function mTecla(e) {
        if (!el.contains(mb)) return mCerrar();
        var it = mItems(), i = it.indexOf(document.activeElement);
        if (e.key === 'Escape') { e.preventDefault(); mCerrar(true); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); it[(i + 1) % it.length].focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); it[(i <= 0 ? it.length : i) - 1].focus(); }
        else if (e.key === 'Home') { e.preventDefault(); it[0].focus(); }
        else if (e.key === 'End') { e.preventDefault(); it[it.length - 1].focus(); }
        else if (e.key === 'Tab') mCerrar();
      }
      function mAbrir(foco) {
        mm.hidden = false; mb.setAttribute('aria-expanded', 'true'); mPos();
        document.addEventListener('mousedown', mFuera, true); document.addEventListener('keydown', mTecla, true);
        window.addEventListener('resize', mPos); window.addEventListener('scroll', mPos, true);
        if (foco) mItems()[foco === 'ultimo' ? mItems().length - 1 : 0].focus();
      }
      if (mb && mm) {
        mb.addEventListener('click', function () { if (mm.hidden) mAbrir(); else mCerrar(true); });
        mb.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (mm.hidden) mAbrir(e.key === 'ArrowUp' ? 'ultimo' : 'primero'); }
        });
      }
      el.querySelectorAll('[data-all]').forEach(function (b) {
        b.addEventListener('click', function () {
          var o = b.getAttribute('data-all') === '1';
          el.querySelectorAll('[data-g]').forEach(function (g) { ui.g[g.getAttribute('data-g')] = o; setG(g, o); });
          el.querySelectorAll('[data-p]').forEach(function (p) { setP(p, o); });
          mCerrar(true);
        });
      });

      if (one && ui.modalCtx !== ctx) { ui.modalCtx = ctx; abrirModal(ctx, one, null, true); }

      /* Foco tras elegir un día; diferido porque el shell restaura el scroll después. */
      if (ui.foco) {
        var fo = ui.foco; ui.foco = null;
        setTimeout(function () {
          /* con flechas el foco se queda en la flecha; si quedó deshabilitada, pasa al día */
          var nb = fo.nav && el.querySelector('[data-strip-nav="' + fo.nav + '"]:not(:disabled)');
          var db = nb || el.querySelector('[data-dia="' + fo.dia + '"]'); if (db) db.focus({ preventScroll: true });
        }, 0);
      }
    }
  };
})();
