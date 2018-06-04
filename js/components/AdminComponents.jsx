import React, { Component } from "react";
import { Grid, Row, Col, Button, FormGroup, FormControl, ControlLabel, NavItem, Nav, Checkbox } from "react-bootstrap";
import { axios, postRequest } from '../api.js';
import qs from "qs";
import ReactModal from 'react-modal';

import { getUrl } from '../helpers.jsx'

export class EvaluationWindow extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      overwrite: false
    }
  }
  toggle = (selected) => this.setState({ overwrite: !this.state.overwrite });

  submit = () => {
    const callback = () => null;
    const data = { evaluationDB: this.props.db, evaluationOverwrite: this.state.overwrite };
    postRequest(getUrl('api/addEvaluations'), data, callback)
  }

  render = () => {
    return (
      <div>
        <Checkbox checked={this.state.checkboxChecked} onChange={ this.toggle }>Overwrite evaluations?</Checkbox>
        <Button onClick={ this.submit } >Add evaluations</Button>
      </div>
    )
  }
}
