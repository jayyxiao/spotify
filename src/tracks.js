const medium_tracks = JSON.parse(localStorage.getItem("mediumtracks"));
//const medium_artists = sessionStorage.getItem("mediumartists");
for(let i=0; i<20; i++) {
    makeImage(medium_tracks.items[i].album.images, "tpic"+(i+1).toString(), 100);
    document.getElementById("track"+(i+1).toString()).innerText = medium_tracks.items[i].name;
    document.getElementById("tpic"+(i+1).toString()).children[0].title = medium_tracks.items[i].popularity;
}


function makeImage(images, name, dimension) {
    if (images[0]) {
        const img = new Image(dimension, dimension);
        img.src = images[0].url;
        const element = document.getElementById(name);
        if(element.hasChildNodes()) {
            if (element.lastChild.hasAttribute("src")) {
                element.removeChild(element.lastChild);
            }
        }
        //the 2 br are children too, the picture should be the third child, except for first pic
        element.appendChild(img);
    }
}