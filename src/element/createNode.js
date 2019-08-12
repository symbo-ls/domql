'use strict'

import create from './create'
import cacheNode from './cacheNode'

import { exec, registry } from './params'

var createNode = (element) => {
  // create and assign a node
  var node = cacheNode(element)
  element.node = node

  node.ref = element

  // Apply element parameters
  if (element.tag !== 'string' || element.tag !== 'fragment') {
    for (const param in element) {
      var execParam = exec(element[param], element)

      var registeredParam = registry[param]

      if (element.define && element.define[param]) { // Check if it's under `define`
        element.data[param] = execParam
        element[param] = element.define[param](execParam, element)
      } else if (registeredParam) { // Check if it's registered param
        if (typeof registeredParam === 'function') {
          registeredParam(execParam, element, node)
        }
      } else if (element[param]) { // create element
        create(execParam, element, param)
      }
    }
  }

  // node.dataset.key = key
  return element
}

export default createNode
