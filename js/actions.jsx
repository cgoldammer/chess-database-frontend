import * as AT from './constants.js';

export const selectGame = gameId => ({type: AT.SELECT_GAME, gameId: gameId,});
export const selectShowType = key => ({type: AT.SELECT_SHOWTYPE, showType: key,});
export const selectLogin = loginType => ({type:AT.SELECT_LOGIN_WINDOW, data: loginType})
