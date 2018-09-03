import {createStore, applyMiddleware, compose,} from 'redux';
import {rootReducer, defaultShowType,} from './reducers.jsx';
import {getUrl, getUrlFromLoc, getActiveIds,} from './helpers.jsx';
import {createBrowserHistory,} from 'history';
const hist = createBrowserHistory();
import createSagaMiddleware from 'redux-saga';
import {call, put, takeEvery, all,} from 'redux-saga/effects';
import {getRequestPromise,} from './api.js';
import * as AT from './constants.js';
import qs from 'qs';
import axios from 'axios';
import {selectLogin, loginError, dataForGame} from './actions.jsx';

const allDefaultRequests = (typeFetch, typeReceived) => {
  const defaultRequest = (type, status=null) => (data, dbId=null) => {
    var requestData = {type: type, status: status, data: data,};
    if (dbId != null) requestData['dbId'] = dbId;
    return requestData;
  };
  return {
    receiving: defaultRequest(typeFetch),
    received: defaultRequest(typeReceived, AT.STATUS_RECEIVED),
    error: defaultRequest(AT.FETCH_DATA_ERROR, typeFetch),
  };
};

const requestDB = allDefaultRequests(AT.FETCH_DB_DATA, AT.RECEIVE_DB_DATA);

const allSearchData = dbId => ({searchDB: dbId,});

const allGameSearchData = dbId => ({
  gameRequestDB: dbId,
  gameRequestTournaments: [],
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

function* fetchDBData() {
  const fullUrl = getUrl('api/databases');
  try {
    const data = yield call(getRequestPromise, fullUrl);
    yield put(requestDB.received(data.data));
  }
  catch (error) {
    yield put(requestDB.error(error));
  }
}


const searchDataDB = action => allSearchData(action.dbId);
const searchDataGames = action => allGameSearchData(action.dbId);

const dataForMoveEvals = action => ({gameRequestDB: action.dbId, 
  gameRequestTournaments: action.tournaments,});

const dataForSelection = action => {
  const fullSelection = action.selection;
  const activeTournaments = getActiveIds('tournaments')(fullSelection.uiSelection, 
    fullSelection.allData);
  const gameSearchData = {
    gameRequestDB: fullSelection.dbId,
    gameRequestTournaments: activeTournaments,
  };
  return gameSearchData;
};


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
  return fetcher;
};

const requestTournaments = allDefaultRequests(AT.FETCH_TOURNAMENT_DATA, 
  AT.RECEIVE_TOURNAMENT_DATA);
const fetchTournamentData = fetchData('tournaments', requestTournaments, searchDataDB);

const requestPlayers = allDefaultRequests(AT.FETCH_PLAYER_DATA, AT.RECEIVE_PLAYER_DATA);
const fetchPlayerData = fetchData('players', requestPlayers, searchDataDB);

const requestGameEvals = allDefaultRequests(AT.FETCH_GAME_EVAL_DATA, 
  AT.RECEIVE_GAME_EVAL_DATA);
const fetchGameEvals = fetchData('gameEvaluations', requestGameEvals, dataForMoveEvals);

const requestMoveEvals = allDefaultRequests(AT.FETCH_MOVE_EVAL_DATA, 
  AT.RECEIVE_MOVE_EVAL_DATA);
const fetchMoveEvals = fetchData('moveEvaluations', requestMoveEvals, dataForMoveEvals);

const requestMoveSummaries = allDefaultRequests(AT.FETCH_MOVE_SUMMARY_DATA, 
  AT.RECEIVE_MOVE_SUMMARY_DATA);
const fetchMoveSummaries = fetchData('moveSummary', requestMoveSummaries, dataForMoveEvals);

const requestGames = allDefaultRequests(AT.FETCH_GAME_DATA, AT.RECEIVE_GAME_DATA);
const fetchGames = fetchData('games', requestGames, searchDataGames);


const tryLogin = () => ({type: AT.LOGIN_OR_REGISTER_SUCCEEDED,});

function* handleLogin(action){
  const data = qs.stringify(action.data);
  try {
    yield call(axios.post, action.url, data);
    yield put(tryLogin());
  }
  catch (error) {
    yield put(loginError(error.response));
  }
}

function* fetchUser(){
  const data = yield call(axios.get, getUrl('api/user'));
  yield put({type:AT.RECEIVE_USER, data:data.data,});
}

function* sendFetchUser() {
  yield put(selectLogin(null));
  yield put({type:AT.FETCH_USER,});
}

function* fetchStatsForTournaments(action) {
  const ids = action.data.map(t => t.id);
  yield put({type: AT.FETCH_MOVE_EVAL_DATA, dbId: action.dbId, tournaments: ids,});
  yield put({type: AT.FETCH_GAME_EVAL_DATA, dbId: action.dbId, tournaments: ids,});
  yield put({type: AT.FETCH_MOVE_SUMMARY_DATA, dbId: action.dbId, tournaments: ids,});
}

function* updateAfterReceivingUser() {
  yield put(requestDB.receiving());
}

function* loadDataForGame(action) {
  yield put(dataForGame(action.dbId, action.gameId));
}

function* fetchGameEvaluations(action) {
  const fullUrl = getUrl('api/moveEvaluationsFromIds');
  const parameters = {idValues: [action.gameId]}
  try {
    const data = yield call(getRequestPromise, fullUrl, parameters);
    yield put({type: AT.RECEIVE_GAME_EVALUATION_DATA, data: data.data});
  }
  catch (error) {
    yield put({type: AT.STATUS_ERROR, error: error});
  }

}

var fetcherData = {};
fetcherData[AT.FETCH_DB_DATA] = fetchDBData;
fetcherData[AT.FETCH_PLAYER_DATA] = fetchPlayerData;
fetcherData[AT.SELECT_DB] = getDataForDB;
fetcherData[AT.FETCH_GAME_DATA] = fetchGames;
fetcherData[AT.FETCH_TOURNAMENT_DATA] = fetchTournamentData;
fetcherData[AT.FETCH_GAME_EVAL_DATA] = fetchGameEvals;
fetcherData[AT.FETCH_MOVE_EVAL_DATA] = fetchMoveEvals;
fetcherData[AT.FETCH_MOVE_SUMMARY_DATA] = fetchMoveSummaries;
fetcherData[AT.LOGIN_OR_REGISTER] = handleLogin;
fetcherData[AT.LOGIN_OR_REGISTER_SUCCEEDED] = sendFetchUser;
fetcherData[AT.FETCH_USER] = fetchUser;
fetcherData[AT.RECEIVE_TOURNAMENT_DATA] = fetchStatsForTournaments;
fetcherData[AT.RECEIVE_USER] = updateAfterReceivingUser;
fetcherData[AT.SELECT_GAME] = loadDataForGame;
fetcherData[AT.FETCH_GAME_EVALUATION_DATA] = fetchGameEvaluations;

const getFetcher = (type, response) => {
  function* fetcher(){
    yield takeEvery(type, response);
  }
  return fetcher();
};

const getFetchers = fetcherData => {
  var fetchers = [];
  for (var type of Object.keys(fetcherData)){
    fetchers.push(getFetcher(type, fetcherData[type]));
  }
  return fetchers;
};

const fetchers = getFetchers(fetcherData);

function* getDataForDB(action) {
  yield put(requestPlayers.receiving(null, action.dbId));
  yield put(requestTournaments.receiving(null, action.dbId));
  yield put(requestGames.receiving(null, action.dbId));
  const newLoc = {db: action.dbId, game: null, showType: defaultShowType,};
  updateUrl(newLoc);
}

export function* rootSaga() {
  yield all(fetchers);
}

const sagaMiddleware = createSagaMiddleware();
export const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(sagaMiddleware)),
);

sagaMiddleware.run(rootSaga);
store.dispatch(requestDB.receiving());
store.dispatch({type:AT.FETCH_USER,});



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
