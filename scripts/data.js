//things we're going to save to localstorage:
// - date of last solved (to check if the player has already played today)
// - progress in current puzzle (probably just store previousMoves array converted to json?)
// - daily puzzle stats such as #moves, if solved, and time to solve

var hasMarioWon = false;
var areEnemiesMatched = true;

document.getElementById("share-solved").textContent = "Unsolved";

function afterPuzzleSolved(matchingEnemies, updateShareStats = false, openShareOverlay = false) {
	const date = new Date();
	if (localStorage.getItem("solved_date") == `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`) {
		openShareOverlay = false;
	}

	//psuedocode: if new number of moves is greater than saved number of moves, don't updateShareStats

	localStorage.setItem("solved_date", `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`);

	var moveCounter = document.getElementById("moves-counter-counter");

	if (matchingEnemies) {
		moveCounter.textContent = "x" + (previousMoves.length - 1).toString();
		moveCounter.className = "move-counter-full-solved";
	} else {
		moveCounter.textContent = "x" + (previousMoves.length - 1).toString();
		moveCounter.className = "move-counter-half-solved";
	}

	setMarioWin();

	if (updateShareStats) {
		hasMarioWon = true;
		areEnemiesMatched = matchingEnemies;

		document.getElementById("share-moves").textContent = "Moves taken: x" + (previousMoves.length - 1).toString();

		if (matchingEnemies) {
			document.getElementById("share-solved").textContent = "Enemies matched";
		} else {
			document.getElementById("share-solved").textContent = "Enemies unmatched";
		}

		document.getElementById("share-time").textContent = "some time idk man";
	}

	if (openShareOverlay) {
		setTimeout(() => {
			openOverlay("share");
		}, 2000);
	}
}

function copyShareToClipboard() {
	console.log("hi");
}

function generateRandomGrid(seedString = "iltg", numberOfEnemyGroups = 3, numberOfShuffleMoves = 3, doNotHeedAdvice = false) {
	if (numberOfEnemyGroups > 12) {
		numberOfEnemyGroups = 12;
	}

	//max number of enemy groups should really be capped at 6...
	if (!doNotHeedAdvice) {
		if (numberOfEnemyGroups > 6) {
			numberOfEnemyGroups = 6;
		}
	}

	//initialize random stuff
	// Create cyrb128 state:
	var seed = cyrb128(seedString);
	// Four 32-bit component hashes provide the seed for sfc32.
	var rand = sfc32(seed[0], seed[1], seed[2], seed[3]);

	var newTilesArray = [
		["", "", "", "", "", "", "", "", "", "", "", ""], //innermost ring
		["", "", "", "", "", "", "", "", "", "", "", ""],
		["", "", "", "", "", "", "", "", "", "", "", ""],
		["", "", "", "", "", "", "", "", "", "", "", ""], //outermost ring
	];

	var tempRandVal = rand();

	for (let i = 0; i < numberOfEnemyGroups; i++) {
		//line
		if (tempRandVal >= 0.5) {
			tempRandVal = Math.floor(rand() * 12);

			if (newTilesArray[0][tempRandVal] == "") {
				for (let j = 0; j < 4; j++) {
					newTilesArray[j][tempRandVal] = "goomba";
				}
			} else {
				i--; //try again with a new random seed
			}
		} else //square
		{
			tempRandVal = Math.floor(rand() * 12);

			if (newTilesArray[0][tempRandVal] == "" && newTilesArray[0][(tempRandVal + 1) % 12] == "") {
				for (let j = 0; j < 2; j++) {
					for (let k = 0; k < 2; k++) {
						newTilesArray[j][(tempRandVal + k) % 12] = "shy_guy";
					}
				}
				if (numberOfEnemyGroups > 6) {
					numberOfEnemyGroups--; //because each square takes up two columns instead of one
				}
			} else {
				i--; //try again with a new random seed
			}
		}

		tempRandVal = rand();
	}

	newTilesArray = shuffleRandomGrid(rand, newTilesArray, numberOfShuffleMoves);
	setTilesArrayTo(newTilesArray);
	setTimeout(function () {
		//TODO: if solved is checked here. we probably want to do a different kind of check than if the player
		//  just solved it, rather than undoing back to it.
		//TODO REMOVE THIS AT SOME POINT!!!!!!!!1
		var isSolved = checkIfSolved();
		if (isSolved[0]) {
			afterPuzzleSolved(isSolved[1]);
		} else {
			document.getElementById("moves-counter-counter").textContent = "x" + (previousMoves.length - 1).toString();
			document.getElementById("moves-counter-counter").className = "";
			setMarioThink();
		}
	}, 1);

	// setTimeout(function () {
	// 	newTilesArray = shuffleRandomGrid(rand, newTilesArray, numberOfShuffleMoves);

	// 	setTilesArrayTo(newTilesArray);
	// }, 1000);

	//shuffleRandomGrid(rand, newTilesArray, 3);

	return newTilesArray;
}

function setTilesArrayTo(newArray) {
	//these few lines are temp stuff
	tilesArray = structuredClone(newArray);
	previousMoves = [structuredClone(newArray)];
	updateTileText();
	resetAnimation();
}

function shuffleRandomGrid(rand, arrayToShuffle, numberOfShuffleMoves = 3) {
	//true is rotation, false is sliding
	var previousMoveType = true;
	var previousMoveIndex = 1434;

	for (let shuffleIndex = 0; shuffleIndex < numberOfShuffleMoves; shuffleIndex++) {
		var validRings = [];
		var validColumns = [];

		//setup rings
		for (let i = 0; i < 4; i++) {
			if (!arrayToShuffle[i].every((val, a, arr) => val == "")) {
				validRings.push(i);
			}
		}

		//setup columns
		var tempColumnsArray = [];
		for (let i = 0; i < 6; i++) {
			tempColumnsArray.push(getColumn(i, arrayToShuffle).concat(getColumn(i + 6, arrayToShuffle)));
		}
		for (let i = 0; i < 6; i++) {
			if (!tempColumnsArray[i].every((val, a, arr) => val == arr[0])) {
				validColumns.push(i);
			}
		}

		//prevent the same ring or column from moving twice in a row
		if (previousMoveType) {
			validRings = validRings.filter(function (item) {
				return item != previousMoveIndex;
			});
		} else {
			validColumns = validColumns.filter(function (item) {
				return item != previousMoveIndex;
			});
		}

		var tempRandVal;
		tempRandVal = Math.floor(rand() * (validRings.length + validColumns.length));

		var tempRandomShiftVal;

		if (tempRandVal < validRings.length) {
			tempRandomShiftVal = Math.floor(rand() * 11 + 1);
			for (let i = 0; i < tempRandomShiftVal; i++) {
				rotateRing(validRings[tempRandVal], true, false, arrayToShuffle);
			}

			previousMoveType = true;
			previousMoveIndex = validRings[tempRandVal];
		} else {
			tempRandomShiftVal = Math.floor(rand() * 7 + 1);
			for (let i = 0; i < tempRandomShiftVal; i++) {
				shiftColumn(validColumns[tempRandVal - validRings.length], true, false, arrayToShuffle);
			}

			previousMoveType = false;
			previousMoveIndex = validColumns[tempRandVal - validRings.length];
		}

        //todo fix auto win
        console.log("\n")
		console.log("prev: " + previousMoveType);
		console.log("prev index: " + previousMoveIndex)
		console.log("rand: " + tempRandVal);
		console.log("rand shift: " + tempRandomShiftVal);
		console.log("rings/columns: ", validRings, validColumns);
	}

	return arrayToShuffle;
}

function setupStart() {
	updateTileText();
	resetAnimation();
	setMarioThink();
}
