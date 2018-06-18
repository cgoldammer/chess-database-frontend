import React from "react";

export const defaultLoc = {
  db: null
, showType: null
, game: null
};

export const LocationContext = React.createContext({
  loc: defaultLoc
, locSetter: () => {}
});

