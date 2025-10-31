const sC = (p) => {
  let bubbles = [];
  let spawnEvery = 0;

  p.setup = function () {
    p.createCanvas(p.windowWidth * 0.9, p.windowHeight * 0.8);
    p.windowResized = function () {
      p.resizeCanvas(p.windowWidth * 0.9, p.windowHeight * 0.8);
    };
    p.colorMode(p.HSB, 360, 100, 100, 100);
  };

  p.draw = function () {
    p.background(255);

    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.update();
      b.render();
      if (b.isGone()) bubbles.splice(i, 1);
    }

    if (p.mouseIsPressed && mouseInCanvas()) {
      if (spawnEvery % 4 === 0) spawnBubble(p.mouseX, p.mouseY);
      spawnEvery++;
    } else spawnEvery = 0;
  };

  function mouseInCanvas() {
    return p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;
  }

  function spawnBubble(x, y) {
    const n = p.int(p.random(2, 4));
    for (let i = 0; i < n; i++) {
      const off = p.random(-10, 10);
      bubbles.push(new Bubble(x + off, y + off));
    }
  }

  class Bubble {
    constructor(x, y) {
      this.x = x; this.y = y;
      this.r = p.random(15, 40);
      this.alpha = 40 + p.random(20);
      this.vx = p.random(-0.4, 0.4);
      this.vy = p.random(-0.8, -0.3);
      this.h = p.random(200, 340);
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= 0.1;
    }
    render() {
      p.noStroke();
      p.fill(this.h, 40, 100, this.alpha);
      p.ellipse(this.x, this.y, this.r * 2);
    }
    isGone() { return this.alpha <= 0; }
  }
};

window.p5C = new p5(sC, 'sketchC');
