var path = require('path');
var webpack = require('webpack');

var PROD = (process.env.NODE_ENV == 'production');

module.exports = {
  devtool: PROD ? 'source-map' : 'eval',
  entry: PROD
    ? [ './src/index' ]
    : [ 'webpack-hot-middleware/client', './src/index' ],
  output: {
    path: __dirname,
    filename: 'index.js',
    publicPath: '/'
  },
  plugins:
    PROD
    ? [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.DefinePlugin({
          'process.env': {
            'NODE_ENV': JSON.stringify('production')
          }
        }),
        new webpack.optimize.UglifyJsPlugin({
          compressor: {
            warnings: false
          }
        })
      ]
    : [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
      ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loader: 'babel',
      include: path.join(__dirname, 'src')
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    }]
  }
};
