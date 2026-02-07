import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { YoutubeChatMessageData, YoutubeChatMessageWithTabId } from "../../messages/messages";
import { getColorForAuthor } from "./chatColors";
import { YoutubeMessageModal } from "./youtubeMessageModal";

interface YoutubeMessageProps {
  message: YoutubeChatMessageWithTabId;
  usernameColor: string;
  onDelete?: (tabId: number, messageId: string) => void;
  onTimeout?: (tabId: number, messageId: string, duration: string) => void;
}

const YoutubeMessage: React.FC<YoutubeMessageProps> = ({ 
  message, 
  usernameColor, 
  onDelete, 
  onTimeout
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(message.tabId, message.data.messageId);
    }
  };

  const handleTimeout = (duration: string) => {
    if (onTimeout) {
      onTimeout(message.tabId, message.data.messageId, duration);
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
          {message.data.author}:
        </span>
        {' '}
        <span 
          className="youtube-chat-message-content"
          dangerouslySetInnerHTML={{ __html: message.data.contentHtml ?? message.data.content }}
        />
      </div>

      <YoutubeMessageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={handleDelete}
        onTimeout={handleTimeout}
        messageAuthor={message.data.author}
        messageContent={message.data.contentHtml ?? message.data.content}
      />
    </>
  );
};

export function renderYoutubeMessage(
  container: HTMLElement,
  message: YoutubeChatMessageWithTabId,
  onDelete?: (tabId: number, messageId: string) => void,
  onTimeout?: (tabId: number, messageId: string, duration: string) => void
): void {
  const usernameColor = getColorForAuthor(message.data.author);
  const root = createRoot(container);
  root.render(
    <YoutubeMessage 
      message={message} 
      usernameColor={usernameColor}
      onDelete={onDelete}
      onTimeout={onTimeout}
    />
  );
}
