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
    const donoContext = useContext(DonoContext)

    const { state } = stateContext;
    const { donoData } = donoContext.state;

    const [evaluations, evalIsLoading, config, onWhitelistWordChange, evaluationsStatus] = useSongQueueEval(state);   

    const { eligible } = DonoUtil.getEligibleDonos(donoData, 5)

    return <>
        {(allowedStreamers.includes(state.streamer?.toLowerCase() ?? "")) &&
            <EvaluatedSongQueue
                config={config}
                onWordWhitelistChange={(word: string, type: "add" | "remove") => onWhitelistWordChange(word, type)}
                isLoading={evalIsLoading}
                evaluations={evaluations}
                evaluationsStatus={evaluationsStatus}
                donoData={eligible}
            />
        }
    </>
}