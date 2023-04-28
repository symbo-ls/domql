'use strict'

import { exec, isObject, isString } from '@domql/utils'

export const assignClass = (element) => {
  const { key } = element
  if (element.class === true) element.class = keyw
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

export const classList = (params, element) => {
  if (!params) return
  const { key } = element // eslint-disable-line
  if (params === true) params = element.class = { key }
  if (isString(params)) params = element.class = { default: params }
  if (isObject(params)) params = classify(params, element)
  // TODO: fails on string
  const className = params.replace(/\s+/g, ' ').trim()
  element.ref.class = className
  return className
}
