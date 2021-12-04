export interface ChatMessage {
    username: string
    message: string
}

export default class ChatMessageParser {
    public static parse(element: Element | Node): ChatMessage | undefined {
        const message = (element as Element).querySelectorAll('[data-a-target="chat-message-text"]').item(0)?.textContent;
        const username = (element as Element).querySelectorAll('[data-a-target="chat-message-username"]').item(0)?.textContent;
        if (message && username) {
            return {
                username,
                message,
            }
        }
        return undefined;
    }
}