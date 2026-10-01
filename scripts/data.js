//things we're going to save to localstorage:
// - date of last solved (to check if the player has already played today)
// - progress in current puzzle (probably just store previousMoves array converted to json?)
// - daily puzzle stats such as #moves, if solved, and time to solve

var hasMarioWon = false;
var areEnemiesMatched = true;

document.getElementById("share-solved").textContent = "Unsolved"

function afterPuzzleSolved(matchingEnemies, updateShareStats = false, openShareOverlay = false) {
    const date = new Date();
    if (localStorage.getItem("solved_date") == `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`) {
        openShareOverlay = false;
    }

    //psuedocode: if new number of moves is greater than saved number of moves, don't updateShareStats
    
    localStorage.setItem("solved_date", `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`)


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
            document.getElementById("share-solved").textContent = "Enemies matched"
        } else {
            document.getElementById("share-solved").textContent = "Enemies unmatched"
        }

        document.getElementById("share-time").textContent = "some time idk man"
    }

	if (openShareOverlay) {
		setTimeout(() => {
			openOverlay("share");
		}, 2000);
	}
}

function copyShareToClipboard(){
    console.log("hi")
}

function setupStart() {
	updateTileText();
	resetAnimation();
	setMarioThink();
}
