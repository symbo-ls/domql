'use strict'

import create from './create'
import cacheNode from './cache'
import * as on from '../event/on'

import { exec, isFunction, isObject } from '../utils'
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

export const createNode = (element, options) => {
  // create and assign a node
  let { node, tag, context } = element

  let isNewNode

  if (!node) {
    isNewNode = true

    if (element.__ifFalsy) return element

    if (tag === 'shadow') {
      node = element.node = element.parent.node.attachShadow({ mode: 'open' })
    } else node = element.node = cacheNode(element)

    // run `on.attachNode`
    if (element.on && isFunction(element.on.attachNode)) {
      on.attachNode(element.on.attachNode, element, element.state)
    }
  }

  // node.dataset // .key = element.key

  if (ENV === 'test' || ENV === 'development') {
    node.ref = element
    if (isFunction(node.setAttribute)) node.setAttribute('key', element.key)
  }

  if (element.__ifFalsy) return element

  // iterate through all given params
  if (element.tag !== 'string' || element.tag !== 'fragment') {
    // iterate through define
    throughInitialDefine(element)

    // iterate through exec
    throughInitialExec(element)

    // apply events
    if (isNewNode && isObject(element.on)) applyEvents(element)

    for (const param in element) {
      const prop = element[param]

      if (isMethod(param) || isObject(registry[param]) || prop === undefined) continue

      const DOMQLProperty = registry[param]
      const DOMQLPropertyFromContext = context && context.registry && context.registry[param]
      const isGlobalTransformer = DOMQLPropertyFromContext || DOMQLProperty

      const hasDefine = element.define && element.define[param]
      const hasContextDefine = context && context.define && context.define[param]

      // Check if param is in our method registry
      if (isGlobalTransformer && !hasContextDefine) {
        if (isFunction(isGlobalTransformer)) isGlobalTransformer(prop, element, node, options)
      } else if (element[param] && !hasDefine && !hasContextDefine) {
        // Create element
        create(exec(prop, element), element, param, options)
      }
    }
  }

  // node.dataset.key = key
  return element
}

export default createNode
