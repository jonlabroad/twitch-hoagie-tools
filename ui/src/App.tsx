import React from 'react';
import logo from './logo.svg';
import './App.css';
import { SimpleChatDisplay } from './components/chat/SimpleChatDisplay';
import { MainPage } from './components/MainPage';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/s/:streamer">
            <MainPage />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
