// playlist.js
// 从localStorage获取已保存的cookie（需手动存入）
const COOKIE = localStorage.getItem('music_u_cookie') || '';

// 从URL获取歌单ID
const urlParams = new URLSearchParams(window.location.search);
const playlistId = urlParams.get('id');

let likedSet = new Set();
let likedSongs = JSON.parse(localStorage.getItem('likedSongs')) || [];

let currentPlaylistSongs = []; // 存储当前歌单所有歌曲

document.addEventListener('DOMContentLoaded', async function () {
  if (!playlistId) {
    showError('缺少歌单ID');
    return;
  }

  try {
    // 1. 获取歌单基本信息
    const playlist = await fetchPlaylistDetail(playlistId);
    if (!playlist) {
      showError('歌单不存在');
      return;
    }

    // 2. 获取歌单所有歌曲
    const trackCount = playlist.trackCount || 1000;
    currentPlaylistSongs = await fetchPlaylistAllTracks(playlistId, trackCount);

    // 3. 获取歌单动态信息（评论数、收藏数等）
    const dynamic = await fetchPlaylistDynamic(playlistId);

    // 4. 渲染页面
    renderPlaylistHeader(playlist, dynamic);
    renderSongList(currentPlaylistSongs);

    // 5. 绑定事件
    bindEvents();

    // 6. 加载侧边栏用户歌单
    loadUserPlaylists();

    console.log('歌单详情加载完成');
  } catch (error) {
    console.error('加载失败:', error);
    showError('加载失败，请重试');
  }
});

// ---------- 带cookie的请求封装 ----------
async function request(endpoint, options = {}) {
  let url = `${API_BASE}${endpoint}`;
  const separator = url.includes('?') ? '&' : '?';
  if (COOKIE) {
    url += `${separator}cookie=${encodeURIComponent(COOKIE)}`;
  }
  // 添加随机IP防止风控（如果部署在公网可能需要）
  url += `&randomCNIP=true`;
  const res = await fetch(url, options);
  return await res.json();
}

// ---------- API 调用函数 ----------
async function fetchPlaylistDetail(id) {
  const data = await request(`/playlist/detail?id=${id}`);
  return data?.playlist;
}

async function fetchPlaylistAllTracks(id, limit) {
  const data = await request(`/playlist/track/all?id=${id}&limit=${limit}`);
  return data?.songs || [];
}

async function fetchPlaylistDynamic(id) {
  return await request(`/playlist/detail/dynamic?id=${id}`);
}

async function fetchSongUrl(id) {
  const data = await request(`/song/url?id=${id}`);
  return data?.data[0]?.url;
}

async function fetchSongDetail(ids) {
  const data = await request(`/song/detail?ids=${ids}`);
  return data?.songs || [];
}

// ---------- 渲染歌单头部 ----------
function renderPlaylistHeader(playlist, dynamic = {}) {
  // 封面
  const coverImg = document.getElementById('playlist-cover');
  if (coverImg) coverImg.src = playlist.coverImgUrl || './assets/default-cover.jpg';

  // 标签
  const tagsContainer = document.getElementById('playlist-tags');
  if (tagsContainer) {
    tagsContainer.innerHTML = (playlist.tags && playlist.tags.length > 0)
      ? playlist.tags.map(tag => `<span class="tag">${tag}</span>`).join('')
      : '';
  }

  // 歌单名
  const nameEl = document.getElementById('playlist-name');
  if (nameEl) nameEl.textContent = playlist.name || '未知歌单';

  // 创建者信息
  const creatorEl = document.getElementById('playlist-creator');
  if (creatorEl) {
    const creator = playlist.creator || { nickname: '未知', avatarUrl: './assets/default-avatar.jpg' };
    const createTime = playlist.createTime
      ? new Date(playlist.createTime).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
      : '未知时间';
    creatorEl.innerHTML = `
      <img src="${creator.avatarUrl}" alt="${creator.nickname}" class="creator-avatar">
      <span class="creator-name">${creator.nickname}</span>
      <span class="create-time">${createTime} 创建</span>
    `;
  }

  // 统计数据
  const playCount = formatCount(dynamic.playCount || playlist.playCount || 0);
  const trackCount = playlist.trackCount || currentPlaylistSongs.length;
  const commentCount = formatCount(dynamic.commentCount || 0);
  const subscribedCount = formatCount(dynamic.subscribedCount || playlist.subscribedCount || 0);
  const statsEl = document.getElementById('playlist-stats');
  if (statsEl) {
    statsEl.innerHTML = `
      <span class="stat-item"><i class="icon-play"></i> ${playCount}</span>
      <span class="stat-item"><i class="icon-music"></i> ${trackCount}首</span>
      <span class="stat-item"><i class="icon-comment"></i> ${commentCount}</span>
      <span class="stat-item"><i class="icon-collect"></i> ${subscribedCount}</span>
    `;
  }

  // 简介
  const descEl = document.getElementById('playlist-description');
  if (descEl) descEl.textContent = playlist.description || '暂无简介';

  // VIP提示（统计VIP歌曲数量）
  const vipCount = currentPlaylistSongs.filter(song => song.fee === 1).length;
  const vipPromo = document.getElementById('vip-promo');
  if (vipPromo) {
    if (vipCount > 0) {
      vipPromo.innerHTML = `含${vipCount}首VIP歌曲，会员可畅听VIP仅￥0.01/天 &gt;`;
      vipPromo.style.display = 'inline';
    } else {
      vipPromo.style.display = 'none';
    }
  }
}

// ---------- 渲染歌曲列表 ----------
function renderSongList(songs) {
  const container = document.getElementById('songs-list');
  if (!container) return;
  if (!songs || songs.length === 0) {
    container.innerHTML = '<div class="no-data">暂无歌曲</div>';
    return;
  }

  container.innerHTML = songs.map((song, index) => {
    const artists = song.ar ? song.ar.map(a => a.name).join('/') : (song.artists ? song.artists.map(a => a.name).join('/') : '未知');
    const album = song.al ? song.al.name : (song.album ? song.album.name : '未知');
    const duration = formatDuration(song.dt || song.duration || 0);
    const hasMv = song.mv && song.mv !== 0;
    const quality = song.privilege?.maxBrLevel;
    // 判断当前歌曲是否在喜欢列表中
    const isLiked = likedSet.has(song.id);
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
        <span class="song-like-cell" onclick="event.stopPropagation(); toggleLike(${song.id}, this)">
          <i class="icon-like ${isLiked ? 'liked' : ''}"></i>
        </span>
        <span class="song-duration-cell">${duration}</span>
      </div>
    `;
  }).join('');

  // 保存到全局，供播放器使用
  window.currentPlaylist = songs;
}

// ---------- 播放功能 ----------
function playAll() {
  if (!currentPlaylistSongs.length) return;
  if (!window.player) {
    alert('播放器未初始化');
    return;
  }
  window.player.playlist = currentPlaylistSongs;
  window.player.currentIndex = 0;
  playSong(currentPlaylistSongs[0].id);
}

window.playSongFromList = async function (id, idx) {
  if (!window.player) {
    alert('播放器未初始化');
    return;
  }
  if (!window.player.playlist || window.player.playlist.length === 0) {
    window.player.playlist = currentPlaylistSongs;
  }
  window.player.currentIndex = idx;
  await playSong(id);
};

// 播放歌曲（调用全局播放器）
async function playSong(id) {
  try {
    const url = await getSongUrl(id);
    if (!url) {
      alert('无法获取歌曲播放地址');
      return;
    }
    const songs = await getSongDetail(id);
    if (songs[0]) {
      const song = songs[0];
      song.url = url;

      // 设置播放列表
      if (!window.player.playlist || window.player.playlist.length === 0) {
        window.player.playlist = currentPlaylistSongs || [song];
      }

      // 播放歌曲
      window.player.play(song);
    }
  } catch (error) {
    console.error('播放失败:', error);
    alert('播放失败');
  }
}

// ---------- 收藏功能 ----------
async function toggleCollect() {
  if (!COOKIE) {
    alert('请先登录');
    return;
  }
  const btn = document.getElementById('collect-btn');
  const isCollecting = btn.classList.contains('collected');
  const t = isCollecting ? 2 : 1;
  const data = await request(`/playlist/subscribe?t=${t}&id=${playlistId}&timestamp=${Date.now()}`);
  if (data?.code === 200) {
    btn.classList.toggle('collected');
    btn.innerHTML = isCollecting ? '<i class="icon-collect"></i> 收藏' : '<i class="icon-collect"></i> 已收藏';
    alert(isCollecting ? '已取消收藏' : '收藏成功');
  } else {
    alert('操作失败：' + (data?.message || '未知错误'));
  }
}

// ---------- 上传封面功能 ----------
async function uploadCover(file) {
  if (!COOKIE) {
    alert('未检测到登录信息，请先登录');
    return;
  }
  const formData = new FormData();
  formData.append('imgFile', file);

  const url = `${API_BASE}/playlist/cover/update?id=${playlistId}&imgSize=300&cookie=${encodeURIComponent(COOKIE)}&timestamp=${Date.now()}`;

  try {
    const res = await fetch(url, { method: 'POST', body: formData });
    const data = await res.json();
    if (data.code === 200) {
      alert('封面更新成功！');
      const coverImg = document.getElementById('playlist-cover');
      if (coverImg) coverImg.src = data.url + '?t=' + Date.now();
    } else {
      alert('上传失败：' + (data.message || '未知错误'));
    }
  } catch (error) {
    console.error('上传出错:', error);
    alert('上传失败，请重试');
  }
}

// ---------- 侧边栏用户歌单 ----------
async function loadUserPlaylists() {
  const container = document.getElementById('user-playlists');
  if (!container) return;
  try {
    const res = await fetch(`${API_BASE}/personalized?limit=6`);
    const data = await res.json();
    if (data?.result?.length) {
      container.innerHTML = data.result.map(p => `<li><a href="playlist.html?id=${p.id}">${p.name}</a></li>`).join('');
    }
  } catch (e) {
    console.error('加载侧边栏失败', e);
  }
}

// ---------- 事件绑定 ----------
function bindEvents() {
  document.getElementById('play-all-btn')?.addEventListener('click', playAll);
  document.getElementById('collect-btn')?.addEventListener('click', toggleCollect);
  const uploadBtn = document.getElementById('upload-cover-btn');
  const fileInput = document.getElementById('upload-cover-input');
  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) uploadCover(file);
      fileInput.value = '';
    });
  }
}

// ---------- 辅助函数 ----------
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

function formatCount(count) {
  if (count >= 1e8) return (count / 1e8).toFixed(1) + '亿';
  if (count >= 1e4) return (count / 1e4).toFixed(1) + '万';
  return count;
}

// 喜欢/取消喜欢（游客模式，使用localStorage）
window.toggleLike = function (songId, el) {
  const icon = el.querySelector('i');
  const isLiked = icon.classList.contains('liked');

  if (isLiked) {
    // 取消喜欢：从Set和数组中移除
    likedSet.delete(songId);
    likedSongs = likedSongs.filter(id => id !== songId);
    icon.classList.remove('liked');
  } else {
    // 喜欢：添加到Set和数组
    likedSet.add(songId);
    likedSongs.push(songId);
    icon.classList.add('liked');
  }

  // 保存到localStorage
  localStorage.setItem('likedSongs', JSON.stringify(likedSongs));

  // 可选：显示提示
  console.log('喜欢列表已更新，当前数量：', likedSongs.length);
};
