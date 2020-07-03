'use strict'

export const isObject = arg => {
  if (arg === null) return false
  return (typeof arg === 'function') || (typeof arg === 'object')
}

export const ifFunction = arg => typeof arg === 'function'

export const isArray = arg => Array.isArray(arg)

export const exec = (param, element) => {
  if (param !== undefined) {
    if (typeof param === 'function') { return param(element) }
    return param
  }
}

export const map = (obj, extention, element) => {
  for (const e in extention) {
    obj[e] = exec(extention[e], element)
  }
}

export const deepMerge = (obj, original) => {
  for (const e in original) {
    const objProp = obj[e]
    const originalProp = original[e]
    if (objProp === undefined) {
      obj[e] = originalProp
    } else if (isObject(objProp)) {
      deepMerge(objProp, originalProp)
    }
  }
  return obj
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
