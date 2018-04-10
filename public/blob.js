// Object file for creating client blobs

//Constructor function for the blob
function Blob(id, x, y, radius, red, green, blue, seg) {
  this.id = id;
  this.pos = createVector(x, y);
  this.r = radius;
  this.vel = createVector(0,0);
  this.s = seg;
  this.red = red;
  this.green = green;
  this.blue = blue;  
  
  // Update position
  this.update = function() {
    let newvel = createVector(mouseX-width/2, mouseY-height/2);
    newvel.setMag(500 * 1 / this.r);
    this.vel.lerp(newvel, 0.2);
    this.pos.add(this.vel);
  }

  // Check if blob is interacting with others
  this.touch = function(pos, r) {
    if (r === 0 || this.r === 0) {
      return false;
    }
    let d = p5.Vector.dist(this.pos, pos);
    if (d < this.r + r) {
      return true;
    }
    return false;
  }
  
  // If blob eats a pellet or another blob
  this.eats = function(pos, r) {
    let d = p5.Vector.dist(this.pos, pos);
    if (d < this.r + r) {
      let sum = PI * this.r * this.r + PI * r * r;
      this.r = sqrt(sum / PI);
    }
  }

  // When blob splits
  this.split = function() {
    let area = (PI * this.r * this.r) / 2;
    this.r = sqrt(area/PI);
  }

  // If blob is a segment of bigger blob
  this.segment = function(other) {
    if (this.s>0) {
      if (other.pos.x > this.pos.x){
        this.pos.x+=this.s;
      }
      else {
        this.pos.x-=this.s;
      }
      if (other.pos.y>this.pos.y){
        this.pos.y+=this.s;
      }
      else {
        this.pos.y-=this.s;
      }
    }
  }

  // Combining blobs
  this.merge = function(other) {
    let diffX = abs(this.pos.x - other.pos.x);
    let diffY = abs(this.pos.y - other.pos.y);
    if (diffX < this.r || diffX < other.r ){
      if (diffY < this.r || diffY < other.r){
        return true;
      }
    }
    return false;
  }
  
  // Drawing the blob
  this.show = function() {
    fill(this.red, this.green, this.blue, 255);
    ellipse(this.pos.x, this.pos.y, this.r*2, this.r*2);
    if (this.r>16){
      fill(0);
      textAlign(CENTER);
      textSize(map(this.r, 0, 32, 0, 32));
      text(floor(this.r), this.pos.x, this.pos.y+this.r/2-4);
    }
  }

  // Creating boundary for blob
  this.constrain = function() {
    this.pos.x = constrain(this.pos.x, -4000, 4000);
    this.pos.y = constrain(this.pos.y, -4000 ,4000);
  }

}
