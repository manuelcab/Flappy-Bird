const ancho_escenario = 1600;
const alto_escenario = 900;
const velocidad_suelo = 5;

let canvas;

let piso;
let pajaro;
let tubos = [];

let caer = false;

let puntos = 0;

let font;
let audio_hit = new Audio("src/audio/audio hit.ogg");
let audio_point = new Audio("src/audio/audio point.ogg");
let audio_wing = {
  0: new Audio("src/audio/audio wing.ogg"),
  1: new Audio("src/audio/audio wing.ogg"),
  2: new Audio("src/audio/audio wing.ogg"),
};
let img_piso;
let img_fondo;
let img_tubo;
let img_pajaro;

function preload() {
  font = loadFont("src/fonts/font.ttf");
  img_piso = loadImage("src/images/img_base.png");
  img_tubo = loadImage("src/images/img_pipe-green.png");
  img_fondo = loadImage("src/images/img_background-day2.png");
  img_pajaro = [
    loadImage("src/images/img_yellowbird-downflap2.png"),
    loadImage("src/images/img_yellowbird-midflap2.png"),
    loadImage("src/images/img_yellowbird-upflap2.png"),
  ];
}

function setup() {
  canvas = createCanvas(ancho_escenario, alto_escenario);
  textFont(font);
  textSize(40);
  textAlign(CENTER, CENTER);
  strokeWeight(10);
  windowResized();
  piso = new Piso();
  pajaro = new Pajaro();
  img_fondo.resize(
    img_fondo.width * alto_escenario / img_fondo.height,
    alto_escenario
  );
}

let contadorFotogramas = 0;

function draw() {
  for (let i = 0; i < 4; i++) {
    image(img_fondo, img_fondo.width * i, 0);
  }
  for (const tubo of tubos) {
    tubo.dibujar();
  }
  piso.dibujar();
  pajaro.dibujar();
  if (contadorFotogramas * velocidad_suelo % 400 == 0) {
    tubos.push(new Tubo());
  }
  if (caer) {
    contadorFotogramas++;
  }
  if (tubos[puntos] && tubos[puntos].x - pajaro.pos.x < 0) {
    puntos++;
    audio_point.play();
  }
  stroke("black");
  fill("white");
  text(puntos, width / 2, 40);
}

function windowResized() {
  if (width < windowWidth) {
    return;
  }
  let escala = windowWidth / width;
  canvas.style("width", `${width * escala}px`);
  canvas.style("height", `${height * escala}px`);
}

function keyPressed() {
  clic();
}

function mouseReleased() {
  clic();
}

let contador_clics = 0;

function clic() {
  if (caer) {
    pajaro.aceleracion.set(createVector(0, -5));
    audio_wing[contador_clics++ % 3].play();
  } else {
    pajaro.resetearVariables();
    caer = true;
    contadorFotogramas = 0;
    puntos = 0;
    tubos = [];
  }
}

function perder() {
  if (caer) {
    audio_hit.play();
  }
  caer = false;

    fill("white",);
    textSize(60);
    text("GAME OVER", width / 2, height / 2 - 50);
}

function Tubo() {
  const distancia_entre_tubos = 150;

  this.w = 100;
  this.h = 600;
  this.x = width;
  let aleatoriedad = 300 * Math.random() - 150;
  this.y = height / 2 + aleatoriedad;
  this.y2 = this.y - this.h - distancia_entre_tubos;
  img_tubo.resize(this.w, img_tubo.height * this.w / img_tubo.width);
  this.dibujar = function () {
    fill("green");

    image(img_tubo, this.x, this.y);

    push();
    translate(this.x, this.y - distancia_entre_tubos);
    scale(1, -1);
    image(img_tubo, 0, 0);
    pop();

    if (caer) {
      this.x -= velocidad_suelo;
    }
  };
  this.areaColision = function () {
    return [
      new Rectangle(this.x, this.y, this.w, this.h),
      new Rectangle(this.x, this.y2, this.w, this.h),
    ];
  };
}

function Pajaro() {
  this.r = 60;
  this.resetearVariables = function () {
    this.pos = createVector(width / 2, height / 2);
    this.aceleracion = createVector(0, 0);
  };
  this.resetearVariables();
  for (const img of img_pajaro) {
    img.resize(this.r, img.height * this.r / img.width);
  }
  this.dibujar = function () {
    {
      push();
      translate(this.pos.x, this.pos.y);
      rotate(this.aceleracion.copy().add(5, 0).heading());
      let i = Math.floor(contadorFotogramas / velocidad_suelo) % img_pajaro.length;
      let img = img_pajaro[i];
      image(img, -img.width / 2, -img.height / 2);
      pop();
    }
    if (caer) {
      this.aceleracion.add(createVector(0, 0.2));
      this.pos.add(this.aceleracion);
    }
    if (this.areaColision().collideRect(piso.areaColision())) {
      perder();
    }
    for (const tubo of tubos) {
      let colisiones = tubo.areaColision();
      for (const c of colisiones) {
        if (this.areaColision().collideRect(c)) {
          perder();
        }
      }
    }
  };
  this.areaColision = function () {
    return new Circle(this.pos.x, this.pos.y, this.r - 15);
  };
}

function Piso() {
  this.w = ancho_escenario;
  this.h = 140;
  this.x = 0;
  this.y = alto_escenario - this.h;
  this.desface = 0;
  img_piso.resize(img_piso.width * img_piso.height / this.h, this.h);
  this.dibujar = function () {
    if (caer) {
      this.desface -= velocidad_suelo;
    }
    if (-this.desface >= img_piso.width) {
      this.desface = 0;
    }
    for (let i = 0; i < (this.w / img_piso.width) + 1; i++) {
      image(
        img_piso,
        this.x + img_piso.width * i + this.desface,
        this.y
      );
    }
  };
  this.areaColision = function () {
    return new Rectangle(this.x, this.y, this.w, this.h);
  };
}