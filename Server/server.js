const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  // cors
  cors: "http://localhost:5173/",
});

const allUsers = {};
const allRooms = [];

io.on("connection", (socket) => {
  console.log("New user joined with " + socket.id);

  // By default all the players status will be online
  allUsers[socket.id] = {
    socket: socket,
    online: true,
  };

  socket.on("request_to_play", (data) => {
    const currentUser = allUsers[socket.id];
    // Setting the current player name
    currentUser.playerName = data.playerName;
    console.log("currentPlayer" + currentUser);

    let opponentPlayer;

    for (const key in allUsers) {
      const user = allUsers[key];

      // Setting the opponent player
      if (user.online && !user.playing && socket.id !== key) {
        opponentPlayer = user;
        break;
      }
    }

    console.log(opponentPlayer);

    if (opponentPlayer) {
      allRooms.push({
        player1: opponentPlayer,
        player2: currentUser,
      });

      console.log("Opponent Found");

      currentUser.socket.emit("OpponentFound", {
        opponentName: opponentPlayer.playerName,
        playingAs: "circle",
      });

      opponentPlayer.socket.emit("OpponentFound", {
        opponentName: currentUser.playerName,
        playingAs: "cross",
      });

      currentUser.socket.on("playerMoveFromClient", (data) => {
        opponentPlayer.socket.emit("playerMoveFromServer", {
          // gameState: data.gameState,
          ...data,
        });
      });

      opponentPlayer.socket.on("playerMoveFromClient", (data) => {
        currentUser.socket.emit("playerMoveFromServer", {
          // gameState: data.gameState,
          ...data,
        });
      });
    } else {
      console.log("Opponent not Found");
      currentUser.socket.emit("OpponentNotFound");
    }
  });

  socket.on("disconnnect", function () {
    const currentUser = allUsers[socket.id];
    currentUser.online = false;
    currentUser.playing = false;

    for (let index = 0; index < allRooms.length; index++) {
      const { player1, player2 } = allRooms[index];

      if (player1.socket.id === socket.id) {
        player2.socket.emit("opponentLeftMatch");
        break;
      }
      if (player2.socket.id === socket.id) {
        player1.socket.emit("opponentLeftMatch");
        break;
      }
    }
  });
});

httpServer.listen(3000);
