/* Pestaña Medallería (plataforma), según el mockup DEP-453 del equipo de datos; todo sale de OLC.datosDe. */
(function () {
  var N = window.NWS, esc = N.esc, nf = N.num;
  window.Tabs = window.Tabs || {};
  var RL = window.MED_ROLES || null; /* solo lo define roles.html */

  var VISTA_DEP = 7, VISTA_GEN = 7;
  var SEXO = { F: 'Mujeres', M: 'Hombres', X: 'Mixtas', U: 'Sin género' };
  var NA = 'Sin datos disponibles';

  function dotMed(k) { return OLC.medalla({ oro: 'gold', plata: 'silver', bronce: 'bronze' }[k], 'none', 18); }
  /* Puesto: medalla con número para 1.º–3.º; el resto, número simple */
  function rk(n) { return n <= 3 ? '<span class="nwtab-md-rkm">' + OLC.medalla(['gold', 'silver', 'bronze'][n - 1], n, 34) + '</span>' : '<span class="nwtab-md-rk is-plain">' + n + '</span>'; }
  /* Total: oro, plata y bronce en línea, solapadas la mitad de su ancho */
  function totalH() { return '<span class="nwtab-mh"><span class="nwtab-tri" aria-hidden="true">' + ['oro', 'plata', 'bronce'].map(function (k) { return '<span>' + dotMed(k) + '</span>'; }).join('') + '</span><span class="nwtab-md-th">Total</span></span>'; }
  function sx(k, t) { return '<span class="nwtab-mh">' + N.sexIco(k) + '<span class="nwtab-md-th">' + t + '</span></span>'; }
  function pct(a, b) { if (!b) return '0'; var s = (a / b * 100).toFixed(1).replace('.', ','); return s.replace(/,0$/, ''); }
  function ordDe(n) { return n + '.º'; }
  function ico(c) { return window.OLC && OLC.iconoDeporte ? OLC.iconoDeporte(c, '', 18) : ''; }
  function plural(n, s, p) { return n + ' ' + (n === 1 ? s : p); }

  /* Un solo recorrido: medallas por país/deporte (vía data.medallero, la misma regla que el resto de la plataforma). */
  function calcular(data) {
    var gen = data.medallero();
    var co = gen.filter(function (r) { return r.pais === 'CO'; })[0] || null;
    var oroEv = 0, totEv = 0;
    gen.forEach(function (r) { oroEv += r.oro; totEv += r.total; });

    var deps = [];
    data.deportes.forEach(function (d) {
      var m = data.medallero(d.codigo);
      if (!m.length) return;
      var mine = m.filter(function (r) { return r.pais === 'CO'; })[0] || null, oros = 0;
      m.forEach(function (r) { oros += r.oro; });
      deps.push({ code: d.codigo, nombre: d.nombre, m: m, co: mine, oros: oros });
    });

    /* Cerca del podio: una final por prueba que reparte medalla y donde Colombia llegó al top 8 (gana > 4.º > 5.º–8.º). */
    var cerca = {};
    data.pruebas.forEach(function (p) {
      if (p.estado !== 'Finalizado') return;
      var colMed = (p.colombianos || []).some(function (c) { return c.medalla; });
      if (!colMed && !p.filas.some(function (f) { return f.medalla; })) return;
      var gano = colMed || p.filas.some(function (f) { return f.pais === 'CO' && f.medalla; }), mejor = 99;
      if (!gano) p.filas.forEach(function (f) { if (f.pais === 'CO' && f.puesto >= 4 && f.puesto <= 8 && f.puesto < mejor) mejor = f.puesto; });
      if (!gano && mejor === 99) return;
      var c = cerca[p.deporte] || (cerca[p.deporte] = { code: p.deporte, nombre: p.deporteNombre, g: 0, c4: 0, c58: 0 });
      if (gano) c.g++; else if (mejor === 4) c.c4++; else c.c58++;
    });
    var cercaL = Object.keys(cerca).map(function (k) { return cerca[k]; }).map(function (c) {
      c.t = c.g + c.c4 + c.c58; c.ef = Math.round(c.g / c.t * 100); return c;
    }).sort(function (a, b) { return b.ef - a.ef || b.t - a.t || a.nombre.localeCompare(b.nombre); });

    /* Medallas de Colombia por sexo de la prueba (misma regla que medallero, incl. colombianos sin fila). */
    var gDep = {}, gTot = { F: 0, M: 0, X: 0, U: 0 };
    function suma(p, k) {
      var sx = SEXO[p.sexo] && p.sexo !== 'U' ? p.sexo : 'U';
      var g = gDep[p.deporte] || (gDep[p.deporte] = { nombre: p.deporteNombre, F: 0, M: 0, X: 0, U: 0 });
      g[sx]++; gTot[sx]++;
    }
    data.pruebas.forEach(function (p) {
      if (p.estado !== 'Finalizado') return;
      p.filas.forEach(function (f) { if (f.medalla && f.pais === 'CO') suma(p); });
      (p.colombianos || []).forEach(function (c) {
        if (!c.medalla || p.filas.some(function (f) { return f.deportista === c.deportista && f.medalla; })) return;
        suma(p);
      });
    });
    /* Detalle de Colombia por deporte: quién ganó qué, en qué prueba y de qué género (incluye lo registrado a mano). */
    var detDep = {};
    function addDet(dep, x) { (detDep[dep] = detDep[dep] || []).push(x); }
    data.pruebas.forEach(function (p) {
      if (p.estado !== 'Finalizado') return;
      var vistos = {};
      p.filas.forEach(function (f) { if (f.medalla && f.pais === 'CO') { vistos[f.deportista] = 1; addDet(p.deporte, { n: f.deportista, m: String(f.medalla).toLowerCase(), p: p.nombre, s: p.sexo }); } });
      (p.colombianos || []).forEach(function (c) { if (c.medalla && !vistos[c.deportista]) addDet(p.deporte, { n: c.deportista, m: String(c.medalla).toLowerCase(), p: p.nombre, s: p.sexo }); });
    });
    OLC.capturadas(data.evento.code).forEach(function (x) { if (x.pais === 'CO') addDet(x.deporte, { n: x.deportista, m: x.metal, p: x.pruebaNombre || x.prueba, s: x.sexo }); });
    var ORD = { oro: 0, plata: 1, bronce: 2 };
    Object.keys(detDep).forEach(function (k) { detDep[k].sort(function (a, b) { return ORD[a.m] - ORD[b.m] || a.n.localeCompare(b.n); }); });
    var gRows = Object.keys(gDep).map(function (k) { var g = gDep[k]; g.t = g.F + g.M + g.X + g.U; return g; })
      .sort(function (a, b) { return b.t - a.t || a.nombre.localeCompare(b.nombre); });

    /* DC-071: el medallero completo lista TODOS los países que participan; los sin medalla van al final con 0, en puesto compartido. */
    var conMed = {}; gen.forEach(function (r) { conMed[r.pais] = 1; });
    var sinMed = (data.paises || []).filter(function (x) { return !conMed[x.pais]; })
      .sort(function (a, b) { return a.paisNombre.localeCompare(b.paisNombre); })
      .map(function (x) { return { pais: x.pais, paisNombre: x.paisNombre, oro: 0, plata: 0, bronce: 0, total: 0, pos: gen.length + 1 }; });
    var todos = gen.concat(sinMed);
    /* DC-077: dato de ejemplo. Inscripciones por género de la pestaña Inscripciones; si no hay, una proporción fija de las medallas. */
    var insG = null;
    try { var ci = window.Tabs && Tabs.inscripciones && Tabs.inscripciones.calc ? Tabs.inscripciones.calc(data) : null; insG = ci && ci.tot ? { F: ci.tot.F || 0, M: ci.tot.M || 0, X: ci.tot.X || 0 } : null; } catch (e) { insG = null; }
    if (!insG || !(insG.F + insG.M + insG.X)) insG = { F: gTot.F * 9 + 6, M: gTot.M * 9 + 6, X: gTot.X * 4 + 2 };
    return { insG: insG, gen: gen, todos: todos, co: co, oroEv: oroEv, totEv: totEv, deps: deps, cerca: cercaL, gRows: gRows, gTot: gTot, detDep: detDep };
  }

  /* Rival según el puesto de Colombia: el líder, salvo que Colombia lo sea o ya sea el de arriba. */
  function opcionesRival(M) {
    var i = M.gen.map(function (r) { return r.pais; }).indexOf('CO'), out = [], vistos = { CO: 1 };
    function add(r, tag) { if (r && !vistos[r.pais]) { vistos[r.pais] = 1; out.push({ iso: r.pais, nombre: r.paisNombre, tag: tag, pos: M.gen.indexOf(r) + 1 }); } }
    if (i === 1) add(M.gen[0], 'Puesto de arriba · Líder');
    else { if (i > 1) add(M.gen[i - 1], 'Puesto de arriba'); add(M.gen[0], 'Líder'); }
    if (i >= 0 && i < M.gen.length - 1) add(M.gen[i + 1], 'Puesto de abajo');
    if (!out.length) add(M.gen[1], 'Siguiente');
    return out;
  }

  function kpi(tone, ico, valor, etiqueta, hint) {
    return '<article class="nwtab-md-kpi"><header class="nwtab-md-kpi__h"><span class="nwtab-md-kpi__i nwtab-md-kpi__i--' + tone + '">' + N.ico(ico) + '</span>' +
      '<small class="nwtab-md-kpi__hint">' + hint + '</small></header><strong class="nwtab-md-kpi__v">' + valor + '</strong><span class="nwtab-md-kpi__l">' + etiqueta + '</span></article>';
  }

  /* DC-108: el ⓘ es el mismo icon button de Inscripciones (NWIN.info); si esa pestaña no cargó, queda el tooltip propio. */
  function infoBtn(texto, id) {
    if (window.NWIN && NWIN.info) { if (NWIN.cerrarInfo) NWIN.cerrarInfo(); return NWIN.info([esc(texto)], 'Qué mide esta card'); }
    return infoTip(id, texto);
  }

  function head(titulo, sub, extra, id) {
    /* DC-084: el subtítulo de cada card va en un tooltip (icono 'i') arriba a la derecha. */
    return '<div class="nwtab-md-card__h' + (sub ? ' has-info' : '') + '"><div class="nwtab-md-card__hd"><h3 class="nwtab-md-card__t"' + (id ? ' id="' + id + '"' : '') + '>' + titulo + '</h3></div>' + (extra || '') +
      (sub ? infoBtn(sub.replace(/<[^>]+>/g, '').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'), (id || 'md-x') + '-i') : '') + '</div>';
  }

  function leyenda(items) {
    return '<ul class="nwtab-md-leg">' + items.map(function (it) { return '<li>' + (it[2] ? '<span class="nwtab-md-lgm" aria-hidden="true">' + dotMed(it[2]) + '</span>' : '<i class="nwtab-md-dot" style="background:' + it[1] + '" aria-hidden="true"></i>') + it[0] + '</li>'; }).join('') + '</ul>';
  }

  function nombrePais(iso, nombre, own) {
    return '<span class="nwtab-dg">' + N.cc(iso, nombre) + '<span class="nwtab-dn">' + esc(nombre) + '</span>' + (own ? '<span class="nwtab-cot">Tu país</span>' : '') + '</span>';
  }

  /* 1. Medallero por país: barras apiladas oro/plata/bronce, con texto equivalente para lectores de pantalla. */
  function secPais(M, resumen) {
    var max = M.gen.reduce(function (a, r) { return Math.max(a, r.total); }, 1), gen = M.gen;
    /* Resumen: los 5 primeros y Colombia; el detalle completo va en la tabla de abajo. */
    if (resumen) gen = M.gen.filter(function (r, i) { return i < 5 || r.pais === 'CO'; });
    var h = '<div class="nwtab-md-sec">' + head('Medallero por país', (resumen ? 'Resumen: los 5 primeros y Colombia · el detalle completo, abajo' : 'Distribución apilada · ' + plural(M.gen.length, 'país', 'países')), leyenda([['Oro', 'var(--md-oro)', 'oro'], ['Plata', 'var(--md-plata)', 'plata'], ['Bronce', 'var(--md-bronce)', 'bronce']]), 'md-pais') + '<section class="nwtab-md-card" aria-labelledby="md-pais">' +
      '<ul class="nwtab-md-stack">';
    gen.forEach(function (r) {
      var own = r.pais === 'CO';
      h += '<li class="nwtab-md-stack__i' + (own ? ' is-own' : '') + '"><span class="nwtab-md-stack__l">' + N.cc(r.pais, r.paisNombre) + '<span class="nwtab-md-stack__n">' + esc(r.paisNombre) + '</span></span>' +
        '<span class="nwtab-md-stack__tr" aria-hidden="true">' +
        ['oro', 'plata', 'bronce'].map(function (k) { return r[k] ? '<span class="nwtab-md-s nwtab-md-s--' + k + '" style="width:' + (r[k] / max * 100) + '%"></span>' : ''; }).join('') +
        '</span><b class="nwtab-md-stack__t">' + r.total + '</b>' +
        '<span class="nwtab-sr">' + esc(r.paisNombre) + ': ' + plural(r.oro, 'oro', 'oros') + ', ' + plural(r.plata, 'plata', 'platas') + ', ' + plural(r.bronce, 'bronce', 'bronces') + '</span></li>';
    });
    return h + '</ul></section></div>';
  }

  /* 2. Medallas que estuvieron cerca: finales de Colombia con medalla, 4.º y 5.º–8.º, y su efectividad por deporte. */
  var DOS_BRONCES = ['boxeo', 'judo', 'karate', 'lucha', 'taekwondo', 'tenis-mesa', 'tenis de mesa'];
  function dosBronces(r) { return DOS_BRONCES.indexOf(r.code) >= 0 || DOS_BRONCES.indexOf(String(r.nombre).toLowerCase()) >= 0; }
  var ICO_AVISO = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>';

  function secCerca(M, nCol) {
    var rows = M.cerca, fin = 0, gan = 0;
    rows.forEach(function (c) { fin += c.t; gan += c.g; });
    var sub = fin ? plural(fin, 'final disputada', 'finales disputadas') + ' · ' + plural(gan, 'con medalla', 'con medalla') + '. Cuenta una vez por prueba; si Colombia tuvo varios finalistas, vale el mejor resultado.' : 'Colombia compite en ' + plural(nCol, 'prueba', 'pruebas');
    var h = '<div class="nwtab-md-sec">' + head('Medallas que estuvieron cerca', sub, '', 'md-cerca') + '<section class="nwtab-md-card" aria-labelledby="md-cerca">';
    if (!rows.length) {
      return h + '<div class="nwtab-md-na"><b>Aún no hay colombianos entre el 4.º y el 8.º puesto</b><span>Aparecerán cuando termine una final que reparta medalla.</span></div></section></div>';
    }
    var ef = Math.round(gan / fin * 100);
    function k(v, l) { return '<div class="nwtab-md-ck"><strong>' + v + '</strong><span>' + l + '</span></div>'; }
    /* DC-091: la leyenda es la 4.ª card de la fila, con el mismo estilo que las otras tres. */
    h = h.replace('<section class="nwtab-md-card" aria-labelledby="md-cerca">', '');
    h += '<div class="nwtab-md-cks">' + k(fin, 'Finales disputadas') + k(gan, 'Con medalla') + k(ef + ' %', 'Efectividad') +
      '<div class="nwtab-md-ck nwtab-md-ck--leg">' + leyenda([['Ganó medalla', 'var(--md-ok)'], ['Perdió en ' + ordDe(4), 'var(--md-c4x)'], ['Perdió en ' + ordDe(5) + ' a ' + ordDe(8), 'var(--md-c58x)']]) + '</div></div>' +
      '<section class="nwtab-md-card" aria-labelledby="md-cerca"><table class="nw-table nwtab-md-ct"><caption class="nwtab-sr">Finales de Colombia por deporte y su resultado</caption><thead><tr>' +
      '<th scope="col">Deporte</th><th scope="col" class="nwtab-md-ct__n nwtab-md-hide-m">Finales disputadas</th><th scope="col" class="nwtab-md-ct__n nwtab-md-hide-m">Ganadas</th>' +
      '<th scope="col">Resultados de finales</th><th scope="col" class="nwtab-md-ct__e">Efectividad</th></tr></thead><tbody>';
    var avisos = [];
    var maxFin = rows.reduce(function (a, r) { return Math.max(a, r.t); }, 1); /* DC-094: el ancho de la barra es proporcional a las finales */
    rows.forEach(function (r) {
      var w = dosBronces(r);
      if (w) avisos.push(String(r.nombre).toLowerCase());
      var txt = r.nombre + ': ' + plural(r.g, 'ganada', 'ganadas') + ', ' + r.c4 + ' en ' + ordDe(4) + ' puesto y ' + r.c58 + ' entre ' + ordDe(5) + ' y ' + ordDe(8) + ', de ' + plural(r.t, 'final', 'finales') + '. Efectividad ' + r.ef + ' %.';
      function seg(n, cls) { return n ? '<span class="nwtab-md-seg nwtab-md-seg--' + cls + '" style="flex-grow:' + n + '">' + n + '</span>' : ''; }
      h += '<tr><th scope="row" class="nwtab-md-ct__d"><span>' + esc(r.nombre) + '</span>' +
        (w ? '<span class="nwtab-md-warn" title="Dos bronces: no existe el 4.º puesto">' + ICO_AVISO + '<span class="nwtab-sr">Dos bronces en este deporte: no existe el 4.º puesto</span></span>' : '') + '</th>' +
        '<td class="nwtab-md-ct__n nwtab-md-hide-m">' + r.t + '</td><td class="nwtab-md-ct__n nwtab-md-hide-m">' + r.g + '</td>' +
        '<td><div class="nwtab-md-segs" style="width:' + Math.max(14, Math.round(r.t / maxFin * 100)) + '%" role="img" aria-label="' + esc(txt) + '">' + seg(r.g, 'ok') + seg(r.c4, 'c4') + seg(r.c58, 'c58') + '</div></td>' +
        '<td class="nwtab-md-ct__e"><span class="nwtab-md-ef"><span class="nwtab-md-ef__tr" aria-hidden="true"><span style="width:' + r.ef + '%"></span></span><b>' + r.ef + ' %</b></span></td></tr>';
    });
    h += '</tbody></table>';
    if (avisos.length) {
      var lista = avisos.length > 1 ? avisos.slice(0, -1).join(', ') + ' y ' + avisos[avisos.length - 1] : avisos[0];
      h += '<p class="nwtab-md-aviso" role="note">' + ICO_AVISO + '<span>En ' + esc(lista) + ' hay dos bronces: no existe el ' + ordDe(4) + ' puesto.</span></p>';
    }
    return h + '</section></div>';
  }

  /* 3. Colombia en cada deporte. */
  function secDeportes(M, ui) {
    var rows = M.deps.filter(function (d) { return d.co; }).sort(function (a, b) {
      return b.co.oro - a.co.oro || b.co.plata - a.co.plata || b.co.bronce - a.co.bronce || a.nombre.localeCompare(b.nombre);
    });
    var h = '<div class="nwtab-md-sec">' + head('Colombia en cada deporte', RL ? 'Medallas de Colombia en cada deporte' : 'Medallas de Colombia, su peso en los oros del deporte y su puesto en el medallero de ese deporte', '', 'md-dep') + '<section class="nwtab-md-card" aria-labelledby="md-dep">';
    if (!rows.length) return h + '<div class="nwtab-md-na"><b>Colombia aún no tiene medallas</b><span>Cuando gane la primera, verá aquí en qué deportes.</span></div></section></div>';
    var shown = rows;
    if (RL) h += '<div class="nwtab-md-q"><nwt-searchbox id="md-dep-q" nwt-size="medium"></nwt-searchbox><p class="nwtab-sr" id="md-dep-st" role="status" aria-live="polite"></p></div>';
    h += '<div class="nwtab-tw"><table class="nwtab-tb nwtab-md-tb nwtab-md-tb--dep"><caption class="nwtab-sr">Medallas de Colombia por deporte</caption><thead><tr><th scope="col" class="nwtab-md-c1">#</th><th scope="col">Deporte</th>' +
      '<th scope="col" class="nwtab-r"><span class="nwtab-mh">' + dotMed('oro') + '<span class=\"nwtab-md-th\">Oro</span></span></th><th scope="col" class="nwtab-r"><span class="nwtab-mh">' + dotMed('plata') + '<span class=\"nwtab-md-th\">Plata</span></span></th><th scope="col" class="nwtab-r"><span class="nwtab-mh">' + dotMed('bronce') + '<span class=\"nwtab-md-th\">Bronce</span></span></th>' +
      '<th scope="col" class="nwtab-r">' + totalH() + '</th>' + (RL ? '<th scope="col" class="nwtab-md-cx"><span class="nwtab-sr">Detalle por deportista</span></th>' : '<th scope="col" class="nwtab-md-hide-s">Oros del deporte que ganó Colombia</th><th scope="col">Puesto en el deporte</th>') + '</tr></thead><tbody>';
    shown.forEach(function (d, i) {
      var c = d.co, lead = c.pos === 1, w = d.oros ? c.oro / d.oros * 100 : 0, l = d.m[0];
      var det = RL ? (M.detDep[d.code] || []) : [], gid = 'md-dd-' + d.code;
      h += '<tr' + (RL ? ' class="nwtab-md-row" data-q="' + esc(N.norm(d.nombre)) + '"' : '') + '><td class="nwtab-md-c1">' + rk(i + 1) + '</td><td>' + (RL ? '<span class="nwtab-md-ico">' + ico(d.code) + '</span>' : '') + '<span class="nwtab-dn">' + esc(d.nombre) + '</span></td>' +
        '<td class="nwtab-r"><span class="nwtab-n' + (c.oro ? '' : ' is-0') + '">' + c.oro + '</span></td><td class="nwtab-r"><span class="nwtab-n' + (c.plata ? '' : ' is-0') + '">' + c.plata + '</span></td><td class="nwtab-r"><span class="nwtab-n' + (c.bronce ? '' : ' is-0') + '">' + c.bronce + '</span></td>' +
        '<td class="nwtab-r"><b class="nwtab-n nwtab-n--t">' + c.total + '</b></td>' +
        (RL ? '<td class="nwtab-md-cx"><button type="button" class="nwtab-md-exp" data-md-exp="' + gid + '" data-k="' + gid + '"' + (det.length ? ' aria-controls="' + det.map(function (x, j) { return gid + '-' + j; }).join(' ') + '"' : '') + ' aria-expanded="' + !!(ui.dOpen && ui.dOpen[gid]) + '" aria-label="Quién ganó cada medalla en ' + esc(d.nombre) + '"><svg width="22" height="22" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></td>' : '<td class="nwtab-md-hide-s">' + (d.oros ? '<span class="nwtab-md-w"><span class="nwtab-md-w__tr" aria-hidden="true"><span style="width:' + w + '%"></span></span><span class="nwtab-md-w__t">' + c.oro + ' de ' + d.oros + '</span></span>' : '<span class="nwtab-md-mut">Sin oros en el deporte</span>') + '</td>' +
        '<td><span class="nwtab-md-badge' + (lead ? ' is-lead' : '') + '">' + ordDe(c.pos) + ' de ' + d.m.length + '</span>' + (lead ? '' : '<small class="nwtab-md-mut nwtab-md-hide-s"> lidera ' + esc(l.paisNombre) + '</small>') + '</td>') + '</tr>';
      det.forEach(function (x, j) {
        h += '<tr class="nwtab-md-det' + (j % 2 ? ' nwtab-md-det--z' : '') + (j === det.length - 1 ? ' nwtab-md-det--end' : '') + '" id="' + gid + '-' + j + '" data-g="' + gid + '" data-qd="' + esc(N.norm(d.nombre)) + '"' + (ui.dOpen && ui.dOpen[gid] ? '' : ' hidden') + '><td></td><td colspan="6"><div class="nwtab-md-dg"><span class="nwtab-dn">' + esc(x.n) + '</span><span class="nwtab-md-mut">' + esc(x.p) + '</span>' +
          '<span class="nwtab-md-dm">' + dotMed(x.m) + '<span>' + { oro: 'Oro', plata: 'Plata', bronce: 'Bronce' }[x.m] + '</span></span><span class="nwtab-md-mut">' + esc(SEXO[x.s] || '—') + '</span></div></td></tr>';
      });
    });
    h += '</tbody></table></div>';
    return h.replace(/<div class="nwtab-tw"><table class="nwtab-tb nwtab-md-tb nwtab-md-tb--dep">[\s\S]*$/, function (t) { return rows.length > VISTA_DEP ? recorte(t, rows.length, ui.dep, 'dep') : t; }) + '</section></div>';
  }

  /* 4. Comparación con un rival: ventaja que sacamos y que nos sacaron, oros por deporte. */
  function secRival(M, ui) {
    var opts = opcionesRival(M);
    if (!opts.length) return '';
    var sel = opts.filter(function (o) { return o.iso === ui.rival; })[0] || opts[0];
    var rv = sel.nombre, coO = M.co ? M.co.oro : 0, rvRow = M.gen.filter(function (r) { return r.pais === sel.iso; })[0], rvO = rvRow ? rvRow.oro : 0, gap = coO - rvO;
    var todos = M.deps.map(function (d) {
      var a = d.co ? d.co.oro : 0, b = (d.m.filter(function (r) { return r.pais === sel.iso; })[0] || { oro: 0 }).oro;
      return { n: d.nombre, d: a - b, co: a, rv: b };
    }).filter(function (r) { return r.co || r.rv; });
    function ord(a, b) { return Math.abs(b.d) - Math.abs(a.d) || a.n.localeCompare(b.n); }
    var pos = todos.filter(function (r) { return r.d > 0; }).sort(ord), neg = todos.filter(function (r) { return r.d < 0; }).sort(ord),
      emp = todos.filter(function (r) { return r.d === 0; }).sort(function (a, b) { return a.n.localeCompare(b.n); });
    var sPos = 0, sNeg = 0, max = 3; /* la escala se ajusta a la mayor diferencia, con mínimo de 3 */
    pos.forEach(function (r) { sPos += r.d; max = Math.max(max, r.d); });
    neg.forEach(function (r) { sNeg += r.d; max = Math.max(max, -r.d); });
    function sg(n) { return (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n); }
    function so(n) { return sg(n) + (Math.abs(n) === 1 ? ' oro' : ' oros'); }

    var chips = '<div class="nwtab-md-tags" role="group" aria-label="Elegir rival">' + opts.map(function (o) {
      return '<button type="button" class="nwtab-md-tag" data-k="md-rv-' + o.iso + '" data-md-rival="' + o.iso + '" aria-pressed="' + (o.iso === sel.iso) + '">' + o.tag + ' · ' + esc(o.nombre) + ' <span class="nwtab-md-bdg">' + ordDe(o.pos) + '</span></button>';
    }).join('') + '</div>';
    var h = '<div class="nwtab-md-sec">' + head('Colombia frente a competidores cercanos <span class="nwtab-md-bdg">Puesto ' + ordDe(M.gen.indexOf(M.co) + 1) + '</span>',
      'Oros de Colombia y de ' + rv + ' en cada deporte. La barra mide la diferencia; el balance es ' + coO + ' frente a ' + rvO + '.', chips, 'md-rv');
    if (!todos.length) return h + '<section class="nwtab-md-card" aria-labelledby="md-rv">' + '<div class="nwtab-md-na"><b>Sin oros por deporte</b><span>Ni Colombia ni ' + esc(rv) + ' tienen oros todavía.</span></div></section></div>';

    h += '<div class="nwtab-md-cks nwtab-md-cks--3">' +
      '<div class="nwtab-md-ck"><span>Ventaja que sacamos</span><strong class="is-pos">' + sg(sPos) + '</strong><small>en ' + plural(pos.length, 'deporte', 'deportes') + '</small></div>' +
      '<div class="nwtab-md-ck"><span>Ventaja que nos sacaron</span><strong class="is-neg">' + sg(sNeg) + '</strong><small>en ' + plural(neg.length, 'deporte', 'deportes') + '</small></div>' +
      '<div class="nwtab-md-ck ' + (gap >= 0 ? 'tot--pos' : 'tot--neg') + '"><span>Balance</span><strong class="' + (gap >= 0 ? 'is-pos' : 'is-neg') + '">' + so(gap) + '</strong><small>' + coO + ' frente a ' + rvO + ' oros</small></div></div>';

    function med(n, gana) { return '<span class="nwtab-md-vs__m' + (n ? '' : ' is-0') + (gana ? ' is-win' : '') + '"><span class="nwtab-md-vs__ic" aria-hidden="true">' + dotMed('oro') + '</span>' + n + '</span>'; }
    function row(r) {
      var k = r.d > 0 ? 'pos' : 'neg';
      return '<li class="nwtab-md-vs__r"><span class="nwtab-md-vs__l">' + esc(r.n) + '</span>' + med(r.co, r.d > 0) + med(r.rv, r.d < 0) +
        '<span class="nwtab-md-vs__ax" aria-hidden="true"><span class="nwtab-md-dv__b is-' + k + '" style="width:' + (Math.abs(r.d) / max * 100) + '%">' + sg(r.d) + '</span></span>' +
        '<span class="nwtab-sr">' + esc(r.n) + ': Colombia ' + plural(r.co, 'oro', 'oros') + ', ' + esc(rv) + ' ' + plural(r.rv, 'oro', 'oros') + '</span></li>';
    }
    function bloque(k, titulo, rows, sub) {
      if (!rows.length) return '';
      return '<section class="nwtab-md-card nwtab-md-vs" aria-labelledby="md-rv"><div class="nwtab-md-vs__h"><h4 class="is-' + k + '">' + titulo + '</h4><b class="is-' + k + '">' + so(sub) + '</b></div>' +
        '<ul class="nwtab-md-vs__ls"><li class="nwtab-md-vs__r nwtab-md-vs__r--h" aria-hidden="true"><span></span><span>COL</span><span>' + esc(sel.iso) + '</span><span class="nwtab-md-vs__dh">Diferencia</span></li>' + rows.map(row).join('') + '</ul></section>';
    }
    var bl = bloque('pos', 'Ventaja que le sacamos a ' + esc(rv), pos, sPos) + bloque('neg', 'Ventaja que nos sacó ' + esc(rv), neg, sNeg);
    if (bl) h += '<div class="nwtab-md-vsg">' + bl + '</div>';
    if (emp.length) h += '<p class="nwtab-md-aviso" role="note"><span>= Empatados, no mueven la ventaja: ' + emp.map(function (r) { return esc(r.n) + ' ' + r.co + '–' + r.rv; }).join(' · ') + '</span></p>';
    return h + '</div>';
  }

  /* Tabla recortada a N filas con degradado y botón centrado; las filas siguen en el DOM. */
  function recorte(tabla, n, abierta, k, kk) {
    var btn = '<button type="button" class="nwtab-md-more" data-k="md-' + k + '" data-md-more="' + k + '" aria-expanded="' + !!abierta + '">' + (abierta ? 'Mostrar menos' : 'Mostrar los ' + n + ' deportes con medalla') + '</button>';
    return '<div class="nwtab-md-clipw' + (abierta ? '' : ' is-clip') + '"><div class="nwtab-md-clip">' + tabla + '</div><div class="nwtab-md-ov">' + btn + '</div></div>';
  }

  /* Barra apilada horizontal (estilo uso de disco); mínimo visible para segmentos > 0. */
  function barra(items, total, caption) {
    var on = items.filter(function (i) { return i.n; });
    var alt = caption + ': ' + on.map(function (i) { return i.n + ' ' + i.t.toLowerCase() + ' (' + pct(i.n, total) + ' %)'; }).join(', ');
    /* DC-079: el total grande a la izquierda (sin rótulo visible), a su derecha la barra y debajo la leyenda. */
    return '<div class="nwtab-md-sbar"><p class="nwtab-md-sbar__t"><b>' + total + '</b><span class="nwtab-md-sbar__l">Medallas<span class="nwtab-sr"> de Colombia</span></span></p><div class="nwtab-md-sbar__m">' +
      '<div class="nwtab-md-sbar__b" role="img" aria-label="' + esc(alt) + '">' + on.map(function (i) { return '<span style="flex:' + i.n + ' 1 0;background:' + i.c + '"></span>'; }).join('') + '</div>' +
      '<ul class="nwtab-md-sbar__lg">' + items.map(function (i) { return '<li><i class="nwtab-md-dot" style="background:' + i.c + '" aria-hidden="true"></i><span>' + i.t + '</span><b>' + i.n + '</b><small>(' + pct(i.n, total) + ' %)</small></li>'; }).join('') + '</ul></div></div>';
  }

  /* Dona SVG (círculos con stroke-dasharray). */
  function dona(items, total, caption) {
    var C = 2 * Math.PI * 60, off = 0, segs = items.filter(function (i) { return i.n; }).map(function (i) {
      var len = i.n / total * C, s = '<circle cx="80" cy="80" r="60" fill="none" stroke="' + i.c + '" stroke-width="18" stroke-dasharray="' + len + ' ' + (C - len) + '" stroke-dashoffset="' + (-off) + '" transform="rotate(-90 80 80)"/>';
      off += len; return s;
    }).join('');
    var alt = caption + ': ' + items.filter(function (i) { return i.n; }).map(function (i) { return i.n + ' ' + i.t.toLowerCase(); }).join(', ');
    return '<div class="nwtab-md-donut"><figure class="nwtab-md-donut__f" role="img" aria-label="' + esc(alt) + '"><div class="nwtab-md-donut__g"><svg viewBox="0 0 160 160" width="132" height="132" aria-hidden="true" focusable="false"><circle cx="80" cy="80" r="60" fill="none" stroke="var(--naotech-app-color-100)" stroke-width="18"/>' + segs + '</svg><b class="nwtab-md-donut__n">' + total + '</b></div>' +
      '<figcaption class="nwtab-md-donut__c">' + esc(caption) + '</figcaption></figure><ul class="nwtab-md-donut__lg">' +
      items.map(function (i) { return '<li><i class="nwtab-md-dot" style="background:' + i.c + '" aria-hidden="true"></i><span>' + i.t + '</span><small>' + pct(i.n, total) + ' %</small><b>' + i.n + '</b></li>'; }).join('') + '</ul></div>';
  }

  /* Medallas por cada 100 participaciones (barras del mockup, una por género). */
  function convFilas(ins, g) {
    var f = [['Mujeres', g.F, ins.F, 'var(--md-f)'], ['Hombres', g.M, ins.M, 'var(--md-m)'], ['Mixtas', g.X, ins.X, 'var(--md-x)']].filter(function (r) { return r[2] > 0; });
    var best = f.reduce(function (a, r) { var c = r[2] ? r[1] / r[2] : 0; return c > a ? c : a; }, 0);
    return '<ul class="nwtab-md-conv"><li class="nwtab-md-conv__h" aria-hidden="true"><span>Género</span><span>Proporción</span><span>Por cada 100</span><span>Medallas / inscr.</span></li>' + f.map(function (r) {
      var c = Math.round(r[1] / r[2] * 100), top = r[2] && r[1] / r[2] === best && f.length > 1;
      return '<li><span class="nwtab-md-conv__l">' + r[0] + '</span><span class="nwtab-md-conv__t" role="img" aria-label="' + c + ' medallas por cada 100 participaciones de ' + r[0].toLowerCase() + '"><i style="width:' + Math.min(100, c) + '%;background:' + r[3] + '"></i></span><b class="' + (top ? 'is-best' : '') + '">' + c + '</b><small>' + r[1] + ' de ' + r[2] + '</small></li>';
    }).join('') + '</ul>';
  }

  /* Tooltip de información (arriba a la derecha de la tarjeta): hover, foco de teclado o toque. */
  function infoTip(id, texto) {
    return '<span class="nwtab-md-info"><button type="button" class="nwtab-md-info__b" aria-label="Cómo se calcula" aria-describedby="' + id + '"><i class="naotech-icon-info" aria-hidden="true"></i></button>' +
      '<span class="nwtab-md-info__t" role="tooltip" id="' + id + '">' + esc(texto) + '</span></span>';
  }

  /* 5. Medallas por género. */
  function secGenero(M, ui) {
    var g = M.gTot, total = g.F + g.M + g.X + g.U;
    var h = '<div class="nwtab-md-sec">' + head('Medallas por género', 'Cuántas medallas ganó Colombia en pruebas de cada género. El género sale del sexo registrado en la prueba; una medalla de equipo cuenta una vez por cada integrante registrado.', '', 'md-gen') + '<section class="nwtab-md-card" aria-labelledby="md-gen">';
    if (!total) return h + '<div class="nwtab-md-na"><b>Colombia aún no tiene medallas</b><span>El desglose por género aparece con la primera medalla.</span></div></section></div>';
    h += '<div class="nwtab-md-gen__blk">' + barra([{ t: 'Mujeres', n: g.F, c: 'var(--md-f)' }, { t: 'Hombres', n: g.M, c: 'var(--md-m)' }, { t: 'Mixtas', n: g.X, c: 'var(--md-x)' }].concat(g.U ? [{ t: 'Sin género en la prueba', n: g.U, c: 'var(--md-u)' }] : []), total, 'Medallas de Colombia') + '</div></section>' +
      '<section class="nwtab-md-card" aria-labelledby="md-gen">' + '<div class="nwtab-md-gen__blk"><p class="nwtab-md-sub">Medallas por cada 100 participaciones</p>' + convFilas(M.insG, g) + '</div></section>';
    var rows = M.gRows, shown = rows, maxT = rows[0].t;
    var tg = '<div class="nwtab-tw"><table class="nwtab-tb nwtab-md-tb nwtab-md-tb--gen"><caption class="nwtab-sr">Medallas de Colombia por deporte y género</caption><thead><tr><th scope="col">Deporte</th><th scope="col" class="nwtab-md-hide-s">Medallas por género</th>' +
      '<th scope="col" class="nwtab-r">' + sx('F', 'Mujeres') + '</th><th scope="col" class="nwtab-r">' + sx('M', 'Hombres') + '</th><th scope="col" class="nwtab-r">' + sx('X', 'Mixtas') + '</th><th scope="col" class="nwtab-r">Total</th></tr></thead><tbody>';
    shown.forEach(function (r) {
      tg += '<tr><td><span class="nwtab-dn">' + esc(r.nombre) + '</span></td><td class="nwtab-md-hide-s"><span class="nwtab-md-s100" style="width:' + (r.t / maxT * 100) + '%" aria-hidden="true">' +
        [['F', 'f'], ['M', 'm'], ['X', 'x'], ['U', 'u']].map(function (p) { return r[p[0]] ? '<span style="width:' + (r[p[0]] / r.t * 100) + '%;background:var(--md-' + p[1] + ')"></span>' : ''; }).join('') + '</span></td>' +
        ['F', 'M', 'X'].map(function (k) { return '<td class="nwtab-r"><span class="nwtab-n' + (r[k] ? '' : ' is-0') + '">' + r[k] + '</span></td>'; }).join('') +
        '<td class="nwtab-r"><b class="nwtab-n nwtab-n--t">' + r.t + '</b></td></tr>';
    });
    tg += '</tbody></table></div>';
    h += '<section class="nwtab-md-card" aria-labelledby="md-gen"><div class="nwtab-md-gen__blk"><p class="nwtab-md-sub">Medallas por deporte</p>' + (rows.length > VISTA_GEN ? recorte(tg, rows.length, ui.gen, 'gen') : tg) + '</div></section>'; /* DC-011: 3 cards */
    return h + '</div>';
  }

  /* 6. Medallero completo. */
  /* Desglose por deporte (PROD-63): filas hermanas en la misma tabla, así oro/plata/bronce/total caen bajo sus columnas. */
  function detalle(r, id, ds) {
    var fl = function (i, cls, inner) { return '<tr class="nwtab-md-det' + cls + '" id="' + id + '-' + i + '" data-g="' + id + '" hidden>' + inner + '</tr>'; };
    var h = '';
    if (!ds.length) return fl(0, ' nwtab-md-det--v nwtab-md-det--end', '<td></td><td colspan="6"><b>Esta delegación aún no tiene detalle por deporte.</b> Sus ' + plural(r.total, 'medalla está', 'medallas están') + ' en el total.</td>');
    /* El chip del país va oculto y ocupa su mismo ancho: el deporte arranca justo bajo el nombre */
    var fl0 = '<span class="nwtab-md-det__fl" aria-hidden="true">' + N.cc(r.pais, r.paisNombre) + '</span>';
    ds.forEach(function (d, i) {
      h += fl(i, (i % 2 ? ' nwtab-md-det--z' : '') + (i === ds.length - 1 ? ' nwtab-md-det--end' : ''), '<td></td><td><span class="nwtab-dg"><span class="nwtab-md-det__sp">' + fl0 + '<span class="nwtab-md-ico">' + ico(d.deporte) + '</span></span><span>' + esc(d.deporteNombre) + '</span></span></td>' +
        ['oro', 'plata', 'bronce'].map(function (k) { return '<td class="nwtab-r"><span class="nwtab-n' + (d[k] ? '' : ' is-0') + '">' + d[k] + '</span></td>'; }).join('') +
        '<td class="nwtab-r"><b class="nwtab-n nwtab-n--t">' + d.total + '</b></td><td></td>');
    });
    return h;
  }

  function secCompleto(M, data) {
    var h = '<div class="nwtab-md-sec">' + head('Medallero completo', '', '', 'md-all') + '<section class="nwtab-md-card" aria-labelledby="md-all">' +
      '<div class="nwtab-tw"><table class="nwtab-tb nwtab-md-tb nwtab-md-tb--all"><caption class="nwtab-sr">Medallero completo del evento</caption><thead><tr><th scope="col" class="nwtab-md-c1">Pos.</th><th scope="col">País</th>' +
      '<th scope="col" class="nwtab-r"><span class="nwtab-mh">' + dotMed('oro') + '<span class=\"nwtab-md-th\">Oro</span></span></th><th scope="col" class="nwtab-r"><span class="nwtab-mh">' + dotMed('plata') + '<span class=\"nwtab-md-th\">Plata</span></span></th><th scope="col" class="nwtab-r"><span class="nwtab-mh">' + dotMed('bronce') + '<span class=\"nwtab-md-th\">Bronce</span></span></th><th scope="col" class="nwtab-r">' + totalH() + '</th><th scope="col" class="nwtab-md-cx"><span class="nwtab-sr">Detalle por deporte</span></th></tr></thead><tbody>';
    M.todos.forEach(function (r, i) {
      var own = r.pais === 'CO', id = 'md-det-' + r.pais, ds = data.medallasDePais(r.pais), ids = [];
      for (var j = 0; j < Math.max(ds.length, 1); j++) ids.push(id + '-' + j);
      h += '<tr class="nwtab-md-row' + (own ? ' nwtab-co' : '') + '"><td class="nwtab-md-c1">' + rk(r.pos) + '</td><td>' + nombrePais(r.pais, r.paisNombre, own) + '</td>' +
        ['oro', 'plata', 'bronce'].map(function (k) { return '<td class="nwtab-r"><span class="nwtab-n' + (r[k] ? '' : ' is-0') + '">' + r[k] + '</span></td>'; }).join('') +
        '<td class="nwtab-r"><b class="nwtab-n nwtab-n--t">' + r.total + '</b></td>' +
        '<td class="nwtab-md-cx"><button type="button" class="nwtab-md-exp" data-md-exp="' + id + '" aria-expanded="false" aria-controls="' + ids.join(' ') + '" aria-label="Medallas de ' + esc(r.paisNombre) + ' por deporte"><svg width="22" height="22" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></td></tr>' + detalle(r, id, ds);
    });
    h += '</tbody></table></div></section></div>';
    return h;
  }

  /* «Registrar medallas» (operación) solo existe en la plataforma, nunca en el landing. */
  function barraModo(modo, data) {
    if (modo !== 'captura') return '';
    return '<div class="nwtab-cap-modo"><nwt-button id="md-volver" nwt-variant="quiet" icon="chevron-left" data-md-modo="consulta">Volver a Medallería</nwt-button>' +
      '<span class="nwtab-cap-mut">' + esc(data.evento.nombre) + ' · Última actualización: ' + esc(OLC.fechaCorta(OLC.HOY)) + '</span></div>';
  }
  /* Al registrar no hace falta ver la cabecera del evento: se oculta con una clase en el contenedor del detalle. */
  var lastUi = null;
  window.addEventListener('hashchange', function () {
    if (lastUi && lastUi.modo === 'captura' && !/tab=medalleria/.test(location.hash) && !/^#\/eventos\/[^?]+$/.test(location.hash)) lastUi.modo = 'consulta';
  });
  /* Va en la columna de Indicadores, debajo de ellos. */
  function bloqueRegistro() {
    if (RL && RL.rol !== 'admin') return '';
    return '<div class="nwtab-cap-reg"><h3 class="nwtab-md-card__t">Registro de medallas</h3>' +
      '<nwt-button id="md-registrar" data-md-modo="captura">Registrar medallas</nwt-button></div>';
  }

  /* Esqueleto mientras cambia el modo: mismo esqueleto de la vista que viene, anunciado como «cargando». */
  function cargando(modo) {
    var bar = function (w, h) { return '<span class="nwtab-sk" style="width:' + w + ';height:' + (h || 14) + 'px"></span>'; };
    var fila = '<div class="nwtab-sk-r">' + bar('34px') + bar('26%') + bar('60px') + bar('60px') + bar('60px') + bar('60px') + '</div>';
    var h = '<div class="nwtab-sk-w" aria-busy="true"><p class="nwtab-sr" role="status">Cargando ' + (modo === 'captura' ? 'el registro de medallas' : 'la medallería') + '…</p>';
    if (modo === 'captura') h += bar('280px', 22) + '<div class="nwtab-sk-f">' + bar('220px', 44) + bar('220px', 44) + bar('180px', 44) + '</div>';
    else h += '<div class="nwtab-sk-f">' + bar('300px', 96) + bar('100%', 96) + '</div>' + bar('220px', 22);
    return h + '<div class="nwtab-sk-t">' + fila + fila + fila + fila + fila + '</div></div>';
  }

  function render(el, ctx) {
    var data = ctx.data, ui = ctx.ui.md = ctx.ui.md || {}, nCol = data.colombia ? data.colombia.participa : 0;
    var M = calcular(data), modo = ui.modo || 'consulta', h = '<section class="nwtab-tab nwtab-md-root" aria-label="Medallería">' + barraModo(modo, data);
    lastUi = ui;
    var raiz = el.closest('.nws-event-detail'); if (raiz) raiz.classList.toggle('is-registro', modo === 'captura');
    var bindModo = function () {
      el.querySelectorAll('[data-md-modo]').forEach(function (b) {
        b.addEventListener('click', function () {
          var sig = b.getAttribute('data-md-modo'); if (sig === (ui.modo || 'consulta') && !ui.cargando) return;
          var foco = function () {
            var id = '#' + (sig === 'captura' ? 'md-volver' : 'md-registrar'), n = 0;
            (function t() { var x = el.querySelector(id + ' button'); if (x) x.focus({ preventScroll: true }); else if (n++ < 30) requestAnimationFrame(t); })();
            window.scrollTo({ top: 0 });
          };
          ui.modo = sig; ui.cargando = true; window.Tabs['medalleria'].render(el, ctx); foco();
          clearTimeout(ui.t); ui.t = setTimeout(function () { ui.cargando = false; window.Tabs['medalleria'].render(el, ctx); foco(); }, 500);
        });
      });
    };
    if (ui.cargando) { el.innerHTML = h + cargando(modo) + '</section>'; bindModo(); return; }
    if (modo === 'captura') {
      el.innerHTML = h + window.MedCaptura.html(data, ui, head) + '</section>';
      bindModo(); window.MedCaptura.bind(el, data, ui, function () { window.Tabs['medalleria'].render(el, ctx); });
      return;
    }
    if (!M.gen.length) {
      h += '<div class="nwtab-md-sec">' + bloqueRegistro() + '</div>';
      var ev = data.evento, prox = data.estado === 'Próximo';
      h += '<div class="nwtab-emptyb nwtab-emptyb--lg"><b>Aún no hay medallas.' + (nCol ? ' Colombia compite en ' + plural(nCol, 'prueba', 'pruebas') + '.' : '') + '</b>' +
        '<span>' + (prox && ev && ev.inicio ? 'El evento empieza el ' + esc(OLC.fechaCorta(ev.inicio)) + '. ' : '') + 'El medallero y sus gráficos se arman a medida que terminan las pruebas.</span></div></section>';
      el.innerHTML = h; bindModo(); return;
    }
    var co = M.co, coT = co ? co.total : 0, coO = co ? co.oro : 0, nPais = M.gen.length;
    var lideres = M.deps.filter(function (d) { return d.m[0].pais === 'CO'; }).length;
    var hintPos;
    if (!co) hintPos = 'Sin medallas todavía';
    else if (co.pos === 1) { var s2 = M.gen[1]; hintPos = s2 ? (co.oro - s2.oro ? 'a ' + plural(co.oro - s2.oro, 'oro', 'oros') + ' de ' + esc(s2.paisNombre) : 'empata en oros con ' + esc(s2.paisNombre)) : 'Único país con medallas'; }
    else { var ar = M.gen[co.pos - 2], dif = ar.oro - co.oro; hintPos = dif ? 'a ' + plural(dif, 'oro', 'oros') + ' de ' + esc(ar.paisNombre) : 'empata en oros con ' + esc(ar.paisNombre); }

    var kpis = RL
      ? kpi('o', 'medal', coT, 'Medallas de Colombia', pct(coT, M.totEv) + ' % de las ' + nf(M.totEv) + ' del evento') +
        kpi('o', 'star', coO, 'Oros', pct(coO, M.oroEv) + ' % de los ' + nf(M.oroEv) + ' oros') +
        kpi('g', 'medal', co ? co.plata : 0, 'Platas', pct(co ? co.plata : 0, coT) + ' % de las de Colombia') +
        kpi('b', 'medal', co ? co.bronce : 0, 'Bronces', pct(co ? co.bronce : 0, coT) + ' % de las de Colombia') +
        kpi('g', 'podium', co ? ordDe(co.pos) : '—', 'Puesto en el evento', 'Según el medallero oficial')
      : kpi('o', 'medal', coT, 'Medallas de Colombia', pct(coT, M.totEv) + ' % de las ' + nf(M.totEv) + ' del evento') +
        kpi('o', 'star', coO, 'Oros obtenidos', pct(coO, M.oroEv) + ' % de los ' + nf(M.oroEv) + ' oros') +
        kpi('g', 'podium', co ? ordDe(co.pos) : '—', 'Posición entre ' + plural(nPais, 'país', 'países') + ' con medalla', hintPos) +
        kpi('b', 'ball', co ? lideres : '—', 'Deportes donde fue 1.ª', 'de ' + plural(M.deps.length, 'deporte', 'deportes') + ' con medalla');
    h += (bloqueRegistro() ? '<div class="nwtab-md-sec">' + bloqueRegistro() + '</div>' : '') + '<div class="nwtab-md-top' + (RL && !RL.verPaises ? ' nwtab-md-top--solo' : '') + '"><div class="nwtab-md-sec">' + head('Indicadores', '', '', 'md-kpi') + '<div class="nwtab-md-kpis">' + kpis + '</div></div>' + (RL && !RL.verPaises ? '' : secPais(M, !!RL)) + '</div>';
    h += secCerca(M, nCol);
    h += secDeportes(M, ui) + (RL ? '' : secRival(M, ui)) + secGenero(M, ui) + (RL && !RL.verPaises ? '' : secCompleto(M, data)) + '</section>';
    el.innerHTML = h; bindModo();

    el.querySelectorAll('.nwtab-md-clipw.is-clip').forEach(function (w) {
      var tr = w.querySelectorAll('tbody tr'), v = w.querySelector('.nwtab-md-clip');
      function medir() { if (tr[VISTA_GEN]) { var r = tr[VISTA_GEN].getBoundingClientRect(); v.style.maxHeight = (r.top - v.getBoundingClientRect().top + v.scrollTop + r.height * 2.2) + 'px'; } }
      medir();
      if (window.ResizeObserver) { var ro = new ResizeObserver(medir); ro.observe(w); w._ro = ro; }
    });

    function again(k) { window.Tabs['medalleria'].render(el, ctx); N.refocus(k); }
    el.querySelectorAll('[data-md-more]').forEach(function (b) {
      b.addEventListener('click', function () { var k = b.getAttribute('data-md-more'); ui[k] = !ui[k]; again(b.getAttribute('data-k')); });
    });
    el.querySelectorAll('.nwtab-md-row').forEach(function (tr) {
      tr.addEventListener('click', function (e) { var b = tr.querySelector('[data-md-exp]'); if (b && !e.target.closest('button, a')) b.click(); });
    });
    el.querySelectorAll('[data-md-exp]').forEach(function (b) {
      b.addEventListener('click', function () {
        var gk = b.getAttribute('data-md-exp');
        if (gk.indexOf('md-dd-') === 0) { /* el listado se muestra completo mientras haya un deporte abierto */
          ui.dOpen = ui.dOpen || {}; ui.dOpen[gk] = !ui.dOpen[gk];
          if (ui.dOpen[gk]) ui.dep = true;
          again(gk); return;
        }
        var abre = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', abre);
        el.querySelectorAll('[data-g="' + b.getAttribute('data-md-exp') + '"]').forEach(function (t) { t.hidden = !abre; });
      });
    });
    var qs = el.querySelector('#md-dep-q');
    if (qs) {
      var apply = function (v) { /* con búsqueda se ve todo el listado: se quita el recorte */
        var w = qs.closest('.nwtab-md-sec').querySelector('.nwtab-md-clipw'), n = N.norm(v);
        if (w && n) { w.classList.remove('is-clip'); w.querySelector('.nwtab-md-clip').style.maxHeight = 'none'; }
        qs.closest('.nwtab-md-sec').querySelectorAll('tbody tr').forEach(function (t) { var k = t.getAttribute('data-q') || t.getAttribute('data-qd'); t.hidden = t.hasAttribute('data-g') ? true : !!(n && k.indexOf(n) < 0); });
        ui.depQ = v;
        var st = el.querySelector('#md-dep-st'), vis = qs.closest('.nwtab-md-sec').querySelectorAll('tr.nwtab-md-row:not([hidden])').length;
        if (st) st.textContent = !n ? '' : vis ? plural(vis, 'deporte encontrado', 'deportes encontrados') : 'Sin deportes que coincidan';
      };
      qs.placeholder = 'Buscar deporte'; qs.value = ui.depQ || '';
      var tq;
      qs.addEventListener('nwtChange', function (e) {
        var v = e.detail == null ? '' : String(e.detail); clearTimeout(tq);
        tq = setTimeout(function () { if (v) apply(v); else { ui.depQ = ''; again('md-dep-q'); } }, 200);
      });
      if (ui.depQ) apply(ui.depQ);
    }
    el.querySelectorAll('[data-md-rival]').forEach(function (b) {
      b.addEventListener('click', function () { ui.rival = b.getAttribute('data-md-rival'); again(b.getAttribute('data-k')); });
    });
  }

  window.Tabs['medalleria'] = { render: render };
})();
