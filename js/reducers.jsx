import { combineReducers } from 'redux';
import { resultPanels, playerName } from './helpers.jsx';

export const FETCH_DB_DATA = 'FETCH_DB_DATA';
export const FETCH_PLAYER_DATA = 'FETCH_PLAYER_DATA';
export const FETCH_TOURNAMENT_DATA = 'FETCH_TOURNAMENT_DATA';
export const FETCH_GAME_DATA = 'FETCH_GAME_DATA';
export const FETCH_MOVE_EVAL_DATA = 'FETCH_MOVE_EVAL_DATA';
export const FETCH_GAME_EVAL_DATA = 'FETCH_GAME_EVAL_DATA';
export const FETCH_MOVE_SUMMARY_DATA = 'FETCH_MOVE_SUMMARY_DATA';
export const SELECT_DB = 'SELECT_DB';
export const STATUS_RECEIVING = 'RECEIVING';
export const STATUS_RECEIVED = 'RECEIVED';
export const SELECTION_CHANGED = 'SELECTION_CHANGED';
export const SELECT_SHOWTYPE = 'SELECT_SHOWTYPE';
export const SELECT_GAME = 'SELECT_GAME';

const defaultData = {
  fetching: false
, data: []
}

export const defaultSelectionState = {
  tournaments: []
, players: []
}

const reduceSelectionChanged = (state=defaultSelectionState, action) => {
  switch(action.type){
    case SELECTION_CHANGED:
      if (action.reset){
        return defaultSelectionState
      }
      return action.selection;
  }
  return state;
}

const reduceDataDefault = (actionType, defaultState=defaultData, cleaner=null) => {
  return (state=defaultState, action) => {
    switch (action.type) {
      case actionType:
        if (action.status == STATUS_RECEIVING) {
          return ({ fetching: true, data: [] });
        }
        if (action.status == STATUS_RECEIVED) {
          const data = action.data
          if (cleaner) {
            var data = data.map(cleaner);
          }
          return ({ fetching: false, data: data });
        }
    }
    return state
  }
}

export const defaultShowType = resultPanels.gameList;
const reduceShowType = (state=defaultShowType, action) => {
  switch (action.type){
    case SELECT_SHOWTYPE:
      return action.showType == null ? defaultShowType : action.showType
  }
  return state;
}

const reduceSelectedGame = (state=null, action) => {
  switch (action.type){
    case SELECT_GAME:
      return action.gameId
  }
  return state;
}

const reduceSelectDB = (state=null, action) => {
  switch (action.type){
    case SELECT_DB:
      return action.dbId
  }
  return state
}

const reduceGameData = reduceDataDefault(FETCH_GAME_DATA)
const reduceMoveEvalData = reduceDataDefault(FETCH_MOVE_EVAL_DATA)
const reduceGameEvalData = reduceDataDefault(FETCH_GAME_EVAL_DATA)
const reduceMoveSummaryData = reduceDataDefault(FETCH_MOVE_SUMMARY_DATA)

const addPlayerName = player => ({...player, ...{name: playerName(player)}})

export const rootReducer = combineReducers({
  dbData: reduceDataDefault(FETCH_DB_DATA)
, tournamentData: reduceDataDefault(FETCH_TOURNAMENT_DATA)
, playerData: reduceDataDefault(FETCH_PLAYER_DATA, defaultData, addPlayerName)
, selectedDB: reduceSelectDB
, selection: reduceSelectionChanged
, gamesData: reduceGameData
, moveEvalsData: reduceMoveEvalData
, showType: reduceShowType
, selectedGame: reduceSelectedGame
, moveSummaryData: reduceMoveSummaryData
, gameEvalData: reduceGameEvalData
})
