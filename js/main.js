// --- PRELOADER CONFIG ---
// Define these at the very top to ensure they exist before anything calls them.
const startTime = Date.now();
const MIN_DISPLAY_TIME = 4000; // 4 seconds (Full animation cycle)

function dismissPreloader() {
    const loader = document.getElementById("preloader");
    const container = document.getElementById("mainContainer");
    
    if(loader && !loader.classList.contains("loader-hidden")) {
        const elapsed = Date.now() - startTime;
        const remaining = MIN_DISPLAY_TIME - elapsed;

        // If 4s hasn't passed, wait the remaining time
        if (remaining > 0) {
            setTimeout(dismissPreloader, remaining);
            return;
        }

        // Otherwise dismiss
        loader.classList.add("loader-hidden");
        if(container) container.classList.add("content-visible");
        setTimeout(() => { if(loader.parentNode) loader.parentNode.removeChild(loader); }, 500);
    }
}

// --- MAIN CONFIG ---
const storeSchedule = { 0: { open: 1200, close: 1800 }, 1: { open: 1100, close: 2000 }, 2: { open: 1100, close: 2000 }, 3: { open: 1100, close: 2000 }, 4: { open: 1100, close: 2000 }, 5: { open: 1100, close: 2000 }, 6: { open: 1100, close: 2000 } };
const LASTFM_USER = 'ATTFayetteville'; 
const LASTFM_API_KEY = 'f7020f441263b35598d85540e23c950c';

// --- PWA LOGIC (iOS UPDATED) ---
let deferredPrompt;
const installBtn = document.getElementById('headerInstallBtn');
const installBanner = document.getElementById('install-banner');
const bannerInstallBtn = document.getElementById('banner-install-btn');
const bannerCloseBtn = document.getElementById('banner-close');

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); 
    deferredPrompt = e; 
    if(installBtn) installBtn.style.display = 'flex';
    let visits = localStorage.getItem('siteVisits') || 0;
    visits++;
    localStorage.setItem('siteVisits', visits);
    if (visits >= 2 && installBanner) {
        setTimeout(() => { installBanner.classList.add('visible'); }, 1500); 
    }
});

// Force button on iOS
if (isIOS && !isStandalone && installBtn) {
    installBtn.style.display = 'flex';
}

if(installBtn) installBtn.addEventListener('click', triggerInstall);
if(bannerInstallBtn) bannerInstallBtn.addEventListener('click', () => { triggerInstall(); installBanner.classList.remove('visible'); });
if(bannerCloseBtn) bannerCloseBtn.addEventListener('click', () => { installBanner.classList.remove('visible'); });

async function triggerInstall() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null; 
        if(installBtn) installBtn.style.display = 'none';
    } else if (isIOS) {
        document.getElementById('ios-install-overlay').classList.remove('hidden');
    }
}

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", function () {
    // Attempt dismissal (will be deferred by logic if < 4s)
    dismissPreloader();

    const container = document.getElementById("mainContainer");
    const video = document.getElementById("bg-video");

    function showVideo() { if(video) video.style.opacity = '1'; const sk = document.getElementById('video-skeleton'); if(sk) sk.style.display = 'none'; }
    if (video) {
        if (video.readyState >= 3) { showVideo(); } else { video.addEventListener('loadeddata', showVideo); video.addEventListener('canplay', showVideo); }
    }

    checkStoreStatus();
    fetchWeather();
    if(isStoreOpen()) { fetchNowPlaying(); setInterval(fetchNowPlaying, 30000); }
    fetchLeaderboard();

    document.querySelectorAll('.btn, .video-close-btn').forEach(btn => {
        btn.addEventListener('click', function(e) { playJelly(this); });
    });

    const contactBtn = document.getElementById('contactBtn');
    if(contactBtn) contactBtn.addEventListener('click', () => document.getElementById('contact-overlay').classList.remove('hidden'));
    
    const callBtn = document.getElementById('callBtn');
    if(callBtn) callBtn.addEventListener('click', () => { if(isStoreOpen()) { window.location.href = "tel:4794395471"; } else { document.getElementById('closed-overlay').classList.remove('hidden'); } });
    
    let currentLastFmUrl = "";
    const lastFmBtn = document.getElementById('lastfm-link');
    const lastFmOverlay = document.getElementById('lastfm-confirm-overlay');
    const confirmLastFm = document.getElementById('confirm-lastfm-btn');

    if(lastFmBtn) lastFmBtn.addEventListener('click', function(e) {
        e.preventDefault();
        currentLastFmUrl = this.href;
        if(currentLastFmUrl === '#' || !currentLastFmUrl) return; 
        lastFmOverlay.classList.remove('hidden');
    });

    if(confirmLastFm) confirmLastFm.addEventListener('click', function() {
        window.open(currentLastFmUrl, '_blank');
        lastFmOverlay.classList.add('hidden');
    });

    const googleBtn = document.getElementById('googleBtn');
    const googleOverlay = document.getElementById('google-confirm-overlay');
    const confirmGoogle = document.getElementById('confirm-google-btn');

    if(googleBtn) googleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        googleOverlay.classList.remove('hidden');
    });

    if(confirmGoogle) confirmGoogle.addEventListener('click', function() {
        window.open("https://search.google.com/local/writereview?placeid=ChIJ84Inr4tryYcRQUkKOVeSnF8", '_blank');
        googleOverlay.classList.add('hidden');
    });

    const purposeBtn = document.getElementById('purposeBtn');
    const purposeOverlay = document.getElementById('purpose-video-overlay');
    const purposeVideo = document.getElementById('purpose-video');
    
    if(purposeBtn) purposeBtn.addEventListener('click', function() {
        purposeOverlay.classList.remove('hidden');
        purposeVideo.currentTime = 0; purposeVideo.play();
    });
    if(purposeOverlay) purposeOverlay.addEventListener('click', function(e) { if (e.target === purposeOverlay) closeVideoOverlay(); });

    const savedScore = localStorage.getItem('attSnakeHighScore');
    if(savedScore) document.getElementById('highScore').innerText = savedScore;

    const nameInput = document.getElementById('gameover-name-input');
    if(nameInput) {
        nameInput.addEventListener('input', (e) => {
            localStorage.setItem('attSnakeCachedName', e.target.value);
        });
    }
});

function closeVideoOverlay() {
    const purposeOverlay = document.getElementById('purpose-video-overlay');
    const purposeVideo = document.getElementById('purpose-video');
    purposeVideo.pause(); purposeOverlay.classList.add('hidden');
}
function closeOverlay(id) { document.getElementById(id).classList.add('hidden'); }
function playJelly(element) { element.classList.remove('btn-animate'); void element.offsetWidth; element.classList.add('btn-animate'); }

function getCentralTime() { const d = new Date(); return new Date(d.toLocaleString("en-US", {timeZone: "America/Chicago"})); }
function isStoreOpen() { const now = getCentralTime(); const day = now.getDay(); const currentMilitaryTime = (now.getHours() * 100) + now.getMinutes(); const todayHours = storeSchedule[day]; return (currentMilitaryTime >= todayHours.open && currentMilitaryTime < todayHours.close); }
function checkStoreStatus() { const now = getCentralTime(); const day = now.getDay(); const todayHours = storeSchedule[day]; const badge = document.getElementById('hours-badge'); if(!badge) return; const formatTime = (num) => { let hour = Math.floor(num / 100); let ampm = hour >= 12 ? 'PM' : 'AM'; let displayHour = hour % 12; displayHour = displayHour ? displayHour : 12; return displayHour + ampm; }; const openStr = formatTime(todayHours.open); const closeStr = formatTime(todayHours.close); badge.classList.remove('skeleton', 'skeleton-text'); badge.style.width = 'auto'; if (isStoreOpen()) { badge.innerHTML = `<span id="status-dot" class="pulsing-dot dot-open"></span> Open (${openStr} - ${closeStr})`; } else { badge.innerHTML = `<span id="status-dot" class="pulsing-dot dot-closed"></span> Closed Now`; document.getElementById('closed-msg').innerText = `We are currently closed. Our hours today are ${openStr} to ${closeStr}. (Hours may vary on holidays)`; } }
async function fetchWeather() { try { const lat = 36.0822; const lon = -94.1719; const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&temperature_unit=fahrenheit`; const response = await fetch(url); const data = await response.json(); if (data.current) { updateWeatherUI(Math.round(data.current.temperature_2m), data.current.weather_code, data.current.is_day); } } catch (error) { document.getElementById('weather-widget').style.display = 'none'; } }
function updateWeatherUI(temp, code, isDay) { const tempEl = document.getElementById('weather-temp'); const iconEl = document.getElementById('weather-icon'); if(!tempEl || !iconEl) return; tempEl.classList.remove('skeleton', 'skeleton-text'); tempEl.style.width = 'auto'; iconEl.classList.remove('skeleton', 'skeleton-text'); iconEl.style.width = 'auto'; tempEl.innerText = `${temp}°F`; if (temp <= 32) document.getElementById('ice-border').style.display = 'block'; if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) { iconEl.innerText = "🌧️"; startPrecipitation('rain'); } else if ([71, 73, 75, 77, 85, 86].includes(code)) { iconEl.innerText = "❄️"; startPrecipitation('snow'); } else if ([45, 48].includes(code)) { iconEl.innerText = "🌫️"; document.getElementById('fog-container').style.display = 'block'; } else if ([95, 96, 99].includes(code)) { iconEl.innerText = "⛈️"; startPrecipitation('rain'); } else if (code <= 3) { if (code === 0) { iconEl.innerText = isDay === 1 ? "☀️" : "🌙"; } else { iconEl.innerText = isDay === 1 ? "☁️" : "☁️"; } } }
function startPrecipitation(type) { const container = document.getElementById('weather-container'); if(!container) return; for (let i = 0; i < 50; i++) { const p = document.createElement('div'); p.classList.add(type); p.style.left = Math.random() * 100 + 'vw'; p.style.animationDuration = (Math.random() * 1 + 0.5) + 's'; p.style.animationDelay = Math.random() * 2 + 's'; container.appendChild(p); } }

async function fetchNowPlaying() {
    try {
        const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&limit=1`;
        const response = await fetch(url);
        const data = await response.json();
        const track = data.recenttracks.track[0];
        if (track) {
            const musicSection = document.getElementById('music-section');
            musicSection.style.display = 'block';
            const titleEl = document.getElementById('track-title');
            const artistEl = document.getElementById('track-artist');
            const artEl = document.getElementById('track-art');
            const linkEl = document.getElementById('lastfm-link');
            titleEl.innerText = track.name;
            artistEl.innerText = track.artist['#text'];
            linkEl.href = track.url; 
            if (track.image && track.image[1]['#text']) { artEl.src = track.image[1]['#text']; } else { artEl.src = 'https://via.placeholder.com/50'; }
            titleEl.classList.remove('skeleton', 'skeleton-text');
            artistEl.classList.remove('skeleton', 'skeleton-text');
        }
    } catch (error) { console.log("Music error"); }
}

// Absolute Failsafe
setTimeout(dismissPreloader, 7000); 
window.addEventListener('load', dismissPreloader);

if ('serviceWorker' in navigator) {
window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
    .catch(err => console.log('SW Failed:', err));
});
}
