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
            if (loginState.username && loginState.accessToken && state.streamer) {
                const client = new HoagieClient();
                const data = await client.getStreamHistoryV2(loginState.username, loginState.accessToken, state.streamer)
                if (data) {
                    setStreamHistory(data.streams.map(stream => ({
                        streamId: stream.id,
                        timestamp: stream.started_at,
                    })));
                }
            }
        }
        getStreamHistory()
    }, [loginState.username, loginState.accessToken, state.streamer])

    return [streamHistory]
}