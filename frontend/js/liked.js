// liked.js - 我喜欢的音乐（完全游客模式，无登录要求）
let currentSongs = [];
// 直接从localStorage读取喜欢的歌曲ID
let likedSongs = JSON.parse(localStorage.getItem('likedSongs')) || [];

document.addEventListener('DOMContentLoaded', async function () {
  if (likedSongs.length === 0) {
    document.getElementById('songs-list').innerHTML = '<div class="no-data">暂无喜欢的歌曲</div>';
    return;
  }

  try {
    // 分批获取歌曲详情
    currentSongs = await fetchSongsDetail(likedSongs);
    renderSongList(currentSongs);
    document.getElementById('song-count').textContent = currentSongs.length;

    // 播放全部按钮
    document.getElementById('play-all-btn').addEventListener('click', playAll);
  } catch (error) {
    console.error('加载喜欢列表失败', error);
    showError('加载失败，请重试');
  }
});

async function fetchSongsDetail(ids) {
  const songs = [];
  // 每次最多请求100个ID
  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100).join(',');
    const res = await fetch(`${API_BASE}/song/detail?ids=${batch}`);
    const data = await res.json();
    songs.push(...data.songs);
  }
  return songs;
}

function renderSongList(songs) {
  const container = document.getElementById('songs-list');
  if (!container) return;

  container.innerHTML = songs.map((song, index) => {
    const artists = song.ar ? song.ar.map(a => a.name).join('/') : (song.artists ? song.artists.map(a => a.name).join('/') : '未知');
    const album = song.al ? song.al.name : (song.album ? song.album.name : '未知');
    const duration = formatDuration(song.dt || song.duration || 0);
    const hasMv = song.mv && song.mv !== 0;
    const quality = song.privilege?.maxBrLevel;
    let qualityTag = '';
    if (quality === 'hires') qualityTag = '<span class="song-badge">超清母带</span>';
    else if (quality === 'lossless') qualityTag = '<span class="song-badge">无损</span>';
    else if (quality === 'exhigh') qualityTag = '<span class="song-badge">极高</span>';

    return `
      <div class="song-row" data-id="${song.id}" data-index="${index}" onclick="playSongFromList(${song.id}, ${index})">
        <span class="song-index">${index + 1}</span>
        <div class="song-title-cell">
          <span class="song-name">${song.name}</span>
          ${qualityTag}
          ${hasMv ? '<span class="mv-badge">MV</span>' : ''}
        </div>
        <span class="song-album-cell">${album}</span>
        <span class="song-like-cell" onclick="event.stopPropagation(); toggleLike(${song.id}, this, ${index})">
          <i class="icon-like liked"></i>
        </span>
        <span class="song-duration-cell">${duration}</span>
      </div>
    `;
  }).join('');

  window.currentPlaylist = songs;
}

function playAll() {
  if (!currentSongs.length) return;
  if (!window.player) return alert('播放器未初始化');
  window.player.playlist = currentSongs;
  window.player.currentIndex = 0;
  playSong(currentSongs[0].id);
}

window.playSongFromList = async function (id, idx) {
  if (!window.player) return alert('播放器未初始化');
  if (!window.player.playlist?.length) window.player.playlist = currentSongs;
  window.player.currentIndex = idx;
  await playSong(id);
};

async function playSong(id) {
  const url = await fetchSongUrl(id);
  if (!url) return alert('无法获取播放地址');
  const songs = await fetchSongDetail(id);
  if (songs[0]) {
    songs[0].url = url;
    window.player.play(songs[0]);
  }
}

async function fetchSongUrl(id) {
  const res = await fetch(`${API_BASE}/song/url?id=${id}`);
  const data = await res.json();
  return data.data[0]?.url;
}

async function fetchSongDetail(id) {
  const res = await fetch(`${API_BASE}/song/detail?ids=${id}`);
  const data = await res.json();
  return data.songs;
}

// 从喜欢列表中移除（点击心形时调用）
window.toggleLike = function (songId, el, index) {
  // 从 localStorage 中移除
  likedSongs = likedSongs.filter(id => id !== songId);
  localStorage.setItem('likedSongs', JSON.stringify(likedSongs));

  // 从当前列表中移除该行
  currentSongs = currentSongs.filter((_, i) => i !== index);
  if (currentSongs.length === 0) {
    document.getElementById('songs-list').innerHTML = '<div class="no-data">暂无喜欢的歌曲</div>';
    document.getElementById('song-count').textContent = 0;
  } else {
    renderSongList(currentSongs);
    document.getElementById('song-count').textContent = currentSongs.length;
  }
};

function showError(msg) {
  const container = document.querySelector('.main-content');
  if (container) container.innerHTML = `<div class="error-message">${msg}</div>`;
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}