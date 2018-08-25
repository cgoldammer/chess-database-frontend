import React from 'react';
import {Button, Checkbox,} from 'react-bootstrap';
import {postRequest,} from '../api.js';

import {getUrl,} from '../helpers.jsx';

export class EvaluationWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      overwrite: false,
    };
  }
  toggle = () => this.setState({overwrite: !this.state.overwrite,});

  submit = () => {
    const callback = () => null;
    const data = {evaluationDB: this.props.db, 
      evaluationOverwrite: this.state.overwrite,};
    postRequest(getUrl('api/addEvaluations'), data, callback);
  }

  render = () => {
    return (
      <div>
        <Checkbox
          checked={this.state.checkboxChecked}
          onChange={this.toggle}>Overwrite evaluations?</Checkbox>
        <Button onClick={this.submit} >Add evaluations</Button>
      </div>
    );
  }
}
