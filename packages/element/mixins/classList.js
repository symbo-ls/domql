'use strict'

import { exec, isObject, isString } from '@domql/utils'

export const assignKeyAsClassname = element => {
  const { key } = element
  if (element.classlist === true) element.classlist = key
  else if (
    !element.classlist &&
    typeof key === 'string' &&
    key.charAt(0) === '_' &&
    key.charAt(1) !== '_'
  ) {
    element.classlist = key.slice(1)
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

export const classList = (params, element) => {
  if (!params) return
  const { key } = element
  if (params === true) params = element.classlist = { key }
  if (isString(params)) params = element.classlist = { default: params }
  if (isObject(params)) params = classify(params, element)
  // TODO: fails on string
  const className = params.replace(/\s+/g, ' ').trim()
  return className
}

// LEGACY (still needed in old domql)
export const applyClassListOnNode = (params, element, node) => {
  const className = classList(params, element)
  node.classList = className
  return className
}

export function applyClasslist (params, element, node) {
  applyClassListOnNode(params, element, node)
}

export default applyClasslist
