import { useContext, useEffect } from "react";
import { useParams } from "react-router";
import { StateContext } from "../components/context/StateContextProvider";
import { SetStreamerAction } from "../state/AppStateReducer";
import { createTwitchClient } from "../util/CreateTwitchClient";
import { TwitchClient } from "@hoagie/service-clients";
import { LoginContext } from "../components/context/LoginContextProvider";

export function useStreamerName() {
    const stateContext = useContext(StateContext)
    const loginContext = useContext(LoginContext)
    const { streamer } = useParams() as { streamer: string }

    useEffect(() => {
        if (streamer && streamer !== stateContext.state.streamer) {
            stateContext.dispatch({
               type: "set_streamer",
               streamer
            } as SetStreamerAction)
        }
    }, [stateContext.state.streamer, streamer])

    useEffect(() => {
      async function getStreamerId() {
        if (stateContext.state.streamer && loginContext?.state?.accessToken) {
          const client = createTwitchClient(loginContext.state.accessToken);
          const userId = await client.getUserId(stateContext.state.streamer);
          if (userId) {
            stateContext.dispatch({
              type: "set_streamer_id",
              streamerId: userId
            });
          }
        }
      }
      getStreamerId();
    }, [stateContext.state.streamer, loginContext.state.accessToken])

}
