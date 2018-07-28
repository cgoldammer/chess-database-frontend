import React from 'react';
import Chessdiagram from 'react-chessdiagram'; 

import { Row, Col } from 'react-bootstrap';
import { getRequest } from '../api.js';
import { getUrl, playerName } from '../helpers.jsx';

const lightSquareColor = '#f2f2f2'
const darkSquareColor = '#bfbfbf'
const flip = false;
const squareSize = 35;

import styles from './StatWindows.css';

const formatWithColor = (moveNumber, isWhite, mv, evaluation) => moveNumber + ". " + (isWhite ? "" : "... " ) + mv + " (" + (evaluation / 100).toFixed(2) + ")"
 

export class BlunderPosition extends React.Component {
  constructor(props){
    super(props);
  }

  getCurrentEval = () => this.props.data.moveEvalsMoveEval
  gameString = () => {
    const data = this.props.data;
    return playerName(data.playerWhite) + " - " + playerName(data.playerBlack);
  }
  moveString = (move, evaluation) => {
    const thisMove = this.getCurrentEval();
    return formatWithColor(thisMove.moveNumber, thisMove.isWhite, move, evaluation)
  }
  bestMoveString = () => {
    const thisMove = this.getCurrentEval();
    return this.moveString(thisMove.moveBest, thisMove.evalBest);
  }
  playedMoveString = () => {
    const thisMove = this.getCurrentEval();
    return this.moveString(thisMove.movePlayed, thisMove.eval);
  }
  render = () => {
    const data = this.props.data;
    const evaluation = data.moveEvalsMoveEval;
    const fen = evaluation.fen.substring(4);
    const loss = data.moveEvalsMoveLoss;
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

const maxLength = 100;

export class BlunderWindow extends React.Component {
  constructor(props){
    super(props);
  }

  render = () => {
    const board = (data, index) => <Col key={ index } md={ 6 }><BlunderPosition key={ index } data={ data }/></Col>
    const subsetText = "Showing the first " + maxLength + " results. Pick a tournament to show all blunders for that tournament."
    const allText = "Showing all " + this.props.selectedBlunders.length + " blunders that were detected."
    const subsetNote = (<p>
      { (this.props.selectedBlunders.length == maxLength) ? subsetText : allText }
    </p>);
    return (
      <div>
        <div className={styles.statHeader}>
          <h2 className={styles.statTitle}>Blunders</h2>
          <div className={styles.statContent}>
            { subsetNote }
            <p>The following shows positions in which the move played deviated by at least 200 centipawns from the best move. Note that this feature is experimental for now. Currently, the evaluations are done relatively quickly (100ms), so the computer will not always find the best move, and thus not all moves shown here are actually blunders.</p>
            <p>We are excluding positions in which the player was already winning (evaluation after the move better than +3 in favor of the player) or already losing. We are also omitting situations in which the player missed a mate. This will be improved at a later time.</p>
          </div>
        </div>
        <hr/>
        <Row className="text-center">
          { this.props.selectedBlunders.map(board) }
        </Row>
      </div>
    )
  }
}

