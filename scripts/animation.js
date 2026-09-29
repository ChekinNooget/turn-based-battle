var mario = document.getElementById("mario-sprite");

var startMarioIdle;

function setMarioThink() {
	mario.style.animationName = "marioThink";
	mario.style.animationDuration = "1s";
	mario.style.animationIterationCount = "infinite";
	mario.style.animationDirection = "alternate";

	clearTimeout(startMarioIdle);
}

function setMarioWin() {
	mario.style.animationName = "marioWin";
	mario.style.animationDuration = "2s";
	mario.style.animationIterationCount = "1";
	mario.style.animationDirection = "normal";

	clearTimeout(startMarioIdle);
	startMarioIdle = setTimeout(setMarioIdle, 2000);
}

function setMarioIdle() {
	mario.style.animationName = "marioIdle";
	mario.style.animationDuration = "1.5s";
	mario.style.animationIterationCount = "infinite";
	mario.style.animationDirection = "alternate";

	clearTimeout(startMarioIdle);
}

function setMarioFacingRight() {
	//the translate is there because i needed to use a translate to counteract the translate that centered this div
	mario.style.transform = `rotateY(-180deg) translate(45%, -50%)`;
}
function setMarioFacingLeft() {
	mario.style.transform = `translate(-50%, -50%)`;
}
