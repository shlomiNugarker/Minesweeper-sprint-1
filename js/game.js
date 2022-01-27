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
    gBoard[0][0].isMine = true;
    gBoard[2][2].isMine = true;
    

   updateGameDetails(gBoard, gLevel, gGame)
    renderBoard(gBoard, '.board-container')
}

function cellClicked(elCell, i, j) {
    if(!gGame.isOn) return;
    if(isFirstClick) {
        isFirstClick = false;
        gBoard[i][j].isMine = false;
        gBoard[i][j].isShown = true;

        expandShown(gBoard, elCell, i, j)//////////////////////
        
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

        expandShown(gBoard, elCell, i, j) ///////////////////

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



function isBoardMarkedCorrect(gBoard, gGame) {//////////////////////////////
    isBoardMarkedCorrect(gBoard, gGame);
    
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
// if first cell negs empty, expand all negs around
// if each neg have negs, stop. else ,expend again 

// update model
// update dom

// console.log('expand ?');
}



function isBoardMarkedCorrect(gBoard, gGame) { ////////////////////////////////
//if all board that is not mine is shown
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

function isMinesMarked(gBoard, gGame, gLevel) {
// if all mines marked with flag
}

// function isMinesExploded(gBoard, gGame, gLevel) {
// //
// }
////////////////////////////////////////////////////////////////////////////////

///// TodDo

////// LOSE: when clicking a mine, all mines should be revealed /////
////// WIN: all the mines are flagged, and all the other cells are /////

// Support 3 levels of the game
// o Beginner (4*4 with 2 MINES)
// o Medium (8 * 8 with 12 MINES) 
// o Expert (12 * 12 with 30 MINES)


// – How to start? 

// Step1 – the seed app

// Step2 – counting neighbors

// click to reveal:

// Step4 – randomize mines' location