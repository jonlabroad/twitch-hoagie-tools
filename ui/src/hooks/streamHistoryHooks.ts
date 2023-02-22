import { useState, useEffect } from "react";
import { StreamInfo } from "../components/dono/DonoTableContainer";
import HoagieClient from "../service/HoagieClient";
import { AppState } from "../state/AppState";

export function useStreamHistory(state: AppState) {
    const [streamHistory, setStreamHistory] = useState<StreamInfo[] | undefined>(undefined)

    useEffect(() => {
        async function getStreamHistory() {
            if (state.username && state.accessToken && state.streamer) {
                const client = new HoagieClient();
                const data = await client.getStreamHistory(state.username, state.accessToken, state.streamer)
                if (data) {
                    const historyArray = Object.values(data)
                    setStreamHistory(historyArray)
                }
            }
        }
        getStreamHistory()
    }, [state.username, state.accessToken, state.streamer])

    return [streamHistory]
}