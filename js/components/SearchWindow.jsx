import React from 'react';

import {Row, Tabs, Tab,} from 'react-bootstrap';

import {TournamentSelector,} from './TournamentSelector.jsx';
import {GamesTable,} from './GamesTable.jsx';
import {StatWindow,} from './StatWindows.jsx';
import {BlunderWindow,} from './BlunderWindow.jsx';
import {getRequest,} from '../api.js';
import {avg, playerName, resultPanels, 
  getUrl, cleanGameData, getOpenings, createFullSelection, getSelectedGame} from '../helpers.jsx';
import {connect, Provider,} from 'react-redux';
import {store, updateUrl,} from '../redux.jsx';
import {selectGame, selectShowType,} from '../actions.jsx';

/* A search window is used to select games from the database */
export class SearchChoice extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    return (
      <div>
        <TournamentSelector 
          name="Tournament" 
          fullSelection={this.props.fullSelection}
          selectionName="tournaments"
          callback={this.props.updateSelection}
        />
        <TournamentSelector 
          name="Player" 
          fullSelection={this.props.fullSelection}
          selectionName="players"
          callback={this.props.updateSelection}
        />
        <TournamentSelector 
          name="Opening" 
          fullSelection={this.props.fullSelection}
          selectionName="openings"
          resetIfAll={false}
          callback={this.props.updateSelection}
        />
      </div>
    );
  }
}


const getSelectedBlunders = (data, gameIds, playerIds, playerData) => {
  var cleaned = data;
  console.log("GAMES: " + cleaned.length);
  console.log("players: " + playerIds);

  const isInGameList = moveEval => gameIds.indexOf(moveEval.game.id) > -1;
  cleaned = cleaned.filter(isInGameList);
  console.log("GAMES: " + cleaned.length);

  const isInSelected = value => playerIds.indexOf(value) > -1;
  if (!isInSelected){
    return [];
  }
  const isSelectedPlayer = moveEval => {
    const game = moveEval.game;
    const ev = moveEval.moveEval;
    const matchForWhite = isInSelected(game.playerWhiteId) && ev.isWhite;
    const matchForBlack = isInSelected(game.playerBlackId) && (!ev.isWhite);
    return matchForWhite || matchForBlack;
  };
  cleaned = cleaned.filter(isSelectedPlayer);
  console.log("GAMES after pla: " + cleaned.length);

  var playersMap = {};
  for (var player of playerData){
    playersMap[player.id] = player;
  }
  const addPlayerName = moveEval => {
    const game = moveEval.game;
    const playerWhite = playersMap[game.playerWhiteId];
    const playerBlack = playersMap[game.playerBlackId];

    return {...moveEval, ...{'playerWhite': playerWhite, 'playerBlack': playerBlack,},};
  };

  const maxNumber = 50;
  return cleaned.map(addPlayerName).slice(0, maxNumber);
};

/* This function returns a list that can be displayed as a table */
const getPlayerAverages = (evaluations, players) => {
  if (players.length == 0){
    return [];
  }
  const getPlayerById = id => players.filter(p => p.id == id)[0];

  const cleanPlayerData = dat => {
    const playerId = dat[0];
    const gameEvals = dat[1];
    const player = getPlayerById(playerId);
    const getEvals = ev => ev[0];
    const filterForResult = result => gameEvals.filter(ge => ge[1] == result);
    const avgEval = Math.floor(avg(gameEvals.map(getEvals)));

    const wins = filterForResult(100);
    const avgWinEval = Math.floor(avg(wins.map(getEvals)));

    const losses = filterForResult(0);
    const avgLossEval = Math.floor(avg(losses.map(getEvals)));

    const withNumber = (av, num) => 
      '' + av + ' (' + num + ' game' + (num > 1 ? 's' : '') + ')';

    const data = { 
      playerId: playerId,
      name: playerName(player),
      number: gameEvals.length,
      avgEval: isNaN(avgEval) ? '' : avgEval,
      avgWinEval: isNaN(avgWinEval) ? '' : withNumber(avgWinEval, wins.length),
      avgLossEval: isNaN(avgLossEval) ? '' : withNumber(avgLossEval, losses.length),
    };
    return data;
  };
  return evaluations.map(cleanPlayerData);
};


const mapStateToPropsResultTabs = state => {
  const fullSelection = createFullSelection(state);
  const selectedGames = fullSelection.selectedGamesForTable();
  const activePlayers = fullSelection.activePlayers()
  
  const data = {
    playerData: state.playerData.data,
    selectedDB: state.selectedDB,
    selectedGames: selectedGames,
    selectedGame: getSelectedGame(selectedGames, state.selectedGame),
    showType: state.showType,
    selectedBlunders: getSelectedBlunders(state.moveEvalsData.data, selectedGames.map(g => g.id), activePlayers, state.playerData.data),
    moveEvalsData: state.moveEvalsData.data,
    moveSummaryData: state.moveSummaryData.data,
    playerAverages: getPlayerAverages(state.gameEvalData.data, state.playerData.data),
  };
  return data
}


const mapDispatchToPropsResultTabs = dispatch => ({
  selectGame: gameId => {
    dispatch(selectGame(gameId));
    updateUrl();
  },
  selectShowType: key => {
    dispatch(selectShowType(key));
    updateUrl();
  },
});


class ResultTabs extends React.Component {
  constructor(props){
    super(props);
  }
  setPlayers = data => this.setState({players: data.data,});
  componentDidMount = () => {
    const playerRequest = {searchDB: this.props.dbSelected,};
    getRequest(getUrl('api/players'), playerRequest, this.setPlayers);
  }
  /* This is a hack. Multiple windows here load their own data upon mounting. 
   * We do this because it runs faster than pulling the state up, since if we'd pull 
   * the state up, we'd have to obtain data even for windows we aren't rendering. 
   * However, this means that the component will get stale whenever the selections 
   * change. To avoid that, we pass a key to these components that's unique in 
   * whatever is selected right now, so a change in the selection rebuilds 
   * the component.  */
  render = () => {
    if (this.props.selectedGameslength == 0){
      return null;
    }
    const gamesTable = 
      <GamesTable
        gamesData={this.props.selectedGames}
        selectedGame={this.props.selectedGame}
        selectGame={this.props.selectGame}
      />;

    const showTabs = this.props.playerData.length > 0;
    var tabs = <div/>;
    const blunderWindow = this.props.moveEvalsData.fetching ? null :
      <BlunderWindow 
        selection={this.props.selection}
        players={this.props.playerData} 
        gamesData={this.props.selectedGames} 
        db={this.props.selectedDB} 
        selectedBlunders={this.props.selectedBlunders}/>;
    if (showTabs){ 
      tabs = (<Tabs
        activeKey={this.props.showType}
        onSelect={this.props.selectShowType}
        id="db-tabs">
        <Tab
          eventKey={resultPanels.gameList}
          title={resultPanels.gameList}>
          { gamesTable }
        </Tab>
        <Tab 
          eventKey={resultPanels.statistics} 
          title={resultPanels.statistics}>
          <StatWindow 
            db={this.props.selectedDB} 
            selection={this.props.selection} 
            players={this.props.playerData} 
            gamesData={this.props.selectedGames}
            playerAverages={this.props.playerAverages}
            moveSummaryData={this.props.moveSummaryData}
          />
        </Tab>
        <Tab eventKey={resultPanels.blunders} title={resultPanels.blunders}>
          { blunderWindow }
        </Tab>
      </Tabs>);
    }
    return tabs;
  }
    setMoveSummary = data => {
      this.setState({moveData: data.data,});
    }
}

const ResultTabsConnected = connect(mapStateToPropsResultTabs, 
  mapDispatchToPropsResultTabs)(ResultTabs);

const startingStateForSearch = {
  selection: {tournaments: [], players: [],},
  gamesData: [],
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
  render = () => {
    var resultRow = <div/>;
    resultRow = (
      <Provider store={store}>
        <ResultTabsConnected/>
      </Provider>
    );
    return (
      <div>
        <Row style={{marginLeft: 0, marginRight: 0,}}>
          <SearchChoice
            fullSelection={this.props.fullSelection}
            selectedDB={this.props.selectedDB}
            playerData={this.props.playerData}
            tournamentData={this.props.tournamentData}
            gamesData={this.props.gamesData}
            selectedPlayers={this.state.selection.players}
            selectedGames={this.props.selectedGames}
            updateSelection={this.props.updateSelection}
            tournamentData={this.props.tournamentData}/>
        </Row>
        <Row style={{marginLeft: 0, marginRight: 0,}}>
          { resultRow }
        </Row>
      </div>
    );
  }
}

