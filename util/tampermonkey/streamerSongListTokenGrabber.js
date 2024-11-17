var hoagieAuthToken = ""; // REPLACE WITH THE REAL TOKEN
var streamers = [
    "hoagieman5000",
    "andrewcore",
    "thesongery",
    "joplaysviolin",
];
function getStreamerSonglistAuthToken() {
    return localStorage.getItem("StreamerSonglist_authToken");
}
function saveToken(token) {
    fetch("https://config.hoagieman.net/api/v1/streamersonglist/token", {
        method: "PUT",
        headers: {
            "Authorization": "Bearer ".concat(hoagieAuthToken),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: token }),
    });
}
// Get the current URL path
var currentPath = window.location.pathname;
console.log("Current URL path:", currentPath);
if (streamers.find(function (streamer) { return currentPath.includes(streamer); })) {
    var authToken = getStreamerSonglistAuthToken();
    if (authToken) {
        var trimmedToken = authToken.replace(/"/g, "");
        saveToken(trimmedToken);
    }
    else {
        console.log("StreamerSonglist_authToken not found in local storage.");
    }
}
