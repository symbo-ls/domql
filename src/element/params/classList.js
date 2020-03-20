'use strict'

import exec from './exec'
import { isObject } from '../../utils'

var classify = (obj, element) => {
  var className = ''
  for (var item in obj) {
    var param = obj[item]
    if (typeof param === 'boolean' && param) className += ` ${item}`
    else if (typeof param === 'string') className += ` ${param}`
    else if (typeof param === 'function') {
      className += ` ${exec(param, element)}`
    }
  }
  return className
}

var classList = (params, element) => {
  var { node } = element
  if (params === true) params = element.class = element.key
  if (isObject(params)) params = classify(params, element)
  var trimmed = params.replace(/\s+/g, ' ').trim()
  node.classList = trimmed
}

export default classList
