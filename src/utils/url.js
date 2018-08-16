import URLSearchParams from 'url-search-params';

export default class Url {
  static getSearchParams(search) {
    if (!search) {
      return undefined;
    }

    let searchString = search;
    if (search[0] === '?') {
      searchString = searchString.substring(1);
    }

    return new URLSearchParams(searchString);
  }

  static combineSource = (currSearch, targetSearch) => {
    if (!currSearch) {
      return targetSearch;
    }

    let searchString = currSearch;
    if (searchString[0] === '?') {
      searchString = searchString.substring(1);
    }

    const searchParams = new URLSearchParams(searchString);

    if (!searchParams.get('source')) {
      return targetSearch;
    }

    if (!targetSearch) {
      return `source=${searchParams.get('source')}`;
    }

    return `${targetSearch}&source=${searchParams.get('source')}`;
  };
}
