import * as AT from './constants.js';

export const selectGame = (dbId, gameId) => ({type: AT.SELECT_GAME, dbId: dbId, gameId: gameId,});
export const selectShowType = (dbId, key) => ({type: AT.SELECT_SHOWTYPE, dbId: dbId, showType: key,});
export const selectLogin = loginType => ({type:AT.SELECT_LOGIN_WINDOW, data: loginType})
export const selectDB = dbId => ({type: AT.SELECT_DB, dbId: dbId,});
