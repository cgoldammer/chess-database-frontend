import React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';
import { TournamentSelector } from './TournamentSelector.jsx';
import { GamesTable } from './GamesTable.jsx';
import { postRequest } from '../api.js';
import { Tabs, Tab } from 'react-bootstrap';
import { avg, playerName } from '../helpers.js';

const defaultSearch = { tournaments:[] };

/* A search window is used to select games from the database */
export class SearchChoice extends React.Component {
	constructor(props) {
		super(props);
    this.state = { tournaments: [] }
	}
  updateTournaments = (tournament) => {
    console.log("UPDATING WIHT " + tournament);
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

const resultPanels = {
  gameList: 1,
  statistics: 2
}


class StatWindow extends React.Component {
  constructor(props){
    super(props);
    this.state = { 
      resultByEvaluation: [],
      players: []
    };
  }
  loadByEvaluation = () => {
    const ids = this.props.gamesData.map(g => g.id);
    const setResultByEvaluation = data => this.setState({resultByEvaluation: data.data});
    const setPlayers = data => this.setState({players: data.data});
    postRequest('/snap/api/getResultByEvaluation', ids, setResultByEvaluation);
    const playerRequest = { searchDB: this.props.db };
    postRequest('/snap/api/players', playerRequest, setPlayers)
  }
	componentDidMount = () => {
		this.loadByEvaluation();
	}
  render = () => {
    return (
      <div>
        <ResultByEvaluationWindow resultByEvaluation={this.state.resultByEvaluation} players={this.state.players}/>
      </div>
      
    )
  }
}

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
    const avgEval = avg(gameEvals.map(getEvals))
    const avgWinEval = avg(filterForResult(100).map(getEvals))
    const avgLossEval = avg(filterForResult(0).map(getEvals))
    const data = { 
      playerId: playerId,
      name: playerName(player),
      avgEval: isNaN(avgEval) ? "" : avgEval,
      avgWinEval: isNaN(avgWinEval) ? "" : avgWinEval,
      avgLossEval: isNaN(avgLossEval) ? "" : avgLossEval
    }
    return data
  }
  return evaluations.map(cleanPlayerData);
}


class ResultByEvaluationWindow extends React.Component {
  constructor(props){
    super(props);
    this.state = { 
    };
  }

  render = () => {
    const data = getPlayerAverages(this.props.resultByEvaluation, this.props.players);
    var table = <div/>
    if (data.length > 0){
      table = <BootstrapTable data={ data }>
          <TableHeaderColumn dataField='id' hidden={true} isKey>Id</TableHeaderColumn>
          <TableHeaderColumn dataField='name' width='20%'>Player</TableHeaderColumn>
          <TableHeaderColumn dataField='avgEval' width='20%'>Average CP Loss</TableHeaderColumn>
          <TableHeaderColumn dataField='avgWinEval' width='20%'>Average CP Loss for Wins</TableHeaderColumn>
          <TableHeaderColumn dataField='avgLossEval' width='20%'>Average CP Loss for Losses</TableHeaderColumn>
        </BootstrapTable>
    }
    return (
      <div>{ table }</div>
    )
  }
}


class ResultTable extends React.Component {
  constructor(props){
    super(props);
    this.state = { 
      selectedPanel: resultPanels.statistics
    };
  }
  setPanel = key => this.setState({ selectedPanel: key});
  render = () => {
    return (
      <Tabs activeKey={this.state.selectedPanel} onSelect={this.setPanel} id="db-tabs">
        <Tab eventKey={ resultPanels.gameList } title="Games">
          <GamesTable gamesData={this.props.gamesData}/>;
        </Tab>
        <Tab eventKey={ resultPanels.statistics } title="Statistics">
          <StatWindow db={this.props.db} gamesData={this.props.gamesData}/>
        </Tab>
      </Tabs>
    )
  }
}

const startingStateForSearch = {
  selection: { tournaments: [] },
  gamesData: []
};

/* The SearchWindow allows filtering games in the database and then shows the
resulting games in a table */
export class SearchWindow extends React.Component {
  constructor(props){
    super(props);
    this.state = startingStateForSearch;
  }
	componentDidMount = () => {
    console.log("MOUNTED");
    this.setState(startingStateForSearch, this.getGamesForSearch);
  }

  updateChoice = ( selection ) => { 
    console.log("Updating searchwindow with:");
    console.log(selection);
    this.setState({selection: selection}, this.getGamesForSearch);
  }
	processGameData = (data) => {
    console.log("Updated with " + cleanGameData.length);
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
    console.log("POST");
    console.log(data.gameRequestTournaments);
    return data
  }
	getGamesForSearch = () => {
		postRequest('/snap/api/games', this.getGameSearchData(), this.processGameData);
	};
	hasGames = () => this.state.gamesData.length > 0
  render = () => {
    var resultRow = <div/>;
		if (this.hasGames()){
			resultRow = <ResultTable db={this.props.db} gamesData={this.state.gamesData} />;
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

