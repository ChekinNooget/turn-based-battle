window.addEventListener(
	"resize",
	function (event) {
		console.log("on resize");
		resetAnimation();
        resizeGrid()
	},
	true,
);

function resizeGrid(){
    //needs minor tweaking
    betweenTilesPadding = Math.min(document.documentElement.clientWidth - 100, document.documentElement.clientHeight - 250)/10;
    tilePaddingStart = Math.min(document.documentElement.clientWidth - 100, document.documentElement.clientHeight - 250)/5;

    var gridBackground = document.getElementById("grid-background")

    var gridDiameter = (tilePaddingStart + betweenTilesPadding*4)*2

    gridBackground.style.width = `${gridDiameter}px`
    gridBackground.style.height = `${gridDiameter}px`

    
}

function closeOverlay() {
	var overlayDiv = document.getElementById("overlay");
	overlayDiv.style.display = "none";
	document.getElementById("dark-background").style.display = "none";
}

function openOverlay(layout) {
	var overlayDiv = document.getElementById("overlay");
	overlayDiv.style.display = "block";
	document.getElementById("dark-background").style.display = "block";

	var allOverlaysDiv = document.getElementById("all-overlays");
	for (let i = 0; i < allOverlaysDiv.children.length; i++) {
		allOverlaysDiv.children[i].style.display = "none";
	}

	if (layout == "tutorial") {
		allOverlaysDiv.children[0].style.display = "block";
	}
}
