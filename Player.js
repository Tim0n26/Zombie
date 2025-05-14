class Player {
  constructor() {
    this.pos = createVector(width / 2, height / 2);
    this.angle = 0;
    this.bullets = [];
    this.img = akmImg;
    this.autoFireTimer = 0;
    this.reloading = false;
    this.ammo = weapons[currentWeapon].ammo;
    this.currentAnimation = playerAnimations[currentWeapon].idle;
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    imageMode(CENTER);
    image(this.currentAnimation, 0, 0,50*(this.currentAnimation.width/this.currentAnimation.height), 50);
    pop();

    for (let bullet of this.bullets) {
      bullet.update();
      bullet.draw();
    }
  }

  updateAnimation() {
    if (this.reloading) {
      this.currentAnimation = playerAnimations[currentWeapon].reload;
    } else if (mouseIsPressed && !this.reloading) {
      this.currentAnimation = playerAnimations[currentWeapon].shoot;
    } else if (this.moving) {
      this.currentAnimation = playerAnimations[currentWeapon].run;
    } else {
      this.currentAnimation = playerAnimations[currentWeapon].idle;
    }
  }

  updateWeaponImage() {
    let weaponImagePath = "";
  
    if (currentWeapon === "akm") {
      this.img = akmImg;
      weaponImagePath = "img/gun/akm.png";
    } else if (currentWeapon === "glock") {
      this.img = glockImg;
      weaponImagePath = "img/gun/glock.png";
    } else if (currentWeapon === "shotgun") {
      this.img = shotgunImg;
      weaponImagePath = "img/gun/shotgun.png";
    }
    let weaponImageElement = document.getElementById("weaponImage");
    weaponImageElement.style.backgroundImage = `url(${weaponImagePath})`;
  }

  updateAutoFire() {
    if (currentWeapon === "akm" && mouseIsPressed) {
      let fireRate = 1000 / 10;
      if (millis() - this.autoFireTimer >= fireRate) {
        this.shoot();
        this.autoFireTimer = millis();
      }
    }
  }

  update() {
    let xSpeed = 0;
    let ySpeed = 0;
  
    if (keyIsDown(65)) {
      xSpeed = -2;
    }
  
    if (keyIsDown(68)) {
      xSpeed = 2;
    }
  
    if (keyIsDown(87)) {
      ySpeed = -2;
    }
  
    if (keyIsDown(83)) {
      ySpeed = 2;
    }
  
    this.pos.add(xSpeed, ySpeed);
    this.angle = atan2(mouseY - this.pos.y, mouseX - this.pos.x);
    this.updateAnimation();
    this.updateWeaponImage();
    this.updateAutoFire();
    if (this.bullets.length > 200) {
      this.bullets.shift();
    }
  }

  shoot() {
    let weapon = weapons[currentWeapon];

    if (this.reloading) return;
    if (this.ammo <= 0) {
      //console.log("Nead reload");
      return;
    }

    this.updateAnimation();
    this.ammo--;
    //console.log(`Ammo: ${this.ammo}`);

    let barrelOffsetX = (30 / 32) * 50 - 50 / 2;
    let barrelOffsetY = (20 / 27) * 50 - 50 / 2;

    let barrelX = this.pos.x + barrelOffsetX * cos(this.angle) - barrelOffsetY * sin(this.angle);
    let barrelY = this.pos.y + barrelOffsetX * sin(this.angle) + barrelOffsetY * cos(this.angle);

    if (currentWeapon === "shotgun") {
      for (let i = 0; i < weapon.spread; i++) {
        let angleOffset = random(-0.2, 0.2);
        this.bullets.push(new Bullet(barrelX, barrelY, this.angle + angleOffset, weapon));
      }
    } else {
      this.bullets.push(new Bullet(barrelX, barrelY, this.angle, weapon));
    }
  }

  reload() {
    if (this.ammo === weapons[currentWeapon].maxAmmo || this.reloading) return;

    this.reloading = true;
    let laserSwitch = laserActive;
    laserActive = false;
    this.updateAnimation();
    //console.log("Reload");
    
    setTimeout(() => {
      this.ammo = weapons[currentWeapon].maxAmmo;
      this.reloading = false;
      if(laserSwitch === true){
        laserActive = true;
      }
    }, weapons[currentWeapon].reloadTime);
  }

  hasShot(zombie) {
    for (let i = 0; i < this.bullets.length; i++) {
      if (dist(this.bullets[i].x, this.bullets[i].y, zombie.pos.x, zombie.pos.y) < 30) {
        this.bullets.splice(i, 1);
        return true;
      }
    }
    return false;
  }
}
