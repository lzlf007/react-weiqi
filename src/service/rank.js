import { Fetch } from '../utils';
import { API } from '../constants';

export default class Rank {
  static List(params) {
    const { actId, ...other } = params;

    /*return Fetch.get(type === 1 ? API.RANK_LIST : API.CLASS_RANK_LIST, other).then(result => {
      if (!Array.isArray(result) || result.length === 0) {
        return [];
      }

      return result.map(this.FormatRank);
    });*/
    return Fetch.get(`${API.RANK}${actId}/rank/list`, other).then(result => {
      if (!Array.isArray(result.data) || result.data.length === 0) {
        return [];
      }
      return result.data.map(this.FormatRank);
    });
  }

  static getMyRank(actId) {
    //return Fetch.get(type === 1 ? API.MY_RANK : API.CLASS_MY_RANK).then(this.FormatRank);
    return Fetch.get(`${API.RANK}${actId}/self`).then(this.FormatRank);
  }

  static getMyPoints(params) {
    /*return Fetch.get(Number(type) === 1 ? API.POINTS_DETAIL : API.CLASS_POINTS_DETAIL).then(result => {
      if (!Array.isArray(result) || result.length === 0) {
        return [];
      }

      return result.map(elem => ({
        id: elem.id,
        name: elem.name,
        courseName: elem.title,
        points: elem.price,
        avatar: elem.portrait,
        startTime: elem.gmt_begin,
        endTime: elem.gmt_end
      }));
    });*/
    const { actId, ...other } = params;
    return Fetch.get(`${API.RANK}${actId}/score`,other).then(result => {
      if (!result.data || result.data.detail.length === 0) {
        return [];
      }
      return result;
    });
  }

  static FormatRank(elem) {
    if (!elem) {
      return null;
    }

    return {
      id: elem.id,
      name: elem.nickName,
      avatar: elem.portraitUrl,
      grade: elem.grade,
      subject: elem.subject,
      points: elem.score!==null && elem.score>0 ? elem.score : 0 ,
      rank: elem.rank,
      group: elem.gradeGroup,
      teacherId: elem.scholar_id
    };
  }
}
