import {
  YoutubeChatRepository,
  YoutubeLiveInfo,
} from "../../shared/youtubeChatRepo";
import {
  YoutubeChatMessage,
  YoutubeChatMessageData,
  YoutubeChatMessageWithTabId,
} from "../../messages/messages";
import { injectToggleButton, isYoutubeMessagesEnabled } from "./toggle-button";
import { renderYoutubeMessage } from "./YoutubeMessage";
import { YouTubeApiClient } from "../../shared/youtubeApiClient";
import "./content-twitch.css";
import { ModActions } from "./modActions";

const youtubeChatRepository = new YoutubeChatRepository();
var selectedYoutubeVideoSource: YoutubeLiveInfo | null = null;
let isYoutubeMenuOpen = false;
let scrollLockPosition: number | null = null;

const modActions= new ModActions();

// MutationObserver to watch for DOM changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {});
});

function main() {
  // Content script for Twitch.tv pages
  console.log("Twitch Multichat Integrator content script loaded");

  // Start observing
  startObservingChat();

  chrome.runtime.onMessage.addListener(onMessageReceived);

  // Inject the toggle button
  injectToggleButton(youtubeChatRepository, onYoutubeChannelSelectionChange);

  // Cleanup on unload
  window.addEventListener("beforeunload", () => {
    observer.disconnect();
  });
}

function onYoutubeChannelSelectionChange(videoId: string) {
  if (selectedYoutubeVideoSource?.videoId === videoId) {
    return; // No change
  }

  console.log("Selected YouTube channel changed to:", videoId);
  selectedYoutubeVideoSource = youtubeChatRepository.getChannelById(videoId);

  // Find all YouTube messages and show/hide based on videoId
  const allYoutubeMessages = document.querySelectorAll(".youtube-chat-message");
  allYoutubeMessages.forEach((messageElement) => {
    const messageVideoId = messageElement.getAttribute("data-youtube-video-id");

    if (messageVideoId === videoId) {
      // Show messages from the selected channel
      messageElement.classList.remove("hidden-youtube-message");
    } else {
      // Hide messages from other channels
      messageElement.classList.add("hidden-youtube-message");
    }
  });
}

function onMessageReceived(message: any) {
  
  if (message.type === "youtube-chat") {
    const parsedMessage = message as YoutubeChatMessageWithTabId;
    console.log(
      "Received broadcast from tab:",
      parsedMessage.tabId,
      parsedMessage.data,
    );
    // Store the received YouTube chat message
    youtubeChatRepository.upsertChatMessage(parsedMessage.data.videoId, parsedMessage);

    insertYoutubeMessageIntoTwitchChat(parsedMessage.data);
  } else if (message.type === "youtube-channel-name-declaration") {
    const existingChannel = youtubeChatRepository.getChannelById(
      message.data.videoId,
    );
    console.log("Received channel name declaration:", message.data.channelName);

    if (!existingChannel) {
      youtubeChatRepository.initializeChannel(
        message.data.videoId,
        message.data.channelName,
      );
    } else {
      youtubeChatRepository.handleHeartbeat(existingChannel);
    }
  } else if (message.type === "youtube-message-deleted") {
    console.log(
      "Received YouTube message deletion:",
      message.data.messageId,
    );
    handleYoutubeMessageDeleted(message.data.videoId, message.data.messageId);
  }
}

function insertYoutubeMessageIntoTwitchChat(
  youtubeMessage: YoutubeChatMessageData,
) {
  const chatContainer = document.querySelector(
    ".chat-scrollable-area__message-container",
  );
  if (!chatContainer) {
    console.warn("Twitch chat container not found");
    return;
  }

  const messageEnabled =
    isYoutubeMessagesEnabled() && isChatEnabled(youtubeMessage.videoId);
  console.log({ messageEnabled });

  // Create a wrapper that looks like a Twitch chat line
  const chatLine = document.createElement("div");
  chatLine.className =
    "chat-line__status youtube-chat-message" +
    (isChatEnabled(youtubeMessage.videoId) ? "" : " hidden-youtube-message");
  chatLine.setAttribute("data-a-target", "chat-line-message");
  chatLine.setAttribute("data-youtube-video-id", youtubeMessage.videoId);
  chatLine.setAttribute("data-youtube-message-id", youtubeMessage.messageId);

  const messageElement = document.createElement("div");
  messageElement.id = youtubeMessage.messageId;

  const chatMessageExists = chatContainer.querySelector(
    `#${youtubeMessage.messageId}`,
  );
  if (
    youtubeChatRepository.hasMessage(
      youtubeMessage.videoId,
      youtubeMessage.messageId,
    ) &&
    chatMessageExists
  ) {
    // Replace the existing element's parent (the chatLine wrapper)
    const existingChatLine = chatMessageExists.closest(".youtube-chat-message");
    if (existingChatLine) {
      renderYoutubeMessage(
        messageElement,
        youtubeMessage,
        modActions.handleDelete,
        modActions.handleTimeout,
      );
      chatLine.appendChild(messageElement);
      existingChatLine.replaceWith(chatLine);
      return;
    }
  }

  // It's a new message, render and append it
  renderYoutubeMessage(
    messageElement,
    youtubeMessage,
    modActions.handleDelete,
    modActions.handleTimeout,
  );
  chatLine.appendChild(messageElement);
  chatContainer.appendChild(chatLine);

  // Auto-scroll to the bottom only if chat is not paused and message is enabled
  if (messageEnabled) {
    const chatPaused = document.querySelector(".chat-paused-footer");
    if (!chatPaused) {
      const scrollableArea = document.querySelector(
        '[data-a-target="chat-scroller"]',
      );
      if (scrollableArea) {
        setTimeout(() => {
          scrollableArea.scrollTop = scrollableArea.scrollHeight;
        }, 10);
      }
    }
  }
}

// Start observing when chat container is available
function startObservingChat() {
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
    setTimeout(startObservingChat, 1000);
  }
}

function isChatEnabled(videoId: string): boolean {
  return selectedYoutubeVideoSource?.videoId === videoId;
}

function handleYoutubeMessageDeleted(videoId: string, messageId: string) {
  // Find the message in the Twitch chat and mark it as deleted
  const messageElement = document.querySelector(
    `[data-youtube-message-id="${messageId}"]`,
  );
  
  if (messageElement) {
    messageElement.classList.add("deleted-youtube-message");
    console.log("Marked YouTube message as deleted in Twitch chat:", messageId);
  } else {
    console.warn("Could not find YouTube message in Twitch chat to mark as deleted:", messageId);
  }
}

main();
