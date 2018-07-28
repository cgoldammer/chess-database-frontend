import React from 'react';
import { Grid, Row, Col, Button, DropdownButton, MenuItem, FormControl, Panel, ListGroup, ListGroupItem } from 'react-bootstrap';
import styles from '../App.css';
import { Link } from 'react-router-dom';

export class DBChooser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: '',
    };
  }
  hasData = () => this.props.dbData.length > 0;

  getButton = data => <ListGroupItem key={data.id} onClick={() => this.props.setDB(data.id)}><p style={{fontSize: "130%"}}>{data.name}</p></ListGroupItem>

  render = () => {
    return (
      <Panel>
        <Panel.Heading>Pick a database</Panel.Heading>
        <ListGroup>
          { this.props.dbData.map(this.getButton) }
        </ListGroup>
      </Panel>
    )
  }
}

DBChooser.defaultProps = {
  dbData: []
}
