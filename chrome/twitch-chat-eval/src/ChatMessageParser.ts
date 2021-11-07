export interface ChatMessage {
    username: string
    message: string
    fullMessage: string
}

export default class ChatMessageParser {
    public static parse(rawMsg: string): ChatMessage {
        const matches = rawMsg.match(/(\d{1,2}:\d{1,2})?(?<username>.[^:]+): (?<message>.+)/);
        return {
            username: matches?.groups?.username?.trim() ?? "",
            message: matches?.groups?.message?.trim() ?? "",
            fullMessage: matches?.groups?.message ?? "",
        }
    }
}