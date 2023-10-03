import { useEffect, useRef } from "react"
import { createEvaluatedMessageAlert } from "../alerts/AlertType";
import { ChatMessage } from "../components/chat/SimpleChatDisplay"
import Config from "../Config";
import HoagieClient from "../service/HoagieClient";
import PerspectiveClient from "../service/PerspectiveClient";
import TwitchClient from "../service/TwitchClient";
import { StateContextType } from "../state/AppState";
import { AddAlertAction } from "../state/AppStateReducer";

export const useChatEvaluator = (stateContext: StateContextType, lastMessage: ChatMessage | undefined, twitchClient?: TwitchClient) => {
    //const client = useRef(new PerspectiveClient(Perspective.PerspectiveApiKey));
    const client = useRef(new HoagieClient());

    useEffect(() => {
        async function checkMsg() {
            if (lastMessage && twitchClient) {
                const response = await client.current.analyze(lastMessage.message);
                if (response) {
                    const maxProb = Math.max(...Object.values(response));
                    if (maxProb >= Config.minChatEvalProbability) {
                        const userData = await twitchClient.getUsers([lastMessage.username]);
                        stateContext.dispatch({
                            type: "add_alerts",
                            alerts: [
                                createEvaluatedMessageAlert(lastMessage, response, userData[0])
                            ]
                        } as AddAlertAction);
                    }
                }
            }
        }
        checkMsg();
    }, [lastMessage]);
}