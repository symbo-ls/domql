'use strict'

import Evt from '../event'
import Err from '../res/error'
import create from './create'

import { exec, registry } from './params'

var createElement = (element) => {
  if (!Evt.can.render(element)) {
    return Err('HTMLInvalidTag')
  }

  // create and assign a node
  var node
  if (element.tag === 'string') node = document.createTextNode(element.text)
  else if (element.tag) {
    if (element.tag === 'svg') { node = document.createElementNS('http://www.w3.org/2000/svg', element.tag) } else node = document.createElement(element.tag)
  } else node = document.createElement('div')
  element.node = node

  // Apply element parameters
  if (element.tag !== 'string') {
    for (const param in element) {
      var execParam = exec(element[param], element)

      var registeredParam = registry[param]
      if (registeredParam) {
        if (typeof registeredParam === 'function') {
          registeredParam(execParam, element, node)
        }
      } else if (element.define && element.define[param]) {
        var cachedParam = element[`_${param}`]

        if (!cachedParam) {
          cachedParam = element[param]
          element[`_${param}`] = cachedParam
        }

        element[param] = element.define[param](
          exec(cachedParam, element),
          element
        )
      } else {
        create(element[param], element, param)
      }
    }
  }

  // node.dataset.key = key
  return element
}

export default createElement
