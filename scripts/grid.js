//the level should be a 12x4 grid that visually wraps on the 4 end
//level[x][y]
//sliding a column should affect the one mod6 ahead of it, but upside down
//rotating a row just slides the row
var tilesArray = [
	["", "", "", "shy_guy", "", "goomba", "", "", "", "", "", ""], //innermost ring
	["", "", "", "shy_guy", "", "goomba", "", "", "", "", "", ""],
	["", "", "", "", "", "shy_guy", "", "", "goomba", "", "", ""],
	["", "", "", "", "", "", "shy_guy", "", "", "goomba", "", ""], //outermost ring
];

/* template all empty array
var tilesArray = [
	["", "", "", "", "", "", "", "", "", "", "", ""], //innermost ring
	["", "", "", "", "", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", "", "", "", "", ""], //outermost ring
];
*/

//initialize timeout for future use
var animationTimeout;

//the amount of pixels in between each row
var betweenTilesPadding = 75;
//the amount of pixel from the center to the first row
var tilePaddingStart = 175;

//the css that is applied to the tiles in order to get them in a ring
//ringIndex is which ring to target, and index is the tile of that ring.
function getTransformCSS(ringIndex, index, transformOffset = 0) {
	const effectiveIndex = (ringIndex + (index >= 6 ? 7 : 1) * shiftOffsets[index % 6]) % 8;
	var tempTranslateY = ``;

	if (effectiveIndex >= 4) {
		//tile pushed from inside to other side
		if (effectiveIndex == 7) {
			tempTranslateY = `${-tilePaddingStart}`;
		}
		//tile pushed from outside to other side
		else {
			tempTranslateY = `${-betweenTilesPadding * (effectiveIndex + transformOffset - 1) - tilePaddingStart}`;
		}
	} else {
		//every other tile (normal)
		tempTranslateY = `${betweenTilesPadding * (effectiveIndex - transformOffset) + tilePaddingStart}`;
	}

	return `
        rotateZ(${((rotateOffsets[ringIndex] + index) * 360) / 12}deg) 
        translateY(${tempTranslateY}px)
        rotateZ(-${((rotateOffsets[ringIndex] + index) * 360) / 12}deg)
    `;

	//original
	//translateY(${betweenTilesPadding * (effectiveIndex - transformOffset) + (effectiveIndex >= 4 ? -(tilePaddingStart * 4) : tilePaddingStart)}px)
}

//get every row's tile back to its original rotation, and update the text correspondingly
function resetAnimation() {
	updateTileText();
	resizeGrid();

	rotateOffsets = [7, 7, 7, 7];
	shiftOffsets = [0, 0, 0, 0, 0, 0];

	for (let j = 0; j < 4; j++) {
		var tileNodes = document.getElementsByClassName("row")[j].children;
		for (let i = 0; i < tileNodes.length; i++) {
			tileNodes[i].style.transition = "0s";
			tileNodes[i].style.transform = getTransformCSS(j, i);
		}
	}
}

//direction = true is clockwise, false is counterclockwise
//how off each ring is from the inital rotation point.
var rotateOffsets = [7, 7, 7, 7],
	shiftOffsets = [0, 0, 0, 0, 0, 0];

function rotateRing(ringIndex, direction = true) {
	//change the array

	//change which direction to spin the ring based on the direction that was inputted
	if (direction) {
		rotateOffsets[ringIndex]++;
	} else {
		rotateOffsets[ringIndex]--;
	}

	var newTempRing = tilesArray[ringIndex].slice();

	//whichever way it is, shift all of the elements in that array over by one.
	if (direction) {
		for (let i = 0; i < tilesArray[ringIndex].length; i++) {
			if (i == 0) {
				newTempRing[i] = tilesArray[ringIndex][tilesArray[ringIndex].length - 1];
			} else {
				newTempRing[i] = tilesArray[ringIndex][i - 1];
			}
		}
	} else {
		for (let i = 0; i < tilesArray[ringIndex].length; i++) {
			if (i == tilesArray[ringIndex].length - 1) {
				newTempRing[i] = tilesArray[ringIndex][0];
			} else {
				newTempRing[i] = tilesArray[ringIndex][i + 1];
			}
		}
	}
	tilesArray[ringIndex] = newTempRing;

	//visual stuff
	var tileNodes = document.getElementsByClassName("row")[ringIndex].children;
	for (let i = 0; i < tileNodes.length; i++) {
		tileNodes[i].style.transition = "0.2s";
		tileNodes[i].style.transform = getTransformCSS(ringIndex, i);
	}

	//set this to whatever the transition time is
	//clear timeout in case you're spamming the button
	clearTimeout(animationTimeout);
	animationTimeout = setTimeout(resetAnimation, 200);
}

//returns the column, in order of [innermost ring, awef, awef, outermost ring]
function getColumn(columnIndex, targetArray = tilesArray) {
	var newColumn = [];
	for (let i = 0; i < 4; i++) {
		newColumn.push(targetArray.slice()[i][columnIndex]);
	}
	return newColumn;
}

function shiftColumn(columnIndex, direction = true) {
	//todo: this is a temp solution to keep the shifting column animation from tweaking out when spammed
	//fix soon probably please !!
	resetAnimation();

	//change the array

	if (!direction) {
		columnIndex = (columnIndex + 6) % 12;
	}
	shiftOffsets[columnIndex % 6] += columnIndex >= 6 ? 1 : 7;

	var newTempColumn1 = getColumn(columnIndex); //column pushed towards center
	var newTempColumn2 = getColumn((columnIndex + 6) % 12); // column pushed towards edge

	var pushedTile1 = newTempColumn1.slice()[0];
	var pushedTile2 = newTempColumn2.slice()[3];

	//handle the first column first, move everything over, and pull the extra one from the other column
	for (let i = 0; i < newTempColumn1.length; i++) {
		if (i == 3) {
			newTempColumn1[i] = pushedTile2;
		} else {
			newTempColumn1[i] = newTempColumn1[i + 1];
		}
	}

	//second column, same thing
	for (let i = newTempColumn2.length - 1; i >= 0; i--) {
		if (i == 0) {
			newTempColumn2[i] = pushedTile1;
		} else {
			newTempColumn2[i] = newTempColumn2[i - 1];
		}
	}

	//replace the original array with the columns
	for (let i = 0; i < 4; i++) {
		tilesArray[i][columnIndex] = newTempColumn1[i];
	}
	for (let i = 0; i < 4; i++) {
		tilesArray[i][(columnIndex + 6) % 12] = newTempColumn2[i];
	}

	//animation below here
	const board = document.getElementsByClassName("row");
	for (let i = 0; i < board.length; i++) {
		board[i].children[columnIndex].style.transition = "0.2s";
		board[i].children[columnIndex].style.transform = getTransformCSS(i, columnIndex);

		if (i == 3) {
			//the outermost tile being pushed towards the edge
			//put it one tile offset from the edge of the other side
			board[i].children[(columnIndex + 6) % 12].style.transition = "0s";
			board[i].children[(columnIndex + 6) % 12].style.transform = getTransformCSS(i, (columnIndex + 6) % 12, 1);
		}

		//put everything in its proper spot
		setTimeout(function () {
			board[i].children[(columnIndex + 6) % 12].style.transition = "0.2s";
			board[i].children[(columnIndex + 6) % 12].style.transform = getTransformCSS(i, (columnIndex + 6) % 12);
		}, 0);
	}

	clearTimeout(animationTimeout);
	animationTimeout = setTimeout(resetAnimation, 200);
}

//check if the board is solved
//returns [bool:is solved?, bool:is solved with all matching enemies?]
function checkIfSolved() {
	var tempCheckedArray = tilesArray.slice();
	var tempColumnsArray = [];

	var returnArray = [false, true];

	//first pass: get every column
	for (let i = 0; i < tempCheckedArray[0].length; i++) {
		tempColumnsArray.push(getColumn(i, tempCheckedArray));
	}

	//second pass: check for easy failures
	for (let i = 0; i < tempColumnsArray.length; i++) {
		//if there's an odd number of elements in a column, the whole board MUST be unsolved.
		//return false
		if (tempColumnsArray[i].filter((x) => x != "").length % 2 == 1) {
			returnArray = [false, false];
			return returnArray;
		}

		//if the array contains a non empty element, but one of the first two
		//  element are empty, then it MUST be unsolved.
		//return false
		if (!tempColumnsArray[i].every((val, a, arr) => val == "") && (tempColumnsArray[i][0] == "" || tempColumnsArray[i][1] == "")) {
			returnArray = [false, false];
			return returnArray;
		}
	}

	//now we're checking for correctness
	//remove all "solved" elements so that at the end, we can check if the list is empty

	//third pass: check for fully filled out columns. (easy
	for (let i = 0; i < tempColumnsArray.length; i++) {
		//if all slots are filled: it's a row, so it's good. easy check
		if (!tempColumnsArray[i].includes("")) {
			//if all slots aren't equal to each other, there must be a mix of enemies
			if (!tempColumnsArray[i].every((val, a, arr) => val == arr[0])) {
				returnArray[1] = false;
			}

			for (let j = 0; j < tempColumnsArray[i].length; j++) {
				tempColumnsArray[i][j] = "";
			}
		}
	}

	//keeps track of where there stopped being full squares
	var tempBeginningEdgeCase = 0;
	var tempContinueCheckingEdgeCase = true;
	var tempCheckUniqueElements = [];

	//fourth pass: check for squares
	//we use length - 1 because we don't want to go out of bounds on the final column
	for (let i = 0; i < tempColumnsArray.length - 1; i++) {
		tempCheckUniqueElements = [];

		//these are the four tiles that make a square
		tempCheckUniqueElements.push(tempColumnsArray[i][0]);
		tempCheckUniqueElements.push(tempColumnsArray[i][1]);
		tempCheckUniqueElements.push(tempColumnsArray[i + 1][0]);
		tempCheckUniqueElements.push(tempColumnsArray[i + 1][1]);

		//if there's an empty element, it can't be a square, so skip
		if (tempCheckUniqueElements.includes("")) {
			tempContinueCheckingEdgeCase = false;
			continue;
		} else {
			//keep incrementing tempBeginningEdgeCase until the for loop gets skipped by an empty element
			if (tempContinueCheckingEdgeCase) {
				tempBeginningEdgeCase = i + 2;
			}

			//if all slots aren't equal to each other, there must be a mix of enemies
			if (!tempCheckUniqueElements.every((val, a, arr) => val == arr[0])) {
				returnArray[1] = false;
			}

			//set everything empty.
			tempColumnsArray[i][0] = "";
			tempColumnsArray[i][1] = "";
			tempColumnsArray[i + 1][0] = "";
			tempColumnsArray[i + 1][1] = "";

			//we already checked the next column so we can skip checking that one again
			i++;
		}
	}

	//check for edge case: if the very first column and the very last column are
	//  both ["X", "X", "", ""], they make a square, even though it doesn't look
	//  like it from the array
	//we also need to account for if we already used the first column for a different square,
	//  which is what tempBeginningEdgeCase is for. we can "drag" the extra unused column of
	//  tiles if we need to

	tempCheckUniqueElements = [];
	tempCheckUniqueElements.push(tempColumnsArray[tempBeginningEdgeCase][0]);
	tempCheckUniqueElements.push(tempColumnsArray[tempBeginningEdgeCase][1]);
	tempCheckUniqueElements.push(tempColumnsArray[tempColumnsArray.length - 1][0]);
	tempCheckUniqueElements.push(tempColumnsArray[tempColumnsArray.length - 1][1]);

	//TODO: there remains an edge case, where if the above edge case happens, the mismatched enemies check is wrong for the other squares from tempColumnsArray[0] to tempColumnsArray[tempBeginningEdgeCase].

	//check if all the tiles are filled
	if (!tempCheckUniqueElements.includes("")) {
		//again, if the tiles aren't equal, the enemies are mismatched
		if (!tempCheckUniqueElements.every((val, a, arr) => val == arr[0])) {
			returnArray[1] = false;
		}

		//set everything empty
		tempColumnsArray[tempBeginningEdgeCase][0] = "";
		tempColumnsArray[tempBeginningEdgeCase][1] = "";
		tempColumnsArray[tempColumnsArray.length - 1][0] = "";
		tempColumnsArray[tempColumnsArray.length - 1][1] = "";
	}

	//FINAL CHECK: if the entire array is empty, then the board is solved!
	var finalArray = tempColumnsArray.flat();
	if (finalArray.every((val, a, arr) => val == "")) {
		returnArray[0] = true;
		return returnArray;
	} else {
		//otherwise we must have missed something
		returnArray = [false, false];
		return returnArray;
	}
}

//update every tile with its text
function updateTileText() {
	for (let i = 0; i < tilesArray.length; i++) {
		var row = document.getElementsByClassName("row")[i];
		for (let j = 0; j < tilesArray[i].length; j++) {
			row.children[j].innerHTML = "";
			if (tilesArray[i][j] != "") {
				var enemySprite = document.createElement("img");
				enemySprite.className = "enemy-sprite";
				enemySprite.src = `./assets/sprites/enemies/${tilesArray[i][j]}.png`;
				enemySprite.classList.add("enemy-sprite-animate");
				row.children[j].appendChild(enemySprite);
			}
		}
	}
}

function afterPuzzleSolved(matchingEnemies) {
    var moveCounter = document.getElementById("moves-counter-counter")
    
	if (matchingEnemies) {
		moveCounter.textContent = "x" + (previousMoves.length - 1).toString();
        moveCounter.className = "move-counter-full-solved"
	} else {
		moveCounter.textContent = "x" + (previousMoves.length - 1).toString();
        moveCounter.className = "move-counter-half-solved"
	}

	setMarioWin();
}

function setupStart() {
	updateTileText();
	resetAnimation();
	setMarioThink();
}
