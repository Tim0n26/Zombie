let player;
let zombies = [];
let bloodStains = [];
let trees = [];
let zombieSpawnTime = 300;
let zombieMaxSpeed = 2;
let frame = 0;
let kills = 0;
let paused = false;
let backgroundImg;
let akmImg, glockImg, shotgunImg;
let zombieImg;
let laserActive = true;
let currentWeapon = "akm";
let money = 0;
let showHitboxes = false;
let laserWaight = updateWeaponImage();
let playerAnimations = {};
let isNight = false;
let nightMask;
let level = 0;
let levelKills = 0;
let loading = false;

//Data
let weapons = {
  akm: { speed: 60, size: 1, ammo: 30, maxAmmo: 30, reloadTime: 1000 },
  glock: { speed: 35, size: 2, ammo: 15, maxAmmo: 15, reloadTime: 900 },
  shotgun: {
    speed: 45,
    size: 0.5,
    spread: 5,
    ammo: 8,
    maxAmmo: 8,
    reloadTime: 3500,
  },
};

function preload() {
  if (level === 0) {
    trees = [];
    backgroundImg = loadImage("img/texture/background1.jpg");
    isNight = false;
  } else if (level === 1) {
    trees = [];
    backgroundImg = loadImage("img/texture/background2.jpg");
    generateTrees(2);
    isNight = false;
  } else if (level === 2) {
    trees = [];
    backgroundImg = loadImage("img/texture/background2.jpg");
    generateTrees(4);
    isNight = true;
  }
  zombieGif = loadImage("img/zombie/zombie.gif");
  treeImg = loadImage("img/texture/tree.png");

  playerAnimations.akm = {
    idle: loadImage("img/player/akm/idle.gif"),
    shoot: loadImage("img/player/akm/shoot.gif"),
    reload: loadImage("img/player/akm/reload.gif"),
    run: loadImage("img/player/akm/run.gif"),
  };

  playerAnimations.glock = {
    idle: loadImage("img/player/glock/idle.gif"),
    shoot: loadImage("img/player/glock/shoot.gif"),
    reload: loadImage("img/player/glock/reload.gif"),
    run: loadImage("img/player/glock/run.gif"),
  };

  playerAnimations.shotgun = {
    idle: loadImage("img/player/shotgun/idle.gif"),
    shoot: loadImage("img/player/shotgun/shoot.gif"),
    reload: loadImage("img/player/shotgun/reload.gif"),
    run: loadImage("img/player/shotgun/run.gif"),
  };
}

//Gen
function getRandomBloodImage() {
  const bloodImages = [
    "img/zombie/blood1.png",
    "img/zombie/blood2.png",
    "img/zombie/blood3.png",
  ];
  return bloodImages[Math.floor(Math.random() * bloodImages.length)];
}

function generateTrees(count) {
  for (let i = 0; i < count; i++) {
    trees.push({
      x: random(50, width - 50),
      y: random(50, height - 50),
      img: treeImg,
    });
  }
}
// Start
function setup() {
  createCanvas(1024, 576); //(1200, 700)
  player = new Player();
  nightMask = createGraphics(width, height);
}

//Draw help

function startLoading(){
  loading = true;
  setTimeout(() => {
    loading = false;
  }, 500);
}

function drawLaser() {
  if (laserActive) {
    push();
    stroke(255, 0, 0);
    strokeWeight(1);

    let barrelOffsetX = (30 / 32) * 50 - 50 / 2;
    let barrelOffsetY = (20 / 27) * 50 - 50 / 2;
    let laserStartX =
      player.pos.x +
      barrelOffsetX * cos(player.angle) -
      barrelOffsetY * sin(player.angle);
    let laserStartY =
      player.pos.y +
      barrelOffsetX * sin(player.angle) +
      barrelOffsetY * cos(player.angle);
    let laserEndX = laserStartX + 1000 * cos(player.angle);
    let laserEndY = laserStartY + 1000 * sin(player.angle);
    line(laserStartX, laserStartY, laserEndX, laserEndY);
    pop();
  }
}

function drawZombies() {
  for (let i = zombies.length - 1; i >= 0; i--) {
    zombies[i].draw();
    zombies[i].update();

    if (zombies[i].ateYou()) {
      level = 0;
      startLoading();
      preload();
      restart();
      break;
    }

    if (player.hasShot(zombies[i])) {
      kills++;
      levelKills++;
      money += 10;

      bloodStains.push({
        x: zombies[i].pos.x - 50,
        y: zombies[i].pos.y - 50,
        img: loadImage(getRandomBloodImage()),
      });

      if (bloodStains.length > 20) {
        bloodStains.shift();
      }

      zombies.splice(i, 1);
    }
  }
}

function drawHitboxes() {
  if (showHitboxes) {
    push();
    stroke(0, 255, 0);
    noFill();
    ellipse(player.pos.x, player.pos.y, player.size, player.size);
    for (let zombie of zombies) {
      ellipse(zombie.pos.x, zombie.pos.y, zombie.size, zombie.size);
    }
    pop();
  }
}

function drawNight() {
  if (isNight) {
    nightMask.clear();
    nightMask.fill(0);
    nightMask.rect(0, 0, width, height);

    nightMask.erase();
    nightMask.beginShape();

    let startX = player.pos.x;
    let startY = player.pos.y;
    let angleOffset = radians(12);

    let endX1 = startX + 1500 * cos(player.angle - angleOffset);
    let endY1 = startY + 1500 * sin(player.angle - angleOffset);
    let endX2 = startX + 1500 * cos(player.angle + angleOffset);
    let endY2 = startY + 1500 * sin(player.angle + angleOffset);

    nightMask.vertex(startX, startY);
    nightMask.vertex(endX1, endY1);
    nightMask.vertex(endX2, endY2);
    nightMask.endShape(CLOSE);
    nightMask.noErase();

    image(nightMask, 0, 0);
  }
}

//Draw
function draw() {
  if (loading) {
    background(0);
    fill(255);
    textSize(16);
    textAlign(CENTER, CENTER);
    text("Loading...", width / 2, height / 2);
  }
  else {
  if (!paused) {
    background(backgroundImg);

    for (let stain of bloodStains) {
      image(stain.img, stain.x, stain.y, 100, 100);
    }

    if (frame >= zombieSpawnTime) {
      zombies.push(new Zombie(random(zombieMaxSpeed)));
      zombieSpawnTime *= 0.99;
      frame = 0;
    }
    frame++;

    player.draw();
    player.update();
    drawZombies();
    drawLaser();
    for (let tree of trees) {
      image(tree.img, tree.x, tree.y, 300, 300);
    }

    drawNight();

    drawHitboxes();
  }

  document.getElementById("kills").innerHTML = "Kills: " + kills;
  document.getElementById("money").innerHTML = "Money: $" + money;
  document.getElementById("level").innerHTML = "Level: " + level;
}
}

//Rest

function restart() {
  player = new Player();
  zombies = [];
  bloodStains = [];
  zombieSpawnTime = 300;
  zombieMaxSpeed = 2;
  kills = 0;
  levelKills = 0;
}

//Interface

function updateWeaponImage() {
  let weaponImageElement = document.getElementById("weaponImage");
  let weaponImagePath = "";

  if (currentWeapon === "akm") {
    weaponImagePath = "img/gun/akm.png";
  } else if (currentWeapon === "glock") {
    weaponImagePath = "img/gun/glock.png";
  } else if (currentWeapon === "shotgun") {
    weaponImagePath = "img/gun/shotgun.png";
  }

  weaponImageElement.style.backgroundImage = `url(${weaponImagePath})`;
}
// Controls

function mouseClicked() {
  player.shoot();
}

function keyPressed() {
  if (keyIsDown(49)) {
    weapons[currentWeapon].ammo = player.ammo;
    currentWeapon = "akm";
    player.ammo = weapons[currentWeapon].ammo;
    player.updateWeaponImage();
  } else if (keyIsDown(50)) {
    weapons[currentWeapon].ammo = player.ammo;
    currentWeapon = "glock";
    player.ammo = weapons[currentWeapon].ammo;
    player.updateWeaponImage();
  } else if (keyIsDown(51)) {
    weapons[currentWeapon].ammo = player.ammo;
    currentWeapon = "shotgun";
    player.ammo = weapons[currentWeapon].ammo;
    player.updateWeaponImage();
  } else if (keyIsDown(67)) {
    laserActive = !laserActive;
  } else if (keyIsDown(82)) {
    player.reload();
    } else if (keyIsDown(69)) {
      isNight = !isNight;
  } else if (keyIsDown(74)) {
    restart();
  } else if (keyIsDown(78)) {
    showHitboxes = !showHitboxes;
  } else if (keyCode === ESCAPE) {
    paused = !paused;
  }
  if (levelKills >= 15 && level != 2) {
    levelKills = 0;
    level++;
    if (level > 2) level = 0;
    startLoading();
    preload();
    restart();
  }
}
