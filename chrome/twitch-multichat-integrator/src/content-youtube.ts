// Only run in the chat iframe
if (window.self !== window.top) {
  // We're in an iframe - check if it's the chat iframe
  const isInChatFrame = window.frameElement?.id === 'chatframe' || 
                        window.frameElement?.classList.contains('ytd-live-chat-frame');
  
  if (!isInChatFrame) {
    console.log("Not in chat iframe, skipping");
    throw new Error("Not in chat iframe"); // Stop script execution
  }
}

console.log("YouTube Live Chat Integrator content script loaded");

// Message types
interface YoutubeChatMessageData {
  author: string;
  content: string;
  youtubeTimestamp: string;
  timestamp: number;
}

interface YoutubeChatMessage {
  type: 'youtube-chat';
  data: YoutubeChatMessageData;
}

type YoutubeMessage = YoutubeChatMessage;

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

function handleYoutubeChatMessage(messageElement: HTMLElement) {
  const youtubeTimestamp = messageElement.querySelector("#timestamp")?.textContent || "";
  const messageText =
    messageElement.querySelector("#message")?.textContent || "";
  const author =
    messageElement.querySelector("#author-name")?.textContent || "";

  // Send message to background script
  const message: YoutubeChatMessage = {
    type: "youtube-chat",
    data: {
      author: author,
      content: messageText,
      youtubeTimestamp,
      timestamp: Date.now(),
    },
  };

  console.log({ chatMessage: message });
  
  chrome.runtime.sendMessage(message);
}

// Start observing when chat container is available
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

// Start observing
startObservingYoutube();

// Cleanup on unload
window.addEventListener("beforeunload", () => {
  youtubeObserver.disconnect();
});
