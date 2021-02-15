/* eslint-env node */

const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const SriPlugin = require('webpack-subresource-integrity')
const ESLintPlugin = require('eslint-webpack-plugin')

require('dotenv').config()

const OKAPI_ENV = process.env.OKAPI_ENV || 'production'
const shouldMinify = !!process.env.OKAPI_MINIFY
const shouldReportSize = process.env.OKAPI_SIZE_REPORT === 'true'

if (['development', 'production'].indexOf(OKAPI_ENV) < 0) {
  throw new Error('unknown OKAPI_ENV ' + OKAPI_ENV)
}

const isDevMode = OKAPI_ENV === 'development'
const libraryName = 'okapi'
const version = process.env.npm_package_version
const token = process.env.TOKEN || 'InsertYourTokenHere'
const username = process.env.DFUSERNAME || 'InsertYourUsernameHere'
const password = process.env.DFPASSWORD || 'InsertYourPasswordHere'
const example = isDevMode ? 'test' : 'examples'

const plugins = [
  new webpack.ProvidePlugin({
    _: 'lodash'
  }),
  ...[
    'simple',
    'advanced',
    'markers-simple',
    'markers-advanced',
    'double',
    'tooltip',
    'datafordeler',
    'overlay'
  ].map((event) => {
    return new HtmlWebpackPlugin({
      'inject': 'head',
      'template': path.resolve(__dirname, 'src/examples/template.ejs'),
      'templateParameters': {
        'title': `${event}`,
        'token': token,
        'username': username,
        'password': password,
        'version': version,
        'sri': 'sri'
      },
      'filename': path.join(__dirname, `${example}/${event}.html`)
    })
  }),
  new SriPlugin({
    hashFuncNames: ['sha256', 'sha384'],
    enabled: process.env.OKAPI_ENV === 'production'
  }),
  new MiniCssExtractPlugin({
    // Options similar to the same options in webpackOptions.output
    // both options are optional
    filename: shouldMinify ? `${libraryName}-${version}.min.css` : `${libraryName}-${version}.css`
  }),
  new CopyPlugin({
    patterns: [
      {
        from: path.resolve(__dirname, 'external-libraries'),
        to: path.resolve(__dirname, `${example}`)
      }
    ]
  }),
  new webpack.BannerPlugin({
    banner: 'okapi. See https://okapi.Kortforsyningen.dk \n' +
      'License: https://github.com/Kortforsyningen/okapi/blob/master/LICENSE \n' +
      'Version: v' + version
  }),
  new ESLintPlugin(),
  new webpack.DefinePlugin({
    __DEV__: isDevMode,
    __LOGGER_LEVEL__: isDevMode ? '"INFO"' : '"DEBUG"',
    'process.env': {
      NODE_ENV: JSON.stringify(isDevMode ? 'development' : 'production')
    }
  })
]

if (shouldReportSize) {
  plugins.push(new BundleAnalyzerPlugin())
}

const config = {
  mode: isDevMode ? 'development' : 'production',
  entry: path.resolve(__dirname, 'src/Index.js'),
  devtool: 'inline-source-map',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: shouldMinify ? `${libraryName}-${version}.min.js` : `${libraryName}-${version}.js`,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true,
    globalObject: "typeof self !== 'undefined' ? self : this",
    crossOriginLoading: 'anonymous'
  },
  optimization: {
    minimize: shouldMinify,
    minimizer: shouldMinify ? [
      new TerserPlugin({
        parallel: true,
        extractComments: false
      }),
      new OptimizeCSSAssetsPlugin({})
    ] : []
  },
  performance: {
    maxEntrypointSize: shouldMinify ? 450000 : 2000000,
    maxAssetSize: shouldMinify ? 450000 : 2000000
  },
  plugins: plugins,
  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: [
                ['@babel/env', { loose: true, modules: false}]
              ],
              plugins: [['@babel/plugin-transform-runtime']]
            }
          }
        ]
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
    modules: ['node_modules'],
    extensions: ['.json', '.js']
  }
}

module.exports = config
