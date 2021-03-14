'use strict'

import { exec, isObject, isString } from '../../utils'

export const assignClass = (element) => {
  const { key } = element
  if (element.class === true) element.class = key
  else if (!element.class && typeof key === 'string' && key.charAt(0) === '_' && key.charAt(1) !== '_') {
    element.class = key.slice(1)
  }
}

// stringifies class object
export const classify = (obj, element) => {
  let className = ''
  for (const item in obj) {
    const param = obj[item]
    if (typeof param === 'boolean' && param) className += ` ${item}`
    else if (typeof param === 'string') className += ` ${param}`
    else if (typeof param === 'function') {
      className += ` ${exec(param, element)}`
    }
  }
  return className
}

export default (params, element, node) => {
  if (!params) return
  const { key } = element
  if (params === true) params = element.class = { key }
  if (isString(params)) params = element.class = { default: params }
  if (isObject(params)) params = classify(params, element)
  // TODO: fails on string
  const className = params.replace(/\s+/g, ' ').trim()
  node.classList = className
  return className
}
