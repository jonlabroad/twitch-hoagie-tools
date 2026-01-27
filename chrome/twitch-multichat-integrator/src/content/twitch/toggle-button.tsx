import React, { useState, useEffect } from "react";
import { createRoot, Root } from "react-dom/client";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Toggle } from "@radix-ui/react-toggle";
import "./toggle-button.css";
import { YoutubeChatRepository, YoutubeLiveInfo } from "../../shared/youtubeChatRepo";
import { CheckIcon } from "../../shared/icons/CheckIcon";

let youtubeMessagesEnabled = true;
let rootInstance: Root | null = null;

interface IProps {
  repo: YoutubeChatRepository;
  onChannelSelectionChange: (videoId: string) => void;
}

const YoutubeSplitButton: React.FC<IProps> = (props: IProps) => {
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [channels, setChannels] = useState<YoutubeLiveInfo[]>(props.repo.getChannels());
  const [enabled, setEnabled] = useState(youtubeMessagesEnabled);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleChannelChange = () => {
      setChannels(props.repo.getChannels());
    };

    props.repo.subscribeChannelChange(handleChannelChange);
  }, [props.repo]);

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
    >
      <Toggle
        className={`youtube-toggle-button youtube-toggle-button-main ${!enabled ? "disabled" : ""}`}
        aria-label="Toggle italic"
        pressed={enabled}
        onPressedChange={handleToggle}
      >
        YT
      </Toggle>

      <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenu.Trigger asChild disabled={!enabled}>
          <button
            className={`youtube-toggle-button youtube-toggle-button-dropdown ${!enabled ? "disabled" : ""}`}
            title="YouTube message options"
            aria-label="YouTube message options"
          >
            ▲
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content className="youtube-dropdown-content">
            {channels
              .filter((info) => !info.idle)
              .map((info) => (
                <DropdownMenu.Item
                  key={info.videoId}
                  className="youtube-dropdown-item"
                  onSelect={() => {
                    setSelectedChannelId(info.videoId);
                    props.onChannelSelectionChange(info.videoId);
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    {info.channelName}
                    {selectedChannelId === info.videoId && (
                      <CheckIcon color="green" />
                    )}
                  </div>
                </DropdownMenu.Item>
              ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
};

export function injectToggleButton(repo: YoutubeChatRepository, onChannelSelectionChange: (videoId: string) => void) {
  const buttonContainer = document.querySelector(
    '[data-test-selector="chat-input-buttons-container"]',
  );

  console.log("Button container:", buttonContainer);
  const buttonAlreadyExists = document.getElementById("youtube-toggle-btn");
  if (buttonContainer && !buttonAlreadyExists) {
    const mountPoint = document.createElement("div");
    mountPoint.id = "youtube-toggle-btn";
    mountPoint.style.display = "contents";

    if (buttonContainer.firstChild?.nextSibling) {
      buttonContainer.insertBefore(
        mountPoint,
        buttonContainer.firstChild.nextSibling,
      );
    } else {
      buttonContainer.appendChild(mountPoint);
    }

    rootInstance = createRoot(mountPoint);
    rootInstance.render(<YoutubeSplitButton
        repo={repo}
        onChannelSelectionChange={onChannelSelectionChange}
    />);

    console.log("Split toggle button injected");
  } else if (buttonContainer && buttonAlreadyExists && rootInstance) {
    // Update existing instance
    rootInstance.render(<YoutubeSplitButton
        repo={repo}
        onChannelSelectionChange={onChannelSelectionChange}
    />);
  } else if (!buttonContainer) {
    setTimeout(() => injectToggleButton(repo, onChannelSelectionChange), 1000);
  }
}

export function isYoutubeMessagesEnabled(): boolean {
  return youtubeMessagesEnabled;
}
