import { useState, useEffect, useContext } from "react";
import { StreamInfo } from "../components/dono/DonoTableContainer";
import HoagieClient from "../service/HoagieClient";
import { AppState } from "../state/AppState";
import { LoginContext } from "../components/context/LoginContextProvider";

export function useStreamHistory(state: AppState): [StreamInfo[] | undefined] {
    const { state: loginState } = useContext(LoginContext)
    const [streamHistory, setStreamHistory] = useState<StreamInfo[] | undefined>(undefined)

    useEffect(() => {
        async function getStreamHistory() {
            if (loginState.userId && loginState.accessToken && state.streamerId) {
                const client = new HoagieClient();
                const data = await client.getStreamHistory(loginState.userId, loginState.accessToken, state.streamerId);
                console.log({ data });
                if (data) {
                    setStreamHistory(data.streams.map(stream => ({
                        streamId: stream.id,
                        timestamp: stream.started_at,
                    })));
                }
            }
        }
        getStreamHistory()
    }, [loginState.userId, loginState.accessToken, state.streamerId])

    return [streamHistory]
}
