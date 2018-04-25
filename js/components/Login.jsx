import React, { Component } from "react";
import { Button, FormGroup, FormControl, ControlLabel, NavItem, Nav } from "react-bootstrap";
import { Grid, Row, Col } from 'react-flexbox-grid';
import "../../css/Login.css";
import { axios } from '../api.js';
import qs from "qs";
import ReactModal from 'react-modal';

ReactModal.setAppElement('body');

import { objectIsEmpty } from '../helpers.js';

const minPasswordLength = 1;

import styles from './Login.css';

const appName = "Chess database";


// App stores currently logged in user (can be empty if not logged in).
// The top bar shows thw folowing options:
// Register, Log in (if not logged in). If logged in, show "user settings" with "log out" button.


const consts = {
  register: 1,
  login: 2
}

export class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      typeSelected: 0 
    }
  }

  unsetTypeSelected = () => this.setState({ typeSelected: 0 });
  userIsLoggedIn = () => !objectIsEmpty(this.props.user)

  logoutCallback = () => {
    const handleLogout = () => {
      this.props.userCallback({data: {}});
      this.unsetTypeSelected();
    }
    
    axios.get('/snap/logout').then(handleLogout);
  }

  show = () => {
    const showType = this.state.typeSelected;
    var showText;
    var showUrl;
  
    if (showType == consts.register){
      showText = "Register"
      showUrl = "register"
    }
    if (showType == consts.login){
      showText = "Log in"
      showUrl = "login"
    }

    const loginElement = (
      <div>
        <Button onClick={ this.unsetTypeSelected }>Close</Button>
        <Login text={ showText } url= { showUrl } userCallback={ this.props.userCallback } />
      </div>
    );

    return (
      <ReactModal isOpen={ this.state.typeSelected != '' }> { loginElement } </ReactModal>
    )
  }

  updateTypeSelected = (type) => this.setState({typeSelected: type})
  userIsLoggedIn = () => !objectIsEmpty(this.props.user)

  render = () => {
    var menu = <div/>
    if (this.userIsLoggedIn()) {
      menu = (
        <div>
          <div> Hi { this.props.user.userId } </div>
          <UserDetail logoutCallback={ this.logoutCallback }/>
        </div>
      )
    }
    else {
      var loginWindow = <div/>
      if (this.state.typeSelected){
        loginWindow = this.show()
      }
      const userText = this.userIsLoggedIn() ? this.props.user.id : "Not logged in";
      menu = (
        <Row end="xs">
          <Col xs={4}>
            <span>{appName}</span>
          </Col>
          <Col xs={4}>
            <span>{userText}</span>
          </Col>
          <Col xsOffset={2} xs={1} >
            <div className={styles.nav} onClick={() => this.updateTypeSelected(consts.register)}>Register</div>
          </Col>
          <Col xs={1} >
            <div className={styles.nav} onClick={() => this.updateTypeSelected(consts.login)}>Log in</div>
          </Col>
          { loginWindow }
        </Row>
      
      )
    }
    return menu;
  }
}

Menu.defaultProps = {
  user: {}
}

export class UserDetail extends React.Component {
	constructor(props) {
    super(props);
    this.state = {open: false}
	}
  showPopup = () => this.setState({open: true})
  closePopup = () => this.setState({open: false})

  render = () => {
    const inside = <Grid>
        <Row>
          <Button onClick={ this.closePopup }>Close User Details</Button>
        </Row>
        <Row>
          <Button onClick={ this.props.logoutCallback }> Log out </Button>;
        </Row>
      </Grid>
    return (
      <div>
        <div className={styles.nav} onClick={this.showPopup}>Show user details</div>
        <ReactModal isOpen={ this.state.open }> { inside } </ReactModal>
      </div>
    )
  }
}


export class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: ""
    };
  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length >= minPasswordLength;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  registerCallback = () => {
    // Obtain the logged-in user and pass it back to the callback of the mother element
    axios.get('/snap/api/user').then(this.props.userCallback);
  };

  handleSubmit = event => {
    event.preventDefault();
    axios.post('/snap/' + this.props.url, qs.stringify(this.state)).then(this.registerCallback);
  }

  render() {
    return (
      <div className="{ this.props.text }">
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="email" bsSize="large">
            <ControlLabel>Email</ControlLabel>
            <FormControl
              autoFocus
              type="email"
              value={this.state.email}
              onChange={this.handleChange}
            />
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel>Password</ControlLabel>
            <FormControl
              value={this.state.password}
              onChange={this.handleChange}
              type="password"
            />
          </FormGroup>
          <Button
            block
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
          >
          { this.props.text }
          </Button>
        </form>
      </div>
    );
  }
}


