import wx from 'weixin-js-sdk';
import URLSearchParams from 'url-search-params';

import { API, WECHAT, REGEX, VALUE } from '../constants';
import { Fetch } from '../utils';

class WeChat {
  static isWeixinBrowser() {
    var ua = navigator.userAgent.toLowerCase();
    return REGEX.WECHAT_BROWSER.test(ua);
  }

  static hasCode() {
    return !!this.getCode();
  }

  static getCode() {
    if (window.location.search) {
      const searchString = window.location.search.substring(1);
      const urlParams = new URLSearchParams(searchString);

      return urlParams.get(VALUE.WECHAT_URL_PARAM_NAME);
    }

    return '';
  }

  static authorize() {
    const currentUrl = encodeURIComponent(window.location.href);

    const url =
      `https://open.weixin.qq.com/connect/oauth2/authorize?` +
      `appid=${WECHAT.SERVICE_ID}` +
      `&redirect_uri=${currentUrl}` +
      `&response_type=code` +
      `&scope=snsapi_userinfo` +
      `#wechat_redirect`;

    window.location.replace(url);
  }

  static sign() {
    Fetch.post(API.WECHAT_SIGN, {
      url: WECHAT.SIGN_URL,
      service: 1
    }).then(data => {
      wx.config({
        appId: WECHAT.SERVICE_ID,
        timestamp: data.timestamp,
        nonceStr: data.nonceStr,
        signature: data.signature,
        jsApiList: ['onMenuShareAppMessage', 'onMenuShareTimeline', 'chooseWXPay']
      });
    });
  }

  static getOpenId() {
    return Fetch.get(API.OPEN_ID, { code: this.getCode() });
  }

  static share(params) {
    if (!this.isWeixinBrowser()) {
      return;
    }

    const default_params = {
      title: WECHAT.TITLE,
      desc: WECHAT.DESC,
      link: WECHAT.LINK,
      imgUrl: WECHAT.IMAGE_URL
    };

    const wechat_params = Object.assign(default_params, params);

    wx.ready(function() {
      wx.onMenuShareTimeline(wechat_params);
      wx.onMenuShareAppMessage(wechat_params);
    });
  }

  static pay(params, onSuccess, onFail) {
    wx.ready(function() {
      wx.chooseWXPay({
        timestamp: params.timeStamp,
        nonceStr: params.nonceStr,
        package: params.package,
        signType: params.signType,
        paySign: params.paySign,
        success: onSuccess,
        onFail: onFail
      });
    });
  }

  // static sign(params) {
  //   if (!this.isWeixinBrowser()) {
  //     return;
  //   }

  //   const default_params = {
  //     title: WECHAT.title,
  //     desc: WECHAT.desc,
  //     link: WECHAT.link,
  //     imgUrl: WECHAT.imageUrl
  //   };

  //   const wechat_params = Object.assign(default_params, params);

  //   wx.ready(function() {
  //     wx.onMenuShareTimeline(wechat_params);
  //     wx.onMenuShareAppMessage(wechat_params);
  //   });

  //   Fetch.post(API.WECHAT_SIGN, {
  //     url: WECHAT.signUrl
  //   }).then(json => {
  //     wx.config({
  //       appId: WECHAT.id,
  //       timestamp: json.data.timestamp,
  //       nonceStr: json.data.nonceStr,
  //       signature: json.data.signature,
  //       jsApiList: ['onMenuShareAppMessage', 'onMenuShareTimeline']
  //     });
  //   });
  // }
}

export default WeChat;
