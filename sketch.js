let blob = []; // Array to store information about user
let blobs = []; //Array which info about other players

let pellet = []
let pellets = []; // Array which stores pellet information

let zoom = 1;

let socket; // Socket variable

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);

  socket = io.connect('http://localhost:3000');

  let r = random(255);
  let g = random(255);
  let b = random(255);
  let x = random(4000, 4000);
  let y = random(4000, 4000);
  blob[0] = new Blob(socket.id, x, y, 60, r, g, b, 0); // Initialize user blob

  // Loop  to create pellets
  if (pellets.length < 2000){
    for (let i = 0; i < 2000; i++){
      let x = random(-4000, 4000);
      let y = random(-4000, 4000);
      r = random(255);
      g = random(255);
      b = random(255);
      pellet = new Pellet(x, y, r, g, b); 

    // Send pellet data to server
  
      let data = {
        id: pellet.length-1,
        x: pellet.pos.x,
        y: pellet.pos.y,
        r: pellet.r,
        red: pellet.red,
        green: pellet.green,
        blue: pellet.blue
      }
    
      socket.emit('pellet', data);
    } 
  }
  
  // Make an object to send user info
  let data = {
    frag: false,
    x: blob[0].pos.x,
    y: blob[0].pos.y,
    r: blob[0].r,
    red: blob[0].red,
    green: blob[0].green,
    blue: blob[0].blue
    };

  socket.emit('start', data);

  // Update information about other clients
  socket.on('heartbeat',
    function(data) {
      blobs = data.b;
      pellets = data.p;
    }
  );
}


// Function for splitting into multiple pieces if spacebar is pressed
function keyPressed(){
  if (keyCode===32 && blob.length < 4){ //MAX 4 PIECES
    for (let i = blob.length - 1; i >= 0; i--){
      // Minimum radius to split      
      if (blob[i].r > 64){
        blob[i].split();

        distX = mouseX - width / 2;
        distY = mouseY - height / 2;
        
        if (abs(distX) < blob[0].r + 50){
          
          if (distX > 0){
            distX = distX + 2 * blob[0].r;
          }
          else {
            distX = distX - 2 * blob[0].r;
          }

        }

        if (abs(distY) < blob[0].r){
          
          if (distY > 0){
            distY = distY + 2 * blob[0].r;
          }
          else {
            distY = distY - 2 * blob[0].r;
          }

        }

        blob[blob.length] = new Blob(socket.id, blob[i].pos.x + distX,blob[i].pos.y + distY, blob[i].r,
          blob[i].red, blob[i].green, blob[i].blue, 0.8); 
        
          let data = {
          frag: true,
          x: blob[0].pos.x,
          y: blob[0].pos.y,
          r: blob[0].r,
          red: blob[0].red,
          green: blob[0].green,
          blue: blob[0].blue
        }      
        socket.emit('start', data);
        
        if (blob.length >= 4){
          break;
        }
      }
    }
  }
}

function draw() {
  if (blob.length >= 1 && blob[0].r > 0){
    background(0);
    //Translate to the center of the screen
    translate(width/2, height/2);
    
    // Adjusting zoom and setting center accordingly
    let totalr = 0;
    let avgposX = 0;
    let avgposY = 0;
    for (let i = blob.length-1; i >=0; i--){
      totalr = totalr + blob[i].r;
      avgposX = avgposX + blob[i].pos.x;
      avgposY = avgposY + blob[i].pos.y;
    }
    
    let newzoom = 64 / totalr;
    
    zoom = lerp(zoom, newzoom, 0.1);
    scale(zoom);
    
    avgposX = avgposX / blob.length;
    avgposY = avgposY / blob.length;
    translate(-avgposX, -avgposY);
    
    // Draw pellets for user to see
   for (let i = pellets.length -1; i >= 0; i--) {
      fill(pellets[i].red, pellets[i].green, pellets[i].blue);
      ellipse(pellets[i].x, pellets[i].y, pellets[i].r * 2, pellets[i].r * 2);
    }

    // If user eats a pellet
    for (let i = blob.length - 1; i >= 0; i--) {
        for (let j = pellets.length - 1; j>= 0; j--){
          pos = createVector(pellets[j].x, pellets[j].y);
          if (blob[i].touch(pos, pellets[j].r) === true) {
            
            let id = pellets[j].id;
            let eat = {
              id: id,
              x: blob[i].x,
              y: blob[i].y,
              r: blob[i].r
            }

            blob[i].eats(pos, pellets[j].r);
            pellets.splice(j, 1);
            socket.emit('eats', eat);
        
            let x = random(-4 * 1000, 4 * 1000);
            let y = random(-4 * 1000,4 * 1000);
            let radius = random(8, 16);
            let r = random(255);
            let g = random(255);
            let b = random(255);

            let data = {
              id: id,
              x: x,
              y: y,
              r: radius,
              red: r,
              green: g,
              blue: b
            }
            socket.emit('pellet', data);
          }
        }
      }
    
    // Updating and showing user blob  
    let max = 0;
    let index = -1;  
    for (let i = 0; i < blob.length; i++) {
      if (blob[i].r > max) {
        max = blob[i].r;
        index = i;
      }
    }

    blob[index].s = 0;
    
    for (let i = blob.length - 1; i >= 0; i--){
      blob[i].show();
      blob[i].update();
      blob[i].constrain();
      if (blob[i].s === 0 && blob[i].r != max) {
        blob[i].s = 0.8;
      }
    }
    

    for (let i = blob.length - 1; i >= 0; i--) {
      for (let j = blob.length - 1; j >= 0; j--) {
        blob[i].segment(blob[j]);
      }
    }
    
    // Managing the merging and split pieces
    if (blob.length != 1){
      for (let i = blob.length - 1; i >= 0; i--){
        for (let j = blob.length - 1; j >= 0; j--){      
          if (i != j){
            if (blob[i].touch(blob[j].pos, blob[j].r)){
              if (blob[i].r > blob[j].r) {
                blob[j].s = 0.08;
              }
              else {
                blob[i].s = 0.08;
              }
            }
            if (blob[i].merge(blob[j])){
              if (blob[i].r > blob[j].r){
                blob[i].eats(blob[j].pos, blob[j].r);
                blob.splice(j,1);
          
                let data = {
                  index: j
                }
                socket.emit('merge', data);
                break;
              }
              else {
                blob[j].eats(blob[i].pos, blob[i].r);
                blob.splice(i,1);
                let data = {
                  index: i
                }
                socket.emit('merge', data);
                }
                break;
            }
          }
        }
      }
    }

    // If user eats other clients or is eaten by another client
    for (let i = blobs.length - 1; i >= 0; i--) {

      if (blobs[i].length > 0 && blobs[i][0].id !== socket.id) {
        let id1 = blobs[i][0].id;

        for (let j = blobs[i].length - 1; j >= 0; j--) {
          let pos = createVector(blobs[i][j].x, blobs[i][j].y);
          
          for (let k = blob.length - 1; k >= 0; k--) {
            if (blob[k].r > blobs[i][j].r && 
              blob[k].touch(pos, blobs[i][j].r)) {
              
              blob[k].eats(pos, blobs[i][j].r);

              let data = {
                id: socket.id,
                index: k,
                x: blob[k].pos.x,
                y: blob[k].pos.y,
                r: blob[k].r,
                red: blob[k].red,
                green: blob[k].green,
                blue: blob[k].blue
              };
              socket.emit('update', data);
              
              break;
            }

            else if (blob[k].r < blobs[i][j].r && 
              blob[k].touch(pos, blobs[i][j].r)) {
              
              let b = new Blob( id1, blobs[i][j].x, blobs[i][j].y, blobs[i][j].r, blobs[i][j].red, blobs[i][j].green, blobs[i][j].blue, 0);
              
              b.eats(blob[k].pos, blob[k].r);
              
              blob.splice(k, 1);
              
              let data = {
                idAbsorb: id1,
                indexEaten: k,
                indexAbsorb: j
              }
              socket.emit('absorb', data);

              data = {
                id : id1,
                index: j,
                x: b.pos.x,
                y: b.pos.y,
                r: b.r,
                red: b.red,
                green: b.green,
                blue: b.blue
              };
              
              if (blob.length === 0) {
                blob[0] = new Blob(socket.id, 0, 0, 0, 0, 0, 0, 0);
              }
              break;
            }  
          }
        }
      }
    }
    
    // Updating information about other clients and pellets
    socket.on('heartbeat',
      function(data) {
        blobs = data.b;
        pellets = data.p;
      }
    );

    // Showing other user blobs
    for (let i = blobs.length - 1; i >= 0; i--) {
      if (blobs[i].length > 0){
        if (blobs[i][0].id !== socket.id) {
          for (let j = blobs[i].length - 1; j >= 0; j--){
            fill(blobs[i][j].red, blobs[i][j].green, blobs[i][j].blue);
            ellipse(blobs[i][j].x, blobs[i][j].y, blobs[i][j].r * 2, blobs[i][j].r * 2,);
            fill(0);
            textAlign(CENTER);
            textSize(map(blobs[i][j].r, 1, 32, 1, 32));
            text(floor(blobs[i][j].r), blobs[i][j].x, blobs[i][j].y+blobs[i][j].r/2-4);
          }
        }
      }
    }

    // Send user information to server
    for (let i = 0; i < blob.length; i++){
      let data = {
        id: socket.id,
        index: i,
        x: blob[i].pos.x,
        y: blob[i].pos.y,
        r: blob[i].r,
        red: blob[i].red,
        green: blob[i].green,
        blue: blob[i].blue
        };
      socket.emit('update', data);
    }

  }
  // Game Over
  else if (blob.length === 1 &&  blob[0].r === 0) {
    background(255);
    stroke(0);
    textAlign(CENTER);
    textSize(64);
    text("Game Over", width / 2, height / 2);
    setTimeout( 
      function() {
        location.reload();
        } , 5000)
  }
}
