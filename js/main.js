let songs = [];

let currentIndex = 0;

const audio =
    document.getElementById("audioPlayer");


// Web Audio API

const audioContext =
    new (
        window.AudioContext
        ||
        window.webkitAudioContext
    )();

const analyser =
    audioContext.createAnalyser();

const source =
    audioContext.createMediaElementSource(audio);

source.connect(analyser);

analyser.connect(audioContext.destination);

analyser.fftSize = 256;

const bufferLength =
    analyser.frequencyBinCount;

const dataArray =
    new Uint8Array(bufferLength);


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


// 分类

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

    let first = true;

    for(const genre in genres){

        const div =
            document.createElement("div");

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


// 渲染歌曲

function renderSongs(list){

    songContainer.innerHTML =
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


// 播放

async function playSong(id){

    currentIndex =
        songs.findIndex(s=>s.id===id);

    const song =
        songs[currentIndex];

    audio.src = song.src;

    await audio.play();

    document
    .getElementById("bottomPlayer")
    .classList.add("show");

    playerCover.src =
        song.cover;

    playerTitle.textContent =
        song.title;

    playerArtist.textContent =
        song.artist;

    playBtn.innerHTML =
        `<i class="fas fa-pause"></i>`;

    startVisualizer();
}


// 播放暂停

playBtn.onclick = ()=>{

    if(audio.paused){

        audio.play();

        startVisualizer();

        playBtn.innerHTML =
            `<i class="fas fa-pause"></i>`;

    }else{

        audio.pause();

        stopVisualizer();

        playBtn.innerHTML =
            `<i class="fas fa-play"></i>`;
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


// 时间

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
            formatTime(audio.currentTime);

        duration.textContent =
            formatTime(audio.duration || 0);
    }
);


// 拖动进度

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


/* 真频谱 */

const canvas =
    document.getElementById("visualizer");

const ctx =
    canvas.getContext("2d");

canvas.width = 650;

canvas.height = 38;

let visualizerRunning = false;

function startVisualizer(){

    visualizerRunning = true;

    canvas.style.display = "block";

    drawVisualizer();
}

function stopVisualizer(){

    visualizerRunning = false;

    canvas.style.display = "none";
}

function drawVisualizer(){

    if(!visualizerRunning) return;

    requestAnimationFrame(drawVisualizer);

    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const barWidth =
        (canvas.width / bufferLength) * 1.5;

    let x = 0;

    for(let i=0;i<bufferLength;i++){

        const barHeight =
            dataArray[i] / 5;

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