import { getColorForAuthor } from "./youtube-chat-colors";

const youtubeMessages: YoutubeChatMessage[] = [];

// Content script for Twitch.tv pages
console.log('Twitch Multichat Integrator content script loaded');

// MutationObserver to watch for DOM changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {

  });
});

// Start observing when chat container is available
function startObserving() {
  const chatContainer = document.querySelector('.chat-scrollable-area__message-container');
  
  if (chatContainer) {
    observer.observe(chatContainer, {
      childList: true,
      subtree: true,
    });
    console.log('Started observing Twitch chat container');
  } else {
    // Retry after a short delay if chat container not found yet
    setTimeout(startObserving, 1000);
  }
}

// Start observing
startObserving();

// Listen for messages from background script (broadcasts from other tabs)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'youtube-chat-message') {
    console.log('Received broadcast from tab:', message.sourceTabId, message.data);
    // Store the received YouTube chat message
    youtubeMessages.push(message.data);

    // Insert chat message into the Twitch chat
    insertYoutubeMessageIntoTwitchChat(message.data);
  }
});

function insertYoutubeMessageIntoTwitchChat(youtubeMessage: YoutubeChatMessageData) {
  const chatContainer = document.querySelector('.chat-scrollable-area__message-container');
  if (!chatContainer) return;

  const usernameColor = getColorForAuthor(youtubeMessage.author);

  const messageElement = document.createElement('div');
  messageElement.className = 'chat-line__message youtube-chat-message';
  messageElement.style.margin = '2px';
  messageElement.style.padding = '4px';
  messageElement.style.backgroundColor = 'transparent';
  messageElement.innerHTML = `
    <span style="border-radius:4px;border-width:1px;background-color:#fc1037;color:white;padding:2px;font-size:12px;">YouTube</span>
    <span style="color:${usernameColor};font-weight:bold;">${youtubeMessage.author}:</span>
    <span>${youtubeMessage.content}</span>
  `;
  //<span style="color:#888;font-size:0.8em;margin-left:8px;">(${youtubeMessage.youtubeTimestamp})</span>
  chatContainer.appendChild(messageElement);

  // Auto-scroll to the bottom
  const scrollableArea = document.querySelector('[data-a-target="chat-scroller"]');
  if (scrollableArea) {
    scrollableArea.scrollTop = scrollableArea.scrollHeight;
  }
}

// Cleanup on unload
window.addEventListener('beforeunload', () => {
  observer.disconnect();
});