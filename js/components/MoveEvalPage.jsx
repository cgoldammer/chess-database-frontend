import React from 'react';
import ReactDOM from 'react-dom';
import { Grid, Row, Col } from 'react-flexbox-grid';
import { Button, DropdownButton, MenuItem, ButtonGroup, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

import d3 from 'd3'
import { LineChart } from 'react-d3-components'

import Select from 'react-select';

import { Board } from "./Board.jsx";
import {testVar, axios, postRequest} from '../api.js';

export class MoveEvalGraph extends React.Component {
	constructor(props) {
		super(props);
		this.state = { 
			selectedPlayers: [1],
		};
	}
	onChange = (selectedPlayers) => {
		this.setState({ selectedPlayers });
	};
	hasData = () => this.props.moveData.length > 0;
	getChartData = () => prepareForChart(this.props.moveData, this.state.selectedPlayers);
	getAllPlayers = () => this.props.moveData.map((x) => x.key);
	getAllData = () => prepareForChart(this.props.moveData, this.getAllPlayers());
	getExtents = () => extentsForData(this.getAllData());
	getChartSeries = () => this.props.moveData.map((x) => ({field: 'eval' + x.key, name: x.player}));
	render = () => {
		const margins = {left: 100, right: 100, top: 50, bottom: 50}
		const extents = this.getExtents()

		if (!this.hasData()) {
			return <div/>
		}
		else {
			var style = {
				'marginTop': 50,
				'marginBottom': 50,
			};
			var chartArea = <LineChart data={this.getChartData()} width={450} height={400}
				xScale={d3.scale.linear().domain(extents[0]).range([0, 350])}
				yScale={d3.scale.linear().domain(extents[1]).range([0, 300])}
				margin={{top: 10, bottom: 50, left: 50, right: 10}}
				xAxis={{innerTickSize: 1, zero:150, label: "Move"}}
				yAxis={{label: "Average evaluation for the player"}}
			/>

			return (
				<div style={style}>
					<Grid fluid>
						<Row>
							<Col md={4}>
								<div>Select players</div>
								<ToggleButtonGroup vertical type="checkbox" value={this.state.selectedPlayers} onChange={this.onChange}>
									{this.props.moveData.map((x) => <ToggleButton key={x.key} value={x.key}>{x.player}</ToggleButton>)}
								</ToggleButtonGroup>
							</Col>
							<Col md={8}>
								{chartArea} 
							</Col>
						</Row>
					</Grid>
				</div>
			);
		}
	}
}

MoveEvalGraph.defaultProps = {
	moveData: []
}

var fakeGameData = {
	'id': 10,
	'White': 'Anna A',
	'Black': 'Bo B',
	'pgn': '1. e4 e5 2. Nf3 Nc6',
	'date': '2014-01-02'}



export class SearchWindow extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: [],
			gamesData: [fakeGameData]
		}
	}
	cleanGameData = (data) => {
		console.log("Cleaning: " + data);
		const playerName = (player) => player.lastName + ', ' + player.firstName
		const cleaned = {
			'id': data.gameDataGame.id,
			'White': playerName(data.gameDataPlayerWhite),
			'Black': playerName(data.gameDataPlayerBlack),
			'pgn': data.gameDataGame.pgn
		};
		return cleaned
	}
	
	processResponse = (data) => {
		this.setState({'gamesData': data.data.map(this.cleanGameData)});
	}
	obtainGamesForTournament = (selected) => {
		const data = {
			gameRequestDB: this.props.db,
			gameRequestTournaments: [selected]
		};
		const headers = {"Content-Type": "application/json"};
		const opts = {'headers': headers};
		postRequest('/snap/api/games', data, this.processResponse);
	};
	

	hasGames = () => this.state.gamesData.length > 0
	// A TournamentChooser, then load the selected tournament state into the
  // SearchWindow. Changes in the selected tournaments trigger a data load
	// once that data arrives, show it in a GameTable
	render = () => {
		var gamesTable = <div/>
		if (this.hasGames()){
			gamesTable = <Row> <GamesTable gamesData={this.state.gamesData}/> </Row>;
		}
		return (
			<Grid>
				<Row>
					<TournamentChooser tournamentData={this.props.tournamentData} tournamentAction={this.obtainGamesForTournament}/>
				</Row>
				{gamesTable}
			</Grid>
		)
	}
}

export class GamesTable extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedIndex: 0,
			selectedGame: {}
		}
	}
  selectRow = () => {
    return {
      mode: 'radio',
      clickToSelect: true,
      onSelect: this._onRowSelect.bind(this),
      bgColor: 'pink',
      hideSelectColumn: true
    }
  }
  _onRowSelect = (row, isSelected, e) => {
    this.setState({selectedIndex: row.id, selectedGame: row});
  }
  render() {
		const data = this.props.gamesData;
		var board = <div/>;
		console.log('rendering');
		console.log(this.state);
		if (this.state.selectedIndex > 0){
			board = <Row><Board pgn={this.state.selectedGame.pgn}/></Row>;
		}
    return (
			<Grid>
				<Row>
					<BootstrapTable data={ data } selectRow={this.selectRow()}>
						<TableHeaderColumn dataField='id' isKey>Id</TableHeaderColumn>
						<TableHeaderColumn dataField='White' width='20%'>White</TableHeaderColumn>
						<TableHeaderColumn dataField='Black' width='20%'>Black</TableHeaderColumn>
						<TableHeaderColumn dataField='pgn' width='40%'>Pgn</TableHeaderColumn>
						<TableHeaderColumn dataField='date' width='10%'>Date</TableHeaderColumn>
					</BootstrapTable>
				</Row>
				{ board }
			</Grid>
		)
  }
}

export class DBChooser extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: '',
		};
	}
	selectDB = (selected) => {
		this.setState({ selected });
		this.props.dbAction(selected);
	};
	hasData = () => this.props.dbData.length > 0;

	render = () => {
		console.log("RENDERING chooser");
		console.log(this.props.dbData);
		return (
			<Grid>
				<Row>
					<Col xs={12} mdOffset={3} md={6}>
						<span>Database</span>
						<Select 
							value={this.state.selected}
							options={this.props.dbData} 
							valueKey={'id'}
							labelKey={'name'}
							simpleValue={true}
							placeholder={'pick a database'}
							onChange={this.selectDB}/>
					</Col>
				</Row>
			</Grid> 
		)
	}
}

export class TournamentChooser extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: '',
		};
	}
	selectTournament = (selected) => {
		this.setState({ selected });
		this.props.tournamentAction(selected);
	};
	hasData = () => this.props.tournamentData.length > 0;

	render = () => {

		return (
			<Grid>
				<Row>
					<Col xs={12} mdOffset={3} md={6}>
						<span>Tournament</span>
						<Select 
							value={this.state.selected}
							options={this.props.tournamentData} 
							valueKey={'id'}
							labelKey={'name'}
							simpleValue={true}
							placeholder={'pick a tournament'}
							onChange={this.selectTournament}/>
					</Col>
				</Row>
			</Grid> 
		)
	}
}

TournamentChooser.defaultProps = {
	tournamentData: []
}


export class TournamentSelector extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: '',
			moveData: []
		};
	}
	processResponse = (data) => {
		this.setState({'moveData': data.data});
	}
	selectTournament = (selected) => {
		this.setState({ selected });
		const data = {"moveRequestTournaments": [selected]};
		const headers = {"Content-Type": "application/json"};
		const opts = {'headers': headers};
		axios.post('/snap/api/moveSummary', data, opts).then(this.processResponse);
	};
	hasData = () => this.props.tournamentData.length > 0;

	render = () => {

		return (
			<Grid>
				<Row>
					<Col xs={12} mdOffset={3} md={6}>
						<span>Tournament</span>
						<Select 
							value={this.state.selected}
							options={this.props.tournamentData} 
							valueKey={'id'}
							labelKey={'name'}
							simpleValue={true}
							placeholder={'pick a tournament'}
							onChange={this.selectTournament}/>
					</Col>
				</Row>
				<Row>
					<MoveEvalGraph moveData={this.state.moveData}/>
				</Row>
			</Grid> 
		)
	}
}

TournamentSelector.defaultProps = {
	tournamentData: []
}


const extentsForData = (moveData) => {
	const maxMove = 60;
	var xmin = d3.min(moveData, (x) => d3.min(x.values, (row) => row.x));
	var xmax = d3.max(moveData, (x) => d3.max(x.values, (row) => row.x));
	var ymin = d3.min(moveData, (x) => d3.min(x.values, (row) => row.y));
	var ymax = d3.max(moveData, (x) => d3.max(x.values, (row) => row.y));

	
	// return [[xmin, Math.min(maxMove, xmax)], [ymax, ymin]];
	return [[xmin, Math.min(maxMove, xmax)], [+3, -3]];
}

const prepareForChart = (moveData, selectedPlayers) => {
	const playerSet = new Set(selectedPlayers);
	const moveDataForPlayers = moveData.filter((x) => playerSet.has(x.key));
	const reshapeMoves = (moves) => {
		const keys = Object.keys(moves)
		return keys.map((k) => ({x: +k, y: + moves[k] / 100}));
	}

	const formatRow = (x) => ({ label: x.player, values: reshapeMoves(x.evaluations) })
	const formatted = moveDataForPlayers.map(formatRow);
	console.log(formatted);
	return formatted
}

