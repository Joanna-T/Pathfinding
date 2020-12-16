var startSquarePath;
var endSquarePath;

var numOfRows = 31;
var numOfCols = 31;

var squareWidth = "13px"; //before: 15px with 2 px border
var squareHeight = "13px";

var grid = [];

//colours for squares
red = "rgb(255,0,0)";
green = "rgb(0,255,0)";
blue = "rgb(0,0,255)";
white = "rgb(255,255,255)";
//black = "rgb(200,150,200)";
grey = "rgb(200)";

function tableCreate() {
  //--------------------------------------------------------------------------------------------------------create table
  debugger;
  var tbldiv = document.getElementById("tablediv");
  var tbl = document.createElement("table");
  tbl.setAttribute("id", "myTable");

  for (var i = 0; i < numOfRows; i++) {
    var tr = tbl.insertRow();
    for (var j = 0; j < numOfCols; j++) {
      var td = tr.insertCell();
      //td.style.textAlign = "center";
      td.style.position = "relative";

      if (i == 1 && j == 1) {
        debugger;
        //class="event" id="item1" draggable="true"
        var spn = document.createElement("P");

        spn.innerText = "S";
        spn.setAttribute("class", "event");
        spn.setAttribute("id", "startPath");
        td.appendChild(spn);
        td.setAttribute("class", "startCell");
      }
      if (i == 10 && j == 10) {
        var spn = document.createElement("P");

        spn.innerText = "E";
        spn.setAttribute("class", "event");
        spn.style.cursor = "pointer";
        spn.setAttribute("id", "endPath");

        td.appendChild(spn);
        td.setAttribute("class", "endCell");
      }

      td.style.border = "3px solid white";
      td.style.height = squareHeight;
      td.style.width = squareWidth;

      td.style.borderRadius = "20%";
      td.style.margin = "0px";
    }
  }
  tbldiv.appendChild(tbl);
}

function createSquare(grid) {
  for (i = 0; i < numOfRows; i++) {
    grid.push([]);
    for (j = 0; j < numOfCols; j++) {
      square = new Square("white", j, i);
      grid[i].push(square);
    }
  }
  startSquarePath = grid[1][1];
  endSquarePath = grid[10][10];
}

function whiteToBlack(grid) {
  counter = 0;
  arr = [];

  function doSetTimeout(i, xValue) {
    setTimeout(function () {
      console.log(x);
      xValue.getCell();

      xValue.cell.classList.add("animateWhiteToBlack");
    }, 3 * i);
  }

  for (var i = 0; i < numOfRows; i++) {
    for (var j = 0; j < numOfCols; j++) {
      arr.push([i, j]);
    }
  }

  for (var i = 0; i < arr.length; i++) {
    rowNum = arr[i][0];
    colNum = arr[i][1];
    console.log(rowNum, colNum);
    var x = grid[rowNum][colNum];
    x.colour = "black";
    doSetTimeout(i, x);
  }
}

function drawMaze(grid) {
  debugger;

  $("#myTable td").each(function () {
    if ($(this).children(".event").length > 0) {
      $(this).empty();
    }
  });

  disableButton(true);
  const opposite = {
    Top: "Bottom",
    Bottom: "Top",
    Right: "Left",
    Left: "Right",
  };
  walls = [];
  visited = [];
  startSquare = grid[1][1];

  visited.push(startSquare);
  startSquare.getCell();

  setTimeout(() => {
    startSquare.cell.classList.remove("animateWhiteToBlack");
    startSquare.cell.classList.add("animateBlackToWhite");
    startSquare.makePath();
  }, 15);

  debugger;

  startSquare.findPrimNeighbours(grid);
  var startNeighbours = startSquare.primNeighbours;

  Object.entries(startNeighbours).forEach((entry) => {
    const [direction, neighbour] = entry;
    if (typeof neighbour !== "undefined") {
      walls.push(neighbour);
    }
  });
  console.log("starting colour", startSquare.colour);
  var intr = setInterval(function () {
    startSquare.colour = "white";
    randomNumber = Math.floor(Math.random() * Math.floor(walls.length));
    var tempWall = walls[randomNumber];
    tempWall.findPrimNeighbours(grid);
    tempWall.findNeighbours(grid);

    for (var direction1 in tempWall.primNeighbours) {
      var neighbour1 = tempWall.primNeighbours[direction1];

      if (
        typeof neighbour1 !== "undefined" &&
        visited.includes(neighbour1) &&
        tempWall.neighbours[direction1].colour === "black"
      ) {
        tempWall.neighbours[direction1].getCell();
        tempWall.neighbours[direction1].cell.classList.remove(
          "animateWhiteToBlack"
        );
        tempWall.neighbours[direction1].cell.classList.add(
          "animateBlackToWhite"
        );
        tempWall.neighbours[direction1].makePath();

        tempWall.getCell();
        tempWall.cell.classList.remove("animateWhiteToBlack");
        tempWall.cell.classList.add("animateBlackToWhite");
        tempWall.makePath();

        visited.push(tempWall);
        var index = walls.indexOf(tempWall);
        walls.splice(index, 1);
        Object.entries(tempWall.primNeighbours).forEach((entry2) => {
          const [direction2, neighbour2] = entry2;
          if (
            !visited.includes(neighbour2) &&
            typeof neighbour2 !== "undefined" &&
            !walls.includes(neighbour2)
          ) {
            walls.push(neighbour2);
          }
        });
        break;
      }
    }

    if (walls.length === 0) {
      var resetStart = grid[1][1];
      resetStart.getCell();

      var resetEnd = grid[numOfCols - 2][numOfRows - 2];
      resetEnd.getCell();

      var spn1 = document.createElement("P");
      spn1.innerText = "S";
      spn1.setAttribute("class", "event");
      spn1.setAttribute("id", "startPath");
      resetStart.cell.appendChild(spn1);
      startSquarePath = resetStart;

      var spn = document.createElement("P");
      spn.innerText = "E";
      spn.setAttribute("class", "event");
      spn.setAttribute("id", "endPath");
      resetEnd.cell.appendChild(spn);
      endSquarePath = resetEnd;

      disableButton(false);
      clearInterval(intr);
    }
  }, 20);
}

function aStarSearch(grid, diagonal) {
  disableButton(true);

  debugger;

  startSquarePath.getCell();
  startSquarePath.cell.classList.add("start");
  endSquarePath.getCell();
  endSquarePath.cell.classList.add("end");

  var startingF = heuristic("Manhattan", startSquarePath, endSquarePath);

  var openSet = [];
  var openSetList = [];
  openSet.push([startingF, startSquarePath]);
  openSetList.push(startSquarePath);

  var allG = [[], []];
  var allF = [[], []];
  for (i = 0; i < numOfRows; i++) {
    for (j = 0; j < numOfCols; j++) {
      allG[0].push(grid[i][j]);
      allG[1].push(Infinity);
      allF[0].push(grid[i][j]);
      allF[1].push(Infinity);
    }
  }
  debugger;
  indexStart = allG[0].indexOf(startSquarePath);
  allG[1][indexStart] = 0;

  var cameFrom = [[], []];
  var closed = [];
  current = startSquarePath;
  console.log("current1", current);
  var counter = 50; // timer for settimeout

  var intr = setInterval(function () {
    //setInterval loop: while current isnt the end square and openset isnt empty
    debugger;
    console.log("openset", openSet);

    current.findNeighbours(grid, diagonal);
    current.getCell();
    if (current != startSquarePath) {
      current.cell.classList.add("animateSearch");
    }

    for (direction in current.neighbours) {
      var neighbour = current.neighbours[direction];
      debugger;
      if (
        !closed.includes(neighbour) &&
        typeof neighbour !== "undefined" &&
        neighbour.colour !== "black"
      ) {
        var tempH = heuristic("Manhattan", neighbour, endSquarePath); // heuristic as separate function

        var indexG = allG[0].indexOf(current);
        var tempG = allG[1][indexG] + 1;
        var indexNeighbourG = allG[0].indexOf(neighbour);
        var oldG = allG[1][indexNeighbourG]; // calculate G

        if (oldG > tempG) {
          allG[1][indexNeighbourG] = tempG;
        }

        var neighbourF = tempH + allG[1][indexNeighbourG];

        if (!openSetList.includes(neighbour)) {
          openSet.push([neighbourF, neighbour]);
          openSetList.push(neighbour);
        } else if (oldG > tempG) {
          var idx = openSetList.indexOf(neighbour);
          openSet[idx] = [neighbourF, neighbour];
        }

        if (cameFrom[0].indexOf(neighbour) != -1) {
          if (oldG > tempG) {
            var indexCameFrom = cameFrom[0].indexOf(neighbour);
            cameFrom[1][indexCameFrom] = current;
          }
        } else {
          cameFrom[0].push(neighbour);
          cameFrom[1].push(current);
        }
      }
    }
    closed.push(current);
    var index = openSetList.indexOf(current);
    openSetList.splice(index, 1); //remove current from openset
    openSet.splice(index, 1);
    counter += 50;

    var lowestVal = Infinity;
    for (i = 0; i < openSet.length; i++) {
      if (openSet[i][0] < lowestVal) {
        lowestVal = openSet[i][0];
        current = openSet[i][1];
      }
    }

    if (openSet.length === 0) {
      disableButton(false);
      clearInterval(intr);
    } else if (current === endSquarePath) {
      debugger;
      findPath(cameFrom, current);
      clearInterval(intr);
    }
  }, 10); //end while loop

  if (openSet.length == 0) {
    console.log("No solution found.");
  }
}

function breadthFirstSearch(grid, diagonal) {
  debugger;
  disableButton(true);

  debugger;

  startSquarePath.getCell();
  startSquarePath.cell.classList.add("start");
  endSquarePath.getCell();
  endSquarePath.cell.classList.add("end");

  var openSet = [];
  openSet.push(startSquarePath);

  var cameFrom = [[], []];
  var closed = [];
  current = startSquarePath;
  console.log("current1", current);
  var counter = 50; // timer for settimeout

  var intr = setInterval(function () {
    //setInterval loop: while current isnt the end square and openset isnt empty
    debugger;

    current.findNeighbours(grid, diagonal);
    current.getCell();
    if (current != startSquarePath) {
      current.cell.classList.add("animateSearch");
    }

    for (direction in current.neighbours) {
      var neighbour = current.neighbours[direction];
      debugger;
      if (
        !closed.includes(neighbour) &&
        typeof neighbour !== "undefined" &&
        neighbour.colour !== "black"
      ) {
        if (!openSet.includes(neighbour)) {
          openSet.push(neighbour);
        }
        cameFrom[0].push(neighbour);
        cameFrom[1].push(current);
      }
    }
    closed.push(current);
    var index = openSet.indexOf(current);
    openSet.splice(index, 1); //remove current from openset
    counter += 50;

    if (openSet.length !== 0) {
      current = openSet[0];
    }

    if (openSet.length === 0) {
      disableButton(false);

      clearInterval(intr);
    } else if (current === endSquarePath) {
      debugger;
      findPath(cameFrom, current);
      clearInterval(intr);
    }
  }, 10);

  if (openSet.length == 0) {
    console.log("No solution found.");
  }
}

function depthFirstSearch(grid, diagonal) {
  debugger;
  disableButton(true);

  debugger;

  startSquarePath.getCell();
  startSquarePath.cell.classList.add("start");
  endSquarePath.getCell();
  endSquarePath.cell.classList.add("end");

  var openSet = []; //stack

  var cameFrom = [[], []];
  var closed = []; //visited

  var counter = 50; // timer for settimeout
  var current = startSquarePath;

  var intr = setInterval(function () {
    debugger;

    current.findNeighbours(grid, diagonal);
    current.getCell();
    if (current != startSquarePath) {
      current.cell.classList.add("animateSearch");
    }

    if (!closed.includes(current)) {
      closed.push(current);
      for (direction in current.neighbours) {
        var neighbour = current.neighbours[direction];
        debugger;
        if (
          !closed.includes(neighbour) &&
          typeof neighbour !== "undefined" &&
          neighbour.colour !== "black"
        ) {
          openSet.push(neighbour);

          if (cameFrom[0].indexOf(neighbour) != -1) {
            var indexCameFrom = cameFrom[0].indexOf(neighbour);
            cameFrom[1][indexCameFrom] = current;
          } else {
            cameFrom[0].push(neighbour);
            cameFrom[1].push(current);
          }
        }
      }
    }
    if (openSet.length === 0) {
      disableButton(false);

      console.log("No solution found");

      clearInterval(intr);
    }

    current = openSet.pop();

    console.log("current1", current);

    if (current === endSquarePath) {
      debugger;
      findPath(cameFrom, current);
      clearInterval(intr);
    }

    //remove current from stack
    counter += 50;
  }, 10); //end while loop
}

function greedyBestFirstSearch(grid, diagonal) {
  disableButton(true);

  debugger;

  startSquarePath.getCell();
  startSquarePath.cell.classList.add("start");
  endSquarePath.getCell();
  endSquarePath.cell.classList.add("end");

  var startingF = heuristic("Manhattan", startSquarePath, endSquarePath);

  var openSet = [];
  var openSetList = [];
  openSet.push([startingF, startSquarePath]);
  openSetList.push(startSquarePath);

  var allG = [[], []];
  var allF = [[], []];
  for (i = 0; i < numOfRows; i++) {
    for (j = 0; j < numOfCols; j++) {
      allG[0].push(grid[i][j]);
      allG[1].push(Infinity);
      allF[0].push(grid[i][j]);
      allF[1].push(Infinity);
    }
  }
  debugger;
  indexStart = allG[0].indexOf(startSquarePath);
  allG[1][indexStart] = 0;

  var cameFrom = [[], []];
  var closed = [];
  current = startSquarePath;
  console.log("current1", current);
  var counter = 50; // timer for settimeout

  var intr = setInterval(function () {
    //setInterval loop: while current isnt the end square and openset isnt empty
    debugger;

    current.findNeighbours(grid, diagonal);
    current.getCell();
    if (current != startSquarePath) {
      current.cell.classList.add("animateSearch");
    }

    for (direction in current.neighbours) {
      var neighbour = current.neighbours[direction];
      debugger;
      if (
        !closed.includes(neighbour) &&
        typeof neighbour !== "undefined" &&
        neighbour.colour !== "black"
      ) {
        var tempH = heuristic("Manhattan", neighbour, endSquarePath); // heuristic as separate function

        var neighbourF = tempH;

        if (!openSetList.includes(neighbour)) {
          openSet.push([neighbourF, neighbour]);
          openSetList.push(neighbour);
        }

        if (cameFrom[0].indexOf(neighbour) != -1) {
          var indexCameFrom = cameFrom[0].indexOf(neighbour);
          cameFrom[1][indexCameFrom] = current;
        } else {
          cameFrom[0].push(neighbour);
          cameFrom[1].push(current);
        }
      }
    }
    closed.push(current);
    var index = openSetList.indexOf(current);
    openSetList.splice(index, 1); //remove current from openset
    openSet.splice(index, 1);
    counter += 50;

    var lowestVal = Infinity;
    for (i = 0; i < openSet.length; i++) {
      if (openSet[i][0] < lowestVal) {
        lowestVal = openSet[i][0];
        current = openSet[i][1];
      }
    }

    if (openSet.length === 0) {
      disableButton(false);

      clearInterval(intr);
    } else if (current === endSquarePath) {
      debugger;
      findPath(cameFrom, current);
      clearInterval(intr);
    }
  }, 10); //end while loop

  if (openSet.length == 0) {
    console.log("No solution found.");
  }
}

function djikstra(grid, diagonal) {
  disableButton(true);

  debugger;

  startSquarePath.getCell();
  startSquarePath.cell.classList.add("start");
  endSquarePath.getCell();
  endSquarePath.cell.classList.add("end");

  var startingF = 0; //heuristic("Euclidean", startSquarePath, endSquarePath);

  var openSet = [];
  var openSetList = [];
  openSet.push([startingF, startSquarePath]);
  openSetList.push(startSquarePath);

  var allG = [[], []];
  var allF = [[], []];
  for (i = 0; i < numOfRows; i++) {
    for (j = 0; j < numOfCols; j++) {
      allG[0].push(grid[i][j]);
      allG[1].push(Infinity);
      allF[0].push(grid[i][j]);
      allF[1].push(Infinity);
    }
  }
  debugger;
  indexStart = allG[0].indexOf(startSquarePath);
  allG[1][indexStart] = 0;

  var cameFrom = [[], []];
  var closed = [];
  current = startSquarePath;
  console.log("current1", current);
  var counter = 50; // timer for settimeout

  var intr = setInterval(function () {
    //setInterval loop: while current isnt the end square and openset isnt empty
    debugger;

    current.findNeighbours(grid, diagonal);
    current.getCell();
    if (current != startSquarePath) {
      current.cell.classList.add("animateSearch");
    }

    for (direction in current.neighbours) {
      var neighbour = current.neighbours[direction];
      debugger;
      if (
        !closed.includes(neighbour) &&
        typeof neighbour !== "undefined" &&
        neighbour.colour !== "black"
      ) {
        var indexG = allG[0].indexOf(current);
        var tempG = allG[1][indexG] + 1;
        var indexNeighbourG = allG[0].indexOf(neighbour);
        var oldG = allG[1][indexNeighbourG]; // calculate G

        if (oldG > tempG) {
          allG[1][indexNeighbourG] = tempG;
        }

        var neighbourF = allG[1][indexNeighbourG];

        if (!openSetList.includes(neighbour)) {
          openSet.push([neighbourF, neighbour]);
          openSetList.push(neighbour);
        } else if (oldG > tempG) {
          var idx = openSetList.indexOf(neighbour);
          openSet[idx] = [neighbourF, neighbour];
        }

        if (cameFrom[0].indexOf(neighbour) != -1) {
          if (oldG > tempG) {
            var indexCameFrom = cameFrom[0].indexOf(neighbour);
            cameFrom[1][indexCameFrom] = current;
          }
        } else {
          cameFrom[0].push(neighbour);
          cameFrom[1].push(current);
        }
      }
    }
    closed.push(current);
    var index = openSetList.indexOf(current);
    openSetList.splice(index, 1); //remove current from openset
    openSet.splice(index, 1);
    counter += 50;

    var lowestVal = Infinity;
    for (i = 0; i < openSet.length; i++) {
      if (openSet[i][0] < lowestVal) {
        lowestVal = openSet[i][0];
        current = openSet[i][1];
      }
    }

    if (openSet.length === 0) {
      disableButton(false);

      clearInterval(intr);
    } else if (current === endSquarePath) {
      debugger;
      findPath(cameFrom, current);
      clearInterval(intr);
    }
  }, 10); //end while loop

  if (openSet.length == 0) {
    console.log("No solution found.");
    //enter text in target: no solution found
  }
}
function lineOfSight(grid, parent, neighbour) {
  var blocked = false;
  if (parent.row == neighbour.row) {
    let currentRow = parent.row;
    let maxSquare = Math.max(parent.col, neighbour.col);
    let minSquare = Math.min(parent.col, neighbour.col);
    for (let i = minSquare + 1; i < maxSquare; i++) {
      if (grid[currentRow][i].colour === "black") {
        blocked = true;
      }
    }
    return blocked;
  } else if (parent.col == neighbour.col) {
    let currentCol = parent.col;
    let maxSquare = Math.max(parent.row, neighbour.row);
    let minSquare = Math.min(parent.row, neighbour.row);
    for (let i = minSquare + 1; i < maxSquare; i++) {
      if (grid[i][currentCol].colour === "black") {
        blocked = true;
      }
    }
    return blocked;
  } else {
    blocked = true;
    return blocked;
  }
}

function findPathTheta(cameFrom, current) {
  var intr1 = setInterval(function () {
    debugger;
    console.log("current", current);
    if (current !== startSquarePath) {
      let diffRow = false;
      let diffCol = false;
      var indexCameFrom = cameFrom[0].indexOf(current);
      parent = cameFrom[1][indexCameFrom];
      if (parent !== endSquarePath) {
        parent.cell.classList.remove("animateParent");
        parent.cell.classList.add("animatePath");
      }

      console.log(parent);
      if (parent.row == current.row) {
        let currentRow = parent.row;
        let maxSquare = Math.max(parent.col, current.col);
        let minSquare = Math.min(parent.col, current.col);
        for (let i = minSquare; i < maxSquare; i++) {
          grid[currentRow][i].cell.classList.remove("animateParent");
          grid[currentRow][i].cell.classList.add("animatePath");
        }
      }
      if (parent.col == current.col) {
        let currentCol = parent.col;
        let maxSquare = Math.max(parent.row, current.row);
        let minSquare = Math.min(parent.row, current.row);
        for (let i = minSquare; i < maxSquare; i++) {
          grid[i][currentCol].cell.classList.remove("animateParent");
          grid[i][currentCol].cell.classList.add("animatePath");
        }
      }
      current = parent;
    } else {
      current.cell.classList.remove("animatePath");
      disableButton(false);
      clearInterval(intr1);
    }
  }, 200);
}
function thetaAStarSearch(grid, diagonal) {
  console.log("theta");

  disableButton(true);

  startSquarePath.getCell();
  startSquarePath.cell.classList.add("start");
  endSquarePath.getCell();
  endSquarePath.cell.classList.add("end");

  var startingF = heuristic("Manhattan", startSquarePath, endSquarePath);

  var openSet = [];
  var openSetList = [];
  openSet.push([startingF, startSquarePath]);
  console.log("first openset", openSet);
  openSetList.push(startSquarePath);
  console.log("first openset2", openSetList);

  var allG = [[], []];
  var allF = [[], []];
  for (i = 0; i < numOfRows; i++) {
    for (j = 0; j < numOfCols; j++) {
      allG[0].push(grid[i][j]);
      allG[1].push(Infinity);
      allF[0].push(grid[i][j]);
      allF[1].push(Infinity);
    }
  }

  indexStart = allG[0].indexOf(startSquarePath);
  allG[1][indexStart] = 0;

  var cameFrom = [[], []];
  var closed = [];
  current = startSquarePath;
  console.log("current1", current);
  var counter = 50; // timer for settimeout
  cameFrom[0].push(startSquarePath);
  cameFrom[1].push(startSquarePath);

  var intr = setInterval(function () {
    //setInterval loop: while current isnt the end square and openset isnt empty

    console.log("openSet", openSet);
    console.log("eopensetlist", openSetList);
    for (let i = 0; i < cameFrom[1].length; i++) {
      if (cameFrom[1][i].cell.classList.contains("animateSearch")) {
        cameFrom[1][i].cell.classList.remove("animateSearch");
      }
      if (!cameFrom[1][i].cell.classList.contains("animateParent")) {
        cameFrom[1][i].cell.classList.add("animateParent");
      }
    }

    current.findNeighbours(grid, diagonal);
    current.getCell();
    if (current != startSquarePath) {
      current.cell.classList.add("animateSearch");
    }

    for (direction in current.neighbours) {
      var neighbour = current.neighbours[direction];
      console.log(neighbour);
      //debugger;

      if (
        !closed.includes(neighbour) &&
        typeof neighbour !== "undefined" &&
        neighbour.colour !== "black"
      ) {
        if (cameFrom[0].indexOf(neighbour) == -1) {
          cameFrom[0].push(neighbour);
          cameFrom[1].push(null);
        }
        let indexParent = cameFrom[0].indexOf(current);
        let parentOfCurrent = cameFrom[1][indexParent];
        let blocked = lineOfSight(grid, parentOfCurrent, neighbour);
        //debugger;
        console.log(blocked);
        if (!blocked) {
          let parentIndexG = allG[0].indexOf(parentOfCurrent);
          let parentOfCurrentG = allG[1][parentIndexG];
          let distanceParentNeighbour = heuristic(
            "Manhattan",
            parentOfCurrent,
            neighbour
          );
          let totalGScore = parentOfCurrentG + distanceParentNeighbour;

          let indexNeighbourG = allG[0].indexOf(neighbour);
          let oldG = allG[1][indexNeighbourG]; // calculate G

          if (totalGScore < oldG) {
            allG[1][indexNeighbourG] = totalGScore;
            let indexNeighbourCF = cameFrom[0].indexOf(neighbour);
            cameFrom[1][indexNeighbourCF] = parentOfCurrent;

            let tempHeuristic = heuristic(
              "Manhattan",
              neighbour,
              endSquarePath
            );
            let neighbourF = totalGScore + tempHeuristic;
            if (!openSetList.includes(neighbour)) {
              openSet.push([neighbourF, neighbour]);
              openSetList.push(neighbour);
            } else {
              var idx = openSetList.indexOf(neighbour);
              openSet[idx] = [neighbourF, neighbour];
            }
          }
        } else if (blocked) {
          //debugger;
          let indexCurrentG = allG[0].indexOf(current);
          let currentG = allG[1][indexCurrentG]; // calculate G
          console.log(currentG);
          let distanceCurrentNeighbour = heuristic(
            "Manhattan",
            current,
            neighbour
          );
          let totalGScore = currentG + distanceCurrentNeighbour;
          console.log(totalGScore);

          let indexNeighbourG = allG[0].indexOf(neighbour);
          let oldG = allG[1][indexNeighbourG]; // calculate G

          if (totalGScore < oldG) {
            allG[1][indexNeighbourG] = totalGScore;
            let indexNeighbourCF = cameFrom[0].indexOf(neighbour);
            cameFrom[1][indexNeighbourCF] = current;

            let tempHeuristic = heuristic(
              "Manhattan",
              neighbour,
              endSquarePath
            );
            let neighbourF = totalGScore + tempHeuristic;
            if (!openSetList.includes(neighbour)) {
              openSet.push([neighbourF, neighbour]);
              openSetList.push(neighbour);
            } else {
              var idx = openSetList.indexOf(neighbour);
              openSet[idx] = [neighbourF, neighbour];
            }
          }
        }
      }
    }
    closed.push(current);
    var index = openSetList.indexOf(current);
    openSetList.splice(index, 1); //remove current from openset
    openSet.splice(index, 1);
    counter += 50;

    var lowestVal = Infinity;
    for (i = 0; i < openSet.length; i++) {
      if (openSet[i][0] < lowestVal) {
        lowestVal = openSet[i][0];
        current = openSet[i][1];
      }
    }

    if (openSet.length === 0) {
      disableButton(false);

      clearInterval(intr);
    } else if (current === endSquarePath) {
      debugger;
      console.log("find path");
      findPathTheta(cameFrom, current);
      clearInterval(intr);
    }
  }, 10); //end while loop

  if (openSet.length == 0) {
    console.log("No solution found.");
  }
}

function weightedAStarSearch(grid, diagonal) {
  disableButton(true);

  debugger;

  startSquarePath.getCell();
  startSquarePath.cell.classList.add("start");
  endSquarePath.getCell();
  endSquarePath.cell.classList.add("end");

  var startingF = heuristic("Manhattan", startSquarePath, endSquarePath);

  var openSet = [];
  var openSetList = [];
  openSet.push([startingF, startSquarePath]);
  openSetList.push(startSquarePath);

  var allG = [[], []];
  var allF = [[], []];
  for (i = 0; i < numOfRows; i++) {
    for (j = 0; j < numOfCols; j++) {
      allG[0].push(grid[i][j]);
      allG[1].push(Infinity);
      allF[0].push(grid[i][j]);
      allF[1].push(Infinity);
    }
  }
  debugger;
  indexStart = allG[0].indexOf(startSquarePath);
  allG[1][indexStart] = 0;

  var cameFrom = [[], []];
  var closed = [];
  current = startSquarePath;
  console.log("current1", current);
  var counter = 50; // timer for settimeout

  var intr = setInterval(function () {
    debugger;
    console.log("openset", openSet);

    current.findNeighbours(grid, diagonal);
    current.getCell();
    if (current != startSquarePath) {
      current.cell.classList.add("animateSearch");
    }

    for (direction in current.neighbours) {
      var neighbour = current.neighbours[direction];
      debugger;
      if (
        !closed.includes(neighbour) &&
        typeof neighbour !== "undefined" &&
        neighbour.colour !== "black"
      ) {
        var tempH = heuristic("Manhattan", neighbour, endSquarePath); // heuristic as separate function

        var indexG = allG[0].indexOf(current);
        var tempG = allG[1][indexG] + 1;
        var indexNeighbourG = allG[0].indexOf(neighbour);
        var oldG = allG[1][indexNeighbourG]; // calculate G

        if (oldG > tempG) {
          allG[1][indexNeighbourG] = tempG;
        }

        var e = 5;
        var weight = 1 + e - (e * (startingF - tempH)) / startingF;

        var neighbourF = tempH * 2 + allG[1][indexNeighbourG];

        if (!openSetList.includes(neighbour)) {
          openSet.push([neighbourF, neighbour]);
          openSetList.push(neighbour);
        } else if (oldG > tempG) {
          var idx = openSetList.indexOf(neighbour);
          openSet[idx] = [neighbourF, neighbour];
        }

        if (cameFrom[0].indexOf(neighbour) != -1) {
          if (oldG > tempG) {
            var indexCameFrom = cameFrom[0].indexOf(neighbour);
            cameFrom[1][indexCameFrom] = current;
          }
        } else {
          cameFrom[0].push(neighbour);
          cameFrom[1].push(current);
        }
      }
    }
    closed.push(current);
    var index = openSetList.indexOf(current);
    openSetList.splice(index, 1); //remove current from openset
    openSet.splice(index, 1);
    counter += 50;

    var lowestVal = Infinity;
    for (i = 0; i < openSet.length; i++) {
      if (openSet[i][0] < lowestVal) {
        lowestVal = openSet[i][0];
        current = openSet[i][1];
      }
    }

    if (openSet.length === 0) {
      disableButton(false);

      //enter text in target:no solution found
      clearInterval(intr);
    } else if (current === endSquarePath) {
      debugger;
      findPath(cameFrom, current);
      clearInterval(intr);
    }
  }, 10); //end while loop

  if (openSet.length == 0) {
    console.log("No solution found.");
  }
}

function heuristic(name, cell, endSquare) {
  var ans;
  if (name == "Euclidean") {
    ans = Math.sqrt(
      (endSquare.col - cell.col) ** 2 + (endSquare.row - cell.row) ** 2
    );
    return ans;
  }

  if (name == "Manhattan") {
    ans =
      Math.abs(endSquare.col - cell.col) + Math.abs(endSquare.row - cell.row);
  }
  return ans;
}

function findPath(cameFrom, current) {
  var intr1 = setInterval(function () {
    if (current !== startSquarePath) {
      console.log("currentpath", current.row, current.col);
      console.log("camefrom", cameFrom);
      var indexCameFrom = cameFrom[0].indexOf(current);
      current = cameFrom[1][indexCameFrom];
      current.cell.classList.remove("animateSearch");
      current.cell.classList.add("animatePath");
    } else {
      current.cell.classList.remove("animatePath");

      disableButton(false);
      //running = False;
      clearInterval(intr1);
    }
  }, 30);
}

function disableButton(bool) {
  tbl = document.getElementById("myTable");
  if (bool) {
    tbl.classList.add("noClick");
  } else if (!bool) {
    tbl.classList.remove("noClick");
  }

  var obj1 = document.getElementById("button1");
  obj1.disabled = bool;
  var obj1 = document.getElementById("button2");
  obj1.disabled = bool;
  var obj1 = document.getElementById("button3");
  obj1.disabled = bool;
  var obj1 = document.getElementById("button4");
  obj1.disabled = bool;
  var obj1 = document.getElementById("button5");
  obj1.disabled = bool;
  var obj1 = document.getElementById("button6");
  obj1.disabled = bool;
  var obj1 = document.getElementById("button7");
  obj1.disabled = bool;
  var obj1 = document.getElementById("button8");
  obj1.disabled = bool;
  var obj1 = document.getElementById("button9");
  obj1.disabled = bool;
}

function clearBoard(grid, walls) {
  debugger;
  $("#myTable td").each(function () {
    var row = this.parentNode.rowIndex;
    var col = this.cellIndex;
    if (walls == true) {
      if (
        $(this).attr("class") != "startCell" &&
        $(this).attr("class") != "endCell" &&
        grid[row][col].colour != "black" &&
        $(this).is(":parent") == false
      ) {
        $(this).removeClass();
        grid[row][col].colour = "white";
      }
    } else {
      $(this).removeClass();
      grid[row][col].colour = "white";
    }
  });
}

tableCreate();
createSquare(grid);

function main() {
  $(document).ready(function () {
    // to draw walls
    function toggleWall(row, col) {
      console.log("called", square.colour);
      square = grid[row][col];
      if (square.colour == "black") {
        square.colour = "white";
      } else if (square.colour == "white") {
        square.colour = "black";
      }
      console.log("end call", square.colour);
    }

    $(function () {
      console.log("drawing is happening");
      var isMouseDown = false;
      function toggleWall(row, col) {
        console.log("called", square.colour);
        square = grid[row][col];
        if (square.colour == "black") {
          square.colour = "white";
        } else if (square.colour == "white") {
          square.colour = "black";
        }
        console.log("end call", square.colour);
      }

      $("#myTable td")
        .mousedown(function () {
          if (
            $(this).children("#startPath").length == 0 &&
            $(this).children("#endPath").length == 0
          ) {
            isMouseDown = true;
            var row1 = this.parentNode.rowIndex;
            var col1 = this.cellIndex;

            var search = $(this).hasClass("animateSearch");
            var path = $(this).hasClass("animatePath");
            var maze = $(this).hasClass("animateWhiteToBlack");
            var mazePath = $(this).hasClass("animateBlackToWhite");
            var parent = $(this).hasClass("animateParent");

            if (search || path || maze || mazePath || parent) {
              $(this).removeClass();
            }
            if (grid[row1][col1].colour == "black" && maze) {
              $(this).toggleClass("animateDrawWall");
            }

            $(this).toggleClass("animateDrawWall");
            console.log(
              "clicked cell at: " +
                this.cellIndex +
                ", " +
                this.parentNode.rowIndex
            );
            toggleWall(row1, col1);
            console.log("final colour", grid[row1][col1].colour);

            return false; // prevent text selection
          }
        })
        .mouseover(function () {
          if (
            !$(this).children("#startPath").length > 0 &&
            !$(this).children("#endPath").length > 0
          ) {
            if (isMouseDown) {
              var row = this.parentNode.rowIndex;
              var col = this.cellIndex;

              var search1 = $(this).hasClass("animateSearch");
              var path1 = $(this).hasClass("animatePath");
              var maze1 = $(this).hasClass("animateWhiteToBlack");
              var mazePath1 = $(this).hasClass("animateBlackToWhite");
              var parent = $(this).hasClass("animateParent");
              console.log(
                "animatesearch",
                search1,
                "path",
                path1,
                "mazewall",
                maze1,
                "mazePath",
                mazePath1
              );

              if (search1 || path1 || maze1 || mazePath1 || parent) {
                $(this).removeClass();
              }
              if (grid[row][col].colour == "black" && maze1) {
                $(this).toggleClass("animateDrawWall");
              }

              $(this).toggleClass("animateDrawWall");
              console.log(
                "clicked cell at: " +
                  this.cellIndex +
                  ", " +
                  this.parentNode.rowIndex
              );

              toggleWall(row, col);
            }
          }
        });

      $(document).mouseup(function () {
        isMouseDown = false;
      });
    });
  });

  $(document).ready(function () {
    //move S and E
    var dragging = false;
    var selected = null;

    function findSE() {
      $("#myTable td").each(function () {
        //debugger;
        var row = this.parentNode.rowIndex;
        var col = this.cellIndex;
        if ($(this).children("#startPath").length > 0) {
          $(this).removeClass();
          console.log(row, col);

          grid[row][col].getCell();
          grid[row][col].cell.setAttribute("class", "startCell");
          console.log("classliststart", grid[row][col].cell.classList);
          startSquarePath = grid[row][col];
        }
        if ($(this).children("#endPath").length > 0) {
          $(this).removeClass();

          endSquarePath = grid[row][col];
        } else {
          $(this).removeClass("startCell");
          $(this).removeClass("endCell");
        }
      });
    }

    $(document).on("mousedown", ".event", function (event) {
      console.log("mousedown on event");
      selected = $(this);
      start = selected.hasClass("startPath");
      console.log(selected);
      dragging = true;
    });

    $(window).on("mouseup", function (event) {
      console.log("mouseup");
      selected = null;
      dragging = false;
      findSE();
    });

    $("td").on("mouseover", function (event) {
      var cell = $(this);

      if (dragging) {
        var row1 = this.parentNode.rowIndex;
        var col1 = this.cellIndex;
        currentSquare = grid[row1][col1];
        if (currentSquare.colour !== "black") {
          debugger;
          if (
            $(this).children("#endPath").length == 0 &&
            $(this).children("#startPath").length == 0
          ) {
            $(this).append(selected);
          }
        }
      }
    });
  });

  //button mapping
  var pathButtonClicked = false;
  object1 = document.getElementById("button1");
  object2 = document.getElementById("button2");
  object3 = document.getElementById("button3");
  object4 = document.getElementById("button4");
  object5 = document.getElementById("button5");
  object6 = document.getElementById("button6");
  object7 = document.getElementById("button7");
  object8 = document.getElementById("button8");
  object9 = document.getElementById("button9");

  algInfo = "hello";
  object1.onclick = function () {
    clearBoard(grid, false);

    whiteToBlack(grid);
    drawMaze(grid);
    pathButtonClicked = false;
  };
  object2.onclick = function () {
    var algInfo = document.getElementById("algInfo");
    algInfo.innerHTML =
      "<em>A* Search</em><br>Elements are searched by priority given by:<br><em>F(n) = G(n) + H(n)</em><br><em>G(n)</em> - cost to current node<br><em>H(n)</em> - heuristic to end node";
    if (pathButtonClicked == false) {
      aStarSearch(grid, false);
      pathButtonClicked = true;
    } else {
      clearBoard(grid, true);
      aStarSearch(grid, false);
    }
  };
  object3.onclick = function () {
    clearBoard(grid, false);
    pathButtonClicked = false;
  };

  object4.onclick = function () {
    var algInfo = document.getElementById("algInfo");
    algInfo.innerHTML =
      "<em>Breadth First Search</em><br>Starting at the start node, elements at the current depth are searched before progressing to the next depth";
    if (pathButtonClicked == false) {
      breadthFirstSearch(grid, false);
      pathButtonClicked = true;
    } else {
      clearBoard(grid, true);
      breadthFirstSearch(grid, false);
    }
  };
  object5.onclick = function () {
    var algInfo = document.getElementById("algInfo");
    algInfo.innerHTML =
      "<em>Depth First Search</em><br>Starting at the start node, all nodes are searched in the current path until the path is exhausted. The next route is then searched.<br><br>Shortest path not guaranteed.";
    if (pathButtonClicked == false) {
      depthFirstSearch(grid, false);
      pathButtonClicked = true;
    } else {
      clearBoard(grid, true);
      depthFirstSearch(grid, false);
    }
  };
  object6.onclick = function () {
    var algInfo = document.getElementById("algInfo");
    algInfo.innerHTML =
      "<em>Best First Search</em><br>Nodes searched are prioritised according to the heuristic function.<br><br>Shortest path not guaranteed.";
    if (pathButtonClicked == false) {
      greedyBestFirstSearch(grid, false);
      pathButtonClicked = true;
    } else {
      clearBoard(grid, true);
      greedyBestFirstSearch(grid, false);
    }
  };
  object7.onclick = function () {
    var algInfo = document.getElementById("algInfo");
    algInfo.innerHTML =
      "<em>Djikstra's algorithm</em><br>Nodes searched are prioritised according to the current shortest path.";
    if (pathButtonClicked == false) {
      djikstra(grid, false);
      pathButtonClicked = true;
    } else {
      clearBoard(grid, true);
      djikstra(grid, false);
    }
  };
  object8.onclick = function () {
    var algInfo = document.getElementById("algInfo");
    algInfo.innerHTML =
      "<em>Theta* Search</em><br>Elements are searched by priority given by:<br><em>F(n) = G(n) + H(n)</em><br><em>G(n)</em> - cost to current node<br><em>H(n)</em> - heuristic to end node<br><em>G(n)</em> of children nodes within parent's (yellow) line of sight are ignored and replaced with parent <em>G(n)</em>.";
    if (pathButtonClicked == false) {
      debugger;
      thetaAStarSearch(grid, false);
      pathButtonClicked = true;
    } else {
      clearBoard(grid, true);
      thetaAStarSearch(grid, false);
    }
  };
  object9.onclick = function () {
    var algInfo = document.getElementById("algInfo");
    algInfo.innerHTML =
      "<em>Dynamic Weighted A* Search</em><br>Elements are searched by priority given by:<br><em>F(n) = G(n) + W(n)*H(n)</em><br><em>G(n)</em> - cost to current node<br><em>H(n)</em> - heuristic to end node<br>W(n) - weight which decreases with node depth<br><br>Shortest path not guaranteed.";
    if (pathButtonClicked == false) {
      debugger;
      weightedAStarSearch(grid, false);
      pathButtonClicked = true;
    } else {
      clearBoard(grid, true);
      weightedAStarSearch(grid, false);
    }
  };
}

main();

/*
- e getting path animation
*/
