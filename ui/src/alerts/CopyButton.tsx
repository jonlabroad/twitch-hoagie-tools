import { Button } from "@material-ui/core"
import React from "react"

export interface CopyButtonProps {
    text: string
    command: string
}

export const CopyButton = (props: CopyButtonProps) => {
    return <React.Fragment>
        <Button
            style={{height: 40}}
            variant="contained"
            color="primary"
            onClick={() => navigator.clipboard.writeText(props.command)}>
                {props.text}
        </Button>
    </React.Fragment>
}