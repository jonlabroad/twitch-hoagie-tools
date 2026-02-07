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

import { clickYoutubeDeleteButton, clickYoutubeTimeoutButton } from './modActions';

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
      jest.advanceTimersByTime(500);

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

  describe('clickYoutubeTimeoutButton', () => {
    beforeEach(() => {
      // Load the HTML fixture with timeout menu
      const html = fs.readFileSync(
        path.resolve(__dirname, '../../../domExamples/youtube-message-timeout-menu-open-mod.html'),
        'utf8'
      );
      document.documentElement.innerHTML = html;
    });

    it('should find and click the timeout menu button for a message by id with duration', () => {
      // Use a message ID from the timeout fixture
      const messageId = 'ChwKGkNPZUpnNXlRdDVJREZWWGFsQWtkcWY4UWdR';
      const duration = '5 minutes';
      
      const messageElement = document.getElementById(messageId);
      expect(messageElement).not.toBeNull();

      const menuOpenButton = messageElement!.querySelector('yt-icon-button#menu-button');
      expect(menuOpenButton).not.toBeNull();    

      // Track if button was clicked
      let menuButtonClicked = false;
      menuOpenButton!.addEventListener('click', () => {
        menuButtonClicked = true;
        console.log('Menu button clicked');
      });
      
      // Find the "Put user in timeout" menu item
      const timeoutMenuItem = Array.from(
        document.querySelectorAll('ytd-menu-service-item-renderer')
      ).find(item => 
        item.querySelector('yt-formatted-string')?.textContent?.trim() === 'Put user in timeout'
      );
      expect(timeoutMenuItem).not.toBeNull();

      const timeoutButton = timeoutMenuItem!.querySelector('tp-yt-paper-item');
      expect(timeoutButton).not.toBeNull();

      let timeoutButtonClicked = false;
      timeoutButton!.addEventListener('click', () => {
        timeoutButtonClicked = true;
        console.log('Timeout button clicked');
      });

      // Find the radio button for 5 minutes (name="2")
      const radioButton = document.querySelector('tp-yt-paper-radio-button[name="2"]');
      expect(radioButton).not.toBeNull();

      let radioButtonClicked = false;
      radioButton!.addEventListener('click', () => {
        radioButtonClicked = true;
        console.log('Radio button clicked');
      });

      // Find the confirm button
      const confirmButton = document.querySelector(
        'yt-show-action-dialog-renderer [aria-label="Confirm"]'
      );
      expect(confirmButton).not.toBeNull();

      let confirmButtonClicked = false;
      confirmButton!.addEventListener('click', () => {
        confirmButtonClicked = true;
        console.log('Confirm button clicked');
      });
      
      // Call the function
      const result = clickYoutubeTimeoutButton(messageId, duration);

      // Assert that the function initiated the process
      expect(result).toBe(true);
      expect(menuButtonClicked).toBe(true);

      // Advance timers to trigger the timeout button click
      jest.advanceTimersByTime(200);
      expect(timeoutButtonClicked).toBe(true);

      // Advance timers to trigger the radio button click
      jest.advanceTimersByTime(300);
      expect(radioButtonClicked).toBe(true);

      // Advance timers to trigger the confirm button click
      jest.advanceTimersByTime(100);
      expect(confirmButtonClicked).toBe(true);
    });

    it('should return false if message element is not found', () => {
      const result = clickYoutubeTimeoutButton('non-existent-message', '5 minutes');
      expect(result).toBe(false);
    });

    it('should return false if menu button is not found in message', () => {
      const messageId = 'message-without-menu';
      const mockMessage = document.createElement('div');
      mockMessage.id = messageId;
      document.body.appendChild(mockMessage);

      const result = clickYoutubeTimeoutButton(messageId, '5 minutes');
      expect(result).toBe(false);
    });

    it('should handle all valid duration options', () => {
      const messageId = 'ChwKGkNPZUpnNXlRdDVJREZWWGFsQWtkcWY4UWdR';
      const validDurations = [
        '10 seconds',
        '1 minute',
        '5 minutes',
        '10 minutes',
        '30 minutes',
        '24 hours'
      ];

      validDurations.forEach(duration => {
        jest.clearAllTimers();
        // Reload the HTML for each test
        const html = fs.readFileSync(
          path.resolve(__dirname, '../../../domExamples/youtube-message-timeout-menu-open-mod.html'),
          'utf8'
        );
        document.documentElement.innerHTML = html;

        const result = clickYoutubeTimeoutButton(messageId, duration);
        expect(result).toBe(true);
      });
    });
  });
});
