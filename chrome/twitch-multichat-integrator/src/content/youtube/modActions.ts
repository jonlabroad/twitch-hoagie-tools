/**
 * Opens the context menu for a YouTube chat message
 * @param messageId The ID of the message element
 * @returns The message element if found, null otherwise
 */
function openMessageMenu(messageId: string): HTMLElement | null {
  const messageElement = document.querySelector(`#${messageId}`) as HTMLElement;
  if (!messageElement) {
    console.error("Message element not found:", messageId);
    return null;
  }

  const menuButton = messageElement.querySelector(
    "#menu-button #button",
  ) as HTMLButtonElement;
  if (!menuButton) {
    console.error("Menu button not found for message:", messageId);
    return null;
  }

  console.log("Clicking menu button for message:", messageId);
  menuButton.click();
  return messageElement;
}

/**
 * Finds and clicks a menu item by its text label
 * Note: Menu is rendered elsewhere in the DOM (not as a child of the message)
 * @param menuItemText The text of the menu item to find (e.g., "Remove", "Report", "Block")
 * @returns True if the item was found and clicked, false otherwise
 */
function clickMenuItem(menuItemText: string): boolean {
  const menuItems = document.querySelectorAll(
    "ytd-menu-service-item-renderer, ytd-menu-navigation-item-renderer",
  );

  let targetItem: Element | null = null;
  for (let i = 0; i < menuItems.length; i++) {
    const item = menuItems.item(i);
    const text = item.querySelector("yt-formatted-string")?.textContent?.trim();
    if (text === menuItemText) {
      targetItem = item;
      break;
    }
  }

  if (!targetItem) {
    console.error(`Menu item "${menuItemText}" not found`);
    return false;
  }

  // Safety check: ensure the menu item is visible
  const targetElement = targetItem as HTMLElement;
  const isVisible = window.getComputedStyle(targetElement).visibility !== 'hidden' &&
                    window.getComputedStyle(targetElement).display !== 'none';
  
  if (!isVisible) {
    console.error(`Menu item "${menuItemText}" found but not visible`);
    return false;
  }

  console.log(`Clicking menu item: ${menuItemText}`);
  const paperItem = targetItem.querySelector("tp-yt-paper-item") as HTMLElement;
  const elementToClick = paperItem || targetElement;
   
  elementToClick.click();

  return true;
}

/**
 * Closes the YouTube context menu
 */
function closeMenu(): void {
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
}

/**
 * Clicks the confirmation button in a YouTube dialog
 * @returns True if a confirm button was found and clicked, false otherwise
 */
function clickConfirmDialog(): boolean {
  const confirmButton = document.querySelector(
    'yt-confirm-dialog-renderer [aria-label*="Remove"], ' +
      "yt-confirm-dialog-renderer #confirm-button button",
  ) as HTMLButtonElement;

  if (confirmButton) {
    console.log("Confirming dialog");
    confirmButton.click();
    return true;
  }

  return false;
}

/**
 * Clicks the confirmation button in a YouTube action dialog (e.g., timeout dialog)
 * @returns True if a confirm button was found and clicked, false otherwise
 */
function clickActionDialogConfirm(): boolean {
  const confirmButton = document.querySelector(
    'yt-show-action-dialog-renderer [aria-label="Confirm"]',
  ) as HTMLButtonElement;

  if (confirmButton) {
    console.log("Confirming action dialog");
    confirmButton.click();
    return true;
  }

  return false;
}

/**
 * Selects a duration option in the YouTube timeout dialog
 * @param duration The duration string (e.g., "10 seconds", "5 minutes", "24 hours")
 * @returns True if the duration was selected, false otherwise
 */
function selectTimeoutDuration(duration: string): boolean {
  // Map duration strings to their radio button names
  const durationMap: { [key: string]: string } = {
    "10 seconds": "0",
    "1 minute": "1",
    "5 minutes": "2",
    "10 minutes": "3",
    "30 minutes": "4",
    "24 hours": "5",
  };

  const radioName = durationMap[duration];
  if (!radioName) {
    console.error(`Invalid duration: ${duration}`);
    return false;
  }

  const radioButton = document.querySelector(
    `tp-yt-paper-radio-button[name="${radioName}"]`,
  ) as HTMLElement;

  if (!radioButton) {
    console.error(`Radio button not found for duration: ${duration}`);
    return false;
  }

  console.log(`Selecting timeout duration: ${duration}`);
  radioButton.click();
  return true;
}

export function clickYoutubeDeleteButton(messageId: string): boolean {
  try {
    console.log("Attempting to delete YouTube message:", messageId);

    const messageElement = openMessageMenu(messageId);
    if (!messageElement) {
      return false;
    }

    // Wait for the menu to appear, then find and click the remove button
    setTimeout(() => {
      if (clickMenuItem("Remove")) {
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
    console.error("Error clicking delete button:", error);
    return false;
  }
}

/**
 * Times out a user in YouTube chat
 * @param messageId The ID of the message element
 * @param duration The duration string (e.g., "10 seconds", "5 minutes", "24 hours")
 * @returns True if the timeout was initiated successfully, false otherwise
 */
export function clickYoutubeTimeoutButton(messageId: string, duration: string): boolean {
  try {
    console.log(`Attempting to timeout YouTube user for message ${messageId} with duration: ${duration}`);

    const messageElement = openMessageMenu(messageId);
    if (!messageElement) {
      return false;
    }

    // Wait for the menu to appear, then find and click "Put user in timeout"
    setTimeout(() => {
      if (clickMenuItem("Put user in timeout")) {
        // Wait for the timeout dialog to appear
        setTimeout(() => {
          if (selectTimeoutDuration(duration)) {
            // Wait a bit for the selection to register, then click confirm
            setTimeout(() => {
              clickActionDialogConfirm();
            }, 100);
          }
        }, 300);
      } else {
        closeMenu();
      }
    }, 200);

    return true;
  } catch (error) {
    console.error("Error timing out user:", error);
    return false;
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "youtube-delete-message-command") {
    const success = clickYoutubeDeleteButton(message.messageId);
    sendResponse({ success });
  } else if (message.type === "youtube-timeout-user-command") {
    const success = clickYoutubeTimeoutButton(message.messageId, message.duration);
    sendResponse({ success });
  }
  return true; // Keep channel open for async response
});
