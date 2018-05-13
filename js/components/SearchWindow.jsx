import React from 'react';

import { Panel, Grid, Row, Col, Button, DropdownButton, MenuItem, FormControl, Breadcrumb, Modal, Tabs, Tab } from 'react-bootstrap';

import { TournamentSelector } from './TournamentSelector.jsx';
import { GamesTable } from './GamesTable.jsx';
import { dummyTable } from './DummyTable.jsx';
import { postRequest } from '../api.js';
import { avg, playerName, resultPanels, contextComp} from '../helpers.jsx';
import { StatWindow } from './StatWindows.jsx';
import { Redirect } from 'react-router'


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
      <Panel>
        <Panel.Heading>Search for games</Panel.Heading>
        <Panel.Body>
          <Row>
            <TournamentSelector tournamentData={this.props.tournamentData} callback={this.updateTournaments}/>
          </Row>
        </Panel.Body>
      </Panel>
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


class ResultTable extends React.Component {
  constructor(props){
    super(props);
  }
  setPanel = key => {
    const base = window.location.pathname;
    const newUrl = base + "/" + key;
    const newLoc = { ...this.props.loc, showType: key}
    this.props.locSetter(newLoc);
  }
  render = () => {
    var gamesTable = <div/>;
    console.log("GAMES DATA: " + this.props.gamesData.length);
    if (this.props.gamesData.length > 0){
      gamesTable = <GamesTable gamesData={this.props.gamesData}/>
    }

    return (
      <Tabs activeKey={this.props.loc.showType} onSelect={this.setPanel} id="db-tabs">
        <Tab eventKey={ resultPanels.gameList } title={ resultPanels.gameList }>
          { gamesTable }
        </Tab>
        <Tab eventKey={ resultPanels.statistics } title={ resultPanels.statistics }>
          <StatWindow db={this.props.db} selection={this.props.selection} gamesData={this.props.gamesData}/>
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
  getSelectedTournaments = () => {
    const selected = this.state.selection.tournaments;
    const all = this.props.tournamentData;
    const ids = all.map(data => data.id);
    return selected.length == 0 ? ids : selected
  }
	processGameData = (data) => {
		this.setState({'gamesData': data.data.map(cleanGameData)});
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
	componentDidMount = () => {
    this.setState(startingStateForSearch, this.getGamesForSearch);
  }
  updateChoice = ( selection ) => { 
    this.setState({selection: selection}, this.getGamesForSearch);
  }
	hasGames = () => this.state.gamesData.length > 0
  render = () => {
    var resultRow = <div/>;
    const ResultTableLoc = contextComp(ResultTable);
		if (this.hasGames()){
			resultRow = <ResultTableLoc db={this.props.db} selection={this.state.selection} gamesData={this.state.gamesData} />;
		}
    return (
      <div>
        { resultRow }
      </div>
    )
  }
}

