'use strict'


// TODO:
// 1. Check why lose message shown after win message was dispaly and another game was played

const MINE = '💣'
const FLAG = `🚩`
var gBoard; // Contains  the Model
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


function initGame() {
    gGame.isOn = true
    gBoard = buildBoard();
    setMinesNegsCount(gBoard)
    renderBoard(gBoard, '.board-container')
    renderLivesCounter()
    renderMarkedCounter()
};

function resetGame() {
    stopCount()
    gBoard = ''
    gGameInterval = 0;
    gGame = { // Contains the game curr-state
        isOn: false,
        isWin: false,
        lives: 3,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
    };
    initGame()
    var elMsgs = document.querySelector('.messages');
    elMsgs.classList.add('hide')
    var elGameOverMsg = document.querySelector('.game-over')
    elGameOverMsg.classList.remove('hide')
    var elWinningMsg= document.querySelector('.win')
    elWinningMsg.classList.remove('hide')
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

function checkWin() {
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
    var elMsgs = document.querySelector('.messages')
    elMsgs.classList.remove('hide')
    var elGameOverMsg = document.querySelector('.game-over')
    elGameOverMsg.classList.remove('hide')
}

function buildBoard() {
    var board = [];
    for (var i = 0; i < 4; i++) {
        board[i] = [];
        for (var j = 0; j < 4; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };
            board[i][j] = cell;
        }
    }
    board[0][1].isMine = true;
    board[0][2].isMine = true;
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
    // var pos = {i,j}
    gClickCount++
    if (gBoard[i][j].minesAroundCount > 0 && gBoard[i][j].isMine !== true) {
        // Update Model
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
        elCell.innerText = MINE
        elCell.classList.add('clicked-mine')
        handleLose()
        // elCell.classList.remove('unrevealed')
    }
    // Update Model
    gBoard[i][j].isShown = true;
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
    var elWinningMsg = document.querySelector('.win');
    var elMsgs = document.querySelector('.messages');
    elMsgs.classList.remove('hide')
    elWinningMsg.classList.remove('hide')
}

function stopCount() {
    clearInterval(gGameInterval);
    console.log('works!!');
}


function cellMarked(elCell) {

};
function checkGameOver() {

};
function expandShown(board, elCell, i, j) {

};