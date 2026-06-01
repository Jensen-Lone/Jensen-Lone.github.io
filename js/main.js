// =========================
// 全局变量
// =========================
let songs = [];

let currentIndex = 0;

let isShuffle = false;

let isRepeat = true;


// 音频分析器
//let audioContext = null;
//let analyser = null;
//let source = null;
//let dataArray = null;
//let bufferLength = null;

//let visualizerRunning = false;


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

//const visualizer =
//    document.getElementById("visualizer");

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

const lyricsText =
	document.getElementById("lyricsText");

const closeLyrics =
	document.getElementById("closeLyrics");
	
	
// canvas
//const canvas = visualizer;
//const ctx = canvas.getContext("2d");

//canvas.width = 650;
//canvas.height = 40;


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
// Logo 点击刷新
// =========================



// =========================
// 初始化 AudioContext
// =========================
/*
function initAudioContext(){

    if(audioContext) return;

    audioContext =
        new(
            window.AudioContext
            ||
            window.webkitAudioContext
        )();


    analyser =
        audioContext.createAnalyser();


    source =
        audioContext
            .createMediaElementSource(audio);


    source.connect(analyser);

    analyser.connect(audioContext.destination);


    analyser.fftSize = 128;

    bufferLength = analyser.frequencyBinCount;

    dataArray = new Uint8Array(bufferLength);
}
*/

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

		loadLyrics(song.lyric);

        bottomPlayer.classList.add("show");


        await audio.play();


        playBtn.innerHTML =
            `<i class="fas fa-pause"></i>`;


        //startVisualizer();

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

        playBtn.innerHTML =
            `<i class="fas fa-pause"></i>`;

        //startVisualizer();

    }else{

        audio.pause();

        playBtn.innerHTML =
            `<i class="fas fa-play"></i>`;

        //stopVisualizer();
    }
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
// 时间更新
// =========================
audio.addEventListener("timeupdate",()=>{

    const progress =
        audio.duration
        ?
        (audio.currentTime / audio.duration) * 100
        :
        0;


    progressBar.value = progress;


    currentTime.textContent =
        formatTime(audio.currentTime);


    duration.textContent =
        formatTime(audio.duration || 0);
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
// 时间格式
// =========================
function formatTime(time){

    const min =
        Math.floor(time / 60);

    const sec =
        Math.floor(time % 60);


    return `${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
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
// 频谱动画
// 波峰跳跃风格
// =========================
/*
function startVisualizer(){

    if(visualizerRunning) return;

    visualizerRunning = true;

    visualizer.style.display = "block";

    drawVisualizer();
}
*/
/*
function stopVisualizer(){

    visualizerRunning = false;

    visualizer.style.display = "none";
}
*/
/*
function drawVisualizer(){

    if(!visualizerRunning) return;


    requestAnimationFrame(drawVisualizer);


    analyser.getByteFrequencyData(dataArray);


    ctx.clearRect(0,0,canvas.width,canvas.height);


    const barWidth = 6;

    let x = 0;


    for(let i=0;i<bufferLength;i++){

        const barHeight = dataArray[i] / 4;


        const gradient =
            ctx.createLinearGradient(0,0,0,canvas.height);


        gradient.addColorStop(0,"#7fffd4");

        gradient.addColorStop(1,"#00bfff");


        ctx.fillStyle = gradient;


        ctx.beginPath();

        ctx.roundRect(
            x,
            canvas.height - barHeight,
            barWidth,
            barHeight,
            20
        );

        ctx.fill();


        x += 10;
    }
}
*/

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