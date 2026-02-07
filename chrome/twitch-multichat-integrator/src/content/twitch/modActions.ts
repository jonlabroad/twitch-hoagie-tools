export class ModActions {
  // Define handlers for delete and ban
  public handleDelete = async (tabId: number, messageId: string) => {
    console.log("Delete message:", messageId);

    try {
      // Send message to background to forward to YouTube tab
      const response = await chrome.runtime.sendMessage({
        type: 'youtube-delete-message-command',
        
        tabId,
        messageId,
      });

      if (response && response.success) {
        console.log("Message deleted successfully:", messageId);
      } else {
        const errorMsg = response?.error || "Unknown error";
        console.error("Failed to delete message:", errorMsg);
        alert(`Failed to delete message: ${errorMsg}\n\nMake sure the YouTube live chat tab is open.`);
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to delete message:", errorMessage);
    }
  };

  public handleTimeout = async (tabId: number, messageId: string, duration: string) => {
    console.log(`Timeout user with duration: ${duration}`);

    try {
      // Send message to background to forward to YouTube tab
      const response = await chrome.runtime.sendMessage({
        type: 'youtube-timeout-user-command',
        tabId,
        messageId,
        duration,
      });

      if (response && response.success) {
        console.log(`User timed out successfully for ${duration}`);
      } else {
        const errorMsg = response?.error || "Unknown error";
        console.error("Failed to timeout user:", errorMsg);
        alert(`Failed to timeout user: ${errorMsg}\n\nMake sure the YouTube live chat tab is open.`);
      }
    } catch (error) {
      console.error("Failed to timeout user:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Failed to timeout user: ${errorMessage}`);
    }
  };
}