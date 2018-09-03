import React from 'react';
import ReactTable from 'react-table';
import styles from './ChessApp.css';
import {Table, ButtonGroup, Button,} from 'react-bootstrap';
import Chessdiagram from 'react-chessdiagram'; 
import {defaultGetRows, calculateMoveNumber, } from './helpers.jsx';
import {annotateMoves, } from '../helpers.jsx';

const lightSquareColor = '#f2f2f2';
const darkSquareColor = '#bfbfbf';
const flip = false;
const squareSize = 35;

const cols = [
  {
    Header: 'Move',
    accessor: 'moveNumber',
  },
  {
    Header: 'White',
    accessor: 'white',
  },
  {
    Header: 'Black',
    accessor: 'black',
  },
];
const moveColumns = cols;

class GameOverview extends React.Component {
  constructor(props){
    super(props);
  }
  render = () => {

    const game = this.props.game;
    const whitePlayerName = game.white;
    const blackPlayerName = game.black;
    const gameName = whitePlayerName + ' vs. ' + blackPlayerName;

    return (
      <div>
        <h3>{ gameName }</h3>
        <Table striped bordered condensed hover>
          <tbody>
            <tr>
              <td>Tournament</td>
              <td>{ game.tournament }</td>
            </tr>
            <tr>
              <td>Opening</td>
              <td>{ game.opening }</td>
            </tr>
            <tr>
              <td>Result</td>
              <td>{ game.result }</td>
            </tr>
            <tr>
              <td>Date</td>
              <td>{ game.date }</td>
            </tr>
          </tbody>
        </Table>
      </div>
    );
  }
}

export class ChessApp extends React.Component {
  constructor(props){
    super(props);
    this.state = {startMove: 0,};
  }
  setToEnd = () => this.setMove(this.moves.length);
  setMove = move => this.setState({startMove: move,});
  rowMapper = row => ({moveNumber: row[0], white: row[1], black: row[2],});
  getData = () => {
    const game = this.props.game;
    var moves = defaultGetRows(game.pgn);

    if (game.evaluations) {
      moves = annotateMoves(moves, game.evaluations);
    }

    return moves.map(this.rowMapper);
  }
  changeMove = (num) => () => {
    const transformer = (prevState,) => {
      const next = prevState.startMove + num;
      if (next >= 0 && next <= this.moves.length){
        return {startMove: next,};
      }
    };
    this.setState(transformer);
  }

  onRowClick = (state, rowInfo, column,) => {
    const onClick = () => {
      const colName = column.id; 
      const moveNumber = rowInfo.row.moveNumber;
      const isBlack = colName == 'black';
      const isWhite = colName == 'white';
    
      if (isBlack || isWhite) {
        const num = calculateMoveNumber(moveNumber, isBlack);
        this.setMove(num);
      }
    };
    return {onClick: onClick,};
  }
  
  render = () => {
    const data = this.getData();

    return (
      <div>
        <GameOverview game={this.props.game}/>
        <div>
          <Chessdiagram
            key={this.state.startMove}
            flip={flip}
            pgn={this.props.game.pgn}
            squareSize={squareSize}
            lightSquareColor={lightSquareColor}
            darkSquareColor={darkSquareColor}
            startMove={this.state.startMove}/>
        </div>
        <div>
          <ReactTable
            className={styles.gameTable} 
            pageSize={data.length}
            showPagination={false}
            data={data}
            columns={moveColumns}
            getTdProps={this.onRowClick}/>
          <div className="text-center">
            <ButtonGroup>
              <Button onClick={() => this.setMove(0)}>Start</Button>
              <Button onClick={this.changeMove(-1)}>Previous</Button>
              <Button onClick={this.changeMove(1)}>Next</Button>
              <Button onClick={this.setToEnd}>End</Button>
            </ButtonGroup>
          </div>
        </div>
      </div>
    );
  }
}
