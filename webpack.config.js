var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './main.js',
  output: { path: __dirname, filename: 'lib/bundle.js' },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }
      },
			{
				test: /\.css$/,
				loader: 'style!css!',
				include: path.join(__dirname, 'node_modules'), // oops, this also includes flexboxgrid
				exclude: /flexboxgrid/ // so we have to exclude it
			},
			{
				test: /\.css/,
				loader: 'style-loader!css-loader?modules',
				include: /flexboxgrid/
			}
    ]
  },
};
