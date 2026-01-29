import { YouTubeApiClient } from "../../shared/youtubeApiClient";

export class ModActions {
  // Define handlers for delete and ban
  public handleDelete = async (messageId: string) => {
    console.log("Delete message:", messageId);

    try {
      // Get the access token from storage
      const result = await chrome.storage.local.get("youtubeAuth");
      const authState = result.youtubeAuth;

      if (!authState || !authState.accessToken) {
        alert("Please connect to YouTube in the extension settings first");
        return;
      }

      // Check if token is expired
      if (authState.expiresAt && Date.now() >= authState.expiresAt) {
        alert(
          "Your YouTube session has expired. Please reconnect in the extension settings.",
        );
        return;
      }

      // Create API client and delete the message
      const apiClient = new YouTubeApiClient(authState.accessToken);
      await apiClient.deleteMessage(messageId);

      // Mark the message as deleted in the UI
      const messageToRemove = document.querySelector(
        `[data-youtube-message-id="${messageId}"]`,
      );
      if (messageToRemove) {
        messageToRemove.classList.add("deleted-youtube-message");
      }

      console.log("Message deleted successfully:", messageId);
    } catch (error) {
      console.error("Failed to delete message:", error);

      // Check if it's an auth error
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("401") ||
        errorMessage.includes("authError") ||
        errorMessage.includes("Invalid Credentials")
      ) {
        alert(
          "Your YouTube session has expired or is invalid. Please reconnect in the extension settings.",
        );
      } else if (
        errorMessage.includes("403") ||
        errorMessage.includes("forbidden")
      ) {
        alert("You do not have permission to delete messages in this chat.");
      } else {
        alert(`Failed to delete message: ${errorMessage}`);
      }
    }
  };

  public handleBanUser = async (author: string) => {
    console.log("Ban user:", author);
    // TODO: Implement ban user functionality with YouTube API
    alert(`Ban user functionality for "${author}" will be implemented`);
  };
}