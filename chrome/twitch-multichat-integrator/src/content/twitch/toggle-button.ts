let youtubeMessagesEnabled = true;
let flyoutMenu: HTMLElement | null = null;

export function injectToggleButton() {
  const buttonContainer = document.querySelector(
    '[data-test-selector="chat-input-buttons-container"]',
  );

  console.log("Button container:", buttonContainer);
  if (buttonContainer && !document.getElementById("youtube-toggle-btn")) {
    // Create split button container
    const splitButtonContainer = document.createElement("div");
    splitButtonContainer.id = "youtube-toggle-btn";
    splitButtonContainer.className = "youtube-split-button-container";
    splitButtonContainer.style.cssText = `
      display: inline-flex;
      position: relative;
    `;

    // Main toggle button
    const toggleButton = document.createElement("button");
    toggleButton.className = "youtube-toggle-button youtube-toggle-button-main";
    toggleButton.textContent = "YT";
    toggleButton.title = "Toggle YouTube messages";
    toggleButton.setAttribute("aria-label", "Toggle YouTube messages");
    toggleButton.style.cssText = `
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-right: 1px solid rgba(255, 255, 255, 0.2);
    `;

    toggleButton.onclick = () => {
      youtubeMessagesEnabled = !youtubeMessagesEnabled;
      toggleButton.classList.toggle("disabled", !youtubeMessagesEnabled);
      document.body.classList.toggle(
        "hide-youtube-messages",
        !youtubeMessagesEnabled,
      );
      console.log(
        "YouTube messages:",
        youtubeMessagesEnabled ? "enabled" : "disabled",
      );
    };

    // Dropdown button
    const dropdownButton = document.createElement("button");
    dropdownButton.className = "youtube-toggle-button youtube-toggle-button-dropdown";
    dropdownButton.innerHTML = "▼";
    dropdownButton.title = "YouTube message options";
    dropdownButton.setAttribute("aria-label", "YouTube message options");
    dropdownButton.style.cssText = `
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      padding: 4px 6px;
      font-size: 10px;
    `;

    dropdownButton.onclick = (e) => {
      e.stopPropagation();
      toggleFlyoutMenu(splitButtonContainer);
    };

    // Assemble split button
    splitButtonContainer.appendChild(toggleButton);
    splitButtonContainer.appendChild(dropdownButton);

    // Insert after the first child
    if (buttonContainer.firstChild?.nextSibling) {
      buttonContainer.insertBefore(
        splitButtonContainer,
        buttonContainer.firstChild.nextSibling,
      );
    } else {
      buttonContainer.appendChild(splitButtonContainer);
    }
    
    // Close menu when clicking elsewhere
    document.addEventListener("click", (e) => {
      if (flyoutMenu && !splitButtonContainer.contains(e.target as Node)) {
        closeFlyoutMenu();
      }
    });

    console.log("Split toggle button injected");
  } else if (!buttonContainer) {
    // Retry if container not found yet
    setTimeout(injectToggleButton, 1000);
  }
}

function toggleFlyoutMenu(container: HTMLElement) {
  if (flyoutMenu && flyoutMenu.parentElement) {
    closeFlyoutMenu();
  } else {
    openFlyoutMenu(container);
  }
}

function openFlyoutMenu(container: HTMLElement) {
  flyoutMenu = document.createElement("div");
  flyoutMenu.className = "youtube-flyout-menu";
  flyoutMenu.style.cssText = `
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    background: #18181b;
    border: 1px solid #464649;
    border-radius: 6px;
    padding: 4px;
    min-width: 200px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  `;

  // Add menu items (placeholder for now)
  const menuItem1 = createMenuItem("Select YouTube Channel", () => {
    console.log("Select YouTube Channel clicked");
    closeFlyoutMenu();
  });

  const menuItem2 = createMenuItem("Settings", () => {
    console.log("Settings clicked");
    closeFlyoutMenu();
  });

  flyoutMenu.appendChild(menuItem1);
  flyoutMenu.appendChild(menuItem2);
  
  container.appendChild(flyoutMenu);
}

function closeFlyoutMenu() {
  if (flyoutMenu && flyoutMenu.parentElement) {
    flyoutMenu.parentElement.removeChild(flyoutMenu);
    flyoutMenu = null;
  }
}

function createMenuItem(text: string, onClick: () => void): HTMLElement {
  const menuItem = document.createElement("button");
  menuItem.className = "youtube-menu-item";
  menuItem.textContent = text;
  menuItem.style.cssText = `
    display: block;
    width: 100%;
    padding: 8px 12px;
    background: transparent;
    border: none;
    color: #efeff1;
    text-align: left;
    cursor: pointer;
    border-radius: 4px;
    font-size: 13px;
    transition: background-color 0.1s ease;
  `;

  menuItem.onmouseenter = () => {
    menuItem.style.backgroundColor = "#464649";
  };

  menuItem.onmouseleave = () => {
    menuItem.style.backgroundColor = "transparent";
  };

  menuItem.onclick = onClick;

  return menuItem;
}

export function isYoutubeMessagesEnabled(): boolean {
  return youtubeMessagesEnabled;
}
