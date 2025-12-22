// --- LEADERBOARD CONFIGURATION ---
const DREAMLO_PUBLIC = "6942f2278f40bbcf805cdd26";  
const DREAMLO_PRIVATE = "fKYDKbAwxUW9b4L3xT98OQRWMO4zuSWEixyiSgUfLM6g"; 
const MAX_SCORES_TO_SHOW = 5;
let globalScores = []; 
let scoreMilestones = []; 

// --- PROFANITY FILTER ---
let BAD_WORDS_LIST = [];

// Fetch the list on load
fetch('data/bad-words-comma.txt')
    .then(response => response.text())
    .then(text => {
        BAD_WORDS_LIST = text.split(',').map(w => w.trim().toLowerCase()).filter(w => w.length > 0);
        console.log(`Loaded ${BAD_WORDS_LIST.length} bad words.`);
    })
    .catch(err => console.error("Failed to load bad words list:", err));

function isProfane(text) {
    if (!text || BAD_WORDS_LIST.length === 0) return false;
    
    let normalized = text.toLowerCase();
    normalized = normalized.replace(/0/g, 'o');
    normalized = normalized.replace(/1/g, 'i');
    normalized = normalized.replace(/!/g, 'i');
    normalized = normalized.replace(/3/g, 'e');
    normalized = normalized.replace(/4/g, 'a');
    normalized = normalized.replace(/@/g, 'a');
    normalized = normalized.replace(/5/g, 's');
    normalized = normalized.replace(/\$/g, 's');
    normalized = normalized.replace(/7/g, 't');
    normalized = normalized.replace(/\+/g, 't');
    
    return BAD_WORDS_LIST.some(bad => normalized.includes(bad));
}

// Fetch Scores
async function fetchLeaderboard() {
    const btn = document.getElementById('refresh-scores-btn');
    if(btn) btn.classList.add('spin-anim');

    const targetUrl = `http://dreamlo.com/lb/${DREAMLO_PUBLIC}/json?t=${new Date().getTime()}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        const dataWrapper = await response.json();
        
        if (!dataWrapper.contents) throw new Error("No content from proxy");
        const data = JSON.parse(dataWrapper.contents);
        
        const listContainer = document.getElementById('leaderboard-list');
        if(listContainer) listContainer.innerHTML = ""; 

        if (!data.dreamlo || !data.dreamlo.leaderboard) {
            if(listContainer) listContainer.innerHTML = "<p>No scores yet!</p>";
            globalScores = [];
            scoreMilestones = [];
            localStorage.removeItem('attSnakeSubmittedName'); 
            return;
        }

        let scores = data.dreamlo.leaderboard.entry;
        if (!Array.isArray(scores)) scores = [scores];

        scores.sort((a, b) => parseInt(b.score) - parseInt(a.score)); 
        globalScores = scores; 
        
        const localHigh = parseInt(localStorage.getItem('attSnakeHighScore')) || 0;
        const localName = localStorage.getItem('attSnakeSubmittedName');

        if (localHigh > 0 && localName) {
            const isVerifiedOnBoard = globalScores.some(entry => 
                entry.name === localName && parseInt(entry.score) === localHigh
            );
            if (!isVerifiedOnBoard) {
                console.log("Sync: Resetting submission status.");
                localStorage.removeItem('attSnakeSubmittedName');
            }
        }
        
        const top5Scores = scores.slice(0, MAX_SCORES_TO_SHOW);
        scoreMilestones = [...new Set(top5Scores.map(s => parseInt(s.score)))].sort((a,b) => a-b);

        const topScores = scores.slice(0, MAX_SCORES_TO_SHOW);

        if(listContainer) {
            topScores.forEach((entry, index) => {
                const item = document.createElement('div');
                item.style.borderBottom = "1px solid #eee";
                item.style.padding = "8px 0";
                item.style.display = "flex";
                item.style.justifyContent = "space-between";
                item.style.fontSize = "14px";
                if (index === 0) item.style.fontWeight = "bold";
                item.innerHTML = `<span><b>#${index + 1}</b> ${entry.name}</span> <span>${entry.score} pts</span>`;
                listContainer.appendChild(item);
            });
        }
    } catch (error) {
        console.log("Leaderboard fetch error: " + error);
    } finally {
        if(btn) btn.classList.remove('spin-anim');
    }
}

// Save Score
async function submitScoreFromGame() {
    const usernameInput = document.getElementById('gameover-name-input');
    const msg = document.getElementById('gameover-msg');
    const rawName = usernameInput.value.trim();
    
    const currentSessionScore = parseInt(document.getElementById('final-score').innerText) || 0;
    const allTimeHighScore = parseInt(localStorage.getItem('attSnakeHighScore')) || 0;
    const scoreToSubmit = Math.max(currentSessionScore, allTimeHighScore);

    if (!rawName) { alert("Please enter a name!"); return; }
    
    if (isProfane(rawName)) { 
        alert("⚠️ Please choose a cleaner name!"); 
        return; 
    }

    const targetUrl = `http://dreamlo.com/lb/${DREAMLO_PRIVATE}/add/${encodeURIComponent(rawName)}/${scoreToSubmit}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
    
    try {
        await fetch(proxyUrl);
        localStorage.setItem('attSnakeSubmittedName', rawName);
        localStorage.removeItem('attSnakeCachedName');
        usernameInput.value = ""; 
        alert(`Score of ${scoreToSubmit} saved to Leaderboard as ${rawName}!`);
        document.getElementById('save-score-area').style.display = 'none';
        msg.innerText = "Score Saved!";
        msg.style.display = 'block';
        msg.style.color = '#2ecc71';
        fetchLeaderboard(); 
    } catch (error) { 
        console.error(error);
        alert("Saved locally. (Network issue - Score safe on device)"); 
    }
}

// Hook up the refresh button
document.addEventListener("DOMContentLoaded", function() {
    const refreshBtn = document.getElementById('refresh-scores-btn');
    if(refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            fetchLeaderboard();
        });
    }
});
