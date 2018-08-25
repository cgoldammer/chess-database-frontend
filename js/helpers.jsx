import qs from 'qs';
import axios from 'axios';

export const objectIsEmpty = obj =>
  obj == null || Object.keys(obj).length === 0 && obj.constructor === Object; 

export const avg = vals => {
  var total = 0;
  for(var i = 0; i < vals.length; i++) {
    total += vals[i];
  }
  return (total / vals.length);
};

const shortLengthMax = 10;
const shortenName = name => {
  const shortened = name.substring(0, shortLengthMax - 3);
  return name.length <= shortLengthMax ? name : shortened + '...';
};

export const playerName = player => player.firstName + ' ' + player.lastName;

export const playerNameShort = player => 
  shortenName(player.firstName) + ' ' + shortenName(player.lastName);

export const preparePlayerData = player => {
  var newPlayer = Object.assign(player); 
  newPlayer['name'] = playerName(player);
  return newPlayer;
};

/* Helper functions for logging in and out. This is extracted out into this module
 * because we want to be able to call this function for debugging in addition to 
 * calling it at part of a login window */
export const loginConsts = {
  register: 1,
  login: 2,
};

export var loginData = {};
loginData[loginConsts.register] = {url: 'register', name: 'Register',};
loginData[loginConsts.login] = {url: 'login', name: 'Log in',};

// eslint-disable-next-line max-len
export const loginOrRegisterUser = (loginType, email, password, putRequestUser) => {
  const data = {email: email, password: password,};
  const url = getUrl(loginData[loginType].url);
  putRequestUser(data, url);
};

export const getIgnore = (url, callback) => 
  axios.get(getUrl(url)).then(callback).catch(() => {});

export const loginDummyUser = callback => 
  loginOrRegisterUser(loginConsts.login, 'a@a.com', 'a', callback);
export const logout = callback => getIgnore('logout', callback);
export const getUser = callback => getIgnore('api/user', callback);

export const resultPanels = {
  gameList: 'Games',
  statistics: 'Statistics',
  blunders: 'Blunders',
};

export const updateLoc = (loc, name, value) => {
  var newLoc = {...loc,}; 
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

const gameResult = resultInt => 
  resultInt == -1 ? '0-1' : resultInt == 0 ? '1/2-1/2' : '1-0';

export const cleanGameData = data => {
  const getByAttribute = type => data => {
    const results = data.filter(att => att.attribute == type);
    return results.length > 0 ? results[0].value : '';
  };

  const readOpening = (varName, name) => {
    const found = varName in data && data.opening != null;
    return found ? (data[varName][name] || '') : '';
  };

  const cleaned = {
    'id': data.game.id,
    'whiteShort': playerNameShort(data.playerWhite),
    'blackShort': playerNameShort(data.playerBlack),
    'white': playerName(data.playerWhite),
    'black': playerName(data.playerBlack),
    'result': gameResult(data.game.gameResult),
    'tournament': data.tournament.name,
    'opening': readOpening('opening', 'variationName'),
    'openingLine': readOpening('openingLine' ,'name'),
    'pgn': data.game.pgn,
    'date': getByAttribute('Date')(data.attributes),
  };
  return cleaned;
};

const removeDuplicates = (myArr, prop) => {
  return myArr.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
  });
}

export const removeMissing = d => d != null && d.name != undefined

export const getGameDataOpenings = gameData => {
  const getOpening = game => {
    if (game.openingLine == null) return null;
    const data = {
      name: game.openingLine.name,
      id: game.openingLine.name,
    };
    return data;
  };
  return removeDuplicates(gameData.map(getOpening).filter(removeMissing), 'name')
};

export const getOpenings = gameData => {
  if (gameData == null) return null;
  const getOpening = game => {
    if (game.openingLine == '') return null;
    const data = {
      name: game.openingLine,
      id: game.openingLine,
    };
    return data;
  };
  return removeDuplicates(gameData.map(getOpening).filter(removeMissing), 'name');
};


export const getActiveIds = type => (uiSelection, allData) => {
  if (allData == null) return null;
  const allIds = allData[type].map(t => t.id);
  const uiTournaments = uiSelection[type];

  return uiTournaments.length == 0 ? allIds : uiTournaments
};

export const getSelectedGame = (games, gameId) => {
  if (gameId == null){
    return null;
  }
  const matches = games.filter(g => g.id == gameId);
  if (matches.length == 0){
    return null;
  }
  return matches[0];
};


export class FullSelection {
  constructor(dbId, uiSelection, allData){
    this.uiSelection = uiSelection;
    this.allData = allData;
    this.dbId = dbId
  }

  updateUISelection = (name, values) => {
    var newUISelection = {...this.uiSelection}
    const newValues = values.map(v => v.id);
    newUISelection[name] = newValues
    const fs = new FullSelection(this.dbId, newUISelection, this.allData);
    return fs
  }

  activeTournaments = () => getActiveIds("tournaments")(this.uiSelection, this.allData)
  activePlayers = () => getActiveIds("players")(this.uiSelection, this.allData)

  searchData = () => {
    const selection = this.activeTournaments();

    const gameSearchData = {
      gameRequestDB: this.dbId,
      gameRequestTournaments: selection.tournaments,
    };
    return gameSearchData;
  }

  selectedGames = () => {
    const allPlayers = this.allData.players.map(x => x.id);
    const allTournaments = this.allData.tournaments.map(x => x.id);
    const allOpenings = this.allData.openings.map(x => x.id);

    const selection = this.uiSelection;

    if (selection == null) return [];
    var cleaned = this.allData.games;

    const selectedTournaments = selection.tournaments.length > 0 ? selection.tournaments : allTournaments;
    const isInSelectedTournament = value => selectedTournaments.indexOf(value) > -1;
    if (selectedTournaments.length > 0){
      const isSelectedTournament = gameData => isInSelectedTournament(gameData.tournament.id);
      cleaned = cleaned.filter(isSelectedTournament);
    }

    const selectedPlayers = selection.players.length > 0 ? selection.players : allPlayers;
    const isInSelected = value => selectedPlayers.indexOf(value) > -1;
    if (selectedPlayers.length > 0){
      const isSelectedPlayer = gameData => {
        const white = gameData.playerBlack.id;
        const black = gameData.playerWhite.id;
        return isInSelected(white) || isInSelected(black);
      };
      cleaned = cleaned.filter(isSelectedPlayer);
    }
    
    const opening = selection.openings;
    const selectedOpenings = opening.length > 0 ? opening : allOpenings;
    const isInSelectedOpening = value => selectedOpenings.indexOf(value) > -1;
    if (selection.openings.length > 0){
      const isSelectedOpening = gameData => {
        if (gameData.openingLine == null) return false;
        return isInSelectedOpening(gameData.openingLine.name);
      };
      cleaned = cleaned.filter(isSelectedOpening);
    }
    return cleaned;
  }

  selectedGamesForTable = () => this.selectedGames().map(cleanGameData);
}

export const createFullSelection = state => {
  if (state.selectedDB == null) return null;

  const allTournaments = state.tournamentData.data;
  const allPlayers = state.playerData.data;
  const allGames = state.gamesData.data;
  const allOpenings = getGameDataOpenings(allGames);

  if (allTournaments.length == 0 || allPlayers.length == 0 || allGames.length == 0) return null;

  const allData = {
    'tournaments': allTournaments
  , 'players': allPlayers
  , 'games': allGames
  , 'openings': allOpenings
  };

  const fs = new FullSelection(state.selectedDB, state.selection, allData);

  return fs
}

