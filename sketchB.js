// ===== Page B: Mic Rain → Ripple → Flower (Instance Mode) =====
const sB = (p) => {
  let mic;
  let raindrops = [];
  let ripples = [];
  let flowers = [];

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    mic = new p5.AudioIn();
    mic.start();
    p.frameRate(60);
    p.colorMode(p.HSB, 360, 255, 255, 255);
  };

  p.draw = function () {
    p.background('#FFFFFF');

    // —— 声音部分保持原样 —— //
    let volume = mic.getLevel();
    let threshold = 0.1;

    if (volume > threshold) {
      let raindrop = new RainDrop(p.random(p.width), 0, p.random(10, 15));
      raindrops.push(raindrop);
    }

    // 地面线（极淡）
    p.push();
    p.stroke(210, 10, 160, 25);
    p.strokeWeight(1);
    p.line(0, p.height - 100, p.width, p.height - 100);
    p.pop();

    // 雨滴
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

    // 水波
    for (let i = ripples.length - 1; i >= 0; i--) {
      ripples[i].update();
      ripples[i].show();
      if (ripples[i].isFinished()) {
        let stemHeight = p.random(100, 300);
        flowers.push(new Flower(ripples[i].x, p.height - 100, stemHeight));
        ripples.splice(i, 1);
      }
    }

    // 花朵
    for (let i = 0; i < flowers.length; i++) {
      flowers[i].grow();
      flowers[i].display();
    }

    // HUD
    p.push();
    p.fill(0,0,0,60); p.noStroke(); p.textSize(12);
    p.text('Page B · Speaking into a microphone will cause rain and flowers to bloom.', 16, 24);
    p.pop();
  };

  // —— Classes （全部用 p. 前缀）——
  class RainDrop{
    constructor(x,y,size){
      this.x = x;
      this.y = y;
      this.size = size;
      this.speed = p.random(8,12);
    }
    update(){ this.y += this.speed; }
    show(){
      p.push(); p.translate(this.x, this.y); p.noStroke();
      p.fill(200, 60, 245, 40);  p.ellipse(0, 0, this.size * 0.9, this.size * 1.2);
      p.fill(200, 70, 255, 70);  p.ellipse(0, -this.size*0.05, this.size * 0.8, this.size * 1.1);
      p.fill(200, 20, 255, 60);  p.ellipse(this.size*0.15, -this.size*0.25, this.size*0.18, this.size*0.28);
      p.pop();
    }
    hitsGround(){ return this.y >= p.height - 100; }
    offScreen(){ return this.y > p.height; }
  }

  class Ripple{
    constructor(x,y){
      this.x = x; this.y = y;
      this.radius = 0; this.maxRadius = 20;
      this.alpha = 200;
    }
    update(){ this.radius += 2; this.alpha -= 4; }
    show(){
      p.noFill();
      p.stroke(210, 30, 230, p.map(this.alpha, 0, 200, 0, 60));
      p.strokeWeight(1.5);
      p.ellipse(this.x, this.y, this.radius*2, this.radius / 1.6);
      p.stroke(210, 20, 250, p.map(this.alpha, 0, 200, 0, 35));
      p.strokeWeight(1);
      p.ellipse(this.x, this.y, this.radius*2.6, (this.radius*1.6)/1.6);
    }
    isFinished(){ return this.alpha <= 0; }
  }

  class Flower{
    constructor(x,y,stemHeight){
      this.position = p.createVector(x,y);
      this.stemHeight = stemHeight;
      this.stemGrowth = 0;
      this.stemGrowthRate = p.random(2,5);
      this.bloomed = false;
      this.numPetals = p.int(p.random(14,20));
      this.petalGrowth = 0;
      this.maxPetalGrowth = p.random(15,25);

      const palettes = [
        {hIn: 330, hOut: 300}, {hIn: 300, hOut: 270},
        {hIn: 220, hOut: 200}, {hIn: 150, hOut: 130}, {hIn: 55, hOut: 45},
      ];
      const pal = p.random(palettes);
      this.hIn  = pal.hIn  + p.random(-6, 6);
      this.hOut = pal.hOut + p.random(-6, 6);
      this.sat  = 135; this.bri = 250; this.baseAlpha = 40;

      this.centerColor = p.color((this.hIn + 15) % 360, this.sat * 0.7, 255, 80);
      this.hasSecondLayer = p.random() < 0.45;
      this.spin = p.random(-0.01, 0.01);
      this.angle = p.random(p.TWO_PI);
    }
    grow(){
      if(!this.bloomed){
        this.stemGrowth += this.stemGrowthRate;
        if (this.stemGrowth >= this.stemHeight) this.bloomed = true;
      } else {
        if(this.petalGrowth < this.maxPetalGrowth){ this.petalGrowth += 1; }
        this.angle += this.spin;
      }
    }
    display(){
      p.push();
      p.translate(this.position.x,this.position.y);
      p.stroke(140, 80, 100, 120); p.strokeWeight(2);
      p.line(0,0,0,-this.stemGrowth);

      if(this.bloomed){
        p.translate(0,-this.stemGrowth); p.noStroke(); p.rotate(this.angle);
        this.drawPetalRing(this.numPetals, this.petalGrowth, this.hIn, this.hOut, this.sat, this.bri, this.baseAlpha);
        if (this.hasSecondLayer){
          p.push(); p.rotate(p.PI / this.numPetals);
          this.drawPetalRing(this.numPetals, this.petalGrowth * 0.78, this.hIn, this.hOut, this.sat, this.bri, this.baseAlpha - 10);
          p.pop();
        }
        p.fill(this.centerColor);
        p.ellipse(0,0,this.maxPetalGrowth * 0.6, this.maxPetalGrowth * 0.6);
      }
      p.pop();
    }
    drawPetalRing(count, size, hIn, hOut, s, b, aBase){
      const gradSteps = 3;
      for (let i = 0; i < count; i++){
        let a = p.map(i, 0, count, 0, p.TWO_PI);
        p.push(); p.rotate(a);
        for (let g = gradSteps; g >= 1; g--){
          let t = g / gradSteps;
          let h = p.lerp(hIn, hOut, t) + p.random(-4, 4);
          p.fill(h, s * 0.9, b - t*4, aBase + t*8);
          p.ellipse(0, size * 0.45, size * 0.32 * t, size * 1.15 * t);
        }
        p.fill((hIn + 28) % 360, s * 0.6, 255, aBase * 0.6);
        p.ellipse(size * 0.12, -size * 0.12, size * 0.36, size * 0.26);
        p.pop();
      }
    }
  }

  p.windowResized = function () { p.resizeCanvas(p.windowWidth, p.windowHeight); };
};

window.p5B = new p5(sB, 'sketchB');
