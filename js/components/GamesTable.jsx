import React from 'react';
import { ChessApp } from './ChessApp.jsx';
import { Grid, Row, Col } from 'react-bootstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { objectIsEmpty, updateLoc } from '../helpers.jsx';
import Media from "react-media";
import styles from './GamesTable.css';
import statStyles from './StatWindows.css';

const columns = {
	id: {dataField: 'id', text: 'Id', hidden: true}
, white: {dataField: 'whiteShort', text: 'White'}
, black: {dataField: 'blackShort', text: 'Black'}
, result: {dataField: 'result', text: 'Result'}
, tournament: {dataField: 'tournament', text: 'Tournament'}
, date: {dataField: 'date', text: 'Date'}
}

const getColumns = screenIsSmall => {
	const selected = screenIsSmall ? ["id", "white", "black", "result"] : Object.keys(columns);
	return selected.map(column => columns[column]);
}


export class GamesTable extends React.Component {
  constructor(props) {
    super(props);
  }
  selectRow = () => {
    return {
      mode: 'radio',
      clickToSelect: true,
      onSelect: this._onRowSelect.bind(this),
      bgColor: 'pink',
      hideSelectColumn: true
    }
  }

  gameIsSelected = () => this.props.loc.game != null;
  onRowSelect = (e, row) => {
    this.props.locSetter(updateLoc(this.props.loc, "game", row));
  }
  getView = (data, board, screenIsBig) => {
    var view = <div/>
    const rowEvents = { onClick: this.onRowSelect }
    const table = <div className={styles.table}><BootstrapTable keyField="id" data={ data } rowEvents={rowEvents} columns={getColumns(!screenIsBig)} pagination={ paginationFactory() }/></div>
    if (!screenIsBig){
      if(this.gameIsSelected()){
        view = board;
      }
      else {
        view = table;
      }
    }
    else {
      view = (<Row>
        <Col xs={5}>
          { table }
        </Col>
        <Col xsOffset={2} xs={5}>
          { board }
        </Col>
      </Row>)
    }
    return view
  }
  render() {
    const data = this.props.gamesData;
    var board = null;
    if (this.gameIsSelected()){
      board = (
				<div style={{display: 'flex', justifyContent: 'center'}}>
					<ChessApp game={this.props.loc.game}/>
				</div>
			);
    }

    const result = matches => this.getView(data, board, !matches);
    return (<div className={statStyles.statHeader}>
			<Media query="(max-width: 992px)">
				{ result }
			</Media>
		</div>)
  }
}
