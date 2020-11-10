'use strict'

export const isObject = arg => {
  return typeof arg === 'object' && arg.constructor === Object
}

export const isFunction = arg => typeof arg === 'function'

export const isArray = arg => Array.isArray(arg)

export const isObjectLike = arg => {
  if (arg === null) return false
  // if (isArray(arg)) return false
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
    if (e === 'parent') continue
    if (elementProp === undefined) {
      element[e] = protoProp
    } else if (isObject(elementProp) && isObject(protoProp)) {
      deepMerge(elementProp, protoProp)
    }
  }
  return element
}

export const clone = obj => {
  const o = {}
  for (const prop in obj) {
    if (prop === 'node') continue
    o[prop] = obj[prop]
  }
  return o
}

/**
 * Deep cloning of object
 */
export const deepClone = (obj) => {
  const o = {}
  for (const prop in obj) {
    if (prop === 'parent') continue
    if (prop === 'node') continue
    const objProp = obj[prop]
    if (isObject(objProp)) o[prop] = deepClone(objProp)
    else o[prop] = objProp
  }
  return o
}

/**
 * Overwrites object properties with another
 */
export const overwrite = (obj, params) => {
  for (const e in params) {
    if (e === 'node') continue
    const objProp = obj[e]
    const paramsProp = params[e]
    if (isObjectLike(objProp) && isObjectLike(paramsProp)) {
      overwrite(objProp, paramsProp)
    } else if (paramsProp !== undefined) {
      obj[e] = paramsProp
    }
  }
  return obj
}

/**
 * Overwrites object properties with another
 */
export const mergeIfExisted = (a, b) => {
  if (isObjectLike(a) && isObjectLike(b)) return deepMerge(a, b)
  return a || b
}

/**
 * Merges array prototypes
 */
export const mergeArray = arr => {
  return arr.reduce((a, c) => deepMerge(a, deepClone(c)), {})
}

/**
 * Merges array prototypes
 */
export const mergeAndCloneIfArray = obj => isArray(obj) ? mergeArray(obj) : deepClone(obj)

/**
 * Overwrites object properties with another
 */
export const flattenRecursive = (param, prop, stack = []) => {
  const objectized = mergeAndCloneIfArray(param)
  stack.push(objectized)

  const protoOfProto = objectized[prop]
  if (protoOfProto) flattenRecursive(protoOfProto, prop, stack)

  delete objectized[prop]

  return stack
}
