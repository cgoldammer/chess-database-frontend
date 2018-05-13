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
	plugins: [
			new webpack.HotModuleReplacementPlugin()
	],
  devServer: {
    contentBase: './lib',
    hot: true,
		port: 8081,
		host: '0.0.0.0',
		disableHostCheck: true,
		watchOptions: { aggregateTimeout: 300, poll: 1000 },
		proxy: {
			"/snap": {
				target: "http://0.0.0.0:8000",
				pathRewrite: {"^/snap": ""}
			}
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
	},
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
				loader: 'style-loader',
				options: {
					hmr: true
				}
			},
			{
				test: /\.css$/,
				loader: 'css-loader',
				include: [path.join(__dirname, 'js'), path.join(__dirname, 'node_modules')],
				exclude: [/react-select/], // so we have to exclude it,
				query: { 
					modules: true,
					localIdentName: '[name]__[local]___[hash:base64:5]'
				}
			},
			{
				test: /\.css$/,
				loader: 'style-loader!css-loader?modules',
				include: /react-select/
			}
    ]
  },
};
