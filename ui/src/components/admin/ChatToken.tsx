import { Button, TextField } from "@material-ui/core"
import { useState } from "react";
import { FlexCol, FlexRow } from "../util/FlexBox"

interface ChatTokenProps {
    username: string
    token: string

    onChange: (username: string, token: string) => void
}

export const ChatToken = (props: ChatTokenProps) => {
    const [username, setUsername] = useState(props.username);
    const [token, setToken] = useState(props.token);

    const usernameModified = username !== props.username;
    const tokenModified = token !== props.token;

    return <FlexCol>
        <FlexRow>
            <TextField label="Twitch Chat Username" variant="filled" value={username} style={{ maxWidth: 300, marginRight: 20 }} onChange={(ev) => setUsername(ev.target.value)} />
            <Button variant="contained" disabled={!usernameModified} onClick={() => props.onChange(username, props.token)}>Save</Button>
        </FlexRow>
        <FlexRow>
            <TextField label="Twitch Chat Token" variant="filled" value={token} style={{ maxWidth: 300, marginRight: 20 }} onChange={(ev) => setToken(ev.target.value)} />
            <Button variant="contained" disabled={!tokenModified} onClick={() => props.onChange(props.username, token)}>Save</Button>
        </FlexRow>
    </FlexCol>
}
