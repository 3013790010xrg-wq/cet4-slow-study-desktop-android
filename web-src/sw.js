const CACHE='cet4-slow-study-v2-countdown';
const CORE=['./','./index.html','./style.css','./data.js','./extra-data.js','./mock-data.js','./grader.js','./mock.js','./app.js','./mobile-assets.js','./viewer.html','./viewer.css','./viewer.js','./register-sw.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./vendor/pdf.mjs','./vendor/pdf.worker.mjs'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE.map(url=>new Request(url,{cache:'reload'})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))),self.clients.claim()]));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request)));
});
