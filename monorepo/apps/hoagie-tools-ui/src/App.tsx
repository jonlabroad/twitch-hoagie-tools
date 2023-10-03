import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { LoginRedirect } from "./components/LoginRedirect";

import { StreamerDashboard } from "./components/auth/StreamerDashboard";
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
import { DashboardV2 } from "./components/DashboardV2";
import { StateContextProvider } from "./components/context/StateContextProvider";
import { PageHeader } from "./components/PageHeader";
import Config from "./Config";
import { LoginContextProvider } from "./components/context/LoginContextProvider";
import { Redirect } from "./Redirect";
import { StreamerAdminPage } from "./components/config/StreamerAdminPage";
import { ModListContextProvider } from "./components/context/ModListContextProvider";
import { SystemStatusContextProvider } from "./components/context/SystemStatusContextProvider";

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
          <div className="App">
            <LoginContextProvider>
              <StateContextProvider>
                <ModListContextProvider>
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
                      </Routes>
                    </Router>
                  </SystemStatusContextProvider>
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
