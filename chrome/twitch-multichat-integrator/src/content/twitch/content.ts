import { YoutubeChatRepository, YoutubeLiveInfo } from "../../background/youtubeChatRepo";
import {
  YoutubeChatMessage,
  YoutubeChatMessageData,
} from "../../messages/messages";
import { getColorForAuthor } from "./chat-colors";
import { injectToggleButton, isYoutubeMessagesEnabled } from "./toggle-button";
import "./content-twitch.css";

const youtubeChatRepository = new YoutubeChatRepository();
const youtubeMessages: YoutubeChatMessage[] = [];
var selectedYoutubeVideoSource: YoutubeLiveInfo | null = null;

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

const onYoutubeChannelSelectionChange = (videoId: string) => {
  console.log("Selected YouTube channel changed to:", videoId);
  selectedYoutubeVideoSource = youtubeChatRepository.getChannelById(videoId);
}

// Inject the toggle button
injectToggleButton(youtubeChatRepository.getChannels(), onYoutubeChannelSelectionChange);

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
      injectToggleButton(youtubeChatRepository.getChannels(), (videoId: string) => {
        console.log("Selected YouTube channel changed to:", videoId);
        selectedYoutubeVideoSource = youtubeChatRepository.getChannelById(videoId);
      });
    } else {
      youtubeChatRepository.handleHeartbeat(message.data.videoId);
    }
  }
});

function insertYoutubeMessageIntoTwitchChat(
  youtubeMessage: YoutubeChatMessageData,
) {
  const chatContainer = document.querySelector(
    ".chat-scrollable-area__message-container",
  );
  if (!chatContainer) return;

  const usernameColor = getColorForAuthor(youtubeMessage.author);

  // Create a wrapper that looks like a Twitch chat line
  const chatLine = document.createElement("div");
  chatLine.className =
    "chat-line__status youtube-chat-message" +
    (isYoutubeMessagesEnabled() ? "" : " hidden-youtube-message");
  chatLine.setAttribute("data-a-target", "chat-line-message");

  const messageElement = document.createElement("div");
  messageElement.id = youtubeMessage.messageId;
  messageElement.className = "chat-line__message";
  messageElement.setAttribute("data-a-target", "chat-line-message-body");
  messageElement.innerHTML = `
    <span style="border-radius:4px;border-width:1px;background-color:#fc1037;color:white;padding:2px;font-size:12px;">YouTube</span>
    <span style="color:${usernameColor};font-weight:bold;">${youtubeMessage.author}:</span>
    <span class="youtube-chat-message-content">${youtubeMessage.contentHtml ?? youtubeMessage.content}</span>
  `;

  const chatMessageExists = chatContainer.querySelector(
    `#${youtubeMessage.messageId}`,
  );
  if (youtubeChatRepository.hasMessage(youtubeMessage.videoId, youtubeMessage.messageId) && chatMessageExists) {
    // Replace the existing element
    chatMessageExists.replaceWith(messageElement);
    return;
  }

  // It's a new message, append it
  chatLine.appendChild(messageElement);
  chatContainer.appendChild(chatLine);

  // Auto-scroll to the bottom
  const scrollableArea = document.querySelector(
    '[data-a-target="chat-scroller"]',
  );
  if (scrollableArea) {
    scrollableArea.scrollTop = scrollableArea.scrollHeight;
  }
}

// Cleanup on unload
window.addEventListener("beforeunload", () => {
  observer.disconnect();
});
