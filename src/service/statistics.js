import UUID from 'uuid/v4';
import URLSearchParams from 'url-search-params';

import { Fetch, Store } from '../utils';
import { API } from '../constants';
import { WeChat, History } from '.';

export default class Statistics {
  static view(pathname) {
    let params = {
      sourceUrl: this.getVirtualUrl(pathname),
      userId: '',
      actionType: '',
      userType: '',
      extId: '',
      extType: ''
    };

    if (WeChat.isWeixinBrowser()) {
      params.userId = this.getUUID();
    }

    return Fetch.post(API.STATISTICS_VIEW, params);
  }

  static operate(action) {
    let params = { userId: -1 };

    params.channel = WeChat.isWeixinBrowser() ? 'wechat' : 'app';
    params.source = this.getSource() ? this.getSource() : 'null';
    params.actionType = action;

    if (WeChat.isWeixinBrowser()) {
      params.userId = this.getUUID();
    }

    return Fetch.post(API.STATISTICS_OPERATE, params);
  }

  static getVirtualUrl = customPathName => {
    const { origin, pathname } = window.location;
    const { pathname: vpathname, search: vsearch } = History.location;

    const from = WeChat.isWeixinBrowser() ? 'wechat' : 'app';

    let url = `${origin}${pathname}#${customPathName || vpathname}${vsearch}`;

    if (vsearch === '') {
      url = `${url}?from=${from}`;
    } else {
      url = `${url}&from=${from}`;
    }

    return url;
  };

  static getSource = () => {
    const { search } = History.location;

    if (!search) {
      return '';
    }

    let searchString = search;
    if (searchString[0] === '?') {
      searchString = searchString.substring(1);
    }

    const searchParams = new URLSearchParams(searchString);

    if (!searchParams.get('source')) {
      return '';
    }

    return searchParams.get('source');
  };

  static getUUID = () => {
    if (!Store.localStorage.get('uuid')) {
      Store.localStorage.set('uuid', UUID());
    }

    return Store.localStorage.get('uuid');
  };
}
