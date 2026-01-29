/**
 * Opens the context menu for a YouTube chat message
 * @param messageId The ID of the message element
 * @returns The menu button element if found, null otherwise
 */
function openMessageMenu(messageId: string): HTMLButtonElement | null {
  const messageElement = document.querySelector(`#${messageId}`) as HTMLElement;
  if (!messageElement) {
    console.error('Message element not found:', messageId);
    return null;
  }

  const menuButton = messageElement.querySelector('#menu-button #button') as HTMLButtonElement;
  if (!menuButton) {
    console.error('Menu button not found for message:', messageId);
    return null;
  }

  console.log('Clicking menu button for message:', messageId);
  menuButton.click();
  return menuButton;
}

/**
 * Finds and clicks a menu item by its text label
 * @param menuItemText The text of the menu item to find (e.g., "Remove", "Report", "Block")
 * @returns True if the item was found and clicked, false otherwise
 */
function clickMenuItem(menuItemText: string): boolean {
  const menuItems = document.querySelectorAll(
    'tp-yt-iron-dropdown ytd-menu-service-item-renderer, ' +
    'tp-yt-iron-dropdown ytd-menu-navigation-item-renderer'
  );
  
  let targetItem: Element | null = null;
  for (let i = 0; i < menuItems.length; i++) {
    const item = menuItems.item(i);
    const text = item.querySelector('yt-formatted-string')?.textContent?.trim();
    if (text === menuItemText) {
      targetItem = item;
      break;
    }
  }

  if (!targetItem) {
    console.error(`Menu item "${menuItemText}" not found`);
    return false;
  }

  console.log(`Clicking menu item: ${menuItemText}`);
  const paperItem = targetItem.querySelector('tp-yt-paper-item') as HTMLElement;
  if (paperItem) {
    paperItem.click();
  } else {
    (targetItem as HTMLElement).click();
  }
  
  return true;
}

/**
 * Closes the YouTube context menu
 */
function closeMenu(): void {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
}

/**
 * Clicks the confirmation button in a YouTube dialog
 * @returns True if a confirm button was found and clicked, false otherwise
 */
function clickConfirmDialog(): boolean {
  const confirmButton = document.querySelector(
    'yt-confirm-dialog-renderer [aria-label*="Remove"], ' +
    'yt-confirm-dialog-renderer #confirm-button button'
  ) as HTMLButtonElement;
  
  if (confirmButton) {
    console.log('Confirming dialog');
    confirmButton.click();
    return true;
  }
  
  return false;
}

export function clickYoutubeDeleteButton(messageId: string): boolean {
  try {
    console.log('Attempting to delete YouTube message:', messageId);
    
    const menuButton = openMessageMenu(messageId);
    if (!menuButton) {
      return false;
    }

    // Wait for the menu to appear, then find and click the remove button
    setTimeout(() => {
      if (clickMenuItem('Remove')) {
        // Check for confirmation dialog
        setTimeout(() => {
          clickConfirmDialog();
        }, 100);
      } else {
        closeMenu();
      }
    }, 200);

    return true;
  } catch (error) {
    console.error('Error clicking delete button:', error);
    return false;
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'youtube-click-delete') {
    const success = clickYoutubeDeleteButton(message.messageId);
    sendResponse({ success });
  }
  return true; // Keep channel open for async response
});