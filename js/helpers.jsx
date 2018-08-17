import qs from 'qs';
import axios from 'axios';

export const objectIsEmpty = (obj) => obj == null || Object.keys(obj).length === 0 && obj.constructor === Object; 

export const avg = vals => {
  var total = 0;
  for(var i = 0; i < vals.length; i++) {
    total += vals[i];
  }
  return (total / vals.length);
};

const shortLengthMax = 10;
const shortenName = name => name.length <= shortLengthMax ? name : name.substring(0, shortLengthMax - 3) + '...';

export const playerName = player => player.firstName + ' ' + player.lastName;
export const playerNameShort = player => shortenName(player.firstName) + ' ' + shortenName(player.lastName);

export const preparePlayerData = player => {
  var newPlayer = Object.assign(player); 
  newPlayer['name'] = playerName(player);
  return newPlayer;
};

/* Helper functions for logging in and out. This is extracted out into this module because we want
to be able to call this function for debugging in addition to calling it at part of a login window */
export const loginConsts = {
  register: 1,
  login: 2,
};

export var loginData = {};
loginData[loginConsts.register] = {url: 'register', name: 'Register',};
loginData[loginConsts.login] = {url: 'login', name: 'Log in',};

export const loginOrRegisterUser = (loginType, email, password, callback, failCallback) => {
  const data = {email: email, password: password,};
  const url = getUrl(loginData[loginType].url);
  axios.post(url, qs.stringify(data)).then(callback).catch(failCallback);
};

export const loginDummyUser = callback => loginOrRegisterUser(loginConsts.login, 'a@a.com', 'a', callback);
export const logout = callback => axios.get(getUrl('logout')).then(callback).catch(() => {});
export const getUser = callback => axios.get(getUrl('api/user')).then(callback).catch(() => {});

export const resultPanels = {
  gameList: 'Games',
  statistics: 'Statistics',
  blunders: 'Blunders',
};

export const updateLoc = (loc, name, value) => {
  var newLoc = { ...loc,}; 
  newLoc[name] = value;
  if (name == 'db' && value == null){
    newLoc = defaultLoc;
  }
  if (name == 'db' && value != null){
    newLoc.showType = resultPanels.gameList;
    newLoc.game = null;
  }
  if (name == 'showType'){
    newLoc.game = null;
  }
  if (name == 'game'){
    newLoc.showType = resultPanels.gameList;
  }
  return newLoc;
};

export const getUrl = (loc) => {
  var BACKENDURL = process.env.BACKENDURL;
  if (BACKENDURL == undefined){
    BACKENDURL = 'snap_prod';
  }
  
  return '/' + BACKENDURL + '/' + loc;
};

export const defaultLoc = {
  db: null,
  showType: null,
  game: null,
};

export const getUrlFromLoc = loc => {
  var url = '';
  if (loc.db != null){
    url += 'db=' + loc.db;
    if (loc.showType != null){
      url += '/panel=' + loc.showType;
      if (loc.game != null){
        url += '/game=' + loc.game;
      }
    }
  }
  return url;
};

export const getLocFromUrl = url => {
  const components = url.split('/');
  var db = null;
  var showType = null;
  var game = null;
  if (components.length >= 1){
    db = parseInt(components[0].split('=')[1]) || null;
    if (components.length >= 2){
      showType = components[1].split('=')[1];
    }
    if (components.length >= 3){
      game = parseInt(components[2].split('=')[1]) || null;
    }
  }
  return {db: db, showType: showType, game: game,};
};

const gameResult = resultInt => resultInt == -1 ? '0-1' : resultInt == 0 ? '1/2-1/2' : '1-0';

export const cleanGameData = data => {
  const getByAttribute = type => data => {
    const results = data.filter(att => att.attribute == type);
    return results.length > 0 ? results[0].value : '';
  };
  const cleaned = {
    'id': data.gameDataGame.id,
    'whiteShort': playerNameShort(data.gameDataPlayerWhite),
    'blackShort': playerNameShort(data.gameDataPlayerBlack),
    'white': playerName(data.gameDataPlayerWhite),
    'black': playerName(data.gameDataPlayerBlack),
    'result': gameResult(data.gameDataGame.gameResult),
    'tournament': data.gameDataTournament.name,
    'opening': ('gameDataOpening' in data && data.gameDataOpening != null) ? (data.gameDataOpening.variationName || '') : '',
    'openingLine': ('gameDataOpeningLine' in data && data.gameDataOpeningLine != null) ? (data.gameDataOpeningLine.name || '') : '',
    'pgn': data.gameDataGame.pgn,
    'date': getByAttribute('Date')(data.gameDataAttributes),
  };
  return cleaned;
};

export const getGameDataOpenings = gameData => {
  const getOpening = game => {
    if (game.gameDataOpeningLine == null) return null;
    const data = {
      name: game.gameDataOpeningLine.name,
      id: game.gameDataOpeningLine.name,
    };
    return data;
  };
  return gameData.map(getOpening).filter(d => d != null).filter(d => d.name != undefined);
};

export const getOpenings = gameData => {
  const getOpening = game => {
    if (game.openingLine == '') return null;
    const data = {
      name: game.openingLine,
      id: game.openingLine,
    };
    return data;
  };
  return gameData.map(getOpening).filter(d => d != null).filter(d => d.name != undefined);
};

export const getActiveSelection = (state, baseSelection=null) => {
  if (baseSelection == null) return null;
  const allTournaments = state.tournamentData.data;
  const allPlayers = state.playerData.data;
  const allGames = state.gamesData.data;
  const allOpenings = getGameDataOpenings(allGames);

  const datas = {openings: allOpenings, players: allPlayers, tournaments: allTournaments,};

  var selection = {};
  for (var el of ['tournaments', 'players', 'openings',]){
    const ids = datas[el].map(x => x.id);
    selection[el] = baseSelection[el].length == 0 ? ids : baseSelection[el];
  }
  return selection;
};

