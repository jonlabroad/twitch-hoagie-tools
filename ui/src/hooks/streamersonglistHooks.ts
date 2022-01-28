import { useEffect, useRef, useState } from 'react';

// @ts-ignore
import io from 'socket.io-client';
import StreamerSongListClient from '../service/StreamerSongListClient';
import { AppState, StateContextType } from '../state/AppState';
import { UpdateSongHistoryAction, UpdateSongQueueAction } from '../state/AppStateReducer';

export const useStreamerSongListEvents = (stateContext: StateContextType) => {
    const client = useRef<any>(undefined);

    const [streamerId, setStreamerId] = useState<number | undefined>(undefined);

    const state = stateContext.state;
    const username = state.streamer;

    const getQueue = async (streamerId: number) => {
        const client = new StreamerSongListClient();
        const queue = await client.getQueue(streamerId);

        stateContext.dispatch({
            type: "update_songqueue",
            queue
        } as UpdateSongQueueAction);

        return queue;
    }

    const getHistory = async (streamerId: number) => {
        const client = new StreamerSongListClient();
        const history = await client.getStreamHistory(streamerId);

        stateContext.dispatch({
            type: "update_songhistory",
            history
        } as UpdateSongHistoryAction);
    }

    useEffect(() => {
        async function init() {
            if (streamerId) {
                await getQueue(streamerId);
                await getHistory(streamerId);
            }
        }
        init();
    }, [streamerId]);

    useEffect(() => {
        async function getStreamer() {
            if (username) {
                const client = new StreamerSongListClient();
                const sslInfo = await client.getTwitchStreamer(username);
                setStreamerId(sslInfo.id);
            }
        }
        getStreamer();
    }, [username]);

    useEffect(() => {

    }, [streamerId]);
  
    useEffect(() => {
        if (streamerId) {
            client.current = io(`https://api.streamersonglist.com`, { transports: ["websocket"] });
            console.log("Connecting to SSL");
            client.current.on('connect', () => {
                // streamerId is the numeric `id` from `/streamers/<streamer-name` endpoint
                // but needs to be cast as a string for the socket event
                console.log("SSL connected");
                console.log(`Joining SSL room ${streamerId}`);
                client.current.emit('join-room', `${streamerId}`);
                client.current.on('queue-update', () => {
                    console.log("queue-update");
                    getHistory(streamerId);
                    getQueue(streamerId);
                });
                client.current.on('update-playhistory', () => {
                    // the history has been updated, should refetch
                    getHistory(streamerId);
                    console.log("update-playhistory");
                });
                client.current.on('reload-song-list', async () => {
                    getQueue(streamerId);
                    getHistory(streamerId);
                    console.log("reload-song-list");
                });
            });
        }
    }, [streamerId]);
}