import 'reflect-metadata'
import 'react-native-gesture-handler'
import 'react-native-get-random-values'

import { AppRegistry } from 'react-native'
import { NeobankApp } from './src'
import { name as appName } from './app.json'

AppRegistry.registerComponent(appName, () => NeobankApp)
