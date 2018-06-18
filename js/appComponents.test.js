import React from 'react';
import {App, AppForDB, FileReader} from './appComponents.jsx';
// import axios from 'axios';

import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });
import { shallow, mount, render } from 'enzyme';
import { getUrl } from './helpers.jsx';

import { dummyDatabases } from './dummyApi.js';

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

const fakeUser = {"subscriptionTime":"2018-04-17T15:38:19.739013Z","userId":"a@a.com","name":null}

test('The file reader is shown only if a user is logged in', () => {
  const wrapper = mount(<App features={features}/>);
  expect(wrapper.find(FileReader)).toHaveLength(0);
  wrapper.instance().updateUser({data: fakeUser});
  wrapper.update();
  expect(wrapper.find(FileReader)).toHaveLength(1);
});
