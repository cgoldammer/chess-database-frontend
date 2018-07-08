const merge = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.common.js');

const features = {
  SHOWUSERS: false
, BACKENDURL: 'snap_prod'
, ISADMIN: false
, MIN_DATA_QUALITY: true
}

const prodExports = {
  mode: 'production',
  output: { path: __dirname, filename: 'lib/bundle.min.js' },
  devtool: false,
  plugins: [
    new webpack.EnvironmentPlugin(features)
  ]
}

module.exports = merge(common, prodExports);
