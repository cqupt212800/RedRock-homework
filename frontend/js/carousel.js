class Carousel {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.indicatorsContainer = document.getElementById('carousel-indicators');
    this.items = [];
    this.currentIndex = 0;
    this.interval = null;
    this.options = {
      interval: 3000,
      autoplay: true,
      ...options
    };
    this.init();
  }

  init() {
    this.loadBanners();
    if (this.options.autoplay) {
      this.startAutoPlay();
    }
  }

  async loadBanners() {
    const banners = await getBanners();
    if (banners.length > 0) {
      this.render(banners);
    } else {
      this.renderDefault();
    }
  }

  render(banners) {
    // 清空容器
    this.container.innerHTML = '';
    this.indicatorsContainer.innerHTML = '';

    // 创建轮播项
    banners.forEach((banner, index) => {
      const item = document.createElement('div');
      item.className = `carousel-item ${index === 0 ? 'active' : ''}`;
      item.innerHTML = `
                <img src="${banner.imageUrl}" alt="${banner.typeTitle}">
                <div class="carousel-caption">${banner.typeTitle}</div>
            `;
      this.container.appendChild(item);
      this.items.push(item);

      // 创建指示器
      const indicator = document.createElement('div');
      indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
      indicator.addEventListener('click', () => this.goToSlide(index));
      this.indicatorsContainer.appendChild(indicator);
    });
  }

  renderDefault() {
    const defaultBanners = [
      { imageUrl: './assets/banner1.jpg', typeTitle: '热门推荐' },
      { imageUrl: './assets/banner2.jpg', typeTitle: '新歌首发' },
      { imageUrl: './assets/banner3.jpg', typeTitle: '独家歌单' }
    ];
    this.render(defaultBanners);
  }

  goToSlide(index) {
    if (index < 0 || index >= this.items.length) return;

    // 移除当前激活项
    this.items[this.currentIndex].classList.remove('active');
    this.indicatorsContainer.children[this.currentIndex].classList.remove('active');

    // 设置新激活项
    this.currentIndex = index;
    this.items[this.currentIndex].classList.add('active');
    this.indicatorsContainer.children[this.currentIndex].classList.add('active');
  }

  nextSlide() {
    const nextIndex = (this.currentIndex + 1) % this.items.length;
    this.goToSlide(nextIndex);
  }

  prevSlide() {
    const prevIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.goToSlide(prevIndex);
  }

  startAutoPlay() {
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => this.nextSlide(), this.options.interval);
  }

  stopAutoPlay() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}