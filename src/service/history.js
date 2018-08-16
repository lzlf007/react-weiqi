import createHashHistory from 'history/createHashHistory';
import { Url } from '../utils';

const History = createHashHistory();

History.listen(location => {
  document.getElementById('root').scrollTop = 0;
});

History.pushWithSource = params => {
  let { search } = params;

  search = Url.combineSource(History.location.search, search);

  History.push(Object.assign(params, { search }));
};

History.replaceWithSource = params => {
  let { search } = params;

  search = Url.combineSource(search);

  History.replace(Object.assign(params, { search }));
};

export default History;
