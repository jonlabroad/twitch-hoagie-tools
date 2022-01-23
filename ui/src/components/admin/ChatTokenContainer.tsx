import { useContext } from "react";
import HoagieClient, { AdminData } from "../../service/HoagieClient";
import { StateContext } from "../MainPage";
import { ChatToken } from "./ChatToken"

interface ChatTokenContainerProps {
    config?: AdminData

    onChange: () => void
}

export const ChatTokenContainer = (props: ChatTokenContainerProps) => {
    const { state } = useContext(StateContext);

    async function setChatToken(username: string, token: string) {
        if (props.config && state.username && state.accessToken) {
            const client = new HoagieClient();
            await client.adminSetConfig({
                ...props.config,
                chatUsername: username,
                chatToken: token,
            }, state.username, state.accessToken);
            setTimeout(() => props.onChange(), 1000);
        }
    }

    return <>
        {props.config && <ChatToken
            username={props.config?.chatUsername ?? "wut"}
            token={props.config?.chatToken ?? ""}
            onChange={(username, token) => setChatToken(username, token)}
        />}
    </>
}
