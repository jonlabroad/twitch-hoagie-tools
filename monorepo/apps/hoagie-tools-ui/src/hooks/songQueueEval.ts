import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import HoagieClient from "../service/HoagieClient";
import { AppState } from "../state/AppState";
import { LoginContext } from "../components/context/LoginContextProvider";
import { LoginState } from "../state/LoginState";
import { SongLookupClient } from "@hoagie/song-lookup-service";
import { EvalResponse, SongEvalClient, SongEvalConfigData } from "@hoagie/song-eval-service";
import Config from "../Config";

export type Evaluations = Record<string, any>;
export type EvaluationsStatus = Record<string, EvaluationStatus>;
export interface EvaluationStatus {
    isLoading: boolean
    isError: boolean
}

async function readConfig(state: AppState, loginState: LoginState) {
    if (loginState.userId && loginState.accessToken && state.streamerId) {
        const client = new SongEvalClient(Config.environment, loginState.userId, loginState.accessToken);
        const config = await client.getConfig(state.streamerId);
        return config;
    }
}

export const useSongQueueEval = (state: AppState): [Record<string, any>, boolean, SongEvalConfigData | undefined, (word: string, type: "add" | "remove") => Promise<void>, EvaluationsStatus] => {
    const songQueue = state.songQueue;
    const streamer = state.streamer;

    const [evaluations, setEvaluations] = useState<Evaluations | undefined>({});
    const [evaluationsStatus, setEvaluationsStatus] = useState<EvaluationsStatus>({});
    const [isLoading, setIsLoading] = useState(false);
    const [config, setConfig] = useState<SongEvalConfigData | undefined>(undefined);
    const { state: loginState } = useContext(LoginContext)

    useEffect(() => {
        updateConfig();
    }, [loginState.userId, loginState.accessToken, state.streamerId])

    const updateConfig = async () => {
        const config = await readConfig(state, loginState);
        if (config) {
            setConfig(config);
        }
    }

    const onWhitelistWordChange = useCallback(async (word: string, type: "add" | "remove") => {
        if (loginState.userId && loginState.accessToken && state.streamerId) {
            const client = new SongEvalClient(Config.environment, loginState.userId, loginState.accessToken);
            if (type === "add") {
                await client.addAllowListWord(state.streamerId, word);
            } else if (type === "remove") {
                await client.removeAllowListWord(state.streamerId, word);
            }
            await updateConfig();
        }
    }, [loginState.userId, loginState.accessToken, state.streamerId]);

    const setEvalLoading = (songKey: string, isLoading: boolean, isError: boolean = false) => {
        const status = {
            isLoading,
            isError
        }
        setEvaluationsStatus((prev) => ({
            ...prev,
            [songKey]: status
        }))
    }

    useEffect(() => {
        async function evalSongs() {
            if (state.streamerId && loginState.userId && loginState.accessToken && songQueue) {
                setIsLoading(true);
                const client = new SongEvalClient(Config.environment, loginState.userId, loginState.accessToken);
                await Promise.all(songQueue.list.map(async (el) => {
                    const songName = el.nonlistSong ?? `${el.song?.artist?.trim()} - ${el.song?.title?.trim()}`;
                    if (songName) {
                        const doEval = !(evaluations ?? {})[songName];
                        if (doEval) {
                            let evaluation: EvalResponse | null = null;
                            try {
                                setEvalLoading(songName, true, false)
                                evaluation = await client.songEval(songName, state.streamerId!);
                            } catch (err) {
                                console.error(err);
                                setEvalLoading(songName, false, true)
                                setEvaluations((prev) => ({
                                    ...(prev ?? {}),
                                    [songName]: {
                                        songKey: songName,
                                        eval: undefined,
                                    }
                                }))
                            }

                            if (evaluation) {
                                const artist = evaluation?.song?.artist?.name;
                                const title = evaluation?.song?.title;
                                const doLookup = /* !evaluation?.songInfo; */ true; // Can't remember why this is here? Was it sometimes included?
                                let spotifySong: any | undefined = undefined;
                                if (doLookup && artist && title) {
                                  const lookupClient = new SongLookupClient(Config.environment, loginState.userId!, loginState.accessToken!);
                                  spotifySong = await lookupClient.songLookup(artist, title, state.streamerId!);
                                }

                                setEvalLoading(songName, false, false)
                                setEvaluations((prev) => ({
                                    ...(prev ?? {}),
                                    [songName]: {
                                        songKey: songName,
                                        user: el.requests?.map(r => r.name)?.join(' '),
                                        eval: evaluation,
                                        songInfo: spotifySong
                                    }
                                }))
                            }
                        }
                    }
                }));
                setIsLoading(false);
            }
        }
        evalSongs();
    }, [loginState.username, loginState.accessToken, songQueue?.list, state.streamerId]);

    return [evaluations ?? {}, isLoading, config, onWhitelistWordChange, evaluationsStatus];

}
