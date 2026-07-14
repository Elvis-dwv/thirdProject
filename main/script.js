// --- DATA (Enhanced with branding colors and days) ---
const stations = [
    { id: 1, freq: "98.5", name: "Indie Pulse", genre: "Indie rock", color: "#ff5e3a", url: "https://ice1.somafm.com/indiepop-128-mp3", tagline: "Fresh cuts and fast-moving discovery", description: "A bold indie station for listeners chasing new artists, genre bends, and late-night energy.", audience: "18–34", peak: "7–10 PM", vibe: "Modern indie hits" },
    { id: 2, freq: "101.2", name: "Deep Focus", genre: "Ambient", color: "#5865F2", url: "https://ice1.somafm.com/dronezone-128-mp3", tagline: "Slow rhythms for long thoughts", description: "An atmospheric channel designed for study sessions, deep work, and calm focus.", audience: "25–40", peak: "11 AM–2 PM", vibe: "Ambient and cinematic" },
    { id: 3, freq: "104.7", name: "Groove Drive", genre: "Funk & soul", color: "#f1c40f", url: "https://ice1.somafm.com/groovesalad-128-mp3", tagline: "Smooth grooves and feel-good energy", description: "A warm, danceable mix of funk, soul, and retro flavors built for a brighter mood.", audience: "20–35", peak: "6–9 PM", vibe: "Soulful grooves" },
    { id: 4, freq: "107.9", name: "Late Night Jazz", genre: "Jazz", color: "#9b59b6", url: "https://ice1.somafm.com/sonicuniverse-128-mp3", tagline: "Velvet nights and timeless improvisation", description: "A mellow jazz stream for winding down with expressive melodies and late-hour comfort.", audience: "30–50", peak: "10 PM–1 AM", vibe: "Chilled jazz classics" }
];

const schedule = [
    { day: "Mon", time: "07:00 AM", show: "Morning Drive", host: "Tobi Adams" },
    { day: "Mon", time: "12:00 PM", show: "Midday Mix", host: "DJ Sola" },
    { day: "Tue", time: "09:00 AM", show: "Indie Pulse Live", host: "Indie Crew" },
    { day: "Wed", time: "02:00 PM", show: "Deep Focus Hours", host: "Instrumental" },
    { day: "All", time: "08:00 PM", show: "Late Night Jazz", host: "Aria Bello" }
];

const clips = [
    { id: 1, title: "Episode 04 — Studio Tour", url: "https://ice1.somafm.com/indiepop-128-mp3" },
    { id: 2, title: "Interview — Local Band", url: "https://ice1.somafm.com/groovesalad-128-mp3" }
];

// --- APP STATE ---
let currentAudioContext = null; 
const audio = document.getElementById("mainAudio");
let isLive = true; 
let activeColor = "#1db954"; 

// DOM Elements
const playBtn = document.getElementById("playBtn");
const npTitle = document.getElementById("npTitle");
const npSub = document.getElementById("npSub");
const playerColorBlock = document.getElementById("playerColorBlock");
const progressBar = document.getElementById("progressBar");
const currentTimeEl = document.getElementById("currentTime");
const durationTimeEl = document.getElementById("durationTime");
const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const themeToggleIcon = themeToggle?.querySelector(".theme-toggle__icon");
const themeToggleLabel = themeToggle?.querySelector(".theme-toggle__label");

function applyTheme(theme) {
    document.body.dataset.theme = theme;
    localStorage.setItem("freq-theme", theme);

    if (themeToggleIcon) themeToggleIcon.textContent = theme === "light" ? "☀️" : "🌙";
    if (themeToggleLabel) themeToggleLabel.textContent = theme === "light" ? "Light" : "Dark";
}

const savedTheme = localStorage.getItem("freq-theme");
if (savedTheme === "light" || savedTheme === "dark") {
    applyTheme(savedTheme);
} else {
    applyTheme(window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
}

themeToggle?.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "light" ? "dark" : "light";
    applyTheme(nextTheme);
});

// --- TABS NAVIGATION ---
document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(btn.dataset.tab).classList.add("active");
    });
});

// --- RENDER CONTENT ---
// 1. Stations
const stationList = document.getElementById("stationList");
stations.forEach(station => {
    const card = document.createElement("div");
    card.className = "card station-card";
    card.innerHTML = `
        <div class="card-color-strip" style="background: ${station.color}"></div>
        <h3>${station.name}</h3>
        <p>${station.freq} FM • ${station.genre}</p>
    `;
    card.addEventListener("click", () => loadMedia(station, true, card, '.station-card'));
    stationList.appendChild(card);
});

// 2. Station Directory
const stationDirectoryList = document.getElementById("stationDirectoryList");

function renderStationDirectory() {
    stationDirectoryList.innerHTML = "";
    const placeholderCards = [
        {
            name: "LTC RADIO TELEVISION",
            subtitle: "Landing page",
            href: "../page/front.html"
        },
        {
            name: "KORIE TECHNOLOGY & COMMUNICATIONS",
            subtitle: "Second landing page",
            href: "../page2/2front.html"
        },
        ...stations.map(station => ({
            name: station.name,
            subtitle: `${station.freq} FM • ${station.genre}`,
            href: "#"
        }))
    ];

    placeholderCards.forEach(item => {
        const card = document.createElement("a");
        card.className = "station-placeholder-card";
        card.href = item.href;
        card.innerHTML = `
            <div>
                <h3>${item.name}</h3>
                <p>${item.subtitle}</p>
            </div>
            <span>${item.href === "page/front.html" ? "Open landing page" : "Open page"}</span>
        `;
        stationDirectoryList.appendChild(card);
    });
}
renderStationDirectory();

// 2. Podcasts
const clipList = document.getElementById("clipList");
clips.forEach(clip => {
    const card = document.createElement("div");
    card.className = "card clip-card";
    card.innerHTML = `
        <div class="card-color-strip" style="background: #1db954"></div>
        <h3>${clip.title}</h3>
        <p>On-Demand Episode</p>
    `;
    card.addEventListener("click", () => loadMedia({ ...clip, color: "#1db954" }, false, card, '.clip-card'));
    clipList.appendChild(card);
});

// 3. Schedule with Filter
function renderSchedule(filterDay) {
    const list = document.getElementById("scheduleList");
    list.innerHTML = "";
    schedule.filter(s => filterDay === "All" || s.day === filterDay || s.day === "All").forEach(slot => {
        list.innerHTML += `
            <div class="schedule-row">
                <div class="schedule-time">${slot.time}</div>
                <div>
                    <strong>${slot.show}</strong>
                    <div style="font-size: 12px; color: var(--text-muted)">With ${slot.host}</div>
                </div>
            </div>
        `;
    });
}
renderSchedule("All");
document.querySelectorAll(".day-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        document.querySelectorAll(".day-btn").forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        renderSchedule(e.target.dataset.day);
    });
});

// --- PLAYER LOGIC ---
function loadMedia(item, isLiveStream, cardEl, cardClass) {
    document.querySelectorAll(cardClass).forEach(c => c.classList.remove("selected"));
    cardEl.classList.add("selected");

    isLive = isLiveStream;
    activeColor = item.color;
    root.style.setProperty('--accent', activeColor);
    playerColorBlock.style.background = activeColor;
    npTitle.textContent = item.name || item.title;
    npSub.textContent = isLiveStream ? `Live • ${item.freq} FM` : "Playing from Podcasts";
    
    progressBar.disabled = isLiveStream; // Can't scrub live radio
    
    audio.src = item.url;
    audio.play();
    playBtn.textContent = "❚❚";
    playBtn.disabled = false;
    waveformActive = true;
}

playBtn.addEventListener("click", () => {
    if (audio.paused) { audio.play(); playBtn.textContent = "❚❚"; waveformActive = true; } 
    else { audio.pause(); playBtn.textContent = "▶"; waveformActive = false; }
});

// Skip Controls (Podcast only)
document.getElementById("skipBack").addEventListener("click", () => { if(!isLive) audio.currentTime -= 15; });
document.getElementById("skipFwd").addEventListener("click", () => { if(!isLive) audio.currentTime += 15; });

// Progress Bar Updates
audio.addEventListener("timeupdate", () => {
    if (isLive || !audio.duration) return;
    progressBar.value = (audio.currentTime / audio.duration) * 100;
    currentTimeEl.textContent = formatTime(audio.currentTime);
});
audio.addEventListener("loadedmetadata", () => {
    if (!isLive) durationTimeEl.textContent = formatTime(audio.duration);
});
progressBar.addEventListener("input", (e) => {
    if (!isLive) audio.currentTime = (e.target.value / 100) * audio.duration;
});

function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

// Volume
document.getElementById("volumeSlider").addEventListener("input", (e) => {
    audio.volume = e.target.value;
});

// --- CLIPPING TOOL ---
document.getElementById("saveClipBtn").addEventListener("click", () => {
    if(isLive) return alert("Can only clip podcasts!");
    const startStr = document.getElementById("clipStart").value;
    const name = document.getElementById("clipName").value || "My Clip";
    
    // Parse min:sec to seconds
    const parts = startStr.split(":");
    const startSecs = parts.length === 2 ? parseInt(parts[0])*60 + parseInt(parts[1]) : 0;
    
    const li = document.createElement("li");
    li.className = "saved-clip";
    li.innerHTML = `✂️ ${name} <span style="font-size:10px; color:#666">(${startStr})</span>`;
    li.addEventListener("click", () => {
        if(!isLive && audio.src) {
            audio.currentTime = startSecs;
            audio.play();
            playBtn.textContent = "❚❚";
        }
    });
    document.getElementById("savedClipsList").appendChild(li);
    alert("Clip saved to your sidebar!");
});

// --- COMMUNITY REQUEST FORM ---
const requestForm = document.getElementById("requestForm");
const requestFeed = document.getElementById("requestFeed");

requestForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("reqName").value;
    const msg = document.getElementById("reqMessage").value;
    
    const reqDiv = document.createElement("div");
    reqDiv.className = "req-item";
    reqDiv.innerHTML = `<div class="req-name">${name}</div><div class="req-msg">${msg}</div>`;
    
    requestFeed.prepend(reqDiv); // Add to top
    requestForm.reset();
});

// --- VISUALIZER ---
const canvas = document.getElementById("waveform");
const ctx = canvas.getContext("2d");
let waveformActive = false;
let vizEnabled = true;

document.getElementById("toggleViz").addEventListener("click", (e) => {
    vizEnabled = !vizEnabled;
    e.target.classList.toggle("active");
});

function drawWaveform() {
    requestAnimationFrame(drawWaveform);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const bars = 15;
    const barW = canvas.width / bars;
    
    ctx.fillStyle = activeColor;
    
    for (let i = 0; i < bars; i++) {
        let barH = 4; // idle height
        if (waveformActive && vizEnabled && !audio.paused) {
            barH = Math.random() * (canvas.height - 10) + 5;
        }
        ctx.fillRect(i * barW + 2, canvas.height - barH, barW - 4, barH);
    }
}

document.getElementById("addStationBtn").addEventListener("click", () => {
    window.location.href = "../form/form.html";
});