import 'setimmediate'
// import 'reflect-metadata'

import { AppRegistry } from 'react-native'
import { NeobankApp } from './src'

import { name as appName } from './app.json'

AppRegistry.registerComponent(appName, () => NeobankApp)

AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root'),
})
