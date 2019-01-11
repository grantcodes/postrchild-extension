const webpack = require('webpack')
const path = require('path')
const webExt = require('web-ext').default
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WriteFilePlugin = require('write-file-webpack-plugin')
const devMode = process.env.NODE_ENV === 'development'

// load the secrets
var alias = {}

var fileExtensions = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'eot',
  'otf',
  'svg',
  'ttf',
  'woff',
  'woff2',
]

module.exports = {
  entry: {
    popup: path.join(__dirname, 'src', 'js', 'popup.js'),
    onpage: path.join(__dirname, 'src', 'js', 'onpage.js'),
    options: path.join(__dirname, 'src', 'js', 'options.js'),
    background: path.join(__dirname, 'src', 'js', 'background.js'),
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].bundle.js',
  },
  mode: devMode ? 'development' : 'production',
  devtool: devMode ? 'cheap-module-eval-source-map' : 'source-map',
  optimization: {
    minimize: false, // Minimization breaks utf-8 encoding because of something inside slate-react
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      },
      {
        test: new RegExp('.(' + fileExtensions.join('|') + ')$'),
        loader: 'file-loader?name=[name].[ext]',
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    alias: alias,
    extensions: fileExtensions
      .map(extension => '.' + extension)
      .concat(['.jsx', '.js', '.css']),
  },
  devServer: {
    hot: true,
    contentBase: path.join(__dirname, 'build'),
    headers: { 'Access-Control-Allow-Origin': '*' },
    port: 3000,
    disableHostCheck: true,
  },
  plugins: [
    // clean the build folder
    new CleanWebpackPlugin(['build']),
    new CopyWebpackPlugin([
      // Copy these files to comply with some extension store rules
      'README.md',
      'package.json',
      'package-lock.json',
      {
        from: 'src/manifest.json',
        transform: function(content, path) {
          // generates the manifest file using the package.json informations
          return Buffer.from(
            JSON.stringify({
              description: process.env.npm_package_description,
              version: process.env.npm_package_version,
              ...JSON.parse(content.toString()),
            })
          )
        },
      },
    ]),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'template.html'),
      filename: 'popup.html',
      chunks: ['popup'],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'template.html'),
      filename: 'options.html',
      chunks: ['options'],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'template.html'),
      filename: 'background.html',
      chunks: ['background'],
    }),
    new WriteFilePlugin(),
    new webpack.HotModuleReplacementPlugin(),
    // Plugin to bundle the extension
    {
      apply: compiler => {
        if (!devMode) {
          compiler.hooks.afterEmit.tap('AfterEmitPlugin', () => {
            webExt.cmd.build({
              sourceDir: path.join(__dirname, 'build'),
              artifactsDir: path.join(__dirname, 'build'),
            })
          })
        }
      },
    },
  ],
}
