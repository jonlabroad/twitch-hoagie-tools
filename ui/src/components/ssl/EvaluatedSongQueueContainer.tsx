import { useContext, useEffect, useState } from "react";
import { useSongQueueEval } from "../../hooks/songQueueEval";
import HoagieClient from "../../service/HoagieClient";
import { AppState } from "../../state/AppState";
import { StateContext } from "../MainPage";
import { EvaluatedSongQueue } from "./EvaluatedSongQueue"
import { SongEvalConfig } from "./SongEvalConfig";

const allowedStreamers = [
    "andrewcore",
    "hoagieman5000",
    "thesongery",
]

interface EvaluatedSongQueueContainerProps {

}

async function readConfig(state: AppState) {
    if (state.username && state.accessToken && state.streamer) {
        const client = new HoagieClient();
        const config = await client.readSongEvalConfig(state.username, state.accessToken, state.streamer);
        return config as SongEvalConfig | undefined;
    }
}

export const EvaluatedSongQueueContainer = (props: EvaluatedSongQueueContainerProps) => {
    const stateContext = useContext(StateContext);

    const { state } = stateContext;

    const [evaluations, evalIsLoading] = useSongQueueEval(state);
    const [config, setConfig] = useState<SongEvalConfig | undefined>(undefined);

    useEffect(() => {
        updateConfig();
    }, [state.username, state.accessToken])

    const updateConfig = async () => {
        const config = await readConfig(state);
        if (config) {
            setConfig(config);
        }
    }

    const onWhitelistWordChange = async (word: string, type: "add" | "remove") => {
        if (state.username && state.accessToken && state.streamer) {
            const client = new HoagieClient();
            if (type === "add") {
                await client.addWhitelistWord(word, state.username, state.accessToken, state.streamer);
            } else if (type === "remove") {
                await client.removeWhitelistWord(word, state.username, state.accessToken, state.streamer);
            }
            await updateConfig();
        }
    }

    console.log({config});

    return <>
        {(allowedStreamers.includes(state.streamer?.toLowerCase() ?? "")) &&
            <EvaluatedSongQueue config={config} onWordWhitelistChange={(word: string, type: "add" | "remove") => onWhitelistWordChange(word, type)} isLoading={evalIsLoading} evaluations={evaluations} />}
    </>
}