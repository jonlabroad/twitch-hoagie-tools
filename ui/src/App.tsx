import { MainPage } from './components/MainPage';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { LoginRedirect } from './components/LoginRedirect';

import 'fontsource-roboto';


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
        </Switch>
      </Router>
    </div>
  );
}

export default App;
