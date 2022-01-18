import React from 'react';
import {Row, Col, Panel, ListGroup, ListGroupItem,} from 'react-bootstrap';
import overallStyles from '../OverallStyles.css';

export class DBChooser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: '',
    };
  }
  hasData = () => this.props.dbData.length > 0;

  getButton = data => (<ListGroupItem
    key={data.id}
    onClick={() => this.props.setDB(data.id)}>
    <Row>
      <Col xs={6} md={9}>
        <p className={overallStyles.header}> {data.name} </p>
      </Col>
      <Col xs={6} md={3}>
        <p className={overallStyles.subHeader}> {data.games} games </p>
      </Col>
    </Row>
  </ListGroupItem>)

  render = () => {
    return (
      <Panel>
        <Panel.Heading>Pick a database</Panel.Heading>
        <ListGroup>
          { this.props.dbData.map(this.getButton) }
        </ListGroup>
      </Panel>
    );
  }
}

DBChooser.defaultProps = {
  dbData: [],
};
