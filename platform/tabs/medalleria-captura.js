/* Medallería · Registrar medallas (operación). Prototipo: lo guardado vive en memoria (OLC.capturar) y se suma al medallero.
   Controles del SDK (nwt-select, nwt-searchbox, nwt-tag-group, nwt-pagination, nwt-button, nwt-alert, nwt-empty-state). */
(function () {
  var N = window.NWS, esc = N.esc;
  var METAL = { oro: 'Oro', plata: 'Plata', bronce: 'Bronce' };
  var POR_PAG = 3, TODAS = 'Todas las rondas';
  var REGLA = 'La medalla no depende del puesto: un enfrentamiento puede definir el bronce, y con empates dos competidores del mismo puesto pueden medallar. Elige la que corresponda; el puesto queda como referencia. En eventos internacionales la lista incluye a los rivales extranjeros, que se identifican por su bandera y no tienen documento.';

  function dot(k) { return OLC.medalla({ oro: 'gold', plata: 'silver', bronce: 'bronze' }[k], 'none', 18); }
  function plural(n, s, p) { return n + ' ' + (n === 1 ? s : p); }
  function fid(p, f) { return p.id + '|' + f.puesto + '|' + f.deportista; }
  function cap(ui) { return ui.cap = ui.cap || { q: '', sexo: '', ronda: '', tipo: 'ind', pag: 0, picks: {}, guardadas: 0 }; }
  function when(tag, fn) { if (window.customElements) customElements.whenDefined(tag).then(fn); }
  function badge(texto, tema) { return '<span class="nwt-badge nwt-badge--vignette" nwt-variant="quiet" nwt-theme="' + tema + '"><span class="nwt-badge__content"><span class="nwt-badge__label">' + esc(texto) + '</span></span></span>'; }
  function totalH() { return '<span class="nwtab-mh"><span class="nwtab-tri" aria-hidden="true">' + ['oro', 'plata', 'bronce'].map(function (k) { return '<span>' + dot(k) + '</span>'; }).join('') + '</span><span class="nwtab-md-th">Total</span></span>'; }

  /* Candidatos: participantes de pruebas ya disputadas que aún no tienen medalla (empates, combates). */
  function grupos(data, c) {
    var hechas = {}, q = N.norm(c.q), out = [];
    OLC.capturadas(data.evento.code).forEach(function (x) { hechas[x.id] = 1; });
    data.pruebas.forEach(function (p) {
      if (p.estado !== 'Finalizado' || !p.filas.length) return;
      if (c.sexo && p.sexo !== c.sexo) return;
      if (c.ronda && p.ronda !== c.ronda) return;
      var rows = p.filas.filter(function (f) {
        return !f.medalla && f.pais && f.puesto <= 6 && !hechas[fid(p, f)] && (!q || N.norm(f.deportista).indexOf(q) >= 0);
      }).slice(0, 4);
      if (rows.length) out.push({ p: p, rows: rows });
    });
    return out;
  }

  function filtros() {
    return '<div class="nwtab-cap-filtros">' +
      '<nwt-select id="cap-ronda" class="nwtab-cap-f" nwt-size="medium"></nwt-select>' +
      '<nwt-select id="cap-sexo" class="nwtab-cap-f" nwt-size="medium"></nwt-select>' +
      '<nwt-tag-group id="cap-tipo" nwt-size="medium" aria-label="Tipo de participación"></nwt-tag-group>' +
      '<nwt-searchbox id="cap-q" class="nwtab-cap-f nwtab-cap-f--q" nwt-size="medium"></nwt-searchbox></div>';
  }

  function lista(c, gs) {
    if (c.tipo === 'eq') return '<nwt-empty-state heading="No hay pruebas por equipos en este evento" description="Cambia a Individuales para registrar medallas."></nwt-empty-state>';
    if (!gs.length) return '<nwt-empty-state heading="No hay deportistas por asignar con estos filtros" description="Prueba con otra ronda, otro sexo o limpia la búsqueda."></nwt-empty-state>';
    var h = '<div class="nwtab-tw"><table class="nwtab-tb nwtab-md-tb"><caption class="nwtab-sr">Deportistas por asignar medalla</caption><thead><tr><th scope="col">Deportista</th><th scope="col">Medalla</th><th scope="col" class="nwtab-r">Puesto</th></tr></thead>';
    gs.forEach(function (g) {
      h += '<tbody><tr class="nwtab-cap-grp"><th scope="colgroup" colspan="3">' + esc(g.p.deporteNombre) + ' · ' + esc(g.p.nombre) + ' · ' + esc(g.p.sexoNombre) + ' · ' + esc(g.p.ronda) + '<span>' + plural(g.rows.length, 'fila', 'filas') + '</span></th></tr>';
      g.rows.forEach(function (f) {
        var id = fid(g.p, f);
        h += '<tr' + (f.pais === 'CO' ? ' class="nwtab-co"' : '') + '><td><span class="nwtab-dg">' + N.cc(f.pais, f.paisNombre) + '<span class="nwtab-dn">' + esc(f.deportista) + '</span></span></td>' +
          '<td><nwt-tag-group class="nwtab-cap-pick" data-pick="' + esc(id) + '" nwt-size="medium" aria-label="Medalla para ' + esc(f.deportista) + '"></nwt-tag-group></td>' +
          '<td class="nwtab-r nwtab-cap-pu">Puesto ' + f.puesto + '</td></tr>';
      });
      h += '</tbody>';
    });
    return h + '</table></div>';
  }

  function registradas(data, head) {
    var as = OLC.capturadas(data.evento.code);
    var oficiales = data.pruebas.reduce(function (n, p) { return n + p.filas.filter(function (f) { return f.medalla; }).length; }, 0);
    var h = '<div class="nwtab-md-sec">' + head('Medallas registradas (' + as.length + ')', 'Aquí quedan las que registres en esta sesión. Las ' + N.num(oficiales) + ' medallas del resultado oficial ya están en el medallero y no se editan desde esta pantalla.', '', 'cap-as') + '<section class="nwtab-md-card" aria-labelledby="cap-as">';
    if (!as.length) return h + '<nwt-empty-state heading="Aún no registraste medallas" description="Elige una medalla arriba y pulsa «Guardar medallas»."></nwt-empty-state></section></div>';
    h += '<div class="nwtab-tw"><table class="nwtab-tb nwtab-md-tb"><caption class="nwtab-sr">Medallas registradas en esta sesión</caption><thead><tr><th scope="col">Deportista</th><th scope="col">Prueba</th><th scope="col">Medalla</th><th scope="col" class="nwtab-r">Puesto</th><th scope="col" class="nwtab-r"><span class="nwtab-sr">Quitar</span></th></tr></thead><tbody>';
    as.forEach(function (x) {
      h += '<tr><td><span class="nwtab-dg">' + N.cc(x.pais, x.paisNombre) + '<span class="nwtab-dn">' + esc(x.deportista) + '</span></span></td><td>' + esc(x.prueba) + '</td>' +
        '<td><span class="nwtab-cap-tagm"><span aria-hidden="true">' + dot(x.metal) + '</span>' + METAL[x.metal] + '</span></td><td class="nwtab-r nwtab-cap-pu">Puesto ' + x.puesto + '</td>' +
        '<td class="nwtab-r"><nwt-button nwt-variant="quiet" nwt-size="small" data-del="' + esc(x.id) + '" aria-label="Quitar la medalla de ' + esc(x.deportista) + '">Quitar</nwt-button></td></tr>';
    });
    return h + '</tbody></table></div></section></div>';
  }

  /* Medallero general con origen. Agregar, editar y eliminar país son visuales: el prototipo no edita países. */
  function general(data, head) {
    var todos = data.medallero(), gen = todos.slice(0, 8);
    var h = '<div class="nwtab-md-sec">' + head('Medallero general', 'Una sola tabla: Colombia se calcula sola con lo registrado; el resto de países se edita a mano. Es la misma tabla que ve Medallería. Agregar, editar y eliminar país son solo visuales en este prototipo.',
      '<nwt-button nwt-size="small" data-visual="Agregar país">+ Agregar país</nwt-button>', 'cap-gen') + '<section class="nwtab-md-card" aria-labelledby="cap-gen">' +
      '<div class="nwtab-tw"><table class="nwtab-tb nwtab-md-tb"><caption class="nwtab-sr">Medallero general con origen del dato</caption><thead><tr><th scope="col" class="nwtab-md-c1">Pos.</th><th scope="col">País</th>' +
      '<th scope="col" class="nwtab-r"><span class="nwtab-mh">' + dot('oro') + '<span class="nwtab-md-th">Oro</span></span></th><th scope="col" class="nwtab-r"><span class="nwtab-mh">' + dot('plata') + '<span class="nwtab-md-th">Plata</span></span></th><th scope="col" class="nwtab-r"><span class="nwtab-mh">' + dot('bronce') + '<span class="nwtab-md-th">Bronce</span></span></th><th scope="col" class="nwtab-r">' + totalH() + '</th><th scope="col">Origen</th><th scope="col" class="nwtab-r">Acciones</th></tr></thead><tbody>';
    gen.forEach(function (r) {
      var own = r.pais === 'CO';
      h += '<tr' + (own ? ' class="nwtab-co"' : '') + '><td class="nwtab-md-c1">' + r.pos + '</td><td><span class="nwtab-dg">' + N.cc(r.pais, r.paisNombre) + '<span class="nwtab-dn">' + esc(r.paisNombre) + '</span></span></td>' +
        ['oro', 'plata', 'bronce'].map(function (k) { return '<td class="nwtab-r"><span class="nwtab-n' + (r[k] ? '' : ' is-0') + '">' + r[k] + '</span></td>'; }).join('') +
        '<td class="nwtab-r"><b class="nwtab-n nwtab-n--t">' + r.total + '</b></td><td>' + badge(own ? 'Automático' : 'Manual', own ? 'positive' : 'neutral') + '</td><td class="nwtab-r">' +
        (own ? '' : '<div class="nwtab-cap-acc"><nwt-button nwt-variant="quiet" nwt-size="small" data-visual="Editar país">Editar país</nwt-button><nwt-button nwt-variant="quiet" nwt-size="small" data-visual="Eliminar país">Eliminar</nwt-button></div>') + '</td></tr>';
    });
    return h + '</tbody></table></div><span class="nwtab-cap-mut">Se muestran los primeros ' + gen.length + ' de ' + todos.length + ' países.</span></section></div>';
  }

  function html(data, ui, head) {
    var c = cap(ui), gs = grupos(data, c), totalPend = gs.reduce(function (n, g) { return n + g.rows.length; }, 0);
    var pags = Math.max(1, Math.ceil(gs.length / POR_PAG)); if (c.pag >= pags) c.pag = pags - 1;
    var nPick = Object.keys(c.picks).filter(function (k) { return c.picks[k]; }).length;
    var h = '';
    if (c.guardadas) h += '<div class="nwtab-cap-ok"><nwt-alert id="cap-ok" nwt-theme="positive">Medallas guardadas: ' + plural(c.guardadas, 'nueva registrada', 'nuevas registradas') + '.</nwt-alert>' +
      '<nwt-button nwt-variant="quiet" data-md-modo="consulta" id="cap-ver">Ver el efecto en Medallería</nwt-button></div>';
    h += '<div class="nwtab-md-sec">' + head('Registrar medallas', 'Busca al competidor y asígnale su medalla. Al guardar, baja a «Medallas registradas». Las filas van agrupadas por prueba, y el medallero de abajo suma todas las rondas y géneros.', '', 'cap-t') +
      '<section class="nwtab-md-card" aria-labelledby="cap-t">' + filtros() +
      '<nwt-alert id="cap-regla" nwt-theme="informative">' + esc(REGLA) + '</nwt-alert>' +
      lista(c, c.tipo === 'eq' ? [] : gs.slice(c.pag * POR_PAG, c.pag * POR_PAG + POR_PAG)) +
      '<div class="nwtab-cap-pie"><div class="nwtab-cap-pag"><nwt-pagination id="cap-pag"></nwt-pagination><b>' + (c.tipo === 'eq' ? 0 : totalPend - nPick) + ' por asignar</b><span class="nwtab-cap-mut">· los grupos son de esta página</span></div>' +
      '<nwt-button id="cap-save">Guardar medallas' + (nPick ? ' (' + nPick + ')' : '') + '</nwt-button></div></section></div>' +
      registradas(data, head) + general(data, head) + '<div class="nwtab-cap-live" role="status" aria-live="polite" id="cap-live"></div>';
    return h;
  }

  function nativo(host) { var s = host.querySelector('select'); return s ? s.value : ''; }

  function bind(el, data, ui, rerender) {
    var c = cap(ui), code = data.evento.code, $ = function (s) { return el.querySelector(s); };
    var rondas = [], vistas = {};
    data.pruebas.forEach(function (p) { if (p.ronda && !vistas[p.ronda]) { vistas[p.ronda] = 1; rondas.push(p.ronda); } });
    var SEXOS = [['', 'Todos'], ['F', 'Mujeres'], ['M', 'Hombres'], ['X', 'Mixto']];

    when('nwt-select', function () {
      var r = $('#cap-ronda'), s = $('#cap-sexo');
      if (r) {
        r.label = 'Ronda'; r.options = [{ label: TODAS, value: TODAS }].concat(rondas.map(function (x) { return { label: x, value: x }; })); r.value = c.ronda || TODAS;
        r.addEventListener('nwtChange', function () { var v = nativo(r); c.ronda = v === TODAS ? '' : v; c.pag = 0; rerender(); });
      }
      if (s) {
        s.label = 'Sexo de la prueba'; s.options = SEXOS.map(function (x) { return { label: x[1], value: x[1] }; }); s.value = (SEXOS.filter(function (x) { return x[0] === c.sexo; })[0] || SEXOS[0])[1];
        s.addEventListener('nwtChange', function () { var v = nativo(s), m = SEXOS.filter(function (x) { return x[1] === v; })[0]; c.sexo = m ? m[0] : ''; c.pag = 0; rerender(); });
      }
    });
    when('nwt-tag-group', function () {
      var t = $('#cap-tipo');
      if (t) {
        t.items = [{ id: 'ind', label: 'Individuales', value: 'ind' }, { id: 'eq', label: 'Equipos', value: 'eq' }]; t.value = c.tipo;
        t.addEventListener('nwtChange', function (e) { if (e.detail && e.detail !== c.tipo) { c.tipo = e.detail; c.pag = 0; rerender(); } });
      }
      el.querySelectorAll('[data-pick]').forEach(function (g) {
        var id = g.getAttribute('data-pick');
        g.items = ['oro', 'plata', 'bronce'].map(function (k) { return { id: k, label: METAL[k], value: k }; });
        g.value = c.picks[id] || '';
        g.addEventListener('nwtChange', function (e) { if (e.detail && e.detail !== c.picks[id]) { c.picks[id] = e.detail; c.guardadas = 0; rerender(); } });
      });
    });
    when('nwt-searchbox', function () {
      var q = $('#cap-q'); if (!q) return;
      q.label = 'Buscar deportista'; q.placeholder = 'Nombre del deportista…'; q.value = c.q;
      var t;
      q.addEventListener('nwtChange', function (e) {
        var v = e.detail == null ? '' : String(e.detail); if (v === c.q) return;
        clearTimeout(t);
        t = setTimeout(function () {
          c.q = v; c.pag = 0; rerender();
          var i = el.querySelector('#cap-q input'); if (i) { i.focus(); try { i.setSelectionRange(v.length, v.length); } catch (x) { } }
        }, 250);
      });
    });
    when('nwt-pagination', function () {
      var p = $('#cap-pag'); if (!p) return;
      p.totalPages = Math.max(1, Math.ceil(grupos(data, c).length / POR_PAG)); p.currentPage = c.pag + 1; p.labelPage = 'Página'; p.labelOf = 'de';
      p.addEventListener('nwtChange', function (e) { var n = (+e.detail || 1) - 1; if (n !== c.pag) { c.pag = n; rerender(); } });
    });
    when('nwt-alert', function () { el.querySelectorAll('nwt-alert').forEach(function (a) { a.visible = true; }); });
    when('nwt-button', function () {
      var nPick = Object.keys(c.picks).filter(function (k) { return c.picks[k]; }).length, sv = $('#cap-save');
      if (sv) {
        sv.disabled = !nPick;
        sv.addEventListener('click', function () {
          if (!nPick) return;
          var items = [];
          data.pruebas.forEach(function (p) {
            p.filas.forEach(function (f) {
              var id = fid(p, f), k = c.picks[id];
              if (k) items.push({ id: id, deporte: p.deporte, deportista: f.deportista, pais: f.pais, paisNombre: f.paisNombre, metal: k, puesto: f.puesto, sexo: p.sexo, pruebaNombre: p.nombre, prueba: p.deporteNombre + ' · ' + p.nombre + ' · ' + p.sexoNombre });
            });
          });
          OLC.capturar(code, items); c.picks = {}; c.guardadas = items.length; rerender();
        });
      }
      el.querySelectorAll('[data-del]').forEach(function (b) { b.addEventListener('click', function () { OLC.quitarCaptura(code, b.getAttribute('data-del')); c.guardadas = 0; rerender(); }); });
      el.querySelectorAll('[data-visual]').forEach(function (b) {
        b.addEventListener('click', function () { var l = $('#cap-live'); if (l) l.textContent = b.getAttribute('data-visual') + ': acción solo visual en este prototipo.'; });
      });
    });
  }

  window.MedCaptura = { html: html, bind: bind };
})();
