/*file that handles saves and other related things */

//things we're going to save to localstorage:
// - date of last solved (to check if the player has already played today)
// - progress in current puzzle (probably just store previousMoves array converted to json?)
// - daily puzzle stats such as #moves, if solved, and time to solve

var hasMarioWon = false;
var areEnemiesMatched = true;

var date;

document.getElementById("share-solved").textContent = "Unsolved";

//once the puzzle is solved, handle things like updating save data, opening share overlay, etc. etc.
function afterPuzzleSolved(matchingEnemies, updateShareStats = false, openShareOverlay = false) {
	//save date format
	if (solvedToday()) {
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

	//delay by 2 seconds to match mario's win animation (can tweak this)
	if (openShareOverlay) {
		setTimeout(() => {
			openOverlay("share");
		}, 2000);
	}
}

//when copy to clipboard button is clicked
function copyShareToClipboard() {
	console.log("copied to clipboard (lie)");
}

//user inputs -----------------------------------

function saveUserInputs(previousMoves) {
	if (isDailyPuzzleCurrently()) {
		localStorage.setItem("previous_moves_daily", JSON.stringify(previousMoves));
	} else {
		localStorage.setItem("previous_moves", JSON.stringify(previousMoves));
	}
}

function loadUserInputs(isDaily = true) {
	if (isDaily) {
		if (localStorage.getItem("previous_moves_daily") != null) {
			previousMoves = JSON.parse(localStorage.getItem("previous_moves_daily"));
		}
	} else {
		if (localStorage.getItem("previous_moves") != null) {
			previousMoves = JSON.parse(localStorage.getItem("previous_moves"));
		}
	}

	//hacky way to set it up but whatever...
	playerIsSelecting = false;
	playerUndo();

	updateTargetedTilesCSS();
	updateTileText();
	updateMoveCounter();
}

//load levels -----------------------------------

function loadDailyPuzzle() {
	const urlParams = new URLSearchParams(window.location.search);
	urlParams.delete("random");
	//no idea if this even is valid but it works lol
    //ok that was catastrophic, let's see if this fixes it
	window.history.replaceState(null, null, "?");

	if (localStorage.getItem("previous_moves_daily") != null) {
		loadUserInputs(true);
	} else {
		generateRandomGrid(`${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`, 3, 3);
	}
}

function loadRandomLevel() {
	const urlParams = new URLSearchParams(window.location.search);

	const newSeed = generateRandomString(10);
	generateRandomGrid(newSeed, document.getElementById("enemy-groups").value, document.getElementById("enemy-shuffle").value);
	urlParams.set("random", newSeed);
	urlParams.set("params", document.getElementById("enemy-groups").value + "-" + document.getElementById("enemy-shuffle").value);
	window.history.replaceState(null, null, "?" + urlParams);

	saveUserInputs(previousMoves);

	closeOverlay();
}

//checker functions -----------------------------------

function isDailyPuzzleCurrently() {
	const url = new URL(window.location);
	return url.searchParams.get("random") == null;
}

function solvedToday() {
	return localStorage.getItem("solved_date") == `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`;
}

//on page load
function setupStart() {
	date = new Date();

	const urlParams = new URLSearchParams(window.location.search);

    //load the level
	//if player is on a randomly generated level right now
	if (!isDailyPuzzleCurrently()) {
		//load the seeded random level
		var generateAnotherRandom = true;
		if (urlParams.get("params") != null) {
			var parameters = urlParams.get("params").split("-");
			if (parameters[0] != null && parameters[1] != null) {
				if (parameters[0] >= 1 && parameters[0] <= 6) {
					if (parameters[1] >= 0 && parameters[1] <= 1000) {
						generateRandomGrid(urlParams.get("random"), parameters[0], parameters[1]);
						generateAnotherRandom = false;
					}
				}
			}
		}
        //if the parameters are messed up, then just default to 3-3
		if (generateAnotherRandom) {
			generateRandomGrid(urlParams.get("random"), 3, 3);
		}

        //load inputs if applicable
		if (localStorage.getItem("previous_moves") != null) {
			//using json stringify might be a terrible idea but idc
			if (JSON.stringify(JSON.parse(localStorage.getItem("previous_moves"))[0]) === JSON.stringify(tilesArray)) {
				loadUserInputs(false);
			}
		}
	} else //otherwise do daily level
	{
		if (localStorage.getItem("previous_moves_daily") != null) {
			loadUserInputs(true);
		} else {
			generateRandomGrid(`${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`, 3, 3);
		}
	}

    //todo check if daily is already solved
	if (!solvedToday()) {
		//console.log("not solved yet");
	} else {
		//console.log("wow solved today");
	}
    
	updateTileText();
	resetAnimation();
	setMarioThink();
}
