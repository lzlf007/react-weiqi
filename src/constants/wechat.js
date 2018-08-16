const env_object = {
  appId: {
    develop: 'wx9104ef38746f7fca',
    release: 'wx3fc913c72694b484'
  },
  serviceId: {
    develop: 'wxefd7cde620feb83e',
    release: 'wxadb455094e30886f'
  },
  qrcodeName: {
    develop: 'wechat-xiaoyu.png',
    release: 'wechat-jiayouxueba.png'
  }
};

export default {
  APP_ID: env_object.appId[process.env.REACT_APP_STAGE],
  SERVICE_ID: env_object.serviceId[process.env.REACT_APP_STAGE],
  QRCODE_NAME: env_object.qrcodeName[process.env.REACT_APP_STAGE],
  SIGN_URL: window.location.href.split('#')[0],

  TITLE: '小棋神的超值精品班课，你一定要来上！',
  DESC: '小棋神名师精品班课，名师在线互动授课，高效提分，轻松搞定学习！',
  IMAGE_URL: 'https://ohpi64xui.qnssl.com/static-pages/jyxb-logo.png',
  LINK: (() => {
    const { origin, pathname } = window.location;
    return `${origin}${pathname}#/student/index?source=shareinto`;
  })()
};
