'use strict'

import {
  isArray,
  isObject,
  isObjectLike,
  joinArrays,
  deepClone
} from '@domql/utils'
import { IGNORE_PROPS_PARAMS } from '../props/index.js'

// breaks server build
// import { IGNORE_STATE_PARAMS } from '@domql/state'
// import { METHODS } from '../methods'

const IGNORE_STATE_PARAMS = [
  'update',
  'parse',
  'clean',
  'create',
  'destroy',
  'add',
  'toggle',
  'remove',
  'apply',
  'set',
  'reset',
  'replace',
  'quietReplace',
  'quietUpdate',
  'applyReplace',
  'applyFunction',
  'rootUpdate',
  'parentUpdate',
  'parent',
  '__element',
  '__depends',
  '__ref',
  '__children',
  'root',
  'setByPath',
  'setPathCollection',
  'removeByPath',
  'removePathCollection',
  'getByPath'
]

export const METHODS = [
  'set',
  'reset',
  'update',
  'remove',
  'updateContent',
  'removeContent',
  'lookup',
  'lookdown',
  'lookdownAll',
  'getRef',
  'getPath',
  'setNodeStyles',
  'spotByPath',
  'append',
  'keys',
  'parse',
  'setProps',
  'parseDeep',
  'variables',
  'if',
  'log',
  'nextElement',
  'previousElement'
]

export const METHODS_EXL = joinArrays(
  ['node', 'state', 'context', 'extend', '__element'],
  METHODS,
  IGNORE_STATE_PARAMS,
  IGNORE_PROPS_PARAMS
)

export const deepMerge = (element, extend, exclude = METHODS_EXL) => {
  for (const e in extend) {
    if (exclude.includes(e)) continue
    const elementProp = element[e]
    const extendProp = extend[e]
    if (elementProp === undefined) {
      element[e] = extendProp
    } else if (isObjectLike(elementProp) && isObject(extendProp)) {
      deepMerge(elementProp, extendProp)
    }
  }
  return element
}

export const clone = (obj, exclude = METHODS_EXL) => {
  const o = {}
  for (const e in obj) {
    if (exclude.includes(e)) continue
    o[e] = obj[e]
  }
  return o
}

// export const deepClone = (obj, exclude = METHODS_EXL) => {
//   const o = isArray(obj) ? [] : {}
//   for (const e in obj) {
//     if (exclude.includes(e)) continue
//     let objProp = obj[e]
//     if (e === 'extend' && isArray(objProp)) {
//       objProp = mergeArray(objProp, exclude)
//     }
//     if (isObjectLike(objProp)) {
//       o[e] = deepClone(objProp, exclude)
//     } else o[e] = objProp
//   }
//   return o
// }

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
    if (exclude.includes(e)) continue
    obj[e] = params[e]
  }
  return obj
}

/**
 * Overwrites DEEPly object properties with another
 */
export const overwriteDeep = (obj, params, exclude = METHODS_EXL) => {
  for (const e in params) {
    if (exclude.includes(e)) continue
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
export const mergeArray = (
  arr,
  exclude = ['parent', 'node', '__element', 'state', 'context', '__ref']
) => {
  return arr.reduce((a, c) => deepMerge(a, deepClone(c, { exclude })), {})
}

/**
 * Merges array extends
 */
export const mergeAndCloneIfArray = (obj) => {
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
