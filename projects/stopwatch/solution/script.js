let seconds = 0
let tens = 0
const displayTens = document.getElementById('tens')
const displaySeconds = document.getElementById('seconds')
const buttonStart = document.getElementById('button-start')
const buttonStop = document.getElementById('button-stop')
const buttonReset = document.getElementById('button-reset')
let interval

const formatTens = (value) => {
  if (value <= 9) return `0${value}`
  if (value > 99) return `99`
  return `${value}`
}

const formatSeconds = (value) => {
  if (value <= 9) return `0${value}`
  if (value > 99) return `99`
  return `${value}`
}

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
  displayTens.innerHTML = formatTens(tens)
  displaySeconds.innerHTML = formatSeconds(seconds)
}

const timer = () => {
  tens++

  if (tens > 99) {
    seconds++
    tens = 0
  }

  displayTens.innerHTML = formatTens(tens)
  displaySeconds.innerHTML = formatSeconds(seconds)
}
