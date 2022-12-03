import { AnalysisResultMessage } from "../AnalysisResultMessage";
import ChatMessageFinder from "../ChatMessageFinder";
import ChatMessageParser from "../ChatMessageParser";
import { UserDataResponse } from "../HoagieClient";
import NaughtyFinder from "../NaughtyFinder";
import ChatEvalIndicator from "./ChatEvalIndicator";
import ContentMessages from "./ContentMessages";
import UserDataIndicator from "./UserDataIndicator";

export default class TwitchChatObserver {
    private chatParentElements: Element[] = [];

    public init() {
        const self = this;

        ContentMessages.sendStreamerName();

        const chatLineObserver = new MutationObserver(function (mutations, observer) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(addedNode => {
                    if (self.isAChatMessageNode(addedNode)) {
                        const chatMsg = ChatMessageParser.parse(addedNode);
                        ContentMessages.sendChatMessage(chatMsg);
                    }
                })
            })
        });

        const chatLoadedObserver = new MutationObserver(function (mutations, observer) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(addedNode => {
                    if (self.isAChatMessageNode(addedNode)) {
                        const element = addedNode as Element;
                        const chatParent = element.parentElement;
                        if (chatParent) {
                            if (!self.chatParentElements.includes(chatParent)) {
                                self.chatParentElements.push(chatParent);
                                chatLineObserver.observe(chatParent, { childList: true });
                                const chatMsg = ChatMessageParser.parse(element);
                                ContentMessages.sendChatMessage(chatMsg);
                            }
                        }
                    }
                })
            })
        });
        chatLoadedObserver.observe(document.getRootNode(), { childList: true, subtree: true });

        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            if (request.type === "message-analysis") {
                self.handleMessageAnalysis(request);
            } else if (request.type === "user-data-result") {
                self.handleUserDataResult(request);
            }
            sendResponse();
        });
    }

    isAChatMessageNode(node: Node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (ChatMessageFinder.isAChatMessageElement(element)) {
                return true;
            }
        }
        return false;
    }

    handleMessageAnalysis(request: AnalysisResultMessage) {
        const naughtyScores = NaughtyFinder.getNaughtyScores(request);
        if (naughtyScores.length > 0) {
            // Find the chat message element
            for (var i = 0; i < this.chatParentElements[0].children.length; i++) {
                const item = this.chatParentElements[0].children.item(i);
                if (item?.nodeType === Node.ELEMENT_NODE) {
                    const element = item as Element;
                    const chatMsg = ChatMessageParser.parse(element);
                    if (chatMsg?.username && chatMsg?.message) {
                        if (chatMsg?.message === request.message) {
                            ChatEvalIndicator.setIndicator(element, naughtyScores);
                        }
                    }
                }
            }
        }
    }

    handleUserDataResult(userData: UserDataResponse) {
        // Find the user's chats
        if (this.chatParentElements[0]) {
            const parent = this.chatParentElements[0];
            const usernameElements = ChatMessageFinder.findUsernameElements(parent);
            usernameElements.forEach(el => {
                if (el.textContent?.toLowerCase() === userData.userLogin.toLowerCase()) {
                    UserDataIndicator.setIndicator(el, userData);
                }
            });
        }
    }
}