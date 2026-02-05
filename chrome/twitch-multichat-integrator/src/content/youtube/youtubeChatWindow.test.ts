import * as fs from 'fs';
import * as path from 'path';

// Mock chrome API and timers before importing
const mockSendMessage = jest.fn();
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn()
    },
    sendMessage: mockSendMessage
  }
} as any;

// Mock window.top to simulate iframe
Object.defineProperty(window, 'top', {
  writable: true,
  value: {
    location: {
      href: 'https://www.youtube.com/watch?v=test-video-id'
    }
  }
});

describe('YouTube Chat Window Observer', () => {
  let chatContainer: HTMLElement;
  let observer: MutationObserver | null = null;
  
  beforeEach(() => {
    // Load the HTML fixture
    const html = fs.readFileSync(
      path.resolve(__dirname, '../../../domExamples/youtube-message-menu-open-non-mod.html'),
      'utf8'
    );
    document.documentElement.innerHTML = html;

    // Find or create the chat container
    chatContainer = document.querySelector('.yt-live-chat-item-list-renderer #items') as HTMLElement;
    if (!chatContainer) {
      // Create a mock chat container if not found in fixture
      chatContainer = document.createElement('div');
      chatContainer.id = 'items';
      chatContainer.className = 'yt-live-chat-item-list-renderer';
      document.body.appendChild(chatContainer);
    }

    // Clear all mock calls
    mockSendMessage.mockClear();
  });

  afterEach(() => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  });

  describe('Message Detection', () => {
    it('should detect when a new YouTube chat message is added', (done) => {
      // Set up the observer
      observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
              if (node instanceof HTMLElement) {
                if (node.tagName === 'YT-LIVE-CHAT-TEXT-MESSAGE-RENDERER') {
                  // Verify message structure
                  expect(node.id).toBeTruthy();
                  expect(node.querySelector('#author-name')).toBeTruthy();
                  expect(node.querySelector('#message')).toBeTruthy();
                  expect(node.querySelector('#timestamp')).toBeTruthy();
                  done();
                }
              }
            });
          }
        });
      });

      observer.observe(chatContainer, {
        childList: true,
        subtree: true,
      });

      // Create and add a mock message element
      const messageElement = document.createElement('yt-live-chat-text-message-renderer');
      messageElement.id = 'test-message-123';
      
      const authorName = document.createElement('span');
      authorName.id = 'author-name';
      authorName.textContent = 'TestUser';
      messageElement.appendChild(authorName);

      const message = document.createElement('span');
      message.id = 'message';
      message.textContent = 'Test message content';
      messageElement.appendChild(message);

      const timestamp = document.createElement('span');
      timestamp.id = 'timestamp';
      timestamp.textContent = '12:34 PM';
      messageElement.appendChild(timestamp);

      // Add the message to the chat container
      chatContainer.appendChild(messageElement);
    });

    it('should extract message data correctly from YouTube chat messages', () => {
      // Create a message element with full structure
      const messageElement = document.createElement('yt-live-chat-text-message-renderer');
      messageElement.id = 'ChwKGkNMYnRocjZoc3BJREZUTFB3Z1Fkc044ckR3';
      
      const authorName = document.createElement('span');
      authorName.id = 'author-name';
      authorName.textContent = 'CoolViewer123';
      messageElement.appendChild(authorName);

      const messageContainer = document.createElement('span');
      messageContainer.id = 'message';
      messageContainer.textContent = 'Hello everyone!';
      messageContainer.innerHTML = 'Hello everyone!';
      messageElement.appendChild(messageContainer);

      const timestamp = document.createElement('span');
      timestamp.id = 'timestamp';
      timestamp.textContent = '6:23 PM';
      messageElement.appendChild(timestamp);

      // Verify we can extract all necessary data
      expect(messageElement.id).toBe('ChwKGkNMYnRocjZoc3BJREZUTFB3Z1Fkc044ckR3');
      expect(messageElement.querySelector('#author-name')?.textContent).toBe('CoolViewer123');
      expect(messageElement.querySelector('#message')?.textContent).toBe('Hello everyone!');
      expect(messageElement.querySelector('#timestamp')?.textContent).toBe('6:23 PM');
    });

    it('should detect multiple messages added at once', (done) => {
      let messagesDetected = 0;
      const expectedMessages = 3;

      observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node instanceof HTMLElement && node.tagName === 'YT-LIVE-CHAT-TEXT-MESSAGE-RENDERER') {
                messagesDetected++;
                if (messagesDetected === expectedMessages) {
                  done();
                }
              }
            });
          }
        });
      });

      observer.observe(chatContainer, {
        childList: true,
        subtree: true,
      });

      // Add multiple messages
      for (let i = 0; i < expectedMessages; i++) {
        const messageElement = document.createElement('yt-live-chat-text-message-renderer');
        messageElement.id = `test-message-${i}`;
        
        const authorName = document.createElement('span');
        authorName.id = 'author-name';
        authorName.textContent = `User${i}`;
        messageElement.appendChild(authorName);

        const message = document.createElement('span');
        message.id = 'message';
        message.textContent = `Message ${i}`;
        messageElement.appendChild(message);

        const timestamp = document.createElement('span');
        timestamp.id = 'timestamp';
        timestamp.textContent = `12:3${i} PM`;
        messageElement.appendChild(timestamp);

        chatContainer.appendChild(messageElement);
      }
    });
  });

  describe('Message Deletion Detection', () => {
    it('should detect when a message is removed from the DOM', (done) => {
      const messageElement = document.createElement('yt-live-chat-text-message-renderer');
      messageElement.id = 'message-to-delete';
      chatContainer.appendChild(messageElement);

      observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
            mutation.removedNodes.forEach((node) => {
              if (node instanceof HTMLElement && node.tagName === 'YT-LIVE-CHAT-TEXT-MESSAGE-RENDERER') {
                expect(node.id).toBe('message-to-delete');
                done();
              }
            });
          }
        });
      });

      observer.observe(chatContainer, {
        childList: true,
        subtree: true,
      });

      // Remove the message
      messageElement.remove();
    });

    it('should detect when is-deleted attribute is added to a message', (done) => {
      const messageElement = document.createElement('yt-live-chat-text-message-renderer');
      messageElement.id = 'message-marked-deleted';
      chatContainer.appendChild(messageElement);

      observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'is-deleted') {
            const target = mutation.target as HTMLElement;
            if (target.tagName === 'YT-LIVE-CHAT-TEXT-MESSAGE-RENDERER') {
              expect(target.hasAttribute('is-deleted')).toBe(true);
              expect(target.id).toBe('message-marked-deleted');
              done();
            }
          }
        });
      });

      observer.observe(chatContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['is-deleted', 'class'],
      });

      // Mark message as deleted
      messageElement.setAttribute('is-deleted', '');
    });
  });

  describe('Nested Message Detection', () => {
    it('should detect messages added within nested containers', (done) => {
      observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node instanceof HTMLElement) {
                // Check if the node contains chat messages
                const chatMessages = node.querySelectorAll('yt-live-chat-text-message-renderer');
                if (chatMessages.length > 0) {
                  chatMessages.forEach((msgNode) => {
                    if (msgNode instanceof HTMLElement) {
                      expect(msgNode.id).toBe('nested-message-123');
                      done();
                    }
                  });
                }
              }
            });
          }
        });
      });

      observer.observe(chatContainer, {
        childList: true,
        subtree: true,
      });

      // Create a wrapper div that contains the message
      const wrapperDiv = document.createElement('div');
      const messageElement = document.createElement('yt-live-chat-text-message-renderer');
      messageElement.id = 'nested-message-123';
      wrapperDiv.appendChild(messageElement);
      
      // Add the wrapper to the chat container
      chatContainer.appendChild(wrapperDiv);
    });
  });

  describe('Message Structure from Fixture', () => {
    it('should find existing messages in the loaded fixture', () => {
      const existingMessages = document.querySelectorAll('yt-live-chat-text-message-renderer');
      
      // The fixture should contain at least one message
      expect(existingMessages.length).toBeGreaterThan(0);
      
      // Verify the structure of an existing message
      const firstMessage = existingMessages[0] as HTMLElement;
      expect(firstMessage.id).toBeTruthy();
      
      // Check for expected child elements
      const authorName = firstMessage.querySelector('#author-name');
      const message = firstMessage.querySelector('#message');
      const timestamp = firstMessage.querySelector('#timestamp');
      
      // At least message content should exist
      expect(message).toBeTruthy();
    });

    it('should process the test message from the fixture', () => {
      const testMessageId = 'ChwKGkNKaklvOHVhc3BJREZZT1c1UWNkX0VvU193';
      const messageElement = document.getElementById(testMessageId);
      
      expect(messageElement).not.toBeNull();
      expect(messageElement?.tagName).toBe('YT-LIVE-CHAT-TEXT-MESSAGE-RENDERER');
      
      // Verify message content structure
      const authorName = messageElement?.querySelector('#author-name');
      const message = messageElement?.querySelector('#message');
      const timestamp = messageElement?.querySelector('#timestamp');
      
      expect(authorName?.textContent).toContain('TheBurntPeanut');
      expect(message).toBeTruthy();
      // Use regex to handle potential non-breaking spaces or other whitespace variations
      expect(timestamp?.textContent?.replace(/\s/g, ' ')).toBe('6:23 PM');
    });
  });
});
