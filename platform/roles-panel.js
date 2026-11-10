/* Panel flotante de «Configuraciones de la demo» solo para roles.html: rol y visibilidad de la tabla de países. */
(function () {
  var R = window.MED_ROLES; if (!R) return;
  var set = function (k, v) { try { localStorage.setItem(k, v); } catch (e) { } location.reload(); };
  var d = document.createElement('div');
  d.className = 'nws-roles'; d.setAttribute('role', 'group'); d.setAttribute('aria-label', 'Configuraciones de la demo');
  var btn = function (t, on, k, v) { return '<button type="button" aria-pressed="' + on + '" data-k="' + k + '" data-v="' + v + '">' + t + '</button>'; };
  d.innerHTML = '<b>Demo</b><span>Rol</span><span class="nws-roles__seg">' + btn('Comité Olímpico', R.rol !== 'admin', 'nws:rol', 'comite') + btn('Admin', R.rol === 'admin', 'nws:rol', 'admin') + '</span>' +
    '<span>Medallero de países</span><span class="nws-roles__seg">' + btn('Visible', R.verPaises, 'nws:paises', 'si') + btn('Oculto', !R.verPaises, 'nws:paises', 'no') + '</span>';
  d.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) set(b.getAttribute('data-k'), b.getAttribute('data-v')); });
  var st = document.createElement('style');
  st.textContent = '.nws-roles{position:fixed;right:16px;bottom:16px;z-index:9999;display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;max-width:calc(100vw - 32px);padding:10px 14px;border-radius:12px;background:#14162b;color:#fff;font:600 12px/1.2 Mulish,system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25)}' +
    '.nws-roles__seg{display:inline-flex;gap:3px;padding:3px;border-radius:8px;background:#2b2e4d}' +
    '.nws-roles button{min-height:36px;padding:0 12px;border:0;border-radius:6px;background:transparent;color:#c9cbe0;font:inherit;font-weight:800;cursor:pointer}' +
    '.nws-roles button[aria-pressed="true"]{background:#fff;color:#14162b}.nws-roles button:focus-visible{outline:3px solid #7aa7ff;outline-offset:2px}';
  document.head.appendChild(st); document.body.appendChild(d);
})();
