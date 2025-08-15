document.addEventListener("DOMContentLoaded", () => {
  let timer;
  let timeLeft = 1500;
  let isRunning = false;
  let mode = "pomodoro";
  let sessions = parseInt(localStorage.getItem("sessions")) || 0;

  const timeDisplay = document.getElementById("time");
  const startBtn = document.getElementById("start");
  const pauseBtn = document.getElementById("pause");
  const resetBtn = document.getElementById("reset");
  const modeBtns = document.querySelectorAll(".modes button");
  const sessionDisplay = document.getElementById("sessions");
  const alarm = document.getElementById("alarm");
  const bgMusic = document.getElementById("bgMusic");
  const musicSelect = document.getElementById("musicSelect");
  const quoteDisplay = document.getElementById("quote");
  const chartCanvas = document.getElementById("progressChart");
  const themeToggle = document.getElementById("toggleTheme");
  const applyCustomTimerBtn = document.getElementById("applyCustomTimer");
  const setAlarmBtn = document.getElementById("setAlarmBtn");

  const durations = {
    pomodoro: 1500,
    short: 300,
    long: 900
  };

  const quotes = [
    "“Success is the sum of small efforts, repeated.”",
    "“Focus on being productive instead of busy.”",
    "“Every minute counts.”",
    "“Discipline is the bridge between goals and accomplishment.”",
    "“Consistency is key.”",
    "“Stay on track, even when no one is watching.”"
  ];

  function updateTimerDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timeDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function startTimer() {
    if (isRunning) return;
    isRunning = true;

    timer = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();

      if (timeLeft <= 0) {
        clearInterval(timer);
        isRunning = false;
        alarm.play();

        if (mode === "pomodoro") {
          sessions++;
          localStorage.setItem("sessions", sessions);
          sessionDisplay.textContent = sessions;
          updateChart();
          displayRandomQuote();
        }
      }
    }, 1000);
  }

  function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
  }

  function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    timeLeft = durations[mode];
    updateTimerDisplay();
  }

  function switchToMode(selectedMode) {
    mode = selectedMode;
    timeLeft = durations[mode];
    modeBtns.forEach(btn => btn.classList.remove("active"));
    document.querySelector(`[data-mode="${mode}"]`).classList.add("active");
    resetTimer();
  }

  function displayRandomQuote() {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteDisplay.textContent = quote;
  }

  function loadSavedTheme() {
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      document.body.classList.add("light-mode");
      themeToggle.textContent = "🌙";
    }
  }

  function toggleTheme() {
    document.body.classList.toggle("light-mode");
    const theme = document.body.classList.contains("light-mode") ? "light" : "dark";
    themeToggle.textContent = theme === "light" ? "🌙" : "☀️";
    localStorage.setItem("theme", theme);
  }

  musicSelect.addEventListener("change", () => {
    const selected = musicSelect.value;
    if (selected) {
      bgMusic.src = selected;
      bgMusic.play().catch(e => console.log("Autoplay blocked"));
    } else {
      bgMusic.pause();
      bgMusic.src = "";
    }
  });

  startBtn.addEventListener("click", startTimer);
  pauseBtn.addEventListener("click", pauseTimer);
  resetBtn.addEventListener("click", resetTimer);
  themeToggle.addEventListener("click", toggleTheme);

  modeBtns.forEach(button => {
    button.addEventListener("click", () => {
      switchToMode(button.dataset.mode);
    });
  });

  // Chart.js setup
  let chart;
  function initChart() {
    chart = new Chart(chartCanvas, {
      type: "bar",
      data: {
        labels: ["Pomodoros"],
        datasets: [{
          label: "Sessions",
          data: [sessions],
          backgroundColor: "#ffd700"
        }]
      },
      options: {
        responsive: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }
    });
  }

  function updateChart() {
    chart.data.datasets[0].data[0] = sessions;
    chart.update();
  }

  // Custom Timer Setup
  function setCustomTimer() {
    const mins = parseInt(document.getElementById("customMinutes").value);
    const secs = parseInt(document.getElementById("customSeconds").value);

    if (!isNaN(mins) && !isNaN(secs)) {
      pauseTimer();
      timeLeft = (mins * 60) + secs;
      updateTimerDisplay();
      alert(`✅ Custom timer set to ${mins}m ${secs}s`);
    }
  }

  // Alarm Feature
  function setAlarm() {
    const alarmInput = document.getElementById("alarmTime").value;
    const alarmMsg = document.getElementById("alarmMsg");

    if (!alarmInput) {
      alarmMsg.textContent = "⚠️ Please select a time.";
      return;
    }

    const alarmTime = new Date();
    const [h, m] = alarmInput.split(":");
    alarmTime.setHours(parseInt(h));
    alarmTime.setMinutes(parseInt(m));
    alarmTime.setSeconds(0);

    const now = new Date();

    if (alarmTime < now) {
      alarmTime.setDate(now.getDate() + 1); // Next day
    }

    const diff = alarmTime - now;

    setTimeout(() => {
      alarm.play();
      alert("⏰ Alarm! Time's up!");
    }, diff);

    alarmMsg.textContent = `✅ Alarm set for ${alarmTime.toLocaleTimeString()}`;
  }

  // World Clock Feature
  function updateWorldClocks() {
    const now = new Date();

    document.getElementById("nyTime").textContent =
      new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" })).toLocaleTimeString();

    document.getElementById("londonTime").textContent =
      new Date(now.toLocaleString("en-GB", { timeZone: "Europe/London" })).toLocaleTimeString();

    document.getElementById("tokyoTime").textContent =
      new Date(now.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })).toLocaleTimeString();

    document.getElementById("jhbTime").textContent =
      new Date(now.toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" })).toLocaleTimeString();
  }

  // Attach event listeners to new buttons
  applyCustomTimerBtn.addEventListener("click", setCustomTimer);
  setAlarmBtn.addEventListener("click", setAlarm);

  // Initialize app state
  updateTimerDisplay();
  sessionDisplay.textContent = sessions;
  loadSavedTheme();
  initChart();
  updateWorldClocks();
  setInterval(updateWorldClocks, 1000);
});
