// SNAKE GAME LOGIC
const canvas = document.getElementById("snakeCanvas"); 
const ctx = canvas ? canvas.getContext("2d") : null; 
const snakeImg = new Image(); snakeImg.src = 'media/phone.png'; 
const foodImg = new Image(); foodImg.src = 'media/bolt.png'; 
const GRID_SIZE = 20; const SPEED = 2; const TILE_COUNT = 15; 
let animationId; let gameRunning = false; let score = 0; let path = []; let snakeLength = 3; let headX = 0, headY = 0, velX = 0, velY = 0, nextVelX = 0, nextVelY = 0; let food = { x: 0, y: 0 }; let lastTime = 0; const targetFPS = 60; const frameInterval = 1000 / targetFPS;

const gameBtn = document.querySelector('.btn-game');
if(gameBtn) gameBtn.addEventListener('click', function() { playJelly(this); toggleGame(); });

function toggleGame() { 
    const g = document.getElementById('game-area'); 
    const lb = document.getElementById('store-leaderboard');
    const startOverlay = document.getElementById('start-overlay');
    const gameOverOverlay = document.getElementById('game-overlay');
    
    if(g.style.display==='block'){ 
        g.style.display='none'; 
        lb.style.display='none'; 
        stopGame(); 
    } else { 
        g.style.display='block'; 
        lb.style.display='block'; 
        g.scrollIntoView({ behavior: "smooth", block: "center" }); 
        
        // Fix: Use openOverlay helpers logic (manual here since it's inside game logic)
        startOverlay.classList.remove('hidden');
        startOverlay.classList.add('overlay-visible');
        gameOverOverlay.classList.remove('overlay-visible'); 
        gameOverOverlay.classList.add('hidden');
    } 
}

function startSession() { 
    document.getElementById('start-overlay').classList.remove('overlay-visible');
    setTimeout(() => document.getElementById('start-overlay').classList.add('hidden'), 300);
    initGame(); 
}

function initGame() { 
    stopGame(); 
    document.getElementById('game-overlay').classList.remove('overlay-visible'); 
    document.getElementById('game-overlay').classList.add('hidden');
    score = 0; snakeLength = 3; document.getElementById('score').innerText = score; headX = 140; headY = 140; path=[]; for(let i=0; i<snakeLength*10; i++){path.push({x:headX, y:headY+i});} velX=0; velY=-SPEED; nextVelX=0; nextVelY=-SPEED; spawnFood(); startCountdown(); 
}

function restartGame() { initGame(); }
function startCountdown() { let count=3; draw(); drawCountdownText(count); let t=setInterval(()=>{count--; if(count>0){draw(); drawCountdownText(count);}else{clearInterval(t); draw(); drawCountdownText("GO!"); setTimeout(()=>{gameRunning=true; lastTime=0; requestAnimationFrame(gameLoop);},500);}},1000); }
function drawCountdownText(t) { if(!ctx) return; ctx.save(); ctx.fillStyle="rgba(255,255,255,0.7)"; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle="#0057B8"; ctx.font="bold 80px 'Open Sans'"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(t,canvas.width/2,canvas.height/2); ctx.restore(); }
function stopGame() { gameRunning=false; cancelAnimationFrame(animationId); }
function spawnFood() { food.x = Math.floor(Math.random()*TILE_COUNT)*GRID_SIZE; food.y = Math.floor(Math.random()*TILE_COUNT)*GRID_SIZE; }
function gameLoop(t) { if(!gameRunning) return; if(!lastTime) lastTime=t; const dt=t-lastTime; if(dt>=frameInterval){update(); draw(); lastTime=t-(dt%frameInterval);} animationId=requestAnimationFrame(gameLoop); }

function update() { 
    if(headX%GRID_SIZE===0 && headY%GRID_SIZE===0){if(nextVelX!==0||nextVelY!==0){if(velX===0&&nextVelY!==-velY||velY===0&&nextVelX!==-velX){velX=nextVelX; velY=nextVelY;}}} 
    headX+=velX; headY+=velY; 
    path.unshift({x:headX, y:headY}); 
    if(path.length>snakeLength*10) path.pop(); 
    if(headX<0||headX>=300||headY<0||headY>=300){triggerGameOver(); return;} 
    let skip=20; 
    for(let i=skip; i<path.length; i++){if(path[i].x===headX && path[i].y===headY){triggerGameOver(); return;}} 
    if(Math.hypot(headX-food.x, headY-food.y)<SPEED){
        headX=food.x; headY=food.y; 
        score++; 
        document.getElementById('score').innerText=score; 
        snakeLength++; 
        spawnFood();
        
        if (scoreMilestones.length > 0 && score >= scoreMilestones[0]) {
            const rocket = document.getElementById('rocket-effect');
            if(rocket) {
                rocket.classList.remove('rocket-anim');
                void rocket.offsetWidth; 
                rocket.classList.add('rocket-anim');
            }
            document.body.classList.add('shake-screen');
            setTimeout(() => document.body.classList.remove('shake-screen'), 500);
            scoreMilestones.shift(); 
        }
    } 
}
function draw() { if(!ctx) return; ctx.fillStyle="#fff"; ctx.fillRect(0,0,300,300); ctx.drawImage(foodImg,food.x,food.y,20,20); const step=10; for(let i=0; i<path.length; i+=step){let idx=Math.floor(i); if(idx>=path.length) break; let seg=path[idx]; let ang=0; if(i===0){if(velX>0) ang=Math.PI/2; else if(velX<0) ang=-Math.PI/2; else if(velY>0) ang=Math.PI; else ang=0;}else{let n=Math.max(0,idx-step); let ns=path[n]; let dx=ns.x-seg.x; let dy=ns.y-seg.y; if(dx>0) ang=Math.PI/2; else if(dx<0) ang=-Math.PI/2; else if(dy>0) ang=Math.PI; else ang=0;} drawRotatedImage(snakeImg,seg.x,seg.y,ang);} }
function drawRotatedImage(img,x,y,ang){ ctx.save(); ctx.translate(x+10,y+10); ctx.rotate(ang); ctx.drawImage(img,-10,-10,20,20); ctx.restore(); }

// --- UPDATED GAME OVER TRIGGER ---
function triggerGameOver() { 
    gameRunning = false; 
    const finalScore = score;
    const savedHighScore = parseInt(localStorage.getItem('attSnakeHighScore')) || 0;
    const submittedName = localStorage.getItem('attSnakeSubmittedName');
    const gameOverBox = document.querySelector('#game-overlay');
    const saveReasonMsg = document.getElementById('save-reason-msg');
    const nameInput = document.getElementById('gameover-name-input');
    
    const bestScore = Math.max(finalScore, savedHighScore);
    
    if (finalScore > savedHighScore) {
        localStorage.setItem('attSnakeHighScore', finalScore);
        document.getElementById('highScore').innerText = finalScore;
        localStorage.removeItem('attSnakeSubmittedName');
        
        if (globalScores.length > 0 && finalScore > parseInt(globalScores[0].score)) {
            if(typeof confetti === "function") confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            gameOverBox.classList.add('bouncy-box');
            setTimeout(() => gameOverBox.classList.remove('bouncy-box'), 1000);
        }
    }

    document.getElementById('final-score').innerText = finalScore;

    const cachedName = localStorage.getItem('attSnakeCachedName');
    if(cachedName) nameInput.value = cachedName;

    if (bestScore > 0 && !submittedName) {
        document.getElementById('save-score-area').style.display = 'block';
        if (finalScore >= bestScore) {
            saveReasonMsg.innerText = "🎉 NEW HIGH SCORE!";
            saveReasonMsg.style.color = "#2ecc71";
        } else {
            saveReasonMsg.innerText = "Join the Leaderboard!";
            saveReasonMsg.style.color = "#fff";
        }
        const msg = document.getElementById('gameover-msg');
        msg.style.display = 'none'; 
    } else {
        document.getElementById('save-score-area').style.display = 'none';
        const msg = document.getElementById('gameover-msg');
        msg.innerText = "Keep practicing! 🐍";
        msg.style.display = 'block';
        msg.style.color = '#ffcc00'; 
    }
    
    const gapMsg = document.getElementById('leaderboard-gap-msg');
    if (globalScores.length > 0) {
        let nextTarget = null;
        let rank = 0;
        for (let i = globalScores.length - 1; i >= 0; i--) {
            if (parseInt(globalScores[i].score) > bestScore) {
                nextTarget = globalScores[i];
                rank = i + 1;
                break; 
            }
        }
        if (nextTarget) {
            const diff = parseInt(nextTarget.score) - bestScore + 1;
            gapMsg.innerText = `🔥 You need ${diff} more points to overtake #${rank} (${nextTarget.name})!`;
            gapMsg.style.display = 'block';
        } else if (globalScores.length < 5) {
                gapMsg.innerText = "Top 5 is wide open! Go for it!";
                gapMsg.style.display = 'block';
        } else {
            gapMsg.innerText = "You are the Snake Champion! 👑";
            gapMsg.style.display = 'block';
        }
    } else {
        gapMsg.style.display = 'none';
    }

    // FIX: REVEAL OVERLAY CORRECTLY
    gameOverBox.classList.remove('hidden');
    // Force reflow
    void gameOverBox.offsetWidth;
    gameOverBox.classList.add('overlay-visible'); 
}

if(canvas) {
    let tsX=0, tsY=0; 
    canvas.addEventListener('touchstart', e=>{tsX=e.changedTouches[0].screenX; tsY=e.changedTouches[0].screenY;}, {passive:false}); 
    canvas.addEventListener('touchend', e=>{if(!gameRunning)return; let dx=e.changedTouches[0].screenX-tsX; let dy=e.changedTouches[0].screenY-tsY; handleInput(dx,dy);}, {passive:false}); 
}

window.addEventListener('keydown', e => {
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
    if(!gameRunning || e.repeat) return; 
    switch(e.code) {
        case "ArrowLeft": handleInput(-100, 0); break;
        case "ArrowUp": handleInput(0, -100); break;
        case "ArrowRight": handleInput(100, 0); break;
        case "ArrowDown": handleInput(0, 100); break;
    }
});

function handleInput(dx,dy) { if(Math.abs(dx)<10 && Math.abs(dy)<10)return; if(Math.abs(dx)>Math.abs(dy)){if(dx>0){nextVelX=SPEED; nextVelY=0;}else{nextVelX=-SPEED; nextVelY=0;}}else{if(dy>0){nextVelX=0; nextVelY=SPEED;}else{nextVelX=0; nextVelY=-SPEED;}} }
