import { DonoState } from "./DonoState";
import { UserDonoSummaries } from "@hoagie/dono-service";

export interface DonoStateAction {
    type: "set_donos" | "set_loading"
}

export interface SetDonosAction extends DonoStateAction {
    donoData: UserDonoSummaries;
}

export interface SetDonoLoadingAction extends DonoStateAction {
    loading: boolean;
}

export const donoStateReducer = (state: DonoState, action: DonoStateAction): DonoState => {
    switch (action.type) {
        case "set_donos": {
            const setDonoAction = action as SetDonosAction;
            return {
                ...state,
                donoData: setDonoAction.donoData
            }
        }

        case "set_loading": {
            const setLoadingAction = action as SetDonoLoadingAction;
            return {
                ...state,
                loading: setLoadingAction.loading,
            }
        }

        default:
            console.error(`Do not know how to process ${action.type}`);
    }
    return state;
}