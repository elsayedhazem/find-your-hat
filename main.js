const prompt = require("prompt-sync")({ sigint: true });

const hatCharacter = "^";
const holeCharacter = "O";
const fieldCharacter = "░";
const pathCharacter = "*";

function zeros(n) {
  let arr = [];
  for (let i = 0; i < n; i++) {
    arr.push(0);
  }
  return arr;
}

function checkPosition(index, n, arr) {
  return {
    isFirst: index === 0 ? true : false,
    isTopBorder: 0 <= index && index <= n - 1 ? true : false,
    isBottomBorder: n ** 2 - n <= index && index <= n ** 2 - 1 ? true : false,
    isrightBorder: (index + 1) % n === 0 ? true : false,
    isLeftBorder: index % n === 0 ? true : false,
    markedAbove: arr[index - n] === 1 ? true : false,
    markedBelow: arr[index + n] === 1 ? true : false,
    markedRight: arr[index + 1] === 1 ? true : false,
    markedLeft: arr[index - 1] === 1 ? true : false,
  };
}

function getPossibleMoves(pos) {
  const moves = {
    up: !pos.isTopBorder && !pos.markedAbove ? true : false,
    down: !pos.isBottomBorder && !pos.markedBelow ? true : false,
    right: !pos.isrightBorder && !pos.markedRight ? true : false,
    left: !pos.isLeftBorder && !pos.markedLeft ? true : false,
  };

  const possibleMoves = [];
  for (let key in moves) {
    moves[key] && possibleMoves.push(key);
  }

  return possibleMoves;
}

function addCharacters(arr) {
  const hatIndex = arr.lastIndexOf(1);
  arr[hatIndex] = hatCharacter;
  arr[0] = pathCharacter;
  for (let i in arr) {
    if (i == 0 || i == hatIndex) continue;

    if (arr[i] == 1) {
      arr[i] = fieldCharacter;
    } else {
      const fieldOrHole = [fieldCharacter, holeCharacter][
        Math.floor(Math.random() * 2)
      ];
      arr[i] = fieldOrHole;
    }
  }
  return arr;
}

function create2dArray(n) {
  let mainArray = zeros(n ** 2);
  mainArray[0] = 1;

  const moves = {
    up: (x) => x - n,
    down: (x) => x + n,
    right: (x) => x + 1,
    left: (x) => x - 1,
  };

  let count = 1; //count of pathCharacters added, shouldn't exceed 3/4 of total number of squares so that path is not too long
  let currentIndex = 0;
  while (count <= Math.floor(0.75 * n ** 2)) {
    const position = checkPosition(currentIndex, n, mainArray);
    const possibleMoves = getPossibleMoves(position);

    if (possibleMoves.length === 0) break;

    if (position.isBottomborder) break;

    const newIndexChoices = [];
    for (let i in possibleMoves) {
      const newIndexChoice = moves[possibleMoves[i]](currentIndex);
      newIndexChoices.push(newIndexChoice);
    }

    const random = Math.floor(Math.random() * newIndexChoices.length);
    const newIndex = newIndexChoices[random];
    mainArray[newIndex] = 1;
    currentIndex = newIndex;
    count++;
  }

  const minPathCharacters = Math.floor(0.33 * n ** 2);
  if (count < minPathCharacters) return create2dArray(n);

  mainArray = addCharacters(mainArray);
  const newArray = [];
  for (let i = 0; i < n; i++) {
    newArray.push(mainArray.slice(i * n, (i + 1) * n));
  }

  return newArray;
}

class Field {
  constructor(field) {
    this._field = field;
    this.rows = field.length;
    this.cols = field[0].length;
    this._current = [0, 0];
    this._lost = false;
    this._won = false;
  }

  get field() {
    let str = "";
    for (let row in this._field) {
      str += this._field[row].join("") + "\n";
    }

    return str;
  }

  print() {
    console.log(this.field);
  }

  intro() {
    console.log("Welcome to Find Your Hat!");
    console.log(
      "Navigate using AWSD keys as arrows, and press enter after every move. Dont fall in a hole. Get to your hat."
    );
  }

  _verifyPos(newPos) {
    let row, col;
    [row, col] = newPos;

    let rowValid;
    let colValid;

    if (row >= 0 && row < this.rows) {
      rowValid = true;
    }

    if (col >= 0 && col < this.cols) {
      colValid = true;
    }

    return rowValid && colValid ? true : false;
  }

  _checkNewPos(newPos) {
    const isHole = this._field[newPos[0]][newPos[1]] === holeCharacter;
    const isHat = this._field[newPos[0]][newPos[1]] === hatCharacter;

    if (isHole) this._lost = true;
    if (isHat) this._won = true;
  }

  _updateField(newPos) {
    let currentRow, currentCol, newRow, newCol;
    [currentRow, currentCol] = this._current;
    [newRow, newCol] = newPos;

    if (this._field[newRow][newCol] === pathCharacter) {
      this._field[currentRow][currentCol] = fieldCharacter;
    }
    this._field[newRow][newCol] = pathCharacter;
    this._current = newPos;
  }

  play() {
    this.intro();

    while (!this._won && !this._lost) {
      this.print();
      const inpt = prompt("Which way? ")[0];
      const move = inpt ? inpt.toLowerCase() : null;

      let row, col, newPos;
      switch (move) {
        case "w":
          [row, col] = this._current;

          newPos = [row - 1, col];

          if (this._verifyPos(newPos)) {
            this._checkNewPos(newPos);
            this._updateField(newPos);
          }
          break;

        case "s":
          [row, col] = this._current;

          newPos = [row + 1, col];

          if (this._verifyPos(newPos)) {
            this._checkNewPos(newPos);
            this._updateField(newPos);
          }
          break;

        case "a":
          [row, col] = this._current;

          newPos = [row, col - 1];

          if (this._verifyPos(newPos)) {
            this._checkNewPos(newPos);
            this._updateField(newPos);
          }
          break;

        case "d":
          [row, col] = this._current;

          newPos = [row, col + 1];

          if (this._verifyPos(newPos)) {
            this._checkNewPos(newPos);
            this._updateField(newPos);
          }
          break;

        default:
          console.log("Invalid move. (Use AWSD keys like arrows)");
          break;
      }
    }

    if (this._won) {
      console.log("Congrats! you found your hat");
    } else if (this._lost) {
      console.log("You Lost!");
    }
  }
}

const myField = new Field(create2dArray(15));
myField.play();
