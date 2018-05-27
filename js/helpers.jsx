import React from 'react';
import qs from "qs";
import { axios } from './api.js'

export const objectIsEmpty = (obj) => obj == null || Object.keys(obj).length === 0 && obj.constructor === Object 

export const avg = vals => {
  var total = 0;
  for(var i = 0; i < vals.length; i++) {
      total += vals[i];
  }
  return (total / vals.length);
}

export const playerName = player => player.lastName + (player.firstName.length == 0 ? '' : ', ' + player.firstName)

/* Helper functions for logging in and out. This is extracted out into this module because we want
to be able to call this function for debugging in addition to calling it at part of a login window */
export const loginConsts = {
  register: 1
, login: 2
};

export var loginData = {};
loginData[loginConsts.register] = {url: "register", name: "Register"};
loginData[loginConsts.login] = {url: "login", name: "Log in"};

export const loginOrRegisterUser = (loginType, email, password, callback) => {
  const data = {email: email, password: password}
  const url = getUrl(loginData[loginType].url);
  axios.post(url, qs.stringify(data)).then(callback);
};

export const loginDummyUser = callback => loginOrRegisterUser(loginConsts.login, "a@a.com", "a", callback);
export const logout = callback => axios.get(getUrl('logout')).then(callback);
export const getUser = callback => axios.get(getUrl('api/user')).then(callback);

export const exposeRouter = ComponentClass => {
  return class extends React.Component {
    constructor(props) { 
      super(props); 
    }
    render = () => {
      return <ComponentClass {...this.props} router={this.context.router}/>;
    }
  };
}
export var HOC = CL => class extends React.Component {
  constructor(props) { 
    super(props); 
  }
  render() {
    return <CL {...this.props}/>
  }
}

export const ThemeContext = React.createContext({
  loc: null
, locSetter: () => {}
});

export const defaultLoc = {
  db: null
, showType: null
, game: null
};

export const contextComp = Component => {
  return props => (
      <ThemeContext.Consumer>
        {context => <Component {...props} loc={context.loc} locSetter={context.locSetter}/>}
      </ThemeContext.Consumer>
  );
};

export const resultPanels = {
  gameList: "Games"
, statistics: "Statistics"
}

export const updateLoc = (loc, name, value) => {
  const newLoc = { ...loc} 
  newLoc[name] = value;
  if (name == "db" && value != null){
    newLoc.showType = resultPanels.gameList;
    newLoc.game = null;
  }
  if (name == "showType"){
    newLoc.game = null;
  }
  if (name == "game"){
    newLoc.showType = resultPanels.gameList;
  }
  return newLoc;
}

export const getUrl = (loc) => {
  return '/' + BACKENDURL + '/' + loc
}
