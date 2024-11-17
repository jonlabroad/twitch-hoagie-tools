const hoagieAuthToken = ""; // REPLACE WITH THE REAL TOKEN

const streamers = [
  "hoagieman5000",
  "andrewcore",
  "thesongery",
  "joplaysviolin",
];

function getStreamerSonglistAuthToken(): string | null {
  return localStorage.getItem("StreamerSonglist_authToken");
}

function saveToken(token: string) {
  fetch("https://config.hoagieman.net/api/v1/streamersonglist/token", {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${hoagieAuthToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });
}

// Get the current URL path
const currentPath = window.location.pathname;
console.log("Current URL path:", currentPath);
if (streamers.find((streamer) => currentPath.includes(streamer))) {
  const authToken = getStreamerSonglistAuthToken();
  if (authToken) {
    const trimmedToken = authToken.replace(/"/g, "");
    saveToken(trimmedToken);
  } else {
    console.log("StreamerSonglist_authToken not found in local storage.");
  }
}

