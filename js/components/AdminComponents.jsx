import React, { Component } from "react";
import { Button, FormGroup, FormControl, ControlLabel, NavItem, Nav, Checkbox } from "react-bootstrap";
import { Grid, Row, Col } from 'react-flexbox-grid';
import "../../css/Login.css";
import { axios, postRequest } from '../api.js';
import qs from "qs";
import ReactModal from 'react-modal';

export class EvaluationWindow extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      overwrite: false
    }
  }
  toggle = (selected) => this.setState({ overwrite: !this.state.overwrite });

  submit = () => {
    const callback = () => this.console.log('evaluations complete');
    const data = { evaluationDB: this.props.db, evaluationOverwrite: this.state.overwrite };
    console.log("Subbmitting data");
    console.log(data);
    postRequest('/snap/api/addEvaluations', data, callback)
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
