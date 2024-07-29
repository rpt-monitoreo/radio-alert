const { composePlugins, withNx } = require('@nx/webpack');
const webpack = require('webpack');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

module.exports = composePlugins(withNx(), config => {
  // Add DefinePlugin to the plugins array
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    })
  );

  // Return the updated config
  return config;
});
