'use strict';

const CELL = '';
const FLAG = '🚩';
const MINE = '💣';

var soundClick = new Audio('sound/click.wav')
var soundFlag = new Audio('sound/flag.wav')
var soundUnFlag = new Audio('sound/unflag.wav')
var soundBomb =  new Audio('sound/bomb.wav')
var soundWin =  new Audio('sound/gameWin.wav')
var soundGameOver =  new Audio('sound/gameOver.wav')
var soundWrong = new Audio('sound/wrong.wav')


var gWatchInterval
var gStartTime;
var gLastSteps = []
var lastCopiesgBoards = [];

var isFirstClick = true;
var isNextClickHint = false;
var isSevenBoom = false;
var hints = 3;
var life = 3;
var safeClick = 3;

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

function initGame(size, isSevenBoom=false) {
    endStopWatch()
    isFirstClick = true;
    isNextClickHint = false
    gLevel.size = size
    life = 3
    safeClick = 3
    hints = 3

    if(!gGame.isOn) gGame.isOn = true;
    gBoard = buildBoard(gLevel.size)

    if(isSevenBoom) {
        addSevenBoomMines(gBoard)
    }
    else {
      addRandMines(gBoard)  
    }

    // gBoard[0][0].isMine = true;
    // gBoard[0][1].isMine = true;
    // gBoard[0][2].isMine = true;
    // gBoard[0][3].isMine = true;
    updateGameDetails(gBoard, gLevel, gGame)

    document.querySelector('.num-safe-click').innerText = safeClick
    var bestLocalScore = localStorage.getItem('Best Score')
    document.querySelector('.best-score').innerText = bestLocalScore? bestLocalScore: 0.00
    document.querySelector('.emoji').innerText ='🙂';
    document.querySelector('.msg').innerText = '';
    document.querySelector('.life').innerText = '❤️❤️❤️';
    document.querySelector('.flags').innerText = gLevel.mines - gGame.markedCount;
    document.querySelector('.hints').innerText =  '❓❓❓';
    renderBoard(gBoard, '.board-container');
  
}

function cellClicked(elCell, i, j) {
    if(!gGame.isOn) return;
 
    if(isNextClickHint) {
        if(hints < 0) return   
        showNegsForSec(gBoard, i, j)
        isNextClickHint = false
        document.querySelector('.hints').style.backgroundColor = ''
        return
    }

    if(isFirstClick) {
        startStopWatch(gWatchInterval)
        soundClick.play();
        //model:
        isFirstClick = false;
        gBoard[i][j].isMine = false;
        gBoard[i][j].isShown = true;
        expandShown(gBoard, i, j);
        updateGameDetails(gBoard, gLevel, gGame);
        isBoardMarkedCorrect(gBoard, gGame, gLevel);
        //dom:
        var currNegNum = gBoard[i][j].minesAroundCount === 0? 'x':  gBoard[i][j].minesAroundCount;
        elCell.innerText = currNegNum;
        document.querySelector('.emoji').innerText ='😀';
        document.querySelector('.flags').innerText = gLevel.mines - gGame.markedCount;

        pushCurrCell(elCell, i, j, gBoard)

    } 
    else if(gBoard[i][j].isMarked) return;

    else if(gBoard[i][j].isMine) {
        life--;
        //model:
        gBoard[i][j].isShown = true
        UpdateLife(gBoard, elCell, i, j ,life, '.life' );
        isBoardMarkedCorrect(gBoard, gGame, gLevel);
        //dom:
        document.querySelector('.flags').innerText = gLevel.mines - gGame.markedCount;

        pushCurrCell(elCell, i, j, gBoard)


        if(life > 0) return;
        soundBomb.play();
        //model
        endStopWatch()
        updateGameDetails(gBoard, gLevel, gGame)
        isBoardMarkedCorrect(gBoard, gGame, gLevel)
        gGame.isOn = false;
        //dom
        elCell.innerHTML = MINE 
        markAllMines(gBoard, MINE)
        document.querySelector('.msg').innerText = 'Game Over';
        document.querySelector('.emoji').innerText ='😖'   
        soundGameOver.play()

        pushCurrCell(elCell, i, j, gBoard)

    }
    else if(!gBoard[i][j].isMine) {
        soundClick.play()
        //model:
        gBoard[i][j].isShown = true;
        expandShown(gBoard, i, j) 
        //dom:
        var currNegsNum = gBoard[i][j].minesAroundCount === 0? 'x': gBoard[i][j].minesAroundCount ;
        elCell.innerHTML = currNegsNum
        //model:
        updateGameDetails(gBoard, gLevel, gGame)
        isBoardMarkedCorrect(gBoard, gGame, gLevel)

        pushCurrCell(elCell, i, j, gBoard)

    }
}

function cellMarked(elCell, i, j){
    window.event.preventDefault()
    gLastSteps.push()

    if(isFirstClick) {
        startStopWatch(gWatchInterval)
        isFirstClick = false;

        pushCurrCell(elCell, i, j, gBoard)
    }
    if(!gGame.isOn) return;
    else if(gBoard[i][j].isShown) return;
    else if(gBoard[i][j].isMarked) {
        soundFlag.play()
        //model
        gBoard[i][j].isMarked = false;
        updateGameDetails(gBoard, gLevel, gGame)
        isBoardMarkedCorrect(gBoard, gGame, gLevel);
        //dom
        document.querySelector('.flags').innerText = gLevel.mines - gGame.markedCount
        elCell.innerHTML = CELL;

        pushCurrCell(elCell, i, j, gBoard)
     
    }
    else if(!gBoard[i][j].isMarked) {
        soundUnFlag.play()
        document.querySelector('.emoji').innerText ='😏'
        //model
        gBoard[i][j].isMarked = true;
        updateGameDetails(gBoard, gLevel, gGame);
        isBoardMarkedCorrect(gBoard, gGame, gLevel);
        //dom
        elCell.innerHTML = FLAG;
        document.querySelector('.flags').innerText = gLevel.mines - gGame.markedCount

        pushCurrCell(elCell, i, j, gBoard)

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

function expandShown(gBoard, i, j) {
    if(gBoard[i][j].minesAroundCount === 0) {
        var rowIdx = i;
        var colIdx = j;
        for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
            if (i < 0 || i > gBoard.length - 1) continue
            for (var j = colIdx - 1; j <= colIdx + 1; j++) {
              if (j < 0 || j > gBoard[0].length - 1) continue
              if (i === rowIdx && j === colIdx) continue  
              var currCell = gBoard[i][j]
              if(currCell.isMarked) currCell.isMarked = false
              if(currCell.isShown) continue
              currCell.isShown = true;
              document.querySelector(`.cell-${i}-${j}`).innerText = currCell.minesAroundCount === 0? 'x': currCell.minesAroundCount;
              updateGameDetails(gBoard, gLevel, gGame)
                if(currCell.minesAroundCount) continue
              else if(!currCell.minesAroundCount) expandShown(gBoard, i, j)
            }
        }
    }
    document.querySelector('.flags').innerText = gLevel.mines - gGame.markedCount
}

function isBoardMarkedCorrect(gBoard, gGame, gLevel) { 

    // if((gGame.shownCount + gGame.markedCount) < ((gLevel.size**2)-2)) return;

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
                    return 
                }
            }
        }
    }
    gGame.isOn = false
    var sumTime = endStopWatch()
    saveBestScore(sumTime,'.best-score')
    soundWin.play()

    document.querySelector('.msg').innerText = 'Winner !'
    document.querySelector('.emoji').innerText ='😁'
}

function addRandMines(gBoard) {
    for(var i = 0; i < gBoard.length; i++) {
        for(var j = 0; j < gBoard[0].length; j++) {
            var bool;
            if(i % 3 === 0 ) bool = (Math.random() > .5)
            else bool = false 
            gBoard[i][j].isMine = bool
        }
    }
}

function UpdateLife(gBoard, elCell, i, j, life, selector) {
    if(life > 0){
        gBoard[i][j].isMine = false;

        elCell.innerText = MINE
        document.querySelector('.emoji').innerText ='😲'

        setTimeout(()=>{
            updateGameDetails(gBoard, gLevel, gGame)
            isBoardMarkedCorrect(gBoard)

            updateLifeEl(life, selector)
            document.querySelector('.emoji').innerText ='🙂'
            elCell.innerText = gBoard[i][j].minesAroundCount === 0? 'x': gBoard[i][j].minesAroundCount
        },1000)
        soundWrong.play()
    }
}

function updateLifeEl(life, selector) {
    if(life === 3) document.querySelector(selector).innerText = '❤️❤️❤️';
    else if(life === 2) document.querySelector(selector).innerText = '❤️❤️';
    else if(life === 1) document.querySelector(selector).innerText = '❤️';
}

function saveBestScore(time, selector) {
    var localScore = localStorage.getItem('Best Score')
    if(localScore === null) {
       localStorage.setItem('Best Score', time); 
       document.querySelector(selector).innerText = time
    } 
    else if(time < localScore) {
        console.log('not nuul');
        localStorage.setItem('Best Score', time)
        document.querySelector(selector).innerText = time
    }

}

function showRandCell(gBoard) {
    if(!gGame.isOn) return
    if(safeClick < 1) return 
    safeClick--
    var selectors = []
    for(var i = 0; i < gBoard.length; i++) {
        for(var j = 0; j < gBoard[0].length; j++) {
            if((!gBoard[i][j].isShown) && (!gBoard[i][j].isMine)) {
                var currSelc = `.cell-${i}-${j}`
                selectors.push(currSelc)
            }
        }
    }
    var randSelcIdx = getRandomInt(0, selectors.length-1) 
    var randClassName = selectors[randSelcIdx]
    var randElCell = document.querySelector(randClassName)
    document.querySelector('.num-safe-click').innerText = safeClick
    randElCell.classList.toggle('safe-click')
    setTimeout(()=> {randElCell.classList.toggle('safe-click')},1000)
}

function showNegsForSec(gBoard, i, j) {
    var rowIdx = i
    var colIdx = j
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
      if (i < 0 || i > gBoard.length - 1) continue
      for (var j = colIdx - 1; j <= colIdx + 1; j++) {
        if (j < 0 || j > gBoard[0].length - 1) continue
        if(gBoard[i][j].isShown) continue
        getContent(gBoard, i, j)
      }
    }
    
}

function getContent(gBoard, i, j) {
    var currEl = document.querySelector(`.cell-${i}-${j}`)
    currEl.innerText = gBoard[i][j].isMine? MINE : gBoard[i][j].minesAroundCount
    setTimeout(()=> {
        currEl.innerText = gBoard[i][j].isMarked? '🚩' : ''
    },1000)
}

function getHint() {
    soundClick.play()
    if(hints < 1) return 
    if(isNextClickHint) return
    hints--
    isNextClickHint = true;
    document.querySelector('.hints').style.backgroundColor = 'white'
    
    deleteHintEl()
}

function deleteHintEl() {
    var elHint = document.querySelector('.hints')
    if(hints=== 3) elHint.innerText =  '❓❓❓';
    else if(hints === 2) elHint.innerText = '❓❓';
    else if(hints === 1) elHint.innerText = '❓';
    else if(hints < 1) elHint.innerText = ' ';
}

function swichToSevenBoom() {
    if(isSevenBoom) {
        isSevenBoom = false
        document.querySelector('.seven-boom').style.backgroundColor = ''
        document.querySelector('.seven-boom').style.border = ''
        return
    } 
    document.querySelector('.seven-boom').style.backgroundColor = 'lightblue'
    document.querySelector('.seven-boom').style.border = '1px solid red'
    isSevenBoom = true;
    initGame(4, isSevenBoom)
}

function addSevenBoomMines(gBoard) {
    var continuousNum = 0
    for(var i = 0; i < gBoard.length; i++) {
        for(var j = 0; j < gBoard[0].length; j++) { 
                continuousNum++
                var strNum = '' + continuousNum
            if( (continuousNum === 7) || ((continuousNum % 7) === 0) || ((strNum[0]) === '7') || ((strNum[1] )=== '7')) {
                gBoard[i][j].isMine = true
            }   
            else {
                gBoard[i][j].isMine = false
            }
        }
    }
}

function pushBoardToBackup(gBoard, gLastSteps) {
    var newBoard = gBoard.slice()
    gLastSteps.push(newBoard)
}

function pushCurrCell(elCell, i, j, gBoard) {
    var currCellObj = {
        i: i,
        j: j,
        minesAroundCount: gBoard[i][j].minesAroundCount,
        isShown: gBoard[i][j].isShown,
        isMine: gBoard[i][j].isMine,
        isMarked: gBoard[i][j].isMarked,
        value: elCell.innerText
    }
    gLastSteps.push(currCellObj)
}

function unDo(gLastSteps, gBoard) {
    if(!gGame.isOn) return
    var lastCell = gLastSteps.pop()
    if(!lastCell) return

    gBoard[lastCell.i][lastCell.j].minesAroundCount = lastCell.minesAroundCount;
    gBoard[lastCell.i][lastCell.j].isShown = false;
    gBoard[lastCell.i][lastCell.j].isMine = lastCell.isMine;
    gBoard[lastCell.i][lastCell.j].isMarked = lastCell.isMarked
    
    document.querySelector(`.cell-${lastCell.i}-${lastCell.j}`).innerText = ' '
    updateGameDetails(gBoard, gLevel, gGame)
    
}
