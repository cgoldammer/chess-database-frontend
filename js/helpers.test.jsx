import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });
import { shallow, mount, render } from 'enzyme';

import { getLocFromUrl, getUrlFromLoc } from './helpers.jsx';

test('Missing db is handled correctly', () => {
  const url=''
  const loc = getLocFromUrl(url);
  expect(loc.db).toEqual(null);
})

test('I can obtain db from url', () => {
  const url='db=1'
  const loc = getLocFromUrl(url);
  expect(loc.db).toEqual(1);
})

test('I can obtain multiple locs from url', () => {
  const url='db=1/showType=something/game=12'
  const loc = getLocFromUrl(url);
  expect(loc.db).toEqual(1);
  expect(loc.game).toEqual(12);
  expect(loc.showType).toEqual('something');
})

test('I can obtain the URL from the location', () => {
  const loc = {db: 1, showType: 'something', game: 2}
  const url = getUrlFromLoc(loc);
  expect(url).toEqual('db=1/showType=something/game=2')
})
