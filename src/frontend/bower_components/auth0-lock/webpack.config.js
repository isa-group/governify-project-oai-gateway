/*!
governify-gateway 1.0.0, built on: 2018-03-27
Copyright (C) 2018 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-gateway

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.*/

var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: './src/browser.js',
  output: {
    path: path.join(__dirname, '../build'),
    filename: 'lock.js'
  },
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.js', '.jsx', '.styl']
  },
  progress: true,
  watch: true,
  watchOptions: {
    aggregateTimeout: 500,
    poll: true
  },
  inline: true,
  stats: {
    colors: true,
    modules: true,
    reasons: true
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: path.join(__dirname, 'node_modules')
      },
      {
        test: /\.styl$/,
        use: [
          'css-loader',
          'stylus-loader',
          {
            loader: 'stylus-loader',
            options: {
              paths: ['node_modules/bootstrap-stylus/stylus'],
              preferPathResolver: 'webpack'
            }
          }
        ]
      }
    ]
  }
};
