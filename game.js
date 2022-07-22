'use strict'

const MINE = '💣'
const FLAG = '🚩'
const EMPTY = ' '

var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}
var gTimerId
var gTimer
var gBoard
var gFirstClick

var elLoose = document.querySelector('.loose')
var elWin = document.querySelector('.win')

function initGame() {
    clearInterval(gTimerId)
    gTimer = 0
    elLoose.style.display = 'none'
    elWin.style.display = 'none'
    var elTimer = document.querySelector('.timer')
    elTimer.innerHTML = 'Timer: ' + gTimer.toFixed(3)
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.isOn = true
    gFirstClick = true
    gBoard = createBoard()
    renderBoard(gBoard)
}

function createBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board
}

function renderBoard(board) {
    console.log(board);
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board.length; j++) {
            var className = `cell cell-${i}-${j}`
            strHTML += `<td  class="${className}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(event, this, ${i}, ${j})"></td>`
        }
        strHTML += '</tr>'
    }

    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML

}

function cellClicked(elCell, cellI, cellJ) {
    if (!gGame.isOn) return
    if (gBoard[cellI][cellJ].isShown) return
    if (gBoard[cellI][cellJ].isMarked) return
    if (gFirstClick) {
        startGame(cellI, cellJ)
        gFirstClick = false
    }

    if (gBoard[cellI][cellJ].isMine) {
        elCell.innerText = MINE
        showAllMines()
        gameOver()
    } else {
        gBoard[cellI][cellJ].isShown = true
        gGame.shownCount++
        elCell.classList.add('shown')
        var count = gBoard[cellI][cellJ].minesAroundCount
        if (count !== 0) {
            elCell.innerText = count
        } else {
            // expandShown(gBoard, elCell, cellI, cellJ)
            elCell.innerText = EMPTY
            expandShown(cellI, cellJ)
        }

    }
    checkWin()
}

function showAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            gBoard[i][j].isShown = true
            if (gBoard[i][j].isMine) {
                var elCell = document.querySelector(`.cell-${i}-${j}`)
                elCell.innerHTML = MINE
            }
        }
    }

}


function expandShown(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard.length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            if (gBoard[i][j].isMine) continue
            if (gBoard[i][j].isMarked) continue
            if (gBoard[i][j].isShown) continue
            if (gBoard[i][j].minesAroundCount === 0) {
                    gBoard[i][j].isShown = true
                    gGame.shownCount++
                    var elCurrCell = document.querySelector(`.cell-${i}-${j}`)
                    elCurrCell.innerText = EMPTY
                    elCurrCell.classList.add('shown')
                    checkWin()
                    expandShown(rowIdx, colIdx)
                
            } else {
                gBoard[i][j].isShown = true
                gGame.shownCount++
                var elCurrCell = document.querySelector(`.cell-${i}-${j}`)
                elCurrCell.innerText = gBoard[i][j].minesAroundCount
                elCurrCell.classList.add('shown')
                checkWin()
            }
        }
    }
}


function startGame(cellI, cellJ) {
    gBoard[cellI][cellJ].isShown = true
    gGame.shownCount++
    setMines(cellI, cellJ)
    setMinesNegsCount(gBoard)

    startTimer()
}

function setMines(cellI, cellJ) {
    for (var i = 0; i < gLevel.MINES; i++) {
        var randI = getRandomInt(0, gLevel.SIZE)
        var randJ = getRandomInt(0, gLevel.SIZE)
        if (randI !== cellI && randJ !== cellJ) {
            gBoard[randI][randJ].isMine = true
        } else {
            i--
        }
    }
}




function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {

            board[i][j].minesAroundCount = negsCount(i, j, board)
        }
    }
}

function negsCount(cellI, cellJ, board) {
    var minesAroundCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (board[i][j].isMine) minesAroundCount++
        }
    }
    return minesAroundCount
}

function cellMarked(ev, elCell, i, j) {
    ev.preventDefault()
    if (!gGame.isOn) return
    if (gBoard[i][j].isShown) return
    gBoard[i][j].isMarked = !gBoard[i][j].isMarked
    if (gFirstClick) {
        startGame(cellI, cellJ)
        gFirstClick = false
    }
    if (gBoard[i][j].isMarked) {
        elCell.innerText = FLAG
        gGame.markedCount++
        checkWin()
    }
    else {
        elCell.innerText = EMPTY
        gGame.markedCount--
    }
}


function gameOver() {
    clearInterval(gTimerId)
    console.log('Game over!!')
    elLoose.style.display = 'block'
    gGame.isOn = false
    var elCell = document.querySelector(`.restart`)
    elCell.innerText = '😞'
}

function level(size, mines) {
    gLevel.SIZE = size
    gLevel.MINES = mines

    initGame()
}

function restartGame() {
    var elCell = document.querySelector(`.restart`)
    elCell.innerText = '😀'
    // gTimer = 0

    initGame()
}

function startTimer() {
    gTimerId = setInterval(() => {
        updateTime()
    }, 4)
}

function updateTime() {
    gTimer += 4 * 10 ** -3
    var elTimer = document.querySelector('.timer')
    elTimer.innerHTML = 'Timer: ' + gTimer.toFixed(3)
}

function checkWin() {
    var numOfCells = gLevel.SIZE * gLevel.SIZE
    var isMarkedMines = (gLevel.MINES === gGame.markedCount)
    var isShowCells = ((numOfCells - gGame.markedCount) === gGame.shownCount)
    if (isMarkedMines && isShowCells) {
        gGame.isOn = false
        clearInterval(gTimerId)
        elWin.style.display = 'block'
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}
