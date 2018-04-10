  // Object file for creating pellets

  function Pellet(x, y, red, green, blue) {
    this.pos = createVector(x, y);
    this.r = random(8,10);
    this.red = red;
    this.green = green;
    this.blue = blue;

    this.show = function() {
      fill(this.red, this.green, this.blue);
      ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
    }
  }



