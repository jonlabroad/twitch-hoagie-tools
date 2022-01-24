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
            <h2>Streamers</h2>
            <FlexRow alignItems="center">
                <TextField label="Streamer to add" variant="filled" style={{ maxWidth: 300, marginRight: 20, marginBottom: 10 }} onChange={(ev) => setAddStreamer(ev.target.value)} />
                <Button variant="contained" color="primary" onClick={() => props.onAddStreamer(addStreamer)}>Add</Button>
            </FlexRow>
            {props.streamers.map(streamer => <>
                <FlexRow>
                    <div style={{minWidth: 200}}>{streamer}</div>
                    <Button variant="text" onClick={() => props.onRemoveStreamer(streamer)}>Remove</Button>
                </FlexRow>
            </>
            )}
        </FlexCol>
    </>
}