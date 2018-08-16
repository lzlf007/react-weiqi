import engine from 'store/src/store-engine';

import LocalStorage from 'store/storages/localStorage';
import SessionStorage from 'store/storages/sessionStorage';
import CookieStorage from 'store/storages/cookieStorage';

export default {
  localStorage: engine.createStore([LocalStorage]),
  sessionStorage: engine.createStore([SessionStorage]),
  cookieStorage: engine.createStore([CookieStorage])
};
