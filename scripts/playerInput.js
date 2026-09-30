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

		if (!playerIsSelecting) {
			setMarioFacingLeft();
		}
	} else if (e.key == "ArrowRight") {
		playerSwitchIndex(1, e.key);
		e.preventDefault();

		if (!playerIsSelecting) {
			setMarioFacingRight();
		}
	} else if (e.key == "ArrowDown") {
		playerSwitchIndex(-1, e.key);
		e.preventDefault();
	} else if (e.key == "ArrowUp") {
		playerSwitchIndex(1, e.key);
		e.preventDefault();
	} else if (e.key == " ") {
		playerConfirm();
		e.preventDefault();
	} else if (e.key.toLowerCase() == "x") {
		playerSwitchModes();
		e.preventDefault();
	} else if (e.key.toLowerCase() == "z") {
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
	} else {
		//unless the player is in the middle of a move, in which case, cancel the current move and don't delete
		tilesArray = structuredClone(previousMoves[previousMoves.length - 1]);
		playerIsSelecting = true;
	}

	//TODO: if solved is checked here. we probably want to do a different kind of check than if the player
	//  just solved it, rather than undoing back to it.
	var isSolved = checkIfSolved();
	if (isSolved[0]) {
		afterPuzzleSolved(isSolved[1]);
	} else {
		document.getElementById("moves-counter-counter").textContent = "x" + (previousMoves.length - 1).toString();
		document.getElementById("moves-counter-counter").className = "";
		setMarioThink();
	}

	resetAnimation();
	updateTargetedTilesCSS();
}

//swap from rings to columns and vice versa
function playerSwitchModes() {
	//only swap modes if the player isn't currently changing a row or column
	if (playerIsSelecting) {
		playerMode = !playerMode;
	}

	updateTargetedTilesCSS();
}

//on confirm, either choose a certain ring/column to start changing, or finish a move
function playerConfirm() {
	if (playerIsSelecting) {
		playerIsSelecting = false;
	} else {
		playerIsSelecting = true;
        //check if this move is the same as the previous move
        if (structuredClone(tilesArray).join(" ") != previousMoves[previousMoves.length - 1].join(" ")) {
            previousMoves.push(structuredClone(tilesArray));

            //TODO: solve check is here. tweak this eventually to move it somewhere else
            var isSolved = checkIfSolved();
            if (isSolved[0]) {
                afterPuzzleSolved(isSolved[1]);
            } else {
                document.getElementById("moves-counter-counter").textContent = "x" + (previousMoves.length - 1).toString();
                document.getElementById("moves-counter-counter").className = "";
                setMarioThink();
            }
        }
	}

	updateTargetedTilesCSS();
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
}

//this changes the background colors of selected tiles
function updateTargetedTilesCSS() {
	var grid = document.getElementsByClassName("row");
	for (let i = 0; i < tilesArray.length; i++) {
		for (let j = 0; j < tilesArray[i].length; j++) {
			grid[i].children[j].classList.remove("selected-tile");
			grid[i].children[j].classList.remove("confirming-tile");
			//console.log(grid.children[i].children[j]);
		}
	}

	if (playerMode) {
		var targetNodes = grid[playerRotationIndex].children;
	} else {
		var targetNodes = [];
		for (let i = 0; i < 4; i++) {
			targetNodes.push(grid[i].children[playerSlidingIndex]);
			targetNodes.push(grid[i].children[(playerSlidingIndex + 6) % 12]);
		}
	}

	for (let i = 0; i < targetNodes.length; i++) {
		if (playerIsSelecting) {
			targetNodes[i].classList.add("selected-tile");
		} else {
			targetNodes[i].classList.add("confirming-tile");
		}
	}
}

//on start, put the initial board state in the undo list
function initializerPlayerInput() {
	previousMoves.push(structuredClone(tilesArray));
	updateTargetedTilesCSS();
	document.getElementById("moves-counter-counter").textContent = "x" + (previousMoves.length - 1).toString();
}

initializerPlayerInput();
