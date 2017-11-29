import React from 'react';
import ReactDOM from 'react-dom';
import { Grid, Row, Col } from 'react-flexbox-grid';
import { Button, DropdownButton, MenuItem, ButtonGroup, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

import d3 from 'd3'
import { LineChart } from 'react-d3-components'

import {axios} from './../api.js';

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
	getChartData = () => prepareForChart2(this.props.moveData, this.state.selectedPlayers);
	getAllPlayers = () => this.props.moveData.map((x) => x.key);
	getAllData = () => prepareForChart2(this.props.moveData, this.getAllPlayers());
	getExtents = () => extentsForData(this.getAllData());
	getChartSeries = () => this.props.moveData.map((x) => ({field: 'eval' + x.key, name: x.player}));
	render = () => {
		const margins = {left: 100, right: 100, top: 50, bottom: 50}
		const extents = this.getExtents()
		var chartArea = <div> Select players </div>
		if (this.hasData()){
			chartArea = <LineChart data={this.getChartData()} width={450} height={400}
			xScale={d3.scale.linear().domain(extents[0]).range([0, 350])}
			yScale={d3.scale.linear().domain(extents[1]).range([0, 300])}
			margin={{top: 10, bottom: 50, left: 50, right: 10}}
			xAxis={{innerTickSize: 1, zero:150, label: "Move"}}
			yAxis={{label: "Average evaluation for the player"}}
			/>

		}

		return (
			<Grid fluid>
				<Row>
					<Col md={3}>
						<ToggleButtonGroup vertical type="checkbox" value={this.state.selectedPlayers} onChange={this.onChange}>
							{this.props.moveData.map((x) => <ToggleButton key={x.key} value={x.key}>{x.player}</ToggleButton>)}
						</ToggleButtonGroup>
					</Col>
					<Col md={2}>
						<div/>
					</Col>
					<Col md={7}>
						{chartArea} 
					</Col>
				</Row>
			</Grid>
		);
	}
}

MoveEvalGraph.defaultProps = {
	moveData: []
}

export class TournamentSelector extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedTournaments: [],
			moveData: []
		};
	}
	processResponse = (data) => {
		console.log("Received data");
		console.log(data.data);
		this.setState({'moveData': data.data});
	}
	onChange = (selectedTournaments) => {
		this.setState({ selectedTournaments });
		const data = {"moveRequestTournaments": selectedTournaments};
		const headers = {"Content-Type": "application/json"};
		const opts = {'headers': headers};
		axios.post('/snap/levels/moveSummary', data, opts).then(this.processResponse);
	};
	hasData = () => this.props.tournamentData.length > 0;

	render = () => {
		return (
			<Grid fluid>
				<Row>
					<ToggleButtonGroup type="checkbox" value={this.state.selectedTournaments} onChange={this.onChange}>
						{this.props.tournamentData.map((x) => <ToggleButton key={+x.id} value={x.id}>{x.name}</ToggleButton>)}
					</ToggleButtonGroup>
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

const prepareForChart2 = (moveData, selectedPlayers) => {
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

const prepareForChart = (moveData, selectedPlayers) => {
	const playerSet = new Set(selectedPlayers);
	console.log("Players");
	console.log(selectedPlayers);
	const moveDataForPlayers = moveData.filter((x) => playerSet.has(x.key));
	const moves = Object.keys(moveData[0].evaluations);

	const objectForMove = (move) => {
		const values = moveDataForPlayers.map((x) => ({key: x.key, value: x.evaluations[move] }));
		var obj = {};
		obj['move'] = + move;
		for (var value of values){
			obj['eval' + value.key] = value.value;
		}
		return obj
	};

	return moves.map(objectForMove);
}
