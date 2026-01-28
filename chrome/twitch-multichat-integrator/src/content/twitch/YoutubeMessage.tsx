import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { YoutubeChatMessageData } from "../../messages/messages";
import { getColorForAuthor } from "./chat-colors";
import { YoutubeMessageModal } from "./YoutubeMessageModal";

interface YoutubeMessageProps {
  message: YoutubeChatMessageData;
  usernameColor: string;
  onDelete?: (messageId: string) => void;
  onBanUser?: (author: string) => void;
}

const YoutubeMessage: React.FC<YoutubeMessageProps> = ({ 
  message, 
  usernameColor, 
  onDelete, 
  onBanUser
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    <>
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
        onClick={() => setIsModalOpen(true)}
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

      <YoutubeMessageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={handleDelete}
        onBan={handleBanUser}
        messageAuthor={message.author}
        messageContent={message.contentHtml ?? message.content}
      />
    </>
  );
};

export function renderYoutubeMessage(
  container: HTMLElement,
  message: YoutubeChatMessageData,
  onDelete?: (messageId: string) => void,
  onBanUser?: (author: string) => void
): void {
  const usernameColor = getColorForAuthor(message.author);
  const root = createRoot(container);
  root.render(
    <YoutubeMessage 
      message={message} 
      usernameColor={usernameColor}
      onDelete={onDelete}
      onBanUser={onBanUser}
    />
  );
}
