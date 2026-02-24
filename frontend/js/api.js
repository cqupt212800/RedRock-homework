const API_BASE = 'http://localhost:3000';

// 通用的请求函数
async function request(url, params = {}) {
  try {
    // 构建查询字符串
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    const response = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API请求失败:', error);
    return null;
  }
}


// 获取轮播图数据
async function getBanners() {
  try {
    const response = await fetch(`${API_BASE}/banner`);
    const data = await response.json();
    return data.banners || [];
  } catch (error) {
    console.error('获取轮播图失败:', error);
    return [];
  }
}

// 获取推荐歌单
async function getRecommendPlaylists(limit = 10) {
  try {
    const response = await fetch(`${API_BASE}/personalized?limit=${limit}`);
    const data = await response.json();
    return data.result || [];
  } catch (error) {
    console.error('获取推荐歌单失败:', error);
    return [];
  }
}

// 获取推荐新音乐
async function getRecommendNewSongs(limit = 10) {
  try {
    const response = await fetch(`${API_BASE}/personalized/newsong?limit=${limit}`);
    const data = await response.json();
    return data.result || [];
  } catch (error) {
    console.error('获取推荐新音乐失败:', error);
    return [];
  }
}

// 获取每日推荐歌曲
async function getDailySongs() {
  try {
    const response = await fetch(`${API_BASE}/recommend/songs`);
    const data = await response.json();
    return data.data.dailySongs || [];
  } catch (error) {
    console.error('获取每日推荐失败:', error);
    return [];
  }
}

// 获取热歌榜
async function getHotSongs() {
  try {
    const response = await fetch(`${API_BASE}/playlist/detail?id=3778678`);
    const data = await response.json();
    return data.playlist.tracks.slice(0, 10) || [];
  } catch (error) {
    console.error('获取热歌榜失败:', error);
    return [];
  }
}

// 获取歌单分类
async function getPlaylistCategories() {
  try {
    const response = await fetch(`${API_BASE}/playlist/catlist`);
    const data = await response.json();
    return data.sub || [];
  } catch (error) {
    console.error('获取歌单分类失败:', error);
    return [];
  }
}

// 获取歌单详情
async function getPlaylistDetail(id) {
  try {
    const response = await fetch(`${API_BASE}/playlist/detail?id=${id}`);
    const data = await response.json();
    return data.playlist || null;
  } catch (error) {
    console.error('获取歌单详情失败:', error);
    return null;
  }
}

// 获取歌单所有歌曲（已在上方JS中定义，但也可以保留此函数备用）
async function getPlaylistAllTracks(id, limit) {
  const url = limit ? `${API_BASE}/playlist/track/all?id=${id}&limit=${limit}` : `${API_BASE}/playlist/track/all?id=${id}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.songs || [];
}

// 获取歌曲URL
async function getSongUrl(id) {
  const res = await fetch(`${API_BASE}/song/url?id=${id}`);
  const data = await res.json();
  return data.data[0]?.url;
}

// 获取歌曲详情
async function getSongDetail(ids) {
  const res = await fetch(`${API_BASE}/song/detail?ids=${ids}`);
  const data = await res.json();
  return data.songs;
}

// 获取推荐歌单（用于侧边栏）
async function getRecommendPlaylists(limit) {
  const res = await fetch(`${API_BASE}/personalized?limit=${limit}`);
  const data = await res.json();
  return data.result;
}

// 获取歌词
async function getLyric(id) {
  try {
    const response = await fetch(`${API_BASE}/lyric?id=${id}`);
    const data = await response.json();
    return data.lrc?.lyric || '';
  } catch (error) {
    console.error('获取歌词失败:', error);
    return '';
  }
}

// 获取歌曲URL
async function getSongUrl(id) {
  try {
    const response = await fetch(`${API_BASE}/song/url?id=${id}`);
    const data = await response.json();
    return data.data[0]?.url || '';
  } catch (error) {
    console.error('获取歌曲URL失败:', error);
    return '';
  }
}

// 获取歌曲播放地址
async function getSongUrl(id) {
  try {
    const response = await fetch(`${API_BASE}/song/url?id=${id}`);
    const data = await response.json();
    return data.data[0]?.url;
  } catch (error) {
    console.error('获取歌曲地址失败:', error);
    return null;
  }
}
// 搜索建议
async function getSearchSuggest(keyword) {
  try {
    const response = await fetch(`${API_BASE}/search/suggest?keywords=${keyword}&type=mobile`);
    const data = await response.json();
    return data.result || {};
  } catch (error) {
    console.error('获取搜索建议失败:', error);
    return {};
  }
}

// 热搜榜
async function getHotSearch() {
  try {
    const response = await fetch(`${API_BASE}/search/hot/detail`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('获取热搜榜失败:', error);
    return [];
  }
}

// 获取新歌速递 (type: 0全部,7华语,96欧美,8日本,16韩国)
async function getTopSongs(type = 7) {
  try {
    const res = await fetch(`${API_BASE}/top/song?type=${type}`);
    const data = await res.json();
    return data.data || [];
  } catch (e) {
    return [];
  }
}

// 获取指定分类的歌单 (网友精选碟)
async function getPlaylistByCat(cat, limit = 30, order = 'hot') {
  try {
    const response = await fetch(`${API_BASE}/top/playlist?cat=${encodeURIComponent(cat)}&limit=${limit}&order=${order}`);
    const data = await response.json();
    return data.playlists || [];
  } catch (error) {
    console.error('获取分类歌单失败:', error);
    return [];
  }
}

// 获取精品歌单 (可选)
async function getHighQualityPlaylist(cat = '全部', limit = 30) {
  try {
    const response = await fetch(`${API_BASE}/top/playlist/highquality?cat=${encodeURIComponent(cat)}&limit=${limit}`);
    const data = await response.json();
    return data.playlists || [];
  } catch (error) {
    console.error('获取精品歌单失败:', error);
    return [];
  }
}

// 获取用户喜欢的音乐ID列表
async function getLikedSongs(uid) {
  try {
    const res = await fetch(`${API_BASE}/likelist?uid=${uid}&cookie=${encodeURIComponent(COOKIE)}`);
    const data = await res.json();
    return data.ids || [];
  } catch (error) {
    console.error('获取喜欢列表失败', error);
    return [];
  }
}

// 喜欢/取消喜欢歌曲
async function likeSong(id, like) {
  try {
    const res = await fetch(`${API_BASE}/like?id=${id}&like=${like}&cookie=${encodeURIComponent(COOKIE)}&timestamp=${Date.now()}`);
    const data = await res.json();
    return data.code === 200;
  } catch (error) {
    console.error('喜欢操作失败', error);
    return false;
  }
}