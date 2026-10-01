const CACHE='plain-charisma-v1';
const ASSETS=['./','index.html','styles.css','app.js','manifest.webmanifest',
 'data/week1.js','data/week2.js','data/week3.js','data/week4.js',
 'icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==location.origin)return;
  e.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const hit=await cache.match(req,{ignoreSearch:true});
    const net=fetch(req).then(r=>{if(r&&r.ok)cache.put(req,r.clone());return r}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}
    const r=await net;
    if(r)return r;
    if(req.mode==='navigate'){const idx=await cache.match('index.html');if(idx)return idx}
    return new Response('Offline',{status:503,statusText:'Offline'});
  })());
});
