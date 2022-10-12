'use strict'

import { HTML_TAGS } from '@domql/tags'

export const isValidHtmlTag = arg => HTML_TAGS.body.indexOf(arg)

export const isObject = arg => {
  if (arg === null) return false
  return (typeof arg === 'object') && (arg.constructor === Object)
}

export const isString = arg => typeof arg === 'string'

export const isNumber = arg => typeof arg === 'number'

export const isFunction = arg => typeof arg === 'function'

export const isArray = arg => Array.isArray(arg)

export const isObjectLike = arg => {
  if (arg === null) return false
  // if (isArray(arg)) return false
  return (typeof arg === 'object')
}

export const isNode = obj => {
  return (
    typeof window.Node === 'object'
      ? obj instanceof window.Node
      : obj && typeof obj === 'object' && typeof obj.nodeType === 'number' && typeof obj.nodeName === 'string'
  )
}

export const isHtmlElement = obj => {
  return (
    typeof window.HTMLElement === 'object'
      ? obj instanceof window.HTMLElement // DOM2
      : obj && typeof obj === 'object' && obj !== null && obj.nodeType === 1 && typeof obj.nodeName === 'string'
  )
}

export const isDefined = arg => {
  return isObject(arg) ||
    isObjectLike(arg) ||
    isString(arg) ||
    isNumber(arg) ||
    isFunction(arg) ||
    isArray(arg) ||
    isObjectLike(arg)
}

export const TYPES = {
  array: isArray,
  object: isObject,
  string: isString,
  number: isNumber,
  function: isFunction,
  objectLike: isObjectLike,
  node: isNode,
  htmlElement: isHtmlElement,
  defined: isDefined
}

export const is = (arg) => {
  return (...args) => {
    return args.map(val => TYPES[val](arg)).filter(v => v).length > 0
  }
}

export const isNot = (arg) => {
  return (...args) => {
    return args.map(val => TYPES[val](arg)).filter(v => v).length === 0
  }
}
