import { ChatMessage } from "../components/chat/SimpleChatDisplay";

export type StreamEventType = "shoutout" | "generic"

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