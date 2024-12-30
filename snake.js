const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const recordList = document.getElementById('records');
const statusScore = document.getElementById('statusScore');
const statusSpeed = document.getElementById('statusSpeed');
const speedLabels = ["Very Slow", "Slow", "Normal", "Fast", "Faster", "Super Fast", "Hyper Speed", "Insane"];
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gridSize = 20;
let snake, food, dx, dy, score;
let isPaused = false;
let currentSpeedIndex = 0;
const speeds = [120, 100, 90, 80, 70, 60, 50, 40]; // Rango de velocidades en ms

// Inicializar récords
if (!localStorage.getItem('highScores')) {
  localStorage.setItem('highScores', JSON.stringify([0]));
}

function initGame() {
  snake = [{ x: gridSize * 5, y: gridSize * 5 }];
  food = {
    x: Math.floor((Math.random() * canvas.width) / gridSize) * gridSize,
    y: Math.floor((Math.random() * canvas.height) / gridSize) * gridSize,
  };
  dx = gridSize;
  dy = 0;
  score = 0;
  isPaused = false;
  currentSpeedIndex = Math.floor(Math.random() * speeds.length);
  canvas.style.display = 'block';
  startScreen.classList.remove('active');
  updateStatusBar();
}

function updateStatusBar() {
  statusScore.textContent = `Score: ${score}`;
  statusSpeed.textContent = `Speed: ${speedLabels[currentSpeedIndex]}`;
}

// Dibujar un círculo
function drawCircle(x, y, radius, color) {
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

// Dibujar serpiente
function drawSnake() {
  snake.forEach((segment, index) => {
    const color = index === 0 ? '#4CAF50' : '#8BC34A'; // Cabeza más clara
    ctx.shadowColor = '#4CAF50';
    ctx.shadowBlur = 10;
    drawCircle(segment.x, segment.y, gridSize / 2, color);
  });
}

// Dibujar comida
function drawFood() {
  ctx.fillStyle = 'yellow';
  ctx.shadowColor = 'yellow';
  ctx.shadowBlur = 20;
  drawCircle(food.x, food.y, gridSize / 2, ctx.fillStyle);
}

// Mover serpiente
function moveSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);
  snake.pop();
}

// Comprobar colisiones
function checkCollision() {
  const head = snake[0];
  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
    return true;
  }
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      return true;
    }
  }
  return false;
}

// Comer comida
function eatFood() {
  const head = snake[0];
  if (head.x === food.x && head.y === food.y) {
    snake.push({});
    food = {
      x: Math.floor((Math.random() * canvas.width) / gridSize) * gridSize,
      y: Math.floor((Math.random() * canvas.height) / gridSize) * gridSize,
    };
    score++;

    // Cambiar velocidad al azar
    currentSpeedIndex = Math.floor(Math.random() * speeds.length);
    updateStatusBar();
  }
}

// Guardar récords
function saveHighScore(score) {
  let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

  // Verificar si el puntaje ya existe en la lista
  if (highScores.some(record => record.score === score)) {
    return;
  }

  // Verifica si el puntaje debe guardarse (está entre los 5 mejores o la lista tiene menos de 5)
  if (highScores.length < 5 || score > highScores[highScores.length - 1].score) {
    const name = prompt('¡Nuevo récord! Ingresa tu nombre:');
    if (name) {
      highScores.push({ name, score });
      highScores.sort((a, b) => b.score - a.score); // Ordenar de mayor a menor
      if (highScores.length > 5) highScores.pop(); // Mantener solo los 5 mejores
      localStorage.setItem('highScores', JSON.stringify(highScores));
    }
  }
}


// Mostrar récords
function showHighScores() {
  const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
  recordList.innerHTML = '';
  highScores.forEach((record, index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${record.name} - ${record.score}`;
    recordList.appendChild(li);
  });
}

// Redirigir a pantalla de inicio
function goToStartScreen() {
  canvas.style.display = 'none';
  startScreen.classList.add('active');
  showHighScores();
}

// Ciclo principal
function gameLoop() {
  if (!isPaused) {
    if (checkCollision()) {
      alert(`¡Perdiste! Tu puntuación fue: ${score}`);
      saveHighScore(score);
      goToStartScreen(); // Volver a la pantalla de inicio
      return; // Detener el ciclo
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFood();
    moveSnake();
    eatFood();
    drawSnake();
    updateStatusBar();
  }
  setTimeout(gameLoop, speeds[currentSpeedIndex]);
}

// Control del teclado
document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':
      if (dy === 0) { // Evitar giro de 180 grados si ya se mueve verticalmente
        dx = 0;
        dy = -gridSize;
      }
      break;
    case 'ArrowDown':
      if (dy === 0) { // Evitar giro de 180 grados si ya se mueve verticalmente
        dx = 0;
        dy = gridSize;
      }
      break;
    case 'ArrowLeft':
      if (dx === 0) { // Evitar giro de 180 grados si ya se mueve horizontalmente
        dx = -gridSize;
        dy = 0;
      }
      break;
    case 'ArrowRight':
      if (dx === 0) { // Evitar giro de 180 grados si ya se mueve horizontalmente
        dx = gridSize;
        dy = 0;
      }
      break;
    case 'p':
      isPaused = !isPaused;
      break;
    case 't':
      document.body.classList.toggle('dark');
      document.body.classList.toggle('light');
      break;
  }
});

// Botón de inicio
startButton.addEventListener('click', () => {
  initGame();
  gameLoop();
});

// Mostrar los récords al cargar
showHighScores();
