import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';

import { avg, playerName, getUrl } from '../helpers.jsx';
import { getRequest, postRequest } from '../api.js';
import { MoveEvalGraph } from './MoveEvalPage.jsx';
import { Jumbotron, Panel, Col } from 'react-bootstrap';
import styles from './StatWindows.css';


class EvaluationWindow extends React.Component {
  constructor(props){
    super(props);
  }

  render = () => {
    var table = <div/>;
    const data = this.props.playerAverages;

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
  }
  render = () => {
    const hr = <hr style={{ height: "2px", border: "0 none", color: "lightGray", backgroundColor: "lightGray" }}/>
    return (
      <div>
        <EvaluationWindow playerAverages={ this.props.playerAverages }/>
        { hr }
        <MoveEvalGraph moveSummaryData={this.props.moveSummaryData}/>
      </div>
    )
  }
}



