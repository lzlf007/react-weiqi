import { Fetch } from '../utils';
import { API } from '../constants';

export default class Course {
  static getActivityConfig(type) {
    //const api = type === 1 ? `${API.ACTIVITY_CONFIG}?periodType=1` : API.CLASS_CONFIG;
    const api = `${API.ACTIVITY_CONFIG}${type}/config`;

    return Fetch.get(api);
  }
}
