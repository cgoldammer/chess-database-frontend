import React from 'react';
import ReactDOM from 'react-dom';
import { Panel, Grid, Row, Col, Button, DropdownButton, MenuItem, ButtonGroup, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

import d3 from 'd3'
import { LineChart } from 'react-d3-components'
import Select from 'react-select';

import { Board } from "./Board.jsx";
import {testVar, axios, postRequest} from '../api.js';

class Legend extends React.Component {
	constructor(props) {
		super(props);
	}
  render = () => {
    const legendEntry = (selected, index) => {
      const color = this.props.colorScale(selected.index);
      console.log(index + ": " + color);
      const style = {float: "left", backgroundColor: color, margin: "2px 2px", minHeight: "12px", minWidth: "50px"};
      return (
        <div style={{margin: "0px 50px"}} key={index}><span style={style}></span><span>{selected.name}</span></div>
      )
    }
    console.log("selected");
    console.log(this.props.selected);
    return (
      <div>
        { this.props.selected.map(legendEntry) }
      </div>
    )
  }
}

const colorScale = d3.scale.category20();

export class MoveEvalGraph extends React.Component {
	constructor(props) {
		super(props);
		this.state = { 
			selectedPlayers: [],
		};
	}
	onChange = selected => this.setState({ selectedPlayers: selected.map(x => ({value:x.value, name: x.label, index: x.index}))})
	hasData = () => this.props.moveData.length > 0;
	getChartData = () => prepareForChart(this.props.moveData, this.state.selectedPlayers.map(p => p.value))
	getAllPlayers = () => this.props.moveData.map(x => x.key)
	getAllData = () => prepareForChart(this.props.moveData, this.getAllPlayers())
	getExtents = () => extentsForData(this.getAllData())
	getChartSeries = () => this.props.moveData.map((x) => ({field: 'eval' + x.key, name: x.player}));
	getSelectOptions = () => this.props.moveData.map((x, index) => ({value: x.key, label: x.player, index: index}));
	render = () => {
		const margins = {left: 100, right: 100, top: 50, bottom: 50}
		const extents = this.getExtents()
    window.color = colorScale;
    const options = this.getSelectOptions();
    console.log("legend data");
    console.log(this.state.selectedPlayers);
    const legend = <Legend colorScale={colorScale} selected={this.state.selectedPlayers}/>

		if (!this.hasData()) {
      return <div/> } else { var style = { 'marginTop': 50, 'marginBottom': 50,
			};
			var chartArea = <LineChart data={this.getChartData()} width={450} height={300}
				xScale={d3.scale.linear().domain(extents[0]).range([0, 350])}
				yScale={d3.scale.linear().domain(extents[1]).range([0, 300])}
        colorScale={colorScale}
				margin={{top: 10, bottom: 5, left: 50, right: 10}}
				xAxis={{innerTickSize: 1, zero:150, label: "Move"}}
				yAxis={{label: "Average evaluation for the player"}}
			/>

			const { selectedPlayers } = this.state;
			return (
				<div>
					<h2>Evaluation by Move</h2>
					<div style={style}>
						<Row>
							<Col md={4}>
								<Select multi={true} value={selectedPlayers.map(p => p.value)} onChange={this.onChange} options={options}/>
							</Col>
							<Col md={8}>
								{chartArea} 
                {legend}
							</Col>
						</Row>
					</div>
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

const extentsForData = (moveData) => {
	const maxMove = 60;
	var xmin = d3.min(moveData, (x) => d3.min(x.values, (row) => row.x));
	var xmax = d3.max(moveData, (x) => d3.max(x.values, (row) => row.x));
	var ymin = d3.min(moveData, (x) => d3.min(x.values, (row) => row.y));
	var ymax = d3.max(moveData, (x) => d3.max(x.values, (row) => row.y));
	
	return [[xmin, Math.min(maxMove, xmax)], [+3, -3]];
}

const prepareForChart = (moveData, selectedPlayers) => {
	const playerSet = new Set(selectedPlayers);
	const moveDataForPlayers = moveData.filter(x => playerSet.has(x.key));
	const reshapeMoves = moves => {
		const keys = Object.keys(moves)
		return keys.map(k => ({x: +k, y: + moves[k] / 100}));
	}

	const formatRow = x => ({ label: x.player, values: reshapeMoves(x.evaluations) })
	const formatted = moveDataForPlayers.map(formatRow);
	console.log("formatted")
	console.log(formatted)
	return formatted
}

