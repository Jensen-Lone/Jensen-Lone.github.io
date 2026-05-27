let songs = [];

let currentIndex = 0;

let audio =
    document.getElementById("audioPlayer");

let isPlaying = false;


// 加载歌曲
async function loadSongs(){

    const res =
        await fetch("./data/playlist.json");

    const data =
        await res.json();

    songs = data.songs;

    renderGenres();

    renderSongs(songs);

    bindSearch();
}

loadSongs();


// 渲染左侧分类
function renderGenres(){

    const genres = {};

    songs.forEach(song=>{

        if(!genres[song.genre]){

            genres[song.genre] = [];
        }

        genres[song.genre].push(song);
    });

    const container =
        document.getElementById("genreList");

    container.innerHTML = "";

    let first = true;

    for(const genre in genres){

        const div =
            document.createElement("div");

        div.className = "genre-item";

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

                    <div class="genre-song"
                        onclick="playSong(${song.id})">

                        ${song.title}

                    </div>

                `).join("")}

            </div>
        `;

        container.appendChild(div);

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


// 渲染封面
function renderSongs(list){

    const container =
        document.getElementById("songContainer");

    container.innerHTML =
        list.map(song=>`

        <div class="song-card"
            onclick="playSong(${song.id})">

            <img src="${song.cover}">

            <div class="song-info">

                <h3>${song.title}</h3>

                <p>${song.artist}</p>

            </div>

        </div>

    `).join("");
}


// 播放歌曲
function playSong(id){

    currentIndex =
        songs.findIndex(s=>s.id===id);

    const song =
        songs[currentIndex];

    audio.src = song.src;

    audio.play();

    isPlaying = true;

    document
    .getElementById("bottomPlayer")
    .classList.add("show");

    document
    .getElementById("playerCover")
    .src = song.cover;

    document
    .getElementById("playerTitle")
    .textContent = song.title;

    document
    .getElementById("playerArtist")
    .textContent = song.artist;

    document
    .getElementById("playBtn")
    .innerHTML =
        `<i class="fas fa-pause"></i>`;

    startWave();
}


// 播放暂停
playBtn.onclick = ()=>{

    if(audio.paused){

        audio.play();

        playBtn.innerHTML =
            `<i class="fas fa-pause"></i>`;

        startWave();

    }else{

        audio.pause();

        playBtn.innerHTML =
            `<i class="fas fa-play"></i>`;

        stopWave();
    }
};


// 上一首
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


// 下一首
nextBtn.onclick = ()=>{

    currentIndex++;

    if(currentIndex >= songs.length){

        currentIndex = 0;
    }

    playSong(
        songs[currentIndex].id
    );
};


// 自动下一首
audio.onended = ()=>{

    nextBtn.onclick();
};


// 进度
audio.addEventListener(
    "timeupdate",
    ()=>{

        const progress =
            audio.currentTime
            / audio.duration
            * 100;

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


// 拖动
progressBar.addEventListener(
    "input",
    e=>{

        audio.currentTime =
            (e.target.value / 100)
            * audio.duration;
    }
);


// 时间格式
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


// 搜索
function bindSearch(){

    searchInput.addEventListener(
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


/* 波形动画 */

const canvas =
    document.getElementById("waveCanvas");

const ctx =
    canvas.getContext("2d");

canvas.width = 700;

canvas.height = 40;

let waveRunning = false;

function startWave(){

    canvas.style.display = "block";

    waveRunning = true;

    animateWave();
}

function stopWave(){

    waveRunning = false;

    canvas.style.display = "none";
}

function animateWave(){

    if(!waveRunning) return;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    for(let i=0;i<80;i++){

        const h =
            Math.random() * 35;

        ctx.fillStyle =
            "rgba(120,255,220,0.7)";

        ctx.fillRect(
            i * 10,
            canvas.height - h,
            5,
            h
        );
    }

    requestAnimationFrame(
        animateWave
    );
}