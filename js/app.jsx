import { app } from './appComponents.jsx'
import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter } from 'react-router-dom';

var SHOWUSERS = process.env.SHOWUSERS;
const features = {
  showUsers: SHOWUSERS
}

ReactDOM.render(app(features), document.getElementById("world"));
module.hot.accept();


