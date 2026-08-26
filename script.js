const gameBoard = (() => {
  // Private
  const _size = 3;
  const board = [];

  function makeBoard() {
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
    const hasBothDiagonals =
      _size - coordinates.x() === _size - 1 &&
      _size - coordinates.y() === _size - 1;
    const hasLeftDiagonal =
      _size - coordinates.x() === _size || hasBothDiagonals;
    const hasRightDiaongal = _size - coordinates.x() === 1 || hasBothDiagonals;

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

const controller = (() => {
  // Public

  function checkWinner(lastPlayerCell, lastPlayerId) {
    const hasPlayerId = (cellValue) => cellValue === lastPlayerId;

    if (gameBoard.horizontal(lastPlayerCell).every(hasPlayerId)) {
      return lastPlayerId;
    }
    if (gameBoard.vertical(lastPlayerCell).every(hasPlayerId)) {
      return lastPlayerId;
    }
    const [leftDiagonal, rightDiagonal] = gameBoard.diagonals(lastPlayerCell);
    if (
      (leftDiagonal.every(hasPlayerId) && leftDiagonal.length > 1) ||
      (rightDiagonal.every(hasPlayerId) && leftDiagonal.length > 1)
    ) {
      return lastPlayerId;
    }
    return null;
  }

  function markCell(player, coordinates) {
    board.setCellValue(coordinates, player);
  }

  // Private

  const player1 = 0;
  const player2 = 1;
  const board = gameBoard;

  return { markCell, checkWinner };
})();
