import { useState, useEffect, useReducer, useContext } from "react";
import { StreamInfo } from "../components/dono/DonoTableContainer";
import HoagieClient, { DonoData } from "../service/HoagieClient";
import { AppState } from "../state/AppState";
import { defaultDonoState, DonoState } from "../state/DonoState";
import { donoStateReducer, SetDonoLoadingAction, SetDonosAction } from "../state/DonoStateReducer";
import { LoginContext } from "../components/context/LoginContextProvider";

export function useDonoData(state: AppState, currentStreams: StreamInfo[] | undefined): [DonoState, any, (currentStreams: StreamInfo[]) => any] {
    const { state: loginState } = useContext(LoginContext)

    const [donoState, donoStateDispatch] = useReducer(donoStateReducer, {
        ...defaultDonoState,
        streamer: state.streamer,
    } as DonoState);

    async function getDonos(currentStreams: StreamInfo[]) {
        console.log([loginState.username, loginState.accessToken, state.streamer, currentStreams, currentStreams?.length]);
        if (loginState.username && loginState.accessToken && state.streamer && currentStreams.length > 0) {
            donoStateDispatch({
                type: "set_loading",
                loading: true,
            } as SetDonoLoadingAction)
            const client = new HoagieClient();
            try {
                const data = await client.getDonosV2(loginState.username, loginState.accessToken, state.streamer, currentStreams.map(s => s.streamId))
                donoStateDispatch({
                    type: "set_donos",
                    donoData: data.data,
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
        getDonos(currentStreams ?? []);
    }, [loginState.username, loginState.accessToken, state.streamer, currentStreams])

    return [donoState, donoStateDispatch, getDonos]
}
