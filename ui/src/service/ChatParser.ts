import { ChatMessage } from "../components/chat/SimpleChatDisplay";

export default class ChatParser {
    private static regex = new RegExp(/:(?<username>.+)!(?<fullname>.+) (?<messageType>.+) #(?<channel>.+) :(?<message>.+)/);

    public static parse(rawMessage: string): ChatMessage | undefined {
        const matches = rawMessage.match(ChatParser.regex);
        if (matches?.[3] === "PRIVMSG") {
            return {
                username: matches?.[1],
                message: matches?.[5],
                timestamp: new Date(),
            } as ChatMessage;
        }
    }
}