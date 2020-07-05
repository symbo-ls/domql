'use strict'

export const isObject = arg => {
  return typeof arg === 'object' && arg.constructor === Object
}

export const isObjectLike = arg => {
  if (arg === null) return false
  return (typeof arg === 'function') || (typeof arg === 'object')
}

export const isFunction = arg => typeof arg === 'function'

export const isArray = arg => Array.isArray(arg)

export const exec = (param, element) => {
  if (isFunction(param)) return param(element)
  return param
}

export const map = (obj, extention, element) => {
  for (const e in extention) {
    obj[e] = exec(extention[e], element)
  }
}

export const deepMerge = (element, proto) => {
  for (const e in proto) {
    const elementProp = element[e]
    const protoProp = proto[e]
    if (elementProp === undefined) {
      element[e] = protoProp
    } else if (isObject(elementProp)) {
      deepMerge(elementProp, protoProp)
    }
  }
  return element
}

export const overwrite = (obj, params) => {
  for (const e in params) {
    const objProp = obj[e]
    const paramsProp = params[e]
    if (isObject(objProp) && isObject(paramsProp)) {
      overwrite(objProp, paramsProp)
    } else obj[e] = paramsProp
  }
  return obj
}

export const set = (code) => {
  var hasProperty = Object.prototype.hasOwnProperty.call(this.list, code)
  if (hasProperty) {
    this.current = code
  }
}
