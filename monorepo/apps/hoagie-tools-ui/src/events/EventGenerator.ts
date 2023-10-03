import { ChatMessage } from "../components/chat/SimpleChatDisplay";
import TwitchClient from "../service/TwitchClient";
import StreamEvent, { ShoutoutStreamEvent } from "./StreamEvent";

export default class EventGenerator {
    constructor() {
    }

    async fromChatMessage(msg: ChatMessage): Promise<StreamEvent[]> {
        const events: StreamEvent[] = [];

        events.push(...(this.checkForShoutOut(msg)));

        return events;
    }

    checkForShoutOut(msg: ChatMessage): ShoutoutStreamEvent[] {
        const shoutedOutUser = EventGenerator.getShoutoutUser(msg.message);
        if (shoutedOutUser) {
            return [new ShoutoutStreamEvent(msg, shoutedOutUser)];
        }
        
        return [];
    }

    private static getShoutoutUser(message: string): string | undefined {
        const match = message.match(/twitch.tv\/(?<username>\S+)/);
        return match?.groups?.username;
    }
}