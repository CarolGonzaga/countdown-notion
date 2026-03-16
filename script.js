const timeDisplay = document.getElementById("timeDisplay")

const minutesInput = document.getElementById("minutesInput")
const secondsInput = document.getElementById("secondsInput")

const startBtn = document.getElementById("startBtn")
const pauseBtn = document.getElementById("pauseBtn")
const resetBtn = document.getElementById("resetBtn")

const settingsToggle = document.getElementById("settingsToggle")
const settingsPanel = document.getElementById("settingsPanel")

const themeToggle = document.getElementById("themeToggle")

const presetButtons = document.querySelectorAll(".preset-button")

const soundSelect = document.getElementById("soundSelect")
const testSoundBtn = document.getElementById("testSoundBtn")

let remainingSeconds = 25 * 60
let timer = null

function formatTime(seconds){

const m = Math.floor(seconds / 60)
const s = seconds % 60

return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`

}

function updateDisplay(){

timeDisplay.textContent = formatTime(remainingSeconds)

}

function playAlarm(){

const type = soundSelect.value

if(type === "ana"){

const audio = new Audio("sounds/ana.mp3")
audio.volume = 0.7
audio.play().catch(()=>{})

return

}

const AudioContextClass = window.AudioContext || window.webkitAudioContext

if(!AudioContextClass) return

const audioContext = new AudioContextClass()

function beep(freq,duration,delay){

const osc = audioContext.createOscillator()
const gain = audioContext.createGain()

osc.type="sine"
osc.frequency.value=freq

osc.connect(gain)
gain.connect(audioContext.destination)

const start=audioContext.currentTime+delay
const end=start+duration

gain.gain.setValueAtTime(.001,start)
gain.gain.exponentialRampToValueAtTime(.18,start+.02)
gain.gain.exponentialRampToValueAtTime(.001,end)

osc.start(start)
osc.stop(end)

}

if(type==="system"){

beep(880,.18,0)
beep(660,.18,.22)

}

if(type==="chime"){

beep(880,.25,0)
beep(1174,.35,.28)

}

if(type==="digital"){

beep(1000,.12,0)
beep(1000,.12,.16)
beep(1000,.12,.32)

}

}

function testSound(){

playAlarm()

}

function startTimer(){

if(timer) return

remainingSeconds =
Number(minutesInput.value)*60 + Number(secondsInput.value)

timer = setInterval(()=>{

remainingSeconds--

updateDisplay()

if(remainingSeconds<=0){

clearInterval(timer)
timer=null

playAlarm()

}

},1000)

}

function pauseTimer(){

clearInterval(timer)
timer=null

}

function resetTimer(){

clearInterval(timer)
timer=null

remainingSeconds=
Number(minutesInput.value)*60 + Number(secondsInput.value)

updateDisplay()

}

presetButtons.forEach(btn=>{

btn.addEventListener("click",()=>{

minutesInput.value = btn.dataset.min
secondsInput.value = 0

resetTimer()

})

})

startBtn.addEventListener("click",startTimer)
pauseBtn.addEventListener("click",pauseTimer)
resetBtn.addEventListener("click",resetTimer)

settingsToggle.addEventListener("click",()=>{

settingsPanel.toggleAttribute("hidden")

})

themeToggle.addEventListener("click",()=>{

document.body.classList.toggle("light")

})

testSoundBtn.addEventListener("click",testSound)

updateDisplay()