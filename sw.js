const VERSION = '2.0';
const CACHE = 'pwa-test::' + VERSION;

const PRECACHE_LIST = [
  "./",
  "./404.html",
  "./js/gallery.js",
  "./js/jquery.imagesloaded.min.js",
  "./jquery.min.js",
  "./css/style.css",
  "./css/font/font/fontawesome-webfont.eot",
  "./css/font/font/fontawesome-webfont.svg",
  "./css/font/font/fontawesome-webfont.woff",
  "./css/font/font/fontawesome-webfont.ttf",
  "./fancybox/jquery.fancybox.css",
  "./fancybox/jquery.fancybox.pack.js",

  "./img/gotop.png"
  // other source
]

/**
 *  SW Install
 *  Precache anything static to this version of your app.
 *  e.g. App Shell, 404, JS/CSS dependencies...
 *
 *  waitUntil() : installing ====> installed
 *  skipWaiting() : waiting(installed) ====> activating
 */
self.addEventListener('install', e => {
  e.waitUntil(
      caches.open(CACHE).then(cache => {

        return cache.addAll(PRECACHE_LIST)

            // 安装阶段跳过等待，直接进入 active
            .then(self.skipWaiting())

            .catch(err => console.log(err))
      })
  )
});


/**
 *  SW Activate
 *  New one activated when old isnt being used.
 *
 *  waitUntil(): activating ====> activated
 */
self.addEventListener('activate', event => {
  // delete old deprecated caches.
  caches.keys().then(cacheNames => Promise.all(
      cacheNames
          .filter(key => key !== CACHE)
          // 清理旧版本
          .map(key => caches.delete(key))
  ));
  console.log('service worker activated.')

  // 通过执行 clients.claim 方法，更新所有客户端上的 Service Worker
  event.waitUntil(self.clients.claim());  //https://developer.mozilla.org/zh-CN/docs/Web/API/Clients/claim
});


/**
 *  @Functional Fetch
 *  All network requests are being intercepted here.
 *  void respondWith(Promise<Response> r);
 *
 *  Service Worker 安装成功并进入激活状态后即运行于浏览器后台，
 *  可以通过 fetch 事件可以拦截到当前作用域范围内的 http/https 请求，
 *  并且给出自己的响应。结合 Fetch API ，可以简单方便地处理请求响应，实现对网络请求的控制。
 */

    self.addEventListener('fetch', event => {

      let url = event.request.url;

      event.respondWith(
        caches.open(CACHE).then(cache => {
            return cache.match(event.request)
              .then(response => {

                if (response) {
                  // return cached file
                  console.log('cache fetch: ' + url);
                  return response;
                }

                // make network request
                return fetch(event.request).then(newreq => {
                    console.log('network fetch: ' + url);
                    if (newreq.ok) cache.put(event.request, newreq.clone());
                    return newreq;
                })
                  // app is offline
                .catch((url) => caches.match('404.html'));

              });
          })
      );

    });


  //const version = '1.0.1';
  //
  //navigator.serviceWorker.register('/sw.js').then(reg => {
  //  if (localStorage.getItem('sw_version') !== version) {
  //    reg.update().then(() => localStorage.setItem('sw_version', version));
  //  }
  //});