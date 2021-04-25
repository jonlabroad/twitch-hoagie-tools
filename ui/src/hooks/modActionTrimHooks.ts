import { useEffect, useRef } from "react";
import AlertTrimmer from "../alerts/AlertTrimmer";
import ModActionTrimmer from "../ModAction/ModActionTrimmer";
import { AppState, StateContextType } from "../state/AppState";
import { RemoveModActionsAction } from "../state/AppStateReducer";

const trimAlerts = (state: AppState, dispatch: any) => {
    const trimmedActions = ModActionTrimmer.getActionsToTrim(state);
    if (trimmedActions.length > 0) {
        dispatch({
            type: "remove_mod_actions",
            modActions: trimmedActions,
        } as RemoveModActionsAction);
    }
}

export function useModActionTrimming(stateContext: StateContextType) {
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