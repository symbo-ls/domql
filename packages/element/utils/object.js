'use strict'

import { isObjectLike, deepClone, METHODS_EXL, deepMerge } from '@domql/utils'

// breaks server build
// import { METHODS } from '../methods'

export const clone = (obj, exclude = METHODS_EXL) => {
  const o = {}
  for (const e in obj) {
    if (exclude.includes(e)) continue
    o[e] = obj[e]
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
 * Merges array extends
 */
export const unstackArrayOfObjects = (
  arr,
  exclude = ['parent', 'node', '__element', 'state', 'context', '__ref']
) => {
  return arr.reduce((a, c) => deepMerge(a, deepClone(c, { exclude })), {})
}
