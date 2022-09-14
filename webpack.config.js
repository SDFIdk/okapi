/* global __dirname, require, module*/

const webpack = require('webpack');
const path = require('path');
const env = require('yargs').argv.env;
const pkg = require('./package.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ESLintPlugin = require('eslint-webpack-plugin');
require('dotenv').config();
const fs = require('fs')
const getSRI = require('get-sri');

const libraryName = pkg.name;
const version = pkg.version;

let min = ''
try {
  min = fs.readFileSync('./lib/' + libraryName + '-' + version + '.min.js', 'utf8')
} catch {}

let outputFile, mode, token, example;

if (env === 'build') {
  mode = 'production';
  outputFile = libraryName + '-' + version + '.min.js';
  cssFileName = libraryName + '-' + version + '.min.css';
  token = 'InsertYourTokenHere';
  username = 'InsertYourUsernameHere';
  password = 'InsertYourPasswordHere';
  example = "examples";
} else {
  mode = 'development';
  outputFile = libraryName + '-' + version + '.js';
  cssFileName = libraryName + '-' + version + '.css';
  token = process.env.TOKEN || 'InsertYourTokenHere';
  username = process.env.DFUSERNAME || 'InsertYourUsernameHere';
  password = process.env.DFPASSWORD || 'InsertYourPasswordHere';
  example = "test";
}

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
  plugins: [
    new ESLintPlugin(),
    new MiniCssExtractPlugin({
      filename: cssFileName
    }),
    new webpack.ProvidePlugin({
      _: "lodash"
    }),
    ...[
      'simple',
      'advanced',
      'markers-simple',
      'markers-advanced',
      'markers-add-remove',
      'double',
      'tooltip',
      'datafordeler',
      'overlay'
    ].map((event) => {
      return new HtmlWebpackPlugin({
        "inject"   : "head",
        "scriptLoading": "blocking",
        "template":  __dirname + "/src/examples/template.ejs",
        "templateParameters": {
          "title": `${event}`,
          "token": token,
          "username": username,
          "password": password,
          "version": version,
          "sri": min ? getSRI(min, getSRI.SHA384, true) : ''
        },
        "filename" : __dirname + `/` + example + `/${event}.html`
      })
    }),
    new webpack.BannerPlugin({
      banner: 'okapi. See https://okapi.dataforsyningen.dk \n' +
        'License: https://github.com/dataforsyningen/okapi/blob/master/LICENSE \n' +
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
        test: /\.png/,
        type: 'asset/inline'
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
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ],
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
    modules: ['node_modules', path.resolve('./node_modules'), path.resolve('./src')],
    extensions: ['.json', '.js']
  }
};

module.exports = config;
