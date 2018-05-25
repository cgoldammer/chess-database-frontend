import React from 'react';
import { ChessApp } from './ChessApp.jsx';
import { Grid, Row, Col } from 'react-bootstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { data, dummyTable } from './DummyTable.jsx';
import { objectIsEmpty, updateLoc } from '../helpers.jsx';
import Media from "react-media";

const columns = [ {dataField: 'id', text: 'Id', hidden: true}
, {dataField: 'white', text: 'White'}
, {dataField: 'black', text: 'Black'}
, {dataField: 'tournament', text: 'Tournament'}
, {dataField: 'date', text: 'Date'}];



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
  getView = (table, board, screenIsBig) => {
    var view = <div>HI</div>
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
        <Col md={6}>
          { table }
        </Col>
        <Col md={6}>
          { board }
        </Col>
      </Row>)
    }
    return view
  }
  render() {
		const data = this.props.gamesData.slice(0, 10);
		var board = <div/>;
		if (this.gameIsSelected()){
			board = <ChessApp pgn={this.props.loc.game.pgn}/>;
		}

    const rowEvents = { onClick: this.onRowSelect }
    const table = <BootstrapTable keyField="id" data={ data } rowEvents={rowEvents} columns={columns}/>
    const result = matches => this.getView(table, board, !matches);
    return <Media query="(max-width: 599px)">
          { result }
        </Media>
  }
}
