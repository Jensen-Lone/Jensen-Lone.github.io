// ================================
// 全局变量
// ================================

// 存储所有歌曲
let allSongs = [];

// 当前选中的曲风
let currentGenre = '全部';


// ================================
// 加载歌单 JSON
// ================================
async function loadPlaylist() {

    try {

        // 获取 JSON 文件
        const res = await fetch('./data/playlist.json');

        // 检查文件是否加载成功
        if (!res.ok) {
            throw new Error(`歌单加载失败: ${res.status}`);
        }

        // 解析 JSON
        const data = await res.json();

        // 保存歌曲数据
        allSongs = data.songs || [];

        // 渲染曲风标签
        renderGenres();

        // 渲染歌单
        renderPlaylist(allSongs);

    } catch (err) {

        console.error('加载歌单失败:', err);

        alert(
            '歌单加载失败，请检查：\n' +
            '1. playlist.json 是否合法\n' +
            '2. MP3 文件路径是否正确\n' +
            '3. GitHub Pages 是否部署成功'
        );
    }
}


// ================================
// 渲染曲风分类
// ================================
function renderGenres() {

    // 去重生成曲风列表
    const genresSet = new Set(allSongs.map(song => song.genre));

    // 添加“全部”
    const genres = ['全部', ...genresSet];

    const container = document.getElementById('genres');

    // 生成 HTML
    container.innerHTML = genres.map(genre => `
        <div 
            class="genre-tag ${genre === currentGenre ? 'active' : ''}" 
            data-genre="${genre}"
        >
            ${genre}
        </div>
    `).join('');

    // 点击切换曲风
    container.onclick = (e) => {

        if (e.target.classList.contains('genre-tag')) {

            // 更新当前曲风
            currentGenre = e.target.dataset.genre;

            // 更新按钮样式
            document.querySelectorAll('.genre-tag')
                .forEach(el => el.classList.remove('active'));

            e.target.classList.add('active');

            // 重新过滤渲染
            filterAndRender();
        }
    };
}


// ================================
// 搜索 + 曲风过滤
// ================================
function filterAndRender() {

    let filtered = [...allSongs];

    // 获取搜索内容
    const searchText = document
        .getElementById('searchInput')
        .value
        .toLowerCase()
        .trim();

    // 搜索过滤
    if (searchText) {

        filtered = filtered.filter(song => {

            return (
                song.title.toLowerCase().includes(searchText) ||
                song.artist.toLowerCase().includes(searchText) ||
                song.genre.toLowerCase().includes(searchText)
            );

        });
    }

    // 曲风过滤
    if (currentGenre !== '全部') {

        filtered = filtered.filter(song =>
            song.genre === currentGenre
        );
    }

    // 渲染
    renderPlaylist(filtered);
}


// ================================
// 渲染歌单
// ================================
function renderPlaylist(songs) {

    const ul = document.getElementById('playlist');

    // 清空列表
    ul.innerHTML = '';

    // 更新歌曲数量
    document.getElementById('songCount').textContent = songs.length;

    // 空列表提示
    if (songs.length === 0) {

        ul.innerHTML = `
            <li style="justify-content:center;color:#aaa;">
                没有找到歌曲
            </li>
        `;

        return;
    }

    // 遍历歌曲
    songs.forEach(song => {

        const li = document.createElement('li');

        li.innerHTML = `
            <div class="song-info">
                <div class="title">${song.title}</div>
                <div class="artist">${song.artist}</div>
            </div>

            <div class="genre">
                ${song.genre}
            </div>
        `;

        // 点击播放
        li.addEventListener('click', () => {
            playSong(song);
        });

        ul.appendChild(li);
    });
}


// ================================
// 播放歌曲
// ================================
async function playSong(song) {

    const audio = document.getElementById('audioPlayer');

    const cover = document.getElementById('coverImg');

    const title = document.getElementById('currentTitle');

    const artist = document.getElementById('currentArtist');

    // 更新播放器信息
    audio.src = song.src;

    cover.src = song.cover || './assets/cover.jpg';

    title.textContent = song.title;

    artist.textContent = song.artist;

    try {

        // 加载音频
        audio.load();

        // 播放
        await audio.play();

    } catch (err) {

        console.error('播放失败:', err);

        alert(
            '音频播放失败，请检查：\n' +
            '1. MP3 文件是否存在\n' +
            '2. 文件路径是否正确\n' +
            '3. 浏览器是否禁止自动播放'
        );
    }
}


// ================================
// 搜索框实时过滤
// ================================
document
    .getElementById('searchInput')
    .addEventListener('input', filterAndRender);


// ================================
// 页面加载完成后初始化
// ================================
window.addEventListener('DOMContentLoaded', loadPlaylist);