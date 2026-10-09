# Prototipo unificado · Plataforma + Landing

Dos prototipos HTML navegables de la misma experiencia de eventos (ver `SPEC.md`).

```
cd design-landing-platform
python3 -m http.server 4300
# Plataforma: http://localhost:4300/platform/
# Landing:    http://localhost:4300/landing/
```

`demo.html` abre cada prototipo en un marco con el botón «Configuraciones», que cambia entre ambos conservando la ruta y los filtros.
Datos compartidos en `shared/data.js` (fecha simulada: 18 sep 2026, `OLC.HOY`). Incluye el evento real `suramericanos-sante-fe-2026` (15 países), cuyo modelo está en `shared/real/model.js`: se carga antes de `data.js` y se regenera con `node shared/real/build-model.cjs`. Los demás eventos son sintéticos. Las banderas vienen de flagcdn.com (hotlink). Los países se muestran como países, sin delegaciones ni departamentos.

La plataforma monta el `nwt-sidebar` real del bundle vendorizado (sin `nwt-main-layout`, que es React: el marco es HTML/CSS propio `nws-*`); un importmap en `platform/index.html` mapea `@naowee-tech/sdk-frontend-web` a `platform/assets/sdk-web-stub.js` porque el bundle Stencil lo importa y aquí no hay build. Detalle en `SPEC.md` → «Shell de la plataforma (sidebar)».
