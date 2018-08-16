import { Fetch } from '../utils';
import { API } from '../constants';
import {WeChat} from "./index";

export default class Invite {
  static getShareData() {

    let params = {
      useType:'s2p',
      shareType:'appShare'
    };
    return Fetch.post(API.INVITE_DATA, params);
  }
}
