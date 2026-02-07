import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import './YoutubeMessageModal.css';

interface YoutubeMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  onTimeout: (duration: string) => void;
  messageAuthor: string;
  messageContent: string;
}

export const YoutubeMessageModal: React.FC<YoutubeMessageModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  onTimeout,
  messageAuthor,
  messageContent,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="youtube-message-modal-overlay" />
        <Dialog.Content className="youtube-message-modal-content">
          <Dialog.Title className="youtube-message-modal-title">
            Message Actions
          </Dialog.Title>
          
          <div className="youtube-message-modal-info">
            <div className="youtube-message-modal-author">
              {messageAuthor}
            </div>
            <div className="youtube-message-modal-text" dangerouslySetInnerHTML={{ __html: messageContent }} />
          </div>

          <div className="youtube-message-modal-actions">
            <button
              className="youtube-message-modal-button youtube-message-modal-button-delete"
              onClick={() => {
                onDelete();
                onClose();
              }}
            >
              Delete Message
            </button>
            <div className="youtube-message-modal-timeout-buttons">
              <button
                className="youtube-message-modal-button youtube-message-modal-button-timeout"
                onClick={() => {
                  onTimeout('1 minute');
                  onClose();
                }}
              >
                1m
              </button>
              <button
                className="youtube-message-modal-button youtube-message-modal-button-timeout"
                onClick={() => {
                  onTimeout('10 minutes');
                  onClose();
                }}
              >
                10m
              </button>
              <button
                className="youtube-message-modal-button youtube-message-modal-button-timeout"
                onClick={() => {
                  onTimeout('30 minutes');
                  onClose();
                }}
              >
                30m
              </button>
              <button
                className="youtube-message-modal-button youtube-message-modal-button-timeout"
                onClick={() => {
                  onTimeout('24 hours');
                  onClose();
                }}
              >
                24h
              </button>
            </div>
            <button
              className="youtube-message-modal-button youtube-message-modal-button-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>

          <Dialog.Close asChild>
            <button className="youtube-message-modal-close" aria-label="Close">
              ×
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
