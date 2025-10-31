// ===== Page C: Soft Pastel Bubbles (Instance Mode, transparent canvas) =====
const sC = (p) => {
  let bubbles = [];
  let spawnEvery = 0; // 拖动时节流

  p.setup = function () {
    p.createCanvas(720, 400);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    // 
  };

  p.draw = function () {
    p.clear(); // 透明清屏

    // 更新 & 绘制
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.update();
      b.render();
      if (b.isGone()) bubbles.splice(i, 1);
    }

    // HUD（很淡）
    p.push();
    p.noStroke();
    p.fill(0, 0, 0, 40);
    p.textSize(12);
    p.text('Page C · Click or drag to create soft bubbles (press C to clear).', 16, p.height - 16);
    p.pop();

    // 拖动生成（节流）
    if (p.mouseIsPressed && mouseInCanvas()) {
      if (spawnEvery % 4 === 0) spawnBubble(p.mouseX, p.mouseY);
      spawnEvery++;
    } else {
      spawnEvery = 0;
    }
  };

  p.mousePressed = function () {
    if (mouseInCanvas()) spawnBubble(p.mouseX, p.mouseY, true);
  };

  p.keyPressed = function () {
    if (p.key === 'c' || p.key === 'C') bubbles = [];
  };

  function mouseInCanvas() {
    return p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;
  }

  function spawnBubble(x, y, cluster = false) {
    const n = cluster ? p.int(p.random(3, 6)) : 1;
    for (let i = 0; i < n; i++) {
      const off = cluster ? p.random(-12, 12) : 0;
      bubbles.push(new Bubble(x + off, y + off));
    }
  }

  class Bubble {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      // 柔和粉系调色板（HSB）
      const palettes = [
        {h1: 330, h2: 300}, // 粉—紫粉
        {h1: 315, h2: 270}, // 薰衣草
        {h1: 230, h2: 200}, // 天蓝偏粉
        {h1: 150, h2: 130}, // 薄荷
        {h1:  55, h2:  45}, // 奶油黄
      ];
      const pal = p.random(palettes);
      this.hIn = pal.h1 + p.random(-4, 4);
      this.hOut = pal.h2 + p.random(-4, 4);

      this.s = p.random(26, 42);  // 低饱和
      this.b = 98;                // 高明度

      this.r = p.random(18, 46);  // 半径
      this.alpha = 0;             // 先淡入
      this.alphaTarget = p.random(26, 46);

      // 漂浮 & 轻摆
      this.vx = p.random(-0.4, 0.4);
      this.vy = p.random(-0.8, -0.2);
      this.wobbleA = p.random(1000);
      this.wobbleB = p.random(1000);
      this.wobbleAmp = p.random(0.6, 1.2);
      this.spin = p.random(-0.6, 0.6);

      // 寿命（很长，缓慢淡出）
      this.life = 0;
      this.lifeMax = p.random(480, 900); // 8~15秒（60fps）
    }

    update() {
      this.life++;
      // 漂浮 + 轻摆
      this.x += this.vx + p.sin(this.wobbleA + this.life * 0.02) * this.wobbleAmp * 0.4;
      this.y += this.vy + p.cos(this.wobbleB + this.life * 0.018) * this.wobbleAmp * 0.3;

      // 
      if (this.life < 40) {
        this.alpha = p.lerp(this.alpha, this.alphaTarget, 0.1);
      } else if (this.life > this.lifeMax * 0.8) {
        this.alpha = p.lerp(this.alpha, 0, 0.03);
      }

      // 
      const m = 16;
      if (this.x < m || this.x > p.width - m) this.vx *= -1;
      if (this.y < m || this.y > p.height - m) this.vy *= -1;
    }

    render() {
      // 画一个“径向渐变”的泡泡：由内向外 5 层
      p.push();
      p.translate(this.x, this.y);
      p.noStroke();
      const layers = 5;
      for (let i = layers; i >= 1; i--) {
        const t = i / layers;
        const h = p.lerp(this.hIn, this.hOut, 1 - t);
        const s = this.s * 0.9;
        const b = this.b - (1 - t) * 3;
        const a = this.alpha * (0.5 + 0.5 * t); // 外圈更淡
        p.fill(h, s, b, a);
        p.ellipse(0, 0, this.r * 2 * t, this.r * 2 * t);
      }
      // 小高光
      p.fill((this.hIn + 24) % 360, this.s * 0.5, 100, this.alpha * 0.6);
      p.ellipse(this.r * 0.4 * 0.6, -this.r * 0.4 * 0.6, this.r * 0.55, this.r * 0.38);
      p.pop();
    }

    isGone() {
      return this.life > this.lifeMax && this.alpha < 1;
    }
  }
};

window.p5C = new p5(sC, 'sketchC');
