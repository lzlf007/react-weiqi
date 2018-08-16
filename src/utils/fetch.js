import ObjectHelper from './object';
import { Store, EventEmitter } from '../utils';

function request(url, method, params, headers) {
  let body;

  const combineHeaders = Object.assign(
    {
      Accept: 'application/json'
    },
    ['POST', 'PUT'].indexOf(method) > -1
      ? {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      : {},
    headers,
    Store.localStorage.get('auth') ? { auth: Store.localStorage.get('auth') } : {},
    Store.localStorage.get('token') ? { token: Store.localStorage.get('token') } : {},
  );

  if (['GET', 'DELETE'].indexOf(method) > -1) {
    if (!!params) {
      url = `${url}?${ObjectHelper.serialize(params)}`;
    }
  } else {
    body = ObjectHelper.serialize(params);
  }

  return fetch(url, { method, body, headers: combineHeaders, mode: 'cors' });
}

export default class Fetch {
  static get(url, params, headers) {
    return this._request(url, 'GET', params, headers);
  }

  static post(url, params, headers) {
    return this._request(url, 'POST', params, headers);
  }

  static put(url, params, headers) {
    return this._request(url, 'PUT', params, headers);
  }

  static delete(url, params, headers) {
    return this._request(url, 'DELETE', params, headers);
  }

  static _request(url, method, params, headers) {
    EventEmitter.emit('fetch-show-loading');

    return request(url, method, params, headers)
      .then(value => value.json())
      .then(result => {
        EventEmitter.emit('fetch-hide-loading');

        if (result.code === 0) {
          return result.data;
        }

        const msg = result && result.msg ? result.msg : "网络异常，请稍侯再试！";
        EventEmitter.emit('fetch-error', msg);
        return {};
      });
  }
}
