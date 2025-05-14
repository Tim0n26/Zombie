class Zombie {
  constructor(speed) {
    this.speed = speed;
    this.size = 60;
    let y;
    if (random(1) < 0.5) {
      y = random(-300, 0);
    } else {
      y = random(height, height + 300);
    }

    let x = random(-300, width + 300);
    this.pos = createVector(x, y);
  }

  draw() {
    angleMode(degrees);
    rectMode(CENTER);
    push();
    translate(this.pos.x, this.pos.y);
    this.angle = atan2(player.pos.y - this.pos.y, player.pos.x - this.pos.x);
    rotate(this.angle);
    imageMode(CENTER);
    image(zombieGif, 0, 0, this.size, this.size);
    pop();
  }
  

  update() {
    let difference = p5.Vector.sub(player.pos, this.pos);
    difference.limit(this.speed);
    this.pos.add(difference);
  }

  ateYou() {
    return dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y) < this.size / 2 + 20;
  }
}
