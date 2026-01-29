import { YoutubeChatMessageData, YoutubeChatMessageWithTabId } from "../messages/messages";

export interface YoutubeChatRepositoryConfig {
  idleTimeoutMs: number;
}

const defaultConfig: YoutubeChatRepositoryConfig = {
  idleTimeoutMs: 1 * 60 * 1000, // 1 minutes
};

export interface YoutubeLiveInfo {
  channelName: string;
  videoId: string;

  idle: boolean;
}

// Store information about the currently open youtube live chats
export interface YoutubeChatData {
  liveInfo: YoutubeLiveInfo;

  lastHeartbeatTimestamp: number;
  chatMessages: YoutubeChatMessageWithTabId[];
  chatMessageById: Map<string, YoutubeChatMessageWithTabId>;
}

type ChatMessageRepository = Record<string, YoutubeChatData>;

type ChannelChangeCallback = (channel: YoutubeLiveInfo) => void;
type ChatMessageCallback = (videoId: string, message: YoutubeChatMessageWithTabId) => void;
type ChannelIdleCallback = (videoId: string, channel: YoutubeLiveInfo) => void;

export class YoutubeChatRepository {
  private chatRepo: ChatMessageRepository = {};
  private config: YoutubeChatRepositoryConfig = { ...defaultConfig };

  constructor(config?: Partial<YoutubeChatRepositoryConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  // Subscriber lists
  private channelChangeListeners: Set<ChannelChangeCallback> = new Set();
  private chatMessageListeners: Set<ChatMessageCallback> = new Set();
  private channelIdleListeners: Set<ChannelIdleCallback> = new Set();

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
        chatMessageById: new Map<string, YoutubeChatMessageWithTabId>(),
      };
    }

    this.notifyChannelChange(this.chatRepo[videoId].liveInfo);
    this.setNewTimeoutForIdleCheck(videoId);
  }

  public handleHeartbeat(liveInfo: YoutubeLiveInfo) {
    const chatData = this.chatRepo[liveInfo.videoId];
    if (chatData) {
      chatData.lastHeartbeatTimestamp = Date.now();

      const newlyActive = chatData.liveInfo.idle;
      chatData.liveInfo.idle = false;
      if (newlyActive) {
        this.notifyChannelChange(chatData.liveInfo);
      }
      this.setNewTimeoutForIdleCheck(liveInfo.videoId);
    } else {
      this.initializeChannel(liveInfo.videoId, liveInfo.channelName);
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
    chatMessage: YoutubeChatMessageWithTabId,
  ) {
    const chatData = this.chatRepo[videoId];
    const messageData = chatMessage.data;

    if (chatData) {
      if (chatData.chatMessageById.has(messageData.messageId)) {
        // Update existing message
        const existingMessage = chatData.chatMessageById.get(
          messageData.messageId,
        );
        if (existingMessage) {
          Object.assign(existingMessage, chatMessage);
          let msgIndex = findLastIndex(
            chatData.chatMessages,
            (msg) => msg.data.messageId === messageData.messageId,
          );
          if (msgIndex !== -1) {
            chatData.chatMessages[msgIndex] = existingMessage;
          }
        }
        return;
      }

      // Insert new message
      chatData.chatMessages.push(chatMessage);
      chatData.chatMessageById.set(messageData.messageId, chatMessage);
      this.notifyChatMessage(videoId, chatMessage);
    } else {
      console.warn(`Chat data for video ID ${videoId} not initialized.`);
    }
  }

  public getChatMessages(videoId: string): YoutubeChatMessageWithTabId[] | null {
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
          now - chatData.lastHeartbeatTimestamp > this.config.idleTimeoutMs
        ) {
          chatData.liveInfo.idle = true;
          this.notifyChannelIdle(videoId, chatData.liveInfo);
          console.log(`Channel ${chatData.liveInfo.channelName} (${videoId}) marked as idle.`);
        }
      }
    }, this.config.idleTimeoutMs + 500); // Add a small buffer
  }

  // Subscribe methods
  subscribeChannelChange(callback: ChannelChangeCallback): () => void {
    this.channelChangeListeners.add(callback);
    // Return unsubscribe function
    return () => this.channelChangeListeners.delete(callback);
  }

  subscribeChatMessage(callback: ChatMessageCallback): () => void {
    this.chatMessageListeners.add(callback);
    return () => this.chatMessageListeners.delete(callback);
  }

  subscribeChannelIdle(callback: ChannelIdleCallback): () => void {
    this.channelIdleListeners.add(callback);
    return () => this.channelIdleListeners.delete(callback);
  }

  private notifyChannelChange(channel: YoutubeLiveInfo) {
    this.channelChangeListeners.forEach(listener => listener(channel));
  }

  private notifyChatMessage(videoId: string, message: YoutubeChatMessageWithTabId) {
    this.chatMessageListeners.forEach(listener => listener(videoId, message));
  }

  private notifyChannelIdle(videoId: string, channel: YoutubeLiveInfo) {
    this.channelIdleListeners.forEach(listener => listener(videoId, channel));
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

