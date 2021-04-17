import { ChatMessage } from "../components/chat/SimpleChatDisplay";

export default class ChatParser {
    private static regex = new RegExp(/:(?<username>.+)!(?<fullname>.+) (?<messageType>.+) #(?<channel>.+) :(?<message>.+)/);

    public static parse(rawMessage: string): ChatMessage | undefined {
        const matches = rawMessage.match(ChatParser.regex);
        if (matches?.groups?.messageType === "PRIVMSG") {
            return {
                username: matches.groups?.username,
                message: matches.groups?.message,
                timestamp: new Date(),
            } as ChatMessage;
        }
    }
}