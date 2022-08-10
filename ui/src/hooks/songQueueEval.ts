import { useEffect, useState } from "react";
import HoagieClient from "../service/HoagieClient";
import { AppState } from "../state/AppState";

export const useSongQueueEval = (state: AppState): [Record<string, any>, boolean] => {
    const songQueue = state.songQueue;
    const streamer = state.streamer;

    const [evaluations, setEvaluations] = useState<any[] | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);

    // TEST ONLY
    useEffect(() => {
        async function test() {
            if (state.username && state.accessToken && state.streamer) {
                const client = new HoagieClient();
                //await client.addWhitelistWord("buttslol2", state.username, state.accessToken, state.streamer);
                //await client.removeWhitelistWord("buttslol2", state.username, state.accessToken, state.streamer);
            }
        }
        test();
    }, [state.username, state.accessToken])

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
                                const newEvals = prev ? [...prev] : evals;
                                const evaluation = newEvals.find((e) => e?.songKey === song?.songKey);
                                evaluation.songInfo = spotifySong;
                                return newEvals;
                            })
                        }
                    }
                })

                setIsLoading(false);
            }
        }
        evalSongs();
    }, [state.username, state.accessToken, songQueue?.list]);

    return [evaluations ?? [], isLoading];

}