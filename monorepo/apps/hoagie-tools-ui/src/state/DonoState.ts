import { UserDonoSummaries } from "@hoagie/dono-service";
import { StreamInfo } from "../components/dono/DonoTableContainer";

export interface DonoStateContextType {
    dispatch: any,
    state: DonoState;

    selection: {
        streamHistory: StreamInfo[],
        currentStreams: StreamInfo[],
        isFirst: boolean,
        isLast: boolean,
        getNextStream: (dir: number) => void
    },

    refreshDonos: (currentStreams: StreamInfo[]) => any
}

export interface DonoState {
    donoData: UserDonoSummaries
    loading: boolean
}

export const defaultDonoState: DonoState = {
    donoData: {},
    loading: false,
}
