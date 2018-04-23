import React from 'react';
import { Board } from './Board.jsx';
import { Grid, Row, Col } from 'react-flexbox-grid';

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
  _onRowSelect = (row, isSelected, e) => {
    this.setState({selectedIndex: row.id, selectedGame: row});
  }
  render() {
		const data = this.props.gamesData;
		var board = <div/>;
		if (this.state.selectedIndex > 0){
			board = <Board pgn={this.state.selectedGame.pgn}/>;
		}
    return (
			<Grid>
				<Row>
          <Col md={6}>
            <BootstrapTable data={ data } selectRow={this.selectRow()}>
              <TableHeaderColumn dataField='id' hidden={true} isKey>Id</TableHeaderColumn>
              <TableHeaderColumn dataField='white' width='20%'>White</TableHeaderColumn>
              <TableHeaderColumn dataField='black' width='20%'>Black</TableHeaderColumn>
              <TableHeaderColumn dataField='tournament' width='20%'>Tournament</TableHeaderColumn>
              <TableHeaderColumn dataField='date' width='20%'>Date</TableHeaderColumn>
            </BootstrapTable>
          </Col>
          <Col md={6}>
            { board }
          </Col>
				</Row>
			</Grid>
		)
  }
}
