import React, { useEffect, useState } from "react";
import "./App.css";
import Square from "./components/Square/Square";
import { io } from "socket.io-client";
import Swal from "sweetalert2";

const renderFrom = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

const App = () => {
  const [gameState, setGameState] = useState(renderFrom);
  const [currentPlayer, setCurrentPlayer] = useState("circle");
  const [finishedState, setFinishedState] = useState(false);
  const [finishedArrayState, setFinishedArrayState] = useState([]);

  const [playOnline, setPlayOnline] = useState(false);

  const [socket, setSocket] = useState(null);

  const [playerName, setPlayerName] = useState("");

  const [opponentName, setOpponentName] = useState("");

  const [playingAs, setPlayingAs] = useState(null);

  const checkWinner = () => {
    // row dynamic
    for (let row = 0; row < gameState.length; row++) {
      if (
        gameState[row][0] === gameState[row][1] &&
        gameState[row][1] === gameState[row][2]
      ) {
        setFinishedArrayState([row * 3 + 0, row * 3 + 1, row * 3 + 2]);
        return gameState[row][0];
      }
    }

    // column dyanmic
    for (let col = 0; col < gameState.length; col++) {
      if (
        gameState[0][col] === gameState[1][col] &&
        gameState[1][col] === gameState[2][col]
      ) {
        setFinishedArrayState([0 * 3 + col, 1 * 3 + col, 2 * 3 + col]);
        return gameState[0][col];
      }
    }

    // diagonal move
    if (
      gameState[0][0] === gameState[1][1] &&
      gameState[1][1] === gameState[2][2]
    ) {
      return gameState[0][0];
    }

    if (
      gameState[0][2] === gameState[1][1] &&
      gameState[1][1] === gameState[2][0]
    ) {
      return gameState[0][2];
    }

    const isDrawMatch = gameState.flat().every((e) => {
      if (e === "circle" || e === "cross") {
        return true;
      }
    });

    if (isDrawMatch) return "draw";

    return null;
  };

  useEffect(() => {
    console.log(gameState);
    const winner = checkWinner();

    if (winner) {
      setFinishedState(winner);
    }
  }, [gameState]);

  // Websocket / Socket.io code

  socket?.on("connect", function () {
    setPlayOnline(true);
  });

  socket?.on("OpponentNotFound", () => {
    setOpponentName(false);
  });

  socket?.on("OpponentFound", (data) => {
    setOpponentName(data.opponentName);

    setPlayingAs(data.playingAs);
  });

  socket?.on("playerMoveFromServer", (data) => {
    // setGameState(data.gameState);
    const id = data.state.id;
    setGameState((prevState) => {
      let newState = [...prevState];
      const rowIndex = Math.floor(id / 3);
      const colIndex = id % 3;
      newState[rowIndex][colIndex] = data.state.sign;
      return newState;
    });
    setCurrentPlayer(data.state.sign === "circle" ? "cross" : "circle");
  });

  socket?.on("opponentLeftMatch", () => {
    setFinishedState("opponent left the match");
  });

  const playOnlineClick = async () => {
    const result = await takePlayerName();

    if (!result.isConfirmed) {
      return;
    }
    const username = result.value;
    setPlayerName(username);

    const newSocket = io("http://localhost:3000", {
      autoConnect: true,
    });

    newSocket?.emit("request_to_play", {
      playerName: username,
    });

    setSocket(newSocket);
  };

  const takePlayerName = async () => {
    const result = await Swal.fire({
      title: "Enter your name",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });
    return result;
  };

  if (!playOnline) {
    return (
      <div className="main-div">
        <button className="play-online" onClick={playOnlineClick}>
          Play Online
        </button>
      </div>
    );
  }

  // If opponent is not available don't start the game
  if (playOnline && !opponentName) {
    return (
      <div
        style={{
          display: "flex",
          height: "50vh",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p className="waiting_opponent">Waiting for Opponent...</p>
      </div>
    );
  }

  // Websocket / Socket.io code end

  return (
    <div className="main-div">
      {/* Current move by player */}
      <div className="move-detection">
        <div
          className={`left ${
            currentPlayer === playingAs ? "current-move-" + currentPlayer : ""
          }`}
        >
          {playerName}
        </div>
        <div
          className={`right ${
            currentPlayer !== playingAs ? "current-move-" + currentPlayer : ""
          }`}
        >
          {opponentName}
        </div>
      </div>

      <div className="">
        <h1 className="water-background game-heading">Tic Tac Toe</h1>

        {/* Render the 9 square */}
        <div className="square-wrapper">
          {gameState.map((arr, rowIndex) =>
            arr.map((e, colIndex) => {
              return (
                <Square
                  socket={socket}
                  key={rowIndex * 3 + colIndex}
                  id={rowIndex * 3 + colIndex}
                  gameState={gameState}
                  setGameState={setGameState}
                  currentPlayer={currentPlayer}
                  setCurrentPlayer={setCurrentPlayer}
                  finishedState={finishedState}
                  finishedArrayState={finishedArrayState}
                  currentElement={e}
                  playingAs={playingAs}
                />
              );
            })
          )}
        </div>
        {finishedState &&
          finishedState !== "opponentLeftMatch" &&
          finishedState !== "draw" && (
            <h3 className="finished-state">
              {finishedState === playingAs ? "You " : finishedState} won the
              game
            </h3>
          )}
        {finishedState && finishedState === "draw" && (
          <h3 className="finished-state">It's a Draw</h3>
        )}
      </div>
      {!finishedState && opponentName && (
        <h2>You are playing against {opponentName}</h2>
      )}
      {finishedState && finishedState === "opponentLeftMatch" && (
        <h2>You won the match, Opponent has left</h2>
      )}
    </div>
  );
};

export default App;
