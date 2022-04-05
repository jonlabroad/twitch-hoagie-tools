import { MainPage } from './components/MainPage';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { LoginRedirect } from './components/LoginRedirect';

import { StreamerDashboard } from './components/auth/StreamerDashboard';
import { SpotifyConfig } from './components/spotify/SpotifyConfig';
import { DonoPage } from './components/dono/DonoPage';

import 'fontsource-roboto';
import { AdminPage } from './components/admin/AdminPage';
import { HoagieDashboard } from './components/hoagie/HoagieDashboard';

function App() {
  return (
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
  );
}

export default App;
