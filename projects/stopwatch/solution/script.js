let seconds = 0
let tens = 0
const displayTens = document.getElementById('tens')
const displaySeconds = document.getElementById('seconds')
const buttonStart = document.getElementById('button-start')
const buttonStop = document.getElementById('button-stop')
const buttonReset = document.getElementById('button-reset')
let interval


buttonStart.onclick = () => {
  clearInterval(interval)
  interval = setInterval(timer, 10)
}

buttonStop.onclick = () => {
  clearInterval(interval)
}

buttonReset.onclick = () => {
  clearInterval(interval)
  tens = 0
  seconds = 0
  displayTens.innerHTML = '00'
  displaySeconds.innerHTML = '00'
}

const timer = () => {
  tens++

  // when tens reaches 100, increment seconds and reset tens
  if (tens > 99) {
    seconds++
    tens = 0
  }

  // cap seconds at 99 to prevent infinite growth
  if (seconds > 99) {
    seconds = 99
    tens = 99
    clearInterval(interval)
  }

  // format display with proper zero-padding
  displayTens.innerHTML = tens.toString().padStart(2, '0')
  displaySeconds.innerHTML = seconds.toString().padStart(2, '0')
}
