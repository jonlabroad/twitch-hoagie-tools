import { YoutubeChatMessage, YoutubeChannelNameDeclarationMessage } from "../../messages/messages";
import { getYoutubeVideoIdFromUrl } from "./urlUtil";

export const youtubeChatContent = () => {
  // Only run in the chat iframe
  if (window.self !== window.top) {
    // We're in an iframe - check if it's the chat iframe
    const isInChatFrame =
      window.frameElement?.id === "chatframe" ||
      window.frameElement?.classList.contains("ytd-live-chat-frame");

    if (!isInChatFrame) {
      console.log("Not in chat iframe, skipping");
      return;
    }
  }

  console.log("YouTube Live Chat Integrator content script loaded");

  // MutationObserver to watch for DOM changes
  const youtubeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        // Detect when chat messages are added
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            // Check if the node itself is a chat message
            if (node.tagName === "YT-LIVE-CHAT-TEXT-MESSAGE-RENDERER") {
              handleYoutubeChatMessage(node);
            }

            // Also check children for chat messages (tag selector, not class)
            const chatMessages = node.querySelectorAll(
              "yt-live-chat-text-message-renderer",
            );

            chatMessages.forEach((msgNode) => {
              if (msgNode instanceof HTMLElement) {
                handleYoutubeChatMessage(msgNode);
              }
            });
          }
        });
      }
    });
  });

  // Find and send channel name
  findChannelName();

  // Start observing
  startObservingYoutube();

  // Cleanup on unload
  window.addEventListener("beforeunload", () => {
    youtubeObserver.disconnect();
  });

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
          return;
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
        setHeartbeatTimeout(channelName, videoId);
    }
  }

  function startObservingYoutube() {
    const chatContainer = document.querySelector(
      ".yt-live-chat-item-list-renderer #items",
    );

    if (chatContainer) {
      youtubeObserver.observe(chatContainer, {
        childList: true,
        subtree: true,
      });
    } else {
      // Retry after a short delay if chat container not found yet
      setTimeout(startObservingYoutube, 1000);
    }
  }

  function handleYoutubeChatMessage(messageElement: HTMLElement) {
    const messageId = messageElement.id || "";
    const youtubeTimestamp =
      messageElement.querySelector("#timestamp")?.textContent || "";
    const messageContainer = messageElement.querySelector("#message");
    const messageText = messageContainer?.textContent || "";
    const messageHtml = messageContainer?.innerHTML || "";
    const author =
      messageElement.querySelector("#author-name")?.textContent || "";

    // Send message to background script
    if (window.top?.location.href) {
      const videoId = getYoutubeVideoIdFromUrl(window.top.location.href);
      if (!videoId) {
        console.warn("Could not determine video ID from URL");
        return;
      }
      const message: YoutubeChatMessage = {
        type: "youtube-chat",
        data: {
          videoId,
          messageId,
          author: author,
          content: messageText,
          contentHtml: messageHtml,
          youtubeTimestamp,
          timestamp: Date.now(),
        },
      };

      chrome.runtime.sendMessage(message);
    }
  }

  function setHeartbeatTimeout(channelName: string, videoId: string) {
    setTimeout(() => {
      // Send heartbeat message to background script
      const heartbeatMessage = {
        type: "youtube-channel-name-declaration",
        data: {
          channelName,
          videoId,
        },
      };
      chrome.runtime.sendMessage(heartbeatMessage);
      setHeartbeatTimeout(channelName, videoId);
    }, 15 * 1000); // every 15 seconds
  }
};
