require.extensions['.css'] = () => {
  return;
};

var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './main.js',
  plugins: [
      new webpack.HotModuleReplacementPlugin(),
  ],
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
