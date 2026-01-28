import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { YoutubeChatMessageData } from "../../messages/messages";
import { getColorForAuthor } from "./chat-colors";
import { YoutubeMessageMenu } from "./YoutubeMessageMenu";

interface YoutubeMessageProps {
  message: YoutubeChatMessageData;
  usernameColor: string;
  onDelete?: (messageId: string) => void;
  onBanUser?: (author: string) => void;
  onMenuStateChange?: (isOpen: boolean) => void;
}

const YoutubeMessage: React.FC<YoutubeMessageProps> = ({ 
  message, 
  usernameColor, 
  onDelete, 
  onBanUser,
  onMenuStateChange
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuOpenChange = (open: boolean) => {
    setMenuOpen(open);
    if (onMenuStateChange) {
      onMenuStateChange(open);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(message.messageId);
    }
  };

  const handleBanUser = () => {
    if (onBanUser) {
      onBanUser(message.author);
    }
  };

  return (
    <YoutubeMessageMenu
      open={menuOpen}
      onOpenChange={handleMenuOpenChange}
      onDelete={handleDelete}
      onBanUser={handleBanUser}
    >
      <div 
        className="chat-line__message" 
        data-a-target="chat-line-message-body"
        style={{
          cursor: 'pointer',
          padding: '2px 4px',
          margin: '-2px -4px',
          borderRadius: '4px',
          transition: 'background-color 0.15s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <span style={{
          borderRadius: '4px',
          borderWidth: '1px',
          backgroundColor: '#fc1037',
          color: 'white',
          padding: '2px',
          fontSize: '12px'
        }}>
          YouTube
        </span>
        {' '}
        <span style={{ color: usernameColor, fontWeight: 'bold' }}>
          {message.author}:
        </span>
        {' '}
        <span 
          className="youtube-chat-message-content"
          dangerouslySetInnerHTML={{ __html: message.contentHtml ?? message.content }}
        />
      </div>
    </YoutubeMessageMenu>
  );
};

export function renderYoutubeMessage(
  container: HTMLElement,
  message: YoutubeChatMessageData,
  onDelete?: (messageId: string) => void,
  onBanUser?: (author: string) => void,
  onMenuStateChange?: (isOpen: boolean) => void
): void {
  const usernameColor = getColorForAuthor(message.author);
  const root = createRoot(container);
  root.render(
    <YoutubeMessage 
      message={message} 
      usernameColor={usernameColor}
      onDelete={onDelete}
      onBanUser={onBanUser}
      onMenuStateChange={onMenuStateChange}
    />
  );
}
