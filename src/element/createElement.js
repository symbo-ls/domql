'use strict'

import Evt from '../event'
import Err from '../res/error'
import create from './create'

import { registry, style, attr, text, dataset, classList } from './params'

var createElement = (params, key) => {
  if (!Evt.can.render(params)) {
    return Err('HTMLInvalidTag')
  }

  // create and assign a node
  var node
  if (params.tag === 'string') node = document.createTextNode(params.text)
  else if (params.tag) node = document.createElement(params.tag)
  else node = document.createElement('div')
  params.node = node

  // Apply element parameters
  if (params.tag !== 'string') {
    for (let param in params) {
      var registeredParam = registry[param]
      if (registeredParam) {
        if (typeof registeredParam === 'function') {
          registeredParam(params[param], node)
        }
      }
      else {
        create(params[param], params, param)
      }
    }
  }

  // node.dataset.key = key
  return params
}

export default createElement
