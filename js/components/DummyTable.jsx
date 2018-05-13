import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';

const columns = [ {dataField: 'id', text: 'Id', hidden:true}
, {dataField: 'white', text: 'White'}
, {dataField: 'black', text: 'Black'}
, {dataField: 'tournament', text: 'Tournament'}
, {dataField: 'date', text: 'Date'}];

export const data = [
  {id: 234, white: "Carlsen, Magnus", black:'ffff fsdfsd fsdfsd', tournament: 'fsdfsd fsdfds', date: '2018/02/23'}
, {id: 2344, white: "Carlsen, ", black:'ffff fsdfsd fsdfsd', tournament: 'fsdfsd fsdfds', date: '2018/02/23'}
, {id: 23422, white: "Carlsen, ", black:'ffff fsdfsd fsdfsd', tournament: 'fsdfsd fsdfds', date: 'fdsfsd'}
]

export const dummyTable = <BootstrapTable keyField="id" data={ data } columns={columns}/>;

