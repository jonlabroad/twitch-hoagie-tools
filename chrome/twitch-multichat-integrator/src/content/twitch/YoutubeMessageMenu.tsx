import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface YoutubeMessageMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  onBanUser: () => void;
  children: React.ReactNode;
}

export const YoutubeMessageMenu: React.FC<YoutubeMessageMenuProps> = ({
  open,
  onOpenChange,
  onDelete,
  onBanUser,
  children
}) => {
  return (
    <DropdownMenu.Root open={open} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild>
        {children}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          className="youtube-dropdown-content"
          sideOffset={5}
          style={{
            backgroundColor: '#18181b',
            border: '1px solid #3a3a3d',
            borderRadius: '6px',
            padding: '4px',
            minWidth: '150px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
            zIndex: 9999
          }}
        >
          <DropdownMenu.Item
            className="youtube-dropdown-item"
            onSelect={onDelete}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              borderRadius: '4px',
              outline: 'none',
              color: '#efeff1',
              fontSize: '13px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Delete message
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="youtube-dropdown-item"
            onSelect={onBanUser}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              borderRadius: '4px',
              outline: 'none',
              color: '#efeff1',
              fontSize: '13px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Ban user
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
