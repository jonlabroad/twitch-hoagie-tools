import { useEffect, useState } from "react";
import HoagieClient from "../service/HoagieClient";
import { AppState } from "../state/AppState";

export const useSongQueueEval = (state: AppState) => {
    const songQueue = state.songQueue;
    const streamer = state.streamer;

    const [evaluations, setEvaluations] = useState<Record<string, any>>({});

    useEffect(() => {
        async function evalSongs() {
            if (state.username && state.accessToken && songQueue && (streamer?.toLowerCase() === "andrewcore" || streamer?.toLowerCase() === "hoagieman5000")) {
                const client = new HoagieClient();
                const evals: Record<string, any> = {};
                await Promise.all(songQueue.list.map(async (el) => {
                    const songName = el.nonlistSong;
                    if (songName && !evaluations[songName]) {
                        try {
                            const e = await client.songEval(el.nonlistSong, state.username ?? "", state.accessToken ?? "");
                            evals[songName] = e;
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }));

                const evalKeys = Object.keys(evals);
                const formattedSongs = evalKeys.map(songKey => evals[songKey].song ? {
                    artist: evals[songKey].song.artist_names,
                    title: evals[songKey].song.title,
                } : undefined).filter(s => !!s) as any;
                console.log({ formattedSongs });

                const songInfos = await client.getSpotifySongs(state.username ?? "", formattedSongs, state.accessToken ?? "");
                evalKeys.forEach((evalKey, i) => evals[evalKey].songInfo = songInfos[i]);
                console.log({evals: {
                    ...evaluations,
                    ...evals,
                }});

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