// player.js - 全局播放器（防止重复初始化）

// 检查是否已经存在播放器实例
if (!window.playerInstance) {

  class Player {
    constructor() {
      console.log('创建新的播放器实例');
      this.audio = document.getElementById('global-audio');
      this.currentSong = null;
      this.playlist = [];
      this.currentIndex = -1;
      this.isPlaying = false;
      this.volume = 0.8;
      this.isMuted = false;
      this.preVolume = 0.8;

      if (this.audio) {
        this.init();
      }
    }

    init() {
      this.audio.volume = this.volume;
      this.bindEvents();
      this.loadSavedState();

      // 延迟初始化控制按钮，确保DOM已加载
      setTimeout(() => this.initControls(), 100);
    }

    bindEvents() {
      this.audio.addEventListener('timeupdate', () => {
        this.updateProgress();
      });

      this.audio.addEventListener('ended', () => {
        console.log('歌曲播放结束，自动下一首');
        this.next();
      });

      this.audio.addEventListener('loadedmetadata', () => {
        this.updateTotalTime();
      });

      this.audio.addEventListener('play', () => {
        console.log('音频播放事件触发');
        this.isPlaying = true;
        this.updatePlayButton();
      });

      this.audio.addEventListener('pause', () => {
        console.log('音频暂停事件触发');
        this.isPlaying = false;
        this.updatePlayButton();
      });

      this.audio.addEventListener('error', (e) => {
        console.error('音频错误:', e);
      });
    }

    initControls() {
      console.log('初始化播放器控制按钮');

      // 播放/暂停按钮
      const playBtn = document.getElementById('player-play');
      if (playBtn) {
        // 移除之前可能绑定的所有事件
        const newPlayBtn = playBtn.cloneNode(true);
        playBtn.parentNode.replaceChild(newPlayBtn, playBtn);

        newPlayBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          console.log('播放按钮被点击，当前播放状态:', this.isPlaying);
          this.togglePlay();
        });
        console.log('播放按钮已绑定');
      }

      // 上一首
      const prevBtn = document.getElementById('player-prev');
      if (prevBtn) {
        const newPrevBtn = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
        newPrevBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          console.log('上一首按钮被点击');
          this.prev();
        });
      }

      // 下一首
      const nextBtn = document.getElementById('player-next');
      if (nextBtn) {
        const newNextBtn = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
        newNextBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          console.log('下一首按钮被点击');
          this.next();
        });
      }

      // 进度条
      const progressSlider = document.getElementById('player-progress-slider');
      if (progressSlider) {
        // 移除旧事件
        const newSlider = progressSlider.cloneNode(true);
        progressSlider.parentNode.replaceChild(newSlider, progressSlider);
        newSlider.addEventListener('input', (e) => {
          if (this.audio.duration) {
            const time = (e.target.value / 100) * this.audio.duration;
            this.seek(time);
          }
        });
      }

      // 音量控制
      const volumeSlider = document.getElementById('volume-slider');
      if (volumeSlider) {
        const newVolumeSlider = volumeSlider.cloneNode(true);
        volumeSlider.parentNode.replaceChild(newVolumeSlider, volumeSlider);
        newVolumeSlider.addEventListener('input', (e) => {
          this.setVolume(e.target.value / 100);
        });
      }

      const volumeBtn = document.getElementById('volume-btn');
      if (volumeBtn) {
        const newVolumeBtn = volumeBtn.cloneNode(true);
        volumeBtn.parentNode.replaceChild(newVolumeBtn, volumeBtn);
        newVolumeBtn.addEventListener('click', () => this.toggleMute());
      }

      // 歌词按钮
      const lyricBtn = document.getElementById('lyric-btn');
      if (lyricBtn) {
        const newLyricBtn = lyricBtn.cloneNode(true);
        lyricBtn.parentNode.replaceChild(newLyricBtn, lyricBtn);
        newLyricBtn.addEventListener('click', () => {
          if (this.currentSong) {
            window.location.href = `player-detail.html?songId=${this.currentSong.id}`;
          }
        });
      }

      // 播放列表按钮
      const playlistBtn = document.getElementById('playlist-btn');
      if (playlistBtn) {
        const newPlaylistBtn = playlistBtn.cloneNode(true);
        playlistBtn.parentNode.replaceChild(newPlaylistBtn, playlistBtn);
        newPlaylistBtn.addEventListener('click', () => {
          this.togglePlaylist();
        });
      }

      // 更新UI以匹配当前状态
      this.updatePlayButton();
      this.updateVolumeIcon();
    }

    play(song) {
      console.log('play() 被调用', song);

      if (song) {
        this.currentSong = song;
        this.audio.src = song.url || '';

        // 更新播放器显示
        const nameEl = document.getElementById('player-song-name');
        const artistEl = document.getElementById('player-song-artist');
        const coverEl = document.getElementById('player-cover');
        const badgesEl = document.getElementById('player-badges');

        if (nameEl) nameEl.textContent = song.name || '';
        if (artistEl) {
          artistEl.textContent = song.artists ? song.artists.map(a => a.name).join(' / ') :
            (song.ar ? song.ar.map(a => a.name).join(' / ') : '');
        }

        // 更新封面
        if (coverEl) {
          if (song.album?.picUrl) {
            coverEl.src = song.album.picUrl;
          } else if (song.al?.picUrl) {
            coverEl.src = song.al.picUrl;
          } else {
            coverEl.src = './assets/default-cover.jpg';
          }
        }

        // 更新标签
        if (badgesEl) {
          badgesEl.innerHTML = '';
          if (song.privilege?.maxBrLevel === 'hires') {
            const badge = document.createElement('span');
            badge.className = 'player-badge';
            badge.textContent = '超清母带';
            badgesEl.appendChild(badge);
          }
        }

        // 显示播放器
        this.showPlayer();
      }

      if (this.audio.src) {
        console.log('尝试播放音频:', this.audio.src);

        const playPromise = this.audio.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('播放成功');
              this.isPlaying = true;
              this.updatePlayButton();
              this.saveState();
            })
            .catch(error => {
              console.error('播放失败:', error);
              if (error.name === 'NotAllowedError') {
                // 自动播放被阻止，需要用户交互
                alert('请点击页面任意位置后重试播放');
              }
            });
        }
      }
    }

    pause() {
      console.log('pause() 被调用');
      this.audio.pause();
      this.isPlaying = false;
      this.updatePlayButton();
      this.saveState();
    }

    togglePlay() {
      console.log('togglePlay() 被调用，当前isPlaying:', this.isPlaying);
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    }

    next() {
      console.log('next() 被调用');
      if (this.playlist.length > 0 && this.currentIndex < this.playlist.length - 1) {
        this.currentIndex++;
        this.play(this.playlist[this.currentIndex]);
      } else if (this.playlist.length > 0) {
        this.currentIndex = 0;
        this.play(this.playlist[0]);
      }
    }

    prev() {
      console.log('prev() 被调用');
      if (this.playlist.length > 0 && this.currentIndex > 0) {
        this.currentIndex--;
        this.play(this.playlist[this.currentIndex]);
      } else if (this.playlist.length > 0) {
        this.currentIndex = this.playlist.length - 1;
        this.play(this.playlist[this.currentIndex]);
      }
    }

    seek(time) {
      this.audio.currentTime = time;
    }

    setVolume(volume) {
      this.volume = volume;
      this.audio.volume = volume;
      this.isMuted = (volume === 0);
      this.updateVolumeIcon();
    }

    toggleMute() {
      if (this.isMuted) {
        this.setVolume(this.preVolume || 0.8);
      } else {
        this.preVolume = this.volume;
        this.setVolume(0);
      }
      this.isMuted = !this.isMuted;
    }

    updateProgress() {
      const progressFilled = document.getElementById('player-progress-filled');
      const currentTime = document.getElementById('current-time');
      const progressSlider = document.getElementById('player-progress-slider');

      if (progressFilled && this.audio.duration) {
        const percent = (this.audio.currentTime / this.audio.duration) * 100;
        progressFilled.style.width = `${percent}%`;

        if (progressSlider) {
          progressSlider.value = percent;
        }
      }

      if (currentTime) {
        currentTime.textContent = this.formatTime(this.audio.currentTime);
      }
    }

    updateTotalTime() {
      const totalTime = document.getElementById('total-time');
      if (totalTime && this.audio.duration) {
        totalTime.textContent = this.formatTime(this.audio.duration);
      }
    }

    updatePlayButton() {
      const playBtn = document.getElementById('player-play');
      if (playBtn) {
        playBtn.textContent = this.isPlaying ? '⏸' : '▶';
        console.log('更新播放按钮文字:', playBtn.textContent);
      }
    }

    updateVolumeIcon() {
      const volumeBtn = document.getElementById('volume-btn');
      if (volumeBtn) {
        if (this.isMuted || this.volume === 0) {
          volumeBtn.textContent = '🔇';
        } else if (this.volume < 0.3) {
          volumeBtn.textContent = '🔈';
        } else if (this.volume < 0.7) {
          volumeBtn.textContent = '🔉';
        } else {
          volumeBtn.textContent = '🔊';
        }
      }
    }

    showPlayer() {
      const playerBar = document.getElementById('player-bar');
      if (playerBar) {
        playerBar.style.display = 'flex';
      }
    }

    hidePlayer() {
      const playerBar = document.getElementById('player-bar');
      if (playerBar) {
        playerBar.style.display = 'none';
      }
    }

    togglePlaylist() {
      const panel = document.getElementById('playlist-panel');
      if (panel) {
        if (panel.style.display === 'block') {
          panel.style.display = 'none';
        } else {
          this.renderPlaylist();
          panel.style.display = 'block';
        }
      }
    }

    renderPlaylist() {
      const container = document.getElementById('playlist-content');
      if (!container || !this.playlist.length) return;

      container.innerHTML = this.playlist.map((song, index) => {
        const isCurrent = (index === this.currentIndex);
        const artists = song.ar ? song.ar.map(a => a.name).join('/') :
          (song.artists ? song.artists.map(a => a.name).join('/') : '');

        return `
          <div class="playlist-item ${isCurrent ? 'active' : ''}" data-index="${index}">
            <span class="item-index">${index + 1}</span>
            <span class="item-name">${song.name}</span>
            <span class="item-artist">${artists}</span>
          </div>
        `;
      }).join('');

      container.querySelectorAll('.playlist-item').forEach(item => {
        item.addEventListener('click', () => {
          const index = parseInt(item.dataset.index);
          this.playAtIndex(index);
        });
      });
    }

    playAtIndex(index) {
      if (index >= 0 && index < this.playlist.length) {
        this.currentIndex = index;
        this.play(this.playlist[index]);
      }
    }

    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return '00:00';
      const min = Math.floor(seconds / 60);
      const sec = Math.floor(seconds % 60);
      return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }

    saveState() {
      try {
        const state = {
          currentSong: this.currentSong,
          currentIndex: this.currentIndex,
          playlist: this.playlist,
          currentTime: this.audio.currentTime,
          isPlaying: this.isPlaying,
          volume: this.volume
        };
        localStorage.setItem('playerState', JSON.stringify(state));
      } catch (e) {
        console.error('保存播放状态失败', e);
      }
    }

    loadSavedState() {
      const saved = localStorage.getItem('playerState');
      if (saved) {
        try {
          const state = JSON.parse(saved);
          this.playlist = state.playlist || [];
          this.currentIndex = state.currentIndex || -1;
          this.volume = state.volume || 0.8;
          this.audio.volume = this.volume;

          if (state.currentSong) {
            this.currentSong = state.currentSong;
            document.getElementById('player-song-name').textContent = state.currentSong.name || '';
            document.getElementById('player-song-artist').textContent =
              state.currentSong.artists ? state.currentSong.artists.map(a => a.name).join('/') :
                (state.currentSong.ar ? state.currentSong.ar.map(a => a.name).join('/') : '');
          }
        } catch (e) {
          console.error('加载播放状态失败', e);
        }
      }
    }
  }

  // 创建全局播放器实例并存储
  window.playerInstance = new Player();
}

// 导出播放器实例
window.player = window.playerInstance;

// 确保在DOM加载完成后重新尝试初始化控制按钮
document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM加载完成，确保播放器控制已初始化');
  if (window.player) {
    setTimeout(() => {
      window.player.initControls();
    }, 200);
  }
});