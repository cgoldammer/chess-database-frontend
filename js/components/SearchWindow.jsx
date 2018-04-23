import React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';
import { TournamentSelector } from './TournamentSelector.jsx';
import { GamesTable } from './GamesTable.jsx';
import { postRequest } from '../api.js';

const defaultSearch = { tournaments:[] };

/* A search window is used to select games from the database */
export class SearchChoice extends React.Component {
	constructor(props) {
		super(props);
    this.state = { tournaments: [] }
	}
  updateTournaments = (tournament) => {
    const newTournaments = tournament == null ? [] : [tournament];
    const updater = () => this.props.onChangeSelection(this.state);
    this.setState({tournaments: newTournaments}, updater);
  }
	render = () => {
		return (
			<Grid>
				<Row>
					<TournamentSelector tournamentData={this.props.tournamentData} callback={this.updateTournaments}/>
				</Row>
			</Grid>
		)
	}
}

const cleanGameData = (data) => {
  const playerName = player => player.lastName + (player.firstName.length == 0 ? '' : ', ' + player.firstName)
  const getByAttribute = type => data => {
    const results = data.filter(att => att.attribute == type)
    return results.length > 0 ? results[0].value : ''
  }
  const cleaned = {
    'id': data.gameDataGame.id,
    'white': playerName(data.gameDataPlayerWhite),
    'black': playerName(data.gameDataPlayerBlack),
    'tournament': data.gameDataTournament.name,
    'pgn': data.gameDataGame.pgn,
    'date': getByAttribute("Date")(data.gameDataAttributes)
  };
  return cleaned
}


/* The SearchWindow allows filtering games in the database and then shows the
resulting games in a table */
export class SearchWindow extends React.Component {
  constructor(props){
    super(props);
    this.state = { 
      selection: { tournaments: [] },
      gamesData: []
    };
    this.getGamesForSearch();
  }

  updateChoice = ( selection ) => { 
    console.log("Updating searchwindow with:");
    console.log(selection);
    this.setState({selection: selection}, this.getGamesForSearch);
  }
	processGameData = (data) => {
		this.setState({'gamesData': data.data.map(cleanGameData)});
	}
  getSelectedTournaments = () => {
    const selected = this.state.selection.tournaments;
    const all = this.props.tournamentData;
    const ids = all.map(data => data.id);
    return selected.length == 0 ? ids : selected
  }
  getGameSearchData = () => {
		const data = { 
      gameRequestDB: this.props.db
    , gameRequestTournaments: this.getSelectedTournaments()
    };
    return data
  }
	getGamesForSearch = () => {
		postRequest('/snap/api/games', this.getGameSearchData(), this.processGameData);
	};
	hasGames = () => this.state.gamesData.length > 0
  render = () => {
    var resultRow = <div/>;
		if (this.hasGames()){
			resultRow = <GamesTable gamesData={this.state.gamesData}/>;
		}
    return (
      <Grid>
        <Row>
          <SearchChoice onChangeSelection={this.updateChoice} tournamentData={this.props.tournamentData}/>
        </Row>
        <Row>
          { resultRow }
        </Row>
      </Grid>
    )
  }
}

