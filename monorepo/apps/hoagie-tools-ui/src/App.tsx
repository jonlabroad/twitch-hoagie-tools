import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { LoginRedirect } from "./components/LoginRedirect";

import { SpotifyConfig } from "./components/spotify/SpotifyConfig";
import { DonoPage } from "./components/dono/DonoPage";

import "fontsource-roboto";
import { AdminPage } from "./components/admin/AdminPage";
import { HoagieDashboard } from "./components/hoagie/HoagieDashboard";
import {
  createTheme,
  ThemeProvider,
  Theme,
  StyledEngineProvider,
  adaptV4Theme,
} from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { DarkModeContext } from "./components/DarkModeSwitch";
import LocalStorage from "./util/LocalStorage";
import { StreamerConfigPage } from "./components/config/StreamerConfigPage";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { RaidDashboard } from "./components/RaidDashboard";
import { StateContextProvider } from "./components/context/StateContextProvider";
import { PageHeader } from "./components/PageHeader";
import Config from "./Config";
import { LoginContextProvider } from "./components/context/LoginContextProvider";
import { Redirect } from "./Redirect";
import { StreamerAdminPage } from "./components/config/StreamerAdminPage";
import { ModListContextProvider } from "./components/context/ModListContextProvider";
import { SystemStatusContextProvider } from "./components/context/SystemStatusContextProvider";
import { HoagieUserDataContextProvider } from "./components/context/HoagieUserDataContextProvider";
import { NotFound } from "./components/pages/NotFound";
import { LandingPageContainer } from "./components/pages/LandingPageContainer";
import ConnectionPage from "./components/connection/ConnectionPage";
import { botAccountConnectionConfig } from "./components/connection/ConnectionConfig";
import { ConnectionRedirect } from "./components/connection/ConnectionRedirect";
import { BulkWhisperPageContainer } from "./specialevent/BulkWhisperPageContainer";
import { RewardMonitoring } from "./components/pages/RewardMonitoring";
import { RewardConfigPageContainer } from "./components/rewards/config/RewardConfigPageContainer";
import { TwitchPlusStatusPage } from "./components/pages/TwitchPlusStatusPage";
import { MultiModPage } from "./components/pages/MultiModPage";
import { LoginRedirectYoutube } from "./components/LoginRedirectYoutube";
import { GoogleOAuthProvider } from "@react-oauth/google";

const HoagieToolsStreamChatsClientId = "360294299808-qpddue75gnqun3p3pr5a0efq6pd45fbo.apps.googleusercontent.com";

function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const preference = LocalStorage.get("darkMode");
    setDarkMode(preference === "true");
  }, []);

  const theme = useMemo(() => {
    return createTheme(
      adaptV4Theme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: {
            //main: "#3A5639"
            main: "#538D5B",
          },
          secondary: {
            //main: "#F05D01"
            main: "#F86624",
          },
        },
      })
    );
  }, [darkMode]);

  useEffect(() => {
    async function savePreference() {
      LocalStorage.set("darkMode", darkMode);
    }
    savePreference();
  }, [darkMode]);

  return (
    <DarkModeContext.Provider
      value={{ darkMode, setDarkMode: (val: boolean) => setDarkMode(val) }}
    >
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div>
            <LoginContextProvider>
              <StateContextProvider>
                <ModListContextProvider>
                  <HoagieUserDataContextProvider>
                    <SystemStatusContextProvider>
                      <Router>
                        <PageHeader
                          scopes={Config.scopes}
                          clientId={Config.clientId}
                        />
                        <Routes>
                          <Route
                            path="/s/:streamer/dono"
                            element={<DonoPage />}
                          />
                          <Route
                            path="/s/:streamer/raid"
                            element={<RaidDashboard />}
                          />
                          <Route
                            path="/s/:streamer/config"
                            element={<StreamerConfigPage />}
                          />
                          <Route
                            path="/s/:streamer/admin"
                            element={<StreamerAdminPage />}
                          />
                          <Route
                            path="/loginRedirect"
                            element={<LoginRedirect />}
                          />
                          <Route
                            path="/loginRedirectYoutube"
                            element={<LoginRedirect />}
                          />
                          <Route
                            path="/connectionBot"
                            element={<ConnectionPage connectionConfig={botAccountConnectionConfig} />}
                          />
                          <Route
                            path="/connectionRedirectBot"
                            element={<ConnectionRedirect  connectionConfig={botAccountConnectionConfig} />}
                          />
                          <Route
                            path="/config/:streamer"
                            element={<StreamerConfigPage />}
                          />
                          <Route path="/admin" element={<AdminPage />} />
                          <Route
                            path="/dono/:streamer"
                            element={<Redirect to={"/s/:streamer/dono"} />}
                          />
                          <Route
                            path="/spotify/config"
                            element={<SpotifyConfig />}
                          />
                          <Route
                            path="/hoagie"
                            element={
                              <HoagieDashboard
                                streamerName="hoagieman5000"
                                scopes={"channel:read:subscriptions bits:read"}
                              />
                            }
                          />
                          <Route
                            path="/landing"
                            element={
                              <LandingPageContainer />
                            }
                          />
                          <Route
                            path="/"
                            element={
                              <Navigate to="/landing" replace={true} />
                            }
                          />
                          <Route
                            path="/s/:streamer/streamrewards"
                            element={
                              <RewardMonitoring />
                            }
                          />
                          <Route
                            path="/s/:streamer/streamrewards/config"
                            element={
                              <RewardConfigPageContainer />
                            }
                          />
                          <Route
                            path="/s/:streamer/bulkwhisper"
                            element={
                              <BulkWhisperPageContainer />
                            }
                          />
                          <Route
                            path="/s/:streamer/twitchplus"
                            element={
                              <TwitchPlusStatusPage />
                            }
                          />
                          <Route
                            path="/youtubetest"
                            element={
                              <GoogleOAuthProvider clientId={HoagieToolsStreamChatsClientId}>
                                <MultiModPage />
                              </GoogleOAuthProvider>
                            }
                          />
                          <Route
                            path="/loginRedirectYoutube"
                            element={
                              <LoginRedirectYoutube />
                            }
                          />
                          <Route
                            path="*"
                            element={
                              <NotFound />
                            }
                          />
                        </Routes>
                      </Router>
                    </SystemStatusContextProvider>
                  </HoagieUserDataContextProvider>
                </ModListContextProvider>
              </StateContextProvider>
            </LoginContextProvider>
          </div>
        </ThemeProvider>
      </StyledEngineProvider>
    </DarkModeContext.Provider>
  );
}

export default App;
