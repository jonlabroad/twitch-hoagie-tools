import { YoutubeChatRepository, YoutubeLiveInfo } from "../../shared/youtubeChatRepo";
import {
  YoutubeChatMessage,
  YoutubeChatMessageData,
} from "../../messages/messages";
import { injectToggleButton, isYoutubeMessagesEnabled } from "./toggle-button";
import { renderYoutubeMessage } from "./YoutubeMessage";
import "./content-twitch.css";

const youtubeChatRepository = new YoutubeChatRepository();
const youtubeMessages: YoutubeChatMessage[] = [];
var selectedYoutubeVideoSource: YoutubeLiveInfo | null = null;
let isYoutubeMenuOpen = false;
let scrollLockPosition: number | null = null;

// Content script for Twitch.tv pages
console.log("Twitch Multichat Integrator content script loaded");

// MutationObserver to watch for DOM changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {});
});

// Start observing when chat container is available
function startObserving() {
  const chatContainer = document.querySelector(
    ".chat-scrollable-area__message-container",
  );

  if (chatContainer) {
    observer.observe(chatContainer, {
      childList: true,
      subtree: true,
    });
    console.log("Started observing Twitch chat container");
  } else {
    // Retry after a short delay if chat container not found yet
    setTimeout(startObserving, 1000);
  }
}

// Start observing
startObserving();

// Add scroll lock enforcement
setInterval(() => {
  if (scrollLockPosition !== null) {
    const scrollableArea = document.querySelector('[data-a-target="chat-scroller"]') as HTMLElement;
    if (scrollableArea && scrollableArea.scrollTop !== scrollLockPosition) {
      scrollableArea.scrollTop = scrollLockPosition;
    }
  }
}, 16); // Check every frame (~60fps)

const onYoutubeChannelSelectionChange = (videoId: string) => {
  if (selectedYoutubeVideoSource?.videoId === videoId) {
    return; // No change
  }

  console.log("Selected YouTube channel changed to:", videoId);
  selectedYoutubeVideoSource = youtubeChatRepository.getChannelById(videoId);

  // Find all YouTube messages and show/hide based on videoId
  const allYoutubeMessages = document.querySelectorAll('.youtube-chat-message');
  allYoutubeMessages.forEach((messageElement) => {
    const messageVideoId = messageElement.getAttribute('data-youtube-video-id');
    
    if (messageVideoId === videoId) {
      // Show messages from the selected channel
      messageElement.classList.remove('hidden-youtube-message');
    } else {
      // Hide messages from other channels
      messageElement.classList.add('hidden-youtube-message');
    }
  });
}

// Inject the toggle button
injectToggleButton(youtubeChatRepository, onYoutubeChannelSelectionChange);

// Listen for messages from background script (broadcasts from other tabs)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "youtube-chat-message") {
    console.log(
      "Received broadcast from tab:",
      message.sourceTabId,
      message.data,
    );
    // Store the received YouTube chat message
    youtubeChatRepository.upsertChatMessage(message.data.videoId, message.data);
    youtubeMessages.push(message.data);

    // Insert chat message into the Twitch chat only if enabled
    insertYoutubeMessageIntoTwitchChat(message.data);
  } else if (message.type === "youtube-channel-name-declaration") {
    const existingChannel = youtubeChatRepository.getChannelById(message.data.videoId);
    console.log(
      "Received channel name declaration:",
      message.data.channelName,);

    if (!existingChannel) {
      youtubeChatRepository.initializeChannel(message.data.videoId, message.data.channelName);
    } else {
      youtubeChatRepository.handleHeartbeat(existingChannel);
    }
  }
});

function insertYoutubeMessageIntoTwitchChat(
  youtubeMessage: YoutubeChatMessageData,
) {
  const chatContainer = document.querySelector(
    ".chat-scrollable-area__message-container",
  );
  if (!chatContainer) {
    return;
  }

  const messageEnabled = isYoutubeMessagesEnabled() && isChatEnabled(youtubeMessage.videoId);

  // Create a wrapper that looks like a Twitch chat line
  const chatLine = document.createElement("div");
  chatLine.className =
    "chat-line__status youtube-chat-message" +
    (messageEnabled ? "" : " hidden-youtube-message");
  chatLine.setAttribute("data-a-target", "chat-line-message");
  chatLine.setAttribute("data-youtube-video-id", youtubeMessage.videoId);
  chatLine.setAttribute("data-youtube-message-id", youtubeMessage.messageId);

  const messageElement = document.createElement("div");
  messageElement.id = youtubeMessage.messageId;

  // Define handlers for delete and ban
  const handleDelete = (messageId: string) => {
    console.log('Delete message:', messageId);
    // Remove the message from DOM
    const messageToRemove = document.querySelector(`[data-youtube-message-id="${messageId}"]`);
    if (messageToRemove) {
      messageToRemove.classList.add('deleted-youtube-message');
    }
    // TODO: Send delete request to YouTube API
    console.log("TODO DELETE message with ID:", messageId);
    alert(`Delete message functionality for message ID "${messageId}" will be implemented`);
  };

  const handleBanUser = (author: string) => {
    console.log('Ban user:', author);
    // TODO: Implement ban user functionality with YouTube API
    alert(`Ban user functionality for "${author}" will be implemented`);
  };

  const handleMenuStateChange = (isOpen: boolean) => {
    isYoutubeMenuOpen = isOpen;
    
    const scrollableArea = document.querySelector('[data-a-target="chat-scroller"]') as HTMLElement;
    if (scrollableArea) {
      if (isOpen) {
        // Lock the scroll position
        scrollLockPosition = scrollableArea.scrollTop;
        scrollableArea.style.overflow = 'hidden';
      } else {
        // Unlock the scroll
        scrollableArea.style.overflow = '';
        scrollLockPosition = null;
      }
    }
  };

  const chatMessageExists = chatContainer.querySelector(
    `#${youtubeMessage.messageId}`,
  );
  if (youtubeChatRepository.hasMessage(youtubeMessage.videoId, youtubeMessage.messageId) && chatMessageExists) {
    // Replace the existing element's parent (the chatLine wrapper)
    const existingChatLine = chatMessageExists.closest('.youtube-chat-message');
    if (existingChatLine) {
      renderYoutubeMessage(messageElement, youtubeMessage, handleDelete, handleBanUser, handleMenuStateChange);
      chatLine.appendChild(messageElement);
      existingChatLine.replaceWith(chatLine);
      return;
    }
  }

  // It's a new message, render and append it
  renderYoutubeMessage(messageElement, youtubeMessage, handleDelete, handleBanUser, handleMenuStateChange);
  chatLine.appendChild(messageElement);
  chatContainer.appendChild(chatLine);

  // Auto-scroll to the bottom only if chat is not paused, message is enabled, and menu is not open
  if (messageEnabled && !isYoutubeMenuOpen) {
    const chatPaused = document.querySelector('.chat-paused-footer');
    if (!chatPaused) {
      const scrollableArea = document.querySelector(
        '[data-a-target="chat-scroller"]',
      );
      if (scrollableArea) {
        scrollableArea.scrollTop = scrollableArea.scrollHeight;
      }
    }
  }
}

// Cleanup on unload
window.addEventListener("beforeunload", () => {
  observer.disconnect();
});

function isChatEnabled(videoId: string): boolean {
  return selectedYoutubeVideoSource?.videoId === videoId;
}
