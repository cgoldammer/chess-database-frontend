import React from 'react';
import ReactDOM from 'react-dom';
import { Button, DropdownButton, MenuItem } from 'react-bootstrap';
import { Grid, Row, Col } from 'react-flexbox-grid';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

import myData from '/home/cg/data/output/tests.json';
import {testVar, axios} from './api.js';
import { SolutionShow } from "./components/SolutionShow.jsx";
import { MoveEvalPage } from "./components/MoveEvalPage.jsx";
import { Board } from "./components/Board.jsx";
import Chess from 'chess.js';

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

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			moveData: []
		};
	}
	hasData = () => {
		return this.state.moveData.length > 0;
	}
	processResponse = (data) => {
		this.setState({'moveData': data.data});
	}
	componentDidMount = () => {
		axios.get('/moveEval').then(this.processResponse);
	}
	render = () => {
		var content = <div/>;
		if (this.hasData()){
			var content = <MoveEvalPage moveData={this.state.moveData}/>
		} 
		return (
			<Grid fluid>
				<Row>
					{ content }
				</Row>
			</Grid>
		);
	}
}


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
				<Row> {buttons} </Row>
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

ReactDOM.render(<App/>, document.getElementById("world"));
