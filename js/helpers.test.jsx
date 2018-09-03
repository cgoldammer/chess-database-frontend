import {configure,} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({adapter: new Adapter(),});

import {getLocFromUrl, getUrlFromLoc, annotateMoves, } from './helpers.jsx';

test('Missing db is handled correctly', () => {
  const url='';
  const loc = getLocFromUrl(url);
  expect(loc.db).toEqual(null);
});

test('I can obtain db from url', () => {
  const url='db=1';
  const loc = getLocFromUrl(url);
  expect(loc.db).toEqual(1);
});

test('I can obtain multiple locs from url', () => {
  const url='db=1/showType=something/game=12';
  const loc = getLocFromUrl(url);
  expect(loc.db).toEqual(1);
  expect(loc.game).toEqual(12);
  expect(loc.showType).toEqual('something');
});

test('I can obtain the URL from the location', () => {
  const loc = {db: 1, showType: 'something', game: 2,};
  const url = getUrlFromLoc(loc);
  expect(url).toEqual('db=1/panel=something/game=2');
});

test('I can add annotations to moves', () => {
  const moves = [[1, 'e4', 'e5']];
  const eval1 = {eval: 100, moveNumber: 1, isWhite: true};
  const eval2 = {eval: -100, moveNumber: 1, isWhite: false};
  const evals = [eval1, eval2];
  const annotated = annotateMoves(moves, evals);
  expect(annotated).toEqual([[1, 'e4 (1.00)', 'e5 (-1.00)']]);
})
