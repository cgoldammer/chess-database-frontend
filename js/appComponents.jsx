import React from 'react';
import { HelpBlock, Jumbotron, Grid, Row, Col, Button, DropdownButton, MenuItem, FormControl, Breadcrumb, Modal } from 'react-bootstrap';
import Chess from 'chess.js';

import { Menu } from './components/Menu.jsx';
import { TournamentSelector } from "./components/MoveEvalPage.jsx";
import { DBChooser } from './components/DBChooser.jsx';
import { EvaluationWindow } from './components/AdminComponents.jsx';
import { SearchWindow } from './components/SearchWindow.jsx';
import { HOC, exposeRouter, objectIsEmpty, loginDummyUser, logout, getUser, contextComp, resultPanels, updateLoc, getUrl, preparePlayerData, getUrlFromLoc, getLocFromUrl} from './helpers.jsx';
import { defaultLoc, LocationContext } from './Context.js'
import axios from 'axios';
import { connect, Provider } from 'react-redux'
import { createStore, combineReducers, applyMiddleware } from 'redux';
import {createBrowserHistory} from 'history';
import thunkMiddleware from 'redux-thunk';

import myData from '/home/cg/data/output/tests.json';
import {testVar } from './api.js';
import {getRequest, getRequestPromise, postRequest} from './api.js';
import styles from './App.css';
import statStyles from './components/StatWindows.css';
const hist = createBrowserHistory();
import { store } from './redux.jsx';

import { rootReducer, FETCH_DB_DATA, FETCH_TOURNAMENT_DATA, FETCH_PLAYER_DATA, FETCH_GAME_DATA, STATUS_RECEIVING, STATUS_RECEIVED, SELECT_DB, SELECTION_CHANGED, defaultSelectionState } from './reducers.jsx';

var debugFunctions = {}
window.debugFunctions = debugFunctions;

String.prototype.number = function (find) {
  return this.split(find).length - 1;
}

const mapOverObject = (obj, f) => {
  var newObj = {};
  Object.keys(obj).forEach(function(key) {
      newObj[key] = f(obj[key]);
  });
  return newObj
}

const prepareData = function(data){
  for (var x = 0; x < data.length; x++){
    data[x].id = x;
    var rand = Math.random();
    var bestMove = data[x].best
    var actualMove = data[x].move

    if (rand < 0.5){
      data[x].move1 = bestMove
      data[x].move2 = actualMove
    }
    if (rand > 0.5){
      data[x].move1 = actualMove
      data[x].move2 = bestMove
    }
  }
  return data
}

class AppSummary extends React.Component {
  constructor(props) {
    super(props);
  }
  render = () => {
    const data = this.props.data;
    const style = {
      marginTop: 50,
      marginBotton: 50
    };
    return (
      <div style={ style }>
        <div>Tournaments: {data.numberTournaments}</div>
        <div>Games in the database: {data.numberGames}</div>
        <div>Games that are fully evaluated by Stockfish: {data.numberGameEvals}</div>
        <div>Number of moves that are evaluated: {data.numberMoveEvals}</div>
      </div>
    )
  }
}


class BreadcrumbNavigator extends React.Component {
  constructor(props) {
    super(props);
  }
  sendLocation = (name, value) => () => this.props.locSetter(updateLoc(this.props.loc, name, value));
  render = () => {
    if (this.props.loc.db != null && this.props.db == null){
      return null;
    }
    const crumb = (key, value, name) => <Breadcrumb.Item key={name} onClick={ this.sendLocation(key, value) }> {name} </Breadcrumb.Item>;
    const loc = this.props.loc;
    const homeCrumb = crumb("db", null, "home");
    const dbCrumb = loc.db != null ? crumb("db", loc.db, this.props.db.name) : null;
    const showCrumb = loc.showType != null ? crumb("showType", loc.showType, loc.showType) : null;
    const gameCrumb = loc.game != null ? crumb("game", this.props.game, loc.game) : null;
    return (
      <Breadcrumb>
        { homeCrumb }
        { dbCrumb }
        { showCrumb }
        { gameCrumb }
      </Breadcrumb>
    )
  }
}


const IntroWindow = () => (
	<Jumbotron>
		<h2 className={statStyles.statTitle}>Chess insights</h2>
		<p>A database with evaluations of every single move. Free and Open-Source.</p>
	</Jumbotron>
)

// const startingLoc = getLocFromUrl(window.location.pathname.slice(1));
const startingLoc = defaultLoc;

export class App extends React.Component {
  constructor(props) {
    super(props);
    document.title = "Chess insights"
    this.state = {
      gamesData: []
    , db: null
    , tournamentData: []
    , players: []
    , summaryData: {}
    , user: {}
    , loc: startingLoc
    , locationList: []
    };
  }
  // getDatabaseData = () => axios.get(getUrl('api/databases'))
  // updateDatabases = () => this.getDatabaseData().then(this.displayDatabases).catch(() => {})
  // componentDidMount = () => {
  //   const updateUser = () => axios.get(getUrl('api/user')).then(this.updateUser).catch(() => {})
  //   updateUser();
  //   debugFunctions.login = () => loginDummyUser(updateUser);
  //   debugFunctions.logout = () => {
  //     logout(() => {});
  //     this.updateUser({data: {}});
  //   }
  //   window.debugFunctions.user = () => this.state.user;
  //   window.debugFunctions = debugFunctions;

  // }
  components = {
      AppForDB: contextComp(AppForDB)
    , DBChooser: contextComp(DBChooser)
    , Navigator: contextComp(BreadcrumbNavigator)
  }
  // getSelectedGame = () => this.state.gamesData.filter(g => g.id == this.state.loc.game)[0];
  // displayDatabases = data => {
  //   this.setState({dbData: data.data});
  // }
  // updateUser = user => {
  //   this.setState({user: user.data}, this.updateDatabases);
  // }
  fileUploadHandler = data => {
    const uploadDone = () => {
      this.updateDatabases();
    }
    postRequest(getUrl('api/uploadDB'), data, uploadDone);
  }
  userIsLoggedIn = () => !objectIsEmpty(this.state.user)
  navigateToLoc = oldLoc => () => {
    const locList = this.state.loc;
    if (locList.db == null){
      if (locList.db != oldLoc.db) {
        this.leaveDB();
      }
    }
    else {
      if (locList.db != oldLoc.db) {
        const dbLoc = locList.db;
        this.props.setDB(dbLoc);
      }
      if (locList.game != undefined) {
        const game = locList.game
        const showType = resultPanels.gameList;
      }
    }
  }
  processSummaryResponse = (data) => {
    this.setState({'summaryData': data.data});
  }
  routeForDB = (route) => {
    routeStart = route[0];
  }
  locSetter = loc => {
    const oldLoc = this.state.loc;
    // If the location contains a game, and the game data is not set,
    // then load the game data before setting the state
    this.setState({loc: loc}, this.navigateToLoc(oldLoc))
    hist.push('/' + getUrlFromLoc(loc));
  }
  leaveDB = () => {
    const newLoc = updateLoc(this.state.loc, "db", null)

    this.locSetter(newLoc);
  }
  contextData = () => {
    const locSetter = this.locSetter
    return {loc: this.state.loc, locSetter: locSetter}
  }
  render = () => {
    var setDB = null;
    var fileDiv = null;
    if (this.state.loc.db == null){
      const DBChooserLoc = this.components.DBChooser;
      setDB = (<div>
				<IntroWindow/>
				<DBChooserLoc dbData={this.props.dbData} dbAction={this.props.setDB}/>
			</div>)
      if (this.userIsLoggedIn()){
        fileDiv = <FileReader fileContentCallback={ this.fileUploadHandler }/>
      }
    }
    var appForDB = <div/>
    if (this.props.selectedDB != null && this.props.getSelectedDB()){
      const db = this.props.getSelectedDB();
      const AppForDBLoc = this.components.AppForDB;
      appForDB = <AppForDBLoc
        selectedDB={this.props.selectedDB}
        summaryData={ this.props.summaryData}
        leaveDB={this.leaveDB}
        user={this.state.user}
        router={this.routeForDB}/>;
    }
    const Navigator = this.components.Navigator ;
    // const selectedGame = this.getSelectedGame();
    // const selectedDB = this.getSelectedDB();
    // const nav = <Navigator game={ selectedGame } db={ selectedDB } />;
    const nav = null;
    
    return (
      <LocationContext.Provider value={this.contextData()}>
        <Menu userCallback={ this.updateUser } user= { this.state.user } showUserElements={this.props.features.showUsers}/>
        <Grid fluid>
          <Row >
            { nav } 
          </Row>
          <Row>
            { appForDB }
          </Row>
          <Row>
						<div className={statStyles.statHeader}>
							{ setDB }
							{ fileDiv }
						</div>
					</Row>
        </Grid>
      </LocationContext.Provider>
    )
  }
}

const fileReaderState = { showModal: false, file: 0, name: "", showTooBigWarning: false };

export class FileReader extends React.Component {
  constructor(props) {
    super(props);
    this.state = fileReaderState;
  }
  
  setFileCallback = () => {
    const files = document.getElementById('input').files;
    if (files.length >= 0){
      const file = files[0];
      this.setState({ file: file });
    }
  }
  setWarning = val => this.setState({showTooBigWarning: val})

  submitResultsCallback = () => {
    const maxFileSize = 200 * 1024;
    var reader = new window.FileReader()
    reader.onload = e => {
      const result = reader.result;
      const data = { uploadName: this.state.name, uploadText: reader.result };
      if (result.length >= maxFileSize){
        this.setWarning(true)
      }
      else {
        this.setWarning(false)
        this.props.fileContentCallback(data);
      }
    }
    reader.readAsText(this.state.file);
  }
  closeModal = () => this.setState(fileReaderState);
  showModal = () => this.setState({ showModal: true });
  validateForm = () => this.state.file && this.state.name.length > 0;

  render = () => {
    var dbNameInput = <div/>
    if (this.state.file) {
      dbNameInput = (
        <div>
          <FormControl
          type="text"
          value={this.state.value}
          placeholder="Name of the database"
          onChange={(e) => this.setState({ name: e.target.value })}
        />
        { this.state.showTooBigWarning ? <HelpBlock style= {{ color: "red" }} > Max file size: 200KB </HelpBlock> : null }
          <Button onClick={ this.submitResultsCallback } disabled={ !this.validateForm() }>Submit</Button>
        </div>)
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
    )
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
  hasSummary = () => {
    return Object.keys(this.props.summaryData).length > 0;
  }
  render = () => {
    const search = 
      <SearchWindow 
        selectedDB={this.props.selectedDB} 
        playerData={ this.props.playerData } 
        gamesData= { this.props.gamesData }
        tournamentData={this.props.tournamentData}/>
    var summary = <div/>
    if (this.hasSummary()){
      var summary = <AppSummary data={this.props.summaryData}/>
    }
    var adminWindow = isAdmin ? <EvaluationWindow db={this.props.db}/> : <div/>

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
  tournamentData: []
}

const allDefaultRequests = type => {
  const defaultRequest = (type, status) => data => ({type: type, status: status, data: data})
  var requests = {}
  requests.receiving = defaultRequest(type, STATUS_RECEIVING)
  requests.received = defaultRequest(type, STATUS_RECEIVED)
  return requests
}

const allDBRequests = type => {
  const dbRequest = (type, status) => (dbId, data) => ({type: type, dbId: dbId, status: status, data: data})
  return {
    receiving: dbRequest(type, STATUS_RECEIVING)
  , received: dbRequest(type, STATUS_RECEIVED)
  }
}

const requestDB = allDefaultRequests(FETCH_DB_DATA);
const requestTournaments = allDBRequests(FETCH_TOURNAMENT_DATA)
const requestPlayers = allDBRequests(FETCH_PLAYER_DATA)
const requestGames = allDBRequests(FETCH_GAME_DATA)

const fetchPlayerData = (dbId, oldSelection) => {
  return dispatch => {
    dispatch(requestPlayers.receiving(dbId));

    const handleDBResponse = data => {
      dispatch(requestPlayers.received(dbId, data.data));
      const changeSelection = {players: data.data.map(d => d.id)};
      dispatch(selectionChangedAction(dbId, oldSelection, changeSelection));
    }
    getRequestPromise(getUrl('api/players'), {searchDB: dbId})
      .then(handleDBResponse)
  }
}

const selectionChanged = (newSelection, reset) => ({ type: SELECTION_CHANGED, selection: newSelection, reset: reset})

const fetchTournamentData = (dbId, callback) => {
  return dispatch => {
    dispatch(requestTournaments.receiving(dbId));
    const handleDBResponse = data => {
      dispatch(requestTournaments.received(data.data));
      const selection = {tournaments: data.data.map(d => d.id)};
      const newSelection = {...defaultSelectionState, ...selection}
      const select = selectionChangedAction(dbId, defaultSelectionState, selection);
      dispatch(select);
      dispatch(callback(dbId, newSelection));
    }
    getRequestPromise(getUrl('api/tournaments'), {searchDB: dbId})
      .then(handleDBResponse)
  }
}

const selectDB = dbId => ({type: SELECT_DB, dbId: dbId});

const selectDBAction = dbId => {
  return dispatch => {
    dispatch(selectDB(dbId));
    dispatch(fetchTournamentData(dbId, fetchPlayerData));
  }
}


const gameSearchData = (dbId, selection) => ({
  gameRequestDB: dbId
, gameRequestTournaments: selection.tournaments
})

const fetchGames = (dbId, selection) => {
  return dispatch => {
    dispatch(requestGames.receiving(dbId));
    const handleDBResponse = data => dispatch(requestGames.received(dbId, data.data));
    getRequestPromise(getUrl('api/games'), gameSearchData(dbId, selection)).then(handleDBResponse)
  }
}

// Upon selecting a database, first pull the player and tournament data. 
// For each data point that is received, updated the selection.
const fetchDataForDBSelection = (dbId, selection) => {
  return dispatch => {
    dispatch(fetchGames(dbId, selection));
    // dispatch(fetchBlunderData(data));
    // dispatch(fetchPlayerData(data));
  }
}

const fetchData = (requester, receiver, url) => {
  return dispatch => {
    dispatch(requester());
    const handleDBResponse = data => {
      dispatch(receiver(data.data));
    }
    axios.get(getUrl(url)).then(handleDBResponse);
  }
}

const selectionChangedAction = (dbId, selectionOld, selection) => {
  return dispatch => {
    const newSelection = { ...selectionOld, ...selection }
    dispatch(selectionChanged(newSelection, false));
    dispatch(fetchDataForDBSelection(dbId, newSelection));
  }
}

const fetchDBData = fetchData(requestDB.receiving, requestDB.received, 'api/databases')

const mapStateToProps = (state, ownProps) => ({
  dbData: state.dbData.data
, selectedDB: state.selectedDB
, getSelectedDB: () => {
    if (state.selectedDB && state.dbData.data.length > 0){
      return state.dbData.data.filter(db => db.id == state.selectedDB)[0]
    }
    return null;
  }
, getLoc: () => {
    const loc = {}
    loc['db'] = state.selectedDB;
    return loc
  }
, players: state.players
, tournamentData: state.tournaments
, gamesData: state.gamesData
})

const mapDispatchToProps = (dispatch, ownProps) => ({ 
  setDB: dbId => dispatch(selectDBAction(dbId))
});

const AppConnected = connect(mapStateToProps, mapDispatchToProps)(App);


export const app = features => (
  <Provider store={ store }>
    <AppConnected features={ features }/>
  </Provider>
);

store.dispatch(fetchDBData);
