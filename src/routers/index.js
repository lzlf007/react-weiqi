import React from 'react';
import { Router, Switch, Route } from 'react-router-dom';

import { History } from '../service';
import { AppContainer } from '../container';

import Home from './home';
import Chess from './chess';

const App = () => {
  return (
    <Router history={History}>
      <AppContainer>
        <Switch>
          <Route exact={true} path="/" component={Chess} />
          <Route exact={true} path="/weiqi" component={Home} />
        </Switch>
      </AppContainer>
    </Router>
  );
};

export default App;
