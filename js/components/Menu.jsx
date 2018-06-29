import React, { Component } from "react";
import { HelpBlock, Label, Navbar, Grid, Row, Col, Button, FormGroup, FormControl, ControlLabel, NavItem, Nav, Modal } from "react-bootstrap";
import { axios } from '../api.js';
import ReactModal from 'react-modal';

ReactModal.setAppElement('body');

import { objectIsEmpty, loginConsts, loginData, loginOrRegisterUser, logout, getUser } from '../helpers.jsx';

const minPasswordLength = 1;

import styles from './Login.css';
import statStyles from './StatWindows.css';

const appName = "Chess insights";

const loginConst = 10
const menuConsts = {
  register: loginConsts.register
, login: loginConsts.login
, about: loginConsts.login + 1
, details: loginConsts.login + 2
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
    logout(handleLogout);
  }

  show = () => {
    const showType = this.state.typeSelected;
		var inside = null
		if (showType == menuConsts.register || showType == menuConsts.login){
			inside = (
				<Login loginType={ showType } logoutCallback={this.logoutCallback} userCallback={ this.props.userCallback } unsetTypeSelected = { this.unsetTypeSelected } />
			);
		} else if (showType == menuConsts.details){
			inside = <UserDetail logoutCallback = { this.logoutCallback } user= { this.props.user } unsetTypeSelected = { this.unsetTypeSelected } />
		} else {
			inside = <About unsetTypeSelected = { this.unsetTypeSelected } />
		} 

    return (
      <Modal show={ this.state.typeSelected != '' }>
        { inside }
      </Modal>
    )
  }

  updateTypeSelected = type => this.setState({typeSelected: type})
  userIsLoggedIn = () => !objectIsEmpty(this.props.user)

  render = () => {
		var nav = null;
    var loginWindow = null;
    if (this.state.typeSelected > 0){
      loginWindow = this.show()
    }
    if (this.userIsLoggedIn()) {
			nav = (
				<div>
					<Navbar.Text> Welcome back! </Navbar.Text>
					<Nav pullRight>
						<NavItem eventKey={menuConsts.details} logoutCallback={ this.logoutCallback }>
              Account details
						</NavItem>
						<NavItem eventKey={menuConsts.about}>
							About
						</NavItem>
					</Nav>
					{ loginWindow }
				</div>
			)
    }
    else {
      const userText = this.userIsLoggedIn() ? this.props.user.id : "Not logged in";
			var userElement = null;
			var nav = null;
			var nav = (<div>
				<Nav pullRight>
					<NavItem eventKey={menuConsts.about}>
						About
					</NavItem>
				</Nav>
				{ loginWindow }
			</div>)
      if (this.props.showUserElements){
				userElement = (
					<Navbar.Text>{userText}</Navbar.Text>
				)
				nav = (<div>
					<Nav pullRight>
						<NavItem eventKey={menuConsts.login}>
							Log in
						</NavItem>
						<NavItem eventKey={menuConsts.register}>
							Register
						</NavItem>
						<NavItem eventKey={menuConsts.about}>
							About
						</NavItem>
					</Nav>
					{ loginWindow }
				</div>)
      }
      var allUserElements = null;
    }
		const menu = (
			<Navbar inverse collapseOnSelect style={{ marginBottom: 0, borderRadius: 0 }} onSelect={ this.updateTypeSelected }>
				<Navbar.Header>
					<Navbar.Brand>
						{appName}
					</Navbar.Brand>
					<Navbar.Toggle />
				</Navbar.Header>
				<Navbar.Collapse>
					{ userElement }
					{ nav }
					{ loginWindow }
				</Navbar.Collapse>
			</Navbar>
		)
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
    const hr = <hr style={{ height: "2px", border: "0 none", color: "lightGray", backgroundColor: "lightGray" }}/>
    const inside = (
      <div>
        <Modal.Header><Modal.Title>About</Modal.Title></Modal.Header>
        <Modal.Body>
          <Row style={{margin: "0px 0px"}}>
            <Col xs={6}>
              <div>Email:</div>
            </Col>
            <Col xs={6}>
              <div> { this.props.user.userId } </div>
            </Col>
          </Row>
          { hr }
          <Row style={{margin: "0px 0px"}}>
            <Button onClick={ this.props.logoutCallback }> Log out </Button>
          </Row>
        </Modal.Body>
        <Modal.Footer> 
          <Button onClick={ this.props.unsetTypeSelected }>Close User Details</Button>
        </Modal.Footer>
      </div>
    )
    return inside
  }
}

export class About extends Component {
  constructor(props) {
    super(props);
	}
  render() {
    return (
      <div>
        <Modal.Header><Modal.Title>About</Modal.Title></Modal.Header>
        <Modal.Body>
          <div>
            <p className={styles.description}>
              This is a chess database that stores games and helps you obtain useful data on those games.
            </p>
            <p className={styles.description}>
              For each game, the database stores the computer evaluation of all moves. Right now, the tool shows simple statistics.
            </p>
            <p className={styles.description}>
              The goal is to expand the tool so that you can upload your own databases, and use this database to find out how to improve or how to prepare against an opponent
            </p>
            <p className={styles.description}>
              The database is completely free and open-source. Here is the code for the <a href="https://github.com/cgoldammer/chess-database-backend" target="_blank">backend</a> and the <a href="https://github.com/cgoldammer/chess-database-frontend" target="_blank">frontend</a>
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={ this.props.unsetTypeSelected }>Close</Button>
        </Modal.Footer>
      </div>
    );
	}
}

export class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: ""
    , password: ""
    , failMessage: null
    };
  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length >= minPasswordLength;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
    this.setState({ failMessage: null });
  }

  registerCallback = data => {
    getUser(this.props.userCallback);
    this.props.unsetTypeSelected();
  }
  failCallback = data => {
    this.showFail(data.response.data);
  }
  showFail = data => this.setState({failMessage: data})

  handleSubmit = event => {
    event.preventDefault();
    loginOrRegisterUser(this.props.loginType, this.state.email, this.state.password, this.registerCallback, this.failCallback);
  }

  render() {
    const name = loginData[this.props.loginType].name;
    return (
      
      <div>
        <Modal.Header><Modal.Title>{ name }</Modal.Title></Modal.Header>
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
            { this.state.failMessage ? <HelpBlock bsStyle="warning" style= {{ color: "red" }} > { this.state.failMessage } </HelpBlock> : null }
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


