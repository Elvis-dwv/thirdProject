
const stations = [
  { id: 1, freq: "98.5",  name: "Indie Pulse",   genre: "Indie rock",    url: "https://ice1.somafm.com/indiepop-128-mp3" },
  { id: 2, freq: "101.2", name: "Deep Focus",    genre: "Ambient",       url: "https://ice1.somafm.com/dronezone-128-mp3" },
  { id: 3, freq: "104.7", name: "Groove Drive",  genre: "Funk & soul",   url: "https://ice1.somafm.com/groovesalad-128-mp3" },
  { id: 4, freq: "107.9", name: "Late Night Jazz", genre: "Jazz",        url: "https://ice1.somafm.com/sonicuniverse-128-mp3" }
];


const schedule = [
  { hour: 7,  show: "Morning Drive",       host: "with Tobi Adams" },
  { hour: 9,  show: "Indie Pulse Live",    host: "with the Indie Pulse crew" },
  { hour: 12, show: "Midday Mix",          host: "with DJ Sola" },
  { hour: 14, show: "Deep Focus Hours",    host: "instrumental block" },
  { hour: 17, show: "Groove Drive",        host: "with Femi K." },
  { hour: 20, show: "Late Night Jazz",     host: "with Aria Bello" },
  { hour: 23, show: "Overnight Static",    host: "listener requests" }
];

const clips = [
  { id: 1, title: "Episode 04 — Studio Tour",        meta: "12:40", url: "https://ice1.somafm.com/indiepop-128-mp3" },
  { id: 2, title: "Interview — Local Band Spotlight", meta: "08:15", url: "https://ice1.somafm.com/groovesalad-128-mp3" },
  { id: 3, title: "Best Of: Late Night Jazz",         meta: "20:02", url: "https://ice1.somafm.com/sonicuniverse-128-mp3" }
];


const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    tabPanels.forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

const onairEl = document.getElementById("onair");
const nowTitleEl = document.getElementById("nowTitle");

function setOnAir(isPlaying, title) {
  onairEl.classList.toggle("active", isPlaying);
  if (title) nowTitleEl.textContent = title;
  isPlaying ? startWaveform() : stopWaveform();
}

const clockEl = document.getElementById("clock");
function tickClock() {
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString([], { hour12: false });
}
tickClock();
setInterval(tickClock, 1000);

const canvas = document.getElementById("waveform");
const ctx = canvas.getContext("2d");
let waveformRAF = null;
let waveformActive = false;

function drawWaveform() {
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const barCount = 28;
  const barWidth = w / barCount;

  for (let i = 0; i < barCount; i++) {
    let barHeight;
    if (waveformActive) {
      // randomized "audio level" look
      barHeight = Math.random() * h * 0.8 + h * 0.1;
    } else {
      barHeight = h * 0.08; // flat line when idle
    }
    ctx.fillStyle = waveformActive ? "#ffb020" : "#3a3f4a";
    ctx.fillRect(i * barWidth + 1, h - barHeight, barWidth - 2, barHeight);
  }
  waveformRAF = requestAnimationFrame(drawWaveform);
}

function startWaveform() {
  waveformActive = true;
  if (!waveformRAF) drawWaveform();
}

function stopWaveform() {
  waveformActive = false;
  // let it draw one more flat frame, then stop the loop to save resources
  setTimeout(() => {
    if (!waveformActive) {
      cancelAnimationFrame(waveformRAF);
      waveformRAF = null;
    }
  }, 100);
}

drawWaveform(); 
const stationListEl = document.getElementById("stationList");
const liveAudio = document.getElementById("liveAudio");
const liveToggle = document.getElementById("liveToggle");
const liveStationName = document.getElementById("liveStationName");
const liveVolume = document.getElementById("liveVolume");

let currentStation = null;

stations.forEach(station => {
  const card = document.createElement("div");
  card.className = "station-card";
  card.dataset.id = station.id;
  card.innerHTML = `
    <p class="freq">${station.freq} FM</p>
    <p class="name">${station.name}</p>
    <p class="genre">${station.genre}</p>
  `;
  card.addEventListener("click", () => selectStation(station, card));
  stationListEl.appendChild(card);
});

function selectStation(station, cardEl) {
  // stop the on-demand player if it's running, so only one thing plays at once
  pauseOnDemand();

  document.querySelectorAll(".station-card").forEach(c => c.classList.remove("selected"));
  cardEl.classList.add("selected");

  currentStation = station;
  liveAudio.src = station.url;
  liveAudio.load();
  liveAudio.play().catch(() => {
    // autoplay can be blocked by the browser — that's fine, user just presses play
  });

  liveStationName.textContent = `${station.name} — ${station.freq} FM`;
  liveToggle.disabled = false;
  liveToggle.textContent = "❚❚";
  setOnAir(true, `${station.name} (Live)`);
}

liveToggle.addEventListener("click", () => {
  if (liveAudio.paused) {
    liveAudio.play();
    liveToggle.textContent = "❚❚";
    setOnAir(true, `${currentStation.name} (Live)`);
  } else {
    liveAudio.pause();
    liveToggle.textContent = "▶";
    setOnAir(false);
  }
});

liveVolume.addEventListener("input", () => {
  liveAudio.volume = liveVolume.value;
});
liveAudio.volume = liveVolume.value;

const scheduleListEl = document.getElementById("scheduleList");
const currentHour = new Date().getHours();

schedule.forEach((slot, i) => {
  const next = schedule[i + 1];
  const isCurrent = currentHour >= slot.hour && (!next || currentHour < next.hour);

  const row = document.createElement("div");
  row.className = "schedule-row" + (isCurrent ? " current" : "");
  row.innerHTML = `
    <p class="schedule-time">${formatHour(slot.hour)}</p>
    <div>
      <p class="schedule-show">${slot.show}</p>
      <p class="schedule-host">${slot.host}</p>
    </div>
    ${isCurrent ? '<span class="live-tag">ON NOW</span>' : ""}
  `;
  scheduleListEl.appendChild(row);
});

function formatHour(hour) {
  const period = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:00 ${period}`;
}

const clipListEl = document.getElementById("clipList");
const odAudio = document.getElementById("odAudio");
const odToggle = document.getElementById("odToggle");
const odClipName = document.getElementById("odClipName");
const odProgressFill = document.getElementById("odProgressFill");
const odCurrentTime = document.getElementById("odCurrentTime");
const odDuration = document.getElementById("odDuration");

let currentClip = null;

clips.forEach((clip, i) => {
  const row = document.createElement("div");
  row.className = "clip-row";
  row.dataset.id = clip.id;
  row.innerHTML = `
    <span class="clip-index">${String(i + 1).padStart(2, "0")}</span>
    <div>
      <p class="clip-title">${clip.title}</p>
      <p class="clip-meta">${clip.meta}</p>
    </div>
  `;
  row.addEventListener("click", () => selectClip(clip, row));
  clipListEl.appendChild(row);
});

function selectClip(clip, rowEl) {
  // stop the live stream if it's running, so only one thing plays at once
  pauseLive();

  document.querySelectorAll(".clip-row").forEach(r => r.classList.remove("selected"));
  rowEl.classList.add("selected");

  currentClip = clip;
  odAudio.src = clip.url;
  odAudio.load();
  odAudio.play().catch(() => {});

  odClipName.textContent = clip.title;
  odToggle.disabled = false;
  odToggle.textContent = "❚❚";
  setOnAir(true, clip.title);
}

odToggle.addEventListener("click", () => {
  if (odAudio.paused) {
    odAudio.play();
    odToggle.textContent = "❚❚";
    setOnAir(true, currentClip.title);
  } else {
    odAudio.pause();
    odToggle.textContent = "▶";
    setOnAir(false);
  }
});

odAudio.addEventListener("timeupdate", () => {
  if (!odAudio.duration) return;
  const pct = (odAudio.currentTime / odAudio.duration) * 100;
  odProgressFill.style.width = pct + "%";
  odCurrentTime.textContent = formatTime(odAudio.currentTime);
});

odAudio.addEventListener("loadedmetadata", () => {
  odDuration.textContent = formatTime(odAudio.duration);
});

odAudio.addEventListener("ended", () => {
  odToggle.textContent = "▶";
  setOnAir(false);
});

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function pauseLive() {
  if (!liveAudio.paused) {
    liveAudio.pause();
    liveToggle.textContent = "▶";
  }
}

function pauseOnDemand() {
  if (!odAudio.paused) {
    odAudio.pause();
    odToggle.textContent = "▶";
  }
}