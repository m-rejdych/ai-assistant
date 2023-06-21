const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'build.[contenthash:8].js',
    path: path.resolve(__dirname, 'dist'),
  },
  target: 'node',
  node: false,
  mode: 'production',
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /.ts$/,
        use: ['babel-loader', 'ts-loader'],
        exclude: /node_modules/,
      },
    ],
  },
};
