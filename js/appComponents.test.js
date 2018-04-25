import React from 'react';
import {App, FileReader} from './appComponents.jsx';
import {Test1, Test2} from './components/testComponents.jsx';

import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';

configure({ adapter: new Adapter() });
import { shallow, mount, render } from 'enzyme';
import { axios } from './api.js';

// test('if there are no databases in the api, the app displays an error message', () => {
//   mockApi(testApis.empty);
// });

test('test displays correctly', () => {
  const wrapper = shallow(<Test1 />);
  expect(wrapper.find('p').text()).toEqual('hi');
});

test('If no database is selected, the "Tournament" selector does not show"', () => {
  const wrapper = mount(<App />);
  expect(wrapper.text()).not.toContain('Tournament');
});

test('If database is selected, the "Tournament" selector shows"', () => {
  const wrapper = mount(<App />);
  wrapper.setState({db: 'test'});
  expect(wrapper.text()).toContain('Tournament');
});

var MockAdapter = require('axios-mock-adapter');
var mock = new MockAdapter(axios);
const databaseUrl = '/snap/api/databases'
const fakeDatabases = [
  {id: 1, name: 'test1'},
  {id: 2, name: 'test2'}
];
mock.onGet(databaseUrl).reply(200, fakeDatabases);

test('the api returns the right vale', () => {
  expect.assertions(1);
  const handler = data => expect(data.data).toBe(fakeDatabases);
  return axios.get(databaseUrl).then(handler)
});

test('If App is started, the databases are not immediately available', () => {
  const wrapper = mount(<App />);
  expect(wrapper.text()).not.toContain(fakeDatabases[0].name);
});

test('If App is started, the databases will eventually show', done => {
  const mockedCallback = () => Promise.resolve({data: fakeDatabases});
  let promise;
  const loadData = () => {
    promise = Promise.resolve().then(mockedCallback);
    return promise;
  }
  var wrapper = mount(<App getDatabaseData={ loadData }/>);
  const afterLoad = () => {
    expect.assertions(1);
    wrapper.update();
    expect(wrapper.text()).toContain(fakeDatabases[0].name);
    done();
  };
  return promise.then(afterLoad);
});


const fakeUser = {"subscriptionTime":"2018-04-17T15:38:19.739013Z","userId":"a@a.com","name":null}

test('The file reader is shown only if a user is logged in', () => {
  const wrapper = mount(<App/>);
  expect(wrapper.find(FileReader)).toHaveLength(0);
  wrapper.instance().updateUser({data: fakeUser});
  wrapper.update();
  expect(wrapper.find(FileReader)).toHaveLength(1);
});
