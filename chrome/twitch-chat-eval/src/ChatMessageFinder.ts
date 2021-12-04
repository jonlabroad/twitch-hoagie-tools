export default class ChatMessageFinder {
    public static findUsernameElements(parent: Element) {
        return parent.querySelectorAll('[data-a-target="chat-message-username"]');
    }

    public static isAChatMessageElement(element: Element) {
        return element.attributes.getNamedItem("data-a-target")?.value === "chat-line-message";
    }
}