// Game Engine

const gameBoard = (() => {
  // Private
  const _size = 3;
  let board = [];

  function makeBoard() {
    board = [];
    for (let x = 0; x < _size; x++) {
      board.push([]);
      for (let y = 0; y < _size; y++) {
        board[x].push(null);
      }
    }
  }

  makeBoard();

  // Public

  const coordinate = coordinateSystem(_size, _size);

  function representation() {
    return board;
  }

  function setCellValue(coordinates, value) {
    board[coordinates.y()][coordinates.x()] = value;
  }

  function selectCell(coordinates) {
    return board[coordinates.y()][coordinates.x()];
  }

  function horizontal(coordinates) {
    // Returns array of X values on the same Y axis
    return board[coordinates.y()];
  }

  function vertical(coordinates) {
    const verticalValues = [];

    for (let y = 0; y < _size; y++) {
      verticalValues.push(board[y][coordinates.x()]);
    }
    return verticalValues;
  }

  function diagonals(coordinates) {
    const hasLeftDiagonal = coordinates.x() - coordinates.y() === 0;
    const hasRightDiaongal = coordinates.x() + coordinates.y() === _size;
    const leftDiagonalValues = [];
    if (hasLeftDiagonal) {
      for (let xy = 0; xy < _size; xy++) {
        leftDiagonalValues.push(board[xy][xy]);
      }
    }
    const rightDiagonalValues = [];
    if (hasRightDiaongal) {
      for (let i = 0; i < _size; i++) {
        rightDiagonalValues.push(board[_size - 1 - i][i]);
      }
    }

    return [leftDiagonalValues, rightDiagonalValues];
  }

  function size() {
    return _size;
  }

  return {
    makeBoard,
    selectCell,
    setCellValue,
    size,
    coordinate,
    horizontal,
    vertical,
    diagonals,
    representation,
  };
})();

const ai = (() => {
  const maxX = gameBoard.size();
  const maxY = gameBoard.size();

  let waitTime = 500;
  async function randomMove() {
    let coordinate = null;
    do {
      coordinate = gameBoard.coordinate(
        Math.floor(Math.random() * maxX),
        Math.floor(Math.random() * maxY),
      );
    } while (gameBoard.selectCell(coordinate) !== null);
    await new Promise((r) => setTimeout(r, waitTime));
    return coordinate;
  }

  return { randomMove, waitTime };
})();

function play() {
  let winner = null;
  while (winner === null) {
    while (!controller.executeTurn(promptInput)) {
      console.log("Cell has already been marked!");
    }
    winner = controller.resolveTurn();
    console.table(gameBoard.representation());
  }

  console.log(winner);
}

function coordinateSystem(columnSize, rowSize) {
  // Public

  function x() {
    return _x;
  }
  function y() {
    return _y;
  }

  // Private

  let _x;
  let _y;

  return function coords(x_coordinates, y_coordinates) {
    if (
      !(typeof x_coordinates === "number" && Number.isInteger(x_coordinates))
    ) {
      throw Error(
        `Type of x value of '${x_coordinates}' is invalid. Must be an integer.`,
      );
    }
    if (
      !(typeof y_coordinates === "number" && Number.isInteger(y_coordinates))
    ) {
      throw Error(
        `Type of y value of '${y_coordinates}' is invalid. Must be an integer.`,
      );
    }

    if (x_coordinates >= columnSize || x_coordinates < 0) {
      throw Error(
        `Invalid x coordinate: '${x_coordinates}'. Must be between 0 and ${columnSize - 1}`,
      );
    }
    if (y_coordinates >= rowSize || y_coordinates < 0) {
      throw Error(
        `Invalid y coordinate: '${y_coordinates}'. Must be between 0 and ${rowSize - 1}`,
      );
    }

    _x = x_coordinates;
    _y = y_coordinates;
    return { x, y };
  };
}

function playerGenerator(defaultInputMethod) {
  let _id = 0;

  const playerIds = new Set();
  const playerMarkers = new Set();

  return function createPlayer(
    playerName,
    playerMarker,
    inputMethod = defaultInputMethod,
  ) {
    const id = _id++;
    const name = playerName ?? "player" + id;
    const marker = playerMarker;

    if (playerMarkers.has(marker)) {
      throw new Error(`Marker must be unique: ${marker}`);
    }
    playerMarkers.add(marker);
    if (playerIds.has(marker)) {
      throw new Error(`Id value was not unique: ${id}`);
    }
    playerIds.add(id);

    function representation() {
      return `${id} | ${name}`;
    }
    return Object.freeze({
      id,
      name,
      marker,
      inputMethod,
      representation,
    });
  };
}

const Result = {
  WIN: "WIN",
  TIE: "TIE",
  ONGOING: "ONGOING",
};

const Marker = {
  O: "circle",
  X: "cross",
};

const controller = (() => {
  // Public

  async function makeMove() {
    return currentPlayer.inputMethod();
  }

  function resolveTurn() {
    if (checkWinner()) {
      _winner = currentPlayer;
      return Result.WIN;
    }
    if (availableTurns <= 0) {
      return Result.TIE;
    }
    return Result.ONGOING;
  }

  function winner() {
    return _winner;
  }

  function currentMarker() {
    return currentPlayer.marker;
  }

  function init(customPlayer1, customPlayer2) {
    board.makeBoard();

    player1 = customPlayer1;
    player2 = customPlayer2;

    currentPlayer = player1;

    lastPlayedCell = null;

    availableTurns = board.size() * board.size();

    _winner = null;
  }

  function finishTurn() {
    currentPlayer = currentPlayer.id == player1.id ? player2 : player1;
  }

  // Private

  const board = gameBoard;

  let player1;
  let player2;

  let currentPlayer;

  let lastPlayedCell;

  let availableTurns;

  let _winner;

  // Returns false if already marked.
  function markCell(coordinates) {
    if (board.selectCell(coordinates) !== null) {
      return false;
    }
    board.setCellValue(coordinates, currentPlayer.id);
    lastPlayedCell = coordinates;
    availableTurns--;
    return true;
  }

  function checkWinner() {
    const hasPlayerId = (cellValue) => cellValue === currentPlayer.id;

    if (gameBoard.horizontal(lastPlayedCell).every(hasPlayerId)) {
      return true;
    }
    if (gameBoard.vertical(lastPlayedCell).every(hasPlayerId)) {
      return true;
    }
    const [leftDiagonal, rightDiagonal] = gameBoard.diagonals(lastPlayedCell);
    if (
      (leftDiagonal.every(hasPlayerId) && leftDiagonal.length > 1) ||
      (rightDiagonal.every(hasPlayerId) && rightDiagonal.length > 1)
    ) {
      return true;
    }
    return false;
  }

  return {
    makeMove,
    markCell,
    resolveTurn,
    finishTurn,
    winner,
    init,
    currentMarker,
  };
})();

// Intermediary

async function playGame(player1, player2, display) {
  display.clear();
  controller.init(player1, player2);
  let result = Result.ONGOING;
  while (result === Result.ONGOING) {
    let legalMove = false;
    while (!legalMove) {
      const coordinates = await controller.makeMove();
      legalMove = controller.markCell(coordinates);
      if (!legalMove) {
        display.warn("Cell was already marked!");
      } else {
        display.markCell(controller.currentMarker(), coordinates);
      }
    }
    result = controller.resolveTurn();
    controller.finishTurn();
  }

  await new Promise((r) => setTimeout(r, 200));

  switch (result) {
    case Result.WIN:
      display.declareWinner(controller.winner().name);
      break;
    case Result.TIE:
      display.declareTie();
      break;
    default:
      throw new Error(`Unexpected result: ${result}`);
  }
}

// DOMInteraction

const cells = (() => {
  const elements = {};

  for (let x = 0; x < gameBoard.size(); x++) {
    for (let y = 0; y < gameBoard.size(); y++) {
      elements[`${x} ${y}`] = document.querySelector(
        `.cell.x-${x}.y-${y} .marker`,
      );
    }
  }

  function select(coordinates) {
    return elements[`${coordinates.x()} ${coordinates.y()}`];
  }

  function all() {
    return Object.values(elements);
  }

  return { select, all };
})();

const board = document.querySelector(".game-board");

const guiInput = (() => {
  let clickResolver = null;

  function click(coordinates) {
    if (clickResolver !== null) {
      const resolve = clickResolver;
      clickResolver = null;
      resolve(coordinates);
    }
  }

  function clickListener() {
    return new Promise((resolve) => (clickResolver = resolve));
  }

  async function clickMethod() {
    const coordinates = await clickListener();
    return coordinates;
  }

  return { clickMethod, click };
})();

board.addEventListener("click", (event) => {
  if (!event.target.classList.contains("cell")) {
    return;
  }
  guiInput.click(
    gameBoard.coordinate(
      parseInt(event.target.getAttribute("x")),
      parseInt(event.target.getAttribute("y")),
    ),
  );
});

const display = (() => {
  function markCell(marker, coordinates) {
    cells.select(coordinates).classList.add(marker);
  }

  function clear() {
    cells.all().forEach((cell) => {
      cell.classList.remove(Marker.O);
      cell.classList.remove(Marker.X);
    });
  }

  function declareWinner(winner) {
    console.log(winner);
    alert(`${winner} has won the game!`);
  }

  function declareTie() {
    console.log("tie");
    alert("The game tied.");
  }

  function warn(warning) {
    alert(warning);
  }

  return { markCell, clear, declareWinner, declareTie, warn };
})();

const form = document.querySelector(".selection form");
const playBtn = document.getElementById("play-btn");

playBtn.addEventListener("click", async (event) => {
  event.preventDefault();

  const name1 = form.elements["player-1-name-input"].value;
  const name2 = form.elements["player-2-name-input"].value;
  const type1 = form.elements["player-1-player-type"].value;
  const type2 = form.elements["player-2-player-type"].value;

  const generatePlayer = playerGenerator(ai.randomMove);

  const player1 = generatePlayer(name1, Marker.O, guiInput.clickMethod);
  const player2 = generatePlayer(name2, Marker.X);

  await playGame(player1, player2, display);
});
