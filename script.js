const timeDisplay = document.getElementById('timeDisplay');
const minutesInput = document.getElementById('minutesInput');
const secondsInput = document.getElementById('secondsInput');

const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

const settingsToggle = document.getElementById('settingsToggle');
const settingsPanel = document.getElementById('settingsPanel');

const themeToggle = document.getElementById('themeToggle');

const notifyBtn = document.getElementById('notifyBtn');
const presetButtons = document.querySelectorAll('.preset-button');

let totalSeconds = 25 * 60;
let remainingSeconds = totalSeconds;
let timerInterval = null;
let endTime = null;
let isRunning = false;

const savedTheme = localStorage.getItem('countdown-theme');
if (savedTheme === 'light') {
  document.body.classList.add('light');
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

function stopFinishedState() {
  document.body.classList.remove('finished');
}

function playAlarm() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    return;
  }

  const audioContext = new AudioContextClass();

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

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

function updateNotificationButton() {
  if (!('Notification' in window)) {
    notifyBtn.textContent = 'Indisponível';
    notifyBtn.disabled = true;
    return;
  }

  if (Notification.permission === 'granted') {
    notifyBtn.textContent = 'Ativas';
    notifyBtn.disabled = true;
    return;
  }

  if (Notification.permission === 'denied') {
    notifyBtn.textContent = 'Bloqueadas';
    notifyBtn.disabled = true;
    return;
  }

  notifyBtn.textContent = 'Ativar';
  notifyBtn.disabled = false;
}

function finishTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  remainingSeconds = 0;

  updateDisplay();
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

function startTimer() {
  if (isRunning) {
    return;
  }

  if (remainingSeconds <= 0) {
    syncTimerFromInputs();
  }

  if (remainingSeconds <= 0) {
    return;
  }

  stopFinishedState();
  isRunning = true;
  endTime = Date.now() + (remainingSeconds * 1000);
  timerInterval = setInterval(tick, 250);
  tick();
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
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;

  syncTimerFromInputs();
  stopFinishedState();
}

function toggleSettings() {
  const isHidden = settingsPanel.hasAttribute('hidden');

  if (isHidden) {
    settingsPanel.removeAttribute('hidden');
    settingsToggle.setAttribute('aria-expanded', 'true');
    return;
  }

  settingsPanel.setAttribute('hidden', '');
  settingsToggle.setAttribute('aria-expanded', 'false');
}

async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    updateNotificationButton();
    return;
  }

  const permission = await Notification.requestPermission();
  updateNotificationButton();

  if (permission === 'granted') {
    sendNotification();
  }
}

presetButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const minutes = Number(button.dataset.min || 0);
    minutesInput.value = minutes;
    secondsInput.value = 0;
    resetTimer();
  });
});

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

minutesInput.addEventListener('change', resetTimer);
secondsInput.addEventListener('change', resetTimer);

settingsToggle.addEventListener('click', toggleSettings);
notifyBtn.addEventListener('click', requestNotificationPermission);

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  const currentTheme = document.body.classList.contains('light') ? 'light' : 'dark';
  localStorage.setItem('countdown-theme', currentTheme);
});

syncInputsFromTimer();
updateDisplay();
updateNotificationButton();