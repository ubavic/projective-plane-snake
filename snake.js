var ctx;
const unit = 24;
var width, height;
const padding = 4;
const palette = 
	{	
		black  :"#333333",
		greenD :"#062506",
		green  :"#043904",
		yellow :"#F1C24A",
		white  :"#FFF7C4",
		orange :"#DD9012",
		red    :"#C53232",
		purple :"#411671",
		blue   :"#3390F8"
	};
const soundFiles =
	[
		"coin",
		"coin1",
		"bite",
		"spit",
		"hiss",
		"break",
		"jungle",
		"tail"
	];
var sounds = [], snake = [], food = [], coins = [];
var score, cash, highscore = 0;
var snakeOrientation = 1;
var addCell = false, bite = false;
var direction;
var game = 0;
var keyLock = false;
var time = {now: 0, past: 0, dt: 0, step: 0};
var clone;
var speedStep = 200;
var touchStartX, touchStartY, touchStartTime;

function MoveSnake()
{
	var tail = {
		x : snake[snake.length - 1].x, 
		y : snake[snake.length - 1].y
	};

	if (snake[0].d == "U" && snake[1].d == "L" || snake[0].d == "R" && snake[1].d == "D")
		snake[0].t = 2;
	else if (snake[0].d == "U" && snake[1].d == "R" || snake[0].d == "L" && snake[1].d == "D")
		snake[0].t = 3;
	else if (snake[0].d == "D" && snake[1].d == "L" || snake[0].d == "R" && snake[1].d == "U")
		snake[0].t = 4;
	else if (snake[0].d == "D" && snake[1].d == "R" || snake[0].d == "L" && snake[1].d == "U")
		snake[0].t = 5;
	else
		snake[0].t =1;

	for (let i = snake.length - 1; i > 0; i--) {
		snake[i].x = snake[i - 1].x;
		snake[i].y = snake[i - 1].y;
		snake[i].d = snake[i - 1].d;
		snake[i].t = snake[i - 1].t;
	}

	if (addCell) {
		snake.push(tail); 
		addCell = false;
	}

	if (snake[0].d == "L")
		snake[0].x--;
	else if (snake[0].d == "R")
		snake[0].x++;
	else if (snake[0].d == "U")
		snake[0].y--;
	else if (snake[0].d == "D")
		snake[0].y++;

	if (snake[0].x == -1) {
		snake[0].x = width - 1;
		snake[0].y = height - snake[0].y - 1;
		snakeOrientation *= -1;
	} else if (snake[0].x == width) {
		snake[0].x = 0;
		snake[0].y = height - snake[0].y - 1;
		snakeOrientation *= -1;
	} else if (snake[0].y == -1) {
		snake[0].y = height - 1;
		snake[0].x = width - snake[0].x - 1;
		snakeOrientation *= -1;
	} else if (snake[0].y == height) {
		snake[0].y = 0;
		snake[0].x = width - snake[0].x - 1;
		snakeOrientation *= -1;
	} 
}

function DrawSnake()
{
	var eye1x, eye1y, eye2x, eye2y;
	ctx.fillStyle = palette.green;

	switch (snake[0].d) {
		case "U":
			ctx.fillRect(snake[0].x * unit + padding, snake[0].y * unit + (1 - time.lambda) * unit, unit - 2 * padding, time.lambda * unit);
			eye1x = unit/4;
			eye1y = unit/2 + (1 - time.lambda) * unit;
			eye2x = 3 * unit/4;
			eye2y = unit/2 + (1 - time.lambda) * unit;
			break;
		case "D":
			ctx.fillRect(snake[0].x * unit + padding, snake[0].y * unit, unit - 2 * padding, time.lambda * unit);
			eye1x = unit/4;
			eye1y = unit/2 - (1 - time.lambda) * unit;
			eye2x = 3 * unit/4;
			eye2y = unit/2 - (1 - time.lambda) * unit;
			break;
		case "L":
			ctx.fillRect(snake[0].x * unit + (1 - time.lambda) * unit, snake[0].y * unit + padding, time.lambda * unit, unit - 2 * padding);
			eye1x = unit/2 + (1 - time.lambda) * unit;
			eye1y = unit/4;
			eye2x = unit/2 + (1 - time.lambda) * unit;
			eye2y = 3 * unit/4;
			break;
		case "R":
			ctx.fillRect(snake[0].x * unit, snake[0].y * unit + padding, time.lambda * unit, unit - 2 * padding);
			eye1x = unit/2 - (1 - time.lambda) * unit;
			eye1y = unit/4;
			eye2x = unit/2 - (1 - time.lambda) * unit;
			eye2y = 3 * unit/4;
			break;
	}

	for (let i = 1; i < snake.length - 1; i++) {
		switch (snake[i].t) {
			case 2:
				DrawArc(snake[i].x * unit + unit, snake[i].y * unit, unit - padding, Math.PI/2, Math.PI/2);
				ctx.fillStyle = palette.white;
				DrawArc(snake[i].x * unit + unit, snake[i].y * unit, padding, Math.PI/2, Math.PI/2);
				ctx.fillStyle = palette.green;
				break;
			case 3:
				DrawArc(snake[i].x * unit, snake[i].y * unit, unit - padding, 0, Math.PI/2);
				ctx.fillStyle = palette.white;
				DrawArc(snake[i].x * unit, snake[i].y * unit, padding, 0, Math.PI/2);
				ctx.fillStyle = palette.green;
				break;
			case 4:
				DrawArc(snake[i].x * unit + unit, snake[i].y * unit + unit, unit - padding, Math.PI, Math.PI/2);
				ctx.fillStyle = palette.white;
				DrawArc(snake[i].x * unit + unit, snake[i].y * unit + unit, padding, Math.PI, Math.PI/2);
				ctx.fillStyle = palette.green;
				break;
			case 5:
				DrawArc(snake[i].x * unit, snake[i].y * unit + unit, unit - padding, 3/2 * Math.PI, Math.PI/2);
				ctx.fillStyle = palette.white;
				DrawArc(snake[i].x * unit, snake[i].y * unit + unit, padding, 3/2 * Math.PI, Math.PI/2);
				ctx.fillStyle = palette.green;
				break;
			default:
				if (snake[i].d == "R" || snake[i].d == "L")
					ctx.fillRect(snake[i].x * unit, snake[i].y * unit + padding, unit, unit - 2 * padding);
				else
					ctx.fillRect(snake[i].x * unit + padding, snake[i].y * unit, unit - 2 * padding, unit);

		}
	}

	switch (snake[snake.length - 1].t) {
		case 2:
			DrawArc(snake[snake.length - 1].x * unit + unit, snake[snake.length - 1].y * unit, unit - padding, Math.PI/2 + ((snake[snake.length-1].d != "U") ? 0 : Math.PI*time.lambda/2), Math.PI*(1-time.lambda)/2);
			ctx.fillStyle = palette.white;
			DrawArc(snake[snake.length - 1].x * unit + unit, snake[snake.length - 1].y * unit, padding, Math.PI/2 , Math.PI/2);
			break;
		case 3:
			DrawArc(snake[snake.length - 1].x * unit, snake[snake.length - 1].y * unit, unit-padding, ((snake[snake.length - 1].d == "U") ? 0 : Math.PI * time.lambda/2), Math.PI * (1 - time.lambda)/2);
			ctx.fillStyle = palette.white;
			DrawArc(snake[snake.length - 1].x * unit, snake[snake.length - 1].y * unit, padding, 0, Math.PI/2);
			break;
		case 4:
			DrawArc(snake[snake.length - 1].x * unit + unit, snake[snake.length - 1].y*unit+unit, unit-padding, Math.PI + ((snake[snake.length - 1].d == "D") ? 0 : Math.PI * time.lambda/2), Math.PI * (1 - time.lambda)/2);
			ctx.fillStyle = palette.white;
			DrawArc(snake[snake.length - 1].x* unit + unit, snake[snake.length - 1].y*unit+unit, padding, Math.PI + ((snake[snake.length - 1].d == "D") ? 0 : Math.PI * time.lambda/2), Math.PI * (1 - time.lambda)/2);
			break;
		case 5:
			DrawArc(snake[snake.length - 1].x * unit, snake[snake.length - 1].y * unit + unit, unit - padding, 3/2 * Math.PI + ((snake[snake.length - 1].d != "D") ? 0 : Math.PI * time.lambda/2), Math.PI * (1 - time.lambda)/2);
			ctx.fillStyle = palette.white;
			DrawArc(snake[snake.length - 1].x * unit, snake[snake.length - 1].y * unit + unit, padding, 3/2 * Math.PI + ((snake[snake.length - 1].d != "D") ? 0 : Math.PI * time.lambda/2), Math.PI * (1 - time.lambda)/2);
			break;
		default:
			if (snake[snake.length-1].d == "U")
				ctx.fillRect(snake[snake.length - 1].x * unit + padding, snake[snake.length - 1].y * unit, unit - 2 * padding, (1 - time.lambda) * unit);
			else if (snake[snake.length-1].d == "D")
				ctx.fillRect(snake[snake.length - 1].x * unit + padding, snake[snake.length - 1].y * unit + time.lambda * unit, unit - 2 * padding, (1 - time.lambda) * unit);
			else if (snake[snake.length-1].d == "L")
				ctx.fillRect(snake[snake.length - 1].x * unit, snake[snake.length - 1].y * unit + padding, (1 - time.lambda) * unit, unit - 2 * padding);
			else if (snake[snake.length-1].d == "R")
				ctx.fillRect(snake[snake.length - 1].x * unit + time.lambda * unit, snake[snake.length - 1].y * unit + padding, (1 - time.lambda) * unit, unit - 2 * padding);
			break;
	
	}

	var eyeRadius = (bite) ? unit/6 - Math.sin(Math.PI * time.lambda) * unit / 24 : unit / 6 ; 
	ctx.fillStyle = (snakeOrientation > 0) ? palette.blue : palette.red;
	ctx.strokeStyle = palette.green;
	ctx.lineWidth = 2;
	ctx.beginPath();
	if (snakeOrientation > 0 && (snake[0].d == "U" || snake[0].d == "R") || snakeOrientation < 0 && (snake[0].d == "D" || snake[0].d == "L"))
		ctx.arc(snake[0].x * unit + eye1x, snake[0].y * unit + eye1y, eyeRadius, 0, 2 * Math.PI, true);
	else
		ctx.arc(snake[0].x * unit + eye2x, snake[0].y * unit + eye2y, eyeRadius, 0, 2 * Math.PI, true);
	ctx.fill();
	ctx.stroke();
	ctx.lineWidth = 1;
}

function InArray(array, x, y)
{
	for (var i = 0; i < array.length; i++) {
		if (x == array[i].x && y == array[i].y)
			return true;
	}
	return false;
}

function GetRandomFood()
{
	var x, y, i;

	do {
		x = Math.floor(Math.random() * width);
		y = Math.floor(Math.random() * height);
		i++;
	} while (CheckSnakeSurface(x, y, 0) || InArray(coins, x, y) || InArray(food, x, y) || i > 10)

	return {
		x : x,
		y : y,
		s : 2,
		t : 0,
		o : (Math.random() > 0.5) ? -1 : 1
	};
}

function GetRandomCoin()
{
	var x, y, i;

	do {
		x = Math.floor(Math.random() * width);
		y = Math.floor(Math.random() * height);
		i++;
	} while (CheckSnakeSurface(x, y, 0) || InArray(coins, x, y) || InArray(food, x, y) || i > 10)

	return {
		x : x,
		y : y,
		s : 0,
		t : 0,
		l : 5 + Math.floor(Math.random() * 100)
	};
}

function DrawArc(x, y, r, start, delta)
{
	if (delta < 0)
		return;
	ctx.beginPath();
	ctx.arc(x, y, r, start, start+delta, false);
	ctx.lineTo(x, y);
	ctx.closePath();
	ctx.fill();
}

function DrawFood()
{
	ctx.strokeStyle = palette.black;
	for (var i = 0 ; i < food.length; i++) {
		ctx.fillStyle = (food[i].o > 0) ? palette.blue : palette.red;
		switch (food[i].s) {
			case -1:
				ctx.beginPath();
				ctx.arc(food[i].x * unit + unit/2, food[i].y * unit + unit/2, unit/3 * easeInOut(1, 0, time.lambda), 0, 2 * Math.PI); 
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
				break;
			case 0:
				break;
			case 1:
				ctx.beginPath();
				ctx.arc(food[i].x * unit + unit/2, food[i].y * unit + unit/2, unit/3, 0, 2 * Math.PI); 
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
				break;
			case 2:
				ctx.beginPath();
				ctx.arc(food[i].x * unit + unit/2, food[i].y * unit + unit/2, unit / 3 * easeInOut(0, 1, time.lambda), 0, 2 * Math.PI); 
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
				break;
		}
	}
}

function DrawCoins() 
{
	ctx.fillStyle = palette.yellow;
	ctx.strokeStyle = palette.orange;
	ctx.lineWidth = 3;
	
	for (var i = 0; i < coins.length; i++){
		switch (coins[i].s) {
			case -1:
				ctx.beginPath();
				ctx.arc(coins[i].x*unit + unit/2, coins[i].y * unit + unit/2 - unit * 2 * easeOut(0, 1, time.lambda), unit/4, 0, 2 * Math.PI); 
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
				break;
			case 0:
				break;
			case 1:
				ctx.beginPath();
				ctx.arc(coins[i].x * unit + unit/2, coins[i].y * unit + unit/2, unit/4, 0, 2 * Math.PI); 
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
				break;
			case 2:
				ctx.beginPath();
				ctx.arc(coins[i].x * unit + unit/2, coins[i].y * unit + unit/2 - unit * 2 * (1 - easeOutBounce(0, 1, time.lambda)), unit/4, 0, 2 * Math.PI); 
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
				break;
		}
	}

	ctx.lineWidth = 1
}

function animateLabel(element, animation)
{
	element.setAttribute("class", animation);
	setTimeout(
		function() {
			element.setAttribute( "class", "");
		}, 200);
}

function CheckColision()
{
	bite = 0;
	for (var i = 0; i < food.length; i++) {
		if (snake[0].x == food[i].x && snake[0].y == food[i].y) {
			bite = 1;
			if (food[i].o == snakeOrientation) {
				addCell = true;
				clone = sounds["bite"].cloneNode(true);
				clone.volume = 0.3;
				clone.play();
				document.getElementById("length").textContent = ((snake.length + 1)/10).toFixed(1);
				animateLabel(document.getElementById("containerLength"), "popAnimation");
				speedStep = speedStep - 3;
			} else {
				snake.length--;
				clone = sounds["hiss"].cloneNode(true);
				clone.volume = 0.3;
				clone.play();
				if (snake.length < 3) {
					game = 0;
					return;
				}
				document.getElementById("length").textContent = (snake.length/10).toFixed(1);
				animateLabel(document.getElementById("containerLength"), "shakeAnimation");
			}

			food[i].s = -1;
		}
	}

	for (i = 0; i < coins.length; i++) {
		if (coins[i].s != 0 && snake[0].x == coins[i].x && snake[0].y == coins[i].y) {
			cash += 1;
			coins[i].s = -1;
			clone = sounds["coin"].cloneNode(true);
			clone.volume = 0.3;
			clone.play();
			document.getElementById("cash").textContent = cash;
			animateLabel(document.getElementById("containerCash"), "popAnimation");
			speedStep = speedStep + 2;
		}
	}

	var e = CheckSnakeSurface(snake[0].x, snake[0].y, 1);
	if (e) {
		if (CheckPath(e))
			snake.length = e - 1; 
		else
			game = 0;
	}
}

function CheckPath(k)
{
	var element = 0;
	for (var i = 0; i < k; i++) {
		if((snake[i].x == 0 && snake[i + 1].x == width - 1) || (snake[i].y == 0 && snake[i + 1].y == height - 1))
			element++;
		else if ((snake[i].x == width - 1 && snake[i + 1].x == 0) || (snake[i].y == height - 1 && snake[i + 1].y == 0))
			element--;
	}

	return element % 2;
}

function CheckSnakeSurface(x, y, j)
{
	for (var i = j; i < snake.length; i++) {
		if (x == snake[i].x && y == snake[i].y)
			return i + 1;
	}

	return 0;
}

function EndGame()
{
	score = snake.length * cash * 10;

	if (score > highscore) 
		highscore = score;

	if (snake.length < 100) {
		document.getElementById("score2").textContent = score;
		document.getElementById("gameOver").style.display = "block";
	} else {
		document.getElementById("length1").textContent = (snake.length/10).toFixed(1);
		document.getElementById("cash1").textContent = cash;
		document.getElementById("score1").textContent = score;
		document.getElementById("gameVictory").style.display = "block";
		sounds["tail"].play();
	}

	snake = [];
	sounds["jungle"].volume = 0.05;
}

function TogglePause()
{
	if (game == 1) {
		sounds["jungle"].pause();
		document.getElementById("gamePaused").style.display = "block";
		game = 2;
	} else if (game == 2) {
		sounds["jungle"].play();
		document.getElementById("gamePaused").style.display = "none";
		game = 1;
		Game();
	}
}

function Render()
{
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	DrawFood();
	DrawCoins();
	DrawSnake();
}

function Logic()
{
	snake[0].d = direction;
	MoveSnake();
	CheckColision();
	keyLock = false;
}

function ChangeStates()
{
	for (var i = 0; i < food.length; i++){
		switch (food[i].s) {
			case -1:
				food[i] = GetRandomFood();
				break;
			case 2:
				food[i].s = 1;
				break;
		}
	}

	for (i = 0; i < coins.length; i++) {
		switch (coins[i].s) {
			case -1:
				coins[i] = GetRandomCoin();
				break;
			case 0:
				if (coins[i].l)
					coins[i].l--;
				else
					coins[i].s = 2;
				break;
			case 2:
				clone = sounds["coin1"].cloneNode(true);
				clone.volume = 0.3;
				clone.play();
				coins[i].s = 1;
				break;
		}
	}
}

function Game()
{
	switch (game) {
		case 0:
			EndGame();
			break;
		case 1:
			time.now = timestamp();
			time.dt = time.now - time.step;
			time.lambda = time.dt/speedStep;
			Render();
			if (time.dt > speedStep) {
				ChangeStates();
				Logic();
				time.step = time.now;
			}
			time.last = time.now;
			requestAnimationFrame(Game);
			break;
		case 2:
			break;
	}
}

function StartGame() 
{
	if (window.innerHeight < 500)
		document.getElementById("info").scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});

	document.getElementById("startGame").style.display = "none";
	document.getElementById("gameOver").style.display = "none";
	document.getElementById("gameVictory").style.display = "none";
	
	snake = [];
	food = [];
	coins = [];

	for (var i = 0; i < 8; i++)
		food[i] = GetRandomFood();

	for (i = 0; i < 10; i++)
		coins[i] = GetRandomCoin();

	direction = "R";
	game = 1;
	score = 0;
	cash = 0;
	keyLock = false;
	
	for (var i = 0; i < 5; i++)
		snake[i] = {
			x : Math.floor(width/2) - i,
			y : Math.floor(height/2),
			d : "R",
			t : 1
		};
	
	document.getElementById("length").textContent = (snake.length/10).toFixed(1);
	document.getElementById("cash").textContent = cash;
	time.step = timestamp();
	sounds["jungle"].currentTime = 0;
	sounds["jungle"].loop = true;
	sounds["jungle"].volume = 0.1;
	sounds["jungle"].play();

	Game();
}

// Following functions are from https://codeincomplete.com/posts/javascript-game-foundations/

function timestamp()
{
	return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
}

function interpolate(a, b, percent)
{
	return a + (b - a) * percent;
}

function easeIn(a, b, percent)
{
	return a + (b - a) * Math.pow(percent, 2);
}

function easeOut(a, b, percent)
{
	return a + (b - a) * (1 - Math.pow(1 - percent, 2));
}

function easeInOut(a, b, percent)
{
	return a + (b - a) * (-Math.cos(percent * Math.PI)/2 + 0.5);
}

// Stolen from https://github.com/danro/jquery-easing/blob/master/jquery.easing.js

function easeOutBounce(a, b, t)
{
		c = b - a;
		if (t < (1/2.75)) {
			return c * (7.5625 * t * t);
		} else if (t < (2/2.75)) {
			return c * (7.5625 * (t -= (1.5/2.75)) * t + .75);
		} else if (t < (2.5/2.75)) {
			return c * (7.5625 * (t -= (2.25/2.75)) * t + .9375);
		} else {
			return c * (7.5625 * (t -= (2.625/2.75)) * t + .984375);
		}
}

function Setup()
{
	var cvs = document.getElementById("canvas");
	ctx = cvs.getContext("2d");

	window.addEventListener("blur",
		function(event) {
			if (game == 1) {
				sounds["jungle"].pause();
				document.getElementById("gamePaused").style.display = "block";
				game = 2;
			}
		});
	

	document.addEventListener("keydown", 
		function (event) {
			if (event.defaultPrevented)
				return

			switch(event.code) {
				case "KeyS":
				case "ArrowDown":
					if (direction != "U")
						direction = "D";
				 	break;
				case "KeyW":
				case "ArrowUp":
					if (direction != "D")
						direction = "U";
				 	break;
				case "KeyA":
				case "ArrowLeft":
					if (direction != "R")
						direction = "L";
				 	break;
				case "KeyD":
				case "ArrowRight":
					if (direction != "L")
						direction = "R";
				 	break;
				case "Escape":
					TogglePause();
					break;
			}

			event.preventDefault();
		});

	document.addEventListener('touchstart',
		function(event) {
			if (event.defaultPrevented)
				return
			
			touchStartX = event.changedTouches[0].clientX;
			touchStartY = event.changedTouches[0].clientY;
			touchStartTime = timestamp();

			if (game == 1)
				event.preventDefault();
		});

	document.addEventListener('touchend',
		function(event) {
			if (event.defaultPrevented)
				return

			dX = event.changedTouches[0].clientX - touchStartX;
			dY = event.changedTouches[0].clientY - touchStartY;
			dT = timestamp() - touchStartTime;

			if (dT < 300) {
				if (Math.abs(dX) > 50 && Math.abs(dX) > Math.abs(dY)) {
					if (dX < 0 && direction != "R")
						direction = "L";
					else if (dX > 0 && direction != "L")
						direction = "R";
				} else if (Math.abs(dY) > 50 && Math.abs(dY) > Math.abs(dX)) {
					if (dY < 0 && direction != "D")
						direction = "U";
					else if (dY > 0 && direction != "U")
						direction = "D";
				}
			}

			if (game == 1)
				event.preventDefault();

		});
 
	for (var i = 0 ; i < soundFiles.length; i++) {
		sounds[soundFiles[i]] = document.createElement("audio");
		sounds[soundFiles[i]].src = "audio/" + soundFiles[i] + ".mp3";
	}

	if (window.innerWidth > 970) {
		cvs.width = 960;
	} else {
		cvs.width = Math.floor(window.innerWidth/unit) * unit;
		document.getElementById("canvas").style.borderLeftWidth = (window.innerWidth - cvs.width)/2 + "px";
		document.getElementById("canvas").style.borderRightWidth = (window.innerWidth - cvs.width)/2 + "px";
		document.getElementById("canvas").style.width = cvs.width + "px";
	}

	if (window.innerHeight > 490) {
		cvs.height = 480;
	} else {
		cvs.height = (Math.floor(window.innerHeight/unit) - 2) * unit;
		document.getElementById("canvas").style.height = cvs.height + "px";
	}

	width = cvs.width/unit;
	height = cvs.height/unit;
}

Setup();