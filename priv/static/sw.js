try{self["workbox:core:7.2.0"]&&_()}catch(t){}const t=(t,...e)=>{let s=t;return e.length>0&&(s+=` :: ${JSON.stringify(e)}`),s};class e extends Error{constructor(e,s){super(t(e,s)),this.name=e,this.details=s}}try{self["workbox:routing:7.2.0"]&&_()}catch(t){}const s=t=>t&&"object"==typeof t?t:{handle:t};class n{constructor(t,e,n="GET"){this.handler=s(e),this.match=t,this.method=n}setCatchHandler(t){this.catchHandler=s(t)}}class i extends n{constructor(t,e,s){super((({url:e})=>{const s=t.exec(e.href);if(s&&(e.origin===location.origin||0===s.index))return s.slice(1)}),e,s)}}class r{constructor(){this.t=new Map,this.i=new Map}get routes(){return this.t}addFetchListener(){self.addEventListener("fetch",(t=>{const{request:e}=t,s=this.handleRequest({request:e,event:t});s&&t.respondWith(s)}))}addCacheListener(){self.addEventListener("message",(t=>{if(t.data&&"CACHE_URLS"===t.data.type){const{payload:e}=t.data,s=Promise.all(e.urlsToCache.map((e=>{"string"==typeof e&&(e=[e]);const s=new Request(...e);return this.handleRequest({request:s,event:t})})));t.waitUntil(s),t.ports&&t.ports[0]&&s.then((()=>t.ports[0].postMessage(!0)))}}))}handleRequest({request:t,event:e}){const s=new URL(t.url,location.href);if(!s.protocol.startsWith("http"))return;const n=s.origin===location.origin,{params:i,route:r}=this.findMatchingRoute({event:e,request:t,sameOrigin:n,url:s});let a=r&&r.handler;const o=t.method;if(!a&&this.i.has(o)&&(a=this.i.get(o)),!a)return;let c;try{c=a.handle({url:s,request:t,event:e,params:i})}catch(t){c=Promise.reject(t)}const h=r&&r.catchHandler;return c instanceof Promise&&(this.o||h)&&(c=c.catch((async n=>{if(h)try{return await h.handle({url:s,request:t,event:e,params:i})}catch(t){t instanceof Error&&(n=t)}if(this.o)return this.o.handle({url:s,request:t,event:e});throw n}))),c}findMatchingRoute({url:t,sameOrigin:e,request:s,event:n}){const i=this.t.get(s.method)||[];for(const r of i){let i;const a=r.match({url:t,sameOrigin:e,request:s,event:n});if(a)return i=a,(Array.isArray(i)&&0===i.length||a.constructor===Object&&0===Object.keys(a).length||"boolean"==typeof a)&&(i=void 0),{route:r,params:i}}return{}}setDefaultHandler(t,e="GET"){this.i.set(e,s(t))}setCatchHandler(t){this.o=s(t)}registerRoute(t){this.t.has(t.method)||this.t.set(t.method,[]),this.t.get(t.method).push(t)}unregisterRoute(t){if(!this.t.has(t.method))throw new e("unregister-route-but-not-found-with-method",{method:t.method});const s=this.t.get(t.method).indexOf(t);if(!(s>-1))throw new e("unregister-route-route-not-registered");this.t.get(t.method).splice(s,1)}}let a;const o=()=>(a||(a=new r,a.addFetchListener(),a.addCacheListener()),a);function c(t,s,r){let a;if("string"==typeof t){const e=new URL(t,location.href);a=new n((({url:t})=>t.href===e.href),s,r)}else if(t instanceof RegExp)a=new i(t,s,r);else if("function"==typeof t)a=new n(t,s,r);else{if(!(t instanceof n))throw new e("unsupported-route-type",{moduleName:"workbox-routing",funcName:"registerRoute",paramName:"capture"});a=t}return o().registerRoute(a),a}try{self["workbox:strategies:7.2.0"]&&_()}catch(t){}const h={cacheWillUpdate:async({response:t})=>200===t.status||0===t.status?t:null},u={googleAnalytics:"googleAnalytics",precache:"precache-v2",prefix:"workbox",runtime:"runtime",suffix:"undefined"!=typeof registration?registration.scope:""},l=t=>[u.prefix,t,u.suffix].filter((t=>t&&t.length>0)).join("-"),f=t=>t||l(u.precache),w=t=>t||l(u.runtime);function d(t,e){const s=new URL(t);for(const t of e)s.searchParams.delete(t);return s.href}class p{constructor(){this.promise=new Promise(((t,e)=>{this.resolve=t,this.reject=e}))}}const y=new Set;function m(t){return"string"==typeof t?new Request(t):t}class g{constructor(t,e){this.h={},Object.assign(this,e),this.event=e.event,this.u=t,this.l=new p,this.p=[],this.m=[...t.plugins],this.v=new Map;for(const t of this.m)this.v.set(t,{});this.event.waitUntil(this.l.promise)}async fetch(t){const{event:s}=this;let n=m(t);if("navigate"===n.mode&&s instanceof FetchEvent&&s.preloadResponse){const t=await s.preloadResponse;if(t)return t}const i=this.hasCallback("fetchDidFail")?n.clone():null;try{for(const t of this.iterateCallbacks("requestWillFetch"))n=await t({request:n.clone(),event:s})}catch(t){if(t instanceof Error)throw new e("plugin-error-request-will-fetch",{thrownErrorMessage:t.message})}const r=n.clone();try{let t;t=await fetch(n,"navigate"===n.mode?void 0:this.u.fetchOptions);for(const e of this.iterateCallbacks("fetchDidSucceed"))t=await e({event:s,request:r,response:t});return t}catch(t){throw i&&await this.runCallbacks("fetchDidFail",{error:t,event:s,originalRequest:i.clone(),request:r.clone()}),t}}async fetchAndCachePut(t){const e=await this.fetch(t),s=e.clone();return this.waitUntil(this.cachePut(t,s)),e}async cacheMatch(t){const e=m(t);let s;const{cacheName:n,matchOptions:i}=this.u,r=await this.getCacheKey(e,"read"),a=Object.assign(Object.assign({},i),{cacheName:n});s=await caches.match(r,a);for(const t of this.iterateCallbacks("cachedResponseWillBeUsed"))s=await t({cacheName:n,matchOptions:i,cachedResponse:s,request:r,event:this.event})||void 0;return s}async cachePut(t,s){const n=m(t);var i;await(i=0,new Promise((t=>setTimeout(t,i))));const r=await this.getCacheKey(n,"write");if(!s)throw new e("cache-put-with-no-response",{url:(a=r.url,new URL(String(a),location.href).href.replace(new RegExp(`^${location.origin}`),""))});var a;const o=await this.R(s);if(!o)return!1;const{cacheName:c,matchOptions:h}=this.u,u=await self.caches.open(c),l=this.hasCallback("cacheDidUpdate"),f=l?await async function(t,e,s,n){const i=d(e.url,s);if(e.url===i)return t.match(e,n);const r=Object.assign(Object.assign({},n),{ignoreSearch:!0}),a=await t.keys(e,r);for(const e of a)if(i===d(e.url,s))return t.match(e,n)}(u,r.clone(),["__WB_REVISION__"],h):null;try{await u.put(r,l?o.clone():o)}catch(t){if(t instanceof Error)throw"QuotaExceededError"===t.name&&await async function(){for(const t of y)await t()}(),t}for(const t of this.iterateCallbacks("cacheDidUpdate"))await t({cacheName:c,oldResponse:f,newResponse:o.clone(),request:r,event:this.event});return!0}async getCacheKey(t,e){const s=`${t.url} | ${e}`;if(!this.h[s]){let n=t;for(const t of this.iterateCallbacks("cacheKeyWillBeUsed"))n=m(await t({mode:e,request:n,event:this.event,params:this.params}));this.h[s]=n}return this.h[s]}hasCallback(t){for(const e of this.u.plugins)if(t in e)return!0;return!1}async runCallbacks(t,e){for(const s of this.iterateCallbacks(t))await s(e)}*iterateCallbacks(t){for(const e of this.u.plugins)if("function"==typeof e[t]){const s=this.v.get(e),n=n=>{const i=Object.assign(Object.assign({},n),{state:s});return e[t](i)};yield n}}waitUntil(t){return this.p.push(t),t}async doneWaiting(){let t;for(;t=this.p.shift();)await t}destroy(){this.l.resolve(null)}async R(t){let e=t,s=!1;for(const t of this.iterateCallbacks("cacheWillUpdate"))if(e=await t({request:this.request,response:e,event:this.event})||void 0,s=!0,!e)break;return s||e&&200!==e.status&&(e=void 0),e}}class v{constructor(t={}){this.cacheName=w(t.cacheName),this.plugins=t.plugins||[],this.fetchOptions=t.fetchOptions,this.matchOptions=t.matchOptions}handle(t){const[e]=this.handleAll(t);return e}handleAll(t){t instanceof FetchEvent&&(t={event:t,request:t.request});const e=t.event,s="string"==typeof t.request?new Request(t.request):t.request,n="params"in t?t.params:void 0,i=new g(this,{event:e,request:s,params:n}),r=this.q(i,s,e);return[r,this.D(r,i,s,e)]}async q(t,s,n){let i;await t.runCallbacks("handlerWillStart",{event:n,request:s});try{if(i=await this.U(s,t),!i||"error"===i.type)throw new e("no-response",{url:s.url})}catch(e){if(e instanceof Error)for(const r of t.iterateCallbacks("handlerDidError"))if(i=await r({error:e,event:n,request:s}),i)break;if(!i)throw e}for(const e of t.iterateCallbacks("handlerWillRespond"))i=await e({event:n,request:s,response:i});return i}async D(t,e,s,n){let i,r;try{i=await t}catch(r){}try{await e.runCallbacks("handlerDidRespond",{event:n,request:s,response:i}),await e.doneWaiting()}catch(t){t instanceof Error&&(r=t)}if(await e.runCallbacks("handlerDidComplete",{event:n,request:s,response:i,error:r}),e.destroy(),r)throw r}}function R(t){t.then((()=>{}))}function b(){return b=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var s=arguments[e];for(var n in s)({}).hasOwnProperty.call(s,n)&&(t[n]=s[n])}return t},b.apply(null,arguments)}let q,D;const x=new WeakMap,U=new WeakMap,E=new WeakMap,I=new WeakMap,L=new WeakMap;let j={get(t,e,s){if(t instanceof IDBTransaction){if("done"===e)return U.get(t);if("objectStoreNames"===e)return t.objectStoreNames||E.get(t);if("store"===e)return s.objectStoreNames[1]?void 0:s.objectStore(s.objectStoreNames[0])}return C(t[e])},set:(t,e,s)=>(t[e]=s,!0),has:(t,e)=>t instanceof IDBTransaction&&("done"===e||"store"===e)||e in t};function N(t){return t!==IDBDatabase.prototype.transaction||"objectStoreNames"in IDBTransaction.prototype?(D||(D=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])).includes(t)?function(...e){return t.apply(T(this),e),C(x.get(this))}:function(...e){return C(t.apply(T(this),e))}:function(e,...s){const n=t.call(T(this),e,...s);return E.set(n,e.sort?e.sort():[e]),C(n)}}function k(t){return"function"==typeof t?N(t):(t instanceof IDBTransaction&&function(t){if(U.has(t))return;const e=new Promise(((e,s)=>{const n=()=>{t.removeEventListener("complete",i),t.removeEventListener("error",r),t.removeEventListener("abort",r)},i=()=>{e(),n()},r=()=>{s(t.error||new DOMException("AbortError","AbortError")),n()};t.addEventListener("complete",i),t.addEventListener("error",r),t.addEventListener("abort",r)}));U.set(t,e)}(t),e=t,(q||(q=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])).some((t=>e instanceof t))?new Proxy(t,j):t);var e}function C(t){if(t instanceof IDBRequest)return function(t){const e=new Promise(((e,s)=>{const n=()=>{t.removeEventListener("success",i),t.removeEventListener("error",r)},i=()=>{e(C(t.result)),n()},r=()=>{s(t.error),n()};t.addEventListener("success",i),t.addEventListener("error",r)}));return e.then((e=>{e instanceof IDBCursor&&x.set(e,t)})).catch((()=>{})),L.set(e,t),e}(t);if(I.has(t))return I.get(t);const e=k(t);return e!==t&&(I.set(t,e),L.set(e,t)),e}const T=t=>L.get(t);const O=["get","getKey","getAll","getAllKeys","count"],B=["put","add","delete","clear"],M=new Map;function P(t,e){if(!(t instanceof IDBDatabase)||e in t||"string"!=typeof e)return;if(M.get(e))return M.get(e);const s=e.replace(/FromIndex$/,""),n=e!==s,i=B.includes(s);if(!(s in(n?IDBIndex:IDBObjectStore).prototype)||!i&&!O.includes(s))return;const r=async function(t,...e){const r=this.transaction(t,i?"readwrite":"readonly");let a=r.store;return n&&(a=a.index(e.shift())),(await Promise.all([a[s](...e),i&&r.done]))[0]};return M.set(e,r),r}j=(t=>b({},t,{get:(e,s,n)=>P(e,s)||t.get(e,s,n),has:(e,s)=>!!P(e,s)||t.has(e,s)}))(j);try{self["workbox:expiration:7.2.0"]&&_()}catch(t){}const S="cache-entries",W=t=>{const e=new URL(t,location.href);return e.hash="",e.href};class A{constructor(t){this._=null,this.I=t}L(t){const e=t.createObjectStore(S,{keyPath:"id"});e.createIndex("cacheName","cacheName",{unique:!1}),e.createIndex("timestamp","timestamp",{unique:!1})}j(t){this.L(t),this.I&&function(t,{blocked:e}={}){const s=indexedDB.deleteDatabase(t);e&&s.addEventListener("blocked",(t=>e(t.oldVersion,t))),C(s).then((()=>{}))}(this.I)}async setTimestamp(t,e){const s={url:t=W(t),timestamp:e,cacheName:this.I,id:this.N(t)},n=(await this.getDb()).transaction(S,"readwrite",{durability:"relaxed"});await n.store.put(s),await n.done}async getTimestamp(t){const e=await this.getDb(),s=await e.get(S,this.N(t));return null==s?void 0:s.timestamp}async expireEntries(t,e){const s=await this.getDb();let n=await s.transaction(S).store.index("timestamp").openCursor(null,"prev");const i=[];let r=0;for(;n;){const s=n.value;s.cacheName===this.I&&(t&&s.timestamp<t||e&&r>=e?i.push(n.value):r++),n=await n.continue()}const a=[];for(const t of i)await s.delete(S,t.id),a.push(t.url);return a}N(t){return this.I+"|"+W(t)}async getDb(){return this._||(this._=await function(t,e,{blocked:s,upgrade:n,blocking:i,terminated:r}={}){const a=indexedDB.open(t,e),o=C(a);return n&&a.addEventListener("upgradeneeded",(t=>{n(C(a.result),t.oldVersion,t.newVersion,C(a.transaction),t)})),s&&a.addEventListener("blocked",(t=>s(t.oldVersion,t.newVersion,t))),o.then((t=>{r&&t.addEventListener("close",(()=>r())),i&&t.addEventListener("versionchange",(t=>i(t.oldVersion,t.newVersion,t)))})).catch((()=>{})),o}("workbox-expiration",1,{upgrade:this.j.bind(this)})),this._}}class K{constructor(t,e={}){this.k=!1,this.C=!1,this.T=e.maxEntries,this.O=e.maxAgeSeconds,this.B=e.matchOptions,this.I=t,this.M=new A(t)}async expireEntries(){if(this.k)return void(this.C=!0);this.k=!0;const t=this.O?Date.now()-1e3*this.O:0,e=await this.M.expireEntries(t,this.T),s=await self.caches.open(this.I);for(const t of e)await s.delete(t,this.B);this.k=!1,this.C&&(this.C=!1,R(this.expireEntries()))}async updateTimestamp(t){await this.M.setTimestamp(t,Date.now())}async isURLExpired(t){if(this.O){const e=await this.M.getTimestamp(t),s=Date.now()-1e3*this.O;return void 0===e||e<s}return!1}async delete(){this.C=!1,await this.M.expireEntries(1/0)}}class F{constructor(t={}){this.cachedResponseWillBeUsed=async({event:t,request:e,cacheName:s,cachedResponse:n})=>{if(!n)return null;const i=this.P(n),r=this.S(s);R(r.expireEntries());const a=r.updateTimestamp(e.url);if(t)try{t.waitUntil(a)}catch(t){}return i?n:null},this.cacheDidUpdate=async({cacheName:t,request:e})=>{const s=this.S(t);await s.updateTimestamp(e.url),await s.expireEntries()},this.W=t,this.O=t.maxAgeSeconds,this.A=new Map,t.purgeOnQuotaError&&function(t){y.add(t)}((()=>this.deleteCacheAndMetadata()))}S(t){if(t===w())throw new e("expire-custom-caches-only");let s=this.A.get(t);return s||(s=new K(t,this.W),this.A.set(t,s)),s}P(t){if(!this.O)return!0;const e=this.K(t);if(null===e)return!0;return e>=Date.now()-1e3*this.O}K(t){if(!t.headers.has("date"))return null;const e=t.headers.get("date"),s=new Date(e).getTime();return isNaN(s)?null:s}async deleteCacheAndMetadata(){for(const[t,e]of this.A)await self.caches.delete(t),await e.delete();this.A=new Map}}class H extends v{async U(t,s){let n,i=await s.cacheMatch(t);if(!i)try{i=await s.fetchAndCachePut(t)}catch(t){t instanceof Error&&(n=t)}if(!i)throw new e("no-response",{url:t.url,error:n});return i}}function $(t,e){const s=e();return t.waitUntil(s),s}try{self["workbox:precaching:7.2.0"]&&_()}catch(t){}function G(t){if(!t)throw new e("add-to-cache-list-unexpected-type",{entry:t});if("string"==typeof t){const e=new URL(t,location.href);return{cacheKey:e.href,url:e.href}}const{revision:s,url:n}=t;if(!n)throw new e("add-to-cache-list-unexpected-type",{entry:t});if(!s){const t=new URL(n,location.href);return{cacheKey:t.href,url:t.href}}const i=new URL(n,location.href),r=new URL(n,location.href);return i.searchParams.set("__WB_REVISION__",s),{cacheKey:i.href,url:r.href}}class J{constructor(){this.updatedURLs=[],this.notUpdatedURLs=[],this.handlerWillStart=async({request:t,state:e})=>{e&&(e.originalRequest=t)},this.cachedResponseWillBeUsed=async({event:t,state:e,cachedResponse:s})=>{if("install"===t.type&&e&&e.originalRequest&&e.originalRequest instanceof Request){const t=e.originalRequest.url;s?this.notUpdatedURLs.push(t):this.updatedURLs.push(t)}return s}}}class V{constructor({precacheController:t}){this.cacheKeyWillBeUsed=async({request:t,params:e})=>{const s=(null==e?void 0:e.cacheKey)||this.F.getCacheKeyForURL(t.url);return s?new Request(s,{headers:t.headers}):t},this.F=t}}let Q,Y;async function z(t,s){let n=null;if(t.url){n=new URL(t.url).origin}if(n!==self.location.origin)throw new e("cross-origin-copy-response",{origin:n});const i=t.clone(),r={headers:new Headers(i.headers),status:i.status,statusText:i.statusText},a=s?s(r):r,o=function(){if(void 0===Q){const t=new Response("");if("body"in t)try{new Response(t.body),Q=!0}catch(t){Q=!1}Q=!1}return Q}()?i.body:await i.blob();return new Response(o,a)}class X extends v{constructor(t={}){t.cacheName=f(t.cacheName),super(t),this.H=!1!==t.fallbackToNetwork,this.plugins.push(X.copyRedirectedCacheableResponsesPlugin)}async U(t,e){const s=await e.cacheMatch(t);return s||(e.event&&"install"===e.event.type?await this.$(t,e):await this.G(t,e))}async G(t,s){let n;const i=s.params||{};if(!this.H)throw new e("missing-precache-entry",{cacheName:this.cacheName,url:t.url});{const e=i.integrity,r=t.integrity,a=!r||r===e;n=await s.fetch(new Request(t,{integrity:"no-cors"!==t.mode?r||e:void 0})),e&&a&&"no-cors"!==t.mode&&(this.J(),await s.cachePut(t,n.clone()))}return n}async $(t,s){this.J();const n=await s.fetch(t);if(!await s.cachePut(t,n.clone()))throw new e("bad-precaching-response",{url:t.url,status:n.status});return n}J(){let t=null,e=0;for(const[s,n]of this.plugins.entries())n!==X.copyRedirectedCacheableResponsesPlugin&&(n===X.defaultPrecacheCacheabilityPlugin&&(t=s),n.cacheWillUpdate&&e++);0===e?this.plugins.push(X.defaultPrecacheCacheabilityPlugin):e>1&&null!==t&&this.plugins.splice(t,1)}}X.defaultPrecacheCacheabilityPlugin={cacheWillUpdate:async({response:t})=>!t||t.status>=400?null:t},X.copyRedirectedCacheableResponsesPlugin={cacheWillUpdate:async({response:t})=>t.redirected?await z(t):t};class Z{constructor({cacheName:t,plugins:e=[],fallbackToNetwork:s=!0}={}){this.V=new Map,this.Y=new Map,this.X=new Map,this.u=new X({cacheName:f(t),plugins:[...e,new V({precacheController:this})],fallbackToNetwork:s}),this.install=this.install.bind(this),this.activate=this.activate.bind(this)}get strategy(){return this.u}precache(t){this.addToCacheList(t),this.Z||(self.addEventListener("install",this.install),self.addEventListener("activate",this.activate),this.Z=!0)}addToCacheList(t){const s=[];for(const n of t){"string"==typeof n?s.push(n):n&&void 0===n.revision&&s.push(n.url);const{cacheKey:t,url:i}=G(n),r="string"!=typeof n&&n.revision?"reload":"default";if(this.V.has(i)&&this.V.get(i)!==t)throw new e("add-to-cache-list-conflicting-entries",{firstEntry:this.V.get(i),secondEntry:t});if("string"!=typeof n&&n.integrity){if(this.X.has(t)&&this.X.get(t)!==n.integrity)throw new e("add-to-cache-list-conflicting-integrities",{url:i});this.X.set(t,n.integrity)}if(this.V.set(i,t),this.Y.set(i,r),s.length>0){const t=`Workbox is precaching URLs without revision info: ${s.join(", ")}\nThis is generally NOT safe. Learn more at https://bit.ly/wb-precache`;console.warn(t)}}}install(t){return $(t,(async()=>{const e=new J;this.strategy.plugins.push(e);for(const[e,s]of this.V){const n=this.X.get(s),i=this.Y.get(e),r=new Request(e,{integrity:n,cache:i,credentials:"same-origin"});await Promise.all(this.strategy.handleAll({params:{cacheKey:s},request:r,event:t}))}const{updatedURLs:s,notUpdatedURLs:n}=e;return{updatedURLs:s,notUpdatedURLs:n}}))}activate(t){return $(t,(async()=>{const t=await self.caches.open(this.strategy.cacheName),e=await t.keys(),s=new Set(this.V.values()),n=[];for(const i of e)s.has(i.url)||(await t.delete(i),n.push(i.url));return{deletedURLs:n}}))}getURLsToCacheKeys(){return this.V}getCachedURLs(){return[...this.V.keys()]}getCacheKeyForURL(t){const e=new URL(t,location.href);return this.V.get(e.href)}getIntegrityForCacheKey(t){return this.X.get(t)}async matchPrecache(t){const e=t instanceof Request?t.url:t,s=this.getCacheKeyForURL(e);if(s){return(await self.caches.open(this.strategy.cacheName)).match(s)}}createHandlerBoundToURL(t){const s=this.getCacheKeyForURL(t);if(!s)throw new e("non-precached-url",{url:t});return e=>(e.request=new Request(t),e.params=Object.assign({cacheKey:s},e.params),this.strategy.handle(e))}}const tt=()=>(Y||(Y=new Z),Y);class et extends n{constructor(t,e){super((({request:s})=>{const n=t.getURLsToCacheKeys();for(const i of function*(t,{ignoreURLParametersMatching:e=[/^utm_/,/^fbclid$/],directoryIndex:s="index.html",cleanURLs:n=!0,urlManipulation:i}={}){const r=new URL(t,location.href);r.hash="",yield r.href;const a=function(t,e=[]){for(const s of[...t.searchParams.keys()])e.some((t=>t.test(s)))&&t.searchParams.delete(s);return t}(r,e);if(yield a.href,s&&a.pathname.endsWith("/")){const t=new URL(a.href);t.pathname+=s,yield t.href}if(n){const t=new URL(a.href);t.pathname+=".html",yield t.href}if(i){const t=i({url:r});for(const e of t)yield e.href}}(s.url,e)){const e=n.get(i);if(e){return{cacheKey:e,integrity:t.getIntegrityForCacheKey(e)}}}}),t.strategy)}}var st;self.skipWaiting(),self.addEventListener("activate",(()=>self.clients.claim())),st={},function(t){tt().precache(t)}([{url:"assets/app.css",revision:null},{url:"assets/app.js",revision:null},{url:"assets/counter.js",revision:null},{url:"assets/initYJS.js",revision:null},{url:"assets/onlineStatus.js",revision:null},{url:"assets/solHook.js",revision:null},{url:"assets/sw.js",revision:null},{url:"assets/textInput.js",revision:null},{url:"assets/web.js",revision:null},{url:"assets/workbox-window.prod.es5.js",revision:null},{url:"assets/y-indexeddb.js",revision:null},{url:"assets/yjs.js",revision:null},{url:"manifest.webmanifest",revision:"aeeebccd1e2f0462c74bf9c284f3570b"}]),function(t){const e=tt();c(new et(e,t))}(st),self.addEventListener("activate",(t=>{const e=f();t.waitUntil((async(t,e="-precache-")=>{const s=(await self.caches.keys()).filter((s=>s.includes(e)&&s.includes(self.registration.scope)&&s!==t));return await Promise.all(s.map((t=>self.caches.delete(t)))),s})(e).then((t=>{})))})),c((({url:t})=>!t.pathname.startsWith("/assets/")),new class extends v{constructor(t={}){super(t),this.plugins.some((t=>"cacheWillUpdate"in t))||this.plugins.unshift(h),this.tt=t.networkTimeoutSeconds||0}async U(t,s){const n=[],i=[];let r;if(this.tt){const{id:e,promise:a}=this.et({request:t,logs:n,handler:s});r=e,i.push(a)}const a=this.st({timeoutId:r,request:t,logs:n,handler:s});i.push(a);const o=await s.waitUntil((async()=>await s.waitUntil(Promise.race(i))||await a)());if(!o)throw new e("no-response",{url:t.url});return o}et({request:t,logs:e,handler:s}){let n;return{promise:new Promise((e=>{n=setTimeout((async()=>{e(await s.cacheMatch(t))}),1e3*this.tt)})),id:n}}async st({timeoutId:t,request:e,logs:s,handler:n}){let i,r;try{r=await n.fetchAndCachePut(e)}catch(t){t instanceof Error&&(i=t)}return t&&clearTimeout(t),!i&&r||(r=await n.cacheMatch(e)),r}}({cacheName:"dynamic-routes",networkTimeoutSeconds:3,plugins:[]}),"GET"),c(/^https:\/\/fonts\.googleapis\.com\/.*/i,new H({cacheName:"google-fonts-cache",plugins:[new F({maxEntries:10,maxAgeSeconds:31536e3})]}),"GET"),c(/\.(?:png|jpg|jpeg|svg|gif)$/,new H({cacheName:"images",plugins:[new F({maxEntries:50,maxAgeSeconds:2592e3})]}),"GET");
