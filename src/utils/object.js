'use strict'

export const isObject = arg => {
  return typeof arg === 'object' && arg.constructor === Object
}

export const isFunction = arg => typeof arg === 'function'

export const isArray = arg => Array.isArray(arg)

export const isObjectLike = arg => {
  if (arg === null) return false
  return (typeof arg === 'object')
}

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
    } else if (isObjectLike(elementProp) && isObjectLike(protoProp)) {
      deepMerge(elementProp, protoProp)
    }
  }
  return element
}

export const clone = (obj) => {
  var o = {}
  for (const prop in obj) {
    if (prop === 'node') continue
    o[prop] = obj[prop]
  }
  return o
}

export const deepClone = (obj) => {
  var o = {}
  for (const prop in obj) {
    if (prop === 'node') continue
    const objProp = obj[prop]
    if (typeof objProp === 'object') o[prop] = deepClone(objProp)
    else o[prop] = objProp
  }
  return o
}

export const overwrite = (obj, params) => {
  for (const e in params) {
    if (e === 'node') continue
    const objProp = obj[e]
    const paramsProp = params[e]
    if (isObjectLike(objProp) && isObjectLike(paramsProp)) {
      overwrite(objProp, paramsProp)
    } else if (paramsProp !== undefined) obj[e] = paramsProp
  }
  return obj
}
