/*
  Rock Paper Scissors SOLUTION 🚀🔥
  Concepts covered in this project
    👉 For loops
    👉 Dom Manipulation
    👉 Variables
    👉 Conditionals (if else if)
    👉 Template Literals
    👉 Event Listeners
    👉 Higher order Function (Math.random())
    👉 localStorage persistence
*/

// --- State ---
let wins = 0
let losses = 0
let draws = 0
let history = [] // newest first, max 20 entries
let totalRounds = 0 // cumulative round counter (never resets, used for "第 N 局")

// --- LocalStorage keys ---
const STORAGE_KEY = 'rps_stats'
const HISTORY_KEY = 'rps_history'
const ROUND_KEY = 'rps_total_rounds'

function loadStats() {
  try {
    let saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      let data = JSON.parse(saved)
      wins = data.wins || 0
      losses = data.losses || 0
      draws = data.draws || 0
    }
    let savedHistory = localStorage.getItem(HISTORY_KEY)
    if (savedHistory) {
      history = JSON.parse(savedHistory)
    }
    let savedRounds = localStorage.getItem(ROUND_KEY)
    if (savedRounds) {
      totalRounds = Number(savedRounds) || 0
    }
  } catch (e) {
    // corrupt data, reset everything
    wins = 0; losses = 0; draws = 0; history = []; totalRounds = 0
  }
}

function saveStats() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ wins, losses, draws }))
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  localStorage.setItem(ROUND_KEY, String(totalRounds))
}

// ** getComputerChoice randomly selects between `rock` `paper` `scissors` and returns that string **
// getComputerChoice() 👉 'Rock'
// getComputerChoice() 👉 'Scissors'
function getComputerChoice() {
  let rpsChoices = ['Rock', 'Paper', 'Scissors']
  let computerChoice = rpsChoices[Math.floor(Math.random() * 3)]
  return computerChoice
}

// ** getResult compares playerChoice & computerChoice and returns the score accordingly **
// human wins - getResult('Rock', 'Scissors') 👉 1
// human loses - getResult('Scissors', 'Rock') 👉 -1
// human draws - getResult('Rock', 'Rock') 👉 0
function getResult(playerChoice, computerChoice) {
  // return the result of score based on if you won, drew, or lost

  let score;

  // All situations where human draws, set `score` to 0
  if (playerChoice === computerChoice) {
    score = 0

  // All situations where human wins, set `score` to 1
  // make sure to use else ifs here
  } else if (playerChoice === 'Rock' && computerChoice === 'Scissors') {
    score = 1

  } else if (playerChoice === "Paper" && computerChoice === "Rock") {
    score = 1

  } else if (playerChoice === "Scissors" && computerChoice === "Paper") {
    score = 1

  // Otherwise human loses (aka set score to -1)
  } else {
    score = -1
  }

  // return score
  return score
}

function resultText(score) {
  if (score === 1) return '你赢了'
  if (score === -1) return '你输了'
  return '平局'
}

// ** showResult updates the DOM to `You Win!` or `You Lose!` or `It's a Draw!` based on the score. Also shows Player Choice vs. Computer Choice**
function showResult(score, playerChoice, computerChoice) {
  let result = document.getElementById('result')
  switch (score) {
    case -1:
      result.innerText = `You Lose!`
      losses++
      break;
    case 0:
      result.innerText = `It's a Draw!`
      draws++
      break;
    case 1:
      result.innerText = `You Win!`
      wins++
      break;
  }

  let totalGames = wins + losses + draws
  totalRounds++

  let playerScore = document.getElementById('player-score')
  let hands = document.getElementById('hands')
  playerScore.innerText = `${Number(playerScore.innerText) + score}`
  hands.innerText = `👱 ${playerChoice} vs 🤖 ${computerChoice}`

  // Update stats detail
  updateStatsDisplay()

  // Add history entry (newest first)
  let entry = {
    round: totalRounds,
    playerChoice: playerChoice,
    computerChoice: computerChoice,
    result: resultText(score)
  }
  history.unshift(entry)
  if (history.length > 20) {
    history.pop()
  }

  // Save to localStorage
  saveStats()

  // Render history
  renderHistory()
}

function updateStatsDisplay() {
  let totalGames = wins + losses + draws
  let winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : '0'

  let statsDetail = document.getElementById('stats-detail')
  let statsWinrate = document.getElementById('stats-winrate')
  statsDetail.innerText = `胜: ${wins} / 负: ${losses} / 平: ${draws}`
  statsWinrate.innerText = `胜率: ${winRate}%`
}

function renderHistory() {
  let historyList = document.getElementById('history-list')
  historyList.innerHTML = ''
  history.forEach(function(entry) {
    let li = document.createElement('li')
    let cssClass = ''
    if (entry.result === '你赢了') cssClass = 'win'
    else if (entry.result === '你输了') cssClass = 'lose'
    else cssClass = 'draw'
    li.className = cssClass
    li.innerText = `第 ${entry.round} 局：你出了 ${entry.playerChoice}，电脑出了 ${entry.computerChoice}，${entry.result}`
    historyList.appendChild(li)
  })
}

// ** Calculate who won and show it on the screen **
function onClickRPS(playerChoice) {
  const computerChoice = getComputerChoice()
  const score = getResult(playerChoice.value, computerChoice)
  showResult(score, playerChoice.value, computerChoice)
}

// ** Make the RPS buttons actively listen for a click and do something once a click is detected **
function playGame() {
  // use querySelector to select all RPS Buttons
  let rpsButtons = document.querySelectorAll('.rpsButton')

  rpsButtons.forEach(rpsButton => {
    rpsButton.onclick = () => onClickRPS(rpsButton)
  })

  // Add a click listener to the end game button that runs the endGame() function on click
  let endGameButton = document.getElementById('endGameButton')
  endGameButton.onclick = () => endGame()

  // Add a click listener to the reset stats button
  let resetStatsButton = document.getElementById('resetStatsButton')
  resetStatsButton.onclick = () => resetStats()
}

// ** endGame function clears all the text on the DOM **
function endGame() {
  let playerScore = document.getElementById('player-score')
  let hands = document.getElementById('hands')
  let result = document.getElementById('result')
  playerScore.innerText = ''
  hands.innerText = ''
  result.innerText = ''
}

// ** resetStats clears all stats and history from DOM and localStorage **
function resetStats() {
  wins = 0
  losses = 0
  draws = 0
  history = []
  totalRounds = 0

  // Clear localStorage
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(HISTORY_KEY)
  localStorage.removeItem(ROUND_KEY)

  // Update display
  updateStatsDisplay()
  renderHistory()

  // Also clear the result area like endGame
  endGame()
}

// Load saved stats on page load
loadStats()
updateStatsDisplay()
renderHistory()

playGame()
