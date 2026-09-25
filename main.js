//the level should be a 12x4 grid that visually wraps on the 4 end
//level[x][y]
//sliding a column should affect the one mod6 ahead of it, but upside down
//sliding a row just slides the row
var tiles = [
	[false, false, false, false, false, false, false, false, false, false, false, false],
	[false, false, false, false, false, false, false, false, false, false, false, false],
	[false, false, false, false, false, false, false, false, false, false, false, false],
	[false, false, false, false, false, false, false, false, false, false, false, false],
];

var newStyles = document.createElement("style");

var rotateOffset = 7;

function rotateRing() {
    rotateOffset++;
    
	var tiles = document.getElementsByClassName("tile");
	for (let i = 0; i < tiles.length; i++) {
        var newTransform = `rotateZ(${(rotateOffset + i)*360/12}deg) translateY(400%) rotateZ(-${(rotateOffset + i)*360/12}deg)`
        tiles[i].style.transform = newTransform;
	}
}
