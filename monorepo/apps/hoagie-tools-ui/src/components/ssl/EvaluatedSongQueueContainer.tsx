import { useContext, useEffect, useState } from "react";
import { useSongQueueEval } from "../../hooks/songQueueEval";
import { DonoUtil } from "../../util/DonoUtil";
import { EvaluatedSongQueue } from "./EvaluatedSongQueue"
import { StateContext } from "../context/StateContextProvider";
import { DonoContext } from "../dono/DonoContextProvider";

const allowedStreamers = [
    "andrewcore",
    "hoagieman5000",
    "thesongery",
]

interface EvaluatedSongQueueContainerProps {
}

export const EvaluatedSongQueueContainer = (props: EvaluatedSongQueueContainerProps) => {
    const stateContext = useContext(StateContext);
    const { state } = stateContext;

    const [evaluations, evalIsLoading, config, onWhitelistWordChange, evaluationsStatus] = useSongQueueEval(state);

    return <>
        {(allowedStreamers.includes(state.streamer?.toLowerCase() ?? "")) &&
            <EvaluatedSongQueue
                config={config}
                onWordWhitelistChange={onWhitelistWordChange}
                isLoading={evalIsLoading}
                evaluations={evaluations}
                evaluationsStatus={evaluationsStatus}
            />
        }
    </>
}
