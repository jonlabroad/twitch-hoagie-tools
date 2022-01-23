import { useContext, useEffect, useState } from "react"
import HoagieClient, { AdminData } from "../../service/HoagieClient"
import { StateContext } from "../MainPage";
import { StreamerList } from "./StreamerList"

interface StreamerListContainerProps {
    streamers: string[]
    onChange: () => void
}

export const StreamerListContainer = (props: StreamerListContainerProps) => {
    const { state } = useContext(StateContext);

    async function setStreamers(streamers: string[]) {
        if (state.username && state.accessToken) {
            const client = new HoagieClient();
            await client.adminSetStreamers(streamers, state.username, state.accessToken);
            setTimeout(() => props.onChange(), 1000);
        }
    }

    return <>
        <StreamerList streamers={props.streamers ?? []}
            onAddStreamer={(streamer: string) => setStreamers([...props.streamers ?? [], streamer])}
            onRemoveStreamer={(streamer: string) => setStreamers(props.streamers.filter(s => s !== streamer) ?? [])}
        />
    </>
}