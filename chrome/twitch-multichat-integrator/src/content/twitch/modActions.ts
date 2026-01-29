import { YouTubeApiClient } from "../../shared/youtubeApiClient";

export class ModActions {
  // Define handlers for delete and ban
  public handleDelete = async (messageId: string) => {
    console.log("Delete message:", messageId);

    try {
      // Send message to background to forward to YouTube tab
      const response = await chrome.runtime.sendMessage({
        type: 'youtube-click-delete',
        messageId: messageId
      });

      if (response && response.success) {
        // Mark the message as deleted in the Twitch UI
        const messageToRemove = document.querySelector(
          `[data-youtube-message-id="${messageId}"]`,
        );
        if (messageToRemove) {
          messageToRemove.classList.add("deleted-youtube-message");
        }
        console.log("Message deleted successfully:", messageId);
      } else {
        const errorMsg = response?.error || "Unknown error";
        console.error("Failed to delete message:", errorMsg);
        alert(`Failed to delete message: ${errorMsg}\n\nMake sure the YouTube live chat tab is open.`);
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Failed to delete message: ${errorMessage}\n\nMake sure the YouTube live chat tab is open.`);
    }
  };

  public handleTimeout = async (author: string, seconds: number | 'infinite') => {
    const duration = seconds === 'infinite' ? 'permanently' : `for ${seconds} seconds`;
    console.log(`Timeout user ${author} ${duration}`);
    // TODO: Implement timeout user functionality with YouTube API
    alert(`Timeout functionality for "${author}" ${duration} will be implemented`);
  };
}