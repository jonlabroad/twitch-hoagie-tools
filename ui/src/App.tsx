import { MainPage } from './components/MainPage';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { LoginRedirect } from './components/LoginRedirect';

import { StreamerDashboard } from './components/auth/StreamerDashboard';
import { SpotifyConfig } from './components/spotify/SpotifyConfig';
import { DonoPage } from './components/dono/DonoPage';

import 'fontsource-roboto';
import { AdminPage } from './components/admin/AdminPage';
import { HoagieDashboard } from './components/hoagie/HoagieDashboard';
import { createTheme, ThemeProvider, Theme, StyledEngineProvider, adaptV4Theme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { DarkModeContext } from './components/DarkModeSwitch';
import LocalStorage from './util/LocalStorage';
import { StreamerConfigPage } from './components/config/StreamerConfigPage';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false)

  useEffect(() => {
    const preference = LocalStorage.get("darkMode")
    setDarkMode(preference === "true")
  }, [])

  const theme = useMemo(() => {
    return createTheme(adaptV4Theme({
      palette: {
        mode: darkMode ? "dark" : "light",
        primary: {
          //main: "#3A5639"
          main: "#538D5B"
        },
        secondary: {
          //main: "#F05D01"
          main: "#F86624"
        },
      }
    }));
  },
    [darkMode])

  useEffect(() => {
    async function savePreference() {
      LocalStorage.set("darkMode", darkMode)
    }
    savePreference()
  }, [darkMode])

  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode: (val: boolean) => setDarkMode(val) }}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="App">
            <Router>
              <Switch>
                <Route path="/s/:streamer">
                  <MainPage />
                </Route>
                <Route path="/loginRedirect">
                  <LoginRedirect />
                </Route>
                {/*
                <Route path="/config/thesongery">
                  <StreamerDashboard
                    streamerName="thesongery"
                    scopes={"channel:read:redemptions"}
                  />
                </Route>
                <Route path="/config/hoagieman5000">
                  <StreamerDashboard
                    streamerName="hoagieman5000"
                    scopes={"channel:read:redemptions"}
                  />
                </Route>
                */}
                <Route path="/config/:streamer">
                  <StreamerConfigPage />
                </Route>
                <Route path="/dono/:streamer">
                  <DonoPage />
                </Route>
                <Route path="/spotify/config">
                  <SpotifyConfig />
                </Route>
                <Route path="/admin">
                  <AdminPage />
                </Route>
                <Route path="/hoagie">
                  <HoagieDashboard
                    streamerName="hoagieman5000"
                    scopes={"channel:read:subscriptions bits:read"}
                  />
                </Route>
              </Switch>
            </Router>
          </div>
        </ThemeProvider>
      </StyledEngineProvider>
    </DarkModeContext.Provider>
  );
}

export default App;
