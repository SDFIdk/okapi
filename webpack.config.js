/* global __dirname, require, module*/

const webpack = require('webpack');
const path = require('path');
const env = require('yargs').argv.env;
const pkg = require('./package.json');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
require('dotenv').config()

let libraryName = 'okapi';
const version = '1.2';

let outputFile, mode, token, example;

if (env === 'build') {
  mode = 'production';
  outputFile = libraryName + '-' + version + '.min.js';
  token = 'InsertYourTokenHere';
  username = 'InsertYourUsernameHere';
  password = 'InsertYourPasswordHere';
  example = "examples";
} else {
  mode = 'development';
  outputFile = libraryName + '-' + version + '.js';
  token = process.env.TOKEN || 'InsertYourTokenHere';
  username = process.env.DFUSERNAME || 'InsertYourUsernameHere';
  password = process.env.DFPASSWORD || 'InsertYourPasswordHere';
  example = "test";
}

const devMode = mode == 'development'

const config = {
  mode: mode,
  entry: __dirname + '/src/Index.js',
  devtool: 'inline-source-map',
  output: {
    path: __dirname + '/lib',
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true,
    globalObject: "typeof self !== 'undefined' ? self : this"
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin(),
      new OptimizeCSSAssetsPlugin({})
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      _: "lodash"
    }),
    ...['simple', 'advanced', 'markers-simple', 'markers-advanced', 'double', 'tooltip', 'datafordeler'].map((event) => {
      return new HtmlWebpackPlugin({
        "inject"   : "head",
        "template":  __dirname + "/src/examples/template.ejs",
        "templateParameters": {
          "title" : `${event}`,
          "token" : token,
          "username": username,
          "password": password
        },
        "filename" : __dirname + `/` + example + `/${event}.html`
      })
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: libraryName + '-' + version + '.css'
    }),
    new webpack.BannerPlugin({
      banner: 'okapi. See https://okapi.Kortforsyningen.dk \n' +
        'License: https://github.com/Kortforsyningen/okapi/blob/master/LICENSE \n' +
        'Version: v' + version
    })
  ],

  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      },
      {
        test: /\.styl(us)?$/,
        use: [
           MiniCssExtractPlugin.loader,
          'css-loader',
          'stylus-loader'
        ]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: 'base64-inline-loader?name=[name].[ext]'
      },
      {
        test: /\.(html)$/,
        use: {
          loader: 'html-loader'
        }
      },
      {
        test: /\.(ejs)$/,
        loader: 'ejs-loader'
      }
    ]
  },
  resolve: {
    modules: [path.resolve('./node_modules'), path.resolve('./src')],
    extensions: ['.json', '.js']
  }
};

module.exports = config;
