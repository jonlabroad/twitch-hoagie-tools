import Config from "../Config";
import { AppState, ModAction } from "../state/AppState";

export default class ModActionTrimmer {
    public static getActionsToTrim(state: AppState) {
        const toTrim: ModAction[] = [];
        toTrim.push(...this.trimByExpiry(state));

        return toTrim;
    }

    public static trimByExpiry(state: AppState) {
        const toTrim: ModAction[] = [];
        const currDate = new Date();
        state.modActions.actions.forEach(action => {
            const maxAgeMs = (Config.modActionExpirySec[action.type] ?? Config.modActionExpirySec) * 1e3;
            const timestamp = action.timestamp ? new Date(action.timestamp) : new Date();
            const ageMs = currDate.getTime() - timestamp.getTime();
            if (ageMs > maxAgeMs) {
                toTrim.push(action);
            }
        });
        return toTrim;
    }
}
