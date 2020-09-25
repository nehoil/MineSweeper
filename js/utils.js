function renderBoard(mat, selector) {
  var strHTML = '<table border="1"><tbody>';
  for (var i = 0; i < mat.length; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < mat[0].length; j++) {
      var cell = '';
      var className = `cell ${i}-${j} unrevealed`;
      var dataId = `${i}-${j}`;
      var oncontextmenu = `oncontextmenu="rightClicked(this,${i},${j})"`
      var onClick = `onclick="cellClicked(this,${i},${j})"`;
      if (mat[i][j].isShown) cell = ' ';
      if (mat[i][j].isMine) cell = MINE;
      if (mat[i][j].minesAroundCount && mat[i][j].isMine !== true) cell += mat[i][j].minesAroundCount;
      if (!mat[i][j].isShown) {
        cell = ``;
        // className = `cell cell ${i}-${j} unrevealed`;
      }
      strHTML += `<td class="${className}" data-id="${dataId}" ${onClick} ${oncontextmenu}>${cell}</td>`
    }
    strHTML += '</tr>'
  }
  strHTML += '</tbody></table>';
  var elContainer = document.querySelector(selector);
  elContainer.innerHTML = strHTML;
  // console.log(strHTML);
}



// location such as: {i: 2, j: 7}
function renderCellByData(location, value) {
  // Select the elCell and set the value
  var elCell = document.querySelector(`[data-id="${location.i}-${location.j}"]`);
  // var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
  elCell.innerHTML = value;
}


function renderMinesByData(location, value) {
  var elCell = document.querySelector(`[data-id="${location.i}-${location.j}"]`);
  elCell.innerHTML = value;
}


function revealCellsByData(location) {
  // Select the elCell and set the value
  var elCell = document.querySelector(`[data-id="${location.i}-${location.j}"]`);
  elCell.classList.remove('unrevealed');
}
function revealCellsByDataToggle(location) {
  // Select the elCell and set the value
  var elCell = document.querySelector(`[data-id="${location.i}-${location.j}"]`);
  elCell.classList.toggle('unrevealed');
}

function unrevealCellsByData(location) {
  // Select the elCell and set the value
  var elCell = document.querySelector(`[data-id="${location.i}-${location.j}"]`);
  elCell.classList.add('unrevealed');
}


// location such as: {i: 2, j: 7}
function renderCell(location, value) {
  // Select the elCell and set the value
  var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
  elCell.innerHTML = value;
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function countNeighbors(cellI, cellJ, mat) {
  var neighborsSum = 0;
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= mat.length) continue;
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j >= mat[i].length) continue;
      if (i === cellI && j === cellJ) continue;
      if (mat[i][j] === LIFE || mat[i][j] === SUPER_LIFE) neighborsSum++;
    }
  }
  return neighborsSum;
}

function shallowEqual(object1, object2) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (object1[key] !== object2[key]) {
      return false;
    }
  }

  return true;
}

// function hasDuplicates(arr)
// {
// 	return new Set(arr).size !== arr.length; 
// }

// var arr = [ 2, 4, 6, 5, 4 ];

// if (hasDuplicates(arr)) {
// 	console.log("Duplicate elements found.");
// }
// else {
// 	console.log("No Duplicates found.");
// }


// Backup of ShowNegs

// function showNegs(mat, cellPos) {
//     currShowedNegs = []
//     var rowIdx = cellPos.i;
//     var colIdx = cellPos.j;
//     var cellCountContent;
//     for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
//         if (i < 0 || i > mat.length - 1) continue;
//         for (var j = colIdx - 1; j <= colIdx + 1; j++) {
//             if (j < 0 || j > mat.length - 1) continue;
//             if (mat[i][j].isShown) continue;
//             if (mat[i][j].isMarked) continue;
//             var negsPos = { i, j }
//             cellCountContent = '';
//             if (!gGame.isHint) gBoard[i][j].isShown = true;
//             if (mat[i][j].minesAroundCount) {
//                 cellCountContent = mat[i][j].minesAroundCount;
//             }
//             if (mat[i][j].isMine) {
//                 cellCountContent = MINE
//             }
//             // Update DOM
//             renderCellByData(negsPos, cellCountContent);
//             revealCellsByData(negsPos);
//             currShowedNegs.push(negsPos);
//         }
//     }
// }
