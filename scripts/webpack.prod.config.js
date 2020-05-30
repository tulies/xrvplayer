const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  output: {
    libraryTarget: 'umd',
    libraryExport: 'default',
    library: 'XRVPlayer',
    filename: 'xrvplaer.js',
    path: path.join(__dirname, '../dist')
    // publicPath: 'http://127.0.0.1:8000/public/'
  },
  plugins: [
    // // 删除文件 保留新文件
    // new CleanWebpackPlugin({
    //   dry: false,
    //   verbose: true
    // })
    new CleanWebpackPlugin()
  ]
}
