import 'core-js/modules/es.array.from.js'
import 'core-js/modules/es.promise.js'
import 'core-js/modules/es.array.includes.js'
import 'core-js/modules/es.array.fill.js'
import 'whatwg-fetch'
import './utils/polyfill'
import { registerBlindDecodeFallback } from './core/blind-decode'
import { softwareBlindDecodeFallback } from './compat/ie/blind-decode'

registerBlindDecodeFallback(softwareBlindDecodeFallback)

export * from './index'
