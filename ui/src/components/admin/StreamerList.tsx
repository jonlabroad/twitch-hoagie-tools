import { Button, TextField } from "@material-ui/core"
import { useState } from "react";
import { FlexCol, FlexRow } from "../util/FlexBox"

interface StreamerListProps {
    streamers: string[]

    onAddStreamer: (streamer: string) => void
    onRemoveStreamer: (streamer: string) => void
}

export const StreamerList = (props: StreamerListProps) => {
    const [addStreamer, setAddStreamer] = useState("");

    return <>
        <FlexCol>
            <TextField label="Streamer to add" variant="filled" style={{ maxWidth: 300, marginRight: 20 }} onChange={(ev) => setAddStreamer(ev.target.value)} />
            <Button variant="contained" onClick={() => props.onAddStreamer(addStreamer)}>Add</Button>
            {props.streamers.map(streamer => <>
                <FlexRow>
                    <div>{streamer}</div>
                    <Button variant="text" onClick={() => props.onRemoveStreamer(streamer)}>Remove</Button>
                </FlexRow>
            </>
            )}
        </FlexCol>
    </>
}