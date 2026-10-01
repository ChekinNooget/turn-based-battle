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
	//overlayDiv.style.opacity = "0"; //try to get the fade in animation working somehow...
	document.getElementById("dark-background").style.display = "none";
}

function openOverlay(layout) {
	var overlayDiv = document.getElementById("overlay");
	overlayDiv.style.display = "block";
	//overlayDiv.style.opacity = "1";
	document.getElementById("dark-background").style.display = "block";

	var allOverlaysDiv = document.getElementById("all-overlays");
	for (let i = 0; i < allOverlaysDiv.children.length; i++) {
		allOverlaysDiv.children[i].style.display = "none";
	}

    
	if (layout == "tutorial") {
		document.getElementById("tutorial-overlay").style.display = "block";
	} else if (layout == "share"){
		document.getElementById("share-overlay").style.display = "block";
    }
}
