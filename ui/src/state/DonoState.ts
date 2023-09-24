import { StreamInfo } from "../components/dono/DonoTableContainer";
import { DonoData, DonoDataV2, UserDonoSummaries } from "../service/HoagieClient"

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
