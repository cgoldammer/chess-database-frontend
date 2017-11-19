import React from 'react';
import ReactDOM from 'react-dom';
import { Grid, Row, Col } from 'react-flexbox-grid';
import { Button, DropdownButton, MenuItem, ButtonGroup, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

import d3 from 'd3'
import { LineChart } from 'react-d3-basic'

export class MoveEvalPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = { 
			selectedPlayers: [1],
		};
	}
	onChange = (selectedPlayers) => {
		this.setState({ selectedPlayers });
	};
	hasData = () => this.state.selectedPlayers.length > 0;
	getChartData = () => prepareForChart(this.props.moveData, this.state.selectedPlayers);
	getChartSeries = () => {
		return [
			{field: 'eval1', name: 'Magnus'},
			{field: 'eval2', name: 'Anish'}]
	}
	render = () => {
		const margins = {left: 100, right: 100, top: 50, bottom: 50}
		var chartArea = <div> Select players </div>
		if (this.hasData()){
			chartArea = <LineChart
						title={"hello"} data={this.getChartData()} width={400} height={300} 
						x={(d) =>  d.move } margins={margins} 
						xScale={'linear'}
						chartSeries={this.getChartSeries()}/>

		}
		
		return (
			
			<Grid fluid>
				<Row> 
					<ToggleButtonGroup type="checkbox" value={this.state.selectedPlayers} onChange={this.onChange}>
						{this.props.moveData.map((x) => <ToggleButton key={x.key} value={x.key}>{x.player}</ToggleButton>)}
					</ToggleButtonGroup>
				</Row>
				<Row> {chartArea} </Row>
			</Grid>
		);
	}
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
		obj['move'] = move;
		for (var value of values){
			obj['eval' + value.key] = value.value;
		}
		return obj
	};

	return moves.map(objectForMove);
}
