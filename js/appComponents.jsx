import React from 'react';
import { Grid, Row, Col, Button, DropdownButton, MenuItem, FormControl, Breadcrumb, Modal } from 'react-bootstrap';

import myData from '/home/cg/data/output/tests.json';
import {testVar, axios} from './api.js';
import { SolutionShow } from "./components/SolutionShow.jsx";
import { Menu } from './components/Login.jsx';
import { TournamentSelector } from "./components/MoveEvalPage.jsx";
import { DBChooser } from './components/DBChooser.jsx';
import { EvaluationWindow } from './components/AdminComponents.jsx';
import { SearchWindow } from './components/SearchWindow.jsx';
import { Board } from "./components/Board.jsx";
import Chess from 'chess.js';
import { dummyTable } from './components/DummyTable.jsx';
import { withRouter, Link, Route } from 'react-router-dom';
import { HOC, exposeRouter, objectIsEmpty, loginDummyUser, logout, getUser, ThemeContext, contextComp, defaultLoc, resultPanels, updateLoc} from './helpers.jsx';
import {postRequest} from './api.js';
import styles from './App.css';

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
    const crumb = (key, value, name) => <Breadcrumb.Item key={key} onClick={ this.sendLocation(key, value) }> {name} </Breadcrumb.Item>;
    const loc = this.props.loc;
    console.log("LOC");
    console.log(this.props);
    const homeCrumb = crumb("db", null, "home");
    const dbCrumb = loc.db != null ? crumb("db", loc.db, loc.db.name) : null;
    const showCrumb = loc.showType != null ? crumb("showType", loc.showType, loc.showType) : null;
    const gameCrumb = loc.game != null ? crumb("game", loc.game, loc.game) : null;
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
    const updateUser = () => axios.get('/snap/api/user').then(this.updateUser);
    updateUser();
    debugFunctions.login = () => loginDummyUser(updateUser);
    debugFunctions.logout = () => {
      logout(() => {});
      this.updateUser({data: {}});
    }
    window.debugFunctions.user = () => this.state.user;
    window.debugFunctions = debugFunctions;
  }
  displayDatabases = (data) => {
    this.setState({dbData: data.data}); //, () => this.setDB(this.state.dbData[0], true));
  }
  updateUser = (user) => {
    this.setState({user: user.data}, this.updateDatabases);
  }
  fileUploadHandler = (data) => {
    const uploadDone = () => {
      this.updateDatabases();
    }
    postRequest('/snap/api/uploadDB', data, uploadDone);
  }
  userIsLoggedIn = () => !objectIsEmpty(this.state.user)
  navigateToLoc = () => {
    const locList = this.state.loc;
    if (locList.db == null){
      this.leaveDB();
    }
    else {
      console.log("Setting DB");
      const dbLoc = locList.db;
      this.setDB(dbLoc);
    }
  }
  /* When setting a database, we also updte the tournaments. This is necessary to 
  ensure that the search window works correctly, because it expects the tournaments to
  correspond to the database */
  setDB = db => { 
    const furtherUpdates = () => {
      postRequest('/snap/api/dataSummary', {searchDB: db.id}, this.processSummaryResponse);
    }
    const stateUpdater = tournaments => {
      const data = {db: db.id, tournamentData: tournaments.data};
      console.log("updating db state");
      console.log(data);
      this.setState(data, furtherUpdates);
    }
    postRequest('/snap/api/tournaments', {searchDB: db.id}, stateUpdater);
  }
  processTournamentData = (data) => {
    this.setState({'tournamentData': data.data});
  }
  processSummaryResponse = (data) => {
    this.setState({'summaryData': data.data});
  }
  routeForDB = (route) => {
    routeStart = route[0];
  }
  locSetter = loc => this.setState({loc: loc}, this.navigateToLoc)
  leaveDB = () => {
    // this.context.router.history.push('/');
    this.locSetter(updateLoc("db", null));
    // this.setState({db: null});
  }
  contextData = () => {
    const locSetter = this.locSetter
    return {loc: this.state.loc, locSetter: locSetter}
  }
  render = () => {

    var setDB = <div></div>
    var fileDiv = <div></div>
    if (this.state.loc.db == null){
      const DBChooserLoc = contextComp(DBChooser);
      setDB = <DBChooserLoc dbData={this.state.dbData} dbAction={this.setDB}/>;
      if (this.userIsLoggedIn()){
        fileDiv = <FileReader fileContentCallback={ this.fileUploadHandler }/>
      }
    }
    var appForDB = <div/>
    if (this.state.loc.db != null){
      console.log("Now showing app");
      const db = this.state.loc.db.id;
      const url = "/db/" + db;
      const AppForDBLoc = contextComp(AppForDB);
      appForDB = <AppForDBLoc db={db} tournamentData={ this.state.tournamentData } summaryData={ this.state.summaryData} leaveDB={this.leaveDB} user={this.state.user} router={this.routeForDB}/>;
    }
    const Navigator = contextComp(BreadcrumbNavigator);
    const nav = <Navigator/>;
    
    return (
      <ThemeContext.Provider value={this.contextData()}>
        <Menu userCallback={ this.updateUser } user= { this.state.user }/>
        <Grid fluid>
          <Row>
            { nav } 
          </Row>
          <Row>
            { appForDB }
          </Row>
          <Row>
            <Col md={6} mdOffset={3}>
              { setDB }
              { fileDiv }
            </Col>
          </Row>
        </Grid>
      </ThemeContext.Provider>
    )
  }
}

App.defaultProps = {
  getDatabaseData: () => axios.get('/snap/api/databases')
}
// App.contextTypes = {
//   router: React.PropTypes.function.isRequired
// }

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
    const search = <SearchWindow db={this.props.db} tournamentData={this.props.tournamentData}/>
    var summary = <div/>
    if (this.hasSummary()){
      var summary = <AppSummary data={this.props.summaryData}/>
    }
    var adminWindow = isAdmin ? <EvaluationWindow db={this.props.db}/> : <div/>

    return (
      <div>
        { search }
        { adminWindow }
        { summary }
      </div>
    );
  }
}

AppForDB.defaultProps = {
  summaryData: {},
  tournamentData: []
}

// The main app is dependent on the database. So we have an app that consists of a dbSelector
// and a main app

class ExerciseApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allData: {},
      selectedData: ""
    }
  }
  hasSelection = () => {
    return this.state.selectedData != "";
  }
  processResponse = (data) => {
    this.setState({'allData': mapOverObject(data.data, prepareData)});
  }
  componentDidMount = () => {
    axios.get('/moves').then(this.processResponse);
  }
  collections = () => {
    return Object.keys(this.state.allData)
  }
  hasData = () => {
    return this.collections().length > 0;
  }
  doSelect = (name) => {
    return () => { this.setState({selectedData: name})};
  }
  render = () => {
    var collections = this.collections();
    var buttons = collections.map((key) => <Button key={key} onClick={this.doSelect(key)}> {key} </Button>);
    var showList = <div/>;
    if (this.hasSelection()){
      var selectedData = this.state.allData[this.state.selectedData];
      var showList = <ShowList data={selectedData}/>
    } 
    return (
      <div>
        <Row> <ButtonGroup > {buttons} </ButtonGroup> </Row>
        <Row> {showList} </Row>
      </div>
    )
  }
}

class ShowList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: 0,
      collection: "",
      correctMove: [],
      madeMove: false,
    };
  }

  hasData = () => {
    return this.props.data.length > 0;
  }

  getRowData = () => {
    var rowData = Object.assign({}, this.props.data[this.state.selectedIndex]);
    if (this.state.correctMove.length > 0){
      var chess = new Chess(rowData.fen);
      var correctMove = this.state.correctMove
      var from = correctMove[0];
      var to = correctMove[1];
      var moveString = from + to;
      chess.move({from: from, to: to});
      rowData.fen = chess.fen()
    }
    return rowData;
  }

  _onRowSelect = (row, isSelected, e) => {
    this.setState({selectedIndex: row.id, correctMove: [], madeMove: false, moveTried:[]});
  }

  _selectRowProp = () => {
    return {
      mode: 'radio',
      clickToSelect: true,
      onSelect: this._onRowSelect.bind(this),
      bgColor: 'pink',
      hideSelectColumn: true
    }
  }

  tryAnswer = (from, to) => {
    let message = 'Tried: ' + from + " to " + to + ' !';
    this.setState({'moveTried': [from, to]});
  }
  makeMove = (move) => {
    if (!this.state.madeMove){
      this.setState({correctMove: move, madeMove: true});
    }
  }

  renderContent() {
    return (
      <Row>
          <Col md={6}>
            <div> HI </div>
            <PositionTable data={this.props.data} selectedIndex={this.state.selectedIndex} selectRow={this._selectRowProp()}/>
          </Col>
        <Col md={6}>
          <Row>
            <Board rowData={this.getRowData()} tryAnswer={this.tryAnswer}/>
          </Row>
          <Row>
          <SolutionShow rowData={this.getRowData()} makeMove={this.makeMove} moveTried={this.state.moveTried}/>
          </Row>
        </Col>
      </Row>
    );
  }
  render() {
    if (this.hasData()){
      return this.renderContent();
    }
    return <h1> Loading data </h1>;
  }
}


class PositionTable extends React.Component {
  constructor(props){
    super(props);
  }
  render() {
    // const selectRow = {mode:'radio'};
    const data = this.props.data;
    const selectRow = this.props.selectRow;
    return (
      <div/>
    )
      // <BootstrapTable data={ data } selectRow={ selectRow }>
      //   <TableHeaderColumn dataField='id' isKey>Id</TableHeaderColumn>
      //   <TableHeaderColumn dataField='white' width='45%'>White</TableHeaderColumn>
      //   <TableHeaderColumn dataField='black' width='45%'>Black</TableHeaderColumn>
      // </BootstrapTable>)
  }
}

export const sum = (a, b) => a + b;
