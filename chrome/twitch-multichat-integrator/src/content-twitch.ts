import { getColorForAuthor } from "./youtube-chat-colors";
import "./content-twitch.css";

const youtubeMessages: YoutubeChatMessage[] = [];
let youtubeMessagesEnabled = true;

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

// Inject toggle button into chat input area
function injectToggleButton() {
  const buttonContainer = document.querySelector('[data-test-selector="chat-input-buttons-container"]');
  
  console.log('Button container:', buttonContainer);
  if (buttonContainer && !document.getElementById('youtube-toggle-btn')) {
    const toggleButton = document.createElement('button');
    toggleButton.id = 'youtube-toggle-btn';
    toggleButton.className = 'youtube-toggle-button';
    toggleButton.textContent = 'YT';
    toggleButton.title = 'Toggle YouTube messages';
    toggleButton.setAttribute('aria-label', 'Toggle YouTube messages');
    
    toggleButton.onclick = () => {
      youtubeMessagesEnabled = !youtubeMessagesEnabled;
      toggleButton.classList.toggle('disabled', !youtubeMessagesEnabled);
      document.body.classList.toggle('hide-youtube-messages', !youtubeMessagesEnabled);
      console.log('YouTube messages:', youtubeMessagesEnabled ? 'enabled' : 'disabled');
    };
    
    // Insert after the first child
    if (buttonContainer.firstChild?.nextSibling) {
      buttonContainer.insertBefore(toggleButton, buttonContainer.firstChild.nextSibling);
    } else {
      buttonContainer.appendChild(toggleButton);
    }
    console.log('Toggle button injected');
  } else if (!buttonContainer) {
    // Retry if container not found yet
    setTimeout(injectToggleButton, 1000);
  }
}

// Inject the toggle button
injectToggleButton();

// Listen for messages from background script (broadcasts from other tabs)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'youtube-chat-message') {
    console.log('Received broadcast from tab:', message.sourceTabId, message.data);
    // Store the received YouTube chat message
    youtubeMessages.push(message.data);

    // Insert chat message into the Twitch chat only if enabled
    insertYoutubeMessageIntoTwitchChat(message.data);
  }
});

function insertYoutubeMessageIntoTwitchChat(youtubeMessage: YoutubeChatMessageData) {
  const chatContainer = document.querySelector('.chat-scrollable-area__message-container');
  if (!chatContainer) return;

  const usernameColor = getColorForAuthor(youtubeMessage.author);

  // Create a wrapper that looks like a Twitch chat line
  const chatLine = document.createElement('div');
  chatLine.className = 'chat-line__status youtube-chat-message' + (youtubeMessagesEnabled ? '' : ' hidden-youtube-message');
  chatLine.setAttribute('data-a-target', 'chat-line-message');
  
  const messageElement = document.createElement('div');
  messageElement.className = 'chat-line__message';
  messageElement.setAttribute('data-a-target', 'chat-line-message-body');
  messageElement.innerHTML = `
    <span style="border-radius:4px;border-width:1px;background-color:#fc1037;color:white;padding:2px;font-size:12px;">YouTube</span>
    <span style="color:${usernameColor};font-weight:bold;">${youtubeMessage.author}:</span>
    <span class="youtube-chat-message-content">${youtubeMessage.contentHtml ?? youtubeMessage.content}</span>
  `;
  
  chatLine.appendChild(messageElement);
  chatContainer.appendChild(chatLine);

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