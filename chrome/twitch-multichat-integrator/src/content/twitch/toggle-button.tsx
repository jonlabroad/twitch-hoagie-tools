import React, { useState, useEffect } from "react";
import { createRoot, Root } from "react-dom/client";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import "./toggle-button.css";
import { YoutubeLiveInfo } from "../../background/youtubeChatRepo";

let youtubeMessagesEnabled = true;
let rootInstance: Root | null = null;

interface IProps {
  liveInfo: YoutubeLiveInfo[];
  onChannelSelectionChange: (videoId: string) => void;
}

const YoutubeSplitButton: React.FC<IProps> = (props: IProps) => {
  const [enabled, setEnabled] = useState(youtubeMessagesEnabled);
  const [menuOpen, setMenuOpen] = useState(false);

    console.log({ props });

  useEffect(() => {
    youtubeMessagesEnabled = enabled;
    document.body.classList.toggle("hide-youtube-messages", !enabled);
  }, [enabled]);

  const handleToggle = () => {
    setEnabled(!enabled);
    console.log("YouTube messages:", !enabled ? "enabled" : "disabled");
  };

  return (
    <div
      className="youtube-split-button-container"
      style={{
        display: "inline-flex",
        position: "relative",
        alignItems: "center",
      }}
    >
      <button
        className={`youtube-toggle-button youtube-toggle-button-main ${!enabled ? "disabled" : ""}`}
        onClick={handleToggle}
        title="Toggle YouTube messages"
        aria-label="Toggle YouTube messages"
      >
        YT
      </button>

      <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenu.Trigger asChild>
          <button
            className="youtube-toggle-button youtube-toggle-button-dropdown"
            title="YouTube message options"
            aria-label="YouTube message options"
          >
            ▲
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content className="youtube-dropdown-content">
            {props.liveInfo.filter(info => !info.idle).map((info) => (
              <DropdownMenu.Item
                key={info.videoId}
                className="youtube-dropdown-item"
                onSelect={() =>
                  props.onChannelSelectionChange(info.videoId)
                }
              >
                {info.channelName}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
};

export function injectToggleButton(liveInfo: YoutubeLiveInfo[], onChannelSelectionChange: (videoId: string) => void) {
  const buttonContainer = document.querySelector(
    '[data-test-selector="chat-input-buttons-container"]',
  );

  console.log("Button container:", buttonContainer);
  const buttonAlreadyExists = document.getElementById("youtube-toggle-btn");
  if (buttonContainer && !buttonAlreadyExists) {
    const mountPoint = document.createElement("div");
    mountPoint.id = "youtube-toggle-btn";

    if (buttonContainer.firstChild?.nextSibling) {
      buttonContainer.insertBefore(
        mountPoint,
        buttonContainer.firstChild.nextSibling,
      );
    } else {
      buttonContainer.appendChild(mountPoint);
    }

    rootInstance = createRoot(mountPoint);
    console.log({ liveInfo });
    rootInstance.render(<YoutubeSplitButton
        liveInfo={liveInfo}
        onChannelSelectionChange={onChannelSelectionChange}
    />);

    console.log("Split toggle button injected");
  } else if (buttonContainer && buttonAlreadyExists && rootInstance) {
    console.log({ liveInfo });
    // Update existing instance
    rootInstance.render(<YoutubeSplitButton
        liveInfo={liveInfo}
        onChannelSelectionChange={onChannelSelectionChange}
    />);
  } else if (!buttonContainer) {
    setTimeout(() => injectToggleButton(liveInfo, onChannelSelectionChange), 1000);
  }
}

export function isYoutubeMessagesEnabled(): boolean {
  return youtubeMessagesEnabled;
}
