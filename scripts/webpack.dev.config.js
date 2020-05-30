const path = require('path')
module.exports = {
  output: {
    libraryTarget: 'umd',
    libraryExport: 'default',
    library: 'XRVPlayer',
    filename: 'xrvplaer.js',
    path: path.join(__dirname, '../example/lib')
    // publicPath: 'http://127.0.0.1:8000/public/'
  },
  devtool: 'cheap-module-eval-source-map'
}
