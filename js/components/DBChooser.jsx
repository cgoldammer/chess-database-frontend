import React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';
import Select from 'react-select';
import { Button, DropdownButton, MenuItem, FormControl } from 'react-bootstrap';

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

	render = () => {
    const dataButton = (data) => {  
      const buttonType = data.id == this.state.selected ? "success" : "default"
      return (
        <Col key={data.id} xs={6} md={2}> <Button bsStyle={buttonType} key={data.id} onClick={() => this.selectDB(data.id)}> { data.name }  </Button></Col>
      )
    }
		return (
			<Grid>
        <Row>
          Pick a database
        </Row>
        <Row>
        { this.props.dbData.map(dataButton) }
        </Row>
			</Grid> 
		)
	}
}

DBChooser.defaultProps = {
  dbData: []
}
