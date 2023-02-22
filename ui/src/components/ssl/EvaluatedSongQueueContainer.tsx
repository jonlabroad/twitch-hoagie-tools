import { useContext, useEffect, useState } from "react";
import { useSongQueueEval } from "../../hooks/songQueueEval";
import { DonoData } from "../../service/HoagieClient";
import { DonoContext, StateContext } from "../MainPage";
import { EvaluatedSongQueue } from "./EvaluatedSongQueue"

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

    const [evaluations, evalIsLoading, config, onWhitelistWordChange] = useSongQueueEval(state);

    

    return <>
        {(allowedStreamers.includes(state.streamer?.toLowerCase() ?? "")) &&
            <EvaluatedSongQueue
                config={config}
                onWordWhitelistChange={(word: string, type: "add" | "remove") => onWhitelistWordChange(word, type)}
                isLoading={evalIsLoading}
                evaluations={evaluations}
                donoData={donoData}
            />
        }
    </>
}