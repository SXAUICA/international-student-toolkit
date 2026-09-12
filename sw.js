/* Service Worker —— 让指南页能离线打开、能装到手机桌面
   策略：优先读缓存，命中就直接给（离线可用）；没命中再走网络并写入缓存。
   注意：改了页面内容后，把下面的版本号 +1，否则老用户会一直看到旧版本。 */

var CACHE = 'sxauica-guide-v1';

var ASSETS = [
  './留学生手册-网页demo.html',
  './校园地图底图.jpg',
  './校园地图节点.js',
  './map_data.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); }).catch(function () {});
        return res;
      }).catch(function () {
        return caches.match('./留学生手册-网页demo.html');
      });
    })
  );
});
