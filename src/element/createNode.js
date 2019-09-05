'use strict'

import create from './create'
import cacheNode from './cacheNode'

import { exec, registry } from './params'
import * as on from '../event/on'

var createNode = (element, params) => {
  // create and assign a node
  if (!element.node) {
    var node = cacheNode(element)
    element.node = node
    node.ref = element
  }

  var runThrough = params || element

  // redefine undefined params if they are under define :)
  if (element.define && typeof element.define === 'object') {
    for (const param in element.define) {
      if (!element[param]) element[param] = element.define[param](void 0, element)
    }
  }

  // Apply element parameters
  if (element.tag !== 'string' || element.tag !== 'fragment') {
    for (const param in runThrough) {
      var execParam = exec(element[param], element)

      var hasDefine = element.define && element.define[param]
      var registeredParam = registry[param]
      console.log(param, registeredParam)

      if (hasDefine) {
        // Check if it's under `define`
        element.data[param] = execParam
        element[param] = element.define[param](execParam, element)
      } else if (param === 'on') {
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
      } else if (element[param]) {
        // Create element
        console.log(execParam, element, param)
        create(execParam, element, param)
      }
    }
  }

  // node.dataset.key = key
  return element
}

export default createNode
