import { redirectToAuthCodeFlow, getAccessToken } from "./authorization.js";

//const clientId = "c066a667dc484615ab9ba7c050cf944b";
//const clientId = "c0a6db2f18fd48358b8df6e491d342f6";
const clientId = "c3b2807f76384fcba21e9678dcaa6498";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

var authorizationToken = "";
var trackSeed = "";
var artistSeed = "";

if (!code) {  
    //add login button instead
    redirectToAuthCodeFlow(clientId);
} else {
    const accessToken = await getAccessToken(clientId, code);
    const profile = await fetchProfile(accessToken);
    const tracks = await fetchTrackArtist(accessToken, "tracks", "medium_term", 50, 0); //limit 50
    const artists = await fetchTrackArtist(accessToken, "artists", "medium_term", 50, 0);
    const recs_from_tracks = await fetchTrackRecs(accessToken, "tracks", tracks, 10);
    const recs_from_artists = await fetchTrackRecs(accessToken, "artists", artists, 10);
    populateUI(profile);
    displayTracks(tracks);
    displayArtists(artists);
    displayRecsFromTracks(recs_from_tracks);
    displayRecsFromArtists(recs_from_artists);

    const refresh = document.getElementById("mybutton");
    refresh.addEventListener("click", () => refreshRecs(), false);
    refresh.addEventListener("click", () => refreshRecsArtists(), false);

    const moretracks = document.getElementById("moretracks");
    localStorage.setItem("accesstoken", accessToken);

    moretracks.addEventListener("click", function() { 
        localStorage.setItem("mediumtracks", JSON.stringify(tracks)); });

    const moreartists = document.getElementById("moreartists");
    moreartists.addEventListener("click", function(){ 
        localStorage.setItem("mediumartists", JSON.stringify(artists)); });
}

async function fetchProfile(token) {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

async function fetchTrackArtist(token, type, time_range, limit, offset) {
    const result = await fetch("https://api.spotify.com/v1/me/top/"+type+
    "?time_range="+time_range+"&limit="+limit+"&offset="+offset, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

function displayTracks(tracks) {
    for(let i=0; i<5; i++) {
        makeImage(tracks.items[i].album.images, "trackpic"+(i+1).toString(), 100);
        document.getElementById("track"+(i+1).toString()).innerText = tracks.items[i].name;
        document.getElementById("trackpic"+(i+1).toString()).children[0].title = tracks.items[i].popularity;
    }
    let sum = 0;
    for(let j=0; j<5; j++) {
        sum += tracks.items[j].popularity;
    }
    document.getElementById("trackavg").innerText = sum/5;
    //replace 5 with 50 on see more page
}

function displayArtists(artists) {
    for(let i=0; i<5; i++) {
        makeImage(artists.items[i].images, "artistpic"+(i+1).toString(), 100);
        document.getElementById("artist"+(i+1).toString()).innerText = artists.items[i].name;
        document.getElementById("artistpic"+(i+1).toString()).children[0].title = artists.items[i].popularity;
    }
    let sum = 0;
    for(let j=0; j<5; j++) {
        sum += artists.items[j].popularity;
    }
    document.getElementById("artistavg").innerText = sum/5;
}

async function fetchTrackRecs(token, type, seed_object, limit) {
    //type is artists or tracks. only call this during driver
    let seeds = "";
    for(let i=0; i<5; i++) {
        seeds += seed_object.items[i].id;
        if(i != 4) {
            seeds += ",";
        }
    }
    const result = await fetch("https://api.spotify.com/v1/recommendations"+
    "?limit="+limit+"&seed_"+type+"="+seeds, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });
        //target_popularity
    if(type == "tracks") {
        authorizationToken = token;
        trackSeed = seeds;
    }
    else {
        artistSeed = seeds;
    }

        return await result.json();
}

function displayRecsFromTracks(trackObject) {
    for(let i=0; i<10; i++) {
        makeImage(trackObject.tracks[i].album.images, "t_recpic"+(i+1).toString(), 100);
        document.getElementById("t_rec"+(i+1).toString()).innerText = trackObject.tracks[i].name;
        document.getElementById("t_recpic"+(i+1).toString()).children[0].title = trackObject.tracks[i].popularity;
        let playButton = document.getElementById("pt"+(i+1).toString());
        if(trackObject.tracks[i].preview_url) {
            playButton.setAttribute("href", trackObject.tracks[i].preview_url);
            playButton.removeAttribute("title"); //don't need to check if exists first, no exceptions are thrown
        }
        else {
            playButton.setAttribute("title", "Track Unavailable");
            playButton.removeAttribute("href");
        }
        playButton.setAttribute("target", "_blank");
    }
}

function displayRecsFromArtists(trackObject) {
    //input is still a list of 10 tracks, just generated from artists seed
    for(let i=0; i<10; i++) {
        makeImage(trackObject.tracks[i].album.images, "a_recpic"+(i+1).toString(), 100);
        document.getElementById("a_rec"+(i+1).toString()).innerText = trackObject.tracks[i].name;
        document.getElementById("a_recpic"+(i+1).toString()).children[0].title = trackObject.tracks[i].popularity;

        let playButton = document.getElementById("pa"+(i+1).toString());
        if(trackObject.tracks[i].preview_url) {
            playButton.setAttribute("href", trackObject.tracks[i].preview_url);
            playButton.removeAttribute("title");
        }
        else {
            playButton.setAttribute("title", "Track Unavailable");
            playButton.removeAttribute("href");
        }
        playButton.setAttribute("target", "_blank");
    }
}

async function refreshRecs() {
    //timeout button for 3 seconds
    document.getElementById("mybutton").disabled = true;
    setTimeout(function(){
        document.getElementById("mybutton").disabled = false;
    }, 3000);

    const trackRec = await fetch("https://api.spotify.com/v1/recommendations?limit=10&seed_tracks="+trackSeed, {
        method: "GET", headers: { Authorization: `Bearer ${authorizationToken}` }
    });

    displayRecsFromTracks(await trackRec.json());
    return trackRec;
}

async function refreshRecsArtists() {
    const artistRec = await fetch("https://api.spotify.com/v1/recommendations?limit=10&seed_artists="+artistSeed, {
        method: "GET", headers: { Authorization: `Bearer ${authorizationToken}` }
    });

    displayRecsFromArtists(await artistRec.json());
    return artistRec;
}

function populateUI(profile) {
    //Update UI with profile data
    document.getElementById("displayName").innerText = profile.display_name;
    if (profile.images[0]) {
        const profileImage = new Image(200, 200);
        profileImage.src = profile.images[0].url;
        document.getElementById("avatar").appendChild(profileImage);
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