import { combineReducers } from 'redux';
import { resultPanels } from './helpers.jsx';

export const FETCH_DB_DATA = 'FETCH_DB_DATA';
export const FETCH_PLAYER_DATA = 'FETCH_PLAYER_DATA';
export const FETCH_TOURNAMENT_DATA = 'FETCH_TOURNAMENT_DATA';
export const FETCH_GAME_DATA = 'FETCH_GAME_DATA';
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

const reduceDataDefault = (actionType, defaultState=defaultData) => {
  return (state=defaultState, action) => {
    switch (action.type) {
      case actionType:
        if (action.status == STATUS_RECEIVING) {
          return ({ fetching: true, data: [] });
        }
        if (action.status == STATUS_RECEIVED) {
          return ({ fetching: false, data: action.data });
        }
    }
    return state
  }
}

const defaultShowType = resultPanels.gameList;
const reduceShowType = (state=defaultShowType, action) => {
  switch (action.type){
    case SELECT_SHOWTYPE:
      return action.showType
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

const reduce_db_data = reduceDataDefault(FETCH_DB_DATA)
const reduce_tournament_data = reduceDataDefault(FETCH_TOURNAMENT_DATA)
const reduceGameData = reduceDataDefault(FETCH_GAME_DATA)


export const rootReducer = combineReducers({
  dbData: reduceDataDefault(FETCH_DB_DATA)
, tournamentData: reduceDataDefault(FETCH_TOURNAMENT_DATA)
, playerData: reduceDataDefault(FETCH_PLAYER_DATA)
, selectedDB: reduceSelectDB
, selection: reduceSelectionChanged
, gamesData: reduceGameData
, showType: reduceShowType
, selectedGame: reduceSelectedGame
})
