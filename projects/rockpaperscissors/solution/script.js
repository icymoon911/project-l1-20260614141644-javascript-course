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

// ** Stats state **
const MAX_HISTORY = 20;
let stats = { wins: 0, losses: 0, draws: 0, history: [] };

// ** Load stats from localStorage if available **
function loadStats() {
  try {
    const saved = localStorage.getItem('rps-stats');
    if (saved) {
      const parsed = JSON.parse(saved);
      stats.wins = parsed.wins || 0;
      stats.losses = parsed.losses || 0;
      stats.draws = parsed.draws || 0;
      stats.history = Array.isArray(parsed.history) ? parsed.history.slice(0, MAX_HISTORY) : [];
    }
  } catch (e) {
    // ignore corrupt data
  }
}

// ** Persist stats to localStorage **
function saveStats() {
  localStorage.setItem('rps-stats', JSON.stringify(stats));
}

// ** Render stats & history to the DOM **
function renderStats() {
  const statsEl = document.getElementById('stats');
  const winRateEl = document.getElementById('win-rate');
  const historyPanel = document.getElementById('history-panel');
  const playerScore = document.getElementById('player-score');

  const total = stats.wins + stats.losses + stats.draws;
  const netScore = stats.wins - stats.losses;
  const winRate = total > 0 ? ((stats.wins / total) * 100).toFixed(1) : '0.0';

  playerScore.innerText = netScore;
  statsEl.innerText = `胜: ${stats.wins} / 负: ${stats.losses} / 平: ${stats.draws}`;
  winRateEl.innerText = `胜率: ${winRate}%`;

  // Render history (newest first)
  historyPanel.innerHTML = stats.history.map(entry => {
    let cssClass = 'draw';
    let outcomeText = '平局';
    if (entry.result === 1) { cssClass = 'win'; outcomeText = '你赢了'; }
    else if (entry.result === -1) { cssClass = 'lose'; outcomeText = '你输了'; }
    return `<div class="history-entry ${cssClass}">第 ${entry.round} 局：你出了 ${entry.player}，电脑出了 ${entry.computer}，${outcomeText}</div>`;
  }).join('');
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

// ** showResult updates the DOM to `You Win!` or `You Lose!` or `It's a Draw!` based on the score. Also shows Player Choice vs. Computer Choice**
function showResult(score, playerChoice, computerChoice) {
  // Hint: on a score of -1
  // You should do result.innerText = 'You Lose!'
  // Don't forget to grab the div with the 'result' id!

  let result = document.getElementById('result')
  switch (score) {
    case -1:
      result.innerText = `You Lose!`
      stats.losses++;
      break;
    case 0:
      result.innerText = `It's a Draw!`
      stats.draws++;
      break;
    case 1:
      result.innerText = `You Win!`
      stats.wins++;
      break;
  }

  let hands = document.getElementById('hands')
  hands.innerText = `👱 ${playerChoice} vs 🤖 ${computerChoice}`

  // Add to history (newest first)
  const total = stats.wins + stats.losses + stats.draws;
  stats.history.unshift({
    round: total,
    player: playerChoice,
    computer: computerChoice,
    result: score
  });

  // Cap history at MAX_HISTORY
  if (stats.history.length > MAX_HISTORY) {
    stats.history = stats.history.slice(0, MAX_HISTORY);
  }

  // Save and render
  saveStats();
  renderStats();
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

  // * Adds an on click event listener to each RPS button and every time you click it, it calls the onClickRPS function with the RPS button that was last clicked *

  // 1. loop through the buttons using a forEach loop
  // 2. Add a 'click' event listener to each button
  // 3. Call the onClickRPS function every time someone clicks
  // 4. Make sure to pass the currently selected rps button as an argument

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

// ** resetStats clears all stats, history, and localStorage **
function resetStats() {
  stats = { wins: 0, losses: 0, draws: 0, history: [] };
  localStorage.removeItem('rps-stats');
  endGame();
  document.getElementById('stats').innerText = '';
  document.getElementById('win-rate').innerText = '';
  document.getElementById('history-panel').innerHTML = '';
}

// ** Load saved stats on page load and render **
loadStats();
renderStats();

playGame()
