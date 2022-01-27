'use strict';

const CELL = '❓'
const FLAG = '🚩'
const MINE = '💣'

var isFirstClick = true;

var gBoard;
var gLevel = {
    size: 6,
    mines: 0,
}
var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

function initGame(size) {
    document.querySelector('.msg').innerText = ''
    if(!gGame.isOn) gGame.isOn = true;
    gLevel.size = size
    gBoard = buildBoard(gLevel.size)

    addRandMines(gBoard)

    // gBoard[0][0].isMine = true;
    // gBoard[2][2].isMine = true;
    

    updateGameDetails(gBoard, gLevel, gGame)
    renderBoard(gBoard, '.board-container')
}

function cellClicked(elCell, i, j) {
    if(!gGame.isOn) return;
    if(isFirstClick) {
        isFirstClick = false;
        gBoard[i][j].isMine = false;
        gBoard[i][j].isShown = true;

        expandShown(gBoard, elCell, i, j)
        var currNegNum = gBoard[i][j].minesAroundCount
        elCell.innerHTML = currNegNum
        
        updateGameDetails(gBoard, gLevel, gGame)
        isBoardMarkedCorrect(gBoard)
    } 

    else if(gBoard[i][j].isMarked) return;

    else if(gBoard[i][j].isMine) {
        elCell.innerHTML = MINE

        markAllMines(gBoard, MINE)
        updateGameDetails(gBoard, gLevel, gGame)
        isBoardMarkedCorrect(gBoard)
        document.querySelector('.msg').innerText = 'Game Over';
        gGame.isOn = false;
    }
    else if(!gBoard[i][j].isMine) {
        gBoard[i][j].isShown = true;

        expandShown(gBoard, elCell, i, j) 

        var currNegsNum = gBoard[i][j].minesAroundCount;

        elCell.innerHTML = currNegsNum
        updateGameDetails(gBoard, gLevel, gGame)
        isBoardMarkedCorrect(gBoard, gGame)
    }
}

function cellMarked(elCell, i, j){
    window.event.preventDefault()

    if(!gGame.isOn) return;
    if(!gGame.isOn) return;
    else if(gBoard[i][j].isShown) return;
    else if(gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = false;
        elCell.innerHTML = CELL;

        updateGameDetails(gBoard, gLevel, gGame)
        isBoardMarkedCorrect(gBoard);
    }
    else if(!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true;
        elCell.innerHTML = FLAG;

        updateGameDetails(gBoard, gLevel, gGame);
        isBoardMarkedCorrect(gBoard, gGame);
    }

}

function updateGameDetails(gBoard, gLevel, gGame) {
    resetDetails(gLevel, gGame)
    for(var i = 0; i < gBoard.length; i++) {
        for(var j = 0; j < gBoard[0].length; j++) {

            var negsMinesCell = countNegsAround(gBoard, i, j) 
            gBoard[i][j].minesAroundCount = negsMinesCell;

            if(gBoard[i][j].isMine) gLevel.mines++;
            if(gBoard[i][j].isMarked) gGame.markedCount++;
            if(gBoard[i][j].isShown) gGame.shownCount++
        }
    }
}

function resetDetails(gLevel, gGame) {
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gLevel.mines = 0;
}

function markAllMines(gBoard, mineImg) {
    for(var i = 0; i < gBoard.length; i++) {
        for(var j = 0; j < gBoard[0].length; j++) {
            if(gBoard[i][j].isMine) {
                var className = `.cell-${i}-${j}`
                var currEl = document.querySelector(className);
                currEl.innerHTML = mineImg
            }
        }
    }
}

function expandShown(board, elCell, i, j) {

    
}

function isBoardMarkedCorrect(gBoard, gGame) { 
    for(var i = 0; i < gBoard.length; i++) {
        for(var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if((!currCell.isMine)) {
                if(!currCell.isShown){
                    return false  
                }
            }
        } 
    }
    for(var k = 0; k < gBoard.length; k++) {
        for(var e = 0; e < gBoard[0].length; e++) {
            var currCell = gBoard[k][e]; 
            if(currCell.isMine) {
                if(!currCell.isMarked) {
                    return false
                }
            }
        }
    }
    console.log('win !!');
    document.querySelector('.msg').innerText = 'win !'
    gGame.isOn = false
}

function addRandMines(gBoard) {
    for(var i = 0; i < gBoard.length; i++) {
        for(var j = 0; j < gBoard[0].length; j++) {
            var bool;
            if(i < gBoard.length*.5) bool = (Math.random() > .5)
            else bool = false 
            gBoard[i][j].isMine = bool
        }
    }
}

