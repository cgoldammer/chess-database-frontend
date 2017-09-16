var debug = process.env.NODE_ENV !== "production";
var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './main.js',
	devtool: debug ? "eval-source-map" : false,
  output: { path: __dirname, filename: debug ? 'lib/bundle.js' : 'lib/bundle.min.js' },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react', 'stage-0']
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
