'use strict'

import create from './create'
import cacheNode from './cache'

import { isFunction, isObject } from '../utils'
import {
  throughInitialDefine,
  throughInitialExec,
  applyEvents
} from './iterate'
import { registry } from './mixins'
import { isMethod } from './methods'
// import { defineSetter } from './methods'

const ENV = process.env.NODE_ENV

// const defineSetter = (element, key) => Object.defineProperty(element, key, {
//   get: function () {
//     console.log('GET', key)
//     return element.__data[key]
//   },
//   set: function (new_value) {
//     console.log('SET', key, new_value)
//     element.__data[key] = new_value
//     element.__data['modified'] = (new Date()).getTime()
//   }
// })

const createNode = (element) => {
  // create and assign a node
  let { node } = element
  let isNewNode
  if (!node) {
    isNewNode = true
    node = element.node = cacheNode(element)
  }

  // node.dataset // .key = element.key

  if (ENV === 'test' || ENV === 'development') node.ref = element

  // iterate through all given params
  if (element.tag !== 'string' || element.tag !== 'fragment') {
    // iterate through define
    if (isObject(element.define)) throughInitialDefine(element)

    // iterate through exec
    throughInitialExec(element)

    // apply events
    if (isNewNode && isObject(element.on)) applyEvents(element)

    for (const param in element) {
      const prop = element[param]

      if (isMethod(param) || isObject(registry[param]) || prop === undefined) continue

      const hasDefined = element.define && element.define[param]
      const ourParam = registry[param]

      if (ourParam) { // Check if param is in our method registry
        if (isFunction(ourParam)) ourParam(prop, element, node)
      } else if (element[param] && !hasDefined) {
        create(prop, element, param) // Create element
      }
    }
  }

  // node.dataset.key = key
  return element
}

export default createNode
