'use strict'


// TODO:
// 1. Change the levels funcs to be less hard-coded
// 2. Fix lose if has 1 life but didn't marked all the mines (Improve line 393)

const MINE = '💣';
const FLAG = `🚩`;
const LIVE = '❤️';
var gBoard; // Contains  the Model
var gPrevLevel = 1;
var emptyCells = [];
var gLevel = { // Should be changed after dev progress
    SIZE: 4,
    MINES: 2
};
var gGameInterval = 0;
var gGame = { // Contains the game curr-state
    isOn: false,
    isWin: false,
    isHint: false,
    lives: 3,
    hints: 10,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
};
var currShowedNegs = [];
var gClickCount = 0;
var gMines = [];
var gLevels = [];


function initGame(num = 1) {
    gGame.isOn = true
    gLevels = createLevels(3);
    changeLevel(num);
    gBoard = buildBoard(gLevel.SIZE);
    renderBoard(gBoard, '.board-container');
    renderLivesCounter();
    renderMarkedCounter();
    renderHints();
    showScore();
};


function changeLevel(num) {
    gLevel = gLevels[num - 1]
}
// user choosing from input which difficult level wanted
function chooseLevel() {
    document.getElementById('level-choice').addEventListener('change', function () {
        if (document.getElementById('easy').checked) {
            resetGame(1)
            gPrevLevel = 1
        }
        if (document.getElementById('hard').checked) {
            resetGame(2)
            gPrevLevel = 2
        }
        if (document.getElementById('extreme').checked) {
            resetGame(3)
            gPrevLevel = 3
        }
    })
}

function renderHints() {
    var elHintsCount = document.querySelector('.hint-count')
    elHintsCount.innerText = gGame.hints + '/3'
}

function hideScore() {
    document.querySelector('.best-score').innerHTML = ''
}

function resetGame(num = 1) {
    hideHint()
    stopCount()
    gMines = [];
    gBoard = '';
    gClickCount = 0;
    gGameInterval = 0;
    gGame = {
        isOn: false,
        isWin: false,
        isHint: false,
        lives: 3,
        hints: 10,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
    };
    initGame(num);
    var smiley = document.querySelector('.smiley');
    smiley.innerHTML = '😊';
    document.querySelector(".timer").innerHTML = 0.00
}

function createLevels(num) {
    var res = []
    for (var i = 1; i <= num; i++) {
        var size = 0;
        var mines = 0;
        if (i === 1) {
            size = 4;
            mines = 2;
            res.push({ SIZE: size, MINES: mines })
        }
        if (i === 2) {
            size = 8;
            mines = 12;
            res.push({ SIZE: size, MINES: mines })
        }
        if (i === 3) {
            size = 12;
            mines = 30; // Temp for a recursion test
            res.push({ SIZE: size, MINES: mines })
        }
    }
    return res;
}



function showMines() {
    for (var i = 0; i < gMines.length; i++) {
        var minePosI = gMines[i].i
        var minePosJ = gMines[i].j
        var pos = { i: minePosI, j: minePosJ }
        renderMinesByData(pos, MINE)
        // renderCellByData(pos, MINE)
        revealCellsByData(pos)
    }
}


function showNegs(mat, cellPos) {
    currShowedNegs = []
    var rowIdx = cellPos.i;
    var colIdx = cellPos.j;
    var cellCountContent;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > mat.length - 1) continue;
            if (mat[i][j].isShown) continue;
            if (mat[i][j].isMarked) continue;
            var negsPos = { i, j }
            cellCountContent = '';
            if (!gGame.isHint) gBoard[i][j].isShown = true;
            if (mat[i][j].minesAroundCount) {
                cellCountContent = mat[i][j].minesAroundCount;
            }
            if (mat[i][j].isMine) {
                cellCountContent = MINE
            }
            // Update DOM
            renderCellByData(negsPos, cellCountContent);
            revealCellsByData(negsPos);
            currShowedNegs.push(negsPos);
            if (mat[i][j].minesAroundCount === 0 && mat[i][j].isMine === false) {
                showNegs(gBoard, negsPos)
            }
        }
    }
}

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

function showNegsHint(mat, cellPos) {
    currShowedNegs = []
    var rowIdx = cellPos.i;
    var colIdx = cellPos.j;
    var cellCountContent;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > mat.length - 1) continue;
            if (mat[i][j].isShown) continue;
            if (mat[i][j].isMarked) continue;
            var negsPos = { i, j }
            cellCountContent = '';
            if (mat[i][j].minesAroundCount) {
                cellCountContent = mat[i][j].minesAroundCount;
            }
            if (mat[i][j].isMine) {
                cellCountContent = MINE
            }
            // Update DOM
            renderCellByData(negsPos, cellCountContent);
            revealCellsByData(negsPos);
            currShowedNegs.push(negsPos);
        }
    }
}

function countShownCells(board = gBoard) {
    var count = 0;
    for (var i = 0; i < board.length; i++) {
        var currRow = board[i];
        for (var j = 0; j < board.length; j++) {
            if (board[i][j].isShown) count++
        }
    }
    return count
}

function activateSafeClick() {
    // if (gGame.sclicks === 0 || !gGame.isOn) return;
    var elSclick = document.querySelector('.sclick')
    // gGame.isHint = true
    gGame.sclicks--
    var elHintsCount = document.querySelector('.sclick-count')
    elHintsCount.innerText = gGame.sclicks + '/3'
    showRandomEmptyCell()
}

function showRandomEmptyCell() {
    getEmptyCells(gBoard)
    var randNum1 = getRandomIntInclusive(0,emptyCells.length)
    var emptyCellPos = emptyCells[randNum1]
    var elCell = document.querySelector(`[data-id="${emptyCellPos.i}-${emptyCellPos.j}"]`);
    elCell.classList.add('random-empty-cell')
    // console.log();
    // setTimeout(function(){

    // }, timeout);
}

function getEmptyCells(board = gBoard) {
    var emptyCellPos = {i,j}
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (!gBoard[i][j].isMine) continue;
            emptyCellPos = {i,j};
            emptyCells.push(emptyCellPos);
        }
    }
}


function checkWin() {
    console.log('gGame.markedCount', gGame.markedCount);
    console.log('countShownCells(gBoard)', countShownCells(gBoard));
    if (gGame.markedCount === gLevel.MINES && countShownCells(gBoard) === gLevel.SIZE * gLevel.SIZE - gLevel.MINES) {
        gGame.isWin = true;
        var bestScore = +localStorage.getItem(gLevel.SIZE);
        if (gGame.secsPassed < bestScore || bestScore === 0) {
            localStorage.setItem(gLevel.SIZE, gGame.secsPassed);
        }
        winMsg();
    }
}

function stopGame() {
    stopCount();
    gGame.isOn = false;

}

function handleLose() {
    stopGame();
    showMines();
    var elMsgs = document.querySelector('.smiley');
    elMsgs.innerHTML = '🤯';
}

function buildBoard(num) {
    var board = [];
    for (var i = 0; i < num; i++) {
        board[i] = [];
        for (var j = 0; j < num; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };
            board[i][j] = cell;
        }
    }
    return board;

}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        var currRow = board[i];
        for (var j = 0; j < board.length; j++) {
            var currCell = currRow[j];
            var currPos = { i, j };
            var currCellCount = countMinesNegs(board, currPos);
            currCell.minesAroundCount = currCellCount;
        }
    }
};


function createMines(board, num, firstCellClicked) {
    if (gMines[0]) return;
    for (var i = 0; i < num; i++) {
        var mine = {}
        var randNum1 = getRandomIntInclusive(0, board.length - 1);
        var randNum2 = getRandomIntInclusive(0, board.length - 1);
        if (firstCellClicked === board[randNum1][randNum2]) {
            i--
            continue;
        }
        mine.i = randNum1;
        mine.j = randNum2;
        if (isObjectInside(mine, gMines)) {
            i--
            continue;
        }
        board[randNum1][randNum2].isMine = true;
        gMines.push(mine);
    }
}

function isObjectInside(object, arr) {
    var found = false;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].i == object.i && arr[i].j == object.j) {
            found = true;
            break;
        }
    }
    return found
}

function countMinesNegs(mat, pos) {
    var count = 0;
    var rowIdx = pos.i;
    var colIdx = pos.j;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx ||
                (j < 0 || j > mat.length - 1)) continue;
            var cell = mat[i][j];
            if (cell.isMine === true) count++;
        }
    }
    return count
}

function renderLivesCounter() {
    var elLivesCounter = document.querySelector('.lives-count');
    var HTMLstr = '';
    for (var i = 0; i < gGame.lives; i++) {
        HTMLstr += LIVE
    }
    elLivesCounter.innerText = HTMLstr
}
function renderMarkedCounter() {
    var elMarkedCounter = document.querySelector('.marked-counter');
    elMarkedCounter.innerText = gLevel.SIZE * gLevel.SIZE - gGame.markedCount
}
function hideHint() {
    // Update Model
    gGame.isHint = false
    // Update DOM
    var elHint = document.querySelector('.hint')
    elHint.classList.remove('hint-clicked')
}

function activateHint(board = gBoard, cellPos) {
    if (gGame.hints === 0 || !gGame.isOn) return;
    var elHint = document.querySelector('.hint')
    elHint.classList.add('hint-clicked')
    gGame.isHint = true
    gGame.hints--
    var elHintsCount = document.querySelector('.hint-count')
    elHintsCount.innerText = gGame.hints + '/3'
}

function showHint(board, pos) {
    showNegsHint(board, pos)
    setTimeout(function () {
        hideNegs(board, pos)
        hideHint();
    }, 1000);
}

function hideNegs() {
    for (var i = 0; i < currShowedNegs.length; i++) {
        var currNeg = currShowedNegs[i];
        renderCellByData(currNeg, '');
        unrevealCellsByData(currNeg);
    }
}

function cellClicked(elCell, i = Nan, j = NaN) {
    var pos = { i, j }
    if (!gGame.isOn) return;
    if (gGame.isHint) {
        addTimer()
        createMines(gBoard, gLevel.MINES, gBoard[i][j])
        setMinesNegsCount(gBoard)
        showHint(gBoard, pos);
        hideHint()
        return;
    }
    if (!gClickCount) {
        addTimer()
        createMines(gBoard, gLevel.MINES, gBoard[i][j])
        setMinesNegsCount(gBoard)
    }
    if (gBoard[i][j].isMarked) return;
    if (gBoard[i][j].isShown) return;
    if (gBoard[i][j].minesAroundCount > 0 && gBoard[i][j].isMine !== true) {
        // Update Model
        gBoard[i][j].isShown = true;
        // Update DOM
        elCell.innerText = gBoard[i][j].minesAroundCount;
        elCell.classList.remove('unrevealed');
        gClickCount++
        checkWin();
        return;
    }
    if (gBoard[i][j].isMine) {
        // Update Model
        gGame.lives--
        // Update DOM
        if (gGame.lives === 0) handleLose()
        elCell.innerHTML = MINE;
        elCell.classList.add('clicked-mine');
        gBoard[i][j].isShown = true;
        renderLivesCounter()
    }
    if (gBoard[i][j].minesAroundCount === 0 && gBoard[i][j].isMine === false) {
        showNegs(gBoard, pos)
        elCell.classList.remove('unrevealed')
        checkWin()
        gClickCount++
        return;
    }
    // Update Model
    gBoard[i][j].isShown = true;
    // Update DOM
    gClickCount++
    gGame.shownCount++
    elCell.classList.remove('unrevealed')
    checkWin()
    if (countShownCells(gBoard) === gBoard.length * gBoard.length) handleLose()
};


function rightClicked(elTdRightClicked, i, j) {
    document.addEventListener('contextmenu', event => event.preventDefault());
    if (!gGame.isOn) return;
    if (gBoard[i][j].isShown) return
    if (gBoard[i][j].isMarked) {
        // Update Model
        gGame.markedCount--
        gBoard[i][j].isMarked = false;
        // Update DOM
        elTdRightClicked.innerText = '';
        renderMarkedCounter()
        return
    }
    // Update Model
    gGame.markedCount++
    gBoard[i][j].isMarked = true;
    // Update DOM
    elTdRightClicked.innerText = FLAG;
    checkWin()
    renderMarkedCounter()
}
function addTimer() {
    if (gGameInterval) return
    var startTime = Date.now();
    gGameInterval = setInterval(function () {
        var timer = Date.now() - startTime;
        gGame.secsPassed = (timer / 1000).toFixed(3);
        document.querySelector(".timer").innerHTML = gGame.secsPassed
    }, 160);
}

function winMsg() {
    stopCount();
    showScore();
    var elsmiley = document.querySelector('.smiley');
    elsmiley.innerHTML = '😎'
}

function showScore() {
    if (gGame.isWin) {
        // Show Curr-Score
        document.querySelector('.curr-score').innerHTML = `Current Score: ${Math.floor(gGame.secsPassed)}s `
    }
    // Show Easy Best Score
    if (gLevel.SIZE === 4) {
        document.querySelector('.best-score').innerHTML = 'Best Score: ' + Math.floor(localStorage.getItem(gLevel.SIZE)) +
            's ';
        return;
    }
    hideScore()
    // Show Easy Best Score
    if (gLevel.SIZE === 8) {
        document.querySelector('.best-score').innerHTML = 'Best Score: ' + Math.floor(localStorage.getItem(gLevel.SIZE)) +
            's ';
        return;
    }
    // Show Easy Best Score
    if (gLevel.SIZE === 12) {
        document.querySelector('.best-score').innerHTML = 'Best Score: ' + Math.floor(localStorage.getItem(gLevel.SIZE)) +
            's ';
        return;
    }
}

function stopCount() {
    clearInterval(gGameInterval);
}