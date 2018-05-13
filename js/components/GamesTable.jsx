import React from 'react';
import { ChessApp } from './ChessApp.jsx';
import { Grid, Row, Col } from 'react-bootstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { data, dummyTable } from './DummyTable.jsx';
import { objectIsEmpty } from '../helpers.jsx';

const columns = [ {dataField: 'id', text: 'Id', hidden: true}
, {dataField: 'white', text: 'White'}
, {dataField: 'black', text: 'Black'}
, {dataField: 'tournament', text: 'Tournament'}
, {dataField: 'date', text: 'Date'}];



export class GamesTable extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedIndex: 0,
			selectedGame: {}
		}
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
  gameIsSelected = () => this.state.selectedIndex > 0
  onRowSelect = (e, row) => {
    this.setState({selectedIndex: row.id, selectedGame: row});
  }
  render() {
		const data = this.props.gamesData.slice(0, 10);
		var board = <div/>;
		if (this.gameIsSelected()){
			board = <ChessApp pgn={this.state.selectedGame.pgn}/>;
		}

    const rowEvents = { onClick: this.onRowSelect }
    
    var screenIsBig = false;

    const table = <BootstrapTable keyField="id" data={ data } rowEvents={rowEvents} columns={columns}/>

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
    return view;
  }
}
