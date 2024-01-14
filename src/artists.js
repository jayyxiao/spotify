var accessToken = localStorage.getItem("accesstoken");
const medium_artists = JSON.parse(localStorage.getItem("mediumartists"));
displayArtists(medium_artists);

const short_artists = await fetchTrackArtist(accessToken, "artists", "short_term", 50, 0);
const long_artists = await fetchTrackArtist(accessToken, "artists", "long_term", 50, 0);
const select_timeframe = document.getElementById("timeframe");
select_timeframe.addEventListener("change", function() {
    if(document.getElementById("timeframe").selectedIndex == 0) {
        displayArtists(short_artists);
    }
    else if(document.getElementById("timeframe").selectedIndex == 1) {
        displayArtists(medium_artists);
    }
    else if(document.getElementById("timeframe").selectedIndex == 2){
        displayArtists(long_artists);
    }
});


async function fetchTrackArtist(token, type, time_range, limit, offset) {
    const result = await fetch("https://api.spotify.com/v1/me/top/"+type+
    "?time_range="+time_range+"&limit="+limit+"&offset="+offset, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

function displayArtists(timeframe) {
    for(let i=0; i<50; i++) {
        makeImage(timeframe.items[i].images, "apic"+(i+1).toString(), 100);
        document.getElementById("artist"+(i+1).toString()).innerText = timeframe.items[i].name;
        document.getElementById("apic"+(i+1).toString()).children[0].title = timeframe.items[i].popularity;
    }
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