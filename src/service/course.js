import { Fetch } from '../utils';
import { API } from '../constants';
import pako from 'pako';

function _base64ToArrayBuffer(base64) {
  var binary_string = window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    console.log(binary_string.charCodeAt(i));
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

function _base64ToArray(base64) {
  var binary_string = window.atob(base64);
  var len = binary_string.length;
  var bytes = [];
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

export default class Course {
  static getActivityConfig(type) {
    //const api = type === 1 ? `${API.ACTIVITY_CONFIG}?periodType=1` : API.CLASS_CONFIG;
    const api = `${API.ACTIVITY_CONFIG}${type}/config/v2`;

    return Fetch.get(api);
  }

  static getTest() {
    const api = `http://7xs6uf.com2.z0.glb.qiniucdn.com/xiaoqishen_2573_1536907072160_tea.gz`;
    fetch(api, { method: 'get' })
      .then(value => value.arrayBuffer())
      .then(response => {
        console.log(response);
        //let byteArray = [];
        //let  dataview = new DataView(response);
        let attr = new Uint8Array(response);
        //console.log(dataview);
        /*for (var i = 0; i < attr.length; i++) {
          //console.log(dataview.getUint8(i * 1));
          console.log(attr[i]);
          //byteArray.push(attr[i].charCodeAt(0) & 0xff)
        }*/

        //console.log(byteArray);
        const unAttr = pako.ungzip(attr);

        const b64 =
          'H4sIAAAAAAAAExNgYGDQYWVgcAQCp/R8Rwkgf6MIhO9cbuDkCAG2MkBxdwmIuEt5uZNjOYgVWOkXklylApTrhcq5BcHk8iv8QnyN/EMcjX1dkisASKbecGgAAAA=';

        //console.log(unAttr);

        //console.log(pako.inflate(attr, {to: 'string'}));

        //var decoder = new TextDecoder('utf8');
        //var b64encoded = decodeURIComponent(window.btoa(decoder.decode(unAttr)));

        //console.log(b64encoded);
        //console.log(window.btoa(encodeURIComponent('中文')));
        //console.log(decodeURIComponent(window.atob('JUU0JUI4JUFEJUU2JTk2JTg3')));

        //console.log(new TextDecoder("utf-8").decode(unAttr));
        //console.log(encodeURI(window.atob(pako.inflate(attr, {to: 'string'}))));
        //console.log(Utf8ArrayToStr(unAttr));

        /*var responseString = new TextDecoder().decode(pako.ungzip(attr));
        responseString = responseString.replace(/&#\d{2};/g, "");
        console.log(responseString);*/

        //console.log(str2ab("abc"));

        console.log(unAttr);

        //var gzip = [16, 0, 0, 0, 44, 5, 0, 0, 65, 65, 65, 65, 66, 103, 111, 65, 24, 0, 0, 0, 177, 20, 0, 0, 65, 65, 65, 65, 67, 119, 48, 66, 65, 65, 65, 65, 65, 65, 65, 61, 28, 0, 0, 0, 71, 24, 0, 0, 65, 65, 65, 65, 68, 119, 119, 66, 65, 119, 65, 65, 65, 65, 81, 121, 78, 84, 99, 122, 36, 0, 0, 0, 141, 24, 0, 0, 65, 65, 65, 65, 70, 82, 119, 66, 65, 119, 65, 65, 65, 65, 111, 120, 78, 84, 77, 50, 79, 84, 65, 51,77,68,99,120] // 1.txt.gz > "#4CAF50"
        //var byteArray = new Uint8Array(gzip);
        //console.log(pako.inflate(byteArray, {to: 'string'}));
        /*
        var binary = '';
        var len = unAttr.byteLength;
        for (var i = 0; i < len; i++) {
          binary += String.fromCharCode( unAttr[ i ] );
        }
        console.log(binary);
        console.log(window.btoa( binary ));
        console.log(new TextDecoder().decode(unAttr[i]));*/

        //console.log(new TextDecoder("utf-8").decode(unAttr));

        var gzip = [65, 65, 65, 65, 66, 103, 111, 65]; // 1.txt.gz > "#4CAF50"
        var byteArray = new Uint8Array(gzip);
        console.log(new TextDecoder('utf-8').decode(byteArray));
        //console.log(stringToBytes('AAAABgoA'));
        console.log(_base64ToArray('AAAABgoA'));

        // 0 0 0 0
        // 00000000 00000000 00000000
        //    1         32         40     0
        // 00000001  00100000   00101000  00000000
        // [0, 0, 0, 6, 10, 0]
      })
      .catch(err => {
        console.log(err);
      });
  }
}
