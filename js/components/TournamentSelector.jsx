import React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';
import Select from 'react-select';

export class TournamentSelector extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: null,
		};
	}
	processResponse = (data) => {
		this.setState({'moveData': data.data});
	}
	selectTournament = (selected) => {
		this.setState({ selected });
		this.props.callback(selected);
	};
	hasData = () => this.props.tournamentData.length > 0;

	render = () => {

		return (
			<Grid>
				<Row>
					<Col xs={12} mdOffset={3} md={6}>
						<span>Tournament</span>
						<Select 
							value={this.state.selected}
							options={this.props.tournamentData} 
							valueKey={'id'}
							labelKey={'name'}
							simpleValue={true}
							placeholder={'pick a tournament'}
							onChange={this.selectTournament}/>
					</Col>
				</Row>
			</Grid> 
		)
	}
}

TournamentSelector.defaultProps = {
	tournamentData: []
}
