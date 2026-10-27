/* Landing · pestaña «Medallería»: tarjetas, General | Por deporte y Top 5 + Colombia fijada. */
(function () {
  'use strict';
  window.Tabs = window.Tabs || {};
  window.Tabs['medalleria'] = {
    render: function (el, ctx) {
      var L = window.LPT;
      if (!L) { el.innerHTML = '<p class="lp-empty">Sección en construcción.</p>'; return; }
      var esc = L.esc, data = ctx.data;
      var ui = ctx.ui.med = ctx.ui.med || { modo: 'general', dep: '', todo: false };
      var porDep = ui.modo === 'deporte';
      /* solo deportes que ya tienen medallas; con menos de dos no hay corte «Por deporte» */
      var conMed = data.deportes.filter(function (d) { return data.medallero(d.codigo).length; });
      var corte = conMed.length > 1;
      if (!corte) { porDep = false; ui.modo = 'general'; }
      var dep = ui.dep || ctx.params.deporte || '';
      if (!conMed.some(function (d) { return d.codigo === dep; })) dep = conMed.length ? conMed[0].codigo : '';
      var depNom = conMed.filter(function (d) { return d.codigo === dep; })[0];
      depNom = depNom ? depNom.nombre : '';
      var rows = data.medallero(porDep ? dep : undefined);
      var tot = { oro: 0, plata: 0, bronce: 0, total: 0 };
      rows.forEach(function (r) { tot.oro += r.oro; tot.plata += r.plata; tot.bronce += r.bronce; tot.total += r.total; });
      var titulo = porDep ? 'Medallería por deporte · ' + depNom : 'Medallería general';

      var h = '<div class="lp-tab lp-med"><div class="lp-med-bar"><div class="lp-med-t"><span class="lp-med-ic">' + L.svg('medal') + '</span><h2>' + esc(porDep ? 'Medallería podio · ' + depNom : 'Medallería podio') + '</h2></div>' +
        (corte ? '<div class="lp-seg lp-seg-txt" role="group" aria-label="Corte del medallero"><button type="button" data-modo="general" aria-pressed="' + !porDep + '">General</button><button type="button" data-modo="deporte" aria-pressed="' + porDep + '">Por deporte</button></div>' : '') + '</div>';

      if (porDep) {
        h += '<div class="lp-fld lp-med-sel"><label for="lp-med-dep">Deporte</label><div class="lp-sel"><select id="lp-med-dep">' +
          conMed.map(function (d) { return '<option value="' + d.codigo + '"' + (d.codigo === dep ? ' selected' : '') + '>' + esc(d.nombre) + '</option>'; }).join('') + '</select>' + L.svg('chev') + '</div></div>';
      }

      if (!rows.length) {
        var nc = data.colombia.participa;
        el.innerHTML = '<div class="lp-tab lp-med"><div class="lp-empty"><p>Aún no hay medallas.' + (nc ? ' Colombia compite en ' + nc + (nc === 1 ? ' prueba.' : ' pruebas.') : '') + '</p></div></div>';
        bind(); return;
      }

      /* Podio: los tres primeros del corte vigente (2-1-3 en escritorio, 1-2-3 apilado en móvil) */
      /* Bandera a la izquierda del nombre; si la imagen falla queda el código */
      var bandera = function (r) {
        var b = OLC.bandera(r.pais, 40);
        return '<span class="lp-pod-fl">' + (b ? '<img src="' + esc(b.src) + '" srcset="' + esc(b.srcset) + '" width="28" height="21" alt="" onerror="this.hidden=true;this.nextSibling.hidden=false">' : '') + '<span class="lp-pod-fc"' + (b ? ' hidden' : '') + '>' + esc(r.pais) + '</span></span>';
      };
      h += '<section class="lp-pod" aria-label="Podio de la medallería"><ol class="lp-pod-l">' + rows.slice(0, 3).map(function (r, i) {
        var k = i + 1;
        return '<li class="lp-pod-i lp-pod-' + k + (r.pais === 'CO' ? ' lp-pod-co' : '') + '"><span class="lp-pod-av">' + OLC.medalla(['gold', 'silver', 'bronze'][i], k, k === 1 ? 190 : 140, '') + '</span>' +
          '<span class="lp-sr">Posición ' + r.pos + '</span><b class="lp-pod-n">' + bandera(r) + esc(r.paisNombre) + '</b>' +
          '<span class="lp-pod-s">' + r.oro + ' oro · ' + r.plata + ' plata · ' + r.bronce + ' bronce</span>' +
          '<span class="lp-pod-t">' + r.total + (r.total === 1 ? ' medalla' : ' medallas') + '</span></li>';
      }).join('') + '</ol></section>';

      /* top 5 + Colombia fijada */
      var colIx = rows.map(function (r) { return r.pais; }).indexOf('CO');
      var visibles = rows; /* DC-068: siempre la tabla completa */
      var fijar = false;
      var fila = function (r) {
        var co = r.pais === 'CO';
        return '<tr' + (co ? ' class="lp-mco"' : '') + '><td>' + LPT.pos(r.pos, true, '<span class="lp-sr">Posición </span>') + '</td>' +
          '<td><span class="lp-mct">' + L.cc(r.pais, r.paisNombre) + '<b>' + esc(r.paisNombre) + '</b>' + (co ? '<span class="lp-mtg">Nuestro país</span>' : '') + '</span></td>' +
          '<td class="lp-r">' + r.oro + '</td><td class="lp-r">' + r.plata + '</td><td class="lp-r">' + r.bronce + '</td><td class="lp-r lp-mt">' + r.total + '</td></tr>';
      };
      var total = function () { return '<span class="lp-md lp-md--tri">' + ['gold', 'silver', 'bronze'].map(function (k) { return '<span class="lp-md--tri__' + k.charAt(0) + '">' + OLC.medalla(k, 'none', 18) + '</span>'; }).join('') + '<span class="lp-md-t">Total</span></span>'; };
      var dot = function (k, t) { return '<span class="lp-md">' + OLC.medalla({ g: 'gold', s: 'silver', b: 'bronze' }[k], 'none', 18) + '<span class="lp-md-t">' + t + '</span></span>'; };
      h += '<div class="lp-med-t lp-med-t2"><span class="lp-med-ic">' + L.svg('medal') + '</span><h2>' + esc(titulo) + '</h2></div>';
      h += '<div class="lp-mtw"><table class="lp-tb lp-mt-tb"><caption class="lp-sr">' + esc(titulo) + ': todos' + '</caption><thead><tr><th scope="col" class="lp-w1">Pos.</th><th scope="col">País</th>' +
        '<th scope="col" class="lp-r lp-wm">' + dot('g', 'Oro') + '</th><th scope="col" class="lp-r lp-wm">' + dot('s', 'Plata') + '</th><th scope="col" class="lp-r lp-wm">' + dot('b', 'Bronce') + '</th><th scope="col" class="lp-r lp-wm">' + total() + '</th></tr></thead><tbody>' +
        visibles.map(fila).join('');
      if (fijar) h += '<tr class="lp-mgap"><td colspan="6"><span><i aria-hidden="true">···</i>Colombia · posición ' + rows[colIx].pos + ' de ' + rows.length + '</span></td></tr>' + fila(rows[colIx]);
      h += '</tbody></table></div>';

      h += '<div class="lp-mft"><span class="lp-cap">Ordenado por oros, luego platas y bronces' + (porDep ? ' · ' + tot.total + ' medallas en ' + esc(depNom) : '') + '</span>';
      el.innerHTML = h + '</div></div>';
      bind();

      function bind() {
        var redraw = function (id) { window.Tabs['medalleria'].render(el, ctx); var f = id && el.querySelector('#' + id); if (f) f.focus(); };
        el.querySelectorAll('[data-modo]').forEach(function (b) { b.addEventListener('click', function () { ui.modo = b.getAttribute('data-modo'); ui.todo = false; redraw(); }); });
        var s = el.querySelector('#lp-med-dep'); if (s) s.addEventListener('change', function () { ui.dep = s.value; ui.todo = false; redraw('lp-med-dep'); });
      }
    }
  };
})();
