const path = require('path')
// const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

// const webpack = require('webpack')
const config = {
  // watch: true,
  // watchOptions: {
  //   poll: 1000, // 监测修改的时间(ms)
  //   aggregateTimeout: 500, // 防止重复按键，500毫米内算按键一次
  //   ignored: ['../node_modules/', '../dist/'] // 不监测
  // },
  resolve: {
    // 配置别名，在项目中可缩减引用路径
    alias: {
      '@': path.resolve('src')
    }
  },
  entry: {
    app: path.join(__dirname, '../src/index.js')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        exclude: /node_modules|utils/,
        enforce: 'pre' // 预处理，之前先做校验
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        // exclude: /node_modules/
        exclude: /node_modules\/(?!(@tulies\/event-middleware)\/).*/

      },
      // {
      //   test: /\.tsx$/,
      //   loader: 'ts-loader',
      //   exclude: /node_modules/
      // }
      {
        test: /\.(gif|jpg|jpeg|png|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              esModule: false, // 这里设置为false
              limit: 8192,
              name: 'resources/[path][name].[hash:8].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf)\??.*$/,
        use: [
          {
            loader: 'url-loader'
            // options: {
            //   limit: 1024,
            //   name: 'resources/[path][name].[hash:8].[ext]'
            // }
          }
        ]
      },
      {
        test: /\.(scss|sass|css)?$/,
        use: [
          // 'vue-style-loader',
          // 'style-loader',
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true
            }
          },
          'sass-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'xrvplaer.css'
    })
    // new webpack.HotModuleReplacementPlugin(),
  ]
}
// config = merge(config, devConfig)
module.exports = config
