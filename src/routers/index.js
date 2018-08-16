import React from 'react';
import { Router, Switch, Route } from 'react-router-dom';

import { History } from '../service';
import { AppContainer } from '../container';

import Home from './home';

const App = () => {
  return (
    <Router history={History}>
      <AppContainer>
        <Switch>
          <Route exact={true} path="/" component={Home} />
        </Switch>
      </AppContainer>
    </Router>
  );
};

export default App;
