var blocks = initBlocks(11, 15);

var plateX = 24.5;
var ballX = 29;
var ballY = 3.5;
var ballVectorX = 0;
var ballVectorY = 1;

var gameStarted = false;
var gameNeedsRestart = false;

var id;
let fps = 60;
var field;
var ball;
var plate;
var score;
var restartB;
var startTime;
var duration = 1000; // 1 second or 1000ms
var distance = 60; // 60FPS
var fromPause = true;

function moveBall(timestamp) {
	this.ballY += 0.25*this.ballVectorY;
	ball.style.bottom = this.ballY + "vmin";
	this.ballX -= 0.35*this.ballVectorX;
	ball.style.left = this.ballX + "vmin";
	hitCheck();
	startTime = startTime || timestamp; // set startTime is null

	var timeElapsedSinceStart = timestamp - startTime;
	var progress = timeElapsedSinceStart / 1000;

	var safeProgress = Math.min( progress.toFixed(2), 1 ); // 2 decimal points

	var newPosition = safeProgress * distance;



	if( safeProgress >= 1 || fromPause === true){
		id = requestAnimationFrame(moveBall);
	}
}

function mainEventTrigger(event) {
	if (!gameNeedsRestart) {
		if (gameStarted) {
			event.innerHTML = "Continue";
			gameStarted = false;
			pauseGame();
		} else {
			event.innerHTML = "Pause";
			gameStart()
				restartB.style.display = "none"
			gameStarted = true;
		}
	}


}


function gameStart() {
	// this.moveBallTimeout = setInterval(moveBall, 20);
	window.addEventListener('keydown', onKeyDown, true);
	fromPause = true;
	id = requestAnimationFrame(moveBall)
}

function restart(event) {
	location.reload()
}

function pauseGame() {
	// clearInterval(this.moveBallTimeout);
	console.log(id)
	if (restartB.style.display === "none") {
		restartB.style.display = "block"
	}
	window.removeEventListener('keydown', onKeyDown, true);
	cancelAnimationFrame(id)
}

function stopGame() {
	gameStarted = false;
	gameNeedsRestart = true;
	pauseGame();
	document.getElementById("gameButton").style.visibility = "hidden"
}

function changeDir(brick = null) {
	if (checkIfHitsPlate()) {
		if (this.ballX === this.plateX + 4.5) {//hits center of plate
			this.ballVectorX = 0;
			this.ballVectorY = 1;
		} else if (this.ballX < this.plateX + 4.5) {//left
			this.ballVectorX = 1;
			this.ballVectorY = 1;
		} else if (this.ballX > this.plateX + 4.5) {//right
			this.ballVectorX = -1;
			this.ballVectorY = 1;
		}
	} else if (checkIfHitsLeftWall()) {
		this.ballVectorX = -1;
	} else if (checkIfHitsRightWall()) {
		this.ballVectorX = 1;
	} else if (this.ballY >= 67.5) {
		this.ballVectorY = this.ballVectorY === 1 ? -1 : 1;
	} else if (this.ballY-2.5 > brick.y && this.ballVectorX !== 0) {
		this.ballVectorX = this.ballVectorX === 1 ? -1 : 1;
	} else {
		this.ballVectorY = this.ballVectorY === 1 ? -1 : 1;	
	}
}

function onKeyDown(event) {
	//Move plate left-right
	//left
	if (event.keyCode === 37) {
		if (this.plateX >= 3.5) {
			this.plateX -= 3.5;
			this.plate.style.left = this.plateX + "vmin";
		}
	}
	//right
	if (event.keyCode === 39) {
		if (this.plateX <= 45.5) {
			this.plateX += 3.5;
			this.plate.style.left = this.plateX + "vmin";
		}
	}
}
function hitCheck() {
	for(var i = 0; i < blocks.length; ++i) {
		for(var j = 0; j < blocks[i].length; ++j) {
			if (checkIfHitsBlock(i, j)) {
				blocks[i][j].exists = false;
				this.changeDir(blocks[i][j]);
				reRenderBlocks(i);
				this.score.innerHTML = 1 + parseInt(score.innerHTML);
			} else if (checkIfHitsPlate() || checkIfHitsSideWall() || this.ballY >= 67.5) {
				this.changeDir();
			} else if (this.ballY < 0) {
				this.stopGame();
				this.changeDir();
			}
		}
	}
}

function checkIfHitsBlock(i, j) {
	return (this.ballX >= blocks[i][j].x
			&& this.ballX < blocks[i][j].x+4
			&&this.ballY-2.5 >= blocks[i][j].y 
			&& this.ballY-2.5 < blocks[i][j].y+4
			&& blocks[i][j].exists);
}

function checkIfHitsPlate() {
	return (this.ballX >= this.plateX 
			&& this.ballX <= this.plateX + 11) 
			&& this.ballY <= 3.5;
}

function checkIfHitsSideWall() {
	return checkIfHitsLeftWall() || checkIfHitsRightWall();
}

function checkIfHitsLeftWall() {
	return (this.ballX <= 0);
}

function checkIfHitsRightWall() {
	return (this.ballX >= 58);
}

function initBlocks(rows, colms) {
	var blocks = new Array(rows);
	for (var i = 0; i < rows; i++) {
  		blocks[i] = new Array(colms);
  		for(var j = 0; j < colms; ++j) {
  			blocks[i][j] = { exists: true, x: j*4, y: 61.5-i*4 };
  			
  			//creates empty space ornament
  			if (i > 2 && i < 9 && j > 6 && j < 8)
  				blocks[i][j].exists = false;
  		}
	}
	return blocks;
}

function renderBlocks() {
	for(var i = 0; i < blocks.length; ++i) {
		var fieldRow = document.createElement("div");
		fieldRow.className = "row";
		for(var j = 0; j < blocks[i].length; ++j) {
			var brickInRow = document.createElement("div");
			brickInRow.className = "block";
			if (!blocks[i][j].exists) {
				brickInRow.className += " hidden";
			}
			fieldRow.appendChild(brickInRow);
		}
		this.field.appendChild(fieldRow);
	}
}

function reRenderBlocks() {
	for(var i = 0; i < blocks.length; ++i) {
		var fieldRow = this.field.getElementsByClassName("row")[i];
		for(var j = 0; j < blocks[i].length; ++j) {
			if (!blocks[i][j].exists) {
				var brickInRow = fieldRow.getElementsByClassName("block")[j];
				brickInRow.className += " hidden";
			}
		}
	}
}
function onLoad() {
	this.field = document.getElementsByClassName("field")[0];
	this.ball = document.getElementsByClassName("ball")[0];
	this.plate = document.getElementsByClassName("plate")[0];
	this.score = document.getElementById("score");
	this.restartB = document.getElementById("restartButton")
	restartB.style.display = "none"
	renderBlocks();
}
