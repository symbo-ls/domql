'use strict'

import create from './create'
import cacheNode from './cacheNode'

import { exec, registry } from './params'
import * as on from '../event/on'
import { isObject } from '../utils'

var createNode = (element) => {
  // create and assign a node
  var { node } = element
  var isNewNode
  if (!node) {
    isNewNode = true
    node = cacheNode(element)
    element.node = node
    node.ref = element
  }

  // Initialize pre defined but not settled params
  if (element.define && isObject(element.define)) {
    for (const param in element.define) {
      if (!element[param]) element[param] = element.define[param](void 0, element)
    }
  }

  // Apply element parameters
  if (element.tag !== 'string' || element.tag !== 'fragment') {
    // apply define
    if (isObject(element.define)) {
      var { define } = element
      for (const param in define) {
        var execParam = exec(element[param], element)
        element.data[param] = execParam
        element[param] = define[param](execParam, element)
      }
    }

    // apply transform
    if (isObject(element.transform)) {
      var { transform } = element
      for (const param in transform) {
        execParam = exec(element[param], element)
        if (element.data[param]) {
          execParam = exec(element.data[param], element)
        } else {
          execParam = exec(element[param], element)
          element.data[param] = execParam
        }
        element[param] = transform[param](execParam, element)
      }
    }

    // apply events
    if (isObject(element.on)) {
      for (const param in element.on) {
        if (param === 'init' || param === 'render') break
        var appliedFunction = element.on[param]
        var registeredFunction = on[param]
        if (typeof appliedFunction === 'function' &&
          typeof registeredFunction === 'function') {
          registeredFunction(appliedFunction, element)
        } else console.error('Not such function', appliedFunction, registeredFunction)
      }
    }

    for (const param in element) {
      if ((param === 'set' || param === 'update') || !element[param] === undefined) return
      execParam = exec(element[param], element)

      var hasDefine = element.define && element.define[param]
      var registeredParam = registry[param]

      if (registeredParam) {
        // Check if it's registered param
        if (typeof registeredParam === 'function') {
          registeredParam(execParam, element, node)
        }
      } else if (element[param] && !hasDefine) {
        // Create element
        create(execParam, element, param)
        // if (isNewNode) create(execParam, element, param)
        // else createNode(execParam)
      }
    }
  }

  // node.dataset.key = key
  return element
}

export default createNode
