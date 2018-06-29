import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });
import { shallow, mount, render } from 'enzyme';

import React from 'react';
import { dummyUser } from '../dummyApi.js';
import { Menu, UserDetail } from './Menu.jsx';

test('If the user is logged in, the menu shows a UserDetail', () => {
	const menu = (
    <Menu userCallback={ () => {} } user ={ dummyUser } showUserElements={ true }/>
  )
	const wrapper = mount(menu);
  expect(wrapper.text()).toContain("Account details");
});

test('If the user is not logged in, the menu shows a button to register', () => {
	const menu = (
    <Menu userCallback={ () => {} } user ={ null } showUserElements={ true }/>
  )
	const wrapper = mount(menu);
  expect(wrapper.text()).toContain("Register");
});
