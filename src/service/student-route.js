import MobileDetect from 'mobile-detect';

import { VALUE } from '../constants';

export default class StudentRoute {
  static toTeacherDetails(id) {
    const md = new MobileDetect(navigator.userAgent);

    if (md.os() === VALUE.ANDORID_OS) {
      window.location = `jiayouxueba://com.xiaoyu.com.xueba/app/student/teacherdetail?teacherId=${id}`;
    }

    if (md.os() === VALUE.IOS) {
      window.location = `jiayouxueba://com.xiaoyu.com.xueba/stu/teaDetail?teacherId=${id}&detailSource=4`;
    }
  }

  static toCourseDetails(id) {
    const md = new MobileDetect(navigator.userAgent);

    if (md.os() === VALUE.ANDORID_OS) {
      window.location = `jiayouxueba://com.xiaoyu.com.xueba/app/teacher/classcourse_detail_tobuy?courseId=${id}`;
    }

    if (md.os() === VALUE.IOS) {
      window.location = `jiayouxueba://com.xiaoyu.com.xueba/stu/courseDetail?routeName=StudentBuyClass&moduleName=ClassCourse&courseId=${id}`;
    }
  }
}
