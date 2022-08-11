import { useEffect, useState } from "react";
import { SongEvalConfig } from "../components/ssl/SongEvalConfig";
import HoagieClient from "../service/HoagieClient";
import { AppState } from "../state/AppState";

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

    const [evaluations, setEvaluations] = useState<any[] | undefined>(undefined);
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
                const evals: any[] = await Promise.all(songQueue.list.map(async (el) => {
                    const songName = el.nonlistSong;
                    if (songName) {
                        try {
                            const e = await client.songEval(el.nonlistSong, state.username ?? "", state.accessToken ?? "");
                            return {
                                songKey: songName,
                                user: el.requests?.map(r => r.name)?.join(' '),
                                eval: e
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    }
                    return {
                        songKey: songName,
                        eval: undefined
                    };
                }));

                const formattedSongs = evals.map(evaluation => evaluation?.eval?.song ? {
                    songKey: evaluation?.songKey,
                    artist: evaluation?.eval?.song?.artist_names,
                    title: evaluation?.eval?.song?.title,
                } : undefined).filter(e => !!e);

                formattedSongs.forEach(async (song) => {
                    if (song?.artist && song?.title) {
                        const spotifySong = await client.getSpotifySong(state.username ?? "", song?.artist, song?.title, state.accessToken ?? "");
                        if (spotifySong) {
                            setEvaluations((prev) => {
                                const evaluation = evals.find((e) => e?.songKey === song?.songKey);
                                if (evaluation) {
                                    evaluation.songInfo = spotifySong;
                                }
                                return evals;
                            })
                        }
                    }
                })

                setIsLoading(false);
            }
        }
        evalSongs();
    }, [state.username, state.accessToken, songQueue?.list]);

    return [evaluations ?? [], isLoading, config, onWhitelistWordChange];

}