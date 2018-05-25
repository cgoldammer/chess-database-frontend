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
      const style = {float: "left", backgroundColor: color, margin: "2px 2px", minHeight: "12px", minWidth: "50px"};
      return (
        <div style={{margin: "0px 50px"}} key={index}><span style={style}></span><span>{selected.name}</span></div>
      )
    }
    return (
      <div>
        { this.props.selected.map(legendEntry) }
      </div>
    )
  }
}


const isConfIntLabel = label => label.endsWith('_low') || label.endsWith('_high')

const colorScale = d3.scale.category20();
const colorScaleWithRepeat = label => {
  var cleanedLabel = label;
  if (label.endsWith('_low')){
    cleanedLabel = label.substring(0, label.length - 4)
  }
  if (label.endsWith('_high')){
    cleanedLabel = label.substring(0, label.length - 5)
  }
  return colorScale(cleanedLabel);
}

export class MoveEvalGraph extends React.Component {
	constructor(props) {
		super(props);
		this.state = { 
			selectedPlayers: [],
      showStdError: false,
		};
	}
  toggleStdError = () => this.setState((state, props) => ({showStdError: !state.showStdError}))
	onChange = selected => this.setState({ selectedPlayers: selected.map(x => ({value:x.value, name: x.label, index: x.index}))})
	hasData = () => this.props.moveData.length > 0;
	getChartData = () => prepareForChart(this.props.moveData, this.state.selectedPlayers.map(p => p.value), this.state.showStdError)
	getAllPlayers = () => this.props.moveData.map(x => x.key)
	getAllData = () => prepareForChart(this.props.moveData, this.getAllPlayers(), this.state.showStdError)
	getExtents = () => extentsForData(this.getAllData())
	getChartSeries = () => this.props.moveData.map((x) => ({field: 'eval' + x.key, name: x.player}));
	getSelectOptions = () => this.props.moveData.map((x, index) => ({value: x.key, label: x.player, index: index}));
	render = () => {
		const margins = {left: 100, right: 100, top: 50, bottom: 50}
		const extents = this.getExtents()
    window.color = colorScaleWithRepeat;
    const colorScaleForChart = colorScaleWithRepeat
    const options = this.getSelectOptions();
    const legend = <Legend colorScale={colorScale} selected={this.state.selectedPlayers}/>

    const dashFunc = function(label){
      if (isConfIntLabel(label)){
        return "4 4 4"
      }
      return null
    }

		if (!this.hasData()) {
      return <div/> } else { var style = { 'marginTop': 50, 'marginBottom': 50,
			};

      const maxWidth = 600;
      const width = Math.min(window.innerWidth - 50, maxWidth);
      const height = width;
			var chartArea = <LineChart data={this.getChartData()} width={width} height={height}
				xScale={d3.scale.linear().domain(extents[0]).range([0, width])}
				yScale={d3.scale.linear().domain(extents[1]).range([0, height])}
        colorScale={colorScaleForChart}
        stroke={{strokeDasharray: dashFunc}}
				margin={{top: 10, bottom: 5, left: 50, right: 10}}
				xAxis={{innerTickSize: 1, zero:width/2, label: "Move"}}
				yAxis={{label: "Average evaluation for the player"}}
			/>

			const { selectedPlayers } = this.state;
      const toggleButton = this.state.selectedPlayers.length > 0 ? (<Button onClick={this.toggleStdError}>Toggle standard errors</Button>) : <div/>
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
                { toggleButton }
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

const prepareForChart = (moveData, selectedPlayers, showStdError) => {
	const playerSet = new Set(selectedPlayers);
	const moveDataForPlayers = moveData.filter(x => playerSet.has(x.key));
	const reshapeMoves = moves => {
		const keys = Object.keys(moves)
    const tstat = 1.96
    const evals = keys.map(k => ({x: +k, y: + moves[k][0] / 100}));
    const confLow = keys.map(k => ({x: +k, y: + (moves[k][0] - tstat*moves[k][1]) / 100}));
    const confHigh = keys.map(k => ({x: +k, y: + (moves[k][0] + tstat*moves[k][1]) / 100}));
    return {evals: evals, confLow: confLow, confHigh: confHigh}
	}

	const formatRow = x => {
    const reshaped = reshapeMoves(x.evaluations);
    const valuesEvals = ({ label: x.player, values: reshaped.evals })
    if (!showStdError){
      return [valuesEvals]
    }
    else {
      const valuesLow = ({ label: x.player + "_low", values: reshaped.confLow })
      const valuesHigh = ({ label: x.player + "_high", values: reshaped.confHigh })
      return [valuesEvals, valuesLow, valuesHigh]
    }
  }

	const formatted = moveDataForPlayers.map(formatRow);
  const flattened = [].concat.apply([], formatted);
	return flattened
}

