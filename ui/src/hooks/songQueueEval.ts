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

    console.log({evaluations})

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
                await Promise.all(songQueue.list.map(async (el) => {
                    const songName = el.nonlistSong ?? `${el.song?.artist?.trim()} - ${el.song?.title?.trim()}`;
                    if (songName) {
                        const doEval = !(evaluations ?? {})[songName];
                        if (doEval) {
                            let e: any | undefined = undefined;
                            try {
                                e = await client.songEval(songName, state.username ?? "", state.accessToken ?? "");
                            } catch (err) {
                                console.error(err);
                                setEvaluations((prev) => ({
                                    ...(prev ?? {}),
                                    [songName]: {
                                        songKey: songName,
                                        eval: undefined,
                                    }
                                }))
                            }

                            if (e) {
                                const artist = e?.song?.artist_names;
                                const title = e?.song?.title;
                                const doLookup = !e?.songInfo;
                                let spotifySong: any | undefined = undefined;
                                if (doLookup && artist && title) {
                                    spotifySong = await client.getSpotifySong(state.username ?? "", artist, title, state.accessToken ?? "");
                                }

                                setEvaluations((prev) => ({
                                    ...(prev ?? {}),
                                    [songName]: {
                                        songKey: songName,
                                        user: el.requests?.map(r => r.name)?.join(' '),
                                        eval: e,
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
    }, [state.username, state.accessToken, songQueue?.list]);

    return [evaluations ?? {}, isLoading, config, onWhitelistWordChange];

}