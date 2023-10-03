import { Button } from "@mui/material"
import React from "react"

export interface CopyButtonProps {
    text: string
    command: string
}

export const CopyButton = (props: CopyButtonProps) => {
    return <React.Fragment>
        <Button
            style={{fontSize: 12, width: 90, height: 30}}
            variant="contained"
            color="primary"
            onClick={() => navigator.clipboard.writeText(props.command)}>
                {props.text}
        </Button>
    </React.Fragment>
}