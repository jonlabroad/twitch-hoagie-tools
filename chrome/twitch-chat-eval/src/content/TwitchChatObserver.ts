import { AnalysisResultMessage } from "../AnalysisResultMessage";
import { FollowResponse } from "../HoagieClient";
import NaughtyFinder from "../NaughtyFinder";

export default class TwitchChatObserver {
    private chatParentElements: Element[] = [];

    public init() {
        const self = this;

        this.sendStreamerName();

        const chatLineObserver = new MutationObserver(function (mutations, observer) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(addedNode => {
                    if (self.isAChatMessageNode(addedNode)) {
                        const element = addedNode as Element;
                        const message = element.querySelectorAll('[data-a-target="chat-message-text"]').item(0)?.textContent;
                        const username = element.querySelectorAll('[data-a-target="chat-message-username"]').item(0)?.textContent;
                        chrome.runtime.sendMessage({
                            type: "chat-message",
                            data: {
                                username,
                                message
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
                                const message = element.querySelectorAll('[data-a-target="chat-message-text"]').item(0)?.textContent;
                                const username = element.querySelectorAll('[data-a-target="chat-message-username"]').item(0)?.textContent;
                                chrome.runtime.sendMessage({
                                    type: "chat-message",
                                    data: {
                                        username,
                                        message
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
            } else if (request.type === "follow-result") {
                console.log({ followResult: request.follows });
                self.handleFollowResult(request.follows);
            }
            sendResponse();
        });
    }

    isAChatMessageNode(node: Node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (this.isAChatMessageElement(element)) {
                console.log({ attr: element.attributes });
                return true;
            }
        }
        return false;
    }

    isAChatMessageElement(element: Element) {
        return element.attributes.getNamedItem("data-a-target")?.value === "chat-line-message";
    }

    sendStreamerName() {
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

    handleMessageAnalysis(request: AnalysisResultMessage) {
        const naughtyScores = NaughtyFinder.getNaughtyScores(request);
        if (naughtyScores.length > 0) {
            // Find the chat message element
            for (var i = 0; i < this.chatParentElements[0].children.length; i++) {
                const item = this.chatParentElements[0].children.item(i);
                if (item?.nodeType === Node.ELEMENT_NODE) {
                    const element = item as Element;
                    const message = element.querySelectorAll('[data-a-target="chat-message-text"]').item(0)?.textContent;
                    const username = element.querySelectorAll('[data-a-target="chat-message-username"]').item(0)?.textContent;
                    console.log({ message, username });
                    console.log({ message, reqMsg: request.message });
                    if (username && message) {
                        if (message === request.message) {
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
                    //}
                }
            }
        }
    }

    handleFollowResult(follow: FollowResponse) {
        // Find the user's chats
        if (this.chatParentElements[0]) {
            const parent = this.chatParentElements[0];
            const usernameElements = parent.querySelectorAll('[data-a-target="chat-message-username"]');
            usernameElements.forEach(el => {
                if (el.textContent?.toLowerCase() === follow.userLogin.toLowerCase()) {
                    const existingIcon = el.querySelector(".non-follower-icon");
                    if (!follow.follows) {
                        if (!existingIcon) {
                            const icon = document.createElement("span");
                            icon.setAttribute("class", "non-follower-icon");
                            el.append(icon);
                        }
                    } else {
                        if (existingIcon) {
                            existingIcon.remove();
                        }
                    }
                }
            });
        }
    }
}