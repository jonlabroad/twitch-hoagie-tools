import { ChatMessageMessage } from "./ChatMessageMessage";
import ChatMessageParser from "./ChatMessageParser";
import Config from "./Config";
import HoagieClient from "./HoagieClient";
import ChromeStorage from "./util/chrome/ChromeStorage";

const blacklist = [
    "nightbot",
    "streamelements",
    "streamlabs",
    "songlistbot",
    "doclindermans",
    "insertirony",
    "beverly_hills_ninja",
    "daemonarchy",
];

export default class Background {
    public init() {
        const self = this;
        chrome.runtime.onMessage.addListener(function (request, sender) {
            if (request.type === "chat-message") {
                self.handleChatMessage(request, sender);
            }
        });
    }

    public async handleChatMessage(chatMessage: ChatMessageMessage, sender: chrome.runtime.MessageSender) {
        const message = ChatMessageParser.parse(chatMessage.data.message);
        const hoagieClient = new HoagieClient();
        const options = await (new ChromeStorage().getSync([Config.useChatEval]));
        if (options[Config.useChatEval]) {
            if (message.message && !blacklist.includes(message.username.toLowerCase())) {
                const result = await hoagieClient.analyze(message.message);
                chrome.tabs.sendMessage(sender.tab?.id ?? 0, {
                    type: "message-analysis",
                    message: message,
                    results: result
                });
            }
        }
    }

    public isBlacklistedUser(username: string) {

    }
}
(new Background).init();