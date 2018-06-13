import React from 'react';

import { Panel, Grid, Row, Col, Button, DropdownButton, MenuItem, FormControl, Breadcrumb, Modal, Tabs, Tab } from 'react-bootstrap';
import { Redirect } from 'react-router'

import { TournamentSelector } from './TournamentSelector.jsx';
import { GamesTable } from './GamesTable.jsx';
import { StatWindow } from './StatWindows.jsx';
import { BlunderWindow } from './BlunderWindow.jsx';
import { getRequest, postRequest } from '../api.js';
import { avg, playerName, resultPanels, contextComp, updateLoc, getUrl} from '../helpers.jsx';



const defaultSearch = { tournaments:[] };

/* A search window is used to select games from the database */
export class SearchChoice extends React.Component {
  constructor(props) {
    super(props);
  }
  updateTournaments = (tournaments) => {
    const newTournaments = tournaments == null ? [] : tournaments.map(t => t.id);
    const newState = {tournaments: newTournaments}
    const updater = this.props.onChangeSelection(newState);
  }
  render = () => {
    return (
      <TournamentSelector selected={this.props.selected} tournamentData={this.props.tournamentData} callback={this.updateTournaments}/>
    )
  }
}

const gameResult = resultInt => resultInt == -1 ? "0-1" : resultInt == 0 ? "1/2-1/2" : "1-0";

const cleanGameData = (data) => {
  const getByAttribute = type => data => {
    const results = data.filter(att => att.attribute == type)
    return results.length > 0 ? results[0].value : ''
  }
  const cleaned = {
    'id': data.gameDataGame.id
  , 'white': playerName(data.gameDataPlayerWhite)
  , 'black': playerName(data.gameDataPlayerBlack)
  , 'result': gameResult(data.gameDataGame.gameResult)
  , 'tournament': data.gameDataTournament.name
  , 'opening': data.gameDataOpening.variationName || ""
  , 'pgn': data.gameDataGame.pgn
  , 'date': getByAttribute("Date")(data.gameDataAttributes)
  };
  return cleaned
}


class ResultTabs extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      players: []
    }
  }
  setPlayers = data => this.setState({players: data.data});
  componentDidMount = () => {
    const playerRequest = { searchDB: this.props.db };
    getRequest(getUrl('api/players'), playerRequest, this.setPlayers)
  }
  setPanel = key => {
    const base = window.location.pathname;
    const newUrl = base + "/" + key;
    const newLoc = updateLoc(this.props.loc, "showType", key);
    this.props.locSetter(newLoc);
  }
  getGamesHash = () => JSON.stringify(this.props.gamesData.map(g => g.id))
  render = () => {
    var gamesTable = <div/>;
    if (this.props.gamesData.length > 0){
      const GamesTableLoc = contextComp(GamesTable);
      gamesTable = <GamesTableLoc gamesData={this.props.gamesData}/>
    }

    const showTabs = this.state.players.length > 0
    var tabs = <div/>
    if (showTabs){ 
      tabs = (<Tabs activeKey={this.props.loc.showType} onSelect={this.setPanel} id="db-tabs">
          <Tab eventKey={ resultPanels.gameList } title={ resultPanels.gameList }>
            { gamesTable }
          </Tab>
          <Tab eventKey={ resultPanels.statistics } title={ resultPanels.statistics }>
            <StatWindow key= {this.getGamesHash() } db={this.props.db} selection={this.props.selection} players={ this.state.players } gamesData={this.props.gamesData}/>
          </Tab>
          <Tab eventKey={ resultPanels.blunders } title={ resultPanels.blunders }>
            <BlunderWindow key={ this.getGamesHash() } players={ this.state.players } gamesData={ this.props.gamesData } db={ this.props.db }/>
          </Tab>
        </Tabs>)
    }
    return tabs
  }
    setMoveSummary = data => {
      this.setState({moveData: data.data});
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
    return selected;
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
    getRequest(getUrl('api/games'), this.getGameSearchData(), this.processGameData);
  };
  components = {ResultTabs: contextComp(ResultTabs)}
  componentDidMount = () => {
    this.setState(startingStateForSearch, this.getGamesForSearch);
  }
  updateChoice = selection => { 
    this.setState({selection: selection}, this.getGamesForSearch);
  }
  hasGames = () => this.state.gamesData.length > 0
  render = () => {
    var resultRow = <div/>;
    const ResultTabsLoc = this.components.ResultTabs;
    if (this.hasGames()){
      resultRow = <ResultTabsLoc db={ this.props.db } selection={ this.state.selection } gamesData={this.state.gamesData} />;
    }
    return (
      <div>
        <Row style={{ marginLeft: 0, marginRight: 0 }}>
          <SearchChoice onChangeSelection={this.updateChoice} selected={this.state.selection.tournaments} tournamentData={this.props.tournamentData}/>
        </Row>
        <Row style={{ marginLeft: 0, marginRight: 0 }}>
          { resultRow }
        </Row>
      </div>
    )
  }
}

