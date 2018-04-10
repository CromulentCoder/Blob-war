let blobs = []; //Keep track of clients 
let pellets = []; //Keep track of pellets

function Pellet (id, x, y, r, red, green, blue){
  this.id = id;
  this.x = x;
  this.y = y;
  this.r = r;
  this.red = red;
  this.green = green;
  this.blue = blue;
}

function Blob(id, x, y, r, red, green, blue) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.r = r;
  this.red = red;
  this.green = green;
  this.blue = blue;
}

// Using express to setup server
let express = require('express');
let app = express();

// Set up the server
let server = app.listen(3000, listen);

// This call back just tells us that the server has started
function listen() {
  let host = server.address().address;
  let port = server.address().port;
  console.log('Server listening at http://' + host + ':' + port);
}

// Routing 
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

// Default view
app.get('/', function(req,res) {
  res.sendfile('password.html');
});

// If password is correct redirect
app.post('/auth', function(req, res) {

  if (req.body.pass === "54321"){

    app.use(express.static('public'));
    res.location('/public');
    res.redirect('index.html');
  }

});


// WebSocket Portion
let io = require('socket.io')(server);

setInterval(heartbeat, 33);//FPS

let data = {
  b : blobs,
  p : pellets
}

function heartbeat() {
  io.sockets.emit('heartbeat', data);
}



// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function(client) {

    console.log("We have a new client: " + client.id);

  // Update pellets
    //Initialize pellets
    client.on('pellet', 
      function(data) {
        if (pellets.length < 2000){
          let pellet = new Pellet(data.id, data.x, data.y, data.r, data.red, data.green, data.blue);
          let index = pellets.map(function(item) {
            return item.id;
          }).indexOf(pellet);
          if (index === -1){
            pellets.push(pellet);
          }

        }
      }
    );
    // Remove pellets on eaten
    client.on('eats',
      function(data) {
        for (let i = pellets.length - 1; i >= 0; i--){
          if (pellets[i].id === data.id){
            pellets.splice(i,1);
            break;
          }
        }
        for (let i = blobs.length -1; i >= 0; i--){
          if (blobs[i].length > 0 && client.id === blobs[i].id){
              blobs[i].x = data.x;
              blobs[i].y = data.y;
              blobs[i].r = data.r;
          }
        } 
      }
    );
  
  // Client information on startup
    client.on('start',
      function(data) {
        if (data.frag){
          let blob = new Blob(client.id, data.x, data.y, data.r,
                              data.red, data.green, data.blue);
          for (let i = 0; i < blobs.length; i++) {
            if (blobs[i].length > 0 && client.id === blobs[i][0].id) {
              blobs[i].push(blob);
            }
          }
        }
        else{
          let blob = new Array();
          blob[0] = new Blob(client.id, data.x, data.y, data.r,
                              data.red, data.green, data.blue);
          blobs.push(blob);
        }
      }
    );
    // Updating client information
    client.on('update',
      function(data) {

        for (let i = 0; i < blobs.length; i++) {
          if (blobs[i].length > 0 && data.id === blobs[i][0].id) {
            for (let j = 0; j < blobs[i].length; j++) {
              if (data.index === j){
                blobs[i][j].x = data.x;
                blobs[i][j].y = data.y;
                blobs[i][j].r = data.r;
                blobs[i][j].red = data.red;
                blobs[i][j].green = data.green;
                blobs[i][j].blue = data.blue;
              }
            }
          }
        }  
      }
    );

    client.on('merge',
      function(data) {
        for (let i = blobs.length - 1; i >= 0; i--) {
          if (blobs[i].length > 0 && client.id === blobs[i][0].id) {
            blobs[i].splice(data.index, 1);
          }
        }
      }
    );

    // Called when one client interacts with another
    client.on('absorb',
      function(data) {
        for (let i = blobs.length - 1; i >= 0; i--) {
          if (client.id === blobs[i][0].id && blobs[i].length > 1) {
            blobs[i].splice(data.indexEaten, 1);
          }
          else if (client.id === blobs[i][0].id && blobs[i].length === 1){
            console.log("Client " + client.id + " has been eaten by " + data.idAbsorb + "[" + data.indexAbsorb + "]" );
            blobs[i].length = 0;
            let blob = new Blob( client.id, 0, 0, 0, 0, 0, 0);
            blobs[i].push(blob);
          }
        }
      }
    );
    
    // When user disconnects
    client.on('disconnect', 
      function() {
        let removeIndex = blobs.map(function(item) {
          return item[0].id;
        }).indexOf(client.id);

        if (removeIndex != -1){
          blobs.splice(removeIndex, 1);
        }

        console.log("Client has disconnected:", client.id); 
        console.log("Remaining Clients:" + blobs.length);
      }
    );
  }
);
