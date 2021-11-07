import { Button, Card, Chip, CircularProgress, Grid, TextField } from "@material-ui/core"
import React, { useEffect, useReducer, useState } from "react";
import HoagieClient from "../../service/HoagieClient";
import { TwitchSubscription } from "../../service/TwitchClientTypes";
import { AppState, defaultAppState } from "../../state/AppState";
import { appStateReducer } from "../../state/AppStateReducer";
import LocalStorage from "../../util/LocalStorage";
import { PageHeader } from "../PageHeader";
import { FlexCol, FlexRow } from "../util/FlexBox";

import "../../styles/StreamerDashboard.scss";
import TwitchClient from "../../service/TwitchClient";
import { SongListConfig } from "./SongListConfig";

import LinkIcon from '@material-ui/icons/Link';
import LinkOffIcon from '@material-ui/icons/Link';

const chipColors: Record<string, any> = {
    "enabled": "success",
    "webhook_callback_verification_failed": "error"
}

export const StreamerDashboard = (props: { streamerName: string, scopes: string }) => {
    const { streamerName, scopes } = props;

    const [appState, appStateDispatch] = useReducer(appStateReducer, {
        ...defaultAppState,
        streamer: streamerName,
    } as AppState);

    const [subscriptions, setSubscriptions] = useState<TwitchSubscription[] | undefined>(undefined);
    const [streamerId, setStreamerId] = useState<number | undefined>(undefined);

    async function createSubscriptions() {
        if (appState.accessToken && appState.username && appState.streamer) {
            const client = new HoagieClient();
            const response = await client.createSubscriptions(appState.username, appState.streamer, appState.accessToken);
            getSubscriptions();
        }
    }

    async function getSubscriptions() {
        if (appState.username && appState.accessToken) {
            const client = new HoagieClient();
            const subs = await client.listSubscriptions(appState.username, appState.accessToken);
            setSubscriptions(subs);
        }
    }

    useEffect(() => {
        const path = window.location.pathname;
        LocalStorage.set("lastPath", { path });
    }, []);

    useEffect(() => {
        getSubscriptions();
    }, [appState.username, appState.accessToken])

    useEffect(() => {
        async function getStreamerId() {
            if (appState.accessToken) {
                const client = new TwitchClient(appState.accessToken);
                const id = await client.getUserId(props.streamerName);
                console.log({ id });
                setStreamerId(id);
            }
        }
        getStreamerId();
    })

    const subscriptionsToDisplay = subscriptions;
    console.log({subscriptionsToDisplay});

    let subConnectionStatus = "";
    if (subscriptionsToDisplay) {
        subConnectionStatus = subscriptionsToDisplay.length > 0 ? "CONNECTED" : "DISCONNECTED";
    }

    return <React.Fragment>
        <PageHeader appState={appState} appStateDispatch={appStateDispatch} scopes={scopes} />
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <FlexCol className="subscriptions-container">
                    <FlexRow alignItems="center">
                        <h2 style={{ marginRight: 20 }}>Channel Point Redemption</h2>
                        {!subscriptionsToDisplay && <CircularProgress size={20} />}
                        {subscriptionsToDisplay && subscriptionsToDisplay.length > 0 && <LinkIcon style={{ color: "green", marginRight: 10 }} />}
                        {subscriptionsToDisplay && subscriptionsToDisplay.length <= 0 && <LinkOffIcon style={{ color: "red", marginRight: 10 }} />}
                        <div style={{ color: subConnectionStatus === "CONNECTED" ? "green" : "red" }}>{subConnectionStatus}</div>
                    </FlexRow>
                    {appState.accessToken && subConnectionStatus === "DISCONNECTED" && (
                        <FlexCol style={{ maxWidth: 120 }}>
                            <Button color="secondary" variant="contained" onClick={() => createSubscriptions()}>Connect</Button>
                        </FlexCol>
                    )}
                    {appState.accessToken && subConnectionStatus === "CONNECTED" && (
                        <FlexCol style={{ maxWidth: 120 }}>
                            <Button color="primary" variant="contained" onClick={async () => {
                                if (appState.username && appState.accessToken) {
                                    const client = new HoagieClient();
                                    await Promise.all(subscriptionsToDisplay?.map(sub => client.deleteSubscription(sub.id, appState.username!, appState.accessToken!)) ?? []);
                                    getSubscriptions();
                                }
                            }}>Disconnect</Button>
                        </FlexCol>
                    )}
                    {<FlexCol>
                            {(subscriptionsToDisplay ?? []).map(sub => <Card className="subscription-card">
                                <FlexRow className="subscription-data">
                                    <div className="sub-type">{sub.type}</div>
                                    <div className="sub-status">
                                        <Chip label={sub.status} color={chipColors[sub.status] ?? "primary"} />
                                    </div>
                                    <div className="sub-delete">
                                        <Button color="primary" variant="contained" className="sub-delete-button" onClick={async () => {
                                            if (appState.username && appState.accessToken) {
                                                const client = new HoagieClient();
                                                await client.deleteSubscription(sub.id, appState.username, appState.accessToken);
                                                getSubscriptions();
                                            }
                                        }}>Delete</Button>
                                    </div>
                                </FlexRow>
                            </Card>)}
                        </FlexCol>
                    }
                </FlexCol>
            </Grid>
            <SongListConfig appState={appState} />
        </Grid>
    </React.Fragment>
}