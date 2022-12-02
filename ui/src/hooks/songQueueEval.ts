import { useEffect, useState } from "react";
import { SongEvalConfig } from "../components/ssl/SongEvalConfig";
import HoagieClient from "../service/HoagieClient";
import { AppState } from "../state/AppState";

export type Evaluations = Record<string, any>;

async function readConfig(state: AppState) {
    if (state.username && state.accessToken && state.streamer) {
        const client = new HoagieClient();
        const config = await client.readSongEvalConfig(state.username, state.accessToken, state.streamer);
        return config as SongEvalConfig | undefined;
    }
}

export const useSongQueueEval = (state: AppState): [Record<string, any>, boolean, SongEvalConfig | undefined, (word: string, type: "add" | "remove") => Promise<void>] => {
    const songQueue = state.songQueue;
    const streamer = state.streamer;

    const [evaluations, setEvaluations] = useState<Evaluations | undefined>({});
    const [isLoading, setIsLoading] = useState(false);
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

    useEffect(() => {
        async function evalSongs() {
            if (state.username && state.accessToken && songQueue && (streamer?.toLowerCase() === "andrewcore" || streamer?.toLowerCase() === "hoagieman5000" || streamer?.toLowerCase() === "thesongery")) {
                setIsLoading(true);
                const client = new HoagieClient();
                const newEvals = {
                    ...evaluations
                };
                await Promise.all(songQueue.list.map(async (el) => {
                    const songName = el.nonlistSong;
                    if (songName) {
                        const doEval = !newEvals[songName];
                        if (doEval) {
                            try {
                                const e = await client.songEval(el.nonlistSong, state.username ?? "", state.accessToken ?? "");
                                newEvals[songName] = {
                                    songKey: songName,
                                    user: el.requests?.map(r => r.name)?.join(' '),
                                    eval: e
                                }
                            } catch (e) {
                                console.error(e);
                                newEvals[songName] = {
                                    songKey: songName,
                                    eval: undefined,
                                }
                            }
                        }
                    }
                }));

                await Promise.all(Object.keys(newEvals).map(async songKey => {
                    const evaluation = newEvals[songKey];
                    const artist = evaluation?.eval?.song?.artist_names;
                    const title = evaluation?.eval?.song?.title;
                    const doLookup = !evaluation?.songInfo;
                    if (doLookup && artist && title) {
                        const spotifySong = await client.getSpotifySong(state.username ?? "", artist, title, state.accessToken ?? "");
                        if (spotifySong) {
                            evaluation.songInfo = spotifySong;
                        }
                    }
                }))

                setEvaluations(newEvals);
                setIsLoading(false);
            }
        }
        evalSongs();
    }, [state.username, state.accessToken, songQueue?.list]);

    return [evaluations ?? {}, isLoading, config, onWhitelistWordChange];

}