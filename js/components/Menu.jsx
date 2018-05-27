import React, { Component } from "react";
import { Navbar, Grid, Row, Col, Button, FormGroup, FormControl, ControlLabel, NavItem, Nav, Modal } from "react-bootstrap";
import { axios } from '../api.js';
import ReactModal from 'react-modal';

ReactModal.setAppElement('body');

import { objectIsEmpty, loginConsts, loginData, loginOrRegisterUser, logout, getUser } from '../helpers.jsx';

const minPasswordLength = 1;

import styles from './Login.css';

const appName = "Chess database";

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
    logout(handleLogout);
  }

  show = () => {
    const showType = this.state.typeSelected;

    const loginElement = (
      <div>
        <Login loginType={ showType } userCallback={ this.props.userCallback } />
      </div>
    );

    return (
      <Modal show={ this.state.typeSelected != '' } logoutCallback={this.logoutCallback} unsetTypeSelected={ this.unserTypeSelected }> 
        { loginElement }
      </Modal>
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
      var allUserElements = null;
      if (this.props.showUserElements){
        allUserElements = (<Navbar.Collapse>
            <Navbar.Toggle />
            <Navbar.Text>
              <span>{userText}</span>
            </Navbar.Text>
            <Nav pullRight>
              <NavItem eventKey={loginConsts.login}>
                Log in
              </NavItem>
              <NavItem eventKey={loginConsts.login}>
                Register
              </NavItem>
            </Nav>
            { loginWindow }
          </Navbar.Collapse>
        )
      }
      menu = (
        <Navbar inverse collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>
              {appName}
            </Navbar.Brand>
          </Navbar.Header>
          { allUserElements }
        </Navbar>
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
    const inside = 
      <div>
        <Row>
          <Button onClick={ this.closePopup }>Close User Details</Button>
        </Row>
        <Row>
          <Button onClick={ this.props.logoutCallback }> Log out </Button>;
        </Row>
      </div>
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

  registerCallback = () => getUser(this.props.userCallback);

  handleSubmit = event => {
    event.preventDefault();
    loginOrRegisterUser(this.props.loginType, this.state.email, this.state.password, this.registerCallback);
  }

  render() {
    const name = loginData[this.props.loginType].name;
    return (
      
      <div>
        <Modal.Header>{ name }</Modal.Header>
        <Modal.Body>
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
            { name }
            </Button>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={ this.props.unsetTypeSelected }>Close</Button>
        </Modal.Footer>
      </div>
    );
  }
}


