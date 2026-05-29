const CACHE_NAME = "jensen-music-v20";


const urlsToCache = [

    "./",
    "./index.html",
    "./css/style.css",
    "./js/main.js",
    "./manifest.json",

    "./icons/icon-192.png",
    "./icons/icon-512.png",

    "./assets/backgrounds/aurora.jpg"
];


// 安装
self.addEventListener("install",event=>{

    self.skipWaiting();


    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache=>{

                return cache.addAll(urlsToCache);
            })
    );
});


// 激活
self.addEventListener("activate",event=>{

    event.waitUntil(

        caches.keys().then(keys=>{

            return Promise.all(

                keys.map(key=>{

                    if(key !== CACHE_NAME){
                        return caches.delete(key);
                    }
                })
            );
        })
    );


    self.clients.claim();
});


// 请求
self.addEventListener("fetch",event=>{

    // playlist 永远实时读取
    if(event.request.url.includes("playlist.json")){

        event.respondWith(

            fetch(event.request,{
                cache:"no-store"
            })
        );

        return;
    }


    // 其它资源缓存优先
    event.respondWith(

        caches.match(event.request)
            .then(response=>{

                return response || fetch(event.request);
            })
    );
});