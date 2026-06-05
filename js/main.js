// =========================
// 全局变量
// =========================
let songs = [];

let currentIndex = -1;

let isShuffle = false;

let isRepeat = true;


// =========================
// DOM
// =========================
const categoryContainer =
    document.getElementById("categoryContainer");

const genreList =
    document.getElementById("genreList");

const searchInput =
    document.getElementById("searchInput");

const playBtn =
    document.getElementById("playBtn");

const prevBtn =
    document.getElementById("prevBtn");

const nextBtn =
    document.getElementById("nextBtn");

const shuffleBtn =
    document.getElementById("shuffleBtn");

const repeatBtn =
    document.getElementById("repeatBtn");

const muteBtn =
    document.getElementById("muteBtn");

const volumeBar =
    document.getElementById("volumeBar");

const progressBar =
    document.getElementById("progressBar");

const currentTime =
    document.getElementById("currentTime");

const duration =
    document.getElementById("duration");

const playerCover =
    document.getElementById("playerCover");

const playerTitle =
    document.getElementById("playerTitle");

const playerArtist =
    document.getElementById("playerArtist");

const bottomPlayer =
    document.getElementById("bottomPlayer");

const audio =
    document.getElementById("audioPlayer");


const lyricsPage =
	document.getElementById("lyricsPage");

const lyricsCover =
	document.getElementById("lyricsCover");

const lyricsTitle =
	document.getElementById("lyricsTitle");

const lyricsArtist =
	document.getElementById("lyricsArtist");
	
const lyricsGenre =
	document.getElementById("lyricsGenre");

const lyricsText =
	document.getElementById("lyricsText");

const closeLyrics =
	document.getElementById("closeLyrics");
	
// =========================
// 手机歌词页组件
// =========================
const mobileLyricProgress =
	document.getElementById("mobileLyricProgress");
	
const mobileCurrentTime = 
	document.getElementById("mobileCurrentTime");

const mobileDuration =
	document.getElementById("mobileDuration");

const shareBtn =
	document.getElementById("shareBtn");

const lyricPlayBtn =
	document.getElementById("lyricPlayBtn");

const lyricNextBtn =
	document.getElementById("lyricNextBtn");
	


// =========================
// Logo 点击刷新
// =========================
document.getElementById("logoBtn")
.onclick = ()=>{
    location.reload();
};

// =========================
// 打开歌词页面
// =========================
document
.querySelector(".player-left")
.addEventListener("click",()=>{

    if(!audio.src) return;

    lyricsPage.classList.add("show");

});


// =========================
// 关闭歌词页面
// =========================
closeLyrics.onclick = ()=>{

    lyricsPage.classList.remove("show");

};


// =========================
// 加载歌曲
// =========================
async function loadSongs(){

    try{

        const res =
            await fetch(
                "./data/playlist.json?v=" + Date.now(),
                {
                    cache:"no-store"
                }
            );

        const data = await res.json();

        songs = data.songs;


        renderGenres();

        renderCategorySongs();

        bindSearch();

    }catch(err){

        console.error("加载失败",err);
    }
}

loadSongs();

// =========================
// 加载歌词函数
// =========================
async function loadLyrics(path){

    try{

        const res =
        await fetch(path);

        const text =
        await res.text();

        const lines =
        text.split("\n");

        lyricsText.innerHTML =
        lines.map(line=>

        `<p>${line}</p>`

        ).join("");

    }catch(err){

        lyricsText.innerHTML =
        "<p>暂无歌词</p>";
    }
}


// =========================
// 左侧分类
// =========================
function renderGenres(){

    const genres = {};


    songs.forEach(song=>{

        if(!genres[song.genre]){
            genres[song.genre] = [];
        }

        genres[song.genre].push(song);
    });


    genreList.innerHTML = "";


    for(const genre in genres){

        const div = document.createElement("div");

        div.className = "genre-item";


        div.innerHTML = `

            <div class="genre-header">
                ${genre}
            </div>

            <div class="genre-songs">

                ${genres[genre]
                    .map(song=>`

                        <div class="genre-song"
                             onclick="playSong(${song.id})">

                             ${song.title}

                        </div>

                    `).join("")}

            </div>

        `;


        genreList.appendChild(div);
    }


    document.querySelectorAll(".genre-header")
        .forEach(header=>{

            header.onclick = ()=>{

                const list =
                    header.nextElementSibling;


                list.style.display =
                    list.style.display === "block"
                    ?
                    "none"
                    :
                    "block";
            };
        });
}


// =========================
// 渲染右侧分类歌曲
// =========================
function renderCategorySongs(){

    const genres = {};


    songs.forEach(song=>{

        if(!genres[song.genre]){
            genres[song.genre] = [];
        }

        genres[song.genre].push(song);
    });


    categoryContainer.innerHTML = "";


    let first = true;


    for(const genre in genres){

        const block = document.createElement("div");

        block.className = "category-block";


        block.innerHTML = `

            <div class="category-title">
                <h2>${genre}</h2>
                <i class="fas fa-chevron-down"></i>
            </div>


            <div class="song-grid"
                 style="display:${first ? 'grid':'none'}">

                ${genres[genre]
                    .map(song=>`

                    <div class="song-card"
                         onclick="playSong(${song.id})">

                        <img loading="lazy"
                             src="${song.cover}">

                        <div class="card-overlay">
                            <div class="play-circle">
                                <i class="fas fa-play"></i>
                            </div>
                        </div>

                        <div class="song-info">
                            <h3>${song.title}</h3>
                            <p>${song.artist}</p>
                        </div>

                    </div>

                `).join("")}

            </div>

        `;


        categoryContainer.appendChild(block);

        first = false;
    }


    document.querySelectorAll(".category-title")
        .forEach(title=>{

            title.onclick = ()=>{

                const grid =
                    title.nextElementSibling;


                grid.style.display =
                    grid.style.display === "grid"
                    ?
                    "none"
                    :
                    "grid";
            };
        });
}


// =========================
// 播放歌曲
// =========================
async function playSong(id){

    try{

        //initAudioContext();


        currentIndex =
            songs.findIndex(s=>s.id === id);


        const song = songs[currentIndex];


        audio.src = song.src;


        playerCover.src = song.cover;

        playerTitle.textContent = song.title;

        playerArtist.textContent = song.artist;
		
		lyricsCover.src = song.cover;

		lyricsTitle.textContent = song.title;

		lyricsArtist.textContent = song.artist;
		
		// 新增：显示歌曲分类
		lyricsGenre.textContent = song.genre || "";

		loadLyrics(song.lyric);

        bottomPlayer.classList.add("show");


        await audio.play();

        updatePlayButtons();


    }catch(err){

        console.error(err);

        alert("播放失败，请检查音频路径");
    }
}


// =========================
// 播放暂停
// =========================
playBtn.onclick = async ()=>{

    if(audio.paused){

        await audio.play();

    }else{

        audio.pause();
    }

    updatePlayButtons();
};


// =========================
// 上一首
// =========================
prevBtn.onclick = ()=>{

    currentIndex--;

    if(currentIndex < 0){
        currentIndex = songs.length - 1;
    }

    playSong(songs[currentIndex].id);
};


// =========================
// 下一首
// =========================
nextBtn.onclick = ()=>{

    if(isShuffle){

        const randomIndex =
            Math.floor(Math.random() * songs.length);

        playSong(songs[randomIndex].id);

        return;
    }


    currentIndex++;


    if(currentIndex >= songs.length){

        currentIndex = 0;
    }


    playSong(songs[currentIndex].id);
};


// =========================
// 自动下一首
// =========================
audio.onended = ()=>{

    if(isRepeat){
        nextBtn.onclick();
    }
};


// =========================
// 随机播放
// =========================
shuffleBtn.onclick = ()=>{

    isShuffle = !isShuffle;


    shuffleBtn.style.background =
        isShuffle
        ?
        "rgba(0,255,180,0.25)"
        :
        "rgba(255,255,255,0.08)";
};


// =========================
// 顺序播放
// =========================
repeatBtn.onclick = ()=>{

    isRepeat = !isRepeat;


    repeatBtn.style.background =
        isRepeat
        ?
        "rgba(0,255,180,0.25)"
        :
        "rgba(255,255,255,0.08)";
};


// =========================
// 音量
// =========================
volumeBar.addEventListener("input",e=>{

    audio.volume = e.target.value;
});


// =========================
// 静音
// =========================
muteBtn.onclick = ()=>{

    audio.muted = !audio.muted;


    muteBtn.innerHTML = audio.muted
        ?
        `<i class="fas fa-volume-mute"></i>`
        :
        `<i class="fas fa-volume-up"></i>`;
};

// =========================
// 监听播放状态
// =========================
audio.addEventListener("play",updatePlayButtons);

audio.addEventListener("pause",updatePlayButtons);


// =========================
// 歌曲刚加载时显示正确时间
// =========================

audio.addEventListener(
"loadedmetadata",
()=>{

    mobileCurrentTime.textContent =
    "00:00";

    mobileDuration.textContent =
    "-"
    +
    formatTime(
        audio.duration
    );
});

// =========================
// 时间更新
// =========================
audio.addEventListener(
"timeupdate",
()=>{

    const progress =
    audio.duration
    ?
    (
        audio.currentTime
        /
        audio.duration
    ) * 100
    :
    0;

    progressBar.value =
    progress;

    mobileLyricProgress.value =
    progress;

    // 当前时间
    const current =
    formatTime(
        audio.currentTime
    );

    // 总时长
    const total =
    formatTime(
        audio.duration || 0
    );

    // 剩余时间
    const remain =
    formatTime(
        Math.max(
            0,
            (audio.duration || 0)
            -
            audio.currentTime
        )
    );

    // 主播放器
    currentTime.textContent =
    current;

    duration.textContent =
    total;

    // 手机歌词页
    mobileCurrentTime.textContent =
    current;

    mobileDuration.textContent =
    "-" + remain;
});


// =========================
// 拖动进度
// =========================
progressBar.addEventListener("input",e=>{

    audio.currentTime =
        (e.target.value / 100)
        *
        audio.duration;
});


// =========================
// 同步播放按钮状态
// =========================

function updatePlayButtons(){

    const icon =
    audio.paused
    ?
    `<i class="fas fa-play"></i>`
    :
    `<i class="fas fa-pause"></i>`;

    playBtn.innerHTML = icon;

    lyricPlayBtn.innerHTML = icon;
}


// =========================
// 时间格式
// =========================
function formatTime(time){

    if(!time || isNaN(time))
        return "00:00";

    const hour =
    Math.floor(time / 3600);

    const min =
    Math.floor(
        (time % 3600)
        / 60
    );

    const sec =
    Math.floor(time % 60);

    if(hour > 0){

        return `${hour}:${
            min.toString()
            .padStart(2,'0')
        }:${
            sec.toString()
            .padStart(2,'0')
        }`;
    }

    return `${
        min.toString()
        .padStart(2,'0')
    }:${
        sec.toString()
        .padStart(2,'0')
    }`;
}


// =========================
// 分享弹窗
// =========================

function showShareDialog(url){

    const result =
    confirm(
        "歌曲在线播放地址：\n\n"
        +
        url
        +
        "\n\n点击【确定】复制链接"
    );

    if(result){

        navigator.clipboard
        .writeText(url)
        .then(()=>{

            alert(
                "链接已复制到剪贴板"
            );

        })
        .catch(()=>{

            alert(
                "复制失败，请手动复制"
            );
        });
    }
}

// =========================
// 搜索
// =========================
function bindSearch(){

    searchInput.addEventListener("input",e=>{

        const key =
            e.target.value.toLowerCase();


        const filtered =
            songs.filter(song=>

                song.title.toLowerCase().includes(key)
                ||
                song.artist.toLowerCase().includes(key)
            );


        renderSearchResult(filtered);
    });
}


// =========================
// 搜索结果
// =========================
function renderSearchResult(list){

    categoryContainer.innerHTML = `

        <div class="song-grid">

            ${list.map(song=>`

                <div class="song-card"
                     onclick="playSong(${song.id})">

                    <img src="${song.cover}">

                    <div class="card-overlay">
                        <div class="play-circle">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>

                    <div class="song-info">
                        <h3>${song.title}</h3>
                        <p>${song.artist}</p>
                    </div>

                </div>

            `).join("")}

        </div>

    `;
}

// =========================
// 注册 PWA
// =========================
if("serviceWorker" in navigator){

    window.addEventListener("load",()=>{

        navigator.serviceWorker
            .register("./sw.js")
            .then(()=>{

                console.log("PWA 已启动");
            });
    });
}

// =========================
// 手机歌词页拖动进度
// =========================
mobileLyricProgress
.addEventListener(
"input",
e=>{

    if(!audio.duration)
        return;

    audio.currentTime =
    (
        e.target.value
        /
        100
    )
    *
    audio.duration;
});

// =========================
// 手机歌词页播放按钮
// =========================

lyricPlayBtn.onclick =
async ()=>{

    if(audio.paused){

        await audio.play();

    }else{

        audio.pause();
    }

    updatePlayButtons();
};

// =========================
// 手机歌词页下一首
// =========================

lyricNextBtn.onclick = ()=>{

    nextBtn.onclick();
};


// =========================
// 分享按钮
// =========================
shareBtn.onclick = ()=>{

    if(currentIndex < 0)
        return;

    const song =
    songs[currentIndex];

    // 提取文件名
    const fileName =
    song.src
        .split("/")
        .pop();

    // 拼接CDN地址
    const onlineUrl =
    "https://cdn.jsdelivr.net/gh/Jensen-Lone/jensen-lone.github.io@main/music/"
    +
    fileName;

    showShareDialog(onlineUrl);
};

