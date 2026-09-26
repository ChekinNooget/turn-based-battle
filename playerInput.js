//undo stuff
var previousMoves = [];
previousMoves.push(tilesArray.slice());

//true is rotation, false is sliding
var playerMode = true;
//true means the player is selecting which row/column to slide
var playerIsSelecting = true;
//which index of each mode the player has selected
var playerRotationIndex = 0;
var playerSlidingIndex = 0;

function logMessage(message) {
	//console.log(`${message}\n`);
}

document.body.addEventListener("keydown", (e) => {
	if (!e.repeat) {
		logMessage(`Key "${e.key}" pressed [event: keydown]`);
	} else {
		logMessage(`Key "${e.key}" repeating [event: keydown]`);
	}

	if (e.key == "ArrowLeft") {
		playerSwitchIndex(-1, e.key);
		e.preventDefault();
	} else if (e.key == "ArrowRight") {
		playerSwitchIndex(1, e.key);
		e.preventDefault();
	} else if (e.key == "ArrowDown") {
		playerSwitchIndex(-1, e.key);
		e.preventDefault();
	} else if (e.key == "ArrowUp") {
		playerSwitchIndex(1, e.key);
		e.preventDefault();
	} else if (e.key == " ") {
		playerConfirm();
		e.preventDefault();
	} else if (e.key == "x") {
		playerSwitchModes();
		e.preventDefault();
	} else if (e.key == "z") {
		playerUndo();
		e.preventDefault();
	}

    console.log(previousMoves)
});

function playerUndo() {
	if (playerIsSelecting) {
		if (previousMoves.length > 1) {
			tilesArray = previousMoves.slice()[previousMoves.length - 2].slice();
			previousMoves.pop();
		}
	} else {
		tilesArray = previousMoves.slice()[previousMoves.length - 1].slice();
		playerIsSelecting = true;
	}

	resetRotation();
	updateTargetedTilesCSS();

	document.getElementById("grid").focus();
	document.activeElement = document.getElementById("grid");
}

function playerSwitchModes() {
	playerMode = !playerMode;

	updateTargetedTilesCSS();

	document.getElementById("grid").focus();
	document.activeElement = document.getElementById("grid");
}

function playerConfirm() {
	if (playerIsSelecting) {
		playerIsSelecting = false;
	} else {
		playerIsSelecting = true;
		previousMoves.push(tilesArray.slice());
	}

	updateTargetedTilesCSS();

	document.getElementById("grid").focus();
	document.activeElement = document.getElementById("grid");
}

function playerSwitchIndex(indexChange = 1, key = "ArrowLeft") {
	if (playerIsSelecting) {
		if (playerMode) {
			//4 different rows, account for negative numbers
			playerRotationIndex = (((playerRotationIndex + indexChange) % 4) + 4) % 4;
		} else {
			//12 different columns, account for negative numbers
			playerSlidingIndex = (((playerSlidingIndex + indexChange) % 12) + 12) % 12;
		}
	} else {
		var direction;
		if (indexChange == 1) {
			direction = true;
		} else {
			direction = false;
		}
		if (playerMode) {
			rotateRing(playerRotationIndex, direction);
		} else {
			if (0 <= playerSlidingIndex && playerSlidingIndex <= 5) {
				direction = !direction;
			}
            //utter spaghetti. im sorry
            //it's so that left inputs always shift the column left and so on
			if (key == "ArrowUp" || key == "ArrowDown") {
				if (9 <= playerSlidingIndex && playerSlidingIndex <= 11) {
					direction = !direction;
				}
                
                if (3 <= playerSlidingIndex && playerSlidingIndex <= 5) {
                    direction = !direction;
                }
			}
			shiftColumn(playerSlidingIndex, direction);
		}
	}

	updateTargetedTilesCSS();

	document.getElementById("grid").focus();
	document.activeElement = document.getElementById("grid");
}

function playerMoveTiles(direction = true) {
	if (playerMode) {
		rotateRing(playerRotationIndex, direction);
	} else {
		shiftColumn(playerSlidingIndex, direction);
	}

	document.getElementById("grid").focus();
	document.activeElement = document.getElementById("grid");
}

function updateTargetedTilesCSS() {
	var grid = document.getElementById("grid");
	for (let i = 0; i < tilesArray.length; i++) {
		for (let j = 0; j < tilesArray[i].length; j++) {
			grid.children[i].children[j].style.backgroundColor = "black";
			//console.log(grid.children[i].children[j]);
		}
	}

	var tileColor;
	if (playerIsSelecting) {
		tileColor = "red";
	} else {
		tileColor = "darkred";
	}

	if (playerMode) {
		var tileNodes = document.getElementsByClassName("row")[playerRotationIndex].children;
		for (let i = 0; i < tileNodes.length; i++) {
			tileNodes[i].style.backgroundColor = tileColor;
		}
	} else {
		var tileNodes = [];
		for (let i = 0; i < 4; i++) {
			tileNodes.push(grid.children[i].children[playerSlidingIndex]);
			tileNodes.push(grid.children[i].children[(playerSlidingIndex + 6) % 12]);
		}

		for (let i = 0; i < tileNodes.length; i++) {
			tileNodes[i].style.backgroundColor = tileColor;
		}
	}
}

updateTargetedTilesCSS();
