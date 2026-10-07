/* Componente: cobertura por deporte (tabla «Por deporte»), 1:1 con el diseño aprobado. */
(function () {
  var C = window.NWIN, esc = C.esc, num = C.num, card = C.card, vacio = C.vacio, por = C.por;
  var ORD = { dep: 'Deporte', ath: 'Deportistas', ins: 'Inscripciones', cob: 'Pruebas con Colombia' };
  var DIR = { dep: 'asc', ath: 'desc', ins: 'desc', cob: 'asc' };
  var CHECK = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>';
  var ALERT = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16v.5"/></svg>';

  function cuadros(s) {
    var q = ''; for (var i = 0; i < s.pruebas; i++) q += '<i class="' + (i < s.pc ? 'is-on' : '') + '"></i>';
    return '<span class="nwtab-in-dq" role="img" aria-label="' + s.pc + ' de ' + s.pruebas + ' pruebas con Colombia">' + q + '</span>';
  }

  function estado(s) {
    var f = s.pruebas - s.pc;
    return f ? '<span class="nwtab-in-de nwtab-in-de--no">' + ALERT + (f === 1 ? 'Falta 1 prueba' : 'Faltan ' + f + ' pruebas') + '</span>'
      : '<span class="nwtab-in-de nwtab-in-de--ok">' + CHECK + 'Completa</span>';
  }

  function fila(s) {
    var nota = s.conj ? (s.ins === 1 ? '1 equipo' : s.ins + ' equipos') : s.eq ? s.eq + ' de equipo' : '';
    return '<tr><th scope="row" class="nwtab-in-d__n">' + esc(s.nombre) + '</th>' +
      '<td class="nwtab-in-d__a' + (s.conj ? ' is-na' : '') + '">' + (s.conj ? '<span aria-label="No aplica">—</span>' : '<b>' + num(s.athN) + '</b>') + '</td>' +
      '<td class="nwtab-in-d__i"><b>' + num(s.ins) + '</b>' + (nota ? '<small>' + nota + '</small>' : '') + '</td>' +
      '<td class="nwtab-in-d__q">' + cuadros(s) + '</td><td class="nwtab-in-d__e">' + estado(s) + '</td></tr>';
  }

  function grupo(nombre, nota, arr) {
    return arr.length ? '<tr class="nwtab-in-d__gr"><th scope="rowgroup" colspan="5">' + nombre + ' <span>' + arr.length + (arr.length === 1 ? ' deporte' : ' deportes') + nota + '</span></th></tr>' + arr.map(fila).join('') : '';
  }

  function porDeporte(c, ui) {
    var tit = por(c, { pasado: '¿En cuántas pruebas de cada deporte compitió Colombia?', presente: '¿En cuántas pruebas de cada deporte compite Colombia?', futuro: '¿En cuántas pruebas de cada deporte competirá Colombia?' });
    var paras = ['Cada cuadro es una prueba del deporte: lleno, Colombia compitió; vacío, la prueba quedó sin Colombia.', 'Deportistas no se suma: una misma persona puede competir en varios deportes (son ' + num(c.deportistas) + ' distintas).'];
    var con = c.deps.filter(function (s) { return s.pc > 0; });
    if (!con.length) return card('dep', tit, paras, vacio('Colombia aún no tiene inscritos en ningún deporte', 'La tabla aparece cuando haya deportistas inscritos.'), '', 'nwtab-in-card--dep');

    var k = ORD[ui.orden] ? ui.orden : 'ins', d = ui.ordenD === 'asc' || ui.ordenD === 'desc' ? ui.ordenD : DIR[k];
    var flip = d === DIR[k] ? 1 : -1;
    var cmp = {
      dep: function (a, b) { return a.nombre.localeCompare(b.nombre, 'es'); },
      ath: function (a, b) { return b.athN - a.athN; },
      ins: function (a, b) { return b.ins - a.ins; },
      cob: function (a, b) { return a.pc / a.pruebas - b.pc / b.pruebas; }
    }[k];
    var filtro = ui.filtro === 'ok' || ui.filtro === 'falta' ? ui.filtro : 'todos';
    var nOk = con.filter(function (s) { return s.pc === s.pruebas; }).length;
    var orden = function (arr) {
      return arr.filter(function (s) { return filtro === 'todos' || (filtro === 'ok') === (s.pc === s.pruebas); })
        .sort(function (a, b) { return flip * cmp(a, b) || a.nombre.localeCompare(b.nombre, 'es'); });
    };

    var chip = function (f, largo, corto, n) {
      return '<button type="button" class="nwtab-in-dchip" data-k="in-filtro-' + f + '" data-in-filtro="' + f + '" aria-pressed="' + (filtro === f) + '"><span class="nwtab-in-dchip__l">' + largo + '</span><span class="nwtab-in-dchip__s">' + corto + '</span> · ' + n + '</button>';
    };
    var tools = '<div class="nwtab-in-dtools"><div class="nwtab-in-dchips" role="group" aria-label="Filtrar deportes">' + chip('todos', 'Todos', 'Todos', con.length) + chip('ok', 'Con todas las pruebas', 'Completos', nOk) + chip('falta', 'Con pruebas sin Colombia', 'Con faltantes', con.length - nOk) + '</div>' +
      '<div class="nwtab-in-dsum"><strong>' + num(c.pruebasCol) + '</strong> de ' + num(c.pruebas) + ' pruebas con Colombia</div></div>';

    var th = function (key, al) {
      var on = k === key, arrow = on ? (d === 'desc' ? '↓' : '↑') : '↕';
      return '<th scope="col" class="' + al + '" aria-sort="' + (on ? (d === 'desc' ? 'descending' : 'ascending') : 'none') + '"><button type="button" class="nwtab-in-dth' + (on ? ' is-on' : '') + '" data-k="in-orden-' + key + '" data-in-orden="' + key + '">' + ORD[key] + ' <span aria-hidden="true">' + arrow + '</span></button></th>';
    };
    var cuerpo = tools + '<table class="nw-table nwtab-in-d"><caption class="nwtab-vh">Deportistas, inscripciones y pruebas con Colombia en cada deporte</caption><thead><tr>' + th('dep', 'l') + th('ath', 'r') + th('ins', 'r') + th('cob', 'q') + '<th scope="col" class="e">Estado</th></tr></thead><tbody>' +
      grupo('Deportes individuales', '', orden(con.filter(function (s) { return !s.conj; }))) +
      grupo('Deportes de conjunto', ' · se inscriben equipos, no deportistas', orden(con.filter(function (s) { return s.conj; }))) + '</tbody></table>';
    return card('dep', tit, paras, cuerpo, '', 'nwtab-in-card--dep');
  }
  C.deportes = porDeporte;
})();
