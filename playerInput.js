//undo stuff
var previousMoves = [];

//true is rotation, false is sliding
var playerMode = true;
//true means the player is selecting which row/column to slide
var playerIsSelecting = true;
//which index of each mode the player has selected
var playerRotationIndex = 0;
var playerSlidingIndex = 0;

//wait for key presses
document.body.addEventListener("keydown", (e) => {
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
});

function playerUndo() {
    //undoes the past move by returning to the previous board state, then deleting the latest move.
	if (playerIsSelecting) {
		if (previousMoves.length > 1) {
			tilesArray = structuredClone(previousMoves[previousMoves.length - 2]);
			previousMoves.pop();
		}
	} else { //unless the player is in the middle of a move, in which case, cancel the current move and don't delete
		tilesArray = structuredClone(previousMoves[previousMoves.length - 1]);
		playerIsSelecting = true;
	}

	resetAnimation();
	updateTargetedTilesCSS();

	document.getElementById("grid").focus();
	document.activeElement = document.getElementById("grid");
}

//swap from rings to columns and vice versa
function playerSwitchModes() {
    //only swap modes if the player isn't currently changing a row or column
    if (playerIsSelecting) {
	    playerMode = !playerMode;
    }

	updateTargetedTilesCSS();

	document.getElementById("grid").focus();
	document.activeElement = document.getElementById("grid");
}

//on confirm, either choose a certain ring/column to start changing, or finish a move
function playerConfirm() {
	if (playerIsSelecting) {
		playerIsSelecting = false;
	} else {
		playerIsSelecting = true;
		previousMoves.push(structuredClone(tilesArray));

        var isSolved = checkIfSolved();
        if (isSolved[0]) {
            if (isSolved[1]) {
                alert("solved perfectly! moves: " + (previousMoves.length - 1))
            } else {
                alert("solved with mismatched enemies!" + (previousMoves.length - 1))
            }
        }
	}

	updateTargetedTilesCSS();

	document.getElementById("grid").focus();
	document.activeElement = document.getElementById("grid");
}

//either switch which row/column to target, or shift the tiles.
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
            //trust the process frfr
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

//this changes the background colors of selected tiles
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
	} else {
		var tileNodes = [];
		for (let i = 0; i < 4; i++) {
			tileNodes.push(grid.children[i].children[playerSlidingIndex]);
			tileNodes.push(grid.children[i].children[(playerSlidingIndex + 6) % 12]);
		}
	}

	for (let i = 0; i < tileNodes.length; i++) {
		tileNodes[i].style.backgroundColor = tileColor;
	}
}

//on start, put the initial board state in the undo list
function initializerPlayerInput() {
	previousMoves.push(structuredClone(tilesArray));
	updateTargetedTilesCSS();
}

initializerPlayerInput();
