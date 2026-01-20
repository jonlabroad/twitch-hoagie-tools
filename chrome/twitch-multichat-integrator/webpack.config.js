const path = require('path');

module.exports = {
  entry: {
    background: './src/background.ts',
    'content-twitch': './src/content-twitch.ts',
    'content-youtube': './src/content-youtube.ts',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  devtool: 'cheap-source-map',
};
