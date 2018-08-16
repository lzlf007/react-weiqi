import React from 'react';
import ReactDOM from 'react-dom';

import 'normalize.css';
import 'lib-flexible';
import '$src/assets/css/common.scss';
import App from './routers';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
