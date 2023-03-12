'use strict'

import { window } from '@domql/globals'
import { isFunction, isObjectLike, isObject, isArray, isString, is } from './types.js'

export const exec = (param, element, state, context) => {
  if (isFunction(param)) {
    return param(
      element,
      state || element.state,
      context || element.context
    )
  }
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
  for (const e in extend) {
    const extendProp = extend[e]
    if (e === 'parent' || e === 'props') continue
    if (element[e] === undefined) {
      element[e] = extendProp
    } else if (isObjectLike(element[e]) && isObjectLike(extendProp)) {
      deepMerge(element[e], extendProp)
    } else {
      element[e] = extendProp
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

// Clone anything deeply but exclude keys given in 'exclude'
export const deepCloneExclude = (obj, exclude = []) => {
  if (isArray(obj)) {
    return obj.map(x => deepCloneExclude(x, exclude))
  }

  const o = {}
  for (const k in obj) {
    if (exclude.indexOf(k) > -1) continue

    let v = obj[k]

    if (k === 'extend' && isArray(v)) {
      v = mergeArrayExclude(v, exclude)
    }

    if (isArray(v)) {
      o[k] = v.map(x => deepCloneExclude(x, exclude))
    } else if (isObject(v)) {
      o[k] = deepCloneExclude(v, exclude)
    } else o[k] = v
  }

  return o
}

// Merge array, but exclude keys listed in 'excl'
export const mergeArrayExclude = (arr, excl = []) => {
  return arr.reduce((acc, curr) => deepMerge(acc, deepCloneExclude(curr, excl)), {})
}

/**
 * Deep cloning of object
 */
export const deepClone = (obj) => {
  if (isArray(obj)) {
    return obj.map(deepClone)
  }
  const o = {}
  for (const prop in obj) {
    let objProp = obj[prop]
    if (prop === 'extend' && isArray(objProp)) {
      objProp = mergeArray(objProp)
    }
    if (isArray(objProp)) {
      o[prop] = objProp.map(v => isObject(v) ? deepClone(v) : v)
    } else if (isObject(objProp)) {
      o[prop] = deepClone(objProp)
    } else o[prop] = objProp
  }
  return o
}

/**
 * Stringify object
 */
export const deepStringify = (obj, stringified = {}) => {
  for (const prop in obj) {
    const objProp = obj[prop]
    if (isFunction(objProp)) {
      stringified[prop] = objProp.toString()
    } else if (isObject(objProp)) {
      stringified[prop] = {}
      deepStringify(objProp, stringified[prop])
    } else if (isArray(objProp)) {
      stringified[prop] = []
      objProp.forEach((v, i) => {
        if (isObject(v)) {
          stringified[prop][i] = {}
          deepStringify(v, stringified[prop][i])
        } else if (isFunction(v)) {
          stringified[prop][i] = v.toString()
        } else {
          stringified[prop][i] = v
        }
      })
    } else {
      stringified[prop] = objProp
    }
  }
  return stringified
}

/**
 * Detringify object
 */
export const deepDestringify = (obj, stringified = {}) => {
  for (const prop in obj) {
    const objProp = obj[prop]
    if (isString(objProp)) {
      if (objProp.includes('=>') || objProp.includes('function') || objProp.startsWith('(')) {
        try {
          const evalProp = window.eval(`(${objProp})`) // use parentheses to convert string to function expression
          stringified[prop] = evalProp
        } catch (e) { if (e) stringified[prop] = objProp }
      } else {
        stringified[prop] = objProp
      }
    } else if (isArray(objProp)) {
      stringified[prop] = []
      objProp.forEach((arrProp) => {
        if (isString(arrProp)) {
          if (arrProp.includes('=>') || arrProp.includes('function') || arrProp.startsWith('(')) {
            try {
              const evalProp = window.eval(`(${arrProp})`) // use parentheses to convert string to function expression
              stringified[prop].push(evalProp)
            } catch (e) { if (e) stringified[prop].push(arrProp) }
          } else {
            stringified[prop].push(arrProp)
          }
        } else if (isObject(arrProp)) {
          stringified[prop].push(deepDestringify(arrProp))
        } else {
          stringified[prop].push(arrProp)
        }
      })
    } else if (isObject(objProp)) {
      stringified[prop] = deepDestringify(objProp, stringified[prop]) // recursively call deepDestringify for nested objects
    } else {
      stringified[prop] = objProp
    }
  }
  return stringified
}

/**
 * Overwrites object properties with another
 */
export const overwrite = (element, params, options) => {
  const { ref } = element
  const changes = {}

  for (const e in params) {
    if (e === 'props') continue

    const elementProp = element[e]
    const paramsProp = params[e]

    if (paramsProp) {
      ref.__cache[e] = changes[e] = elementProp
      ref[e] = paramsProp
    }
  }

  return changes
}

export const diff = (obj, original, cache) => {
  const changes = cache || {}
  for (const e in obj) {
    if (e === 'ref') continue
    const originalProp = original[e]
    const objProp = obj[e]
    if (isObjectLike(originalProp) && isObjectLike(objProp)) {
      changes[e] = {}
      diff(originalProp, objProp, changes[e])
    } else if (objProp !== undefined) {
      changes[e] = objProp
    }
  }
  return changes
}

/**
 * Overwrites object properties with another
 */
export const overwriteObj = (params, obj) => {
  const changes = {}

  for (const e in params) {
    const objProp = obj[e]
    const paramsProp = params[e]

    if (paramsProp) {
      obj[e] = changes[e] = objProp
    }
  }

  return changes
}

/**
 * Overwrites DEEPly object properties with another
 */
export const overwriteDeep = (params, obj) => {
  for (const e in params) {
    const objProp = obj[e]
    const paramsProp = params[e]
    if (isObjectLike(objProp) && isObjectLike(paramsProp)) {
      overwriteDeep(paramsProp, objProp)
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
 * Merges array extendtypes
 */
export const mergeArray = (arr) => {
  return arr.reduce((a, c) => deepMerge(a, deepClone(c)), {})
}

/**
 * Merges array extendtypes
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
