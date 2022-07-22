import { useEffect, useState } from "react";
import HoagieClient from "../service/HoagieClient";
import { AppState } from "../state/AppState";

export const useSongQueueEval = (state: AppState): [Record<string, any>, boolean] => {
    const songQueue = state.songQueue;
    const streamer = state.streamer;

    const [evaluations, setEvaluations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

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

                const songInfos = await client.getSpotifySongs(state.username ?? "", formattedSongs, state.accessToken ?? "");
                songInfos.forEach((songInfo: any) => {
                    const evaluation = evals.find((e) => e?.songKey === songInfo?.songKey);
                    evaluation.songInfo = songInfo;
                });

                console.log({evals});
                setEvaluations(evals);
                setIsLoading(false);

            }
        }
        evalSongs();
    }, [state.username, state.accessToken, songQueue?.list]);

    return [evaluations, isLoading];

}