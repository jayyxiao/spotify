import { redirectToAuthCodeFlow, getAccessToken } from "./authorization";

const clientId = "c066a667dc484615ab9ba7c050cf944b";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (!code) {  
    redirectToAuthCodeFlow(clientId);
} else {
    const accessToken = await getAccessToken(clientId, code);
    const profile = await fetchProfile(accessToken);
    const tracks = await fetchTrackArtist(accessToken, "tracks", "medium_term", 50, 0); //limit 50
    const artists = await fetchTrackArtist(accessToken, "artists", "medium_term", 50, 0);
    populateUI(profile);
    displayTracks(tracks);
    displayArtists(artists);
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

function populateUI(profile) {
    //Update UI with profile data
    document.getElementById("displayName").innerText = profile.display_name;
    if (profile.images[0]) {
        const profileImage = new Image(200, 200);
        profileImage.src = profile.images[0].url;
        document.getElementById("avatar").appendChild(profileImage);
        //document.getElementById("imgUrl").innerText = profile.images[0].url;
    }
    /*document.getElementById("id").innerText = profile.id;
    document.getElementById("email").innerText = profile.email;
    document.getElementById("uri").innerText = profile.uri;
    document.getElementById("uri").setAttribute("href", profile.external_urls.spotify);
    document.getElementById("url").innerText = profile.href;
    document.getElementById("url").setAttribute("href", profile.href);*/
}

function displayTracks(tracks) {
    for(let i=0; i<5; i++) {
        makeImage(tracks.items[i].album.images, "trackpic"+(i+1).toString(), 100);
        document.getElementById("track"+(i+1).toString()).innerText = tracks.items[i].name;
        document.getElementById("tpop"+(i+1).toString()).innerText = tracks.items[i].popularity;
    }
    let sum = 0;
    for(let j=0; j<50; j++) {
        sum += tracks.items[j].popularity;
    }
    document.getElementById("tavg").innerText = sum/50;
}

function displayArtists(artists) {
    for(let i=0; i<5; i++) {
        makeImage(artists.items[i].images, "artistpic"+(i+1).toString(), 100);
        document.getElementById("artist"+(i+1).toString()).innerText = artists.items[i].name;
        document.getElementById("apop"+(i+1).toString()).innerText = artists.items[i].popularity;
    }
    let sum = 0;
    for(let j=0; j<50; j++) {
        sum += artists.items[j].popularity;
    }
    document.getElementById("aavg").innerText = sum/50;
}

function makeImage(images, name, dimension) {
    if (images[0]) {
        const img = new Image(dimension, dimension);
        img.src = images[0].url;
        document.getElementById(name).appendChild(img);
    }
}