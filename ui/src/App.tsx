import { MainPage } from './components/MainPage';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { LoginRedirect } from './components/LoginRedirect';

import { StreamerDashboard } from './components/auth/StreamerDashboard';
import { SpotifyConfig } from './components/spotify/SpotifyConfig';
import { DonoPage } from './components/dono/DonoPage';

import 'fontsource-roboto';
import { AdminPage } from './components/admin/AdminPage';
import { HoagieDashboard } from './components/hoagie/HoagieDashboard';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { CssBaseline } from '@material-ui/core';
import { useMemo, useState } from 'react';
import { DarkModeContext } from './components/DarkModeSwitch';

function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false)

  const theme = useMemo(() => createMuiTheme({
    palette: {
      type: darkMode ? "dark" : "light",
      primary: {
        main: "#3A5639"
      },
      secondary: {
        main: "#F05D01"
      },
    }
  }),
  [darkMode])

  return (
    <DarkModeContext.Provider value={{darkMode, setDarkMode: (val: boolean) => setDarkMode(val)}}>
      <MuiThemeProvider theme={theme}>
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
      </MuiThemeProvider>
    </DarkModeContext.Provider>
  );
}

export default App;
