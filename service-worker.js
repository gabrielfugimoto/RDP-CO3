// Service worker minimo: so existe para o navegador considerar o site "instalavel".
// Estrategia "network first": sempre tenta buscar a versao mais nova online.
// So usa o cache se o dispositivo estiver sem internet.

var CACHE_NOME = 'registro-lms-v1';
var ARQUIVOS_BASE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (evento) {
  self.skipWaiting();
  evento.waitUntil(
    caches.open(CACHE_NOME).then(function (cache) {
      return cache.addAll(ARQUIVOS_BASE);
    })
  );
});

self.addEventListener('activate', function (evento) {
  evento.waitUntil(
    caches.keys().then(function (nomes) {
      return Promise.all(
        nomes
          .filter(function (nome) { return nome !== CACHE_NOME; })
          .map(function (nome) { return caches.delete(nome); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (evento) {
  evento.respondWith(
    fetch(evento.request)
      .then(function (resposta) {
        var copia = resposta.clone();
        caches.open(CACHE_NOME).then(function (cache) {
          cache.put(evento.request, copia);
        });
        return resposta;
      })
      .catch(function () {
        return caches.match(evento.request);
      })
  );
});
