
//board
let board;
let boardWidth = screen.width;
let boardHeight = screen.height;
let context;

//bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImgs = [];
let birdImgsIndex = 0;

let bird
 = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight,
}

//pipes

let pipearray = [];
let pipeWidth = 62;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;


let topPipeImg;
let buttonPipeImg;

//game physics
let gravity = 0.4;
let velocityX = -2;
let velocityY = 0;
// let lift = -15;

let gameOver = false;
let score = 0;
let gameStarted = false;
let startCountdown = 3;

let wingSound = new Audio("./audio/sfx_wing.wav");
let pointSound = new Audio("./audio/sfx_point.wav");
let hitSound = new Audio("./audio/sfx_hit.wav");
let dieSound = new Audio("./audio/sfx_die.wav");
let bgm = new Audio("./audio/bgm_mario.mp3");
bgm.loop = true;

window.onload = function() {
   
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");


    //bird image
    // birdImg = new Image();
    // birdImg.src = "./img/flappybird.png";
    // birdImg.onload = function() {
    //     context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    // }

    for (let i = 1; i <= 3; i++) {
        let birdImg = new Image();
        birdImg.src = `./img/flappybird${i}.png`;
        birdImgs.push(birdImg);
    }

    //pipes images
    topPipeImg = new Image();
    topPipeImg.src = "./img/toppipe.png";
  
    buttonPipeImg = new Image();
    buttonPipeImg.src = "./img/bottompipe.png";
  


    requestAnimationFrame(update);
    setInterval(placePipes, 1500);
    this.setInterval(animateBird, 100);
    document.addEventListener("keydown", moveBird);  

    //Mobile touch support
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);
    
    
        // Draw initial screen
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText("Press ENTER to Start", 30, boardHeight / 2);

}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    if (!gameStarted) {
        context.clearRect(0, 0, boardWidth, boardHeight);
        context.fillStyle = "white";
        context.font = "45px sans-serif";
        context.fillText("Starting in: " + startCountdown, 60, boardHeight / 2);
        return;
    }
        // clear board
        context.clearRect(0, 0, boardWidth, boardHeight);

        // draw bird
        velocityY += gravity;
        bird.y = Math.max(bird.y + velocityY,0); //gravity effect 
        context.drawImage(birdImgs[birdImgsIndex], bird.x, bird.y, bird.width, bird.height);
        // birdImgsIndex++;
        // birdImgsIndex %= birdImgs.length;

        if (birdImgsIndex >= birdImgs.length) {
            birdImgsIndex = 0;
        }

        if (bird.y > boardHeight) {

            gameOver = true;
        }

        // draw pipes
        for (let i = 0; i < pipearray.length; i++) {
            let pipe = pipearray[i];
            pipe.x += velocityX; //move pipe to left
            context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

            if( !pipe.passed && bird.x > pipe.x + pipe.width) {
                score += 0.5;
                pipe.passed = true;
            }

            if (detectCollision(bird, pipe)) {
                hitSound.play();
                gameOver = true;
            }
        }

        // clean up pipes
        while (pipearray.length > 0 && pipearray[0].x < -pipeWidth) {
            pipearray.shift();
        }
        //score
        context.fillStyle = "white";
        context.font = "45px sans-serif";
        context.fillText(score,20, 50);

        if(gameOver) {
            context.fillStyle = "white";
            context.font = "45px sans-serif";
            context.fillText("Game Over!", 50, 300);
            bgm.pause();
            bgm.currentTime = 0;
            dieSound.play();
        }
}

animateBird = function() {
    birdImgsIndex++;
    birdImgsIndex %= birdImgs.length;
}
placePipes = function() {
    if (gameOver) {
        return;
    }
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    openingHeight = boardHeight / 4;

    let topPipe ={
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipearray.push(topPipe);

    let bottomPipe ={
        img : buttonPipeImg,
        x : pipeX,  
        y : randomPipeY + pipeHeight + openingHeight,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipearray.push(bottomPipe);

}

function moveBird(e) {
     if (e.code == "Enter" && !gameStarted && !gameOver) {
        // Start countdown timer
        gameStarted = true;
        startCountdown = 3;
        let countdown = setInterval(() => {
            startCountdown--;
            if (startCountdown < 0) {
                clearInterval(countdown);
                if(bgm.paused) {
                    bgm.play();
                }
            }
        }, 1000);
        return;
    }
     if(bgm.paused) {
        bgm.play();
     }
    if (e.code == "Space" || e.code == "ArrowUp") {
       
        wingSound.play();
        //jump 
         velocityY = -6;
    }
    if (gameOver && e.code == "Enter") {
        //restart the game
        bird.y = birdY;
        pipearray = [];
        score = 0;
        velocityY = 0;
        gameOver = false;
    }
        
}
function handleTouchStart(e) {
    if (!gameStarted && !gameOver) {
        startGame();
    } else if (gameStarted && !gameOver) {
        wingSound.play();
        velocityY = -6;
    } else if (gameOver) {
        restartGame();
    }
}

function handleTouchEnd(e) {
    // Prevent default scrolling on mobile
    e.preventDefault();
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;

}
function restartGame() {
    bird.y = birdY;
    pipearray = [];
    score = 0;
    velocityY = 0;
    gameOver = false;
    gameStarted = false;
}