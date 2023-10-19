'use strict'

import { isHtmlElement, isNode } from './node'

export const isObject = arg => {
  if (arg === null) return false
  return (typeof arg === 'object') && (arg.constructor === Object)
}

export const isString = arg => typeof arg === 'string'

export const isNumber = arg => typeof arg === 'number'

export const isFunction = arg => typeof arg === 'function'

export const isBoolean = arg => arg === true || arg === false

export const isNull = arg => arg === null

export const isArray = arg => Array.isArray(arg)

export const isDate = d => d instanceof Date

export const isObjectLike = arg => {
  if (arg === null) return false
  // if (isArray(arg)) return false
  return (typeof arg === 'object')
}

export const isDefined = arg => {
  return isObject(arg) ||
    isObjectLike(arg) ||
    isString(arg) ||
    isNumber(arg) ||
    isFunction(arg) ||
    isArray(arg) ||
    isObjectLike(arg) ||
    isBoolean(arg) ||
    isDate(arg) ||
    isNull(arg)
}

export const isUndefined = arg => {
  return arg === undefined
}

export const TYPES = {
  boolean: isBoolean,
  array: isArray,
  object: isObject,
  string: isString,
  date: isDate,
  number: isNumber,
  null: isNull,
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
