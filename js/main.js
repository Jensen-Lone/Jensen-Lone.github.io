let songs = [];

let currentIndex = 0;

let audio = document.getElementById("audioPlayer");

let isRandom = false;

let isLoop = false;

let lyricsData = [];


// 加载歌单
async function loadSongs() {

    const res = await fetch("./data/playlist.json");

    const data = await res.json();

    songs = data.songs;

    renderPlaylist();

    loadLastPlayed();
}

loadSongs();


// 渲染分类歌单
function renderPlaylist() {

    const container = document.getElementById("playlistGroup");

    const genres = {};

    songs.forEach(song => {

        if (!genres[song.genre]) {

            genres[song.genre] = [];
        }

        genres[song.genre].push(song);
    });

    container.innerHTML = "";

    for (const genre in genres) {

        const group = document.createElement("div");

        group.className = "genre-group";

        group.innerHTML = `
            <div class="genre-header">
                ${genre}
            </div>

            <div class="song-list">

                ${genres[genre].map(song => `
                    <div class="song-item"
                        onclick="playSong(${song.id})">

                        <span>${song.title}</span>

                        <span>${song.artist}</span>

                    </div>
                `).join("")}

            </div>
        `;

        container.appendChild(group);
    }

    // 分类折叠
    document.querySelectorAll(".genre-header")
        .forEach(header => {

            header.onclick = () => {

                const list =
                    header.nextElementSibling;

                list.style.display =
                    list.style.display === "block"
                    ? "none"
                    : "block";
            };
        });
}


// 播放歌曲
async function playSong(id) {

    currentIndex =
        songs.findIndex(s => s.id === id);

    const song = songs[currentIndex];

    audio.src = song.src;

    document.getElementById("coverImg").src =
        song.cover;

    document.getElementById("currentTitle")
        .textContent = song.title;

    document.getElementById("currentArtist")
        .textContent = song.artist;

    localStorage.setItem(
        "lastPlayed",
        JSON.stringify(song)
    );

    await loadLyrics(song.lyric);

    audio.play();

    document.getElementById("playBtn").innerHTML =
        `<i class="fas fa-pause"></i>`;
}


// 播放/暂停
document.getElementById("playBtn")
.onclick = () => {

    if (audio.paused) {

        audio.play();

        playBtn.innerHTML =
            `<i class="fas fa-pause"></i>`;

    } else {

        audio.pause();

        playBtn.innerHTML =
            `<i class="fas fa-play"></i>`;
    }
};


// 上一首
document.getElementById("prevBtn")
.onclick = () => {

    currentIndex--;

    if (currentIndex < 0) {

        currentIndex = songs.length - 1;
    }

    playSong(songs[currentIndex].id);
};


// 下一首
document.getElementById("nextBtn")
.onclick = () => {

    nextSong();
};


// 自动下一首
audio.onended = () => {

    if (isLoop) {

        audio.play();

    } else {

        nextSong();
    }
};


// 下一首逻辑
function nextSong() {

    if (isRandom) {

        currentIndex =
            Math.floor(Math.random() * songs.length);

    } else {

        currentIndex++;

        if (currentIndex >= songs.length) {

            currentIndex = 0;
        }
    }

    playSong(songs[currentIndex].id);
}


// 随机播放
document.getElementById("randomBtn")
.onclick = function () {

    isRandom = !isRandom;

    this.style.background =
        isRandom ? "#9bd1b2" : "";
};


// 循环播放
document.getElementById("loopBtn")
.onclick = function () {

    isLoop = !isLoop;

    this.style.background =
        isLoop ? "#9bd1b2" : "";
};


// 进度条
audio.addEventListener("timeupdate", () => {

    const progress =
        (audio.currentTime / audio.duration) * 100;

    document.getElementById("progressBar")
        .value = progress || 0;

    updateTime();

    updateLyrics();
});


// 拖动进度
document.getElementById("progressBar")
.addEventListener("input", e => {

    audio.currentTime =
        (e.target.value / 100) * audio.duration;
});


// 时间格式
function formatTime(time) {

    const min =
        Math.floor(time / 60);

    const sec =
        Math.floor(time % 60);

    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}


// 更新时间
function updateTime() {

    currentTime.textContent =
        formatTime(audio.currentTime);

    duration.textContent =
        formatTime(audio.duration || 0);
}


// 本地缓存最近播放
function loadLastPlayed() {

    const last =
        localStorage.getItem("lastPlayed");

    if (last) {

        const song = JSON.parse(last);

        playSong(song.id);
    }
}


// 加载歌词
async function loadLyrics(url) {

    const res = await fetch(url);

    const text = await res.text();

    lyricsData = parseLyrics(text);

    renderLyrics();
}


// 解析歌词
function parseLyrics(text) {

    const lines = text.split("\n");

    return lines.map(line => {

        const match =
            line.match(/\[(\d+):(\d+)\.(\d+)\](.*)/);

        if (!match) return null;

        return {

            time:
                Number(match[1]) * 60 +
                Number(match[2]),

            text: match[4]
        };

    }).filter(Boolean);
}


// 渲染歌词
function renderLyrics() {

    lyrics.innerHTML =
        lyricsData.map(l => `
            <div class="lyric-line">
                ${l.text}
            </div>
        `).join("");
}


// 歌词同步
function updateLyrics() {

    const current = audio.currentTime;

    let activeIndex = 0;

    lyricsData.forEach((l, i) => {

        if (current >= l.time) {

            activeIndex = i;
        }
    });

    document.querySelectorAll(".lyric-line")
        .forEach((line, i) => {

            line.classList.toggle(
                "active",
                i === activeIndex
            );
        });

    lyrics.style.transform =
        `translateY(${-activeIndex * 40 + 120}px)`;
}


// 波形动画
const canvas =
    document.getElementById("waveCanvas");

const ctx =
    canvas.getContext("2d");

canvas.width = 350;

canvas.height = 80;

function animateWave() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 40; i++) {

        const h =
            Math.random() * 60;

        ctx.fillStyle =
            "rgba(120,180,150,0.7)";

        ctx.fillRect(
            i * 10,
            canvas.height - h,
            6,
            h
        );
    }

    requestAnimationFrame(animateWave);
}

animateWave();