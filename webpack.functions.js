const nodeExternals = require('webpack-node-externals')

// @see https://github.com/netlify/netlify-lambda#webpack-configuration
module.exports = {
  externals: [nodeExternals()],
}
