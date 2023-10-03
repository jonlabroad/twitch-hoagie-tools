import { Button } from "@mui/material"
import React, { useContext } from "react"
import AlertType from "./AlertType";
import { StateContext } from "../components/context/StateContextProvider";

export interface IgnoreButtonProps {
    alert: AlertType
}

export const IgnoreButton = (props: IgnoreButtonProps) => {
    const stateContext = useContext(StateContext);

    return <React.Fragment>
        <Button
            style={{ marginRight: 0, marginBottom: 5, fontSize: 12, width: 90, height: 30 }}
            variant="contained"
            color="secondary"
            onClick={() => {
                stateContext.dispatch({
                    type: "ignore_shoutout",
                    alertType: props.alert.type,
                    alertKey: props.alert.key,
                });
            }}>
            Ignore
        </Button>
    </React.Fragment>
}