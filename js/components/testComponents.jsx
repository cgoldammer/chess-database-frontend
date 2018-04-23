import React from 'react';

export class Test2 extends React.Component {
  render = () => { return (<div/>) }
}

export class Test1 extends React.Component {
  render = () => {
    return (
      <div>
        <Test2/>
        <Test2/>
        <p>hi</p>
      </div>
    );
  }
}
