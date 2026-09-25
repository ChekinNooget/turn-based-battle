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

var rotateOffsets = [7, 7, 7, 7];

function rotateRing(ringIndex) {
    rotateOffsets[ringIndex]++;
    
	var tiles = document.getElementsByClassName("row")[ringIndex].children;
	for (let i = 0; i < tiles.length; i++) {
        var newTransform = `rotateZ(${(rotateOffsets[ringIndex] + i)*360/12}deg) translateY(400%) rotateZ(-${(rotateOffsets[ringIndex] + i)*360/12}deg)`
        tiles[i].style.transform = newTransform;
	}
}

function updateTileText(){
    var grid = document.getElementById("grid");
    for (let i = 0; i < grid.childElementCount; i++) {
        for (let j = 0; j < grid.children[i].children.length; j++) {
            grid.children[i].children[j].textContent = tiles[i][j];
            console.log(grid.children[i].children[j]);
        }
    }
}

function setupStart(){
    for (let i = 0; i < 4; i++) {
        rotateRing(i);
    }
    updateTileText();
}