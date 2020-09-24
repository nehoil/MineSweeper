'use strict'


// TODO:
// 1. change the levels funcs to be less hard-coded
// 2. Save Prev gLevel so if user lot/win game in other level then 1, he can play again on the same level.
// 3. Turn Win/Lose Messages to the smiley icon
const MINE = '<img src="img/mine.png" class="mine-img">'
const FLAG = `🚩`
var gBoard; // Contains  the Model
var gPrevLevel = 0;
var gLevel = { // Should be changed after dev progress
    SIZE: 4,
    MINES: 2
};
var gGameInterval = 0;
var gGame = { // Contains the game curr-state
    isOn: false,
    isWin: false,
    lives: 3,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
};
var gClickCount;
var gMines = [];
var gLevels = []


function initGame(num = 1) {
    gGame.isOn = true
    gLevels = createLevels(3);
    changeLevel(num)
    gBoard = buildBoard(gLevel.SIZE);
    createMines(gBoard, gLevel.MINES)
    setMinesNegsCount(gBoard)
    renderBoard(gBoard, '.board-container')
    renderLivesCounter()
    renderMarkedCounter()
};


function changeLevel(num) {
    gLevel = gLevels[num - 1]
}
// user choosing from input which difficult level he wants
function chooseLevel() {
    document.getElementById('level-choice').addEventListener('change', function () {
        if (document.getElementById('easy').checked) {
            resetGame(1)
        }
        if (document.getElementById('hard').checked) {
            resetGame(2)
        }
        if (document.getElementById('extreme').checked) {
            resetGame(3)
        }
    })
}

function resetGame(num = 1) {
    stopCount()
    gBoard = ''
    gGameInterval = 0;
    gGame = {
        isOn: false,
        isWin: false,
        lives: 3,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
    };
    initGame(num)
    var smiley = document.querySelector('.smiley');
    smiley.innerHTML = '😊'
}

function createLevels(num) {
    var res = []
    for (var i = 1; i <= num; i++) {
        var size = 0;
        var mines = 0;
        if (i === 1) {
            size = 4;
            mines = 1;
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
        renderCellByData(pos, MINE)
        revealCellsByData(pos)
    }
}

// function showNegs(pos, board) {
//     var negPosI = pos.i;
//     var negPosJ = pos.j;
//     for (var i = 0; i < gBoard.length; i++) {
//         var cellCountContent;
//         var negPosI = gMines[i].i
//         var negPosJ = gMines[i].j
//         var pos = { i: negPosI, j: negPosJ }
//         renderCellByData(pos,)
//         revealCellsByData(pos)
//     }
// }

function showNegs(mat, cellPos) {
    var rowIdx = cellPos.i;
    var colIdx = cellPos.j;
    var cellCountContent;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx || (j < 0 || j > mat.length - 1)) continue;
            if (mat[i][j].isMine){
                mat[i][j].isShown = true;
                continue;
            }  
            cellCountContent = mat[i][j].minesAroundCount;
            // var cell = mat[i][j];
            var negsPos = { i, j }
            // if (!mat[i][j].minesAroundCount) cellCountContent = '';
            if (!mat[i][j].minesAroundCount){
                cellCountContent = '';
                // showNegs(gBoard, mat[i][j])
            } 
            // Update Model
            gGame.shownCount++
            mat[i][j].isShown = true;
            // Update DOM
            renderCellByData(negsPos, cellCountContent)
            revealCellsByData(negsPos)
        }
    }
}

function countShownCells(board=gBoard){
    var count = 0;
    for (var i = 0; i < board.length; i++) {
        var currRow = board[i];
        for (var j = 0; j < board.length; j++) {
            if (board[i][j].isShown) count++
        }
    }
    return count
}


function checkWin() {
    console.log('gGame.shownCount', gGame.shownCount);
    // check if win by checking if enough cells was marked (IF MARKED-COUNT = MINES) and enough cells was revelead. (SIZE * SIZE - MINES)
    if (gGame.markedCount === gLevel.MINES && gGame.shownCount === gLevel.SIZE * gLevel.SIZE - gLevel.MINES) {
        console.log('won!');
        gGame.isWin = true
        winMsg();
    }
}

function stopGame() {
    stopCount()
    gGame.isOn = false;

}

function handleLose() {
    stopGame()
    showMines()
    var elMsgs = document.querySelector('.smiley')
    elMsgs.innerHTML = '🤯'
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
    // board[0][1].isMine = true;
    // board[0][2].isMine = true;
    // console.table(board);
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

function createMines(board, num) {
    for (var i = 0; i < num; i++) {
        var mine = {}
        var randNum1 = getRandomIntInclusive(0, board.length - 1);
        var randNum2 = getRandomIntInclusive(0, board.length - 1);
        board[randNum1][randNum2].isMine = true;
        mine.i = randNum1;
        mine.j = randNum2;
        gMines.push(mine)
    }
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
    elLivesCounter.innerText = gGame.lives
}
function renderMarkedCounter() {
    var elMarkedCounter = document.querySelector('.marked-counter');
    elMarkedCounter.innerText = gLevel.SIZE * gLevel.SIZE - gGame.markedCount
}

function cellClicked(elCell, i = Nan, j = NaN) {
    if (!gGame.isOn) return;
    if (!gClickCount) addTimer()
    if (gBoard[i][j].isMarked) return;
    if (gBoard[i][j].isShown) return;
    var pos = { i, j }
    // gClickCount++
    if (gBoard[i][j].minesAroundCount > 0 && gBoard[i][j].isMine !== true) {
        // Update Model
        // gClickCount++
        gBoard[i][j].isShown = true;
        // gGame.shownCount++
        // Update DOM
        elCell.innerText = gBoard[i][j].minesAroundCount
        elCell.classList.remove('unrevealed')
    }
    if (gBoard[i][j].isMine) {
        // Update Model
        gGame.lives--
        // gGame.shownCount++
        gBoard[i][j].isShown = true;
        // Update DOM
        // gGame.shownCount++
        elCell.innerHTML = MINE
        elCell.classList.add('clicked-mine')
        var elLivesCount = document.querySelector('.lives-count')
        elLivesCount.innerHTML = gGame.lives
        if (gGame.lives === 0) handleLose()
        // elCell.classList.remove('unrevealed')
    }
    if (gBoard[i][j].minesAroundCount === 0 && gBoard[i][j].isMine === false) {
        showNegs(gBoard, pos)
        elCell.classList.remove('unrevealed')
        checkWin()
        return;
    }
    // Update Model
    gBoard[i][j].isShown = true;
    // showNegs(gBoard, pos)
    // Update DOM

    gGame.shownCount++
    elCell.classList.remove('unrevealed')
    checkWin()
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
        // console.log(gGame.secsPassed);
        document.querySelector(".timer").innerHTML = gGame.secsPassed
    }, 160);
}

function winMsg() {
    stopCount()
    var elsmiley = document.querySelector('.smiley');
    elsmiley.innerHTML = '😎'
}

function stopCount() {
    clearInterval(gGameInterval);
}


function cellMarked(elCell) {

};
function checkGameOver() {

};
function expandShown(board, elCell, i, j) {

};