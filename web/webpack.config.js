// web/webpack.config.js

const path = require('path')
const webpack = require('webpack')
const dotenv = require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
})

const appDirectory = path.resolve(__dirname, '../')

const babelLoaderConfiguration = {
  test: /\.js$|\.jsx$|\.ts$|\.tsx$/,
  // Add every directory that needs to be compiled by Babel during the build.
  include: [
    path.resolve(appDirectory, 'index.web.js'),
    path.resolve(appDirectory, 'src'),
    // modules that need to be transpiled
    //path.resolve(appDirectory, 'node_modules/@react-native-segmented-control/segmented-control'),
    //path.resolve(appDirectory, 'node_modules/react-native-picker-select'),
    path.resolve(appDirectory, 'node_modules/@react-native-picker'),
    path.resolve(appDirectory, 'node_modules/react-native-web'),
    path.resolve(appDirectory, 'node_modules/react-native-confirmation-code-field'),
  ],
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      // The 'metro-react-native-babel-preset' preset is recommended to match React Native's packager
      // presets: ['module:metro-react-native-babel-preset'],
      presets: ['module:metro-react-native-babel-preset'],
      // Re-write paths to import only the modules needed by the app
      plugins: [
        'react-native-web',
        [
          '@babel/plugin-proposal-decorators',
          {
            legacy: true,
          },
        ],
      ],
    },
  },
}

// This is needed for webpack to import static images in JavaScript files.
const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png|svg)$/,
  use: {
    loader: 'url-loader',
    options: {
      name: '[name].[ext]',
      esModule: false,
    },
  },
}

module.exports = {
  mode: 'development',
  entry: [
    // path.resolve(appDirectory, 'polyfills-web.js'),
    path.resolve(appDirectory, 'index.web.js'),
  ],

  // configures where the build ends up
  output: {
    filename: 'bundle.web.js',
    path: path.resolve(appDirectory, 'web/dist'),
  },

  module: {
    rules: [babelLoaderConfiguration, imageLoaderConfiguration],
  },

  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      // 'react-native-maps': 'react-native-web-maps',
      stream: 'readable-stream',
      crypto: 'react-native-crypto-js',
      'react-native-splash-screen': path.resolve(__dirname, './react-native-splash-screen-web'),
      'react-native-config': path.resolve(__dirname, './react-native-config-web'),
    },
    extensions: ['.web.js', '.js', '.web.jsx', '.jsx', '.web.ts', '.ts', '.web.tsx', '.tsx'],
  },

  devServer: {
    port: 3000,
    hot: false,
    historyApiFallback: {
      index: 'web/index.html',
    },
    static: {
      directory: path.join(__dirname),
    },
    devMiddleware: {
      writeToDisk: true,
    },
  },

  plugins: [
    new webpack.ProvidePlugin({
      Buffer: require.resolve('buffer'),
      process: require.resolve('process'),
    }),
    new webpack.DefinePlugin({
      EnvConfig: JSON.stringify(dotenv.parsed),
      __DEV__: true,
    }),
  ],
}
