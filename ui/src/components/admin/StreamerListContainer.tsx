import { useContext, useEffect, useState } from "react"
import HoagieClient, { AdminData } from "../../service/HoagieClient"
import { StreamerList } from "./StreamerList"
import { StateContext } from "../context/StateContextProvider"
import { LoginContext } from "../context/LoginContextProvider"

interface StreamerListContainerProps {
    streamers: string[]
    onChange: () => void
}

export const StreamerListContainer = (props: StreamerListContainerProps) => {
    const loginContext = useContext(LoginContext);
    const { state: loginState } = loginContext;
    
    async function setStreamers(streamers: string[]) {
        if (loginState.username && loginState.accessToken) {
            const client = new HoagieClient();
            await client.adminSetStreamers(streamers, loginState.username, loginState.accessToken);
            setTimeout(() => props.onChange(), 1000);
        }
    }

    return <>
        <StreamerList streamers={props.streamers ?? []}
            onAddStreamer={(streamer: string) => setStreamers([...(props.streamers ?? []), streamer])}
            onRemoveStreamer={(streamer: string) => setStreamers(props.streamers.filter(s => s !== streamer) ?? [])}
        />
    </>;
}