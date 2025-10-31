const sA = (p) => {
  let symmetry = 6;
  let angle = 360 / symmetry;

  p.setup = function () {
    p.createCanvas(p.windowWidth * 0.9, p.windowHeight * 0.8);
    p.windowResized = function () {
      p.resizeCanvas(p.windowWidth * 0.9, p.windowHeight * 0.8);
    };
    p.angleMode(p.DEGREES);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.background(255); // 白底，如想透明换成 p.clear()
  };

  p.draw = function () {
    p.translate(p.width / 2, p.height / 2);
    if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
      let x = p.mouseX - p.width / 2;
      let y = p.mouseY - p.height / 2;
      let px = p.pmouseX - p.width / 2;
      let py = p.pmouseY - p.height / 2;

      if (p.mouseIsPressed === true) {
        let speed = p.dist(x, y, px, py);
        let r = p.dist(0, 0, x, y);

        let petalLen = p.constrain(p.map(speed, 0, 40, 12, 40), 10, 46);
        let petalWid = p.constrain(p.map(r, 0, p.width / 2, 8, 20), 8, 22);

        let baseHue = p.map(r, 0, p.width / 2, 340, 220) + p.random(-4, 4);
        let s = p.constrain(p.map(speed, 0, 40, 25, 55), 25, 55);
        let b = 98;
        let dirDeg = p.degrees(p.atan2(y, x));

        for (let i = 0; i < symmetry; i++) {
          p.push();
          p.rotate(i * angle);
          drawPetal(x, y, dirDeg, petalLen, petalWid, baseHue, s, b);
          p.push();
          p.scale(1, -1);
          drawPetal(x, -y, -dirDeg, petalLen, petalWid, baseHue, s, b);
          p.pop();
          p.pop();
        }
      }
    }
  };

  function drawPetal(px, py, dirDeg, len, wid, h, s, b) {
    p.push();
    p.translate(px, py);
    p.rotate(dirDeg);

    let edgeHue = (h + 20) % 360;
    let gradSteps = 3;
    p.noStroke();

    for (let i = gradSteps; i >= 1; i--) {
      let inter = i / gradSteps;
      let currHue = p.lerp(h, edgeHue, inter);
      let currS = s * 0.9;
      let currB = b - inter * 2;
      p.fill(currHue, currS, currB, 35 + inter * 8);
      p.ellipse(0, 0, len * inter, wid * inter);
    }
    p.fill((h + 30) % 360, s * 0.5, 100, 25);
    p.ellipse(len * 0.15, -wid * 0.15, len * 0.45, wid * 0.35);

    p.pop();
  }

  p.keyPressed = function () {
    if (p.key === 'c' || p.key === 'C') {
      p.push();
      p.resetMatrix();
      p.background(255);
      p.pop();
    }
  };
};

window.p5A = new p5(sA, 'sketchA');
