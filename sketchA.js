// ===== Page A: Flower Canvas (Instance Mode) =====
const sA = (p) => {
  let flowers = [];
  let isDrafting = false;
  let startX = 0, startY = 0;

  p.setup = function () {
    p.createCanvas(720, 400);
    p.angleMode(p.DEGREES);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.background(255);
  };

  p.draw = function () {
    p.background(255);

    // 已生成的花：更新 + 渲染
    for (let f of flowers) {
      f.update();
      f.render();
    }

    // 预览（半透明）
    if (isDrafting && mouseInCanvas()) {
      const draft = makeDraftParams(startX, startY, p.mouseX, p.mouseY);
      renderFlowerPreview(draft);
    }

    drawHUD();
  };

  // 交互
  p.mousePressed = function () {
    if (!mouseInCanvas()) return;
    isDrafting = true;
    startX = p.mouseX;
    startY = p.mouseY;
  };

  p.mouseReleased = function () {
    if (!isDrafting) return;
    if (!mouseInCanvas()) { isDrafting = false; return; }
    const params = makeDraftParams(startX, startY, p.mouseX, p.mouseY);
    flowers.push(new Flower(params));
    isDrafting = false;
  };

  // 参数
  function makeDraftParams(x0, y0, x1, y1) {
    const dragDist   = p.dist(x0, y0, x1, y1);
    const centerDist = p.dist(p.width/2, p.height/2, x1, y1);

    const petalLen = p.constrain(p.map(dragDist, 0, 180, 18, 58), 12, 62);
    const petalWid = p.constrain(p.map(centerDist, 0, p.width/2, 10, 24), 8, 26);

    const dirDeg = p.degrees(p.atan2(y1 - y0, x1 - x0));

    const palette = pickSoftPalette();
    const baseHue = p.lerp(palette.hStart, palette.hEnd, p.constrain(centerDist / (p.width/2), 0, 1)) + p.random(-4, 4);
    const s = p.random(26, 52);
    const b = 96 + p.random(-2, 2);

    const petalsOptions = [6, 8, 10, 12, 14];
    const petals = p.random(petalsOptions);

    const shapeOptions = ['oval', 'point'];
    const petalShape = p.random(shapeOptions);
    const layerCount = p.random() < 0.5 ? 1 : 2;
    const gradSteps  = p.floor(p.random(2, 5));
    const coreStyle  = p.random() < 0.5 ? 'dot' : 'ring';
    const hueJitter  = p.random(1.5, 6);

    const driftMode = p.random() < 0.5 ? 'breeze' : 'float';
    const vx = p.random(-0.25, 0.25);
    const vy = p.random(-0.25, 0.25);
    const va = p.random(-0.2, 0.2);
    const breathAmp = p.random(0.02, 0.06);

    return {
      x: x0, y: y0, dir: dirDeg,
      petals, petalLen, petalWid, petalShape, layerCount, gradSteps,
      hue: baseHue, sat: s, bri: b, hueJitter,
      coreStyle,
      vx, vy, va, driftMode,
      angle: 0, t: p.random(1000), breathAmp
    };
  }

  function pickSoftPalette() {
    const palettes = [
      {name:'pink',  hStart: 330, hEnd: 300},
      {name:'peach', hStart:  20, hEnd:  10},
      {name:'lilac', hStart: 315, hEnd: 260},
      {name:'sky',   hStart: 230, hEnd: 200},
    ];
    return p.random(palettes);
  }

  // 预览
  function renderFlowerPreview(prm) {
    p.push();
    p.translate(prm.x, prm.y);
    const sectionAngle = 360 / prm.petals;
    const previewAlpha = 18;
    const scaleBreath = 1 + p.sin(prm.t) * prm.breathAmp * 0.6;
    p.scale(scaleBreath);
    drawFlowerLayers(prm, sectionAngle, previewAlpha);
    drawCore(prm, 24);
    p.pop();
  }

  // 已定型花
  class Flower {
    constructor(prm) { this.p = prm; }
    update() {
      const d = this.p;
      if (d.driftMode === 'breeze') {
        d.x += d.vx + p.sin(d.t * 2) * 0.08;
        d.y += d.vy + p.cos(d.t * 2) * 0.06;
      } else {
        d.x += d.vx * 0.9;
        d.y += d.vy * 0.9;
      }
      d.angle += d.va;
      d.t += 0.01;
      if (d.x < 20 || d.x > p.width - 20) d.vx *= -1;
      if (d.y < 20 || d.y > p.height - 20) d.vy *= -1;
    }
    render() {
      const d = this.p;
      p.push();
      p.translate(d.x, d.y);
      const sectionAngle = 360 / d.petals;
      const scaleBreath = 1 + p.sin(d.t) * d.breathAmp;
      p.scale(scaleBreath);
      p.rotate(d.angle);
      drawFlowerLayers(d, sectionAngle, 36);
      drawCore(d, 40);
      p.pop();
    }
  }

  function drawFlowerLayers(d, sectionAngle, alphaBase) {
    drawPetalRing(0, 0, d.dir, d, sectionAngle, 1.0, alphaBase);
    if (d.layerCount > 1) {
      p.push();
      p.rotate(sectionAngle / 2);
      drawPetalRing(0, 0, d.dir, d, sectionAngle, 0.72, alphaBase - 4);
      p.pop();
    }
  }

  function drawPetalRing(cx, cy, dirDeg, d, sectionAngle, scaleFactor, alphaBase) {
    for (let i = 0; i < d.petals; i++) {
      p.push();
      p.rotate(i * sectionAngle);
      drawPetalShape(cx, cy, dirDeg, d.petalLen * scaleFactor, d.petalWid * scaleFactor,
        d.hue, d.sat, d.bri, d.gradSteps, d.hueJitter, d.petalShape, alphaBase);
      p.push(); p.scale(1, -1);
      drawPetalShape(cx, cy, -dirDeg, d.petalLen * scaleFactor, d.petalWid * scaleFactor,
        d.hue, d.sat, d.bri, d.gradSteps, d.hueJitter, d.petalShape, alphaBase);
      p.pop();
      p.pop();
    }
  }

  function drawCore(d, alpha) {
    p.noStroke();
    if (d.coreStyle === 'ring') {
      p.stroke((d.hue + 12) % 360, d.sat * 0.5, 100, alpha);
      p.strokeWeight(1.5);
      p.noFill();
      p.circle(0, 0, p.max(10, d.petalWid * 0.95));
      p.noStroke();
    } else {
      p.fill((d.hue + 12) % 360, d.sat * 0.6, 100, alpha);
      p.circle(0, 0, p.max(10, d.petalWid * 0.9));
    }
  }

  function drawPetalShape(px, py, dirDeg, len, wid, h, s, b, gradSteps, hueJitter, shape, alphaBase) {
    p.push();
    p.translate(px, py);
    p.rotate(dirDeg);
    const edgeHue = (h + 18) % 360;
    p.noStroke();
    for (let i = gradSteps; i >= 1; i--) {
      const inter = i / gradSteps;
      const currHue = p.lerp(h, edgeHue, inter) + p.random(-hueJitter, hueJitter);
      const currS   = s * 0.9;
      const currB   = b - inter * 2;
      p.fill(currHue, currS, currB, alphaBase + inter * 6);
      if (shape === 'oval') {
        p.ellipse(0, 0, len * inter, wid * inter);
      } else {
        const tipX =  (len * 0.5) * inter;
        const baseX = -(len * 0.2) * inter;
        const halfW =  (wid * 0.5) * inter;
        p.beginShape();
        p.vertex(tipX, 0);
        p.vertex(baseX, -halfW);
        p.vertex(baseX,  halfW);
        p.endShape(p.CLOSE);
      }
    }
    p.fill((h + 30) % 360, s * 0.5, 100, alphaBase * 0.45);
    p.ellipse(len * 0.15, -wid * 0.15, len * 0.45, wid * 0.35);
    p.pop();
  }

  function mouseInCanvas() {
    return p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;
  }

  p.keyPressed = function () {
    if (p.key === 'c' || p.key === 'C') {
      flowers = [];
      p.background(255);
    }
  };

  function drawHUD() {
    p.push();
    p.textSize(12); p.textFont('system-ui');
    p.noStroke(); p.fill(0, 0, 0, 60);
    p.text('Page A · Hold and drag a flower. Press C to clear.', p.width - 260, p.height - 20);
    p.pop();
  }

  p.windowResized = function () {
    // A 使用固定 720×400
  };
};

window.p5A = new p5(sA, 'sketchA');
