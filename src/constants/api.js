const domainObject = {
  release: '//api.xiaoqishen.cn',
  preview: '//pre.xiaoqishen.cn',
  develop: '//dev.xiaoqishen.cn'
};

const domain = domainObject[process.env.REACT_APP_STAGE];

export default {
  INVITE_DATA: `${domain}/activity/external/share`,

  ACTIVITY_CONFIG: `${domain}/activity/external/course/activity/`, // 活动配置
  RANK: `${domain}/activity/external/course/activity/`, // 我的排名、全部排名

  POINTS_DETAIL: `${domain}/api/activity/class/online/grade-accumulate-score/details`,

  CLASS_CONFIG: `${domain}/api/activity/class/time/config`,
  CLASS_RANK_LIST: `${domain}/api/activity/class/teacher/popular-list`,
  CLASS_MY_RANK: `${domain}/api/activity/class/teacher/my-rank`,
  CLASS_POINTS_DETAIL: `${domain}/api/activity/class/accumulate-score/details`,

  STATISTICS_VIEW: `${domain}/jyxb-activity/external/activity/class/pv-uv`,
  STATISTICS_OPERATE: `${domain}/jyxb-activity/external/activity/class/hide-point`
};
