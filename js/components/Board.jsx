import React from 'react';
// import Chessdiagram from '../../external/chess-diagram2/dev.chessdiagram.jsx';
import Chessdiagram from 'react-chessdiagram';
import Chess from 'chess.js';

var pgn = ['[Event "Third Rosenwald Trophy"]',
				'[Result "0-1"]',
				'',
				'1. Nf3 Nf6'].join('\n')

var pgn = '[Event "Third Rosenwald Trophy"]\n[Result "0-1"]\n\n1. Nf3 Nf6'

export class Board extends React.Component {
	fakePgn = () => '[Event "X"]\n[Result "0-1"]\n\n' + this.props.pgn
		
  render() {
		console.log('rendering board');
    return (
			<div>
				<Chessdiagram 
					squareSize={this.props.squareSize} 
					lightSquareColor={this.props.lightSquareColor} 
					darkSquareColor={this.props.darkSquareColor} 
					gameHistory={this.props.gameHistory}
					pgn={this.fakePgn()}
				/>
			</div>
		)
  }
}

Board.defaultProps = {
 	lightSquareColor: "rgb(200, 200, 200)"
,	darkSquareColor: "rgb(100, 100, 100)"
,	squareSize: 40
, gameHistory: true
}


// desired behavior: Make the move on the board. If right, higlight as solution.
