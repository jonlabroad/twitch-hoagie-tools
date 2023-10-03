import { useEffect, useRef } from "react";
import AlertTrimmer from "../alerts/AlertTrimmer";
import { AppState, StateContextType } from "../state/AppState";
import { AddAlertAction } from "../state/AppStateReducer";
import LocalStorage from "../util/LocalStorage";

const trimAlerts = (state: AppState, dispatch: any) => {
    const trimmedAlerts = AlertTrimmer.getAlertsToTrim(state.alert.alerts, state.event.events);
    if (trimmedAlerts.length > 0) {
        dispatch({
            type: "remove_alerts",
            alerts: trimmedAlerts,
        } as AddAlertAction);
    }
}

export function useAlertTrimming(stateContext: StateContextType) {
    const intervalHandle = useRef<NodeJS.Timeout | undefined>(undefined);
    const latestState = useRef(stateContext.state);

    useEffect(() => {
        trimAlerts(latestState.current, stateContext.dispatch);
    }, [stateContext.state.event.events]);

    useEffect(() => {
        intervalHandle.current = setInterval(() => trimAlerts(latestState.current, stateContext.dispatch), 1000);
        return function cleanup() {
            clearInterval(intervalHandle.current as any);
        }
    }, []);

    useEffect(() => {
        latestState.current = stateContext.state;
    }, [stateContext.state])
}