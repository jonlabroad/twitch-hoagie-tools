import { YoutubeChatMessageData } from "../messages/messages";

const idleTimeoutMs = 1 * 60 * 1000; // 1 minute

export interface YoutubeLiveInfo {
  channelName: string;
  videoId: string;

  idle: boolean;
}

// Store information about the currently open youtube live chats
export interface YoutubeChatData {
  liveInfo: YoutubeLiveInfo;

  lastHeartbeatTimestamp?: number;
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
        liveInfo: {
          videoId,
          channelName,
          idle: false,
        },
        lastHeartbeatTimestamp: Date.now(),
        chatMessages: [],
        chatMessageById: new Map<string, YoutubeChatMessageData>(),
      };
    }

    this.setNewTimeoutForIdleCheck(videoId);
  }

  public handleHeartbeat(videoId: string) {
    const chatData = this.chatRepo[videoId];
    if (chatData) {
      chatData.lastHeartbeatTimestamp = Date.now();
      chatData.liveInfo.idle = false;
    }
  }

  public getChannels(): YoutubeLiveInfo[] {
    return Object.values(this.chatRepo).map((data) => (
      data.liveInfo
    ));
  }

  public getChannelById(videoId: string): YoutubeLiveInfo | null {
    const data = this.chatRepo[videoId];
    if (data) {
      return data.liveInfo;
    }
    return null;
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

  private setNewTimeoutForIdleCheck(videoId: string) {
    setTimeout(() => {
      const chatData = this.chatRepo[videoId];
      if (chatData) {
        const now = Date.now();
        if (
          chatData.lastHeartbeatTimestamp &&
          now - chatData.lastHeartbeatTimestamp > idleTimeoutMs
        ) {
          chatData.liveInfo.idle = true;
          console.log(`Channel ${chatData.liveInfo.channelName} (${videoId}) marked as idle.`);
        }
      }
    }, idleTimeoutMs);
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

