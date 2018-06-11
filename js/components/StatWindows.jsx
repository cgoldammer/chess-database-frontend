import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';

import { avg, playerName, getUrl } from '../helpers.jsx';
import { getRequest, postRequest } from '../api.js';
import { MoveEvalGraph } from './MoveEvalPage.jsx';
import { Jumbotron, Panel, Col } from 'react-bootstrap';
import styles from './StatWindows.css';


/* This function returns a list that can be displayed as a table */
const getPlayerAverages = (evaluations, players) => {
  if (players.length == 0){
    return []
  }
  const getPlayerById = id => players.filter(p => p.id == id)[0];

  const cleanPlayerData = dat => {
    const playerId = dat[0];
    const gameEvals = dat[1];
    const player = getPlayerById(playerId);
    const getEvals = ev => ev[0];
    const filterForResult = result => gameEvals.filter(ge => ge[1] == result)
    const avgEval = Math.floor(avg(gameEvals.map(getEvals)));

    const wins = filterForResult(100);
    const avgWinEval = Math.floor(avg(wins.map(getEvals)));

    const losses = filterForResult(0);
    const avgLossEval = Math.floor(avg(losses.map(getEvals)));

    const combineWithNumber = (av, num) => "" + av + " (" + num + " game" + (num > 1 ? "s" : "") + ")";

    const data = { 
      playerId: playerId
    , name: playerName(player)
    ,	number: gameEvals.length
    , avgEval: isNaN(avgEval) ? "" : avgEval
    , avgWinEval: isNaN(avgWinEval) ? "" : combineWithNumber(avgWinEval, wins.length)
    , avgLossEval: isNaN(avgLossEval) ? "" : combineWithNumber(avgLossEval, losses.length)
    }
    return data
  }
  return evaluations.map(cleanPlayerData);
}


class EvaluationWindow extends React.Component {
  constructor(props){
    super(props);
    this.state = { 
    };
  }

  render = () => {
    const data = getPlayerAverages(this.props.gameEvaluations, this.props.players);
    var table = <div/>;

    const columns = [{dataField: 'name', text: 'Player'}
    , {dataField: 'number', text: 'Number of games', sort: true}
    , {dataField: 'avgEval', text: 'Average CP Loss'}
    , {dataField: 'avgWinEval', text: 'Average CP Loss for Wins'}
    , {dataField: 'avgLossEval', text: 'Average CP Loss for Losses'}];

    const sort = [{dataField: "number", order:"desc"}];

    if (data.length > 0){
      table = <BootstrapTable defaultSorted={sort} keyField="name" data={ data } columns={columns}/>;
    }
    return (
      <div>
        <div className={styles.statHeader}>
          <h2 className={styles.statTitle}>Average Centipawn Loss</h2>
          <div className={styles.statContent}>
            <p>As with all statistics, one should not over-interpret the result. For instance, if a player makes more mistakes than another player, that does not necessarily imply that the player plays less well, it could also be because the player has a sharper style.</p>
            <p>The table provides the average centi-pawn (CP) loss per player. For instance, if a player blunders a pawn on every second move, but otherwise plays perfect moves, that player would have a CP Loss of 50.</p>
          </div>
          { table }
        </div>
      </div>
    )
  }
}

export class StatWindow extends React.Component {
  constructor(props){
    super(props);
    this.state = { 
      gameEvaluations: [],
      players: [],
      moveData: []
    };
  }
  setMoveSummary = data => {
    this.setState({moveData: data.data});
  }
  loadByEvaluation = () => {
    const ids = { gameList: this.props.gamesData.map(g => g.id)};
    const setEvaluation = data => this.setState({gameEvaluations: data.data});
    getRequest(getUrl('api/gameEvaluations'), ids, setEvaluation);

    const moveRequest = { 
      moveRequestDB: this.props.db
    , moveRequestTournaments: this.props.selection.tournaments
    }

    getRequest(getUrl('api/moveSummary'), moveRequest, this.setMoveSummary);
  }
  componentDidMount = () => {
    this.loadByEvaluation();
  }

  render = () => {
    return (
      <div>
        <EvaluationWindow gameEvaluations={this.state.gameEvaluations} players={this.props.players}/>
        <hr/>
        <MoveEvalGraph moveData={this.state.moveData}/>
      </div>
      
    )
  }
}



