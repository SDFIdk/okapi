const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const path = require('path')

module.exports = {
  mode: 'production',
  entry: './src/Index.js',
  output: {
    filename: 'okapi.js',
    path: path.resolve(__dirname, '../dist'),
    clean: true
  },
  plugins: [
    //new MiniCssExtractPlugin()
  ], 
  module: {
    rules: [
      {
        test: /\.styl(us)?$/,
        use: [
          //MiniCssExtractPlugin.loader,
          'css-loader',
          'stylus-loader'
        ]
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/inline'
      }
    ]
  }
}
