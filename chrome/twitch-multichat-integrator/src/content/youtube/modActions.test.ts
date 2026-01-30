import * as fs from 'fs';
import * as path from 'path';

// Mock chrome API before importing the module
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn()
    }
  }
} as any;

import { clickYoutubeDeleteButton } from './modActions';

const testMenuButtonMessageId = 'ChwKGkNMYnRocjZoc3BJREZUTFB3Z1Fkc044ckR3';

describe('YouTube modActions', () => {
  beforeEach(() => {
    // Load the HTML fixture
    const html = fs.readFileSync(
      path.resolve(__dirname, '../../../domExamples/youtube-message-menu-open-non-mod.html'),
      'utf8'
    );
    document.documentElement.innerHTML = html;

    // Mock setTimeout to execute immediately for testing
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('clickYoutubeDeleteButton', () => {
    it('should find and click the Remove menu button for a message by id', () => {
      // Create a mock message element with the expected structure
      
      // Find the existing test button by id
      const messageElement = document.getElementById(testMenuButtonMessageId);
      expect(messageElement).not.toBeNull();

      const menuOpenButton = messageElement!.querySelector('yt-icon-button#menu-button');
      expect(menuOpenButton).not.toBeNull();    

      // Track if button was clicked
      let menuButtonClicked = false;
      menuOpenButton!.addEventListener('click', () => {
        menuButtonClicked = true;
        console.log('Menu button clicked');
      });
      
      // Find the Remove menu item and track if it gets clicked
      const deleteMenuItem = Array.from(
        document.querySelectorAll('ytd-menu-service-item-renderer')
      ).find(item => 
        item.querySelector('yt-formatted-string')?.textContent?.trim() === 'Remove'
      );
      expect(deleteMenuItem).not.toBeNull();

      const deleteButton = deleteMenuItem!.querySelector('tp-yt-paper-item');
      expect(deleteButton).not.toBeNull();

      let deleteButtonClicked = false;
      deleteButton!.addEventListener('click', () => {
        deleteButtonClicked = true;
        console.log('Remove button clicked');
      });
      
      // Call the function
      const result = clickYoutubeDeleteButton(testMenuButtonMessageId);

      // Assert that the function initiated the process
      expect(result).toBe(true);
      expect(menuButtonClicked).toBe(true);

      // Advance timers by at least 200ms to trigger the delete button click
      jest.advanceTimersByTime(300);

      // Verify the delete button was clicked
      expect(deleteButtonClicked).toBe(true);
    });

    it('should return false if message element is not found', () => {
      const result = clickYoutubeDeleteButton('non-existent-message');
      expect(result).toBe(false);
    });

    it('should return false if menu button is not found in message', () => {
      const messageId = 'message-without-menu';
      const mockMessage = document.createElement('div');
      mockMessage.id = messageId;
      document.body.appendChild(mockMessage);

      const result = clickYoutubeDeleteButton(messageId);
      expect(result).toBe(false);
    });
  });
});
