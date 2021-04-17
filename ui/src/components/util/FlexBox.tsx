import Box, { BoxProps } from "@material-ui/core/Box"
import React from "react"

export interface FlexBoxProps extends BoxProps {
    inline?: boolean
}

export const FlexRow = (props: FlexBoxProps) => {
    return (
        <Box {...props}
            display="flex"
            flexDirection="row"
        >
            {props.children}
        </Box>
    );
}

export const FlexCol = (props: FlexBoxProps) => {
    return (
        <Box {...props}
            display="flex"
            flexDirection="column"
        >
            {props.children}
        </Box>
    );
}