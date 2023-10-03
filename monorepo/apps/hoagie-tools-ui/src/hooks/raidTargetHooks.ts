import { useEffect, useRef, useState } from "react"
import TwitchClient from "../service/TwitchClient";
import { StreamData, UserFollows } from "../service/TwitchClientTypes";
import CacheManager from "../util/CacheManager";

export const useRaidTargets = (broadcasterName?: string, username?: string, accessToken?: string) => {
    const caches = useRef(new CacheManager());

    const [myFollowedChannels, setMyFollowedChannels] = useState<Record<string, UserFollows>>({});

    useEffect(() => {
        async function get() {
            if (broadcasterName && username && accessToken) {
                const client = new TwitchClient(accessToken, caches.current);
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
                const client = new TwitchClient(accessToken);
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