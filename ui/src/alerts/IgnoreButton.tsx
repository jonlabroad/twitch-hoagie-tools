import { Button } from "@material-ui/core"
import React, { useContext } from "react"
import { StateContext } from "../components/MainPage";
import { createIgnoreShoutoutModAction, IgnoreShoutoutModAction, ModActionType } from "../state/AppState";
import AlertType from "./AlertType";

export interface IgnoreButtonProps {
    alert: AlertType
}

export const IgnoreButton = (props: IgnoreButtonProps) => {
    const stateContext = useContext(StateContext);

    return <React.Fragment>
        <Button
            style={{ height: 40 }}
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