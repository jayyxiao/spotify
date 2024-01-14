var accessToken = localStorage.getItem("accesstoken");
const medium_tracks = JSON.parse(localStorage.getItem("mediumtracks"));
displayTracks(medium_tracks);

const short_tracks = await fetchTrackArtist(accessToken, "tracks", "short_term", 50, 0);
const long_tracks = await fetchTrackArtist(accessToken, "tracks", "long_term", 50, 0);
const select_timeframe = document.getElementById("timeframe");
select_timeframe.addEventListener("change", function() {
    if(document.getElementById("timeframe").selectedIndex == 0) {
        displayTracks(short_tracks);
    }
    else if(document.getElementById("timeframe").selectedIndex == 1) {
        displayTracks(medium_tracks);
    }
    else if(document.getElementById("timeframe").selectedIndex == 2){
        displayTracks(long_tracks);
    }
});


async function fetchTrackArtist(token, type, time_range, limit, offset) {
    const result = await fetch("https://api.spotify.com/v1/me/top/"+type+
    "?time_range="+time_range+"&limit="+limit+"&offset="+offset, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

function displayTracks(timeframe) {
    let sum = 0;
    for(let i=0; i<50; i++) {
        makeImage(timeframe.items[i].album.images, "tpic"+(i+1).toString(), 100);
        document.getElementById("track"+(i+1).toString()).innerText = timeframe.items[i].name;
        document.getElementById("tpic"+(i+1).toString()).children[0].title = timeframe.items[i].popularity;
        sum += timeframe.items[i].popularity;

        let playButton = document.getElementById("pt"+(i+1).toString());
        if(timeframe.items[i].preview_url) {
            playButton.setAttribute("href", timeframe.items[i].preview_url);
            playButton.removeAttribute("title"); //don't need to check if exists first, no exceptions are thrown
        }
        else {
            playButton.setAttribute("title", "Track Unavailable");
            playButton.removeAttribute("href");
        }
        playButton.setAttribute("target", "_blank");
    }
    document.getElementById("trackavg").innerText = sum/50;
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