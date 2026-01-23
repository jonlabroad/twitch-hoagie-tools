import { YoutubeChannelNameDeclarationMessage } from "../../messages/messages";
import { getYoutubeVideoIdFromUrl } from "./urlUtil";

export const youtubeMainWindow = () => {
  // Only run in the main window (not in iframes)
  if (window.self !== window.top) {
    return;
  }

  findChannelName();

  function findChannelName() {
    const channelNameElement = document.querySelector(
      "#channel-name #text a",
    );

    if (!channelNameElement) {
        setTimeout(findChannelName, 1000);
    } else {
        const videoId = getYoutubeVideoIdFromUrl(window.location.href);

        const channelName = channelNameElement.textContent?.trim();
        if (!channelName || !videoId) {
            throw new Error("Youtube channel name or id not found");
        }

        console.log("Youtube channel name:", channelName);
        console.log("Youtube video ID:", videoId);

        // Send channel name and video ID to background script
        const message: YoutubeChannelNameDeclarationMessage = {
            type: "youtube-channel-name-declaration",
            data: {
                channelName,
                videoId: videoId,
            },
        };
        chrome.runtime.sendMessage(message);
    }
  }
};
