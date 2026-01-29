// Message types
export type MessageType = 'youtube-chat' | 'youtube-channel-name-declaration' | 'youtube-message-deleted';

export interface IMessage<T> {
    type: MessageType;
    data: T;
}

export interface YoutubeChatMessageData {
  videoId: string;
  messageId: string;
  author: string;
  content: string;
  contentHtml: string;
  youtubeTimestamp: string;
  timestamp: number;
}

export interface YoutubeChatMessageWithTabId extends YoutubeChatMessage {
  tabId: number | null;
}

export interface YoutubeChatMessage extends IMessage<YoutubeChatMessageData> {
  type: 'youtube-chat';
}

export interface YoutubeChannelNameDeclarationData {
    channelName: string;
    videoId: string;
}

export interface YoutubeChannelNameDeclarationMessage extends IMessage<YoutubeChannelNameDeclarationData> {
  type: 'youtube-channel-name-declaration';
}

export interface YoutubeMessageDeletedData {
  videoId: string;
  messageId: string;
}

export interface YoutubeMessageDeletedMessage extends IMessage<YoutubeMessageDeletedData> {
  type: 'youtube-message-deleted';
}



