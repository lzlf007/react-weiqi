export default class ObjectHelper {
  static serialize(params) {
    if (typeof params !== 'object') {
      return '';
    }
    return Object.keys(params)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      .join('&');
  }
}
