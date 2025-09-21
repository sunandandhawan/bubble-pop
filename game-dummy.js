const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
let bubbles = [];
let score = 0;
let lastSpawn = 0;
let gameActive = true;

function randomColor() {
  const colors = ['#ff6384', '#36a2eb', '#ffce56', '#4caf50', '#9c27b0'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function spawnBubble() {
  const radius = Math.random() * 30 + 30;
  const x = Math.random() * (canvas.width - 2 * radius) + radius;
  const y = canvas.height + radius;
  const speed = Math.random() * 1.5 + 1;
  bubbles.push({ x, y, radius, color: randomColor(), speed });
}

function drawBubbles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const bubble of bubbles) {
    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
    ctx.fillStyle = bubble.color;
    ctx.globalAlpha = 0.8;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function updateBubbles() {
  for (const bubble of bubbles) {
    bubble.y -= bubble.speed;
  }
  bubbles = bubbles.filter(b => b.y + b.radius > 0);
}

function gameLoop(ts) {
  if (!gameActive) return;
  if (ts - lastSpawn > 700) {
    spawnBubble();
    lastSpawn = ts;
  }
  updateBubbles();
  drawBubbles();
  requestAnimationFrame(gameLoop);
}

function popBubble(x, y) {
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];
    const dx = x - b.x;
    const dy = y - b.y;
    if (dx * dx + dy * dy < b.radius * b.radius) {
      bubbles.splice(i, 1);
      score++;
      scoreEl.textContent = 'Score: ' + score;
      break;
    }
  }
}

canvas.addEventListener('pointerdown', function (e) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  popBubble(x, y);
});

window.addEventListener('resize', () => {
  // Responsive canvas for mobile
  const w = Math.min(window.innerWidth, 360);
  const h = Math.min(window.innerHeight, 640);
  canvas.width = w;
  canvas.height = h;
});

requestAnimationFrame(gameLoop);
