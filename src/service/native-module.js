import MobileDetect from 'mobile-detect';
import { VALUE } from '../constants';
import StudentRoute from './student-route';
import TeacherRoute from './teacher-route';
import { Util } from '../utils';

export default class NativeModule {
  static StudentRoute = StudentRoute;
  static TeacherRoute = TeacherRoute;

  static disableAndroidPullToRefresh() {
    window.HostApp.setRefreshEnabled(false);
    /*const webview = window.ShowWebViewActivity;

    if (!webview || !webview.stopPullToRefresh) {
      return;
    }

    webview.stopPullToRefresh(true);*/
  }

  static share(params) {
    const md = new MobileDetect(navigator.userAgent);

    if (md.os() === VALUE.ANDORID_OS && window.HostApp) {
      //window.ShowWebViewActivity.showShareDialog(params.title, params.desc, params.url, params.pic);
      window.HostApp.shareDialog(
        params.title,
        params.desc,
        params.url,
        params.pic
      );
    }

    if (md.os() === VALUE.IOS) {
      /*window.location = `jiayouxueba://com.xiaoyu.com.xueba/webShare?desc=${params.desc}&pic=${params.pic}&title=${
        params.title
      }&url=${params.url}`;*/
      // 获取 token
      /*const shareParams = {
        'title':params.title,
        'desc':params.desc,
        'urlString':params.url,
        'thumbUrl':params.pic
      };*/
      Util.setupWebViewJavascriptBridge(bridge => {
        bridge.callHandler(
          'xqs_sendLinkContent',
          {
            title: params.title,
            desc: params.desc,
            urlString: params.url,
            thumbUrl: params.pic
          },
          res => {
            console.log(res);
          }
        );
      });
    }
  }

  static isDesktopApp() {
    return !!window.WinNativeBridge;
  }
}
