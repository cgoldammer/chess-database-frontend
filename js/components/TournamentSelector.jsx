import React from 'react';
import {Row, Col,} from 'react-bootstrap';
import Select from 'react-select';
import styles from './TournamentSelector.css';

export class TournamentSelector extends React.Component {
  constructor(props) {
    super(props);
  }
  data = () => {
    const data = this.props.fullSelection.allData[this.props.selectionName];
    return data
  }
  hasData = () => this.props.data().length > 0;
  getSelection = () => {
    return this.props.fullSelection.uiSelection[this.props.selectionName];
  }
  update = values => {
    const newSelection = this.props.fullSelection.updateUISelection(this.props.selectionName, values);
    this.props.callback(newSelection);
  }
  render = () => {
    return (
      <div className={styles.tournamentSelector}>
        <Row>
          <Col xs={12} mdOffset={3} md={6}>
            <span>{ this.props.name } </span>
            <Select 
              value={this.getSelection()}
              multi={true}
              options={this.data()} 
              valueKey={'id'}
              labelKey={'name'}
              placeholder={'pick a ' + this.props.name.toLowerCase()}
              onChange={this.update}/>
          </Col>
        </Row>
      </div> 
    );
  }
}

TournamentSelector.defaultProps = {
  data: [],
  resetIfAll: true,
};
