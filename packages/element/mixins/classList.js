'use strict'

import { exec, isObject, isString } from '@domql/utils'

export const assignKeyAsClassname = (element) => {
  const { key } = element
  if (element.class === true) element.class = key
  else if (
    !element.class &&
    typeof key === 'string' &&
    key.charAt(0) === '_' &&
    key.charAt(1) !== '_'
  ) {
    element.class = key.slice(1)
  }
}

// stringifies class object
export const classify = (obj, element, opts) => {
  let className = ''
  for (const item in obj) {
    const param = obj[item]
    if (typeof param === 'boolean' && param) className += ` ${item}`
    else if (typeof param === 'string') className += ` ${param}`
    else if (typeof param === 'function') {
      className += ` ${exec(param, element, element.state, element.context, opts)}`
    }
  }
  return className
}

export const classList = (params, element, opts) => {
  if (!params) return
  const { key } = element
  if (params === true) params = element.class = { key }
  if (isString(params)) params = element.class = { default: params }
  if (isObject(params)) params = classify(params, element, opts)
  // TODO: fails on string
  const className = params.replace(/\s+/g, ' ').trim()
  if (element.ref) element.ref.class = className // TODO: this check is NOT needed in new DOMQL
  return className
}

// LEGACY (still needed in old domql)
export const applyClassListOnNode = (params, element, node, opts) => {
  const className = classList(params, element, opts)
  node.classList = className
  return className
}

export function applyClasslist(params, element, node, opts) {
  applyClassListOnNode(params, element, node, opts)
}

export default applyClasslist
