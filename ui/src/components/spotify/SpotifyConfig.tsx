import { Button, CircularProgress, Grid } from "@mui/material"
import { defaultAppState, AppState } from "../../state/AppState";
import { appStateReducer } from "../../state/AppStateReducer";
import { PageHeader } from "../PageHeader"
import { FlexCol, FlexRow } from "../util/FlexBox";

import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/Link';
import { useEffect, useReducer, useState } from "react";
import React from "react";
import Config from "../../Config";
import qs from "qs";
import TwitchClient from "../../service/TwitchClient";
import HoagieClient from "../../service/HoagieClient";
import SpotifyClient from "../../service/SpotifyClient";

interface SpotifyConfigProps {

}

const twitchScopes: string[] = [];

const scopes = [
    "playlist-modify-public",
    "playlist-modify-private",
    "user-read-private",
    "user-read-email"
];

const redirectUri = process.env.NODE_ENV === "production" ? "https://hoagietools.hoagieman.net/spotify/config" : "http://localhost:3000/spotify/config";

export const SpotifyConfig = (props: SpotifyConfigProps) => {
    const [appState, appStateDispatch] = useReducer(appStateReducer, {
        ...defaultAppState,
    } as AppState);

    const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);

    useEffect(() => {
        async function getCode() {
            if (window.location.search && appState.accessToken && appState.username) {
                // User redirected from Twitch oauth
                const parsed = qs.parse(window.location.search.replace('?', ''));
                const url = window.location.href.split('#')[0];
                /* eslint-disable-next-line */
                history.replaceState(null, '', url);

                if (parsed.code) {
                    const hoagieClient = new HoagieClient();
                    await hoagieClient.writeSpotifyToken(appState.username, appState.accessToken, parsed.code as string, redirectUri);
                }
            }
        }
        getCode();
    }, [appState.accessToken, appState.username]);

    return <React.Fragment>
        <PageHeader appState={appState} appStateDispatch={appStateDispatch} scopes={twitchScopes.join('')} clientId={Config.clientId}/>
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <FlexCol className="subscriptions-container">
                    <FlexRow alignItems="center">
                        <h2 style={{ marginRight: 20 }}>Spotify Connection</h2>
                        {<LinkIcon style={{ color: "green", marginRight: 10 }} />}
                        {<LinkOffIcon style={{ color: "red", marginRight: 10 }} />}
                        {//<div style={{ color: subConnectionStatus === "CONNECTED" ? "green" : "red" }}>{subConnectionStatus}</div>
                        }
                    </FlexRow>
                    <div>
                        <Button
                            variant="contained"
                            color="secondary"
                            href={`https://accounts.spotify.com/authorize?response_type=code&scope=${encodeURIComponent(scopes.join(' '))}&client_id=${Config.spotifyClientId}&redirect_uri=${encodeURIComponent(redirectUri)}`}
                        >
                            Connect
                        </Button>
                    </div>
                    <div>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={async () => {
                                if (appState?.username && appState?.accessToken) {
                                    const client = new HoagieClient();
                                    setIsCreatingPlaylist(true);
                                    try {
                                        await client.createSpotifyPlaylist(appState.username, "TheSongery", appState.accessToken);
                                    } catch(err) {
                                        console.error(err);
                                    } finally {
                                        setIsCreatingPlaylist(false);
                                    }                                    
                                }
                            }}
                        >
                            Create Playlist
                        </Button>
                        {isCreatingPlaylist && <CircularProgress />}
                    </div>
                </FlexCol>
            </Grid>
        </Grid>
    </React.Fragment>

}