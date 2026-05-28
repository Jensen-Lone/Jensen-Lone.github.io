// 缓存名称

const CACHE_NAME =
    "jensen-music-v2";


// 需要缓存的资源

const urlsToCache = [

    "./",

    "./index.html",

    "./css/style.css",

    "./js/main.js",

    "./data/playlist.json",

    "./manifest.json",

    "./assets/backgrounds/aurora.jpg",

    "./icons/icon-192.png",

    "./icons/icon-512.png"
];


// 安装

self.addEventListener(
    "install",
    event=>{

        event.waitUntil(

            caches.open(CACHE_NAME)

            .then(cache=>{

                return cache.addAll(
                    urlsToCache
                );
            })
        );
    }
);


// 请求拦截

self.addEventListener(
    "fetch",
    event=>{

        event.respondWith(

            caches.match(event.request)

            .then(response=>{

                return (
                    response
                    ||
                    fetch(event.request)
                );
            })
        );
    }
);



self.addEventListener(
    "fetch",
    event=>{

        // playlist 不缓存

        if(
            event.request.url
            .includes("playlist.json")
        ){

            event.respondWith(
                fetch(event.request)
            );

            return;
        }

        // 其它资源缓存

        event.respondWith(

            caches.match(event.request)

            .then(response=>{

                return (
                    response
                    ||
                    fetch(event.request)
                );
            })
        );
    }
);