import { ChatMessage } from "../ChatMessageParser";

export default class ContentMessages {
    public static sendStreamerName() {
        const matches = window.location.pathname.match(/\/((.+)\/)?(?<streamerName>.+)/);
        const streamerName = matches?.groups?.streamerName;
        if (streamerName) {
            chrome.runtime.sendMessage({
                type: "streamer-name",
                data: {
                    streamerName
                }
            })
        }
    }

    public static sendChatMessage(msg: ChatMessage | undefined) {
        if (msg) {
            chrome.runtime.sendMessage({
                type: "chat-message",
                data: msg,
            })
        }
    }
}