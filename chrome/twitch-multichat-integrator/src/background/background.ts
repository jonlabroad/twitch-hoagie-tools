// Background service worker for Chrome extension
console.log('Background service worker started');

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message, 'from tab:', sender.tab?.id);

  // Handle different message types
  if (message.type === 'youtube-chat') {
    // Broadcast to all tabs
    chrome.tabs.query({ url: 'https://www.twitch.tv/*' }, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id && tab.id !== sender.tab?.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'youtube-chat-message',
            data: message.data,
            sourceTabId: sender.tab?.id,
          });
        }
      });
    });

    sendResponse({ success: true });
  } else if (message.type === 'youtube-channel-name-declaration') {
    console.log('Channel name declared:', message.data.channelName, 'for video ID:', message.data.videoId);
    sendResponse({ success: true });
  }

  return true; // Keep message channel open for async response
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('twitch.tv')) {
    console.log('Twitch tab loaded:', tabId, tab.url);
  }
});
