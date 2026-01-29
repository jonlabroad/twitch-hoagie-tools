import { YoutubeChatMessageWithTabId } from "../messages/messages";

// Background service worker for Chrome extension
console.log('Background service worker started');

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message, 'from tab:', sender.tab?.id);

  // Handle different message types
  if (message.type === 'youtube-chat') {
    // Broadcast to all tabs
    broadcastToAllTwitchTabs({
      type: 'youtube-chat',
      data: message.data,
      tabId: sender.tab?.id,
    } as YoutubeChatMessageWithTabId);

    sendResponse({ success: true });
  } else if (message.type === 'youtube-channel-name-declaration') {
    console.log('Channel name declared:', message.data.channelName, 'for video ID:', message.data.videoId);
    broadcastToAllTwitchTabs({
      type: 'youtube-channel-name-declaration',
      data: message.data,
      tabId: sender.tab?.id,
    });
    sendResponse({ success: true });
  } else if (message.type === 'youtube-message-deleted') {
    console.log('Message deleted:', message.data.messageId, 'from video ID:', message.data.videoId);
    broadcastToAllTwitchTabs({
      type: 'youtube-message-deleted',
      data: message.data,
      tabId: sender.tab?.id,
    });
    sendResponse({ success: true });
  } else if (message.type === 'youtube-click-delete') {
    // Forward delete request to YouTube tab
    chrome.tabs.query({ url: '*://www.youtube.com/live_chat*' }, (tabs) => {
      if (tabs.length > 0 && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'youtube-click-delete',
          messageId: message.messageId
        }, (response) => {
          sendResponse(response || { success: false, error: 'No response from YouTube tab' });
        });
      } else {
        sendResponse({ success: false, error: 'YouTube tab not found' });
      }
    });
    return true; // Keep channel open for async response
  }

  return true; // Keep message channel open for async response
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('twitch.tv')) {
    console.log('Twitch tab loaded:', tabId, tab.url);
  }
});

function broadcastToAllTwitchTabs(message: any) {
  chrome.tabs.query({ url: 'https://www.twitch.tv/*' }, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, message);
      }
    });
  });
}