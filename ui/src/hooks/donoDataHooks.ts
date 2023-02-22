import { useState, useEffect, useReducer } from "react";
import { StreamInfo } from "../components/dono/DonoTableContainer";
import HoagieClient, { DonoData } from "../service/HoagieClient";
import { AppState } from "../state/AppState";
import { defaultDonoState, DonoState } from "../state/DonoState";
import { donoStateReducer, SetDonoLoadingAction, SetDonosAction } from "../state/DonoStateReducer";

export function useDonoData(state: AppState, currentStreams: StreamInfo[] | undefined): [DonoState, any, () => any] {

    const [donoState, donoStateDispatch] = useReducer(donoStateReducer, {
        ...defaultDonoState,
        streamer: state.streamer,
    } as DonoState);

    async function getDonos() {
        if (state.username && state.accessToken && state.streamer && currentStreams && currentStreams.length > 0) {
            donoStateDispatch({
                type: "set_loading",
                loading: true,
            } as SetDonoLoadingAction)
            const client = new HoagieClient();
            try {
                const data = await client.getDonos(state.username, state.accessToken, state.streamer, currentStreams.map(s => s.streamId))
                donoStateDispatch({
                    type: "set_donos",
                    donoData: data.donos,
                } as SetDonosAction)
            } catch (err) {
                console.error(err)
            } finally {
                donoStateDispatch({
                    type: "set_loading",
                    loading: false,
                } as SetDonoLoadingAction)
            }
        }
    }

    useEffect(() => {
        getDonos();
    }, [state.username, state.accessToken, state.streamer, currentStreams])

    return [donoState, donoStateDispatch, getDonos]
}
