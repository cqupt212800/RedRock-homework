// player-detail.js - 播放详情页逻辑

const API_BASE = 'http://localhost:3000';
const urlParams = new URLSearchParams(window.location.search);
const songId = urlParams.get('songId');

document.addEventListener('DOMContentLoaded', async function () {
  if (!songId && window.player?.currentSong) {
    // 如果没传 songId，但有当前播放的歌曲，就使用当前歌曲
    loadCurrentSong();
  } else if (songId) {
    // 根据 songId 加载歌曲
    await loadSongById(songId);
  } else {
    showNoSong();
  }

  // 绑定播放器事件更新
  setupEventListeners();
});

function loadCurrentSong() {
  const song = window.player.currentSong;
  if (!song) {
    showNoSong();
    return;
  }

  updatePageInfo(song);
  loadLyric(song.id);
}

async function loadSongById(id) {
  try {
    const songs = await fetchSongDetail(id);
    if (songs.length > 0) {
      updatePageInfo(songs[0]);
      loadLyric(id);
    } else {
      showNoSong();
    }
  } catch (error) {
    console.error('加载歌曲失败', error);
    showNoSong();
  }
}

function updatePageInfo(song) {
  // 更新封面
  const coverUrl = song.al?.picUrl || song.album?.picUrl || './assets/default-cover.jpg';
  document.getElementById('detail-cover').src = coverUrl;
  document.getElementById('detail-backdrop').style.backgroundImage = `url(${coverUrl})`;

  // 更新歌曲信息
  document.getElementById('detail-song-name').textContent = song.name || '未知歌曲';

  const artists = song.ar ? song.ar.map(a => a.name).join('/') :
    (song.artists ? song.artists.map(a => a.name).join('/') : '未知歌手');
  document.getElementById('detail-artist').textContent = artists;

  const album = song.al?.name || song.album?.name || '未知专辑';
  document.getElementById('detail-album').textContent = album;

  // 更新总时长
  const totalTime = document.getElementById('detail-total-time');
  if (totalTime && song.dt) {
    totalTime.textContent = formatDuration(song.dt);
  }

  // 尝试获取词曲作者（可能需要从其他接口获取）
  fetchSongWiki(song.id);
}

async function loadLyric(id) {
  const container = document.getElementById('lyric-content');
  try {
    const res = await fetch(`${API_BASE}/lyric?id=${id}`);
    const data = await res.json();

    if (data.lrc && data.lrc.lyric) {
      const lyrics = parseLyric(data.lrc.lyric);
      renderLyric(lyrics);
    } else {
      container.innerHTML = '<div class="loading-lyric">暂无歌词</div>';
    }
  } catch (error) {
    console.error('加载歌词失败', error);
    container.innerHTML = '<div class="loading-lyric">歌词加载失败</div>';
  }
}

function parseLyric(lyricStr) {
  const lines = lyricStr.split('\n');
  const lyrics = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

  lines.forEach(line => {
    const matches = [...line.matchAll(timeRegex)];
    const text = line.replace(timeRegex, '').trim();

    matches.forEach(match => {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const milliseconds = parseInt(match[3]);
      const time = minutes * 60 + seconds + milliseconds / 1000;

      lyrics.push({
        time: time,
        text: text
      });
    });
  });

  return lyrics.sort((a, b) => a.time - b.time);
}

function renderLyric(lyrics) {
  const container = document.getElementById('lyric-content');
  if (lyrics.length === 0) {
    container.innerHTML = '<div class="loading-lyric">暂无歌词</div>';
    return;
  }

  container.innerHTML = lyrics.map((item, index) => {
    return `<div class="lyric-line" data-time="${item.time}">${item.text}</div>`;
  }).join('');

  // 高亮当前歌词
  highlightCurrentLyric();

  // 每0.5秒更新一次高亮
  setInterval(highlightCurrentLyric, 500);
}

function highlightCurrentLyric() {
  if (!window.player?.audio) return;

  const currentTime = window.player.audio.currentTime;
  const lines = document.querySelectorAll('.lyric-line');
  let activeIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const time = parseFloat(lines[i].dataset.time);
    const nextTime = i < lines.length - 1 ? parseFloat(lines[i + 1].dataset.time) : Infinity;

    if (currentTime >= time && currentTime < nextTime) {
      activeIndex = i;
      break;
    }
  }

  lines.forEach((line, index) => {
    if (index === activeIndex) {
      line.classList.add('active');
      // 滚动到可视区域
      line.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      line.classList.remove('active');
    }
  });
}

async function fetchSongDetail(id) {
  const res = await fetch(`${API_BASE}/song/detail?ids=${id}`);
  const data = await res.json();
  return data.songs;
}

async function fetchSongWiki(id) {
  try {
    const res = await fetch(`${API_BASE}/song/wiki/summary?id=${id}`);
    const data = await res.json();

    // 这里需要根据实际返回的字段来解析词曲作者
    // 这是一个示例，可能需要调整
    if (data.info) {
      const info = data.info;
      document.getElementById('lyric-writer').textContent = info.lyricist || '未知';
      document.getElementById('composer').textContent = info.composer || '未知';
    }
  } catch (error) {
    console.error('加载歌曲百科失败', error);
  }
}

function showNoSong() {
  document.querySelector('.detail-main').innerHTML = '<div class="no-data">暂无播放的歌曲</div>';
}

function setupEventListeners() {
  // 同步播放进度
  if (window.player) {
    window.player.audio.addEventListener('timeupdate', () => {
      const currentTime = document.getElementById('detail-current-time');
      const progressFilled = document.getElementById('detail-progress-filled');
      const progressSlider = document.getElementById('detail-progress-slider');

      if (currentTime) {
        currentTime.textContent = window.player.formatTime(window.player.audio.currentTime);
      }

      if (progressFilled && window.player.audio.duration) {
        const percent = (window.player.audio.currentTime / window.player.audio.duration) * 100;
        progressFilled.style.width = `${percent}%`;
        if (progressSlider) {
          progressSlider.value = percent;
        }
      }
    });

    // 进度条拖拽
    const progressSlider = document.getElementById('detail-progress-slider');
    if (progressSlider) {
      progressSlider.addEventListener('input', (e) => {
        if (window.player.audio.duration) {
          const time = (e.target.value / 100) * window.player.audio.duration;
          window.player.seek(time);
        }
      });
    }

    // 更新播放按钮状态
    const playBtn = document.getElementById('detail-play-btn');
    if (playBtn) {
      setInterval(() => {
        playBtn.textContent = window.player.isPlaying ? '⏸' : '▶';
      }, 100);
    }
  }
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}