import React from 'react';
import { Grid, Row, Col} from 'react-flexbox-grid';
import Select from 'react-select';
import { Button, DropdownButton, MenuItem, FormControl, Panel, ListGroup, ListGroupItem } from 'react-bootstrap';
import styles from '../App.css';


export class DBChooser extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: '',
		};
	}
	selectDB = (selected) => {
		this.setState({ selected });
		this.props.dbAction(selected);
	};
	hasData = () => this.props.dbData.length > 0;

  getButton = (data) => <ListGroupItem key={data.id} onClick={() => this.selectDB(data.id)}>{data.name} </ListGroupItem>

	render = () => {
		return (
      <Row>
        <Col mdOffset={3} md={6}>
          <Panel>
            <Panel.Heading>Pick a database</Panel.Heading>
            <ListGroup>
              { this.props.dbData.map(this.getButton) }
            </ListGroup>
          </Panel>
        </Col>
      </Row>
		)
	}
}

DBChooser.defaultProps = {
  dbData: []
}
