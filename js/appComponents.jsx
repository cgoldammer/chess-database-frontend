import React from 'react';
import { HelpBlock, Jumbotron, Grid, Row, Button, FormControl, Breadcrumb, Modal, } from 'react-bootstrap';

import { Menu, } from './components/Menu.jsx';
import { DBChooser, } from './components/DBChooser.jsx';
import { EvaluationWindow, } from './components/AdminComponents.jsx';
import { SearchWindow, } from './components/SearchWindow.jsx';
import { objectIsEmpty, logout, updateLoc, getUrl, getLocFromUrl, defaultLoc, cleanGameData, getActiveSelection,} from './helpers.jsx';
import axios from 'axios';
import { connect, Provider, } from 'react-redux';

import {getRequestPromise, postRequest,} from './api.js';
import statStyles from './components/StatWindows.css';
import { store, updateUrl, getLoc, getSelectedGames, } from './redux.jsx';
import { selectGame, selectShowType, } from './actions.jsx';

import { FETCH_DB_DATA, FETCH_TOURNAMENT_DATA, FETCH_PLAYER_DATA, FETCH_GAME_DATA, FETCH_MOVE_EVAL_DATA, FETCH_GAME_EVAL_DATA, FETCH_MOVE_SUMMARY_DATA, STATUS_RECEIVING, STATUS_RECEIVED, SELECT_DB, SELECTION_CHANGED, } from './reducers.jsx';

var debugFunctions = {};
window.debugFunctions = debugFunctions;

String.prototype.number = function (find) {
  return this.split(find).length - 1;
};

class BreadcrumbNavigator extends React.Component {
  constructor(props) {
    super(props);
  }
  sendLocation = (name, value) => () => this.props.setLoc(this.props.loc, updateLoc(this.props.loc, name, value));
  render = () => {
    const crumb = (key, value, name) => <Breadcrumb.Item key={name} onClick={ this.sendLocation(key, value) }> {name} </Breadcrumb.Item>;
    const loc = this.props.loc;
    const homeCrumb = crumb('db', null, 'home');
    var showCrumb = null;
    var gameCrumb = null;
    const dbCrumb = loc.db != null ? crumb('db', loc.db, this.props.selectedDB.name) : null;
    if (dbCrumb) showCrumb = loc.showType != null ? crumb('showType', loc.showType, loc.showType) : null;
    if (showCrumb) gameCrumb = loc.game != null ? crumb('game', this.props.game, loc.game) : null;
    return (
      <Breadcrumb>
        { homeCrumb }
        { dbCrumb }
        { showCrumb }
        { gameCrumb }
      </Breadcrumb>
    );
  }
}


const IntroWindow = () => (
  <Jumbotron>
    <h2 className={statStyles.statTitle}>Chess insights</h2>
    <p>A database with evaluations of every single move. Free and Open-Source.</p>
  </Jumbotron>
);


export class App extends React.Component {
  constructor(props) {
    super(props);
    document.title = 'Chess insights';
    this.state = {
      gamesData: [],
      db: null,
      tournamentData: [],
      players: [],
      summaryData: {},
      user: {},
      locationList: [],
    };
  }
  componentDidMount = () => {
    const initialLoc = () => {
      const urlLoc = getLocFromUrl(window.location.pathname.slice(1));
      this.props.setLoc(defaultLoc, urlLoc);
    };
    store.dispatch(fetchDBData(initialLoc));

    debugFunctions.logout = () => {
      logout(() => {});
      this.updateUser({data: {},});
    };
    window.debugFunctions.user = () => this.state.user;
    window.debugFunctions = debugFunctions;
  }

  fileUploadHandler = data => {
    const uploadDone = () => {
      this.updateDatabases();
    };
    postRequest(getUrl('api/uploadDB'), data, uploadDone);
  }
  userIsLoggedIn = () => !objectIsEmpty(this.state.user)
  processSummaryResponse = (data) => {
    this.setState({'summaryData': data.data,});
  }
  render = () => {
    var setDB = null;
    var fileDiv = null;
    if (this.props.selectedDB == null){
      setDB = (<div>
        <IntroWindow/>
        <DBChooser dbData={this.props.dbData} setDB={this.props.setDB}/>
      </div>);
      if (this.userIsLoggedIn()){
        fileDiv = <FileReader fileContentCallback={ this.fileUploadHandler }/>;
      }
    }
    var appForDB = <div/>;
    if (this.props.selectedDB){
      appForDB = <AppForDB
        selectedDB={this.props.selectedDB}
        selection={ this.props.selection }
        updateSelection= { this.props.updateSelection }
        playerData={this.props.playerData.data }
        tournamentData={this.props.tournamentData.data }
        summaryData={ this.props.summaryData}
        leaveDB={this.leaveDB}
        user={this.state.user}
        selectedGames={this.props.selectedGames}
        router={this.routeForDB}/>;
    }
    const nav = <BreadcrumbNavigator loc={ this.props.loc } selectedDB= { this.props.selectedDB } setLoc= { this.props.setLoc }/>;
    
    return (
      <div>
        <Menu userCallback={ this.updateUser } user= { this.state.user } showUserElements={this.props.features.showUsers}/>
        <Grid fluid>
          <Row >
            { nav } 
          </Row>
          <Row>
            <div className={statStyles.statHeader}>
              { setDB }
              { fileDiv }
            </div>
          </Row>
          <Row>
            { appForDB }
          </Row>
        </Grid>
      </div>
    );
  }
}

const fileReaderState = { showModal: false, file: 0, name: '', showTooBigWarning: false, };

export class FileReader extends React.Component {
  constructor(props) {
    super(props);
    this.state = fileReaderState;
  }
  
  setFileCallback = () => {
    const files = document.getElementById('input').files;
    if (files.length >= 0){
      const file = files[0];
      this.setState({ file: file, });
    }
  }
  setWarning = val => this.setState({showTooBigWarning: val,})

  submitResultsCallback = () => {
    const maxFileSize = 200 * 1024;
    var reader = new window.FileReader();
    reader.onload = () => {
      const result = reader.result;
      const data = { uploadName: this.state.name, uploadText: reader.result, };
      if (result.length >= maxFileSize){
        this.setWarning(true);
      }
      else {
        this.setWarning(false);
        this.props.fileContentCallback(data);
      }
    };
    reader.readAsText(this.state.file);
  }
  closeModal = () => this.setState(fileReaderState);
  showModal = () => this.setState({ showModal: true, });
  validateForm = () => this.state.file && this.state.name.length > 0;

  render = () => {
    var dbNameInput = <div/>;
    if (this.state.file) {
      dbNameInput = (
        <div>
          <FormControl
            type="text"
            value={this.state.value}
            placeholder="Name of the database"
            onChange={(e) => this.setState({ name: e.target.value, })}
          />
          { this.state.showTooBigWarning ? <HelpBlock style= {{ color: 'red', }} > Max file size: 200KB </HelpBlock> : null }
          <Button onClick={ this.submitResultsCallback } disabled={ !this.validateForm() }>Submit</Button>
        </div>);
    }
    return (
      <div>
        <Button onClick={this.showModal}>Upload database</Button>
        <Modal show={ this.state.showModal }>
          <Modal.Header>Upload external database</Modal.Header>
          <Modal.Body>
            <input type="file" onChange={ this.setFileCallback } id="input"/>
            <p> Note: The file must be in PGN format. </p>
            { dbNameInput }
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={ this.closeModal }>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

var isAdmin = process.env.ISADMIN;

class AppForDB extends React.Component {
  constructor(props) {
    super(props);
  }
  hasData = () => {
    return this.props.tournamentData.length > 0;
  }
  render = () => {
    const search = 
      <SearchWindow 
        selectedDB={this.props.selectedDB} 
        selection={ this.props.selection }
        updateSelection = { this.props.updateSelection }
        playerData={ this.props.playerData } 
        selectedGames={ this.props.selectedGames }
        tournamentData={this.props.tournamentData}/>;
    var adminWindow = isAdmin ? <EvaluationWindow db={this.props.db}/> : <div/>;

    return (
      <div>
        { search }
        { adminWindow }
      </div>
    );
  }
}

AppForDB.defaultProps = {
  summaryData: {},
  tournamentData: [],
};

const allDefaultRequests = type => {
  const defaultRequest = (type, status) => data => ({type: type, status: status, data: data,});
  var requests = {};
  requests.receiving = defaultRequest(type, STATUS_RECEIVING);
  requests.received = defaultRequest(type, STATUS_RECEIVED);
  return requests;
};

const allDBRequests = type => {
  const dbRequest = (type, status) => (dbId, data) => ({type: type, dbId: dbId, status: status, data: data,});
  return {
    receiving: dbRequest(type, STATUS_RECEIVING),
    received: dbRequest(type, STATUS_RECEIVED),
  };
};

const requestDB = allDefaultRequests(FETCH_DB_DATA);

const requestTournaments = allDBRequests(FETCH_TOURNAMENT_DATA);
const requestPlayers = allDBRequests(FETCH_PLAYER_DATA);
const requestGames = allDBRequests(FETCH_GAME_DATA);
const requestMoveEvals = allDBRequests(FETCH_MOVE_EVAL_DATA);
const requestGameEvals = allDBRequests(FETCH_GAME_EVAL_DATA);
const requestMoveSummary = allDBRequests(FETCH_MOVE_SUMMARY_DATA);


const fetchPlayerData = dbId => dispatch => {
  dispatch(requestPlayers.receiving(dbId));

  const handleDBResponse = data => {
    dispatch(requestPlayers.received(dbId, data.data));
    // const changeSelection = {players: data.data.map(d => d.id)};
    // dispatch(selectionChangedAction(dbId, oldSelection, changeSelection));
  };
  getRequestPromise(getUrl('api/players'), {searchDB: dbId,})
    .then(handleDBResponse);
};

const selectionChanged = (newSelection, reset) => ({ type: SELECTION_CHANGED, selection: newSelection, reset: reset,});

const fetchTournamentData = (dbId, callback) => dispatch => {
  dispatch(requestTournaments.receiving(dbId));
  const handleDBResponse = data => {
    dispatch(requestTournaments.received(dbId, data.data));
    dispatch(callback(dbId));
  };
  getRequestPromise(getUrl('api/tournaments'), {searchDB: dbId,})
    .then(handleDBResponse);
};

const selectDB = dbId => ({type: SELECT_DB, dbId: dbId,});

const selectDBAction = dbId => dispatch => {
  dispatch(selectDB(dbId));
  dispatch(fetchGames(dbId));
  dispatch(fetchTournamentData(dbId, fetchPlayerData));
  updateUrl();
};


const gameSearchData = (dbId, selection) => ({
  gameRequestDB: dbId,
  gameRequestTournaments: selection.tournaments,
});

const allGameSearchData = dbId => ({
  gameRequestDB: dbId,
  gameRequestTournaments: [],
});

const fetchGames = dbId => dispatch => {
  const requester = requestGames;
  const url = 'games';
  const searchData = allGameSearchData(dbId);
  dispatch(requester.receiving(dbId));
  const handleDBResponse = data => dispatch(requester.received(dbId, data.data));
  getRequestPromise(getUrl('api/' + url), searchData).then(handleDBResponse);
};

const defaultFetcher = (requester, url) => (dbId, baseSelection) => (dispatch, getState) => {
  const state = getState();
  const selection = getActiveSelection(state, baseSelection);
  dispatch(requester.receiving(dbId));
  const handleDBResponse = data => dispatch(requester.received(dbId, data.data));
  getRequestPromise(getUrl('api/' + url), gameSearchData(dbId, selection)).then(handleDBResponse);
};

const fetchMoveEvals = defaultFetcher(requestMoveEvals, 'moveEvaluations');
const fetchGameEvaluations = defaultFetcher(requestGameEvals, 'gameEvaluations');
const fetchMoveSummary = defaultFetcher(requestMoveSummary, 'moveSummary');

// There is a selection object in the state that represents
// the items that are visually selected.
// To pull from the database, I submit an action that uses the player 
// and opening data.


// Upon selecting a database, first pull the player and tournament data. 
// For each data point that is received, updated the selection.
const fetchDataForDBSelection = (dbId, selection) => {
  return dispatch => {
    dispatch(fetchMoveEvals(dbId, selection));
    dispatch(fetchGameEvaluations(dbId, selection));
    dispatch(fetchMoveSummary(dbId, selection));
  };
};

const fetchData = (requester, receiver, url, callback=null) => {
  return dispatch => {
    dispatch(requester());
    const handleDBResponse = data => {
      dispatch(receiver(data.data));
      if (callback) callback();
    };
    axios.get(getUrl(url)).then(handleDBResponse);
  };
};

const selectionChangedAction = (dbId, selectionOld, selection) => dispatch => {
  const newSelection = { ...selectionOld, ...selection, };
  dispatch(selectionChanged(newSelection, false));
  dispatch(fetchDataForDBSelection(dbId, newSelection));
};

const fetchDBData = callback => fetchData(requestDB.receiving, requestDB.received, 'api/databases', callback);

const getSelectedDB = (dbData, selectedId) => {
  if (selectedId && dbData.data.length > 0){
    const matches = dbData.data.filter(db => db.id == selectedId);
    if (matches.length == 0) return null;
    return matches[0];
  }
  return null;
};

const mapStateToProps = state => ({
  dbData: state.dbData.data,
  selectedDB: getSelectedDB(state.dbData, state.selectedDB),
  loc: getLoc(state),
  players: state.players,
  tournamentData: state.tournamentData,
  playerData: state.playerData,
  gamesData: state.gamesData,
  selection: state.selection,
  selectedGames: getSelectedGames(state).map(cleanGameData),
});

const mapDispatchToProps = dispatch => ({ 
  setDB: dbId => dispatch(selectDBAction(dbId, fetchDataForDBSelection(dbId))),
  updateSelection: (dbId, selection, newSelection) => {
    dispatch(selectionChangedAction(dbId, selection, newSelection));
  },
  setLoc: (oldLoc, newLoc) => {
    const selectAfterDB = () => {
      if (oldLoc.showType != newLoc.showType) dispatch(selectShowType(newLoc.showType));
      if (oldLoc.game != newLoc.game) dispatch(selectGame(newLoc.game));
      updateUrl();
    };
    if (oldLoc.db != newLoc.db) dispatch(selectDBAction(newLoc.db, selectAfterDB));
    else selectAfterDB();
  },
});

const AppConnected = connect(mapStateToProps, mapDispatchToProps)(App);


export const app = features => (
  <Provider store={ store }>
    <AppConnected features={ features }/>
  </Provider>
);

