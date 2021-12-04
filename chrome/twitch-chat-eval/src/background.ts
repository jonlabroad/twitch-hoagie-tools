import { ChatMessageData } from "./ChatMessageMessage";
import Config from "./Config";
import HoagieClient, { FollowResponse } from "./HoagieClient";
import { Message } from "./Message";
import { StreamerNameData } from "./StreamerNameData";
import ChromeStorage from "./util/chrome/ChromeStorage";

const whitelist = [
    "nightbot",
    "streamelements",
    "streamlabs",
    "songlistbot",
    "doclindermans",
    "insertirony",
    "beverly_hills_ninja",
    "daemonarchy",
    "thesongery",
];

export default class Background {
    private streamerName: Record<number, string> = {};

    public init() {
        const self = this;
        chrome.runtime.onMessage.addListener(function (request: any, sender: chrome.runtime.MessageSender) {
            if (request.type === "chat-message") {
                const req = request as Message<ChatMessageData>;
                self.handleChatMessage(req, sender);
                self.lookupUserData(req, sender);
            } else if (request.type === "streamer-name") {
                const req = request as Message<StreamerNameData>;
                self.streamerName[sender.tab?.id ?? 9999] = req.data.streamerName;
            }
        });
    }

    public async handleChatMessage(chatMessage: Message<ChatMessageData>, sender: chrome.runtime.MessageSender) {
        const hoagieClient = new HoagieClient();
        const options = await (new ChromeStorage().getSync([Config.useChatEval]));
        if (options[Config.useChatEval]) {
            if (chatMessage.data.message && !whitelist.includes(chatMessage.data.username.toLowerCase())) {
                const result = await hoagieClient.analyze(chatMessage.data.message);
                chrome.tabs.sendMessage(sender.tab?.id ?? 0, {
                    type: "message-analysis",
                    message: chatMessage.data.message,
                    results: result
                });
            }
        }
    }

    public async lookupUserData(chatMessage: Message<ChatMessageData>, sender: chrome.runtime.MessageSender) {
        const userName = chatMessage.data.username;
        if (whitelist.includes(chatMessage.data.username.toLowerCase())) {
            return {
                userLogin: userName,
                streamerLogin: this.streamerName[sender.tab?.id ?? 9999],
                follows: true,
            } as FollowResponse;
        }

        if (this.streamerName[sender.tab?.id ?? 9999]) {
            const hoagieClient = new HoagieClient();
            const userData = await hoagieClient.getUserData(this.streamerName[sender.tab?.id ?? 9999], userName);
            chrome.tabs.sendMessage(sender.tab?.id ?? 0, {
                type: "user-data-result",
                ...userData,
            });
        }

        return undefined;
    }
}
(new Background).init();