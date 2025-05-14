class Bullet {
  constructor(x, y, angle, weapon) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = weapon.speed;
    this.size = weapon.size;
    this.damage = weapon.damage;
  }

  draw() {
    push();
    stroke(255, 255, 0);
    let tailX = this.x - this.speed * cos(this.angle);
    let tailY = this.y - this.speed * sin(this.angle);
    line(tailX, tailY, this.x, this.y);
    pop();
  }
  

  update() {
    this.x += this.speed * cos(this.angle);
    this.y += this.speed * sin(this.angle);
  }
}
