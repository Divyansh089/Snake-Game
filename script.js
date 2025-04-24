const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
const gameOverScreen = document.getElementById('game-over');
const restartBtn     = document.getElementById('restart-btn');

const GRID_SIZE = 20;
let snake, food, dx, dy, gamePaused, score;
let highScore = localStorage.getItem('highScore') || 0;

const currentScoreElem = document.getElementById('current-score');
const highScoreElem    = document.getElementById('high-score');

function initializeGame() {
  snake = [
    {
      x: Math.floor(canvas.width/2/GRID_SIZE)*GRID_SIZE,
      y: Math.floor(canvas.height/2/GRID_SIZE)*GRID_SIZE
    },
    {
      x: Math.floor(canvas.width/2/GRID_SIZE)*GRID_SIZE,
      y: Math.floor(canvas.height/2/GRID_SIZE)*GRID_SIZE + GRID_SIZE
    }
  ];
  food = generateFoodPosition();
  dx = 0; dy = -GRID_SIZE;
  score = 0;
  gamePaused = false;
  currentScoreElem.textContent = score;
  highScoreElem.textContent    = highScore;
  gameOverScreen.classList.remove('show');
}

function generateFoodPosition() {
  while (true) {
    const pos = {
      x: Math.floor(Math.random() * (canvas.width/GRID_SIZE)) * GRID_SIZE,
      y: Math.floor(Math.random() * (canvas.height/GRID_SIZE)) * GRID_SIZE
    };
    if (!snake.some(seg => seg.x === pos.x && seg.y === pos.y)) {
      return pos;
    }
  }
}

function checkCollision() {
  const head = snake[0];
  if (
    head.x < 0 || head.x >= canvas.width ||
    head.y < 0 || head.y >= canvas.height
  ) return true;
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) return true;
  }
  return false;
}

function update() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);

  if (checkCollision()) {
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('highScore', highScore);
      highScoreElem.textContent = highScore;
    }
    gamePaused = true;
    gameOverScreen.classList.add('show');
    return;
  }

  if (head.x === food.x && head.y === food.y) {
    score++;
    currentScoreElem.textContent = score;
    food = generateFoodPosition();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  // clear background
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw snake segments
  snake.forEach((seg, idx) => {
    const cx = seg.x + GRID_SIZE/2;
    const cy = seg.y + GRID_SIZE/2;
    const radius = GRID_SIZE/2 - 1;

    // bluish gradient
    const grad = ctx.createRadialGradient(
      cx, cy, radius*0.2,
      cx, cy, radius
    );
    if (idx === 0) {
      grad.addColorStop(0, '#80d8ff');
      grad.addColorStop(1, '#29b6f6');
    } else {
      grad.addColorStop(0, '#4fc3f7');
      grad.addColorStop(1, '#0288d1');
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI*2);
    ctx.fill();

    // head face
    if (idx === 0) {
      drawFace(cx, cy, radius);
    }
  });

  // draw apple
  drawApple(food.x, food.y);
}

function drawFace(cx, cy, r) {
  // eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx - r*0.4, cy - r*0.2, r*0.2, 0, Math.PI*2);
  ctx.arc(cx + r*0.4, cy - r*0.2, r*0.2, 0, Math.PI*2);
  ctx.fill();

  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(cx - r*0.4, cy - r*0.2, r*0.08, 0, Math.PI*2);
  ctx.arc(cx + r*0.4, cy - r*0.2, r*0.08, 0, Math.PI*2);
  ctx.fill();

  // smile
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy + r*0.1, r*0.4, 0, Math.PI);
  ctx.stroke();
}

function drawApple(x, y) {
  const cx = x + GRID_SIZE/2;
  const cy = y + GRID_SIZE/2;
  const r = GRID_SIZE/2 - 2;

  // body
  ctx.fillStyle = '#d32f2f';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.fill();

  // leaf
  ctx.fillStyle = '#388e3c';
  ctx.beginPath();
  ctx.ellipse(cx + r*0.4, cy - r*0.7, r*0.4, r*0.2, -Math.PI/4, 0, Math.PI*2);
  ctx.fill();

  // stem
  ctx.strokeStyle = '#6d4c41';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx, cy - r - 6);
  ctx.stroke();
}

function gameLoop() {
  if (!gamePaused) {
    update();
    const speed = Math.max(100, 500 - score * 20);
    setTimeout(gameLoop, speed);
  }
}

document.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowUp':
      if (dy === 0) { dx = 0; dy = -GRID_SIZE; }
      break;
    case 'ArrowDown':
      if (dy === 0) { dx = 0; dy = GRID_SIZE; }
      break;
    case 'ArrowLeft':
      if (dx === 0) { dx = -GRID_SIZE; dy = 0; }
      break;
    case 'ArrowRight':
      if (dx === 0) { dx = GRID_SIZE; dy = 0; }
      break;
  }
});

restartBtn.addEventListener('click', () => {
  initializeGame();
  gameLoop();
});

window.addEventListener('blur', () => { gamePaused = true; });
window.addEventListener('focus', () => {
  if (gamePaused) {
    gamePaused = false;
    gameLoop();
  }
});

// start
initializeGame();
gameLoop();
