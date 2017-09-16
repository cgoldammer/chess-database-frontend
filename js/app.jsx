import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';
import { Grid, Row, Col } from 'react-flexbox-grid';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

import myData from '/home/cg/data/output/tests.json';
import {testVar, axios} from './api.js';
import { SolutionShow } from "./components/SolutionShow.jsx";
import { Board } from "./components/Board.jsx";
import Chess from 'chess.js';

String.prototype.number = function (find) {
  return this.split(find).length - 1;
}

const prepareData = function(data){
	for (var x = 0; x < data.length; x++){
		data[x].id = x;
		var rand = Math.random();
		var bestMove = data[x].moveTestBest
		var actualMove = data[x].moveTestMove

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
			data: [],
      selectedIndex: 0,
			collection: "",
			correctMove: [],
			madeMove: false,
    };
  }

	hasData = () => {
		return this.state.data.length > 0;
	}

	getRowData = () => {
		var rowData = Object.assign({}, this.state.data[this.state.selectedIndex]);
		if (this.state.correctMove.length > 0){
			console.log("Row data before:" + rowData.moveTestFen);
			console.log("CORECT MOVE");
			var chess = new Chess(rowData.moveTestFen);
			var correctMove = this.state.correctMove
			var from = correctMove[0];
			var to = correctMove[1];
			var moveString = from + to;
			chess.move({from: from, to: to});
			console.log(moveString);
			console.log(chess.fen());
			rowData.moveTestFen = chess.fen()
			console.log("Row data after:" + rowData.moveTestFen);
		}
		console.log(rowData);
		return rowData;
	}

  _onRowSelect = (row, isSelected, e) => {
    console.log(row);
    this.setState({selectedIndex: row.id, correctMove: [], madeMove: false, moveTried:[]});
    console.log(row.moveTestBest);
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

	processResponse = (data) => {
		console.log("Received data");
		console.log(data.data);
		this.setState({'data': prepareData(data.data.Najdorf)});
		console.log("data updated");
		console.log("State: " + this.state);
	}

	componentDidMount = () => {
		console.log("testVar");
		console.log(testVar);
		console.log("testVar after");
		axios.get('/moves').then(this.processResponse);
	}
	tryAnswer = (from, to) => {
		let message = 'Tried: ' + from + " to " + to + ' !';
		console.log(message);
		// Update the solution show component
		this.setState({'moveTried': [from, to]});
	}
	makeMove = (move) => {
		if (!this.state.madeMove){
			this.setState({correctMove: move, madeMove: true});
			console.log("Set correct move");
		}
	}

	renderContent() {
		return (
			<Grid fluid>
				<Row>
						<Col md={6}>
							<div> HI </div>
							<PositionTable data={this.state.data} selectedIndex={this.state.selectedIndex} selectRow={this._selectRowProp()}/>
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
			</Grid>
		);
	}
  render() {
		if (this.hasData()){
			return this.renderContent();
		}
		return <h1> Loading data </h1>;
  }
}


// function fenName(fen, row){
  // const pieces = ["q", "r", "b", "k"]
  // var str = "White:"
  // for (let piece of pieces){
    // str += " " + piece.toUpperCase() + fen.number(piece.toUpperCase());
  // }
  // str += " | Black:"
  // for (let piece of pieces){
    // str += " " + piece.toUpperCase() + fen.number(piece);
  // }
  // return str;
// }


class PositionTable extends React.Component {
  constructor(props){
    console.log(props.selectRow);
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

// const squareSize = 70;

ReactDOM.render(<App/>, document.getElementById("world"));
