const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  // cors
  cors: "http://localhost:5173/",
});

const allUsers = [];

io.on("connection", (socket) => {
  console.log("New user joined with " + socket.id);

  // By default all the players status will be online
  allUsers[socket.id] = {
    socket: socket,
    online: true,
  };

  socket.on("disconnnect", function () {
    const currentUser = allUsers[socket.id];
    currentUser.online = false;
  });

  socket.on("request_to_play", (data) => {
    const currentUser = allUsers[socket.id];
    currentUser.playerName = data.playerName;
    console.log(currentUser);

    let opponentPlayer;

    for (const key in allUsers) {
      const user = allUsers[key];

      if (user.online && !user.playing && socket.id !== key) {
        opponentPlayer = user;
        break;
      }
    }

    console.log(opponentPlayer);

    if (opponentPlayer) {
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
});

httpServer.listen(3000);
