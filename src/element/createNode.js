'use strict'

import create from './create'
import cacheNode from './cache'

import { exec, isObject } from '../utils'
import {
  applyDefined,
  throughDefine,
  throughTransform,
  applyEvents
} from './iterate'
import { registry } from './params'

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

  // run iteration for params which are under define
  if (element.define && isObject(element.define)) applyDefined(element)

  // iterate through all given  params
  if (element.tag !== 'string' || element.tag !== 'fragment') {
    // iterate through define
    if (isObject(element.define)) throughDefine(element)

    // iterate through transform
    if (isObject(element.transform)) throughTransform(element)

    // apply events
    if (isNewNode && isObject(element.on)) applyEvents(element)

    for (const param in element) {
      if (
        (param === 'set' || param === 'update' || param === 'remove') || !element[param] === undefined
      ) return

      var execParam = exec(element[param], element)

      var hasDefined = element.define && element.define[param]
      var registeredParam = registry[param]

      if (registeredParam) {
        // Check if it's registered param
        if (typeof registeredParam === 'function') {
          registeredParam(execParam, element, node)
        }

        if (param === 'style') registry['class'](element['class'], element, node)
      } else if (element[param] && !hasDefined) {
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
