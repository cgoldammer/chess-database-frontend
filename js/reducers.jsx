import {combineReducers,} from 'redux';
import {resultPanels, playerName, getActiveSelection} from './helpers.jsx';
import * as AT from './constants.js';

export const defaultShowType = resultPanels.gameList;

const defaultData = {
  fetching: false,
  data: [],
};

export const defaultSelectionState = {
  tournaments: [],
  players: [],
  openings: [],
};

const reduceDataDefault = (actionFetch, actionReceive, defaultState=defaultData, cleaner=null) => {
  return (state=defaultState, action) => {
    switch (action.type) {
    case actionFetch:
      return ({fetching: true, data: [],});
    case actionReceive:
      var data = action.data;
      if (cleaner) {
        data = data.map(cleaner);
      }
      return ({fetching: false, data: data,});
    }
    return state;
  };
};

const reduceDefault = (type, defaultState, getValue) => (state=defaultState, action) => {
  switch(action.type){
    case type:
      return getValue(action);
  }
  return state
}


const extractShowType = action => action.showType == null ? defaultShowType : action.showType;
const reduceShowType = reduceDefault(AT.SELECT_SHOWTYPE, defaultShowType, extractShowType)

const extractSelection = action => {
  if (action.reset){
    return defaultSelectionState;
  }
  const selection = action.selection;
  return selection.uiSelection;
}
const reduceSelectionChanged = reduceDefault(AT.SELECTION_CHANGED, defaultSelectionState, extractSelection)

const reduceLoginError = (state=null, action) => {
  switch(action.type){
    case AT.LOGIN_OR_REGISTER_FAILED:
      return action.error.data
    case AT.LOGIN_OR_REGISTER_SUCCEEDED:
      return null;
  }
  return null;
}

const reduceUser = reduceDefault(AT.RECEIVE_USER, null, action => action.data);
const reduceSelectedGame = reduceDefault(AT.SELECT_GAME, null, action => action.gameId)
const reduceSelectDB = reduceDefault(AT.SELECT_DB, null, action => action.dbId);
const reduceSelectLogin = reduceDefault(AT.SELECT_LOGIN_WINDOW, null, action => action.data)

const reduceGameData = reduceDataDefault(AT.FETCH_GAME_DATA, AT.RECEIVE_GAME_DATA);
const reduceDBData = reduceDataDefault(AT.FETCH_DB_DATA, AT.RECEIVE_DB_DATA);
const reduceMoveEvalData = reduceDataDefault(AT.FETCH_MOVE_EVAL_DATA, AT.RECEIVE_MOVE_EVAL_DATA);
const reduceGameEvalData = reduceDataDefault(AT.FETCH_GAME_EVAL_DATA, AT.RECEIVE_GAME_EVAL_DATA);
const reduceMoveSummaryData = reduceDataDefault(AT.FETCH_MOVE_SUMMARY_DATA);


const addPlayerName = player => ({...player, ...{name: playerName(player),},});

export const rootReducer = combineReducers({
  dbData: reduceDBData,
  tournamentData: reduceDataDefault(AT.FETCH_TOURNAMENT_DATA, AT.RECEIVE_TOURNAMENT_DATA),
  playerData: reduceDataDefault(AT.FETCH_PLAYER_DATA, AT.RECEIVE_PLAYER_DATA, defaultData, addPlayerName),
  selectedDB: reduceSelectDB,
  selection: reduceSelectionChanged,
  gamesData: reduceGameData,
  moveEvalsData: reduceMoveEvalData,
  showType: reduceShowType,
  selectedGame: reduceSelectedGame,
  moveSummaryData: reduceMoveSummaryData,
  gameEvalData: reduceGameEvalData,
  user: reduceUser,
  loginError: reduceLoginError,
  loginTypeSelected: reduceSelectLogin,
});
