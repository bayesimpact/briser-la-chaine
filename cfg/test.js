const path = require('path')
const webpack = require('webpack')
const mapKeys = require('lodash/mapKeys')
const mapValues = require('lodash/mapValues')

const baseConfig = require('./base')
const colors = require('./colors.json5')
const constants = require('./const.json5')


module.exports = {
  devtool: 'eval',
  entry: './test/webpack/loadtests.ts',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif|svg|woff|woff2|css|sass|scss|less|styl)$/,
        use: 'null-loader',
      },
      {
        test: /\.json$/,
        type: 'javascript/auto',
        use: 'json5-loader',
      },
      {
        include: [
          path.join(__dirname, '../src'),
          path.join(__dirname, '../test/webpack'),
        ],
        test: /\.[jt]sx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              '@babel/plugin-syntax-dynamic-import',
              ['@babel/plugin-proposal-class-properties', {loose: false}],
              ['@babel/plugin-proposal-optional-chaining', {loose: false}],
            ],
            presets: [['@babel/env', {modules: false}], '@babel/react', '@babel/typescript'],
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      ...mapKeys(mapValues(colors, () => '""'), (color, name) => `colors.${name}`),
      ...mapKeys(mapValues(constants, () => '""'), (value, key) => `config.${key}`),
      'config.clientVersion': '""',
      'config.environment': '"test"',
    }),
  ],
  resolve: baseConfig.resolve,
}