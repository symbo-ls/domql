'use strict'

import { exec } from '../../utils'

// stringifies class object
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
  var { node, key } = element
  if (typeof params === 'string') element.class = { default: params }
  if (params === true) params = element.class = { key }
  var className = classify(element.class, element)
  var trimmed = className.replace(/\s+/g, ' ').trim()
  node.classList = trimmed
}

export default classList
