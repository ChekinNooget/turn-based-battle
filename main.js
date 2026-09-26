//the level should be a 12x4 grid that visually wraps on the 4 end
//level[x][y]
//sliding a column should affect the one mod6 ahead of it, but upside down
//rotating a row just slides the row
var tilesArray = [
	[false, false, false, false, false, "O", false, false, false, false, false, false], //innermost ring
	[false, false, false, false, false, "O", false, false, false, false, false, false],
	[false, false, false, false, false, "O", false, false, "X", "X", false, false],
	[false, false, false, false, false, "O", false, false, "X", "X", false, false], //outermost ring
];

//replace all falses with empty strings. probably remove this at some point
for (let i = 0; i < tilesArray.length; i++) {
	for (let j = 0; j < tilesArray[i].length; j++) {
		if (tilesArray[i][j] == false) {
			tilesArray[i][j] = "";
		}
	}
}

//the css that is applied to the tiles in order to get them in a ring
//ringIndex is which ring to target, and index is the tile of that ring.
//it works by rotating each 
function getTransformCSS(ringIndex, index) {
	return `rotateZ(${((rotateOffsets[ringIndex] + index) * 360) / 12}deg) translateY(${75 * ringIndex + 175}px) rotateZ(-${((rotateOffsets[ringIndex] + index) * 360) / 12}deg)`;
}

//direction = true is clockwise, false is counterclockwise
var rotationTimeout;
//how off each ring is from the inital rotation point.
var rotateOffsets = [7, 7, 7, 7];

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
	clearTimeout(rotationTimeout);
	rotationTimeout = setTimeout(resetRotation, 200);
}

//get every row's tile back to its original rotation, and update the text correspondingly
function resetRotation() {
	updateTileText();

	rotateOffsets = [7, 7, 7, 7];

	for (let j = 0; j < 4; j++) {
		var tileNodes = document.getElementsByClassName("row")[j].children;
		for (let i = 0; i < tileNodes.length; i++) {
			tileNodes[i].style.transition = "0s";
			tileNodes[i].style.transform = getTransformCSS(j, i);
		}
	}
}

//returns the column, in order of [innermost ring, awef, awef, outermost ring]
function getColumn(columnIndex) {
	var newColumn = [];
	for (let i = 0; i < 4; i++) {
		newColumn.push(tilesArray.slice()[i][columnIndex]);
	}
	return newColumn;
}

function shiftColumn(columnIndex, direction = true) {
	//change the array

	if (!direction) {
		columnIndex = (columnIndex + 6) % 12;
	}

	var newTempColumn1 = getColumn(columnIndex);
	var newTempColumn2 = getColumn((columnIndex + 6) % 12);

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
    
	updateTileText();
}

//update every tile with its text
function updateTileText() {
	var grid = document.getElementById("grid");
	for (let i = 0; i < tilesArray.length; i++) {
		for (let j = 0; j < tilesArray[i].length; j++) {
			grid.children[i].children[j].textContent = tilesArray[i][j];
		}
	}
}

function setupStart() {
	updateTileText();
	resetRotation();
}
