import { MainPage } from './components/MainPage';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { LoginRedirect } from './components/LoginRedirect';

import 'fontsource-roboto';
import { StreamerDashboard } from './components/auth/StreamerDashboard';
import { SpotifyConfig } from './components/spotify/SpotifyConfig';

const testStreamerName = "sashiboom";

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
          <Route path={`/config/${testStreamerName}`}>
            <StreamerDashboard
              streamerName={testStreamerName}
              scopes={"channel:read:redemptions"}
            />
          </Route>
          <Route path="/config/hoagieman5000">
            <StreamerDashboard
              streamerName="hoagieman5000"
              scopes={"channel:read:redemptions"}
            />
          </Route>
          <Route path="/spotify/config">
            <SpotifyConfig />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
