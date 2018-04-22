require.extensions['.css'] = () => {
  return;
};

var debug = process.env.NODE_ENV !== "production";
var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './main.js',
	devtool: debug ? "eval-source-map" : false,
  output: { path: __dirname, filename: debug ? 'lib/bundle.js' : 'lib/bundle.min.js' },
  module: {
    rules: [
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
				loader: 'style-loader'
			},
			{
				test: /\.css$/,
				// use: ['style-loader', 'css-loader' ],
				loader: 'css-loader',
				include: path.join(__dirname, 'js'),
				exclude: [/flexboxgrid2/, /react-select/], // so we have to exclude it,
				query: { 
					modules: true,
					localIdentName: '[name]__[local]___[hash:base64:5]'
				}
			},
			{
				test: /\.css$/,
				loader: 'style-loader!css-loader?modules',
				include: /flexboxgrid2/
			}
,
			{
				test: /\.css$/,
				loader: 'style-loader!css-loader?modules',
				include: /react-select/
			}
    ]
  },
};
