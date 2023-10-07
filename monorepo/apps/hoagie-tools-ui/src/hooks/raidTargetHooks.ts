import { useEffect, useRef, useState } from "react"
import { createTwitchClient } from "../util/CreateTwitchClient";
import { StreamData, UserFollows } from "@hoagie/service-clients";

export const useRaidTargets = (broadcasterName?: string, username?: string, accessToken?: string) => {
    const [myFollowedChannels, setMyFollowedChannels] = useState<Record<string, UserFollows>>({});

    useEffect(() => {
        async function get() {
            if (broadcasterName && username && accessToken) {
                const client = createTwitchClient(accessToken);
                const userId = await client.getUserId(username);
                if (userId) {
                    const mine = await client.getUserFollows(userId);
                    const mineParsed: Record<string, UserFollows> = {};
                    mine.forEach(f => mineParsed[f.broadcaster_login] = f)
                    setMyFollowedChannels(mineParsed);
                }
            }
        }
        get();
    }, [broadcasterName, username, accessToken]);

    return [myFollowedChannels];
}

export const useLiveChannels = (username?: string, accessToken?: string) => {
    const [liveStreams, setLiveStreams] = useState<StreamData[]>([]);

    useEffect(() => {
        async function get() {
            if (username && accessToken) {
                const client = createTwitchClient(accessToken);
                const game = await client.getGame("Music");
                if (game) {
                    const liveStreams = await client.getStreamsByGame(game.id);
                    setLiveStreams(liveStreams);    
                }
            }
        }
        get();
    }, [username, accessToken]);

    return [liveStreams];
}