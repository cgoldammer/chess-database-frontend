import React from 'react';
import Chess from 'chess.js';

export class SolutionShow extends React.Component {
  constructor(props){
    super(props);
		this.state = {showSolution: false};
  }
  _clicked = () => {
    this.setState((prevState, props) => ({showSolution: !prevState.showSolution}));
  }
  render () {
		const rowData = this.props.rowData;
		
    const style = {
      fontSize: 30
    };

		var solution = this.state.showSolution;
		var hasMoveTried = this.props.moveTried.length > 0;
		var isCorrect = false;
		var bestMove = rowData.moveTestBest[1];
		if (hasMoveTried){
			var moveTried = this.props.moveTried;
			isCorrect = (bestMove[0] == moveTried[0]) && (bestMove[1] == moveTried[1]);
		}
		console.log("moves");
		console.log(this.props.moveTried);

		const messageShow = "Solution is: " + rowData.moveTestBest;
		const messageHidden = "Move 1: " + rowData.move1[0] + " | Move 2: " + rowData.move2[0] + " | Show a solution";

		var solutionDiv = <div onClick={this._clicked} style={style}>{ solution ? messageShow : messageHidden }</div>

		var correctMessage = isCorrect ? "Correct!" : ("False, the right move is: " + rowData.moveTestBest[0]);
		var triedDiv = <div>Move: { moveTried}: { correctMessage }</div>

		if (isCorrect){
			this.props.makeMove(moveTried);
		}
		
		if (hasMoveTried){
			return triedDiv;
		}
		else {
			return solutionDiv;
		}
  }
}

SolutionShow.defaultProps = {
	moveTried: []
}

