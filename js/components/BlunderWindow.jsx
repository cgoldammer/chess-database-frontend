import React from 'react';
import Chessdiagram from 'react-chessdiagram'; 

import { postRequest } from '../api.js';
import { getUrl, playerName } from '../helpers.jsx';

const lightSquareColor = '#f2f2f2'
const darkSquareColor = '#bfbfbf'
const flip = false;
const squareSize = 35;

const formatWithColor = (moveNumber, isWhite, mv, evaluation) => moveNumber + ". " + (isWhite ? "" : "... " ) + mv + " (" + (evaluation / 100).toFixed(2) + ")"
 

export class BlunderPosition extends React.Component {
  constructor(props){
    super(props);
    console.log(props.data);
  }

  getCurrentEval = () => this.props.data.moveEvalsMoveEval
  getNextEval = () => this.props.data.moveEvalsMoveEvalNext
  gameString = () => {
    const data = this.props.data.moveEvalsGame;
    const playerWhite = this.props.playersMap[data.playerWhiteId];
    const playerBlack = this.props.playersMap[data.playerBlackId];
    return "Game: " + playerName(playerWhite) + " - " + playerName(playerBlack);
  }
  moveString = (move, evaluation) => {
    const thisMove = this.getCurrentEval();
    return formatWithColor(thisMove.moveNumber, thisMove.isWhite, move, evaluation)
  }
  bestMoveString = () => {
    const thisMove = this.getCurrentEval();
    return this.moveString(thisMove.moveBest, thisMove.eval);
  }
  playedMoveString = () => {
    const thisMove = this.getCurrentEval();
    const nextMove = this.getNextEval();
    return this.moveString(thisMove.movePlayed, nextMove.eval);
  }
  render = () => {
    const data = this.props.data;
    const evaluation = data.moveEvalsMoveEval;
    const fen = evaluation.fen.substring(4);
    const board = <Chessdiagram fen={fen} flip={this.props.flip} squareSize={squareSize} lightSquareColor={lightSquareColor} darkSquareColor={darkSquareColor}/>
    return (
      <div>
        <div>Game: { this.gameString() } </div>
        <div>Best move: { this.bestMoveString() } </div>
        <div>Move played: { this.playedMoveString() } </div>
        { board }
        <hr/>
      </div>
    )
  }
}

export class BlunderWindow extends React.Component {
  constructor(props){
    super(props);
    this.state = { 
      players: [],
      evalData: []
    };
  }
  loadEvals = () => {
    const ids = {moveEvalGames: this.props.gamesData.map(g => g.id)};
    const setEvaluation = data => this.setState({evalData: data.data});
    postRequest(getUrl('api/moveEvaluations'), ids, setEvaluation);
  }
  componentDidMount = () => {
    this.loadEvals();

    var playersMap = {}
    for (var player of this.props.players){
      playersMap[player.id] = player;
    }
    this.playersMap = playersMap
  }

  render = () => {
    return (
      <div>
        { this.state.evalData.map((data, index) => <BlunderPosition playersMap={ this.playersMap } key={ index } data={data}/>) }
      </div>
    )
  }
}

