const timeDisplay = document.getElementById('timeDisplay');
const statusText = document.getElementById('status');
const timerForm = document.getElementById('timerForm');
const minutesInput = document.getElementById('minutesInput');
const secondsInput = document.getElementById('secondsInput');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const resetButton = document.getElementById('resetButton');
const notificationButton = document.getElementById('notificationButton');
const notificationHint = document.getElementById('notificationHint');
const themeToggle = document.getElementById('themeToggle');
const presetButtons = document.querySelectorAll('.preset-button');

let totalSeconds = 25 * 60;
let remainingSeconds = totalSeconds;
let timerInterval = null;
let endTime = null;
let isRunning = false;

const savedTheme = localStorage.getItem('countdown-theme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark');
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateDisplay() {
  timeDisplay.textContent = formatTime(remainingSeconds);
  document.title = `${formatTime(remainingSeconds)} • Countdown`;
}

function syncInputsFromTimer() {
  minutesInput.value = Math.floor(totalSeconds / 60);
  secondsInput.value = totalSeconds % 60;
}

function syncTimerFromInputs() {
  const minutes = Number(minutesInput.value) || 0;
  const seconds = Number(secondsInput.value) || 0;
  const normalizedSeconds = Math.min(Math.max(seconds, 0), 59);
  secondsInput.value = normalizedSeconds;
  totalSeconds = Math.min((minutes * 60) + normalizedSeconds, 359999);
  remainingSeconds = totalSeconds;
  updateDisplay();
}

function setStatus(message) {
  statusText.textContent = message;
}

function stopAlarmClass() {
  document.body.classList.remove('finished');
}

function playAlarm() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    return;
  }

  const audioContext = new AudioContextClass();
  let delay = 0;

  [880, 659, 880, 659].forEach((frequency) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const startAt = audioContext.currentTime + delay;
    const endAt = startAt + 0.22;

    gainNode.gain.setValueAtTime(0.0001, startAt);
    gainNode.gain.exponentialRampToValueAtTime(0.18, startAt + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, endAt);

    oscillator.start(startAt);
    oscillator.stop(endAt);

    delay += 0.24;
  });
}

function sendNotification() {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const notification = new Notification('Tempo finalizado', {
    body: 'Seu temporizador chegou a 0:00.',
    icon: 'https://www.notion.so/images/favicon.ico',
    tag: 'countdown-notification',
  });

  setTimeout(() => notification.close(), 6000);
}

function finishTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  remainingSeconds = 0;
  updateDisplay();
  setStatus('Tempo finalizado');
  document.body.classList.add('finished');
  playAlarm();
  sendNotification();
}

function tick() {
  const difference = Math.max(0, Math.round((endTime - Date.now()) / 1000));
  remainingSeconds = difference;
  updateDisplay();

  if (difference <= 0) {
    finishTimer();
  }
}

function startTimer(event) {
  if (event) {
    event.preventDefault();
  }

  if (!isRunning) {
    if (remainingSeconds <= 0) {
      syncTimerFromInputs();
    }

    if (remainingSeconds <= 0) {
      setStatus('Escolha um tempo maior que 0 segundos');
      return;
    }

    stopAlarmClass();
    isRunning = true;
    endTime = Date.now() + (remainingSeconds * 1000);
    timerInterval = setInterval(tick, 250);
    setStatus('Contagem em andamento');
    tick();
  }
}

function pauseTimer() {
  if (!isRunning) {
    return;
  }

  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  const difference = Math.max(0, Math.round((endTime - Date.now()) / 1000));
  remainingSeconds = difference;
  updateDisplay();
  setStatus('Temporizador pausado');
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  syncTimerFromInputs();
  setStatus('Pronto para começar');
  stopAlarmClass();
}

async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    notificationHint.textContent = 'Este navegador não suporta notificações.';
    return;
  }

  const permission = await Notification.requestPermission();

  if (permission === 'granted') {
    notificationHint.textContent = 'Notificações ativadas.';
    notificationButton.textContent = 'Notificações ativas';
    notificationButton.disabled = true;
    return;
  }

  notificationHint.textContent = 'Permissão não concedida. O alarme sonoro ainda pode funcionar.';
}

presetButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const minutes = Number(button.dataset.minutes || 0);
    minutesInput.value = minutes;
    secondsInput.value = 0;
    resetTimer();
  });
});

timerForm.addEventListener('submit', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);
notificationButton.addEventListener('click', requestNotificationPermission);
minutesInput.addEventListener('change', resetTimer);
secondsInput.addEventListener('change', resetTimer);

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('countdown-theme', currentTheme);
});

if ('Notification' in window && Notification.permission === 'granted') {
  notificationHint.textContent = 'Notificações ativadas.';
  notificationButton.textContent = 'Notificações ativas';
  notificationButton.disabled = true;
}

syncInputsFromTimer();
updateDisplay();
