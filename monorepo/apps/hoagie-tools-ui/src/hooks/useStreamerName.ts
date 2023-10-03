import { useContext, useEffect } from "react";
import { useParams } from "react-router";
import { StateContext } from "../components/context/StateContextProvider";
import { SetStreamerAction } from "../state/AppStateReducer";

export function useStreamerName() {
    const stateContext = useContext(StateContext)
    const { streamer } = useParams() as { streamer: string }

    useEffect(() => {
        if (streamer && streamer !== stateContext.state.streamer) {
            stateContext.dispatch({
               type: "set_streamer",
               streamer
            } as SetStreamerAction)
        }
    }, [stateContext.state.streamer, streamer])


}