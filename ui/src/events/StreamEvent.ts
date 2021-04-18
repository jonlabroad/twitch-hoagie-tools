import { ChatMessage } from "../components/chat/SimpleChatDisplay";

export type StreamEventType = "shoutout" | "ignore" | "generic"

export default abstract class StreamEvent {
    type: StreamEventType = "generic";
    timestamp: Date = new Date();
}

export class ShoutoutStreamEvent extends StreamEvent {
    chatMsg: ChatMessage
    username: string

    constructor(chat: ChatMessage, username: string) {
        super();
        this.type = "shoutout";
        this.chatMsg = chat;
        this.username = username;
    } 
}

export class IgnoreStreamEvent extends StreamEvent {
    ignoreType: string;
    username: string;

    constructor(ignoreType: StreamEventType, username: string) {
        super();
        this.type = "ignore"
        this.ignoreType = ignoreType;
        this.username = username;
    }
}