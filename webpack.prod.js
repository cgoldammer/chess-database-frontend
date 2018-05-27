const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

const features = {
  'SHOWUSERS': JSON.stringify(false)
, 'BACKENDURL': JSON.stringify('snap_prod')
}
prodExports = {
  mode: 'production',
  output: { path: __dirname, filename: 'lib/bundle.min.js' },
  devtool: false,
  plugins: [
    new webpack.DefinePlugin(features)
  ]
}

module.exports = merge(common, prodExports);
