import React from 'react';
import { Jumbotron, Grid, Row, Col, Button, DropdownButton, MenuItem, FormControl, Breadcrumb, Modal } from 'react-bootstrap';
import Chess from 'chess.js';

import { Menu } from './components/Menu.jsx';
import { TournamentSelector } from "./components/MoveEvalPage.jsx";
import { DBChooser } from './components/DBChooser.jsx';
import { EvaluationWindow } from './components/AdminComponents.jsx';
import { SearchWindow } from './components/SearchWindow.jsx';
import { HOC, exposeRouter, objectIsEmpty, loginDummyUser, logout, getUser, ThemeContext, contextComp, defaultLoc, resultPanels, updateLoc, getUrl} from './helpers.jsx';

import myData from '/home/cg/data/output/tests.json';
import {testVar, axios} from './api.js';
import {getRequest, postRequest} from './api.js';
import styles from './App.css';
import statStyles from './components/StatWindows.css';

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
    const crumb = (key, value, name) => <Breadcrumb.Item key={name} onClick={ this.sendLocation(key, value) }> {name} </Breadcrumb.Item>;
    const loc = this.props.loc;
    const homeCrumb = crumb("db", null, "home");
    const dbCrumb = loc.db != null ? crumb("db", loc.db, loc.db.name) : null;
    const showCrumb = loc.showType != null ? crumb("showType", loc.showType, loc.showType) : null;
    const gameCrumb = loc.game != null ? crumb("game", loc.game, loc.game.id) : null;
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
		<h2 className={statStyles.statTitle}>Chess analytics</h2>
		<p>Get statistics on games based on evaluations of every single move.</p>
	</Jumbotron>
)

export class App extends React.Component {
  constructor(props) {
    super(props);
    document.title = "Chess statistics"
    this.state = {
      dbData: []
    , db: null
    , tournamentData: []
    , summaryData: {}
    , user: {}
    , loc: defaultLoc
    , locationList: []
    };
  }
  updateDatabases = () => this.props.getDatabaseData().then(this.displayDatabases);
  componentDidMount = () => {
    const updateUser = () => axios.get(getUrl('api/user')).then(this.updateUser);
    updateUser();
    debugFunctions.login = () => loginDummyUser(updateUser);
    debugFunctions.logout = () => {
      logout(() => {});
      this.updateUser({data: {}});
    }
    window.debugFunctions.user = () => this.state.user;
    window.debugFunctions = debugFunctions;

  }
  components = {
      AppForDB: contextComp(AppForDB)
    , DBChooser: contextComp(DBChooser)
    , Navigator: contextComp(BreadcrumbNavigator)
  }
  displayDatabases = (data) => {
    this.setState({dbData: data.data});
  }
  updateUser = (user) => {
    this.setState({user: user.data}, this.updateDatabases);
  }
  fileUploadHandler = (data) => {
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
        this.setDB(dbLoc);
      }
      if (locList.game != undefined) {
        const game = locList.game
        const showType = resultPanels.gameList;

      }
    }
  }
  /* When setting a database, we also updte the tournaments. This is necessary to 
  ensure that the search window works correctly, because it expects the tournaments to
  correspond to the database */
  setDB = db => { 
    const furtherUpdates = () => {
      getRequest(getUrl('api/dataSummary'), {searchDB: db.id}, this.processSummaryResponse);
    }
    const stateUpdater = tournaments => {
      const data = {db: db.id, tournamentData: tournaments.data};
      this.setState(data, furtherUpdates);
    }
    getRequest(getUrl('api/tournaments'), {searchDB: db.id}, stateUpdater);
  }
  processSummaryResponse = (data) => {
    this.setState({'summaryData': data.data});
  }
  routeForDB = (route) => {
    routeStart = route[0];
  }
  locSetter = loc => {
    const oldLoc = this.state.loc;
    this.setState({loc: loc}, this.navigateToLoc(oldLoc))
  }
  leaveDB = () => {
    this.locSetter(updateLoc(this.state.loc, "db", null));
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
				<DBChooserLoc dbData={this.state.dbData} dbAction={this.setDB}/>
			</div>)
      if (this.userIsLoggedIn()){
        fileDiv = <FileReader fileContentCallback={ this.fileUploadHandler }/>
      }
    }
    var appForDB = <div/>
    if (this.state.loc.db != null){
      const db = this.state.loc.db.id;
      const url = "/db/" + db;
      const AppForDBLoc = this.components.AppForDB;
      appForDB = <AppForDBLoc db={db} tournamentData={ this.state.tournamentData } summaryData={ this.state.summaryData} leaveDB={this.leaveDB} user={this.state.user} router={this.routeForDB}/>;
    }
    const Navigator = this.components.Navigator ;
    const nav = <Navigator/>;
    
    return (
      <ThemeContext.Provider value={this.contextData()}>
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
      </ThemeContext.Provider>
    )
  }
}

App.defaultProps = {
  getDatabaseData: () => axios.get(getUrl('api/databases'))
}

const fileReaderState = { showModal: false, file: 0, name: "" };

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

  submitResultsCallback = () => {
    var reader = new window.FileReader()
    reader.onload = (e) => {
      const data = { uploadName: this.state.name, uploadText: reader.result };
      this.props.fileContentCallback(data);
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



const isAdmin = false;

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
    const search = <SearchWindow key={this.props.db} db={this.props.db} tournamentData={this.props.tournamentData}/>
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
