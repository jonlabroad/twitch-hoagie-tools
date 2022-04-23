import { useEffect, useState } from "react";
import HoagieClient from "../service/HoagieClient";
import { AppState } from "../state/AppState";

export const useSongQueueEval = (state: AppState) => {
    const songQueue = state.songQueue;

    const [evaluations, setEvaluations] = useState<Record<string, any>>({});

    useEffect(() => {
        async function evalSongs() {
            if (state.username && state.accessToken && songQueue) {
                const client = new HoagieClient();
                const evals: Record<string, any> = {};
                await Promise.all(songQueue.list.map(async (el) => {
                    const songName = el.nonlistSong;
                    if (songName && !evaluations[songName]) {
                        const e = await client.songEval(el.nonlistSong, state.username ?? "", state.accessToken ?? "");
                        evals[songName] = e;
                    }
                }));
                setEvaluations({
                    ...evaluations,
                    ...evals,
                });

            }
        }
        evalSongs();
    }, [state.username, state.accessToken, songQueue?.list]);

    return [evaluations];

}