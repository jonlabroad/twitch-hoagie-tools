import { DonoData } from "../service/HoagieClient"

export interface DonoStateContextType {
    dispatch: any,
    state: DonoState;

    refreshDonos: () => any
}

export interface DonoState {
    donoData: DonoData[]
    loading: boolean
}

export const defaultDonoState: DonoState = {
    donoData: [],
    loading: false,
}
