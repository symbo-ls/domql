'use strict'

import { isFunction, isObjectLike, isObject, isArray, isString } from './types'

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
  for (const e in extend) {
    const elementProp = element[e]
    const extendProp = extend[e]
    // const cachedProps = cache.props
    if (e === 'parent' || e === 'props') continue
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
    } else stringified[prop] = objProp
    // if (prop === 'src') {
    //   console.log(typeof stringified[prop])
    //   console.log(prop, stringified[prop])
    // }
    if (isObject(objProp)) deepStringify(stringified[prop], stringified[prop])
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
      if (objProp.includes('=>') || objProp.includes('function') || objProp[0] === '(') {
        // console.groupCollapsed(prop)
        // console.log(obj)
        // console.log(objProp)
        try {
          const evalProp = eval(objProp) // eslint-disable-line
          // console.log(evalProp)
          stringified[prop] = evalProp
        } catch (e) { if (e) stringified[prop] = objProp }
        // console.groupEnd(prop)
      }
    } else stringified[prop] = objProp
    if (isObject(objProp)) deepDestringify(stringified[prop], stringified[prop])
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
