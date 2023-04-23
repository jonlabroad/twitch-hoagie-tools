import { useContext } from "react";
import HoagieClient, { AdminData } from "../../service/HoagieClient";
import { ChatToken } from "./ChatToken"
import { StateContext } from "../context/StateContextProvider";
import { LoginContext } from "../context/LoginContextProvider";

interface ChatTokenContainerProps {
    config?: AdminData

    onChange: () => void
}

export const ChatTokenContainer = (props: ChatTokenContainerProps) => {
    const loginContext = useContext(LoginContext);
    const { state: loginState } = loginContext;

    async function setChatToken(username: string, token: string) {
        if (props.config && loginState.username && loginState.accessToken) {
            const client = new HoagieClient();
            await client.adminSetConfig({
                ...props.config,
                chatUsername: username,
                chatToken: token,
            }, loginState.username, loginState.accessToken);
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
