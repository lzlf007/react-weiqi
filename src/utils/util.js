import { DateTime } from 'luxon';

export default class Util {
  static formatedStartTime(options) {
    let formatedStartTime;
    const startDateTime = DateTime.fromMillis(options.startTime * 1000);
    formatedStartTime = startDateTime.toFormat('yyyy年M月d日');
    return formatedStartTime;
  }

  static formatedEndTime(options) {
    let formatedEndTime;
    const endDateTime = DateTime.fromMillis(options.endTime * 1000);
    const startDateTime = DateTime.fromMillis(options.startTime * 1000);
    formatedEndTime =
      startDateTime.year === endDateTime.year ? endDateTime.toFormat('M月d日') : endDateTime.toFormat('yyyy年M月d日');
    return formatedEndTime;
  }
  static getRequest(opt) {
    // 获取url参数
    if (opt) {
      let url = opt.substr(1),
        arr = url.split('&'),
        len = arr.length,
        i = 0,
        request = {};
      for (; i < len; i++) {
        request[arr[i].split('=')[0]] = arr[i].split('=')[1];
      }
      return request;
    }
  }
  static getMonthData() {
    return [
      { id: 1, month: '一' },
      { id: 2, month: '二' },
      { id: 3, month: '三' },
      { id: 4, month: '四' },
      { id: 5, month: '五' },
      { id: 6, month: '六' },
      { id: 7, month: '七' },
      { id: 8, month: '八' },
      { id: 9, month: '九' },
      { id: 10, month: '十' },
      { id: 11, month: '十一' },
      { id: 12, month: '十二' }
    ];
  }
  static courseNameTxtHander(opts) {
    let courseNameTxt;
    const { courseName, courseStatus, remainder } = opts;
    if (courseStatus === 'in_use' || courseStatus === 'end' || remainder <= 0) {
      courseNameTxt = `课程回放-${courseName}`;
    } else {
      courseNameTxt = courseName;
    }
    return courseNameTxt;
  }

  static paymentTipHander(opts) {
    let paymentTip;
    const { courseStatus, remainder } = opts;
    if (courseStatus === 'end') {
      paymentTip = '由于该班课已经全部结束，您只能购买该课程的课程回放，购买课程回放之后不支持退费';
    } else if (remainder <= 0) {
      paymentTip = '由于该班课已经满员，您只能购买该班课的课程回放，购买课程回放之后不支持退费';
    } else if (courseStatus === 'in_use') {
      paymentTip = '由于该班课已经开课，部分上完的课程，您只能购买课程回放，购买的课程回放部分不支持退费';
    } else {
      paymentTip = '为了保证班课正常运行，用户购买之后如果退费，平台将收取班课金额的10%作为手续费，敬请谅解~';
    }
    return paymentTip;
  }

  static setupWebViewJavascriptBridge (callback){
    if (window.WebViewJavascriptBridge) { return callback(window.WebViewJavascriptBridge); }
    if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback); }
    window.WVJBCallbacks = [callback];
    const WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    WVJBIframe.src = 'https://__bridge_loaded__';
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function () { document.documentElement.removeChild(WVJBIframe) }, 0)
  }

}
