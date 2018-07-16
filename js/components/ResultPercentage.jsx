import React from 'react';
import { LineChart } from 'react-d3-components'
import { Grid, Row, Col, Button, DropdownButton, MenuItem, ButtonGroup, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import Select from 'react-select';

import styles from './StatWindows.css';

import { Legend } from './Legend.jsx';

export class ResultPercentage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      ownElo: null
    };
  }
  setElo = value => this.setState({ ownElo: value })
  getOwnElos = () => {
    var elos = new Set();
    for (let row of this.props.data){
      elos.add(row.rpOwnElo);
    }
    return Array.from(elos).sort();
  }
  getGrouped = () => {
    var grouped = {};
    for (let row of this.props.data){
      if (row.rpOwnElo == this.state.ownElo){
        const group = row.rpOpponentElo
        var vals = grouped[group] || [];
        vals.push(row);
        grouped[group] = vals;
      }
    }
    return grouped;
  }
  getOptions = () => this.getOwnElos().map(k => ({value: k, label: k}))
  getChartData = () => {
    var cleaned = [];
    if (this.state.ownElo == null) return [];
    const grouped = this.getGrouped();
    for (let group of Object.keys(grouped).sort()){
      const groupData = grouped[group];
      const minNumberEvals = process.env.MIN_DATA_QUALITY ? 15 : 1;
      const getRow = v => ({x: v.rpEvaluation, y: v.rpWinPercentage + 0.5 * v.rpDrawPercentage});
      cleaned.push({ label: group, values: groupData.filter(row => row.rpNumberEvals >= minNumberEvals).map(getRow).sort((a, b) => a.x - b.x) });
    }
    console.log("grouped");
    console.log(grouped);
    console.log(cleaned);
    return cleaned;
  }
  getExtents = () => [[-3, 3], [0, 100]];
  render = () => {
    console.log("Result P");
    const data = this.getChartData();
    console.log(data);
    const colorScale = d3.scale.category10();
    const legend = data.length == 0 ? null : 
      <div>
        <div>Opponent Elo:</div>
        <Legend colorScale={ colorScale } selected={ data.map((group, index) => ({index: group.label, name:group.label})) }/>
      </div>

    const maxWidth = 700;
    const width = Math.min(window.innerWidth - 50, maxWidth);
    const height = width;
    const extents = this.getExtents()
    var options = this.getOptions()

    var chartArea = (data.length == 0) ? null : <LineChart 
      data={ data }
      width={width} 
      height={height}
      xScale={d3.scale.linear().domain(extents[0]).range([0, width])}
      yScale={d3.scale.linear().domain(extents[1]).range([height, 0])}
      margin={{top: 10, bottom: 50, left: 50, right: 10}}
      xAxis={{tickValues: [-3, -2, -1, 0, 1, 2, 3], label: "Evaluation"}}
      colorScale={ colorScale }
    />
    const select = <Row style={{margin: "0px 0px"}}>
          <span>Select player Elo</span>
          <Select clearable={ false } value={ this.state.ownElo } onChange={data => this.setElo(data.value)} options={options}/>
        </Row>
    return (
      <div>
        <div className={styles.statHeader}>
          <h2 className={styles.statTitle}>Expected Score</h2>
          <h3 className={styles.statTitle}>Warning: new and speculative</h3>
          <div className={styles.statContent}>
            <p>This provides the expected score from a given evaluation when playing against players with various ratings. If you always win, the expected score is 1, if you always draw, the expected score is 0.5. You would expect that a GM will usually win against a player rated below 2000, even if the GM has an evaluation of -1. This graph helps you understand how big these effects are.</p>
          </div>
          { select }
          { chartArea }
          { legend }
        </div>
      </div>
    )
  }
}
