'use strict'

import { isArray, isObject, isObjectLike, joinArrays } from '@domql/utils'
import { IGNORE_STATE_PARAMS } from '../element/state'
import { IGNORE_PROPS_PARAMS } from '../element/props'
import { METHODS } from '../element/methods'

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
const METHODS_EXL = joinArrays(
  ['node', 'state', 'context', 'extend'],
  METHODS,
  IGNORE_STATE_PARAMS,
  IGNORE_PROPS_PARAMS
)

export const deepClone = (obj, exclude = METHODS_EXL) => {
  const o = isArray(obj) ? [] : {}
  for (const prop in obj) {
    if (exclude.includes(prop)) continue
    let objProp = obj[prop]
    if (prop === 'extend' && isArray(objProp)) {
      objProp = mergeArray(objProp, exclude)
    }
    if (isObjectLike(objProp)) {
      o[prop] = deepClone(objProp, exclude)
    } else o[prop] = objProp
  }
  return o
}

/**
 * Overwrites object properties with another
 */
export const overwrite = (element, params, options) => {
  const changes = {}
  const { __ref } = element
  const { __exec, __cached } = __ref

  for (const e in params) {
    if (e === 'props' || e === 'state' || e === '__ref') continue

    const elementProp = element[e]
    const paramsProp = params[e]

    if (paramsProp !== undefined) {
      __cached[e] = changes[e] = elementProp
      element[e] = paramsProp
    }

    if (options.cleanExec) delete __exec[e]
  }

  return changes
}

export const overwriteShallow = (obj, params, exclude = METHODS_EXL) => {
  for (const e in params) {
    if (exclude.indexOf(e) > -1) continue
    obj[e] = params[e]
  }
  return obj
}

/**
 * Overwrites DEEPly object properties with another
 */
export const overwriteDeep = (obj, params, exclude = METHODS_EXL) => {
  for (const e in params) {
    if (exclude.indexOf(e) > -1) continue
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
export const mergeArray = (arr, exclude = ['parent', 'node', '__element', 'state', 'context', '__ref']) => {
  return arr.reduce((a, c) => deepMerge(a, deepClone(c, exclude)), {})
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
