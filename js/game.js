'use strict'


// TODO:
// 1. Change the levels funcs to be less hard-coded
// 3. Decide if to start game timer after 1st cell is marked. (can win the game);
// 3. Decide - if level one - all mines has been shown, so player can't win?
// 4. Change timer to 00:00 from 0.00
// 5. Change Levels input to be btns

const MINE = '💣';
const FLAG = '🚩';
const LIVE = '❤️';
const mementos = [] // save all moves player made.
var gBoard; // Contains  the Model
var gGameInterval = 0;
var gPrevLevel = 1;
var gEmptyCells = [];
var currShowedNegs = [];
var gClickCount = 0;
var gLevels = [];
var gMines = [];
var gMarked;
var gLevel = { // Should be changed after dev progress
    SIZE: 4,
    MINES: 2
};
var gGame = { // Contains the game curr-state
    isOn: false,
    isWin: false,
    isHint: false,
    isSelfPositioned: false,
    lives: 3,
    hints: 3,
    sClicks: 3,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
};

function initGame(num = 1) {
    gGame.isOn = true
    gLevels = createLevels(3);
    changeLevel(num);
    gBoard = buildBoard(gLevel.SIZE);
    renderBoard(gBoard, '.board-container');
    renderLivesCounter();
    renderMarkedCounter();
    renderHints();
    renderSclickCounter();
    renderMinesCounter();
    showScore();
};

function undo() {
    const lastMemento = mementos.pop()
    if (!lastMemento) return;
    gBoard = lastMemento.board;
    gLevel = lastMemento.level;
    gMines = lastMemento.mines;
    gGame = lastMemento.gameState;
    renderBoard(gBoard, '.board-container');
    renderLivesCounter();
    renderMarkedCounter();
    renderHints();
    renderSclickCounter();
    renderMinesCounter();
    showScore();
    stopCount();
    showCellsByModel(gBoard);
    renderSmiley();
}


function saveMemento(board, mines, gameState, level) {
    var currState = {
        board: JSON.parse(JSON.stringify(board)),
        mines: JSON.parse(JSON.stringify(mines)),
        gameState: JSON.parse(JSON.stringify(gameState)),
        level: JSON.parse(JSON.stringify(level))
    }
    mementos.push(currState);
}

function getMarkedCells(board = gBoard) {
    var markeds = [];
    for (var i = 0; i < board.length; i++) {
        var currRow = board[i];
        for (var j = 0; j < currRow.length; j++) {
            var pos = { i, j }
            var currCell = currRow[j];
            if (currCell.isMarked) {
                // console.log(pos);
                markeds.push(pos)
            }
        }
    }
    return markeds
}

function changeLevel(num) {
    gLevel = gLevels[num - 1]
}
// user choosing from input which difficult level wanted
// function chooseLevel() {
//     document.getElementById('level-choice').addEventListener('change', function () {
//         if (document.getElementById('easy').checked) {
//             resetGame(1)
//             gPrevLevel = 1
//         }
//         if (document.getElementById('hard').checked) {
//             resetGame(2)
//             gPrevLevel = 2
//         }
//         if (document.getElementById('extreme').checked) {
//             resetGame(3)
//             gPrevLevel = 3
//         }
//     })
// }
function chooseLevel(num) {
    if (num === 1) {
        resetGame(1)
        gPrevLevel = 1;
        return;
    }
    if (num === 2) {
        resetGame(2);
        gPrevLevel = 2;
        return;
    };
    if (num === 3) {
        resetGame(3);
        gPrevLevel = 3;
        return;
    };
}

function renderHints() {
    var elHintsCount = document.querySelector('.hint-count')
    elHintsCount.innerText = gGame.hints + '/3'
}

function hideScore() {
    // console.log('hiding score');
    document.querySelector('.best-score').innerHTML = '';
    document.querySelector('.curr-score').innerHTML = '';
}

function resetGame(num = 1) {
    hideHint();
    stopCount();
    hideScore();
    gMines = [];
    gBoard = '';
    gClickCount = 0;
    gGameInterval = 0;
    gGame = {
        isOn: false,
        isWin: false,
        isHint: false,
        isSelfPositioned: false,
        lives: 3,
        hints: 3,
        sClicks: 3,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
    };
    initGame(num);
    var smiley = document.querySelector('.smiley');
    smiley.innerHTML = '😊';
    document.querySelector(".timer").innerHTML = 0.00
}

function renderSmiley() {
    var smiley = document.querySelector('.smiley');
    if (gGame.isOn) smiley.innerHTML = '😊';
    if (gGame.isWin) smiley.innerHTML = '😎';
}

function mouseDown() {
    if (!gGame.isOn) return;
    var smiley = document.querySelector('.smiley');
    smiley.innerHTML = '😮';
}
function mouseUp() {
    if (!gGame.isOn) return;
    var smiley = document.querySelector('.smiley');
    smiley.innerHTML = '😊';
}


function activateSelfMode(board = gBoard) {
    saveMemento(gBoard, gMines, gGame, gLevel);
    resetGame(gPrevLevel)
    document.querySelector('table').classList.add('bomb-cursor')
    // if (condition) {
    // }
    gGame.isSelfPositioned = true;
    // var mineCount = gLevel.MINES;
    showCellsToggle()
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

function countShownMines() {
    var count = 0;
    for (var i = 0; i < gMines.length; i++) {
        var minePosI = gMines[i].i
        var minePosJ = gMines[i].j
        if (gBoard[minePosI][minePosJ].isShown) count++;
    }
    return count;
}

function showMines() {
    for (var i = 0; i < gMines.length; i++) {
        var minePosI = gMines[i].i
        var minePosJ = gMines[i].j
        var pos = { i: minePosI, j: minePosJ };
        renderMinesByData(pos, MINE);
        // renderCellByData(pos, MINE)
        revealCellsByData(pos);
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
                var currCellCount = mat[i][j].minesAroundCount;
                cellCountContent = convertNumToColorStr(currCellCount);
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

function showCellsToggle(mat = gBoard) { // show or hide all cells
    var cellCountContent;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var cellPos = { i, j }
            revealCellsByDataToggle(cellPos);
            cellCountContent = ''; // can be change in the future to allow other sort of cells to appear
            renderCellByData(cellPos, cellCountContent);
        }
    }
}

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
                var currCellCount = mat[i][j].minesAroundCount;
                cellCountContent = convertNumToColorStr(currCellCount);
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
    if (!gGame.sClicks || !gGame.isOn) return;
    saveMemento(gBoard, gMines, gGame, gLevel);
    gGame.sClicks--
    showRandomEmptyCell()
    renderSclickCounter()
}

function makeSclickClickable() {
    document.querySelector('.sclick').classList.remove('unclickable')
}

function showRandomEmptyCell() {
    getEmptyCells(gBoard);
    var randNum = getRandomIntInclusive(0, gEmptyCells.length);
    var emptyCellPos = gEmptyCells[randNum];
    var elCell = document.querySelector(`[data-id="${emptyCellPos.i}-${emptyCellPos.j}"]`);
    var elSclick = document.querySelector('.sclick')
    elCell.classList.toggle('borderBlink');
    elSclick.classList.toggle('brighter');
    setTimeout(function () {
        elSclick.classList.toggle('brighter');
        elCell.classList.toggle('borderBlink');
    }, 2000);
}



function getEmptyCells(board = gBoard) {
    gEmptyCells = [];
    var emptyCellPos = { i, j }
    for (var i = 0; i < gBoard.length; i++) {
        var currRow = gBoard[i]
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = currRow[j]
            // console.log('works', currCell);
            if (gBoard[i][j].isMine) continue;
            if (gBoard[i][j].isShown) continue;
            emptyCellPos = { i, j };
            gEmptyCells.push(emptyCellPos);
        }
    }
    // console.log('gemptycells', gEmptyCells);
}


function checkWin() {
    // console.log('gGame.markedCount', gGame.markedCount);
    // console.log('countShownCells(gBoard)', countShownCells(gBoard));
    if (gGame.markedCount === gLevel.MINES && countShownCells(gBoard) === gLevel.SIZE * gLevel.SIZE - gLevel.MINES) {
        if (countShownMines() === gLevel.MINES) {
            handleLose();
            return
        } gGame.isWin = true;
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

function renderSclickCounter() {
    document.querySelector('.sclick-count').innerText = gGame.sClicks + '/3'
}

function renderLivesCounter() {
    var elLivesCounter = document.querySelector('.lives-count');
    var HTMLstr = '';
    for (var i = 0; i < gGame.lives; i++) {
        HTMLstr += LIVE
    }
    elLivesCounter.innerText = HTMLstr
}

function renderMinesCounter() {
    var elMarkedCounter = document.querySelector('.mines-counter');
    elMarkedCounter.innerText = gLevel.MINES
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
    saveMemento(gBoard, gMines, gGame, gLevel);
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

function placeMine(cell, pos) {
    // Upate Model
    if (gMines.length === gLevel.MINES) return;
    gMines.push(pos);
    gBoard[pos.i][pos.j].isMine = true;
    // Upate DOM
    renderCellByData(pos, MINE);
    if (gMines.length === gLevel.MINES) {
        document.querySelector('.done-msg').classList.toggle('hide');
        document.querySelector('table').classList.remove('bomb-cursor')
        setTimeout(function () {
            showCellsToggle();
            gGame.isSelfPositioned = false;
        }, 2000);
        return;
    }
}

// const body = document.body;


// body.addEventListener('click', e => {
//     console.log('clicked body');
//     document.querySelector('.smiley').innerHTML = '😮'
//   });

//   console.log('Using click()');
//   body.click();

//   console.log('Using dispatchEvent');
//   body.dispatchEvent(new Event('click'));

// function changeSmileyOnClick() {
//     addEventListener('click', e => {
//         console.log('clicked body');
//     });
//     document.querySelector('.smiley').innerHTML = '😮'
// }

function cellClicked(elCell, i = Nan, j = NaN) {
    var pos = { i, j };
    if (!gGame.isOn) return;
    if (gGame.isSelfPositioned) {
        placeMine(elCell, pos);
        return;
    }
    if (gGame.isHint) {
        addTimer();
        createMines(gBoard, gLevel.MINES, gBoard[i][j]);
        setMinesNegsCount(gBoard);
        showHint(gBoard, pos);
        hideHint();
        return;
    }
    if (!gClickCount) {
        makeSclickClickable();
        addTimer();
        createMines(gBoard, gLevel.MINES, gBoard[i][j]);
        setMinesNegsCount(gBoard);
        document.querySelector('.done-msg').classList.add('hide');
    }
    saveMemento(gBoard, gMines, gGame, gLevel);
    if (gBoard[i][j].isMarked) return;
    if (gBoard[i][j].isShown) return;
    if (gBoard[i][j].minesAroundCount > 0 && gBoard[i][j].isMine !== true) {
        // Update Model
        gBoard[i][j].isShown = true;
        // Update DOM
        // Backup before changing nums to color strings
        // elCell.innerText = gBoard[i][j].minesAroundCount;
        var currCellCount = gBoard[i][j].minesAroundCount;
        elCell.innerHTML = convertNumToColorStr(currCellCount);
        elCell.classList.remove('unrevealed');
        gClickCount++
        checkWin();
        return;
    }
    if (gBoard[i][j].isMine) {
        // Update Model
        // saveMemento(gBoard, gMines, gGame, gLevel)
        gGame.lives--
        // Update DOM
        if (gGame.lives === 0) handleLose()
        elCell.innerHTML = MINE;
        elCell.classList.add('clicked-mine');
        gBoard[i][j].isShown = true;
        renderLivesCounter()
    }
    if (gBoard[i][j].minesAroundCount === 0 && gBoard[i][j].isMine === false) {
        // saveMemento(gBoard, gMines, gGame, gLevel)
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
    elCell.classList.remove('unrevealed');
    checkWin();
    if ((countShownCells(gBoard) === gBoard.length * gBoard.length) || (countShownMines() === gLevel.MINES)) handleLose();
    // if (countShownCells(gBoard) === gBoard.length * gBoard.length) handleLose();
};


function rightClicked(elTdRightClicked, i, j) {
    document.addEventListener('contextmenu', event => event.preventDefault());
    // console.log('right clicked');
    if (!gGame.isOn) return;
    if (gBoard[i][j].isShown) return
    saveMemento(gBoard, gMines, gGame, gLevel)
    if (gBoard[i][j].isMarked) {
        // Update Model
        gGame.markedCount--
        gBoard[i][j].isMarked = false;
        // Update DOM
        elTdRightClicked.innerText = '';
        renderMarkedCounter();
        gMarked = getMarkedCells(gBoard)
        return;
    }
    // Update Model
    gGame.markedCount++
    gBoard[i][j].isMarked = true;
    // Update DOM
    elTdRightClicked.innerText = FLAG;
    checkWin();
    renderMarkedCounter();
    gMarked = getMarkedCells(gBoard)
}
function addTimer() {
    if (gGameInterval) return;
    var startTime = Date.now();
    gGameInterval = setInterval(function () {
        var sec = 0;
        var timer = Date.now() - startTime;
        // console.log('timer', (timer / 1000).toFixed());
        gGame.secsPassed = (timer / 1000).toFixed();
        sec = (timer / 1000).toFixed();
        document.querySelector(".timer").innerHTML = `${sec}s`
    }, 1000);
}


// var sec = min = hour = 0;
// var clock = 0;
// stopWatch = function(){
// clearTimeout(clock);
//     sec++;
//     if (sec >=59){
//     sec = 0;
//         min++;
//     }
//     if (min>=59){
//     min=0;
//         hour++;
//     }
//     document.getElementById("sec").innerHTML = (sec < 10) ? "0" + sec : sec;
//     document.getElementById("min").innerHTML = (min < 10) ? "0" + min : min;
//     document.getElementById("hour").innerHTML = (hour < 10) ? "0" + hour : hour;
//     clock = setTimeout("stopWatch()",1000);
// }
// stopWatch();

// pause = function(){
// clearTimeout(clock);
//     return false;
// }

// play = function(){
//     stopWatch();
// return false;
// }

// reset = function(){
//     sec = min = hour = 0;
//     stopWatch();
// return false;
// }


function winMsg() {
    stopCount();
    showScore();
    var elsmiley = document.querySelector('.smiley');
    elsmiley.innerHTML = '😎';
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