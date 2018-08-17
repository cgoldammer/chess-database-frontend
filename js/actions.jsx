import { SELECT_GAME, SELECT_SHOWTYPE } from './reducers.jsx';

export const selectGame = gameId => ({type: SELECT_GAME, gameId: gameId })
export const selectShowType = key => ({type: SELECT_SHOWTYPE, showType: key})
