import {App} from './appComponents.jsx'
import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter } from 'react-router-dom';

var SHOWUSERS = process.env.SHOWUSERS;
const features = {
  showUsers: SHOWUSERS
}


ReactDOM.render(<BrowserRouter><App features={features}/></BrowserRouter>, document.getElementById("world"));

module.hot.accept();


