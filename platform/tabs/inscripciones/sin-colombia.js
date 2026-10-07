/* Componente: pruebas del evento sin inscripciones de Colombia. */
(function () {
  var C = window.NWIN, esc = C.esc, num = C.num, card = C.card, vacio = C.vacio, GEN = C.GEN, por = C.por;
  function sinColombia(c) {
    var sin = c.sinCol.slice().sort(function (a, b) { return a.fecha.localeCompare(b.fecha) || a.dep.localeCompare(b.dep); }), n = sin.length;
    var paras = ['Pruebas del evento sin inscripciones de Colombia · ' + c.deps.filter(function (s) { return s.pc; }).length + ' de ' + c.deps.length + ' deportes tuvieron al menos una con Colombia.'];
    var pa = c.pruebas - n;
    /* Mismo patrón que género: total a la izquierda; barra y convenciones a la derecha (DC-044/045). */
    var cuerpo = n ? '<div class="nwtab-in-sb"><p class="nwtab-in-sb__t"><b>' + num(c.pruebas) + '</b><span>pruebas</span></p><div class="nwtab-in-sbar__m"><div class="nwtab-in-sb__b" role="img" aria-label="' + n + ' de ' + c.pruebas + ' pruebas sin participación de Colombia (' + C.pct(n, c.pruebas) + ' %)"><span class="is-on" style="flex:' + pa + ' 1 0"></span><span class="is-off" style="flex:' + n + ' 1 0"></span></div>' +
      '<p class="nwtab-in-sb__k"><span><i class="nwtab-in-sbar__d is-on" aria-hidden="true"></i>Participando <b>' + pa + '</b></span><span><i class="nwtab-in-sbar__d is-off" aria-hidden="true"></i>Sin participar <b>' + n + '</b></span></p></div></div><ul class="nwtab-in-pl">' + sin.slice(0, 6).map(function (x) {
      return '<li><span><b>' + esc(x.nombre) + '</b><small>' + esc(x.dep) + '</small></span><em>' + esc((GEN[x.sx] || '') + ' · ' + OLC.diaCorto(x.fecha)) + '</em><span class="nwtab-in-pl__t">Sin participación</span></li>';
    }).join('') + '</ul>' + (n > 6 ? '<p class="nwtab-in-note">y ' + (n - 6) + ' más</p>' : '')
      : vacio('Sin pruebas pendientes', 'Colombia tiene inscritos en todas las pruebas del evento.');
    return card('sin', 'Pruebas sin participación', paras, cuerpo, '', 'nwtab-in-card--sin');
  }
  C.sinColombia = sinColombia;
})();
