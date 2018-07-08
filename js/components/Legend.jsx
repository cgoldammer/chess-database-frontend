import React from 'react';

export class Legend extends React.Component {
  constructor(props) {
    super(props);
  }
  render = () => {
    const legendEntry = selected => {
      const color = this.props.colorScale(selected.index);
      const style = {float: "left", backgroundColor: color, margin: "2px 2px", minHeight: "12px", minWidth: "100px"};
      return (
        <div tyle={{margin: "0px 100px"}} key={ selected.index }><span style={style}></span><span>{ selected.name }</span></div>
      )
    }
    console.log("sel");
    console.log(this.props.selected);
    return (
      <div style={{marginLeft: "20px"}}>
        { this.props.selected.map(legendEntry) }
      </div>
    )
  }
}

