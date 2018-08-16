import MobileDetect from 'mobile-detect';

import { VALUE } from '../constants';

export default class StudentRoute {
  static toCreateCourse() {
    if (window.WinNativeBridge) {
      window.WinNativeBridge.toCreateCourse();
      return;
    }

    const md = new MobileDetect(navigator.userAgent);

    if (md.os() === VALUE.ANDORID_OS) {
      window.location = `jiayouxueba://com.xiaoyu.com.xueba/rn/webapp?bundleName=classcourse&showModuleName=ClassCourse&routeName=TeacherCreatClassOne`;
    }

    if (md.os() === VALUE.IOS) {
      window.location = `jiayouxueba://com.xiaoyu.com.xueba/rnContainerVC?moduleName=ClassCourse&routeName=TeacherCreatClassOne`;
    }
  }

  static toGrabOrders() {
    if (window.WinNativeBridge) {
      window.WinNativeBridge.toGrabOrders();
      return;
    }

    const md = new MobileDetect(navigator.userAgent);

    if (md.os() === VALUE.ANDORID_OS) {
      window.location = `jiayouxueba://com.xiaoyu.com.xueba/app/teacher/main?showPage=grab`;
    }

    if (md.os() === VALUE.IOS) {
      window.location = `jiayouxueba://com.xiaoyu.com.xueba/tea/home`;
    }
  }

  static toTeacherHome() {

    const md = new MobileDetect(navigator.userAgent);

    if (md.os() === VALUE.ANDORID_OS) {
      window.location = `xqs://m.xy.com/app/teacher_main?type=0`;
    }

    if (md.os() === VALUE.IOS) {
      window.location = `xiaoqishen://com.xiaoyuxiaoyu.xiaoqishen/XQSTeacherHomeProvider/XQSTeacherHomeViewController`;
    }
  }

}
