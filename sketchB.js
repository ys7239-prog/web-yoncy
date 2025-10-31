// ===== Page B: Mic Rain Flower (统一尺寸 & 自适应版) =====
const sB = (p) => {
  let mic;
  let raindrops = [];
  let ripples = [];
  let flowers = [];

  p.setup = function() {
    // ✅ 改为自适应窗口的画布尺寸
    p.createCanvas(p.windowWidth * 0.9, p.windowHeight * 0.8);
    p.windowResized = function() {
      p.resizeCanvas(p.windowWidth * 0.9, p.windowHeight * 0.8);
    };

    // 保留原有功能
    mic = new p5.AudioIn();
    mic.start();
    p.frameRate(60);
    p.colorMode(p.HSB, 360, 255, 255, 255);
  };

  p.draw = function() {
    // 保持背景柔和白
    p.background(255);

    let volume = mic.getLevel();
    let thresholdValue = 0.1; // 改名避免与保留字冲突

    // 音量触发雨滴
    if (volume > thresholdValue) {
      let raindrop = new RainDrop(p.random(p.width), 0, p.random(10, 15));
      raindrops.push(raindrop);
    }

    // 更新雨滴
    for (let i = raindrops.length - 1; i >= 0; i--) {
      raindrops[i].update();
      raindrops[i].show();
      if (raindrops[i].hitsGround()) {
        ripples.push(new Ripple(raindrops[i].x, p.height - 100));
        raindrops.splice(i, 1);
      } else if (raindrops[i].offScreen()) {
        raindrops.splice(i, 1);
      }
    }

    // 更新水纹
    for (let i = ripples.length - 1; i >= 0; i--) {
      ripples[i].update();
      ripples[i].show();
      if (ripples[i].isFinished()) {
        let stemHeight = p.random(100, 300);
        flowers.push(new Flower(ripples[i].x, p.height - 100, stemHeight));
        ripples.splice(i, 1);
      }
    }

    // 绘制花
    for (let i = 0; i < flowers.length; i++) {
      flowers[i].grow();
      flowers[i].display();
    }
  };

  // ========== 雨滴类 ==========
  class RainDrop {
    constructor(x, y, size) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.speed = p.random(8, 12);
    }
    update() { this.y += this.speed; }
    show() {
      p.textSize(this.size * 1.5);
      p.textAlign(p.CENTER, p.CENTER);
      p.fill(200, 120, 255);
      p.text('💧', this.x, this.y);
    }
    hitsGround() { return this.y >= p.height - 100; }
    offScreen() { return this.y > p.height; }
  }

  // ========== 水纹类 ==========
  class Ripple {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 0;
      this.maxRadius = 20;
      this.alpha = 200;
    }
    update() {
      this.radius += 2;
      this.alpha -= 4;
    }
    show() {
      p.noFill();
      p.stroke(200, 200, 255, this.alpha);
      p.strokeWeight(2);
      p.ellipse(this.x, this.y, this.radius * 2, this.radius / 2);
    }
    isFinished() { return this.alpha <= 0; }
  }

  // ========== 花类 ==========
  class Flower {
    constructor(x, y, stemHeight) {
      this.position = p.createVector(x, y);
      this.stemHeight = stemHeight;
      this.stemGrowth = 0;
      this.stemGrowthRate = p.random(2, 5);
      this.bloomed = false;
      this.numPetals = p.int(p.random(20, 30));
      this.petalGrowth = 0;
      this.maxPetalGrowth = p.random(15, 25);

      // 柔和色系花瓣
      const hueChoices = [330, 280, 240, 180];
      let h = p.random(hueChoices);
      this.petalColor = p.color(h, 80, 255, 200);
      this.centerColor = p.color(60, 200, 255, 255);
    }

    grow() {
      if (!this.bloomed) {
        this.stemGrowth += this.stemGrowthRate;
        if (this.stemGrowth >= this.stemHeight) this.bloomed = true;
      } else {
        if (this.petalGrowth < this.maxPetalGrowth) this.petalGrowth += 1;
      }
    }

    display() {
      p.push();
      p.translate(this.position.x, this.position.y);
      p.stroke('#0F6135');
      p.strokeWeight(2);
      p.line(0, 0, 0, -this.stemGrowth);

      if (this.bloomed) {
        p.translate(0, -this.stemGrowth);
        p.noStroke();
        p.fill(this.petalColor);
        p.rotate(p.frameCount * 0.01);
        for (let i = 0; i < this.numPetals; i++) {
          let angle = p.map(i, 0, this.numPetals, 0, p.TWO_PI);
          p.push();
          p.rotate(angle);
          p.ellipse(0, this.petalGrowth / 2, this.petalGrowth / 4, this.petalGrowth * 1.5);
          p.pop();
        }
        p.fill(this.centerColor);
        p.ellipse(0, 0, this.maxPetalGrowth / 3);
      }
      p.pop();
    }
  }
};

window.p5B = new p5(sB, 'sketchB');
