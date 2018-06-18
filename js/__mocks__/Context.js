import React, { Component } from "react";

const EmptyProvider = ({ children }) => (
  <div>
    <div>
      {children}
   </div>
  </div>
);

export const defaultLoc = {db: null};
const testDefaults = {loc: defaultLoc, locSetter: () => {}}

export const LocationContext = {
  Provider: EmptyProvider
, Consumer: ({children}) => children(testDefaults)
}

