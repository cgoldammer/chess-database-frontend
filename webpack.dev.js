const merge = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.common.js');

const features = {
  SHOWUSERS: true
, BACKENDURL: 'snap_dev'
, ISADMIN: true
, MIN_DATA_QUALITY: false
}

devExports = {
  mode: 'development',
  devtool: "eval-source-map",
  output: { path: __dirname, filename: 'lib/bundle.js'},
  devServer: {
    contentBase: './lib',
    hot: true,
    port: 8081,
    host: '0.0.0.0',
    disableHostCheck: true,
    watchOptions: { aggregateTimeout: 300, poll: 1000 },
    proxy: {
      "/snap_dev": {
        target: "http://0.0.0.0:8000",
        pathRewrite: {"^/snap_dev": ""}
      }
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
  },
  plugins: [
    new webpack.EnvironmentPlugin(features)
  ]
}

module.exports = merge(common, devExports);
