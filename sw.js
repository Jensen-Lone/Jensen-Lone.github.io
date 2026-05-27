// 缓存名称

const CACHE_NAME =
    "jensen-music-v1";


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