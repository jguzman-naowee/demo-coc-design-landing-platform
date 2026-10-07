/* Landing · pestaña «Deportes»: maestro-detalle + sedes. Usa las utilidades de calendario-resultados.js (window.LPT). */
(function () {
  'use strict';
  window.Tabs = window.Tabs || {};
  window.Tabs['deportes'] = {
    render: function (el, ctx) {
      var L = window.LPT;
      if (!L) { el.innerHTML = '<p class="lp-empty">Sección en construcción.</p>'; return; }
      var OLC = window.OLC, esc = L.esc, data = ctx.data, pr = ctx.params;
      var ui = ctx.ui.dep = ctx.ui.dep || { qd: '', q: '', page: 1, size: 10, idx: {} };
      var sexo = L.sexosDe(data).length > 1 && L.sexosDe(data).indexOf(pr.sexo) >= 0 ? pr.sexo : '';
      var sexIco = L.sexoTag;
      var ICO_CAL = '<svg class="lp-i" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4m8-4v4"/></svg>';
      var porSexo = function (p) { return !sexo || p.sexo === sexo; };

      /* Una prueba = nombre + género; sus fases se cuentan, no se listan (se indexa una vez por evento). */
      var ix = ui.idx[data.evento.code] || (ui.idx[data.evento.code] = (function () {
        var mapa = {}, lista = [], porDep = {}, fases = {};
        data.pruebas.forEach(function (p) {
          var k = p.deporte + '|' + p.nombre + '|' + p.sexo, g = mapa[k];
          if (!g) { g = mapa[k] = { deporte: p.deporte, deporteNombre: p.deporteNombre, nombre: p.nombre, sexo: p.sexo, sexoNombre: p.sexoNombre, fases: 0, vivo: false, pend: null, pid: null, ult: '', uid: p.id }; lista.push(g); (porDep[p.deporte] = porDep[p.deporte] || []).push(g); }
          g.fases++; fases[p.deporte] = (fases[p.deporte] || 0) + 1;
          if (p.estado === 'En vivo' && p.fecha === OLC.HOY) g.vivo = true;
          if (p.estado !== 'Finalizado' && (!g.pend || p.fecha < g.pend)) { g.pend = p.fecha; g.pid = p.id; }
          if (p.fecha >= g.ult) { g.ult = p.fecha; g.uid = p.id; }
        });
        return { lista: lista, porDep: porDep, fases: fases };
      })());
      var UMBRAL_BUSCADOR = 8; /* DC-027: el buscador #lp-q solo aparece con MÁS de 8 pruebas */
      var estG = function (g) { return g.vivo ? 'En vivo' : g.pend ? 'Programado' : 'Finalizado'; };
      var nPruebas = function (n) { return n + (n === 1 ? ' prueba' : ' pruebas'); }; /* DC-192 */
      var nFases = function (n) { return n + (n === 1 ? ' fase' : ' fases'); };
      var deps = data.deportes.map(function (d) {
        return { d: d, n: (ix.porDep[d.codigo] || []).filter(porSexo).length };
      });
      var qd = L.norm(ui.qd.trim());
      /* DC-074: como la plataforma, el género solo recalcula conteos; ningún deporte se oculta ni se cambia el seleccionado. */
      var lista = deps.filter(function (o) { return !qd || L.norm(o.d.nombre).indexOf(qd) >= 0; });
      var sel = (deps.filter(function (o) { return o.d.codigo === pr.deporte; })[0] || deps[0]).d;

      var delSel = ix.porDep[sel.codigo] || [], fSel = ix.fases[sel.codigo] || 0;
      /* DC-197: contenedor ≤720px = grilla de deportes + modal con el panel (el estado vive en la URL: modal=1). */
      var esCompacto = function () { return el.clientWidth > 0 && (el.clientWidth <= 720 || window.innerWidth <= 760); };
      var compact = esCompacto(), abierto = compact && pr.modal === '1';
      var fresh = ui.fresh; ui.fresh = false;
      var anillo = lista.some(function (o) { return o.d.codigo === sel.codigo; }) ? lista : deps;
      var ai = anillo.map(function (o) { return o.d.codigo; }).indexOf(sel.codigo);
      var vecino = function (k) { return anillo[(ai + k + anillo.length) % anillo.length].d; };

      /* DC-027: con 8 pruebas o menos el buscador no aplica; un q previo se ignora. */
      var hayBuscador = delSel.length > UMBRAL_BUSCADOR;
      var q = hayBuscador ? L.norm(ui.q.trim()) : '', buscando = q !== '';
      var universo = (buscando ? ix.lista : delSel).filter(porSexo);
      var filas = universo.filter(function (p) { return !q || L.norm(p.nombre + ' ' + p.deporteNombre).indexOf(q) >= 0; });
      filas.sort(function (a, b) {
        return (buscando ? a.deporteNombre.localeCompare(b.deporteNombre, 'es') : 0) || a.nombre.localeCompare(b.nombre, 'es', { numeric: true }) || L.ordSexo[a.sexo] - L.ordSexo[b.sexo];
      });

      function resaltar(t) {
        if (!buscando) return esc(t);
        var i = L.norm(t).indexOf(q);
        return i < 0 ? esc(t) : esc(t.slice(0, i)) + '<mark class="lp-hl">' + esc(t.slice(i, i + q.length)) + '</mark>' + esc(t.slice(i + q.length));
      }
      var sig = sel.codigo + '|' + q + '|' + sexo;
      if (ui.sig !== sig) { ui.sig = sig; ui.page = 1; }
      var pages = Math.max(1, Math.ceil(filas.length / ui.size)); if (ui.page > pages) ui.page = pages;
      var desde = (ui.page - 1) * ui.size, pagina = filas.slice(desde, desde + ui.size);
      var glifo = function (c) { return '<span class="lp-sxg' + (c ? ' ' + c : '') + '" aria-hidden="true"></span>'; };

      var h = '<div class="lp-tab lp-dep"><div class="lp-dp' + (compact ? ' lp-dp-c' : '') + '">';

      /* lista maestra */
      h += '<nav class="lp-dp-l" aria-label="Deportes"><div class="lp-search"><span aria-hidden="true">' + L.svg('search') + '</span><input type="search" id="lp-qd" placeholder="Buscar deporte" aria-label="Buscar deporte" value="' + esc(ui.qd) + '"></div><ul class="lp-dp-list">';
      lista.forEach(function (o) {
        var cur = o.d.codigo === sel.codigo;
        if (compact) { h += '<li><button type="button" class="lp-dp-it lp-dp-card" data-dep="' + esc(o.d.codigo) + '" aria-haspopup="dialog"><span class="lp-dp-ic">' + L.sportIcon(o.d.codigo) + '</span><span class="lp-dp-ct"><span class="lp-nm">' + esc(o.d.nombre) + '</span><span class="lp-n">' + nPruebas(o.n) + '</span></span><span class="lp-dp-chev" aria-hidden="true">' + L.svg('right', 'lp-i-s') + '</span></button></li>'; return; }
        h += '<li><a class="lp-dp-it" href="' + esc(ctx.href({ deporte: o.d.codigo })) + '"' + (cur ? ' aria-current="true"' : '') + '><span class="lp-dp-ic">' + L.sportIcon(o.d.codigo) + '</span><span class="lp-nm">' + esc(o.d.nombre) + '</span><span class="lp-n">' + o.n + '<span class="lp-sr"> pruebas</span></span></a></li>';
      });
      if (!lista.length) h += '<li class="lp-dp-none">Ningún deporte coincide.</li>';
      h += '</ul></nav>';

      /* panel */
      var hp = '<section class="lp-dp-p" aria-labelledby="lp-dp-h"><div class="lp-dp-ph"><span class="lp-dp-ic lp-dp-ic-l">' + L.sportIcon(sel.codigo) + '</span><div class="lp-dp-t"><h2 id="lp-dp-h">' + esc(sel.nombre) + '</h2>' +
        '<div class="lp-dp-sum"><b>' + delSel.length + (delSel.length === 1 ? ' prueba' : ' pruebas') + '</b>' + (fSel > delSel.length ? nFases(fSel) : '') + '</div></div>' +
        '<a class="lp-ibtn lp-ibtn-cal" href="' + esc(ctx.href({ tab: 'calendario-resultados', deporte: sel.codigo, sexo: sexo, modal: '' })) + '" aria-label="Ver en Calendario y resultados" title="Ver en Calendario y resultados"><span>Calendario y resultados</span>' + ICO_CAL + '</a>' + (abierto ? '<button type="button" class="lp-dp-mx" data-mclose autofocus aria-label="Cerrar">' + L.svg('x') + '</button>' : '') + '</div>' +
        (abierto ? '<div class="lp-dp-body">' : '') +
        '<div class="lp-dp-bar">' + (hayBuscador ? '<div class="lp-search lp-search-p"><span aria-hidden="true">' + L.svg('search') + '</span><input type="search" id="lp-q" placeholder="Buscar prueba" aria-label="Buscar prueba en todos los deportes" value="' + esc(ui.q) + '">' +
        (ui.q ? '<button type="button" class="lp-x" data-clear aria-label="Limpiar búsqueda">' + L.svg('x') + '</button>' : '') + '</div>' : '') +
        L.segSexo(ctx) + '</div>';

      if (!filas.length) {
        hp += '<div class="lp-empty">' + (buscando ? '<p>Ninguna prueba coincide con «' + esc(ui.q.trim()) + '».</p><button type="button" class="lp-btn" data-clear>Limpiar búsqueda</button>' : '<p><b>Ninguna prueba con este filtro.</b></p><p>Pruebe con otro género.</p>') + '</div>';
      } else {
        hp += '<table class="lp-pt"><thead><tr><th scope="col">Prueba</th><th scope="col">Estado</th><th scope="col"><span class="lp-sr">Ver en Calendario y resultados</span></th></tr></thead>';
        pagina.forEach(function (g, i) {
          var conRes = g.vivo || !g.pend; /* DC-190: sin resultados no hay flecha */
          hp += '<tbody><tr' + (i % 2 || !conRes ? ' class="' + (i % 2 ? 'lp-z' : '') + (conRes ? '' : (i % 2 ? ' ' : '') + 'lp-nogo') + '"' : '') + '><td class="lp-c-pr"><span class="lp-pn lp-pn-id"><span class="lp-pn-bx"><b>' + resaltar(g.nombre) + '</b></span><span class="lp-rr-mt"><span class="lp-pn-tg">' + sexIco(g.sexo, g.sexoNombre) + (buscando ? '<span class="lp-chipd">' + esc(g.deporteNombre) + '</span>' : '') + '</span><span class="lp-fs" title="' + nPruebas(g.fases) + '">' + nPruebas(g.fases) + '</span></span></span></td>' +
            '<td class="lp-c-st">' + L.estadoBadge(estG(g), true) + '</td><td class="lp-c-go">' + (conRes ? '<a class="lp-ibtn lp-ibtn-s" href="' + esc(ctx.href({ tab: 'calendario-resultados', dia: g.pend || g.ult, deporte: g.deporte, sexo: g.sexo, prueba: '', modal: '' })) + '" aria-label="Ver resultado de ' + esc(g.nombre) + ' ' + esc(g.sexoNombre) + '" title="Ver resultado">' + L.svg('right', 'lp-i-s') + '</a>' : '') + '</td></tr></tbody>';
        });
        hp += '</table>';
        /* DC-141/142: tamaño fijo 10, sin «Mostrando» ni «Por página»; una sola página no se pinta. */
        if (pages > 1) hp += '<nav class="lp-dp-pg" aria-label="Paginación"><div class="lp-pager"><button type="button" data-pg="' + (ui.page - 1) + '" aria-label="Página anterior"' + (ui.page <= 1 ? ' disabled' : '') + '>' + L.svg('left') + '</button><span class="lp-dp-pn">Página <b>' + ui.page + '</b> de ' + pages + '</span><button type="button" data-pg="' + (ui.page + 1) + '" aria-label="Página siguiente"' + (ui.page >= pages ? ' disabled' : '') + '>' + L.svg('right') + '</button></div></nav>';
      }
      /* DC-023: la navegación va al final del cuerpo con scroll, pegada abajo (sticky) */
      hp += (abierto ? (abierto && anillo.length > 1 ? '<div class="lp-dp-mn"><button type="button" class="lp-dp-mb" data-vec="' + esc(vecino(-1).codigo) + '" data-k="p" aria-label="Deporte anterior: ' + esc(vecino(-1).nombre) + '">' + L.svg('left') + '<span><small>Anterior</small><b>' + esc(vecino(-1).nombre) + '</b></span></button><button type="button" class="lp-dp-mb lp-dp-mb-n" data-vec="' + esc(vecino(1).codigo) + '" data-k="n" aria-label="Deporte siguiente: ' + esc(vecino(1).nombre) + '"><span><small>Siguiente</small><b>' + esc(vecino(1).nombre) + '</b></span>' + L.svg('right') + '</button></div>' : '') + '</div>' : '') + '</section>';
      h += (abierto ? '<dialog class="lp-dp-m' + (fresh ? ' lp-dp-m-in' : '') + '" aria-modal="true" aria-labelledby="lp-dp-h">' + hp + '</dialog>' : compact ? '' : hp) + '</div>';

      /* sedes */
      var sedes = data.evento.sedes || [], dx = data.deportes, cada = sedes.map(function (s) { return dx.filter(function (d) { return d.escenario === s; }).map(function (d) { return d.nombre; }); });
      if (sedes.length && !cada.some(function (a) { return a.length; })) {
        cada = sedes.map(function () { return []; });
        dx.forEach(function (d, i) { cada[i % sedes.length].push(d.nombre); });
      }
      if (sedes.length) h += '<section class="lp-sedes" aria-labelledby="lp-sd-h"><h3 id="lp-sd-h">Sedes</h3><ul class="lp-sd-g">';
      sedes.forEach(function (s, i) {
        var n = cada[i];
        h += '<li class="lp-sd"><div class="lp-sd-ph" role="img" aria-label="Foto de la sede: ' + esc(s) + '">Foto de la sede</div><div class="lp-sd-b"><b>' + L.svg('pin') + esc(s) + '</b>' +
          '<span class="lp-sd-d">' + (n.length ? (n.length > 4 ? n.slice(0, 4).join(', ') + ' y ' + (n.length - 4) + ' más' : n.join(', ')) : 'Sede del evento') + '</span></div></li>';
      });
      el.innerHTML = h + (sedes.length ? '</ul></section>' : '') + '</div>';

      /* eventos */
      L.bindBarra(el, ctx);
      var again = function (id, pos) {
        window.Tabs['deportes'].render(el, ctx);
        var i = el.querySelector('#' + id); if (i) { i.focus(); try { i.setSelectionRange(pos, pos); } catch (e) {} }
      };
      el.querySelector('#lp-qd').addEventListener('input', function (e) { ui.qd = e.target.value; again('lp-qd', e.target.selectionStart); });
      var iq = el.querySelector('#lp-q');
      if (iq) iq.addEventListener('input', function (e) { ui.q = e.target.value; again('lp-q', e.target.selectionStart); });
      el.querySelectorAll('[data-pg]').forEach(function (b) { b.addEventListener('click', function () { var k = b.getAttribute('data-pg'); ui.page = +k; window.Tabs['deportes'].render(el, ctx); var n = el.querySelector('[data-pg]:not(:disabled)'); if (n) n.focus(); }); });
      el.querySelectorAll('[data-clear]').forEach(function (b) { b.addEventListener('click', function () { ui.q = ''; again('lp-q', 0); }); });

      /* DC-197: modal, controles de deporte vecino y adaptación al ancho del contenedor */
      var cambiar = function (patch) { history.replaceState(null, '', ctx.href(patch)); ctx.go({}); };
      el.querySelectorAll('[data-dep]').forEach(function (b) { b.addEventListener('click', function () { ui.fresh = true; ctx.go({ deporte: b.getAttribute('data-dep'), modal: '1' }); }); });
      el.querySelectorAll('[data-vec]').forEach(function (b) { b.addEventListener('click', function () { ui.foc = '[data-k="' + b.getAttribute('data-k') + '"]'; cambiar({ deporte: b.getAttribute('data-vec'), modal: '1' }); }); });
      var dlg = el.querySelector('dialog.lp-dp-m');
      if (dlg) {
        if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
        dlg.addEventListener('close', function () { ui.foc = '[data-dep="' + sel.codigo + '"]'; cambiar({ modal: '' }); });
        dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
        dlg.addEventListener('keydown', function (e) {
          if (e.key !== 'Tab') return;
          var f = [].filter.call(dlg.querySelectorAll('a[href],button:not(:disabled),input'), function (x) { return x.offsetParent !== null; });
          if (!f.length) return;
          var a = f[0], z = f[f.length - 1];
          if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
        });
        dlg.querySelector('[data-mclose]').addEventListener('click', function () { dlg.close(); });
      }
      if (ui.foc) { var fo = el.querySelector(ui.foc); ui.foc = ''; if (fo) fo.focus(); }
      else if (ui.hadModal && !abierto) { var ca = el.querySelector('[data-dep="' + sel.codigo + '"]'); if (ca) ca.focus(); }
      ui.hadModal = abierto;
      el.__dpCtx = ctx; el.__dpC = compact;
      if (window.ResizeObserver && !el.__dpRO) {
        el.__dpRO = new ResizeObserver(function () {
          var c = el.__dpCtx;
          if (!el.isConnected || !el.querySelector('.lp-dep')) { el.__dpRO.disconnect(); el.__dpRO = null; return; }
          var ahora = esCompacto();
          if (ahora === el.__dpC) return;
          if (!ahora && c.params.modal === '1') { history.replaceState(null, '', c.href({ modal: '' })); c.go({}); } else window.Tabs['deportes'].render(el, c);
        });
        el.__dpRO.observe(el);
      }
    }
  };
})();
