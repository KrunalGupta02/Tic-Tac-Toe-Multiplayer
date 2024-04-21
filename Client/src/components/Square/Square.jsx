import React, { useState } from "react";
import "./square.css";

const circleSvg = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      {" "}
      <path
        d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>{" "}
    </g>
  </svg>
);

const crossSvg = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      {" "}
      <path
        d="M19 5L5 19M5.00001 5L19 19"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>{" "}
    </g>
  </svg>
);

const Square = ({
  id,
  gameState,
  setGameState,
  currentPlayer,
  setCurrentPlayer,
  finishedState,
  setFinishedState,
  finishedArrayState,
  socket,
  currentElement,
  playingAs,
}) => {
  const [icon, setIcon] = useState(null);

  const clickOnSquare = () => {
    // Move in your chance only
    if (playingAs !== currentPlayer) {
      return;
    }

    // If game is finished then game is over
    if (finishedState) {
      return;
    }

    // If icon is present then don't do anything
    if (!icon) {
      if (currentPlayer == "circle") {
        setIcon(circleSvg);
      } else {
        setIcon(crossSvg);
      }

      const myCurrentPlayer = currentPlayer;

      // update the state for real time
      socket.emit("playerMoveFromClient", {
        state: {
          id,
          sign: myCurrentPlayer,
        },
      });

      setCurrentPlayer(currentPlayer === "circle" ? "cross" : "circle");

      setGameState((prevState) => {
        console.log(prevState);

        // copy the prev state
        let newState = [...prevState];
        console.log(id);

        const rowIndex = Math.floor(id / 3);
        const colIndex = id % 3;

        newState[rowIndex][colIndex] = myCurrentPlayer;
        return newState;
      });
    }
  };

  return (
    <div
      onClick={clickOnSquare}
      className={`square ${finishedState ? "not-allowed" : ""}
      ${currentPlayer !== playingAs ? "not-allowed" : ""}
       ${finishedArrayState.includes(id) ? finishedState + "-won" : ""}
       ${finishedState && finishedState !== playingAs ? "grey-background" : ""}
       `}
    >
      {currentElement === "circle"
        ? circleSvg
        : currentElement === "cross"
        ? crossSvg
        : icon}
    </div>
  );
};

export default Square;
