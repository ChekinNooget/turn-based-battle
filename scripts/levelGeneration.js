/*file for level generation */

//generate a random level. start by generating a valid position, then a function later will shuffle the board
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

    //the array we're gonna base things off of
	var newTilesArray = [
		["", "", "", "", "", "", "", "", "", "", "", ""], //innermost ring
		["", "", "", "", "", "", "", "", "", "", "", ""],
		["", "", "", "", "", "", "", "", "", "", "", ""],
		["", "", "", "", "", "", "", "", "", "", "", ""], //outermost ring
	];

    //use this variable for some random things (to keep seeded stuff consistent)
	var tempRandVal = rand();

    //create # amount of enemy groups
	for (let i = 0; i < numberOfEnemyGroups; i++) {
		//create a line
		if (tempRandVal >= 0.5) {
			tempRandVal = Math.floor(rand() * 12);

			if (newTilesArray[0][tempRandVal] == "") {
				for (let j = 0; j < 4; j++) {
					newTilesArray[j][tempRandVal] = "goomba";
				}
			} else {
				i--; //try again with a new random seed if slot is already filled
			}
		} else //create a square
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
				i--; //try again with a new random seed if slot is already filled
			}
		}

        //reset random
		tempRandVal = rand();
	}

    //send the array off to get shuffled
	newTilesArray = shuffleRandomGrid(rand, newTilesArray, numberOfShuffleMoves);
	setTilesArrayTo(newTilesArray);

    //TODO: if solved is checked here.
    //TODO REMOVE THIS AT SOME POINT!!!!!!!!1
	setTimeout(function () {
		var isSolved = checkIfSolved();
		if (isSolved[0]) {
			afterPuzzleSolved(isSolved[1]);
		} else {
			document.getElementById("moves-counter-counter").textContent = "x" + (previousMoves.length - 1).toString();
			document.getElementById("moves-counter-counter").className = "";
			setMarioThink();
		}
	}, 1);

	return newTilesArray;
}

//these few lines are temp stuff to update the grid
function setTilesArrayTo(newArray) {
	tilesArray = structuredClone(newArray);
	previousMoves = [structuredClone(newArray)];
	updateTileText();
	resetAnimation();
}

//shuffle the grid!!
function shuffleRandomGrid(rand, arrayToShuffle, numberOfShuffleMoves = 3) {
	//true is rotation, false is sliding
	var previousMoveType = true;
    //what ring/column was used in the previous shuffle. this way we don't shuffle the same one twice in a row
    //set at some high number to initialize. (this was picked randomly trust)
	var previousMoveIndex = 1434;

    //repeat this several times, for each time we want to do another move
	for (let shuffleIndex = 0; shuffleIndex < numberOfShuffleMoves; shuffleIndex++) {
        //keep track of which rings and columns are valid to shuffle.
        //we don't want to move around an empty ring to have nothing happen
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

        //now we should have every non-empty ring/column stored.

		//remove the index that was used in the previous shuffle, if applicable.
		if (previousMoveType) {
			validRings = validRings.filter(function (item) {
				return item != previousMoveIndex;
			});
		} else {
			validColumns = validColumns.filter(function (item) {
				return item != previousMoveIndex;
			});
		}

        //ready to randomize!
        //pick a random index from either validRings or validColumns
		var tempRandVal;
		tempRandVal = Math.floor(rand() * (validRings.length + validColumns.length));

        //the number of times we want to move a certain row or column within the move
		var tempRandomShiftVal;

        //if we want to pick from validRings
		if (tempRandVal < validRings.length) {
            //rotate a ring a random amount from 1-11 (0 and 12 don't do anything)
			tempRandomShiftVal = Math.floor(rand() * 11 + 1);
			for (let i = 0; i < tempRandomShiftVal; i++) {
				rotateRing(validRings[tempRandVal], true, false, arrayToShuffle);
			}

			previousMoveType = true;
			previousMoveIndex = validRings[tempRandVal];
		} else //otherwise pick from validColumns
        {
            //shift a column a random amount from 1 to 7.
			tempRandomShiftVal = Math.floor(rand() * 7 + 1);
			for (let i = 0; i < tempRandomShiftVal; i++) {
				shiftColumn(validColumns[tempRandVal - validRings.length], true, false, arrayToShuffle);
			}

			previousMoveType = false;
			previousMoveIndex = validColumns[tempRandVal - validRings.length];
		}

        //maybe sometime fix logic for a 4x column shift not doing anything when there's only one column on the board anyway? sometimes you just win automatically when doing 1 enemy group + 1 shuffle move setting
        //eh it doesn't matter
	}

	return arrayToShuffle;
}