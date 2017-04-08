import React from 'react'
import ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';
import { Grid, Row, Col } from 'react-flexbox-grid';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import Chessdiagram from 'react-chessdiagram';
import myData from '/home/cg/data/output/mates.json';

String.prototype.number = function (find) {
  return this.split(find).length - 1;
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: 0,
      showSolution: false
    };
    this._selectRowProp = this._selectRowProp.bind(this);
    this._onShowSolutionClicked = this._onShowSolutionClicked.bind(this);
  }
  _onRowSelect(row, isSelected, e){
    console.log(row);
    this.setState({selectedIndex: row.id, showSolution: false});
    console.log(row.best);
  }
  _selectRowProp() {
    return {
      mode: 'radio',
      clickToSelect: true,
      onSelect: this._onRowSelect.bind(this),
      bgColor: 'pink',
      hideSelectColumn: true
    }
  }
  _onShowSolutionClicked(){
    this.setState((prevState, props) => ({showSolution: !prevState.showSolution}));
  }
  render() {
    return (
      <Grid fluid>
        <Row>
          <Col md={6}>
                <PositionTable selectedIndex={this.state.selectedIndex} selectRow={this._selectRowProp()}/>
          </Col>
          <Col md={6}>
            <Row>
              <Board selectedIndex={this.state.selectedIndex}/>
            </Row>
            <Row>
              <SolutionShow showSolution={this.state.showSolution} selectedIndex={this.state.selectedIndex} onClick={this._onShowSolutionClicked}/>
            </Row>
          </Col>
        </Row>
      </Grid>
    );
  }
}

class SolutionShow extends React.Component {
  constructor(props){
    super(props);
  }
  render () {
    var style = {
      fontSize: 30
    };
    return (
      <div onClick={this.props.onClick} style={style}>{this.props.showSolution ? "Solution is: " + myData[this.props.selectedIndex].best : "Show solution"}</div>
    )
  }
}

function fenName(fen, row){
  const pieces = ["q", "r", "b", "k"]
  var str = "White:"
  for (let piece of pieces){
    str += " " + piece.toUpperCase() + fen.number(piece.toUpperCase());
  }
  str += " | Black:"
  for (let piece of pieces){
    str += " " + piece.toUpperCase() + fen.number(piece);
  }
  return str;
}


class PositionTable extends React.Component {
  constructor(props){
    console.log(props.selectRow);
    super(props);
  }
  render() {
    const selectRow = {mode:'radio'};
    return (
      <BootstrapTable data={ myData } selectRow={ this.props.selectRow }>
        <TableHeaderColumn dataField='id' isKey>Id</TableHeaderColumn>
        <TableHeaderColumn dataField='fen' dataFormat={fenName} width='50%'>Position type</TableHeaderColumn>
        <TableHeaderColumn dataField='mate' width='10%'>Best Mate</TableHeaderColumn>
      </BootstrapTable>)
  }
}

const squareSize = 70;

class Board extends React.Component {
  constructor(props){
    props.lightSquareColor = props.lightSquareColor || "#2492FF" // light blue
    props.darkSquareColor = props.darkSquareColor || "#005EBB" // dark blue
    props.flip = props.flip || false
    super(props);
  }
  render() {
    return (
      <Chessdiagram 
        flip={this.props.flip} 
        squareSize={squareSize} 
        lightSquareColor={this.props.lightSquareColor} 
        darkSquareColor={this.props.darkSquareColor} 
        fen={myData[this.props.selectedIndex].fen.substring(4)}/>)
  }
}


ReactDOM.render(<App/>, document.getElementById("world"));




