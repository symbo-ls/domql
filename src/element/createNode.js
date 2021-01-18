'use strict'

import create from './create'
import cacheNode from './cache'

import { exec, isFunction, isObject } from '../utils'
import {
  applyDefined,
  throughDefine,
  throughTransform,
  applyEvents
} from './iterate'
import { registry } from './params'
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
    node = cacheNode(element)
    element.node = node
  }

  if (ENV === 'test' || ENV === 'development') node.ref = element

  // run iteration for params which are under define
  if (element.define && isObject(element.define)) applyDefined(element)

  // iterate through all given params
  if (element.tag !== 'string' || element.tag !== 'fragment') {
    // iterate through transform
    if (isObject(element.transform)) throughTransform(element)

    // iterate through define
    if (isObject(element.define)) throughDefine(element)

    // apply events
    if (isNewNode && isObject(element.on)) applyEvents(element)

    for (const param in element) {
      const prop = element[param]

      if (isMethod(param) || isObject(registry[param]) || prop === undefined) continue

      if (isFunction(prop)) {
        element.__exec[param] = prop
        element[param] = exec(prop, element)
      }

      const hasDefined = element.define && element.define[param]
      const ourParam = registry[param]

      if (ourParam) { // Check if param is in our method registry
        if (isFunction(ourParam)) ourParam(prop, element, node)
        if (param === 'style') registry.class(element.class, element, node)
      } else if (element[param] && !hasDefined) {
        create(prop, element, param) // Create element
      }
    }
  }

  // node.dataset.key = key
  return element
}

export default createNode
