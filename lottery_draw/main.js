let selectedNumbers = [];
let winningNumbers = [];
let isDrawing = false;
let gamesPlayed = 0;
let bestMatch = 0;
let totalWinnings = 0;
let countdownInterval;
let timeLeft = 30; // seconds
let rollingInterval;

const numberPool = document.getElementById('number-pool');
const lotteryDisplay = document.getElementById('lottery-display');
const startDrawButton = document.getElementById('start-draw');
const quickPickButton = document.getElementById('quick-pick');
const resultsDiv = document.getElementById('results');
const matchesMessage = document.getElementById('matches-message');
const gamesPlayedElement = document.getElementById('games-played');
const bestResultElement = document.getElementById('best-result');
const totalWinningsElement = document.getElementById('total-winnings');
const timerElement = document.getElementById('timer');
const machine = document.getElementById('machine');

function initNumberPool() {
    numberPool.innerHTML = '';
    for (let i = 1; i <= 49; i++) {
        const numberDiv = document.createElement('div');
        numberDiv.className = 'number';
        numberDiv.textContent = i;
        numberDiv.onclick = () => toggleNumberSelection(i, numberDiv);
        numberPool.appendChild(numberDiv);
    }
}

function toggleNumberSelection(number, element) {
    if (isDrawing) return;
    
    if (selectedNumbers.includes(number)) {
        selectedNumbers = selectedNumbers.filter(n => n !== number);
        element.classList.remove('selected');
    } else if (selectedNumbers.length < 6) {
        selectedNumbers.push(number);
        element.classList.add('selected');
    }
}

function generateWinningNumbers() {
    const numbers = [];
    while (numbers.length < 6) {
        const randomNum = Math.floor(Math.random() * 49) + 1;
        if (!numbers.includes(randomNum)) {
            numbers.push(randomNum);
        }
    }
    return numbers;
}

function revealWinningNumbers() {
    clearInterval(rollingInterval); 
    winningNumbers = generateWinningNumbers();
    isDrawing = true;
    winningNumbers = generateWinningNumbers();
    isDrawing = true;
    
    document.querySelectorAll('.ball').forEach(ball => {
        ball.textContent = '?';
        ball.className = 'ball';
    });
    
    winningNumbers.forEach((number, index) => {
        setTimeout(() => {
            const ball = document.getElementById(`ball-${index + 1}`);
            ball.textContent = number;
            ball.classList.add('revealed');
            
            const numberElements = document.querySelectorAll('.number');
            numberElements.forEach(elem => {
                if (parseInt(elem.textContent) === number) {
                    elem.classList.add('winning');
                }
            });
            
            if (index === 5) {
                setTimeout(() => {
                    checkMatches();
                    isDrawing = false;
                    updateStats();
                }, 1000);
            }
        }, (index + 1) * 1500);
    });
}

function checkMatches() {
    const matches = selectedNumbers.filter(num => winningNumbers.includes(num));
    let message = '';
    let winnings = 0;
    
    switch(matches.length) {
        case 0:
        case 1:
        case 2:
            message = `You matched ${matches.length} numbers. No prize this time.`;
            break;
        case 3:
            winnings = 20;
            message = `You matched 3 numbers! You win $${winnings}!`;
            createConfetti();
            break;
        case 4:
            winnings = 100;
            message = `You matched 4 numbers! You win $${winnings}!`;
            break;
        case 5:
            winnings = 1000;
            message = `You matched 5 numbers! You win $${winnings}!`;
            break;
        case 6:
            winnings = 10000000;
            message = `JACKPOT! You matched all 6 numbers! You win $${winnings.toLocaleString()}!`;
            createConfetti();
            break;
    }
    
    totalWinnings += winnings;
    matchesMessage.textContent = message;
    resultsDiv.classList.add('visible');
    
    if (matches.length > bestMatch) {
        bestMatch = matches.length;
    }
}

function updateStats() {
    gamesPlayed++;
    gamesPlayedElement.textContent = gamesPlayed;
    bestResultElement.textContent = `${bestMatch} matches`;
    totalWinningsElement.textContent = `$${totalWinnings.toLocaleString()}`;
}

function createConfetti() {
    const colors = ['#ff0', '#f0f', '#0ff', '#0f0', '#00f', '#f00'];
    
    for (let i = 0; i < 200; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
        confetti.style.animationDelay = `${Math.random() * 2}s`;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

function quickPick() {
    if (isDrawing) return;
    selectedNumbers = [];
    document.querySelectorAll('.number').forEach(num => {
        num.classList.remove('selected');
    });
    
    while (selectedNumbers.length < 6) {
        const randomNum = Math.floor(Math.random() * 49) + 1;
        if (!selectedNumbers.includes(randomNum)) {
            selectedNumbers.push(randomNum);
        }
    }
    
    selectedNumbers.forEach(num => {
        const numberElements = document.querySelectorAll('.number');
        numberElements.forEach(elem => {
            if (parseInt(elem.textContent) === num) {
                elem.classList.add('selected');
            }
        });
    });
}

function startRollingNumbers() {
    document.querySelectorAll('.ball').forEach(ball => {
        ball.style.opacity = "1";
        ball.style.transform = "scale(1) rotateY(0deg)";
    });
    
    clearInterval(rollingInterval);
    rollingInterval = setInterval(() => {
        if (!isDrawing) {
            document.querySelectorAll('.ball').forEach(ball => {
                ball.textContent = Math.floor(Math.random() * 49) + 1;
                ball.style.backgroundColor = `hsl(${Math.random() * 40 + 20}, 100%, 50%)`;
            });
        }
    }, 100);
}
function restartGame() {
    if (isDrawing) return;
    selectedNumbers = [];
    document.querySelectorAll('.number').forEach(num => {
        num.classList.remove('selected');
        num.classList.remove('winning');
    });
    
    document.querySelectorAll('.ball').forEach(ball => {
        ball.textContent = '?';
        ball.className = 'ball';
    });
    
    resultsDiv.classList.remove('visible');
    startCountdown();
    startRollingNumbers();
}

function startCountdown() {
    clearInterval(countdownInterval);
    timeLeft = 30;
    updateTimerDisplay();
    
    countdownInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            if (selectedNumbers.length === 6) {
                revealWinningNumbers();
            } else {
                timerElement.textContent = "Select 6 numbers to play!";
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    timerElement.textContent = `Next draw in: ${minutes}:${seconds}`;
}

function createMixingBalls() {
    for (let i = 0; i < 15; i++) {
        const ball = document.createElement('div');
        ball.className = 'mixing-balls';
        ball.style.left = `${Math.random() * 250}px`;
        ball.style.top = `${Math.random() * 150}px`;
        ball.style.backgroundColor = `hsl(${Math.random() * 60 + 30}, 100%, 50%)`;
        ball.style.animationDelay = `${Math.random() * 4}s`;
        machine.appendChild(ball);
    }
}

startDrawButton.addEventListener('click', () => {
    if (isDrawing) return;
    
    if (selectedNumbers.length === 6) {
        resultsDiv.classList.remove('visible');
        document.querySelectorAll('.number').forEach(num => {
            num.classList.remove('winning');
        });
        revealWinningNumbers();
        clearInterval(countdownInterval);
        timerElement.textContent = "Drawing in progress...";
    } else {
        alert("Please select exactly 6 numbers!");
    }
});

quickPickButton.addEventListener('click', quickPick);
document.getElementById('restart-game').addEventListener('click', restartGame);

window.onload = () => {
    initNumberPool();
    createMixingBalls();
    startCountdown();
    startRollingNumbers();
    
};

