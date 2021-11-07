import { AppBar, Button, Toolbar, Typography } from "@material-ui/core"
import Config from "../Config"
import { useLogin } from "../hooks/loginHooks"
import { AppState } from "../state/AppState"
import { LoginAction } from "../state/AppStateReducer"
import LoginUtil from "../util/LoginUtil"
import { FlexRow } from "./util/FlexBox"

export const PageHeader = (props: { appState: AppState, appStateDispatch: any, scopes: string }) => {
    const { appState, appStateDispatch, scopes } = props;

    const [] = useLogin((username: string | undefined, accessToken: string, isLoggedIn: boolean) => {
        if (username) {
            appStateDispatch({
                type: "login",
                username,
                accessToken,
                isLoggedIn,
            } as LoginAction);
        }
    });

    return (
        <AppBar style={{
            backgroundColor: "#3C474B",
            color: "#dbdbf8"
        }} position="static">
            <Toolbar variant="dense">
                <FlexRow style={{ width: "100%" }} justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" style={{ marginRight: "20px" }}>
                        Hoagie Tools
                    </Typography>
                    {appState.isLoggedIn ?
                        <FlexRow alignItems="center">
                            <div>{appState.username}</div>
                            <Button
                                style={{
                                    marginLeft: 10
                                }}
                                variant="contained"
                                color="secondary"
                                onClick={() => LoginUtil.logout()}
                            >
                                Log Out
                            </Button>
                        </FlexRow>
                        :
                        <Button
                            variant="contained"
                            color="secondary"
                            href={`https://id.twitch.tv/oauth2/authorize?scope=${scopes}&client_id=${Config.clientId}&redirect_uri=${Config.redirectUri}&response_type=token`}
                        >
                            Login
                        </Button>}
                </FlexRow>
            </Toolbar>
        </AppBar>
    );
}