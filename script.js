// Game elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startButton = document.getElementById('startButton');
const restartBtn = document.getElementById('restartBtn');
const finalScore = document.getElementById('finalScore');

//sound
const flapSound = new Audio("assets/sounds/SFX_ Wing - Flappy Bird.mp3");
const bgMusic = new Audio("assets/sounds/Flappy Bird Theme Song.mp3");
bgMusic.loop = true;
const themeSound = new Audio("assets/sounds/Flappy Bird Theme Song.mp3");
// Game variables
let score = 0;
let frames = 0;
let gameStarted = false;
let gameOverFlag = false;
let animationId;

// Images
const background = new Image();
const fishImg = new Image();
const pipeImg = new Image();
background.src = 'assets/background.jpg';
fishImg.src = 'assets/fish.png';
pipeImg.src = 'assets/pipe.png';

// Fish properties
const fish = {
  x: 50,
  y: canvas.height / 2,
  width: 80,  // ← Increase width (original: 30)
  height: 100, // ← Increase height (original: 20)
  velocity: 0,
  gravity: 0.5,
  jump: -10,
  color: '#FF6347'
};

// Pipes
const pipes = [];
const pipeWidth = 50;
const pipeGap = 120;
const pipeFrequency = 100;

// Event listeners
startButton.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
document.addEventListener('keydown', handleKeyPress);
canvas.addEventListener('click', handleClick);

function handleKeyPress(e) {
    if ((e.code === 'Space' || e.key === ' ') && gameStarted && !gameOverFlag) {
        fishJump();
    }
}

function handleClick() {
    if (gameStarted && !gameOverFlag) {
        fishJump();
    }
}

function fishJump() {
    fish.velocity = fish.jump;
    flapSound.currentTime = 0;
    flapSound.play();
}

function startGame() {
    startScreen.style.display = 'none';
    gameStarted = true;
    gameOverFlag = false;
    score = 0;
    pipes.length = 0;
    fish.y = canvas.height / 2;
    fish.velocity = 0;
    frames = 0;
    
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    themeSound.currentTime = 0;
    themeSound.play();
    gameLoop();
}

function restartGame() {
    gameOverScreen.style.display = 'none';
    gameStarted = true;
    gameOverFlag = false;
    score = 0;
    pipes.length = 0;
    fish.y = canvas.height / 2;
    fish.velocity = 0;
    frames = 0;
    
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    themeSound.currentTime = 0;
    themeSound.play();
    gameLoop();
}

function gameLoop() {
    update();
    draw();
    
    if (!gameOverFlag) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

function update() {
    if (gameOverFlag) return;
    
    // Update fish
    fish.velocity += fish.gravity;
    fish.y += fish.velocity;
    
    // Check fish boundaries
    if (fish.y < 0) {
        fish.y = 0;
        fish.velocity = 0;
    }
    
    if (fish.y + fish.height > canvas.height) {
        endGame();
        return;
    }
    
    // Generate pipes
    if (frames % pipeFrequency === 0) {
        const pipeHeight = Math.floor(Math.random() * (canvas.height - pipeGap - 100)) + 50;
        pipes.push({
            x: canvas.width,
            topHeight: pipeHeight,
            bottomY: pipeHeight + pipeGap,
            passed: false
        });
    }
    
    // Update pipes
    for (let i = 0; i < pipes.length; i++) {
        pipes[i].x -= 2;
        
        // Check collision
        if (
            fish.x + fish.width > pipes[i].x &&
            fish.x < pipes[i].x + pipeWidth &&
            (fish.y < pipes[i].topHeight || fish.y + fish.height > pipes[i].bottomY)
        ) {
            endGame();
            return;
        }
        
        // Check if fish passed the pipe
        if (!pipes[i].passed && fish.x > pipes[i].x + pipeWidth) {
            pipes[i].passed = true;
            score++;
        }
        
        // Remove pipes that are off screen
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
            i--;
        }
    }
    
    frames++;
}

function draw() {
    // Draw background
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    
    // Draw pipes
    for (const pipe of pipes) {
        // Top pipe
        ctx.drawImage(pipeImg, pipe.x, 0, pipeWidth, pipe.topHeight);
        
        // Bottom pipe
        ctx.drawImage(pipeImg, pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);
    }
    
    // Draw fish
    ctx.drawImage(fishImg, fish.x, fish.y, fish.width, fish.height);
    
    // Draw score
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function endGame() {
    gameOverFlag = true;
    themeSound.pause();
    finalScore.textContent = `Your Score: ${score}`;
    gameOverScreen.style.display = 'flex';
}