import { useEffect, useRef, useState } from "react"
import TwitchClient from "../service/TwitchClient";
import { LiveChannelData, StreamData, UserFollows } from "../service/TwitchClientTypes";
import CacheManager from "../util/CacheManager";

export const useRaidTargets = (broadcasterName?: string, username?: string, accessToken?: string) => {
    const caches = useRef(new CacheManager());

    const [myFollowedChannels, setMyFollowedChannels] = useState<Record<string, UserFollows> | undefined>(undefined);
    const [theirFollowedChannels, setTheirFollowedChannels] = useState<Record<string, UserFollows> | undefined>(undefined);

    useEffect(() => {
        async function get() {
            if (broadcasterName && username && accessToken) {
                const client = new TwitchClient(accessToken, caches.current);
                const mine = await client.getAllUsersFollowedChannels(username);
                const mineParsed: Record<string, UserFollows> = {};
                mine.forEach(f => mineParsed[f.to_name] = f)
                setMyFollowedChannels(mineParsed);

                const theirs = await client.getAllUsersFollowedChannels(broadcasterName);
                const theirsParsed: Record<string, UserFollows> = {};
                theirs.forEach(f => theirsParsed[f.to_name] = f)
                setTheirFollowedChannels(theirsParsed);
            }
        }
        get();
    }, [broadcasterName, username, accessToken]);

    return [myFollowedChannels, theirFollowedChannels];
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

                console.log({ liveStreams });
            }
        }
        get();
    }, [username, accessToken]);

    return [liveStreams];
}