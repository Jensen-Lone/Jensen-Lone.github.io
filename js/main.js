// ======================
// 全局变量
// ======================

let songs = [];

let currentIndex = 0;

let audioContext = null;

let analyser = null;

let source = null;

let dataArray = null;

let bufferLength = null;

let visualizerRunning = false;


// audio 元素
const audio =
    document.getElementById("audioPlayer");


// canvas
const canvas =
    document.getElementById("visualizer");

const ctx =
    canvas.getContext("2d");

canvas.width = 650;

canvas.height = 38;

// Logo 刷新页面

document
.getElementById("logoBtn")
.onclick = ()=>{

    location.reload();
};

// ======================
// 初始化 AudioContext
// 必须用户点击后初始化
// ======================

function initAudioContext(){

    // 已初始化则跳过
    if(audioContext) return;

    audioContext =
        new (
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

    analyser.connect(
        audioContext.destination
    );

    analyser.fftSize = 256;

    bufferLength =
        analyser.frequencyBinCount;

    dataArray =
        new Uint8Array(bufferLength);
}


// ======================
// 加载歌曲
// ======================

async function loadSongs(){

    try{

        const res =
            await fetch("./data/playlist.json");

        const data =
            await res.json();

        songs = data.songs;

        renderGenres();

        renderSongs(songs);

        bindSearch();

    }catch(err){

        console.error(
            "歌单加载失败",
            err
        );
    }
}

loadSongs();


// ======================
// 渲染分类
// ======================

function renderGenres(){

    const genres = {};

    songs.forEach(song=>{

        if(!genres[song.genre]){

            genres[song.genre] = [];
        }

        genres[song.genre].push(song);
    });

    genreList.innerHTML = "";

    let first = true;

    for(const genre in genres){

        const div =
            document.createElement("div");

        div.className =
            "genre-item";

        div.innerHTML = `

            <div class="genre-header">
                ${genre}
            </div>

            <div class="genre-songs"
                style="
                    display:
                    ${first ? 'block':'none'}
                ">

                ${genres[genre]
                    .map(song=>`

                    <div
                        class="genre-song"
                        onclick="playSong(${song.id})">

                        ${song.title}

                    </div>

                `).join("")}

            </div>
        `;

        genreList.appendChild(div);

        first = false;
    }

    document
    .querySelectorAll(".genre-header")
    .forEach(header=>{

        header.onclick = ()=>{

            const list =
                header.nextElementSibling;

            list.style.display =
                list.style.display === "block"
                ? "none"
                : "block";
        };
    });
}


// ======================
// 渲染歌曲
// ======================

function renderSongs(list){

    songContainer.innerHTML =
        list.map(song=>`

        <div
            class="song-card"
            onclick="playSong(${song.id})">

            <img
                loading="lazy"
                src="${song.cover}">

            <div class="song-info">

                <h3>${song.title}</h3>

                <p>${song.artist}</p>

            </div>

        </div>

    `).join("");
}


// ======================
// 播放歌曲
// ======================

async function playSong(id){

    try{

        // 初始化音频上下文
        initAudioContext();

        currentIndex =
            songs.findIndex(
                s=>s.id===id
            );

        const song =
            songs[currentIndex];

        // 设置音频
        audio.src = song.src;

        // 更新 UI
        playerCover.src =
            song.cover;

        playerTitle.textContent =
            song.title;

        playerArtist.textContent =
            song.artist;

        bottomPlayer
            .classList
            .add("show");

        // 播放
        await audio.play();

        // 更新按钮
        playBtn.innerHTML =
            `<i class="fas fa-pause"></i>`;

        // 开启频谱
        startVisualizer();

    }catch(err){

        console.error(
            "播放失败",
            err
        );

        alert(
            "音频播放失败，请检查 MP3 路径"
        );
    }
}


// ======================
// 播放暂停
// ======================

playBtn.onclick = async ()=>{

    if(audio.paused){

        try{

            await audio.play();

            playBtn.innerHTML =
                `<i class="fas fa-pause"></i>`;

            startVisualizer();

        }catch(err){

            console.error(err);
        }

    }else{

        audio.pause();

        playBtn.innerHTML =
            `<i class="fas fa-play"></i>`;

        stopVisualizer();
    }
};


// ======================
// 上一首
// ======================

prevBtn.onclick = ()=>{

    currentIndex--;

    if(currentIndex < 0){

        currentIndex =
            songs.length - 1;
    }

    playSong(
        songs[currentIndex].id
    );
};


// ======================
// 下一首
// ======================

nextBtn.onclick = ()=>{

    currentIndex++;

    if(currentIndex >= songs.length){

        currentIndex = 0;
    }

    playSong(
        songs[currentIndex].id
    );
};


// ======================
// 自动下一首
// ======================

audio.onended = ()=>{

    nextBtn.onclick();
};


// ======================
// 时间更新
// ======================

audio.addEventListener(
    "timeupdate",
    ()=>{

        const progress =
            (
                audio.currentTime
                /
                audio.duration
            ) * 100;

        progressBar.value =
            progress || 0;

        currentTime.textContent =
            formatTime(
                audio.currentTime
            );

        duration.textContent =
            formatTime(
                audio.duration || 0
            );
    }
);


// ======================
// 拖动进度
// ======================

progressBar.addEventListener(
    "input",
    e=>{

        audio.currentTime =
            (
                e.target.value
                / 100
            ) * audio.duration;
    }
);


// ======================
// 时间格式
// ======================

function formatTime(time){

    const min =
        Math.floor(time / 60);

    const sec =
        Math.floor(time % 60);

    return `
        ${String(min)
            .padStart(2,"0")}
        :
        ${String(sec)
            .padStart(2,"0")}
    `;
}


// ======================
// 搜索
// ======================

function bindSearch(){

    searchInput
    .addEventListener(
        "input",
        e=>{

            const key =
                e.target.value
                .toLowerCase();

            const filtered =
                songs.filter(song=>

                    song.title
                    .toLowerCase()
                    .includes(key)

                    ||

                    song.artist
                    .toLowerCase()
                    .includes(key)
                );

            renderSongs(filtered);
        }
    );
}


// ======================
// 真频谱
// ======================

function startVisualizer(){

    if(visualizerRunning) return;

    visualizerRunning = true;

    visualizer.style.display =
        "block";

    drawVisualizer();
}


function stopVisualizer(){

    visualizerRunning = false;

    visualizer.style.display =
        "none";
}


function drawVisualizer(){

    if(!visualizerRunning) return;

    requestAnimationFrame(
        drawVisualizer
    );

    analyser.getByteFrequencyData(
        dataArray
    );

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const barWidth =
        (canvas.width / bufferLength)
        * 1.3;

    let x = 0;

    for(
        let i = 0;
        i < bufferLength;
        i++
    ){

        const barHeight =
            dataArray[i] / 3;

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                canvas.height
            );

        gradient.addColorStop(
            0,
            "#7fffd4"
        );

        gradient.addColorStop(
            1,
            "#00bfff"
        );

        ctx.fillStyle =
            gradient;

        ctx.fillRect(
            x,
            canvas.height - barHeight,
            barWidth,
            barHeight
        );

        x += barWidth + 1;
    }
}