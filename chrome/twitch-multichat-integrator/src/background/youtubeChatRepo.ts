import { YoutubeChatMessageData } from "../messages/messages";

// Store information about the currently open youtube live chats
interface YoutubeChatData {
  channelName: string;
  videoId: string;

  chatMessages: YoutubeChatMessageData[];
  chatMessageById: Map<string, YoutubeChatMessageData>;
}

type ChatMessageRepository = Record<string, YoutubeChatData>;

export class YoutubeChatRepository {
  private chatRepo: ChatMessageRepository = {};

  constructor() {}

  public initializeChannel(videoId: string, channelName: string) {
    if (!this.chatRepo[videoId]) {
      this.chatRepo[videoId] = {
        channelName,
        videoId,
        chatMessages: [],
        chatMessageById: new Map<string, YoutubeChatMessageData>(),
      };
    }
  }

  public hasMessage(videoId: string, messageId: string): boolean {
    const chatData = this.chatRepo[videoId];
    if (chatData) {
        return chatData.chatMessageById.has(messageId);
    }
    return false;
}

  public upsertChatMessage(
    videoId: string,
    chatMessage: YoutubeChatMessageData,
  ) {
    const chatData = this.chatRepo[videoId];
    if (chatData) {
      if (chatData.chatMessageById.has(chatMessage.messageId)) {
        // Update existing message
        const existingMessage = chatData.chatMessageById.get(
          chatMessage.messageId,
        );
        if (existingMessage) {
          Object.assign(existingMessage, chatMessage);
          let msgIndex = findLastIndex(
            chatData.chatMessages,
            (msg) => msg.messageId === chatMessage.messageId,
          );
          if (msgIndex !== -1) {
            chatData.chatMessages[msgIndex] = existingMessage;
          }
        }
        return;
      }

      // Insert new message
      chatData.chatMessages.push(chatMessage);
      chatData.chatMessageById.set(chatMessage.messageId, chatMessage);

      console.log({ chatData });
    } else {
      console.warn(`Chat data for video ID ${videoId} not initialized.`);
    }
  }

  public getChatMessages(videoId: string): YoutubeChatMessageData[] | null {
    const chatData = this.chatRepo[videoId];
    return chatData ? chatData.chatMessages : null;
  }
}

function findLastIndex<T>(
  array: T[],
  predicate: (value: T) => boolean,
): number {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) {
      return i;
    }
  }
  return -1;
}
