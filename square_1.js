class Square {
  constructor(colour, col, row) {
    //height,width,x,y,

    this.colour = colour;
    this.col = col;
    this.row = row;
    this.neighbours = {
      Top: undefined,
      TopRight: undefined,
      Right: undefined,
      BottomRight: undefined,
      Bottom: undefined,
      BottomLeft: undefined,
      Left: undefined,
      TopLeft: undefined,
    };
    this.primNeighbours = {
      Top: undefined,
      Right: undefined,
      Bottom: undefined,
      Left: undefined,
    };
    this.cell;
  }

  getCell() {
    this.cell = document.getElementById("myTable").rows[this.row].cells[
      this.col
    ];
  }

  getCol() {
    return this.col;
  }

  getRow() {
    return this.row;
  }

  makeStart() {
    currentColour = this.colour;
    this.colour = green;
  }

  makeEnd() {
    this.colour = red;
  }

  makePath() {
    //debugger;
    var _this = this;

    _this.colour = "white";
  }

  makeWall() {
    var _this = this;
    _this.colour = "black";
  }

  findPrimNeighbours(grid) {
    var _this = this;
    if (_this.col > 1) {
      _this.primNeighbours["Left"] = grid[_this.row][_this.col - 2];
    }
    if (_this.col < numOfCols - 2) {
      _this.primNeighbours["Right"] = grid[_this.row][_this.col + 2];
    }
    if (_this.row > 1) {
      _this.primNeighbours["Top"] = grid[_this.row - 2][_this.col];
    }
    if (_this.row < numOfRows - 2) {
      _this.primNeighbours["Bottom"] = grid[_this.row + 2][_this.col];
    }
  }

  findNeighbours(grid, diagonal) {
    var _this = this;
    if (_this.col > 0) {
      _this.neighbours["Left"] = grid[_this.row][_this.col - 1];
    }
    if (_this.col < numOfCols - 1) {
      _this.neighbours["Right"] = grid[_this.row][_this.col + 1];
    }
    if (_this.row > 0) {
      _this.neighbours["Top"] = grid[_this.row - 1][_this.col];
    }
    if (_this.row < numOfRows - 1) {
      _this.neighbours["Bottom"] = grid[_this.row + 1][_this.col];
    }

    if (diagonal == true) {
      if (_this.row > 0 && _this.col < numOfCols - 1) {
        _this.neighbours["TopRight"] = grid[_this.row - 1][_this.col + 1];
      }
      if (_this.row < numOfRows - 1 && _this.col < numOfCols - 1) {
        _this.neighbours["BottomRight"] = grid[_this.row + 1][_this.col + 1];
      }
      if (_this.row < numOfRows - 1 && _this.col > 0) {
        _this.neighbours["BottomLeft"] = grid[_this.row + 1][_this.col - 1];
      }
      if (_this.row > 0 && _this.col > 0) {
        _this.neighbours["TopLeft"] = grid[_this.row - 1][_this.col - 1];
      }
    }
  }
}
