import React, { Component } from "react";
import { Navbar, Grid, Row, Col, Button, FormGroup, FormControl, ControlLabel, NavItem, Nav, Modal } from "react-bootstrap";
import { axios } from '../api.js';
import ReactModal from 'react-modal';

ReactModal.setAppElement('body');

import { objectIsEmpty, loginConsts, loginData, loginOrRegisterUser, logout, getUser } from '../helpers.jsx';

const minPasswordLength = 1;

import styles from './Login.css';

const appName = "Chess data analytics";

const loginConst = 10
const menuConsts = {
	login: loginConsts.login
, register: loginConsts.register
, about: loginConst
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
		if (showType == loginConsts.register || showType == loginConsts.login){
			inside = (
				<Login loginType={ showType } logoutCallback={this.logoutCallback} userCallback={ this.props.userCallback } unsetTypeSelected = { this.unsetTypeSelected } />
			);
		} else {
			inside = <About unsetTypeSelected = { this.unsetTypeSelected } />
		}
		var modalElement = <div>{ inside }</div>

    return (
      <Modal show={ this.state.typeSelected != '' }>
        { modalElement }
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
      if (this.state.typeSelected > 0){
        loginWindow = this.show()
      }
      const userText = this.userIsLoggedIn() ? this.props.user.id : "Not logged in";
			var userElement = null;
			var nav = (<Nav pullRight>
					<NavItem eventKey={menuConsts.about}>
						About
					</NavItem>
					{ loginWindow }
				</Nav>)
      if (this.props.showUserElements){
				userElement = (
					<Navbar.Text>{userText}</Navbar.Text>
				)
				nav = (
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
						{ loginWindow }
					</Nav>
				)
      }
      var allUserElements = null;
      menu = (
        <Navbar inverse collapseOnSelect onSelect={ this.updateTypeSelected }>
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

export class About extends Component {
  constructor(props) {
    super(props);
	}
  render() {
    return (
      <div>
        <Modal.Header><Modal.Title>About</Modal.Title></Modal.Header>
        <Modal.Body>
					<div>This is a chess database that stores games and helps you obtain useful data on those games.</div>
					<div>For each game, the database stores the computer evaluation of all moves. This allows for new ways of understanding the games. Right now, the tool simply shows statistics that I found interesting. The goal is to expand the tool so that you can upload your own databases, and use this database to find out how to improve or how to prepare against an opponent</div>
					<div>The database is completely free and open-source. Here is the code for the <a href="https://github.com/cgoldammer/chess-database-backend" target="_blank">backend</a> and the <a href="https://github.com/cgoldammer/chess-database-frontend" target="_blank">frontend</a></div>.
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


