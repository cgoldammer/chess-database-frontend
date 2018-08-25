import React from 'react';
import ReactDOM from 'react-dom';
import {Jumbotron, Panel, Grid, Row, Col, Button, DropdownButton, MenuItem, ButtonGroup, ToggleButton, ToggleButtonGroup,} from 'react-bootstrap';

import d3 from 'd3';
import {LineChart,} from 'react-d3-components';
import Select from 'react-select';

import {Legend,} from './Legend.jsx';
import {testVar, axios, postRequest,} from '../api.js';
import styles from './StatWindows.css';


const isConfIntLabel = label => label.endsWith('_low') || label.endsWith('_high');

const colorScale = d3.scale.category20();
const colorScaleWithRepeat = label => {
  var cleanedLabel = label;
  if (label.endsWith('_low')){
    cleanedLabel = label.substring(0, label.length - 4);
  }
  if (label.endsWith('_high')){
    cleanedLabel = label.substring(0, label.length - 5);
  }
  return colorScale(cleanedLabel);
};

export class MoveEvalGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      selectedPlayers: [],
      showStdError: false,
    };
  }
  toggleStdError = () => this.setState((state, props) => ({showStdError: !state.showStdError,}))
  onChange = selected => this.setState({selectedPlayers: selected.map(x => ({value:x.value, name: x.label, index: x.index,})),})
  hasData = () => this.props.moveSummaryData.length > 0;
  getChartData = () => prepareForChart(this.props.moveSummaryData, this.state.selectedPlayers.map(p => p.value), this.state.showStdError)
  getAllPlayers = () => this.props.moveSummaryData.map(x => x.key)
  getAllData = () => prepareForChart(this.props.moveSummaryData, this.getAllPlayers(), this.state.showStdError)
  getExtents = () => extentsForData(this.getAllData())
  getChartSeries = () => this.props.moveSummaryData.map((x) => ({field: 'eval' + x.key, name: x.player,}));
  getSelectOptions = () => this.props.moveSummaryData.map((x, index) => ({value: x.key, label: x.player, index: index,}));
  render = () => {
    const margins = {left: 100, right: 100, top: 50, bottom: 50,};
    const extents = this.getExtents();
    window.color = colorScaleWithRepeat;
    const colorScaleForChart = colorScaleWithRepeat;
    const options = this.getSelectOptions();
    const legend = <Legend colorScale={colorScale} selected={this.state.selectedPlayers}/>;
    const data = this.getChartData();

    const dashFunc = function(label){
      if (isConfIntLabel(label)){
        return '4 4 4';
      }
      return null;
    };

    if (!this.hasData()) {
      return <div/>;
    } 
    else { 
      const maxWidth = 700;
      const width = Math.min(window.innerWidth - 50, maxWidth);
      const height = width;
      var chartArea = <LineChart 
        data={this.getChartData()} 
        width={width} 
        height={height}
        xScale={d3.scale.linear().domain(extents[0]).range([0, width,])}
        yScale={d3.scale.linear().domain(extents[1]).range([0, height,])}
        colorScale={colorScaleForChart}
        stroke={{strokeDasharray: dashFunc,}}
        margin={{top: 10, bottom: 5, left: 50, right: 10,}}
        xAxis={{innerTickSize: 1, zero:width/2, label: 'Move',}}
      />;

      const {selectedPlayers,} = this.state;
      const toggleButton = this.state.selectedPlayers.length > 0 ? (<div><Button onClick={this.toggleStdError}>Toggle standard errors</Button></div>) : null;
      return (
        <div className={styles.statHeader}>
          <h2 className={styles.statTitle}>Evaluation by Move</h2>
          <div className={styles.statContent}>
            <p>For each game, we find out the average evaluation of their position by a certain move. In principle, this can potentially be used to detect whether a certain player tends to win their game through the opening or the endgame.</p>
          </div>
          <Row style={{margin: '0px 0px',}}>
            <Select multi={true} value={selectedPlayers.map(p => p.value)} onChange={this.onChange} options={options}/>
          </Row>
          <Row style={{margin: '0px 0px',}}>
            {chartArea} 
            {legend}
            { toggleButton }
          </Row>
        </div>
      );
    }
  }
}

MoveEvalGraph.defaultProps = {
  moveSummaryData: [],
};

const extentsForData = (moveData) => {
  const maxMove = 60;
  var xmin = d3.min(moveData, (x) => d3.min(x.values, (row) => row.x));
  var xmax = d3.max(moveData, (x) => d3.max(x.values, (row) => row.x));
  
  return [[xmin, Math.min(maxMove, xmax),], [+3, -3,],];
};

const prepareForChart = (moveData, selectedPlayers, showStdError) => {
  const playerSet = new Set(selectedPlayers);
  const moveDataForPlayers = moveData.filter(x => playerSet.has(x.key));
  const reshapeMoves = moves => {
    const conf = (k, multiplier) => 
      ({x: +k, y: + (moves[k][0] * multiplier * tstat*moves[k][1]) / 100,});
    const keys = Object.keys(moves);
    const tstat = 1.96;
    const evals = keys.map(k => ({x: +k, y: + moves[k][0] / 100,}));
    const confLow = keys.map(k => conf(k, 1));
    const confHigh = keys.map(k => conf(k, -1));
    return {evals: evals, confLow: confLow, confHigh: confHigh,};
  };

  const formatRow = x => {
    const reshaped = reshapeMoves(x.evaluations);
    const valuesEvals = ({label: x.player, values: reshaped.evals,});
    if (!showStdError){
      return [valuesEvals,];
    }
    else {
      const valuesLow = ({label: x.player + '_low', values: reshaped.confLow,});
      const valuesHigh = ({label: x.player + '_high', values: reshaped.confHigh,});
      return [valuesEvals, valuesLow, valuesHigh,];
    }
  };

  const formatted = moveDataForPlayers.map(formatRow);
  const flattened = [].concat.apply([], formatted);
  return flattened;
};

