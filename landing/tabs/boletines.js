/* Landing · pestaña «Boletines técnicos»: un archivo por jornada, con Descargar (CSV) y Ver PDF. */
(function () {
  'use strict';
  window.Tabs = window.Tabs || {};
  window.Tabs['boletines'] = {
    render: function (el, ctx) {
      var L = window.LPT, data = ctx.data, lista = OLC.boletines(data), esc = L.esc;
      if (!lista.length) { el.innerHTML = '<div class="lp-void"><strong>Aún no hay boletines.</strong><p>Se publican al cierre de cada jornada con resultados.</p></div>'; return; }
      el.innerHTML = '<div class="lp-tab lp-bol"><h2 class="lp-bol-t">Boletines técnicos</h2><p class="lp-bol-s">Resultados oficiales por jornada, en PDF para leer y en CSV para trabajar con los datos.</p><ul class="lp-bol-l">' +
        lista.map(function (b) {
          return '<li class="lp-bol-i"><div><b>' + esc(b.titulo) + '</b><span>' + esc(OLC.fechaLarga(b.fecha)) + ' · ' + b.pruebas.length + (b.pruebas.length === 1 ? ' prueba' : ' pruebas') + '</span></div>' +
            '<div class="lp-bol-a"><button type="button" class="lp-bol-b" data-bol-pdf="' + b.id + '">Ver PDF</button><button type="button" class="lp-bol-b lp-bol-b--p" data-bol-csv="' + b.id + '">Descargar CSV</button></div></li>';
        }).join('') + '</ul></div>';
      OLC.boletinesBind(el, data, lista);
    }
  };
})();
