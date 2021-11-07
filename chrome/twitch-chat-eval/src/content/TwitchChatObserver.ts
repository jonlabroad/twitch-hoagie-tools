import { AnalysisResultMessage } from "../AnalysisResultMessage";
import ChatMessageParser, { ChatMessage } from "../ChatMessageParser";
import NaughtyFinder from "../NaughtyFinder";

export default class TwitchChatObserver {
    private chatParentElements: Element[] = [];

    public init() {
        const self = this;

        const chatLineObserver = new MutationObserver(function (mutations, observer) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(addedNode => {
                    if (self.isAChatMessageNode(addedNode)) {
                        const element = addedNode as Element;
                        chrome.runtime.sendMessage({
                            type: "chat-message",
                            data: {
                                message: element.textContent
                            }
                        })
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
                                console.log(`Found a chat container`);
                                self.chatParentElements.push(chatParent);
                                chatLineObserver.observe(chatParent, { childList: true });
                                chrome.runtime.sendMessage({
                                    type: "chat-message",
                                    data: {
                                        message: element.textContent
                                    }
                                })
                            }
                        }
                    }
                })
            })
        });
        chatLoadedObserver.observe(document.getRootNode(), { childList: true, subtree: true });

        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            if (request.type === "message-analysis") {
                console.log({ receivedAnalysis: request.results });
                self.handleMessageAnalysis(request);
            }
            sendResponse();
        });
    }

    isAChatMessageNode(node: Node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (this.isAChatMessageElement(element)) {
                return true;
            }
        }
        return false;
    }

    isAChatMessageElement(element: Element) {
        return element.getAttribute("class")?.startsWith("chat-line");
    }

    handleMessageAnalysis(request: AnalysisResultMessage) {
        const naughtyScores = NaughtyFinder.getNaughtyScores(request);
        if (naughtyScores.length > 0) {
            // Find the chat message element
            for (var i = 0; i < this.chatParentElements[0].children.length; i++) {
                const item = this.chatParentElements[0].children.item(i);
                if (item?.nodeType === Node.ELEMENT_NODE) {
                    const element = item as Element;
                    if (element.getAttribute("class")?.startsWith("chat-line") && element.textContent) {
                        const currentMsg = ChatMessageParser.parse(element.textContent);
                        if (currentMsg.fullMessage === request.message.fullMessage) {
                            const currentClass = element.getAttribute("class") ?? "";
                            element.setAttribute("class", `${currentClass} highlighted-chat-message`);

                            const containerDiv = document.createElement("div");
                            containerDiv.setAttribute("class", "evaluation-container");

                            const evalTypeDiv = document.createElement("div");
                            evalTypeDiv.setAttribute("class", "evaluation-type");
                            evalTypeDiv.innerText = `${naughtyScores[0][0]}`;
                            
                            const evalValDiv = document.createElement("div");
                            evalValDiv.setAttribute("class", "evaluation-rating");
                            evalValDiv.innerText = `${Math.round(naughtyScores[0][1] * 100)}%`;
                            
                            containerDiv.appendChild(evalTypeDiv);
                            containerDiv.appendChild(evalValDiv);
                            element.appendChild(containerDiv);
                        }
                    }
                }
            }
        }
    }
}