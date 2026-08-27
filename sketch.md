# Sketch
This file is for general prototyping and saving code.

## Game Loop

``` JavaScript
function playGame(player1, player2, display) {
  controller.init(player1, player2);
  let result = Result.ONGOING;
  while (result === Result.ONGOING) {
    let legalMove = false;
    while (!legalMove) {
      const coordinates = controller.makeMove();
      legalMove = controller.markCell(coordinates);
      if (!legalMove) {
        display.warn("Cell was already marked!");
      } else {
        display.markCell(coordinates);
      }
    }
    result = controller.finishTurn();
  }

  switch (result) {
    case Result.WIN:
      display.declareWinner(controller.winner());
      break;
    case Result.TIE:
      display.declareTie();
      break;
    default:
      throw new Error(`Unexpected result: ${result}`);
  }
}
```