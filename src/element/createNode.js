'use strict'

import create from './create'
import cacheNode from './cacheNode'

import { exec, registry } from './params'
import * as on from '../event/on'

var createNode = (element) => {
  // create and assign a node
  var isNewNode
  if (!element.node) {
    isNewNode = true
    var node = cacheNode(element)
    element.node = node
    node.ref = element
  }

  // redefine undefined params if they are under define :)
  if (element.define && typeof element.define === 'object') {
    for (const param in element.define) {
      if (!element[param]) element[param] = element.define[param](void 0, element)
    }
  }

  // Apply element parameters
  if (element.tag !== 'string' || element.tag !== 'fragment') {
    if (typeof element.define === 'object') {
      var { define } = element
      for (const param in define) {
        let execParam = exec(element[param], element)
        element.data[param] = execParam
        element[param] = element.define[param](execParam, element)
      }
    }

    for (const param in element) {
      if (param === 'set' || param === 'update') return
      let execParam = exec(element[param], element)

      var hasDefine = element.define && element.define[param]
      var registeredParam = registry[param]

      if (param === 'on' && isNewNode) {
        // Apply events
        for (const param in element.on) {
          var appliedFunction = element.on[param]
          var registeredFunction = on[param]
          if (typeof appliedFunction === 'function' && typeof registeredFunction === 'function') {
            registeredFunction(appliedFunction, element)
          } else console.error('Not such function', appliedFunction, registeredFunction)
        }
      } else if (registeredParam) {
        // Check if it's registered param
        if (typeof registeredParam === 'function') {
          registeredParam(execParam, element, node)
        }
      } else if (element[param] && !hasDefine) {
        // Create element
        if (isNewNode) create(execParam, element, param)
        else createNode(execParam)
      }
    }
  }

  // node.dataset.key = key
  return element
}

export default createNode
