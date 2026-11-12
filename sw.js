// Service Worker: precarga todos los recursos para funcionar sin conexión.
// Estrategia: responde desde la caché al instante y actualiza en segundo plano
// (stale-while-revalidate). El workflow de despliegue sustituye VERSION por el commit.
const VERSION = 'dev';
const CACHE = `cpa-mastery-v3-${VERSION}`;

// Lista completa de recursos. tests/pwa.test.mjs comprueba que no falta ninguno.
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/base.css",
  "./css/components.css",
  "./css/screens.css",
  "./css/tokens.css",
  "./js/app.js",
  "./js/core/achievements.js",
  "./js/core/course.js",
  "./js/core/progress.js",
  "./js/core/srs.js",
  "./js/core/state.js",
  "./js/core/util.js",
  "./js/core/validate.js",
  "./js/exercises/render.js",
  "./js/sim/copilot.js",
  "./js/sim/fs.js",
  "./js/sim/goals.js",
  "./js/sim/parse.js",
  "./js/ui/blocks.js",
  "./js/ui/chat-view.js",
  "./js/ui/dom.js",
  "./js/ui/fx.js",
  "./js/ui/icons.js",
  "./js/views/academy.js",
  "./js/views/activities.js",
  "./js/views/home.js",
  "./js/views/lab.js",
  "./js/views/missions.js",
  "./js/views/profile.js",
  "./js/views/session.js",
  "./content/course.json",
  "./content/lab.json",
  "./content/missions.json",
  "./content/modules/m1.json",
  "./content/modules/m10.json",
  "./content/modules/m2.json",
  "./content/modules/m3.json",
  "./content/modules/m4.json",
  "./content/modules/m5.json",
  "./content/modules/m6.json",
  "./content/modules/m7.json",
  "./content/modules/m8.json",
  "./content/modules/m9.json",
  "./content/resources/aclaracion.eml",
  "./content/resources/actualizacion.eml",
  "./content/resources/agentes.md",
  "./content/resources/capacidades.md",
  "./content/resources/comparables.csv",
  "./content/resources/documento-trabajo.docx",
  "./content/resources/expediente.docx",
  "./content/resources/historicos.csv",
  "./content/resources/metodologia.md",
  "./content/resources/modelo.xlsx",
  "./content/resources/presentacion.pptx",
  "./content/resources/pruebas-agentes.json",
  "./content/resources/resultados-control.json",
  "./content/resources/soluciones.md",
  "./content/resources/studio-lab.md",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/icon.svg"
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // cache: 'reload' evita copias intermedias antiguas del navegador.
    await cache.addAll(ASSETS.map(url => new Request(url, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if ((key.startsWith('cpa-') || key.startsWith('cca-')) && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

// La app pregunta qué versión está instalada (se muestra en Perfil).
self.addEventListener('message', event => {
  if (event.data?.type === 'version') event.ports[0]?.postMessage(VERSION);
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // Las navegaciones (abrir la app, recargar) siempre usan index.html.
    const key = request.mode === 'navigate' && !url.pathname.includes('/content/resources/') ? './index.html' : request;
    const cached = await cache.match(key, { ignoreSearch: true });
    const network = fetch(request).then(response => {
      if (response.ok && response.type === 'basic') cache.put(key, response.clone());
      return response;
    }).catch(() => null);
    if (cached) {
      event.waitUntil(network);
      return cached;
    }
    const fresh = await network;
    return fresh || new Response('Sin conexión y sin copia local de este recurso.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  })());
});
