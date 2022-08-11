import { useContext, useEffect, useState } from "react";
import { useSongQueueEval } from "../../hooks/songQueueEval";
import { StateContext } from "../MainPage";
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

    const { state } = stateContext;

    const [evaluations, evalIsLoading, config, onWhitelistWordChange] = useSongQueueEval(state);

    return <>
        {(allowedStreamers.includes(state.streamer?.toLowerCase() ?? "")) &&
            <EvaluatedSongQueue
                config={config}
                onWordWhitelistChange={(word: string, type: "add" | "remove") => onWhitelistWordChange(word, type)}
                isLoading={evalIsLoading}
                evaluations={evaluations}
            />
        }
    </>
}