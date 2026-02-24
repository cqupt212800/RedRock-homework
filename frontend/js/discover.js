// discover.js

document.addEventListener('DOMContentLoaded', async function () {
  try {
    // 初始化主标签切换
    initMainTabs();

    // 如果当前是歌单广场标签页，初始化分类标签
    if (document.getElementById('tab-playlist').classList.contains('active')) {
      await initPlaylistCats();
    }

    console.log('发现页面加载完成');
  } catch (error) {
    console.error('初始化失败:', error);
  }
});

// 主标签切换
function initMainTabs() {
  const mainTabs = document.querySelectorAll('.main-tab');
  const panes = document.querySelectorAll('.tab-pane');

  mainTabs.forEach(tab => {
    tab.addEventListener('click', function () {
      const tabName = this.dataset.tab;
      if (!tabName) return;

      // 更新主标签active
      mainTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      // 更新内容区active
      panes.forEach(pane => pane.classList.remove('active'));
      const targetPane = document.getElementById(`tab-${tabName}`);
      if (targetPane) targetPane.classList.add('active');

      // 如果切换到歌单广场，且尚未初始化分类，则初始化
      if (tabName === 'playlist' && !window.playlistCatsInitialized) {
        initPlaylistCats();
      }
    });
  });
}

// ========== 歌单广场分类标签功能 ==========

const playlistCats = [
  { name: '推荐', cat: 'recommend' },
  { name: '官方', cat: '官方' },
  { name: '华语', cat: '华语' },
  { name: '摇滚', cat: '摇滚' },
  { name: '民谣', cat: '民谣' },
  { name: '电子', cat: '电子' },
  { name: '轻音乐', cat: '轻音乐' },
  { name: '更多分类', cat: 'more' }
];

let currentCat = 'recommend';
let playlistCatsInitialized = false;

async function initPlaylistCats() {
  const tabsContainer = document.getElementById('playlist-cat-tabs');
  if (!tabsContainer) return;

  // 生成标签HTML
  tabsContainer.innerHTML = playlistCats.map(cat => `
    <button class="sub-tab ${cat.cat === currentCat ? 'active' : ''}" data-cat="${cat.cat}">${cat.name}</button>
  `).join('');

  // 绑定点击事件
  tabsContainer.querySelectorAll('.sub-tab').forEach(tab => {
    tab.addEventListener('click', async function () {
      const cat = this.dataset.cat;
      if (cat === 'more') {
        alert('更多分类功能暂未实现');
        return;
      }

      // 更新active样式
      tabsContainer.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      // 加载对应分类的歌单
      currentCat = cat;
      await loadPlaylistsByCat(cat);
    });
  });

  // 默认加载推荐分类
  await loadPlaylistsByCat('recommend');
  playlistCatsInitialized = true;
}

// 根据分类加载歌单
async function loadPlaylistsByCat(cat) {
  const container = document.getElementById('cat-playlists');
  if (!container) return;

  let playlists = [];
  if (cat === 'recommend') {
    playlists = await getRecommendPlaylists(30);
  } else {
    playlists = await getPlaylistByCat(cat, 30);
  }

  if (playlists.length === 0) {
    container.innerHTML = '<p class="no-data">暂无歌单</p>';
    return;
  }

  container.innerHTML = playlists.map(playlist => `
    <div class="playlist-card" onclick="openPlaylist(${playlist.id})">
      <div class="playlist-cover">
        <img src="${playlist.coverImgUrl || playlist.picUrl}" alt="${playlist.name}" loading="lazy">
        <span class="play-count">${formatPlayCount(playlist.playCount || 0)}</span>
      </div>
      <div class="playlist-title">${playlist.name}</div>
    </div>
  `).join('');
}

// 打开歌单详情
function openPlaylist(id) {
  window.location.href = `playlist.html?id=${id}`;
}

// 格式化播放量（复用utils中的函数）
function formatPlayCount(count) {
  if (count >= 100000000) return (count / 100000000).toFixed(1) + '亿';
  if (count >= 10000) return (count / 10000).toFixed(1) + '万';
  return count;
}