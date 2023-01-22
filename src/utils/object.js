'use strict'

import { global } from '@domql/globals'
import nodes from '../element/nodes'

export const memoize = (fn) => {
  const cache = {}
  return (...args) => {
    const n = args[0]
    if (n in cache) {
      return cache[n]
    } else {
      const result = fn(n)
      cache[n] = result
      return result
    }
  }
}

export const debounce = (element, func, timeout = 300) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => { func.apply(element, args) }, timeout)
  }
}

export const isTagRegistered = arg => nodes.body.indexOf(arg)

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
    typeof global.Node === 'object'
      ? obj instanceof global.Node
      : obj && typeof obj === 'object' && typeof obj.nodeType === 'number' && typeof obj.nodeName === 'string'
  )
}

export const isHtmlElement = obj => {
  return (
    typeof global.HTMLElement === 'object'
      ? obj instanceof global.HTMLElement // DOM2
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

export const exec = (param, element, state) => {
  if (isFunction(param)) return param(element, state || element.state)
  return param
}

export const map = (obj, extention, element) => {
  for (const e in extention) {
    obj[e] = exec(extention[e], element)
  }
}

export const merge = (element, obj) => {
  for (const e in obj) {
    const elementProp = element[e]
    const objProp = obj[e]
    if (elementProp === undefined) {
      element[e] = objProp
    }
  }
  return element
}

export const deepMerge = (element, extend) => {
  // console.groupCollapsed('deepMerge:')
  for (const e in extend) {
    const elementProp = element[e]
    const extendProp = extend[e]
    // const cachedProps = cache.props
    if (e === 'parent' || e === 'props' || e === 'state') continue
    if (elementProp === undefined) {
      element[e] = extendProp
    } else if (isObjectLike(elementProp) && isObject(extendProp)) {
      deepMerge(elementProp, extendProp)
    }
  }
  // console.groupEnd('deepMerge:')
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
export const deepClone = (obj, excluding = ['parent', 'node', '__element', 'state', '__root', 'context']) => {
  const o = {}
  for (const prop in obj) {
    if (excluding.indexOf(prop) > -1) continue
    let objProp = obj[prop]
    if (prop === 'extend' && isArray(objProp)) {
      objProp = mergeArray(objProp)
    }
    if (isObjectLike(objProp)) {
      o[prop] = deepClone(objProp)
    } else o[prop] = objProp
  }
  return o
}

/**
 * Overwrites object properties with another
 */
export const isEqualDeep = (param, element) => {
  if (param === element) return true
  if (!param || !element) return false
  for (const prop in param) {
    const paramProp = param[prop]
    const elementProp = element[prop]
    if (isObjectLike(paramProp)) {
      const isEqual = isEqualDeep(paramProp, elementProp)
      if (!isEqual) return false
    } else {
      const isEqual = paramProp === elementProp
      if (!isEqual) return false
    }
  }
  return true
}

/**
 * Overwrites object properties with another
 */
export const overwrite = (element, params, options) => {
  const changes = {}

  for (const e in params) {
    if (e === 'props' || e === 'state') continue

    const elementProp = element[e]
    const paramsProp = params[e]

    if (paramsProp !== undefined) {
      element.__cached[e] = changes[e] = elementProp
      element[e] = paramsProp
    }

    if (options.cleanExec) delete element.__exec[e]
  }

  return changes
}

/**
 * Overwrites DEEPly object properties with another
 */
export const overwriteDeep = (obj, params, excluding = ['node', '__root']) => {
  for (const e in params) {
    if (excluding.indexOf(e) > -1) continue
    const objProp = obj[e]
    const paramsProp = params[e]
    if (isObjectLike(objProp) && isObjectLike(paramsProp)) {
      overwriteDeep(objProp, paramsProp)
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
 * Merges array extends
 */
export const mergeArray = (arr) => {
  return arr.reduce((a, c) => deepMerge(a, deepClone(c)), {})
}

/**
 * Merges array extends
 */
export const mergeAndCloneIfArray = obj => {
  return isArray(obj) ? mergeArray(obj) : deepClone(obj)
}

/**
 * Overwrites object properties with another
 */
export const flattenRecursive = (param, prop, stack = []) => {
  const objectized = mergeAndCloneIfArray(param)
  stack.push(objectized)

  const extendOfExtend = objectized[prop]
  if (extendOfExtend) flattenRecursive(extendOfExtend, prop, stack)

  delete objectized[prop]

  return stack
}
