import React from 'react';

import { Panel, Grid, Row, Col, Button, DropdownButton, MenuItem, FormControl, Breadcrumb, Modal, Tabs, Tab } from 'react-bootstrap';
import { Redirect } from 'react-router'

import { TournamentSelector } from './TournamentSelector.jsx';
import { GamesTable } from './GamesTable.jsx';
import { StatWindow } from './StatWindows.jsx';
import { BlunderWindow } from './BlunderWindow.jsx';
import { getRequest, postRequest } from '../api.js';
import { avg, playerNameShort, playerName, resultPanels, contextComp, updateLoc, getUrl} from '../helpers.jsx';
import { connect, Provider } from 'react-redux'
import { store, getSelectedGames, updateUrl } from '../redux.jsx';
import { SELECT_GAME, SELECT_SHOWTYPE } from '../reducers.jsx';
import { selectGame, selectShowType } from '../actions.jsx';

const defaultSearch = { tournaments:[] };

/* A search window is used to select games from the database */
export class SearchChoice extends React.Component {
  constructor(props) {
    super(props);
  }
  updateTournaments = tournaments => {
    const newTournaments = tournaments == null ? [] : tournaments.map(t => t.id);
    const updater = this.props.updateSelection(this.props.selectedDB.id, this.props.selection, {'tournaments': newTournaments});
  }
  updatePlayers = players => {
    const newPlayers = players == null ? [] : players.map(t => t.id);
    const updater = this.props.updateSelection(this.props.selectedDB.id, this.props.selection, {'players': newPlayers});
  }
  render = () => {
    return (
      <div>
        <TournamentSelector 
          name="Tournament" 
          selected={this.props.selection.tournaments} 
          data={this.props.tournamentData} 
          callback={this.updateTournaments}
        />
        <TournamentSelector 
          name="Player" 
          selected={this.props.selection.players} 
          data={this.props.playerData} 
          callback={this.updatePlayers}
        />
      </div>
    )
  }
}

const gameResult = resultInt => resultInt == -1 ? "0-1" : resultInt == 0 ? "1/2-1/2" : "1-0";

const cleanGameData = data => {
  const getByAttribute = type => data => {
    const results = data.filter(att => att.attribute == type)
    return results.length > 0 ? results[0].value : ''
  }
  const cleaned = {
    'id': data.gameDataGame.id
  , 'whiteShort': playerNameShort(data.gameDataPlayerWhite)
  , 'blackShort': playerNameShort(data.gameDataPlayerBlack)
  , 'white': playerName(data.gameDataPlayerWhite)
  , 'black': playerName(data.gameDataPlayerBlack)
  , 'result': gameResult(data.gameDataGame.gameResult)
  , 'tournament': data.gameDataTournament.name
  , 'opening': ("gameDataOpening" in data && data.gameDataOpening != null) ? (data.gameDataOpening.variationName || "") : ""
  , 'pgn': data.gameDataGame.pgn
  , 'date': getByAttribute("Date")(data.gameDataAttributes)
  };
  return cleaned
}

const getSelectedGame = (games, gameId) => {
  if (gameId == null){
    return null;
  }
  const matches = games.filter(g => g.id == gameId);
  if (matches.length == 0){
    return null;
  }
  return matches[0];
}


const maxLength = 10;
const getSelectedBlunders = state => {
  var cleaned = state.moveEvalsData.data.slice(0, maxLength);

  const selectedIds = state.selection.players;
  const isInSelected = value => selectedIds.indexOf(value) > -1;
  if (!isInSelected){
    return [];
  }
  const isSelectedPlayer = moveEval => {
    const game = moveEval.moveEvalsGame;
    const ev = moveEval.moveEvalsMoveEval;
    const matchForWhite = isInSelected(game.playerWhiteId) && ev.isWhite;
    const matchForBlack = isInSelected(game.playerBlackId) && (!ev.isWhite);
    return matchForWhite || matchForBlack;
  }
  cleaned = cleaned.filter(isSelectedPlayer)

  var playersMap = {}
  for (var player of state.playerData.data){
    playersMap[player.id] = player;
  }
  const addPlayerName = moveEval => {
    const game = moveEval.moveEvalsGame;
    const playerWhite = playersMap[game.playerWhiteId];
    const playerBlack = playersMap[game.playerBlackId];

    return {...moveEval, ...{'playerWhite': playerWhite, 'playerBlack': playerBlack}}
  }
  return cleaned.map(addPlayerName);
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
    const avgEval = Math.floor(avg(gameEvals.map(getEvals)));

    const wins = filterForResult(100);
    const avgWinEval = Math.floor(avg(wins.map(getEvals)));

    const losses = filterForResult(0);
    const avgLossEval = Math.floor(avg(losses.map(getEvals)));

    const combineWithNumber = (av, num) => "" + av + " (" + num + " game" + (num > 1 ? "s" : "") + ")";

    const data = { 
      playerId: playerId
    , name: playerName(player)
    ,	number: gameEvals.length
    , avgEval: isNaN(avgEval) ? "" : avgEval
    , avgWinEval: isNaN(avgWinEval) ? "" : combineWithNumber(avgWinEval, wins.length)
    , avgLossEval: isNaN(avgLossEval) ? "" : combineWithNumber(avgLossEval, losses.length)
    }
    return data
  }
  return evaluations.map(cleanPlayerData);
}

// TODO: Need to fix performance here. Huge overhead.
const mapStateToPropsResultTabs = (state, ownProps) => ({
  playerData: state.playerData.data
, selectedDB: state.selectedDB
, selection: state.selection
, selectedGames: getSelectedGames(state).map(cleanGameData)
, selectedGame: getSelectedGame(getSelectedGames(state).map(cleanGameData), state.selectedGame)
, showType: state.showType
, selectedBlunders: getSelectedBlunders(state)
, moveEvalsData: state.moveEvalsData.data
, moveSummaryData: state.moveSummaryData.data
, playerAverages: getPlayerAverages(state.gameEvalData.data, state.playerData.data)
})


const mapDispatchToPropsResultTabs = (dispatch, ownProps) => ({
  selectGame: gameId => {
    dispatch(selectGame(gameId))
    updateUrl();
  }
, selectShowType: key => {
    dispatch(selectShowType(key));
    updateUrl();
  }
})


class ResultTabs extends React.Component {
  constructor(props){
    super(props);
  }
  setPlayers = data => this.setState({players: data.data});
  componentDidMount = () => {
    const playerRequest = { searchDB: this.props.dbSelected };
    getRequest(getUrl('api/players'), playerRequest, this.setPlayers)
  }
  /* This is a hack. Multiple windows here load their own data upon mounting. We do this because
   * it runs faster than pulling the state up, since if we'd pull the state up, we'd have to
   * obtain data even for windows we aren't rendering. However, this means that the component
   * will get stale whenever the selections change. To avoid that, we pass a key
   * to these components that's unique in whatever is selected right now, so a change
   * in the selection rebuilds the component.
  */
  getGamesHash = () => JSON.stringify(this.props.selectedGames.map(g => g.id)) + JSON.stringify(this.props.selection)
  render = () => {
    if (this.props.selectedGames.length == 0){
      return null
    }
    var gamesTable = <div/>;
    const GamesTableLoc = contextComp(GamesTable);
    gamesTable = 
      <GamesTable
        gamesData={this.props.selectedGames}
        selectedGame={this.props.selectedGame}
        selectGame={ this.props.selectGame }
      />

    const showTabs = this.props.playerData.length > 0
    var tabs = <div/>
    const blunderWindow = this.props.moveEvalsData.fetching ? null :
      <BlunderWindow 
        selection={ this.props.selection }
        key={ this.getGamesHash() } 
        players={ this.props.playerData } 
        gamesData={ this.props.selectedGames } 
        db={ this.props.selectedDB } 
        selectedBlunders={this.props.selectedBlunders}/>
    if (showTabs){ 
      tabs = (<Tabs activeKey={this.props.showType} onSelect={this.props.selectShowType} id="db-tabs">
          <Tab eventKey={ resultPanels.gameList } title={ resultPanels.gameList }>
            { gamesTable }
          </Tab>
          <Tab eventKey={ resultPanels.statistics } title={ resultPanels.statistics }>
            <StatWindow 
              key= {this.getGamesHash() } 
              db={this.props.selectedDB} 
              selection={this.props.selection} 
              players={ this.props.playerData } 
              gamesData={this.props.selectedGames}
              playerAverages={this.props.playerAverages}
              moveSummaryData={this.props.moveSummaryData}
              />
          </Tab>
          <Tab eventKey={ resultPanels.blunders } title={ resultPanels.blunders }>
            { blunderWindow }
          </Tab>
        </Tabs>)
    }
    return tabs
  }
    setMoveSummary = data => {
      this.setState({moveData: data.data});
    }
}

const ResultTabsConnected = connect(mapStateToPropsResultTabs, mapDispatchToPropsResultTabs)(ResultTabs);

const startingStateForSearch = {
  selection: { tournaments: [], players: [] },
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
  getGameSearchData = () => {
    const data = { 
      gameRequestDB: this.props.selectedDB
    , gameRequestTournaments: this.getSelectedTournaments()
    };
    return data
  }
  render = () => {
    var resultRow = <div/>;
    resultRow = (
      <Provider store={ store }>
        <ResultTabsConnected/>
      </Provider>
    )
    return (
      <div>
        <Row style={{ marginLeft: 0, marginRight: 0 }}>
          <SearchChoice
            selection={ this.props.selection }
            selectedDB={ this.props.selectedDB }
            playerData={this.props.playerData }
            tournamentData={this.props.tournamentData }
            selectedPlayers={this.state.selection.players}
            updateSelection = { this.props.updateSelection }
            tournamentData={this.props.tournamentData}/>
        </Row>
        <Row style={{ marginLeft: 0, marginRight: 0 }}>
          { resultRow }
        </Row>
      </div>
    )
  }
}

