import { createStore, applyMiddleware, compose, } from 'redux';
import { rootReducer, defaultShowType, } from './reducers.jsx';
import thunkMiddleware from 'redux-thunk';
import { getUrlFromLoc, getGameDataOpenings, getActiveSelection, } from './helpers.jsx';
import {createBrowserHistory,} from 'history';
const hist = createBrowserHistory();

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunkMiddleware))
);

export const getSelectedGames = state => {
  const allPlayers = state.playerData.data.map(p => p.id);
  const selection = getActiveSelection(state, state.selection);

  if (selection == null) return [];
  var cleaned = state.gamesData.data;
  const selectedPlayers = selection.players.length > 0 ? selection.players : allPlayers;
  const isInSelected = value => selectedPlayers.indexOf(value) > -1;
  if (selectedPlayers.length > 0){
    const isSelectedPlayer = gameData => isInSelected(gameData.gameDataPlayerBlack.id) || isInSelected(gameData.gameDataPlayerWhite.id);
    cleaned = cleaned.filter(isSelectedPlayer);
  }
  
  const allOpenings = getGameDataOpenings(cleaned);
  const selectedOpenings = selection.openings.length > 0 ? selection.openings : allOpenings;
  const isInSelectedOpening = value => selectedOpenings.indexOf(value) > -1;
  if (state.selection.openings.length > 0){
    const isSelectedOpening = gameData => {
      if (gameData.gameDataOpeningLine == null) return false;
      return isInSelectedOpening(gameData.gameDataOpeningLine.name);
    };
    cleaned = cleaned.filter(isSelectedOpening);
  }
  return cleaned;
};

export const getLoc = state => {
  const loc = {
    'db': state.selectedDB == null ? null : state.selectedDB,
    'game': state.selectedGame == null ? null : state.selectedGame,
    'showType': state.showType == null ? defaultShowType : state.showType,
  };
  return loc;
};


export const updateUrl = () => {
  const currentUrl = window.location.pathname.slice(1);
  const newUrl = getUrlFromLoc(getLoc(store.getState()));
  if (newUrl != currentUrl) hist.push('/' + newUrl);
};

