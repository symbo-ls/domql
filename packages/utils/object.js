'use strict'

import { window } from '@domql/globals'
import { isFunction, isObjectLike, isObject, isArray, isString, is } from './types.js'
import { mergeAndCloneIfArray, mergeArray } from './array.js'

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

export const merge = (element, obj, excludeFrom = []) => {
  for (const e in obj) {
    if (excludeFrom.includes(e) || e.includes('__')) continue
    const elementProp = element[e]
    const objProp = obj[e]
    if (elementProp === undefined) {
      element[e] = objProp
    }
  }
  return element
}

export const deepMerge = (element, extend, excludeFrom = []) => {
  for (const e in extend) {
    if (excludeFrom.includes(e) || e.includes('__')) continue
    const elementProp = element[e]
    const extendProp = extend[e]
    if (isObjectLike(elementProp) && isObjectLike(extendProp)) {
      deepMerge(elementProp, extendProp)
    } else if (elementProp === undefined) {
      element[e] = extendProp
    }
  }
  return element
}

export const clone = (obj, excludeFrom = []) => {
  const o = {}
  for (const prop in obj) {
    if (excludeFrom.includes(prop) || prop.includes('__')) continue
    o[prop] = obj[prop]
  }
  return o
}

/**
 * Creates a deep copy of an object or array, excluding specific properties.
 * @param {Object|Array} obj - The object or array to clone.
 * @param {Array<string>} [excludeFrom=[]] - An array of property names to exclude from the clone.
 * @returns {Object|Array} The cloned object or array.
 */
export function deepClone(obj, excludeFrom = []) {
  if (!isObjectLike(obj)) {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item, excludeFrom))
  }
  
  const clonedObj = {}
  for (const prop in obj) {
    if (excludeFrom.includes(prop) || prop.includes('__')) continue
    clonedObj[prop] = deepClone(obj[prop], excludeFrom)
  }
  return clonedObj
}

/**
 * Recursively stringifies an object, converting functions to strings.
 *
 * @param {object} obj - The object to stringify.
 * @param {object} [stringified={}] - The resulting stringified object.
 * @returns {object} - The stringified object.
 */
export const deepStringify = (obj, stringified = {}) => {
  for (const prop in obj) {
    if (!obj.hasOwnProperty(prop)) continue; // skip inherited properties
    const objProp = obj[prop];
    if (isFunction(objProp)) {
      stringified[prop] = objProp.toString();
    } else if (isObject(objProp)) {
      stringified[prop] = {};
      deepStringify(objProp, stringified[prop]);
    } else if (isArray(objProp)) {
      stringified[prop] = [];
      objProp.forEach((v, i) => {
        if (isObject(v)) {
          stringified[prop][i] = {};
          deepStringify(v, stringified[prop][i]);
        } else if (isFunction(v)) {
          stringified[prop][i] = v.toString();
        } else {
          stringified[prop][i] = v;
        }
      });
    } else {
      stringified[prop] = objProp;
    }
  }
  return stringified;
}

/**
 * Converts a deep object containing stringified functions to their original form.
 * @param {object} obj - The object to destingify.
 * @returns {object} - The destingified object.
 */
export const deepDestringify = (obj) => {
  const destingified = {}
  for (const [key, value] of Object.entries(obj)) {
    if (isString(value)) {
      try {
        const evalValue = window.eval(`(${value})`) // use parentheses to convert string to function expression
        destingified[key] = evalValue
      } catch {
        destingified[key] = value
      }
    } else if (isArray(value)) {
      destingified[key] = value.map((item) =>
        isObject(item) ? deepDestringify(item) : item
      )
    } else if (isObject(value)) {
      destingified[key] = deepDestringify(value)
    } else {
      destingified[key] = value
    }
  }
  return destingified
}

/**
 * Overwrites object properties with another
 */
export const overwrite = (element, params, excludeFrom = []) => {
  const { ref } = element
  const changes = {}

  for (const e in params) {
    if (excludeFrom.includes(e) || e.includes('__')) continue

    const elementProp = element[e]
    const paramsProp = params[e]

    if (paramsProp) {
      ref.__cache[e] = changes[e] = elementProp
      ref[e] = paramsProp
    }
  }

  return changes
}

export const diffObjects = (original, objToDiff, cache) => {
  for (const e in objToDiff) {
    if (e === 'ref') continue

    const originalProp = original[e]
    const objToDiffProp = objToDiff[e]

    if (isObject(originalProp) && isObject(objToDiffProp)) {
      cache[e] = {}
      diff(originalProp, objToDiffProp, cache[e])
    } else if (objToDiffProp !== undefined) {
      cache[e] = objToDiffProp
    }
  }
  return cache
}

export const diffArrays = (original, objToDiff, cache) => {
  if (original.length !== objToDiff.length) {
    cache = objToDiff
  } else {
    const diffArr = []
    for (let i = 0; i < original.length; i++) {
      const diffObj = diff(original[i], objToDiff[i])
      if (Object.keys(diffObj).length > 0) {
        diffArr.push(diffObj)
      }
    }
    if (diffArr.length > 0) {
      cache = diffArr
    }
  }
  return cache
}

export const diff = (original, objToDiff, cache = {}) => {
  if (isArray(original) && isArray(objToDiff)) {
    cache = []
    diffArrays(original, objToDiff, cache)
  } else {
    diffObjects(original, objToDiff, cache)
  }

  return cache
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

export const overwriteShallow = (obj, params, excludeFrom = []) => {
  for (const e in params) {
    if (excludeFrom.includes(e) || e.includes('__')) continue
    obj[e] = params[e]
  }
  return obj
}

/**
 * Overwrites DEEPLY object properties with another
 */
export const overwriteDeep = (obj, params, excludeFrom = []) => {
  for (const e in params) {
    if (excludeFrom.includes(e) || e.includes('__')) continue
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

export const removeFromObject = (obj, props) => {
  if (props === undefined || props === null) return obj
  if (is(props)('string', 'number')) {
    delete obj[props]
  } else if (isArray(props)) {
    props.forEach(prop => delete obj[prop])
  } else {
    throw new Error('Invalid input: props must be a string or an array of strings')
  }
  return obj
}
