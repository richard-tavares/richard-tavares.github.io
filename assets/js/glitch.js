class GlitchMatrix {
  constructor({
    canvas,
    fontSize = 16,
    cellWidth = 10,
    cellHeight = 20,
    glitchInterval = 33,
    colors,
    characters = Array.from({ length: 94 }, (_, i) => String.fromCodePoint(i + 33)).join('')
  }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.fontSize = fontSize;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.glitchInterval = glitchInterval;
    this.characters = characters.split('');
    this.colors = colors.map(h => this.hexToRgb(h));
    this.cells = [];
    this.lastTime = 0;
    this.lastGlitchTime = 0;
    this.animationFrame = null;
    this.handleResize = this.handleResize.bind(this);
    this.animate = this.animate.bind(this);
    this.init();
  }

  init() {
    this.resize();
    globalThis.addEventListener('resize', this.handleResize);
    this.start();
  }

  start() {
    if (prefersReducedMotion || this.animationFrame) return;
    this.lastTime = performance.now();
    this.animationFrame = requestAnimationFrame(this.animate);
  }

  stop() {
    cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
  }

  handleResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => this.resize(), 100);
  }

  resize() {
    const dpr = globalThis.devicePixelRatio || 1;
    const { width, height } = this.canvas.parentElement.getBoundingClientRect();

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.columns = Math.ceil(width / this.cellWidth);
    this.rows = Math.ceil(height / this.cellHeight);
    this.createGrid();
    this.renderAll();
  }

  createGrid() {
    this.cells.length = 0;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        const color = this.randomColor();
        this.cells.push({
          x: col * this.cellWidth,
          y: row * this.cellHeight,
          char: this.randomChar(),
          color: { ...color },
          startColor: { ...color },
          targetColor: this.randomColor(),
          progress: 1,
          dirty: false
        });
      }
    }
  }

  randomChar() {
    return this.characters[Math.floor(Math.random() * this.characters.length)];
  }

  randomColor() {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }

  hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(v => v + v).join('');
    return {
      r: Number.parseInt(hex.substring(0, 2), 16),
      g: Number.parseInt(hex.substring(2, 4), 16),
      b: Number.parseInt(hex.substring(4, 6), 16)
    };
  }

  setColors(colors) {
    this.colors = colors.map(h => this.hexToRgb(h));
    for (const cell of this.cells) {
      if (prefersReducedMotion) {
        cell.color = { ...this.randomColor() };
        cell.progress = 1;
      } else {
        cell.startColor = { ...cell.color };
        cell.targetColor = this.randomColor();
        cell.progress = 0;
      }
    }
    if (prefersReducedMotion) this.renderAll();
  }

  update(delta) {
    if (performance.now() - this.lastGlitchTime >= this.glitchInterval) {
      const updates = Math.max(1, Math.floor(this.cells.length * 0.05));
      for (let i = 0; i < updates; i++) {
        const cell = this.cells[Math.floor(Math.random() * this.cells.length)];
        cell.char = this.randomChar();
        cell.startColor = { ...cell.color };
        cell.targetColor = this.randomColor();
        cell.progress = 0;
      }
      this.lastGlitchTime = performance.now();
    }

    for (const cell of this.cells) {
      if (cell.progress < 1) {
        cell.progress = Math.min(1, cell.progress + delta * 0.003);
        const t = cell.progress;
        cell.color.r = cell.startColor.r + (cell.targetColor.r - cell.startColor.r) * t;
        cell.color.g = cell.startColor.g + (cell.targetColor.g - cell.startColor.g) * t;
        cell.color.b = cell.startColor.b + (cell.targetColor.b - cell.startColor.b) * t;
        cell.dirty = true;
      }
    }
  }

  drawCell(cell) {
    const { ctx } = this;
    ctx.fillStyle = `rgb(${Math.trunc(cell.color.r)},${Math.trunc(cell.color.g)},${Math.trunc(cell.color.b)})`;
    ctx.fillText(cell.char, cell.x, cell.y);
    cell.dirty = false;
  }

  prepareContext() {
    this.ctx.font = `${this.fontSize}px monospace`;
    this.ctx.textBaseline = 'top';
  }

  renderAll() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.prepareContext();
    for (const cell of this.cells) this.drawCell(cell);
  }

  render() {
    const { ctx, cellWidth, cellHeight } = this;
    this.prepareContext();
    for (const cell of this.cells) {
      if (!cell.dirty) continue;
      ctx.clearRect(cell.x, cell.y, cellWidth, cellHeight);
      this.drawCell(cell);
    }
  }

  animate(time) {
    const delta = time - this.lastTime;
    this.lastTime = time;
    this.update(delta);
    this.render();
    this.animationFrame = requestAnimationFrame(this.animate);
  }
}

let glitchInstance = null;

function getGlitchColors() {
  return html.dataset.theme === 'light'
    ? ['#a8a8a8', '#a0a0a0', '#989898', '#b0b0b0', '#a4a4a4']
    : ['#222222', '#2c2c2c', '#363636', '#3e3e3e', '#2a2a2a'];
}

function initGlitch() {
  const canvas = document.getElementById('glitch-canvas');
  if (!canvas) return;

  glitchInstance = new GlitchMatrix({ canvas, glitchInterval: 33, colors: getGlitchColors() });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) glitchInstance.stop();
    else glitchInstance.start();
  });
}
