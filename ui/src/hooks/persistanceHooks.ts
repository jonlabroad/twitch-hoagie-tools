import { useEffect, useRef } from "react";
import { StateContextType } from "../state/AppState";
import LocalStorage from "../util/LocalStorage";

export function useStatePersistance(streamer: string, stateContext: StateContextType) {
    const intervalHandle = useRef<NodeJS.Timeout | undefined>(undefined);
    const latestState = useRef(stateContext.state);

    useEffect(() => {
        intervalHandle.current = setInterval(() => {
            const stateToSave = JSON.parse(JSON.stringify(latestState.current));
            stateToSave.accessToken = undefined;
            stateToSave.chat.connected = false;    
            LocalStorage.set(`appState_${streamer}`, stateToSave)
        }, 10000);
        return function cleanup() {
            clearInterval(intervalHandle.current as any);
        }
    }, []);

    useEffect(() => {
        latestState.current = stateContext.state;
    }, [stateContext.state])
}