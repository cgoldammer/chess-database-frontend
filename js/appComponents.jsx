import React from 'react';
import { Button, DropdownButton, MenuItem, FormControl } from 'react-bootstrap';
import { Grid, Row, Col } from 'react-flexbox-grid';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

import myData from '/home/cg/data/output/tests.json';
import {testVar, axios} from './api.js';
import { SolutionShow } from "./components/SolutionShow.jsx";
import { Menu } from './components/Login.jsx';
import { TournamentSelector } from "./components/MoveEvalPage.jsx";
import { DBChooser } from './components/DBChooser.jsx';
import { SearchWindow } from './components/SearchWindow.jsx';
import { Board } from "./components/Board.jsx";
import Chess from 'chess.js';

import { objectIsEmpty } from './helpers.js';

import {postRequest} from './api.js';

import styles from './App.css';

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


export class App extends React.Component {
	constructor(props) {
		super(props);
		document.title = "Chess statistics"
		this.state = {
			dbData: [],
			db: null,
      tournamentData: [],
      summaryData: {},
      user: {}
		};
	}
  updateDatabases = () => this.props.getDatabaseData().then(this.displayDatabases);
	componentDidMount = () => {
    this.updateDatabases();
	}
	displayDatabases = (data) => {
		this.setState({dbData: data.data});
	}
  updateUser = (user) => {
    this.setState({user: user.data});
    this.updateDatabases()
  }
  fileUploadHandler = (data) => {
    const uploadDone = () => {
    }
    postRequest('/snap/api/uploadDB', data, uploadDone);
  }
  userIsLoggedIn = () => !objectIsEmpty(this.state.user)

	setDB = (db) => { 
    this.setState({db: db}) 
		const data = {searchDB: db};
		postRequest('/snap/api/tournaments', data, this.processTournamentData);
		postRequest('/snap/api/dataSummary', data, this.processSummaryResponse);
  }
	processTournamentData = (data) => {
		this.setState({'tournamentData': data.data});
	}
	processSummaryResponse = (data) => {
		this.setState({'summaryData': data.data});
	}
  leaveDB = () => this.setState({db: null});
	render = () => {
    var setDB = <div></div>
    if (this.state.db == null){
      setDB = <DBChooser dbData={this.state.dbData} dbAction={this.setDB}/>;
    }
		var appForDB = <div/>
		if (this.state.db != null){
			appForDB = <Row><AppForDB db={this.state.db} tournamentData={ this.state.tournamentData } summaryData={ this.state.summaryData} leaveDB={this.leaveDB}/></Row>
		}
    var fileDiv = <div></div>
    if (this.userIsLoggedIn()){
      fileDiv = <FileReader fileContentCallback={ this.fileUploadHandler }/>
    }
    
		return (
			<Grid fluid>
        <Row> <div className={styles.Menu}>
          <Menu userCallback={ this.updateUser } user= { this.state.user }/>
        </div></Row>
        { fileDiv }
				<Row> { setDB } </Row>
				{ appForDB }
			</Grid>
		)
	}
}

App.defaultProps = {
  getDatabaseData: () => axios.get('/snap/api/databases')
}


export class FileReader extends React.Component {
  constructor(props) {
    super(props);
    this.state = { file: 0, name: "" };
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

  validateForm = () => this.state.file && this.state.name.length > 0;

  render = () => {
    var dbNameInput = <div/>
    if (this.state.file) {
      dbNameInput = (
        <div>
          <FormControl
          type="text"
          value={this.state.value}
          placeholder="Enter name"
          onChange={(e) => this.setState({ name: e.target.value })}
        />
          <Button onClick={ this.submitResultsCallback } disabled={ !this.validateForm() }>Submit</Button>
        </div>)
    }
    return (
      <div>
        <input type="file" onChange={ this.setFileCallback } id="input"/>
        { dbNameInput }
      </div>
    )
  }
}


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
		var search = <Row><SearchWindow db={this.props.db} tournamentData={this.props.tournamentData}/></Row>
		var summary = <div/>
		if (this.hasSummary()){
			var summary = <AppSummary data={this.props.summaryData}/>
		}
		return (
			<Grid fluid>
        <Row>
          <Button onClick={this.props.leaveDB}>Leave database</Button>
        </Row>
				{ search }
				<Row center="xs">
					{ summary }
				</Row>
			</Grid>
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
			<Grid fluid>
				<Row> <ButtonGroup > {buttons} </ButtonGroup> </Row>
				<Row> {showList} </Row>
			</Grid>
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
      <BootstrapTable data={ data } selectRow={ selectRow }>
        <TableHeaderColumn dataField='id' isKey>Id</TableHeaderColumn>
        <TableHeaderColumn dataField='white' width='45%'>White</TableHeaderColumn>
        <TableHeaderColumn dataField='black' width='45%'>Black</TableHeaderColumn>
      </BootstrapTable>)
  }
}

export const sum = (a, b) => a + b;
