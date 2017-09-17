import React from 'react';
import Chessdiagram from 'react-chessdiagram';
import Chess from 'chess.js';

export class Board extends React.Component {
	_onMovePiece = (piece, fromSquare, toSquare) => { // user moved a piece
		var rowData = this.props.rowData;
		var fen = rowData.fen;
		console.log("setting up with fen" + fen);
		var chess = new Chess(fen);
		var legalMoves = chess.moves({verbose: true});
		clearTimeout(this.timeout);
		// echo move back to user:
		const isLegalFilter = function(moveObject){
			return (moveObject.from == fromSquare && moveObject.to == toSquare)
		}
		var isLegal = legalMoves.filter(isLegalFilter).length == 1;

		var suggestedMoves = [rowData.move[1], rowData.best[1]];
		console.log("TRying answer");

		const isSuggestedFilter = function(moveObject){
			var isSuggested = false;
			for (var suggested of suggestedMoves){
				if (moveObject.from == suggested[0] && moveObject.to == suggested[1]){
					isSuggested = true;
				}
			}
			return isSuggested;
		}

		var isSuggested = legalMoves.filter(isLegalFilter).filter(isSuggestedFilter).length == 1;
		console.log("MOVES" + legalMoves)

		if (isSuggested){
			console.log("legal answer");
			this.props.tryAnswer(fromSquare, toSquare);
		}
		
	}
  render() {
    return (
      <Chessdiagram 
        flip={this.props.flip} 
        squareSize={this.props.squareSize} 
        lightSquareColor={this.props.lightSquareColor} 
        darkSquareColor={this.props.darkSquareColor} 
				onMovePiece={this._onMovePiece}
        fen={this.props.rowData.fen}/>)
  }
}

Board.defaultProps = {
	lightSquareColor: "#2492FF",
	darkSquareColor: "brown",
	squareSize: 40,
	flip: false
}


// desired behavior: Make the move on the board. If right, higlight as solution.
