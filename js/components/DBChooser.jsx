import React from 'react';
import {Row, Col, Panel, ListGroup, ListGroupItem,} from 'react-bootstrap';
import overallStyles from '../OverallStyles.css';
import PropTypes from 'prop-types';

const splitData = data => {
  let dataPublic = data.filter(d => d.dB.isPublic);
  let dataPrivate = data.filter(d => d.dB.isPublic==false);
  return {'public': dataPublic, 'private': dataPrivate}
}

export class DBChooserAll extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const split = splitData(this.props.dbData);
    const dataPublic = split.public;
    const dataPrivate = split.private;

    const getDescription = keyName => {
      const number = split[keyName].length
      const cap = keyName.charAt(0).toUpperCase() + keyName.slice(1);
      return cap + ": " + number + " database" + (number > 1 ? "s" : "")
    }

    var chooserPrivate = <DBChooser name={getDescription("private")} dbData={dataPrivate} setDB={this.props.setDB}/>
    if (dataPrivate.length == 0) chooserPrivate = <div/>

    return (
      <div>
        <DBChooser name={getDescription("public")} dbData={dataPublic} setDB={this.props.setDB}/>
        { chooserPrivate }
      </div>
    )
  }
}


export class DBChooser extends React.Component {
  constructor(props) {
    super(props);
  }
  hasData = () => this.props.dbData.length > 0;

  getButton = data => (<ListGroupItem
    key={data.numbers.id}
    onClick={() => this.props.setDB(data.numbers.id)}>
    <Row>
      <Col xs={6} md={9}>
        <p className={overallStyles.header}> {data.dB.name} </p>
      </Col>
      <Col xs={6} md={3}>
        <p className={overallStyles.subHeader}> {data.numbers.games} games </p>
      </Col>
    </Row>
  </ListGroupItem>)

  render = () => {
    return (
      <Panel>
        <Panel.Heading>{this.props.name}</Panel.Heading>
        <ListGroup>
          { this.props.dbData.map(this.getButton) }
        </ListGroup>
      </Panel>
    );
  }
}

DBChooser.defaultProps = {
  dbData: [],
  name: PropTypes.string
};
