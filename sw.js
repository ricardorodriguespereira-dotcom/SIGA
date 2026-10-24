/* SIGA — guarda o app no aparelho para abrir sem internet.
   Os caches do SIGA começam com "siga-" e só eles são limpos aqui (o SGC fica no mesmo endereço). */
const V='siga-v2', EXT='siga-ext';
const SHELL=['./','./index.html','./config.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>/^siga-/.test(k)&&k!==V&&k!==EXT).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.origin===location.origin){
    if(r.mode==='navigate'||/\/(index\.html|config\.js)$/.test(u.pathname)){e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>{c.put(r.mode==='navigate'?'./index.html':r,cp);c.match('./icon-192.png').then(m=>m||c.addAll(SHELL).catch(()=>{}))});return res}).catch(()=>caches.match(r.mode==='navigate'?'./index.html':r)));return}
    e.respondWith(caches.match(r).then(m=>m||fetch(r)));return}
  if(/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)||(u.hostname==='drive.google.com'&&u.pathname==='/thumbnail')){
    e.respondWith(caches.open(EXT).then(async c=>{const m=await c.match(r);if(m)return m;try{const res=await fetch(r);c.put(r,res.clone());return res}catch(x){return m||Response.error()}}))}
});
