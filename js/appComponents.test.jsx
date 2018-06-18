import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });
import { shallow, mount, render } from 'enzyme';

import React from 'react';
import {App, AppForDB, FileReader} from './appComponents.jsx';

import { getUrl } from './helpers.jsx';

import { dummyUser, dummyDatabases } from './dummyApi.js';

/* Mocking out the context. Axios is mocked out by default 
(this must be a Jest default, because both modules contain __mock__ files
but only axios is mocked out by default) */
jest.mock('./Context')

const features = {
  showUsers: true
}

test('If no database is selected, the "Tournament" selector does not show"', () => {
  const wrapper = mount(<App features={features}/>);
  expect(wrapper.text()).not.toContain('Tournament');
});

test('If database is selected, the "Tournament" selector shows"', () => {
  const wrapper = mount(<App features={features}/>);
	const db = dummyDatabases[0];
  wrapper.instance().locSetter({db: db});
	wrapper.update();
  expect(wrapper.text()).toContain('Tournament');
});


test('The file reader is shown only if a user is logged in', () => {
  const wrapper = mount(<App features={features}/>);
  expect(wrapper.find(FileReader)).toHaveLength(0);
  wrapper.instance().updateUser({data: dummyUser});
  wrapper.update();
  expect(wrapper.find(FileReader)).toHaveLength(1);
});

