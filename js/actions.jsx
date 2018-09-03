import * as AT from './constants.js';

export const selectGame = (dbId, gameId) => 
  ({type: AT.SELECT_GAME, dbId: dbId, gameId: gameId,});
export const dataForGame = (dbId, gameId) => 
  ({type: AT.FETCH_GAME_EVALUATION_DATA, dbId: dbId, gameId: gameId,});
export const selectShowType = (dbId, key) => 
  ({type: AT.SELECT_SHOWTYPE, dbId: dbId, showType: key,});
export const selectLogin = loginType => ({type:AT.SELECT_LOGIN_WINDOW, data: loginType})
export const selectDB = dbId => ({type: AT.SELECT_DB, dbId: dbId,});
export const loginOrRegister = (data, url) => 
  ({type:AT.LOGIN_OR_REGISTER, data: data, url: url,});
export const selectionChanged = (fullSelection, reset) => 
  ({type: AT.SELECTION_CHANGED, selection: fullSelection, reset: reset,});
const loginError = error => ({type: AT.LOGIN_OR_REGISTER_FAILED, error:error,});
