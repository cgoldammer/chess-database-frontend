import 'regenerator-runtime/runtime';
import React from 'react';
import {HelpBlock, Jumbotron, 
  Grid, Row, Button, 
  FormControl, Breadcrumb, Modal,} from 'react-bootstrap';
import {Menu,} from './components/Menu.jsx';
import {DBChooser,} from './components/DBChooser.jsx';
import {EvaluationWindow,} from './components/AdminComponents.jsx';
import {SearchWindow,} from './components/SearchWindow.jsx';
import {objectIsEmpty, logout, 
  updateLoc, getUrl, getLocFromUrl, defaultLoc, 
  createFullSelection,} from './helpers.jsx';
import {connect, Provider,} from 'react-redux';
import {postRequest,} from './api.js';
import statStyles from './components/StatWindows.css';
import {store, updateUrl, getLoc,} from './redux.jsx';
import {selectGame, selectShowType, selectLogin, selectDB, 
  loginOrRegister, selectionChanged,} from './actions.jsx';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import {requestDB,} from './redux.jsx';

import * as AT from './constants.js';

var debugFunctions = {};
window.debugFunctions = debugFunctions;

String.prototype.number = function (find) {
  return this.split(find).length - 1;
};

class BreadcrumbNavigator extends React.Component {
  constructor(props) {
    super(props);
  }
  sendLocation = (name, value) => () => {
    const newLoc = updateLoc(this.props.loc, name, value);
    this.props.setLoc(this.props.loc, newLoc);
  }
  render = () => {
    const crumb = (key, value, name) => <Breadcrumb.Item
      key={name}
      onClick={this.sendLocation(key, value)}> {name}
    </Breadcrumb.Item>;
    const loc = this.props.loc;

    const homeCrumb = crumb('db', null, 'home');

    var dbCrumb = null;
    if (loc.db != null && this.props.fullSelectedDB != null){
      const selectedDB = this.props.fullSelectedDB;
      dbCrumb = crumb('db', loc.db, selectedDB.name);
    }

    var showCrumb = null;
    if (dbCrumb) {
      showCrumb = loc.showType != null ? 
        crumb('showType', loc.showType, loc.showType) : null;
    }

    var gameCrumb = null;
    if (showCrumb) {
      gameCrumb = loc.game != null ? 
        crumb('game', this.props.game, this.props.game) : null;
    }

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

const Warnings = (props) => (
  <Jumbotron>
    <h2 className={statStyles.statTitle}>{props.appWarnings}</h2>
  </Jumbotron>
);


export class App extends React.Component {
  constructor(props) {
    super(props);
    document.title = 'Chess insights';
  }
  componentDidMount = () => {
    const initialLoc = () => {
      const urlLoc = getLocFromUrl(window.location.pathname.slice(1));
      this.props.setLoc(defaultLoc, urlLoc);
    };
    initialLoc();

    debugFunctions.logout = () => {
      logout(() => {});
      this.props.setUser(null);
    };
    window.debugFunctions.user = () => this.props.user;
    window.debugFunctions = debugFunctions;
  }

  fileUploadHandler = data => {
    const uploadDone = () => {
      this.props.updateDatabases();
    };
    postRequest(getUrl('api/uploadDB'), data, uploadDone);
  }
  userIsLoggedIn = () => !objectIsEmpty(this.props.user)
  processSummaryResponse = (data) => {
    this.setState({'summaryData': data.data,});
  }
  render = () => {
    var setDB = null;
    var fileDiv = null;
    if (this.props.fullSelectedDB == null){
      setDB = (<div>
        <IntroWindow/>
        <DBChooser dbData={this.props.dbData} setDB={this.props.setDB}/>
      </div>);
      if (this.userIsLoggedIn()){
        fileDiv = <FileReader fileContentCallback={this.fileUploadHandler}/>;
      }
    }
    var appForDB = <div/>;
    if (this.props.fullSelectedDB){
      appForDB = <AppForDB
        fullSelectedDB={this.props.fullSelectedDB}
        fullSelection={this.props.fullSelection}
        selection={this.props.selection}
        updateSelection={this.props.updateSelection}
        playerData={this.props.playerData.data}
        tournamentData={this.props.tournamentData.data}
        summaryData={this.props.summaryData}
        leaveDB={this.leaveDB}
        user={this.props.user}
        loginError={this.props.loginError}
        selectedGames={this.props.selectedGames}
        router={this.routeForDB}/>;
    }
    const nav = <BreadcrumbNavigator
      loc={this.props.loc}
      fullSelectedDB={this.props.fullSelectedDB}
      setLoc={this.props.setLoc}/>;

    var warnWindow = <div/>
    if (this.props.appWarnings.isError) {
      warnWindow = <Warnings appWarnings={this.props.appWarnings.name}/>
    }
    
    return (
      <Grid fluid>
        <Row>
          <Menu
            putLoginOrRegister={this.props.putLoginOrRegister}
            user={this.props.user} 
            setUser={this.props.setUser}
            loginError={this.props.loginError}
            updateSelectLogin={this.props.updateSelectLogin}
            loginTypeSelected={this.props.loginTypeSelected}
            showUserElements={this.props.features.showUsers}/>
        </Row>
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
          { warnWindow }
        </Row>
        <Row>
          { appForDB }
        </Row>
        <NotificationContainer/>
      </Grid>
    );
  }
}

const fileReaderState = {showModal: false, file: 0, name: '', showTooBigWarning: false,};

const maxFileSizeKB = 1000;
const maxFileSize = maxFileSizeKB * 1024;
export class FileReader extends React.Component {
  constructor(props) {
    super(props);
    this.state = fileReaderState;
  }
  
  setFileCallback = () => {
    const files = document.getElementById('input').files;
    if (files.length >= 0){
      const file = files[0];
      this.setState({file: file, showName: false});
      console.log(file.size);

      if (file.size >= maxFileSize){
        console.log("bad");
        this.setWarning(true);
        this.setShow(false);
      }
      else {
        console.log("good");
        this.setWarning(false);
        this.setShow(true);
      }
    }
  }
  setWarning = val => this.setState({showTooBigWarning: val,})
  setShow = show => this.setState({showName: show})

  submitResultsCallback = () => {
    var reader = new window.FileReader();
    reader.onload = () => {
      const result = reader.result;
      const data = {uploadName: this.state.name, uploadText: reader.result,};
      if (result.length >= maxFileSize){
        this.setWarning(true);
      }
      else {
        this.setWarning(false);
        this.props.fileContentCallback(data);
        this.closeModal();
        NotificationManager.info('Processing right now. Your databases will upload in a few seconds. Evaluations added in the background.', 'Processing', 5000);


      }
    };
    reader.readAsText(this.state.file);
  }
  closeModal = () => this.setState(fileReaderState);
  showModal = () => this.setState({showModal: true,});
  validateForm = () => this.state.file && this.state.name.length > 0;

  render = () => {
    var dbNameInput = <div/>;
    if (this.state.showName) {
      dbNameInput = (
        <div>
          <FormControl
            type="text"
            value={this.state.value}
            placeholder="Name of the database"
            onChange={(e) => this.setState({name: e.target.value,})}
          />
          <Button
            onClick={this.submitResultsCallback}
            disabled={!this.validateForm()}>
            Submit
          </Button>
        </div>);
    }
    return (
      <div>
        <Button onClick={this.showModal}>Upload database</Button>
        <Modal show={this.state.showModal}>
          <Modal.Header>Upload external database</Modal.Header>
          <Modal.Body>
            <input type="file" onChange={this.setFileCallback} id="input"/>
            <p> Note: The file must be in PGN format. </p>
            { this.state.showTooBigWarning ? 
              <HelpBlock style={{color: 'red',}}>
                Max file size: {maxFileSizeKB} KB
              </HelpBlock> : null
            }
            { dbNameInput }
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.closeModal}>Close</Button>
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

    const search = (this.props.fullSelection == null) ? null : (
      <SearchWindow 
        fullSelection={this.props.fullSelection}
        fullSelectedDB={this.props.fullSelectedDB} 
        selection={this.props.selection}
        updateSelection={this.props.updateSelection}
        playerData={this.props.playerData} 
        selectedGames={this.props.selectedGames}
        tournamentData={this.props.tournamentData}/>);
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
  fullSelectedDB: getSelectedDB(state.dbData, state.selectedDB),
  fullSelection: createFullSelection(state),
  loc: getLoc(state),
  players: state.players,
  user: state.user,
  tournamentData: state.tournamentData,
  playerData: state.playerData,
  gamesData: state.gamesData,
  loginError: state.loginError,
  loginTypeSelected: state.loginTypeSelected,
  appWarnings: state.appWarnings
});


const mapDispatchToProps = dispatch => ({ 
  setDB: dbId => dispatch(selectDB(dbId)),
  putLoginOrRegister: (data, url) => dispatch(loginOrRegister(data, url)),
  setUser: data => dispatch({type:AT.RECEIVE_USER, data:data,}),
  updateSelection: fullSelection => {
    dispatch(selectionChanged(fullSelection, false));
  },
  updateSelectLogin: loginType => dispatch(selectLogin(loginType)),
  setLoc: (oldLoc, newLoc) => {
    if (oldLoc.db != newLoc.db) {
      dispatch(selectDB(newLoc.db));
    }
    if (oldLoc.showType != newLoc.showType) {
      dispatch(selectShowType(newLoc.dbId, newLoc.showType));
    }
    if (oldLoc.game != newLoc.game) {
      dispatch(selectGame(newLoc.dbId, newLoc.game));
    }
    updateUrl(newLoc);
  },
  updateDatabases: () => {
    dispatch(requestDB.receiving());
  }
});

const AppConnected = connect(mapStateToProps, mapDispatchToProps)(App);


export const app = features => (
  <Provider store={store}>
    <AppConnected features={features}/>
  </Provider>
);

