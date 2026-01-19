// Content script for Twitch.tv pages
console.log('Twitch Multichat Integrator content script loaded');

// MutationObserver to watch for DOM changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      // Example: Detect when chat messages are added
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          // Check if the node itself is a chat message
          if (node.classList.contains('chat-line__message')) {
            handleChatMessage(node);
          }
          
          // Also check children for chat messages
          const chatMessages = node.querySelectorAll('.chat-line__message');
          chatMessages.forEach((msgNode) => {
            if (msgNode instanceof HTMLElement) {
              handleChatMessage(msgNode);
            }
          });
        }
      });
    }
  });
});

function handleChatMessage(messageElement: HTMLElement) {
  const messageText = messageElement.textContent || '';
  console.log('New chat message detected:', messageText);

  // Send message to background script
  chrome.runtime.sendMessage({
    type: 'DOM_CHANGE',
    data: {
      event: 'chat_message',
      content: messageText,
      timestamp: Date.now(),
    },
  });
}

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
  if (message.type === 'DOM_CHANGE_BROADCAST') {
    console.log('Received broadcast from tab:', message.sourceTabId, message.data);
    // Handle the broadcasted data (e.g., update UI, sync state)
  }
});

// Cleanup on unload
window.addEventListener('beforeunload', () => {
  observer.disconnect();
});