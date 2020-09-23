'use strict'

// **CR**
// 1. Why gFoodCounter and gFoodEat is not reaching the same result // solution: check if blue-eated ghost contains food and not counted.
// 2. Why sometimes you can not eat blue ghost (maybe time issue) // solution: render the ghosts if chacted super food
// 3. Why after play again interval is not stopping and keep creating ghosts?
// 4. Seperate the blue ghosts part on onMove pacman's func to couple funcs

const WALL = '#';
const FOOD = '.';
const POWER_FOOD = '♦';
const CHERRY = '🍒';
const EMPTY = ' ';

var gFoodCounter = 0; // **CR** Why reached 57? 
var gFoodEat = 0;
var gBoard;
var gEmptyCells = [];
var gCherrys = [];
var gGame = {
    score: 0,
    isOn: false
}
function init() {
    // console.log('hello')
    gBoard = buildBoard()
    createPacman(gBoard);
    createGhosts(gBoard);
    createCheerys(gBoard);
    printMat(gBoard, '.board-container')
    gGame.isOn = true
}

function createCheerys(board) {
    gIntervalGhosts = setInterval(createCheery, 15000)
}

function winMsg() {
    var elGameOver = document.querySelector('.win')
    elGameOver.classList.remove('hide')
}

function buildBoard() {
    var SIZE = 10;
    var board = [];
    for (var i = 0; i < SIZE; i++) {
        board.push([]);
        for (var j = 0; j < SIZE; j++) {
            board[i][j] = FOOD;
            gFoodCounter++
            if (i === 1 && j === 1 ||
                i === SIZE - 2 && j === 1 ||
                i === 1 && j === SIZE - 2 ||
                i === SIZE - 2 && j === SIZE - 2) {
                board[i][j] = POWER_FOOD;
                gFoodCounter--
            } else if (i === 0 || i === SIZE - 1 ||
                j === 0 || j === SIZE - 1 ||
                (j === 3 && i > 4 && i < SIZE - 2)) {
                board[i][j] = WALL;
                gFoodCounter--
            }
        }
    }
    return board;
}

function createCheery(board) {
    var randNum = getRandomIntInclusive(0, gEmptyCells.length - 1)
    var randEmptyCell = gEmptyCells[randNum]
    // if (randEmptyCell.i,)
    gCherrys.push(randEmptyCell)
    // Update Model
    gBoard[randEmptyCell.i][randEmptyCell.j] = CHERRY
    // Update DOM
    renderCell(randEmptyCell, CHERRY)
}

function updateScore(diff) {
    gGame.score += diff;
    document.querySelector('h2 span').innerText = gGame.score
}

function gameOver() {
    var elGameOver = document.querySelector('.game-over')
    elGameOver.classList.remove('hide')
    console.log('Game Over');
    gGame.isOn = false;
    clearInterval(gIntervalGhosts)
}


function playAgain() {
    gGame.isOn = true;
    clearInterval(gIntervalGhosts)
    var elGameOver = document.querySelector('.win')
    elGameOver.classList.add('hide')
    var elGameOver = document.querySelector('.game-over')
    elGameOver.classList.add('hide')
    init()
}

