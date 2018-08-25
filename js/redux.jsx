import {createStore, applyMiddleware, compose,} from 'redux';
import {rootReducer, defaultShowType,} from './reducers.jsx';
import thunkMiddleware from 'redux-thunk';
import {getUrl, getUrlFromLoc, getGameDataOpenings, getActiveIds, defaultLoc,} from './helpers.jsx';
import {createBrowserHistory,} from 'history';
const hist = createBrowserHistory();
import createSagaMiddleware from 'redux-saga';
import { call, put, takeEvery, all } from 'redux-saga/effects'
import { getRequestPromise } from './api.js';
import * as AT from './constants.js';
import qs from "qs";
import axios from 'axios';
import {selectLogin} from './actions.jsx';

const allDefaultRequests = (typeFetch, typeReceived) => {
  const defaultRequest = (type, status=null) => (data, dbId=null) => {
    var data = {type: type, status: status, data: data,};
    if (dbId != null) data['dbId'] = dbId;
    return data;
  }
  return {
    receiving: defaultRequest(typeFetch),
    received: defaultRequest(typeReceived, AT.STATUS_RECEIVED),
    error: defaultRequest(AT.FETCH_DATA_ERROR, typeFetch),
  };
};

const requestDB = allDefaultRequests(AT.FETCH_DB_DATA, AT.RECEIVE_DB_DATA);

const allSearchData = dbId => ({searchDB: dbId });

const allGameSearchData = dbId => ({
  gameRequestDB: dbId,
  gameRequestTournaments: [],
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

function* fetchDBData(action) {
  const fullUrl = getUrl('api/databases');
  try {
    const data = yield call(getRequestPromise, fullUrl);
    yield put(requestDB.received(data.data));

    const newLoc = getLocFromUrl(window.location.pathname.slice(1));
    const oldLoc = defaultLoc;

    // if (oldLoc.db != newLoc.db) yield put(selectDB(newLoc.db));
    // if (oldLoc.showType != newLoc.showType) yield put(selectShowType(newLoc.showType));
    // if (oldLoc.game != newLoc.game) yield put(selectGame(newLoc.game));

  }
  catch (error) {
    yield put(requestDB.error(error));
  }
}


const searchDataDB = action => allSearchData(action.dbId);
const searchDataGames = action => allGameSearchData(action.dbId);

const dataForMoveEvals = action => ({ gameRequestDB: action.dbId, gameRequestTournaments: action.tournaments})

const dataForSelection = action => {
  const fullSelection = action.selection;
  const activeTournaments = getActiveIds("tournaments")(fullSelection.uiSelection, fullSelection.allData);
  const gameSearchData = {
    gameRequestDB: fullSelection.dbId,
    gameRequestTournaments: activeTournaments
  };
  return gameSearchData;
}


const fetchData = (url, requester, searchDataCreator) => {
  function* fetcher(action) {
    const fullUrl = getUrl('api/' + url);
    const searchData = searchDataCreator(action);
    try {
      const data = yield call(getRequestPromise, fullUrl, searchData);
      if ('dbId' in action){
        yield put(requester.received(data.data, action.dbId));
      } else {
        yield put(requester.received(data.data));
      }
    }
    catch (error) {
      yield put(requester.error(error));
    }
  }
  return fetcher
}

const requestTournaments = allDefaultRequests(AT.FETCH_TOURNAMENT_DATA, AT.RECEIVE_TOURNAMENT_DATA);
const fetchTournamentData = fetchData('tournaments', requestTournaments, searchDataDB);

const requestPlayers = allDefaultRequests(AT.FETCH_PLAYER_DATA, AT.RECEIVE_PLAYER_DATA);
const fetchPlayerData = fetchData('players', requestPlayers, searchDataDB);

const requestGameEvals = allDefaultRequests(AT.FETCH_GAME_EVAL_DATA, AT.RECEIVE_GAME_EVAL_DATA);
const fetchGameEvals = fetchData('gameEvaluations', requestGameEvals, dataForSelection);

const requestMoveEvals = allDefaultRequests(AT.FETCH_MOVE_EVAL_DATA, AT.RECEIVE_MOVE_EVAL_DATA);
const fetchMoveEvals = fetchData('moveEvaluations', requestMoveEvals, dataForMoveEvals);

const requestGames = allDefaultRequests(AT.FETCH_GAME_DATA, AT.RECEIVE_GAME_DATA);
const fetchGames = fetchData('games', requestGames, searchDataGames);

const loginError = error => ({type: AT.LOGIN_OR_REGISTER_FAILED, error:error});

const tryLogin = () => ({type: AT.LOGIN_OR_REGISTER_SUCCEEDED})

function* handleLogin(action){
  const data = qs.stringify(action.data);
  try {
    const returned = yield call(axios.post, action.url, data)
    yield put(tryLogin());
  }
  catch (error) {
    yield put(loginError(error.response));
  }
}

function* fetchUser(){
  const data = yield call(axios.get, getUrl('api/user'))
  yield put({type:AT.RECEIVE_USER, data:data.data});
}

function* sendFetchUser() {
  yield put(selectLogin(null));
  yield put({type:AT.FETCH_USER});
}

function* fetchStatsForTournaments(action) {
  const ids = action.data.map(t => t.id);
  yield put({type: AT.FETCH_MOVE_EVAL_DATA, dbId: action.dbId, tournaments: ids})
}

function* updateSelectGame(action){

}

var fetcherData = {}
fetcherData[AT.FETCH_DB_DATA] = fetchDBData;
fetcherData[AT.FETCH_PLAYER_DATA] = fetchPlayerData;
fetcherData[AT.SELECT_DB] = getDataForDB;
fetcherData[AT.SELECTION_CHANGED] = pullDataForNewSelection;
fetcherData[AT.FETCH_GAME_DATA] = fetchGames;
fetcherData[AT.FETCH_TOURNAMENT_DATA] = fetchTournamentData;
fetcherData[AT.FETCH_GAME_EVAL_DATA] = fetchGameEvals;
fetcherData[AT.FETCH_MOVE_EVAL_DATA] = fetchMoveEvals;
fetcherData[AT.LOGIN_OR_REGISTER] = handleLogin;
fetcherData[AT.LOGIN_OR_REGISTER_SUCCEEDED] = sendFetchUser
fetcherData[AT.FETCH_USER] = fetchUser;
fetcherData[AT.RECEIVE_TOURNAMENT_DATA] = fetchStatsForTournaments



const getFetcher = (type, response) => {
  function* fetcher(){
    yield takeEvery(type, response);
  }
  return fetcher()
}

const getFetchers = fetcherData => {
  var fetchers = [];
  for (var type of Object.keys(fetcherData)){
    fetchers.push(getFetcher(type, fetcherData[type]))
  }
  return fetchers
}

const fetchers = getFetchers(fetcherData);

function* getDataForDB(action) {
  yield put(requestPlayers.receiving(null, action.dbId))
  yield put(requestTournaments.receiving(null, action.dbId))
  yield put(requestGames.receiving(null, action.dbId))
  const newLoc = {db: action.dbId, game: null, showType: defaultShowType}
  updateUrl(newLoc);
}

function* pullDataForNewSelection(action){
  yield put({type: AT.FETCH_GAME_EVAL_DATA, selection: action.selection})
}

export function* rootSaga() {
  yield all(fetchers);
}

const sagaMiddleware = createSagaMiddleware()
export const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(sagaMiddleware)),
);

sagaMiddleware.run(rootSaga);
store.dispatch(requestDB.receiving());
store.dispatch({type:AT.FETCH_USER});



export const getLoc = state => {
  const loc = {
    'db': state.selectedDB == null ? null : state.selectedDB,
    'game': state.selectedGame == null ? null : state.selectedGame,
    'showType': state.showType == null ? defaultShowType : state.showType,
  };
  return loc;
};


export const updateUrl = newLoc => {
  const currentUrl = window.location.pathname.slice(1);
  const newUrl = getUrlFromLoc(newLoc);
  if (newUrl != currentUrl) hist.push('/' + newUrl);
};
