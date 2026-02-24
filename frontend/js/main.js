// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', async function () {
  try {
    // 初始化轮播图 - 使用你的 Carousel 类
    if (document.getElementById('carousel')) {
      window.carousel = new Carousel('carousel', {
        interval: 4000,
        autoplay: true
      });
      // Carousel 类内部已经调用了 loadBanners，不需要额外调用
    }
    // 加载推荐歌单
    await loadRecommendPlaylists();

    // 加载每日推荐
    await loadDailySongs();

    // 加载新歌速递 (/top/song)
    await loadNewSongs();

    // 加载推荐新音乐 (用于热歌榜区域)
    await loadRecommendNewSongs();

    // 加载热歌榜
    await loadHotSongs();

    // 加载当前播放（随机从推荐新音乐选一首）
    await loadNowPlaying();

    // 加载用户歌单
    await loadUserPlaylists();

    // 加载每日推荐歌单 (/recommend/resource) - 登录后可用
    await loadDailyPlaylists();

    // 加载推荐新音乐 (/personalized/newsong)
    await loadRecommendNewSongs();

    // 设置事件监听器
    setupEventListeners();

    console.log('首页数据加载完成');
  } catch (error) {
    console.error('初始化失败:', error);
  }
});

// 加载推荐歌单
async function loadRecommendPlaylists() {
  const playlists = await getRecommendPlaylists(10);
  const container = document.getElementById('recommend-playlists');

  if (!container) return;

  if (playlists.length > 0) {
    container.innerHTML = playlists.map(playlist => `
      <div class="playlist-card" onclick="openPlaylist(${playlist.id})">
        <div class="playlist-cover">
          <img src="${playlist.picUrl}" alt="${playlist.name}" loading="lazy">
          <div class="playlist-play-count">
            <i class="icon-play"></i>
            ${formatPlayCount(playlist.playCount)}
          </div>
        </div>
        <div class="playlist-info">
          <div class="playlist-title">${playlist.name}</div>
        </div>
      </div>
    `).join('');
  }
}

// 加载每日推荐
async function loadDailySongs() {
  const songs = await getDailySongs();
  const container = document.getElementById('daily-songs');

  if (songs && songs.length > 0) {
    container.innerHTML = songs.slice(0, 10).map((song, index) => `
            <div class="song-item" data-id="${song.id}">
                <div class="song-index">${index + 1}</div>
                <div class="song-content">
                    <div class="song-name">${song.name}</div>
                    <div class="song-artist">${song.artists.map(a => a.name).join(' / ')}</div>
                </div>
                <div class="song-actions">
                    <button class="play-btn" onclick="playSong(${song.id})">
                        <i class="icon-play"></i>
                    </button>
                </div>
            </div>
        `).join('');
  }
}

// 加载每日推荐歌单 (/recommend/resource)
async function loadDailyPlaylists() {
  const container = document.getElementById('daily-playlists');
  if (!container) return;

  try {
    const playlists = await getDailyPlaylists();

    if (playlists && playlists.length > 0) {
      container.innerHTML = playlists.slice(0, 4).map(playlist => `
        <div class="playlist-card" onclick="openPlaylist(${playlist.id})">
          <div class="playlist-cover">
            <img src="${playlist.picUrl}" alt="${playlist.name}" loading="lazy">
            <div class="playlist-play-count">
              <i class="icon-play"></i>
              ${formatPlayCount(playlist.playCount)}
            </div>
          </div>
          <div class="playlist-info">
            <div class="playlist-title">${playlist.name}</div>
            <div class="playlist-desc">${playlist.copywriter || ''}</div>
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('加载每日推荐歌单失败:', error);
  }
}

// 加载推荐新音乐 (用于热歌榜区域)
async function loadRecommendNewSongs() {
  const container = document.getElementById('hot-songs');
  if (!container) return;

  const newSongs = await getRecommendNewSongs(6);

  if (newSongs.length > 0) {
    container.innerHTML = newSongs.map((item, index) => {
      const song = item.song;
      return `
        <div class="hot-song-item" data-id="${song.id}" onclick="playSong(${song.id})">
          <span class="hot-song-index">${index + 1}</span>
          <div class="hot-song-info">
            <span class="hot-song-name">${song.name}</span>
            <span class="hot-song-artist">${song.artists.map(a => a.name).join('/')}</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

// 加载新歌速递 (/top/song)
async function loadNewSongs() {
  const container = document.getElementById('new-songs-list');
  if (!container) return;

  try {
    // 获取华语新歌速递 (type=7)
    const songs = await getTopSongs(7);

    if (songs.length > 0) {
      container.innerHTML = songs.slice(0, 5).map((song, index) => `
        <div class="song-item" data-id="${song.id}" onclick="playSong(${song.id})">
          <span class="song-index">${index + 1}</span>
          <div class="song-info">
            <span class="song-name">${song.name}</span>
            <span class="song-artist">${song.ar.map(a => a.name).join('/')}</span>
          </div>
          <button class="play-btn" onclick="event.stopPropagation();playSong(${song.id})">▶</button>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('加载新歌速递失败:', error);
  }
}

// 加载热歌榜
async function loadHotSongs() {
  const songs = await getHotSongs();
  const container = document.getElementById('hot-songs');

  if (songs.length > 0) {
    container.innerHTML = songs.map((song, index) => `
            <div class="song-item" data-id="${song.id}">
                <div class="song-index">${index + 1}</div>
                <div class="song-content">
                    <div class="song-name">${song.name}</div>
                    <div class="song-artist">${song.ar.map(a => a.name).join(' / ')}</div>
                </div>
                <div class="song-actions">
                    <button class="play-btn" onclick="playSong(${song.id})">
                        <i class="icon-play"></i>
                    </button>
                </div>
            </div>
        `).join('');
  }
}

// 加载用户歌单
async function loadUserPlaylists() {
  // 这里需要用户登录后才能获取
  // 暂时显示模拟数据
  const container = document.querySelector('.playlist-menu');
  const mockPlaylists = [
    { id: 1, name: '开车必备，节奏感是天生的' },
    { id: 2, name: '游戏BGM | 一燃到底全程高能' },
    { id: 3, name: '【欧美】开口就爱上的欧美音乐' }
  ];

  container.innerHTML = mockPlaylists.map(playlist => `
        <li>
            <a href="#" onclick="openPlaylist(${playlist.id})">
                <i class="icon-playlist"></i>
                ${playlist.name}
            </a>
        </li>
    `).join('');
}

// 打开歌单详情页
function openPlaylist(id) {
  window.location.href = `playlist.html?id=${id}`;
}

// 播放歌曲
async function playSong(id) {
  try {
    // 获取歌曲URL
    const url = await getSongUrl(id);
    if (!url) {
      alert('无法获取歌曲播放地址');
      return;
    }

    // 设置音频播放器
    const audioPlayer = document.querySelector('audio');
    if (audioPlayer) {
      audioPlayer.src = url;
      audioPlayer.play();

      // 更新播放器显示
      updatePlayerInfo(id);
    }
  } catch (error) {
    console.error('播放失败:', error);
    alert('播放失败，请检查网络连接');
  }
}

// 更新播放器信息
async function updatePlayerInfo(songId) {
  // 这里可以获取歌曲详情并更新播放器显示
  console.log('正在播放歌曲ID:', songId);
}

// 格式化播放量
function formatPlayCount(count) {
  if (count >= 100000000) {
    return (count / 100000000).toFixed(1) + '亿';
  } else if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万';
  }
  return count;
}

// 设置事件监听器
function setupEventListeners() {
  // 搜索功能
  const searchInput = document.querySelector('.search-input');

  // 检查元素是否存在，避免报错
  if (searchInput) {
    // 回车搜索
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }

  // 搜索下拉面板功能
  setupSearchDropdown();

  // 轮播图鼠标悬停暂停
  const carousel = document.getElementById('carousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', () => {
      if (window.carousel) window.carousel.stopAutoPlay();
    });
    carousel.addEventListener('mouseleave', () => {
      if (window.carousel) window.carousel.startAutoPlay();
    });
  }
}

// 执行搜索
function performSearch() {
  const input = document.querySelector('.search-input');
  const keyword = input.value.trim();

  if (keyword) {
    // 保存搜索历史
    saveSearchHistory(keyword);

    // 跳转到搜索页面，带上关键词
    window.location.href = `search.html?q=${encodeURIComponent(keyword)}`;
  }
}

// 保存搜索历史
function saveSearchHistory(keyword) {
  let history = localStorage.getItem('searchHistory');
  history = history ? JSON.parse(history) : [];
  if (!history.includes(keyword)) {
    history.unshift(keyword);
    if (history.length > 10) history.pop(); // 只保留最近10条
    localStorage.setItem('searchHistory', JSON.stringify(history));
  }
}