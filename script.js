const gameBoard = (() => {
  const columns = 3;
  const rows = 3;
  const coordinate = coordinateSystem(columns, rows);
  const board = [];

  function setCellValue(coordinates, value) {
    board[(coordinate.x(), coordinate.y())] = value;
  }

  for (let i = 0; i < columns; i++) {
    board.push([]);
    for (let j = 0; j < rows; j++) {
      board[i].push("");
    }
  }

  return { board };
})();

function playerMaker() {
  let id = 0;

  return function createPlayer(name, marker) {
    return { name, marker, id: id++ };
  };
}

function coordinateSystem(columnSize, rowSize) {
  let _x;
  let _y;

  function x() {
    return _x;
  }
  function y() {
    return _y;
  }

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

const controller = (() => {
  const player = playerMaker();
  const player1 = player("human", "x");
  const player2 = player("ai", "o");
  const board = gameBoard;

  function markCell(player, coordinates) {
    board.setCellValue(coordinates, player.id);
  }

  return { markCell };
})();
