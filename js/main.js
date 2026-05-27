let allSongs = [];
let currentGenre = '全部';

async function loadPlaylist() {
    const res = await fetch('data/playlist.json');
    const data = await res.json();
    allSongs = data.songs;
    renderGenres();
    renderPlaylist(allSongs);
}

function renderGenres() {
    const genresSet = new Set(allSongs.map(s => s.genre));
    const genres = ['全部', ...Array.from(genresSet)];
    
    const container = document.getElementById('genres');
    container.innerHTML = genres.map(genre => `
        <div class="genre-tag ${genre === currentGenre ? 'active' : ''}" data-genre="${genre}">
            ${genre}
        </div>
    `).join('');

    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('genre-tag')) {
            currentGenre = e.target.dataset.genre;
            document.querySelectorAll('.genre-tag').forEach(el => el.classList.remove('active'));
            e.target.classList.add('active');
            filterAndRender();
        }
    });
}

function filterAndRender() {
    let filtered = allSongs;
    
    const searchText = document.getElementById('searchInput').value.toLowerCase().trim();
    if (searchText) {
        filtered = filtered.filter(song => 
            song.title.toLowerCase().includes(searchText) ||
            song.artist.toLowerCase().includes(searchText) ||
            song.genre.toLowerCase().includes(searchText)
        );
    }
    
    if (currentGenre !== '全部') {
        filtered = filtered.filter(song => song.genre === currentGenre);
    }
    
    renderPlaylist(filtered);
}

function renderPlaylist(songs) {
    const ul = document.getElementById('playlist');
    ul.innerHTML = '';
    
    document.getElementById('songCount').textContent = songs.length;
    
    songs.forEach(song => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="song-info">
                <div class="title">${song.title}</div>
                <div class="artist">${song.artist}</div>
            </div>
            <div class="genre">${song.genre}</div>
        `;
        
        li.onclick = () => playSong(song);
        ul.appendChild(li);
    });
}

function playSong(song) {
    const audio = document.getElementById('audioPlayer');
    const cover = document.getElementById('coverImg');
    const title = document.getElementById('currentTitle');
    const artist = document.getElementById('currentArtist');
    
    audio.src = song.src;
    cover.src = song.cover || 'assets/cover.jpg';
    title.textContent = song.title;
    artist.textContent = song.artist;
    
    audio.play();
}

// 搜索实时过滤
document.getElementById('searchInput').addEventListener('input', filterAndRender);

// 初始化
window.onload = loadPlaylist;