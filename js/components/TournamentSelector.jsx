import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import styles from './TournamentSelector.css';

export class TournamentSelector extends React.Component {
  constructor(props) {
    super(props);
  }
  hasData = () => this.props.tournamentData.length > 0;
  render = () => {
    return (
      <div className={styles.tournamentSelector}>
        <Row>
          <Col xs={12} mdOffset={3} md={6}>
            <span>Tournament</span>
            <Select 
              value={this.props.selected}
              multi={true}
              options={this.props.tournamentData} 
              valueKey={'id'}
              labelKey={'name'}
              placeholder={'pick a tournament or multiple tournaments'}
              onChange={this.props.callback}/>
          </Col>
        </Row>
      </div> 
    )
  }
}

TournamentSelector.defaultProps = {
  tournamentData: []
}
