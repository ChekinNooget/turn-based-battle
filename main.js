//the level should be a 12x4 grid that visually wraps on the 4 end
//level[x][y]
//sliding a column should affect the one mod6 ahead of it, but upside down
//rotating a row just slides the row
var tilesArray = [
	[false, false, false, false, false, "O", false, false, false, false, false, false], //innermost ring
	[false, false, false, false, false, "O", false, false, false, false, false, false],
	[false, false, false, false, false, "O", false, false, "X", false, false, false],
	[false, false, false, false, false, "O", false, false, "X", false, false, false], //outermost ring
];

for (let i = 0; i < tilesArray.length; i++) {
	for (let j = 0; j < tilesArray[i].length; j++) {
		if (tilesArray[i][j] == false) {
			tilesArray[i][j] = "";
		}
	}
}

function getTransformCSS(ringIndex, index) {
	return `rotateZ(${((rotateOffsets[ringIndex] + index) * 360) / 12}deg) translateY(${75 * ringIndex + 175}px) rotateZ(-${((rotateOffsets[ringIndex] + index) * 360) / 12}deg)`;
}

//direction = true is clockwise, false is counterclockwise
var rotationTimeout;
var rotateOffsets = [7, 7, 7, 7];
var newTransform = "";
function rotateRing(ringIndex, direction = true) {
	//change the array

	if (direction) {
		rotateOffsets[ringIndex]++;
	} else {
		rotateOffsets[ringIndex]--;
	}

	var newTempRing = tilesArray[ringIndex].slice();

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
		newTransform = getTransformCSS(ringIndex, i);

		tileNodes[i].style.transform = newTransform;
	}

	//set this to whatever the transition time is
	//clear timeout in case you're spamming the button
	clearTimeout(rotationTimeout);
	rotationTimeout = setTimeout(resetRotation, 200);
}

function resetRotation() {
	updateTileText();

	rotateOffsets = [7, 7, 7, 7];

	for (let j = 0; j < 4; j++) {
		var tileNodes = document.getElementsByClassName("row")[j].children;
		for (let i = 0; i < tileNodes.length; i++) {
			tileNodes[i].style.transition = "0s";
			newTransform = getTransformCSS(j, i);
			tileNodes[i].style.transform = newTransform;
		}
	}
}

//returns the column, in order of [innermost ring, awef, awef, outermost ring]
function getColumn(columnIndex) {
	var newColumn = [];
	for (let i = 0; i < 4; i++) {
		newColumn.push(tilesArray[i][columnIndex]);
	}
	return newColumn.slice();
}
function setColumn(columnIndex, newColumn) {
	for (let i = 0; i < 4; i++) {
		tilesArray[i][columnIndex] = newColumn[i];
	}
}

function shiftColumn(columnIndex, direction = true) {
	//change the array

	if (!direction) {
		columnIndex = (columnIndex + 6) % 12;
	}

	var newTempColumn1 = getColumn(columnIndex);
	var newTempColumn2 = getColumn((columnIndex + 6) % 12);

	var pushedTile1 = newTempColumn1[0];
	var pushedTile2 = newTempColumn2[3];

	for (let i = 0; i < newTempColumn1.length; i++) {
		if (i == 3) {
			newTempColumn1[i] = pushedTile2;
		} else {
			newTempColumn1[i] = newTempColumn1[i + 1];
		}
	}

	for (let i = newTempColumn2.length - 1; i >= 0; i--) {
		if (i == 0) {
			newTempColumn2[i] = pushedTile1;
		} else {
			newTempColumn2[i] = newTempColumn2[i - 1];
		}
	}

	setColumn(columnIndex, newTempColumn1);
	setColumn((columnIndex + 6) % 12, newTempColumn2);

	//animation below here

	updateTileText();
}

function updateTileText() {
	var grid = document.getElementById("grid");
	for (let i = 0; i < tilesArray.length; i++) {
		for (let j = 0; j < tilesArray[i].length; j++) {
			grid.children[i].children[j].textContent = tilesArray[i][j];
			//console.log(grid.children[i].children[j]);
		}
	}
}

function setupStart() {
	//jank in order to get the rings to look right on first load
	for (let i = 0; i < 4; i++) {
		rotateRing(i, true);
		rotateRing(i, false);
	}
	updateTileText();
	resetRotation();
}
