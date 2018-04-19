<h1 align = "center">Blob-Wars</h1>

This is a browser based game developed using javascript. It is a clone of the famous game agar.io in which you start of as a small blob and the aim of the game is to eat 'food' around you to get bigger. You can also eat other players smaller than you to grow bigger in size. When you get eaten a 'Game Over' screen is displayed after restarting you again as a small blob.

# Getting Started

- For running this project you need to install node.js and the following dependencies using npm:
  1. Express:<br>```npm -install express```
  2. Web Sockets:<br>```npm -install socket.io```

- After downloading the above files, open up the terminal and navigate to the directory your files are saved in:<br>```cd File_Path```

- Then run the server file _server.js_ using the command:<br>```node server.js```

- If all is well a message should pop up in the terminal saying what port the server (by dfeault 3000) is running on. Next just type in ```localhost:3000``` in the browser if you are running the server else the IP address of the of the server and the port number ```IP:PORT``` and enjoy.

# Built With

- Node.js - Javascript framework for server side scripting
- Express - Setting up the server
- Socket.io - Used to establish connections between clients and server
- P5.js - Client side javascript library used for drawing and animating the game

# How To Play

Simply control the blob with your mouse and press space to split into smaller pieces.

# Functionalities 

- Supports realtime multi-player gaming using web sockets.
- Password secured lobby.
- Movement using the mouse direction.
- Grows in size on eating pellets of food and other players smaller than oneself.
- Velocity dependent on the size. Bigger you are the slower you get.
- Split into multiple pieces on pressing space which merge into a single piece after some time. 
> Tip: This can be used to move faster as you accumulate more mass overtime making you slower. It also helps in eating smaller players by splitting towards them.
- 'Game Over' mechanism where you lose if you are eaten by another player. This has a built in auto refresh function so you restart after 5 seconds of dying.

# How To Play Multiplayer 

After you are bored of playing by yourself in the localhost, you can invite your friends to play with you. For this simply go into _sketch.js_ located in the public folder and change the line of code ```socket = io.connect('http://localhost:3000');``` with ```socket = io.connect('http://{IP ADDRESS OF THE MACHINE RUNNING THE server.js FILE}:3000');```

# License
This project is licensed under the MIT License - see the LICENSE.md file for details

# Acknowledgments
Inspiration from @CodingTrain 's coding challenge video on youtube where he makes the basic layout of this game. Check him out here for his awesome videos: https://www.youtube.com/user/shiffman

