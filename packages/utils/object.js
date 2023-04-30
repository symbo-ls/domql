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

// Clone anything deeply but excludeFrom keys given in 'excludeFrom'
export const deepCloneExclude = (obj, excludeFrom = []) => {
  if (isArray(obj)) {
    return obj.map(x => deepCloneExclude(x, excludeFrom))
  }

  const o = {}
  for (const k in obj) {
    if (excludeFrom.includes(k) || k.includes('__')) continue

    let v = obj[k]

    if (k === 'extend' && isArray(v)) {
      v = mergeArrayExclude(v, excludeFrom)
    }

    if (isArray(v)) {
      o[k] = v.map(x => deepCloneExclude(x, excludeFrom))
    } else if (isObject(v)) {
      o[k] = deepCloneExclude(v, excludeFrom)
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
export const deepClone = (obj, excludeFrom = []) => {
  const o = isArray(obj) ? [] : {}
  for (const prop in obj) {
    if (excludeFrom.includes(prop) || prop.includes('__')) continue
    let objProp = obj[prop]
    if (prop === 'extend' && isArray(objProp)) {
      objProp = mergeArray(objProp)
    }
    if (isObjectLike(objProp)) {
      o[prop] = deepClone(objProp, excludeFrom)
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
 * Stringify object
 */
export const detachFunctionsFromObject = (obj, detached = {}) => {
  for (const prop in obj) {
    const objProp = obj[prop]
    if (isFunction(objProp)) continue
    else if (isObject(objProp)) {
      detached[prop] = {}
      deepStringify(objProp, detached[prop])
    } else if (isArray(objProp)) {
      detached[prop] = []
      objProp.forEach((v, i) => {
        if (isFunction(v)) return
        if (isObject(v)) {
          detached[prop][i] = {}
          detachFunctionsFromObject(v, detached[prop][i])
        } else {
          detached[prop][i] = v
        }
      })
    } else {
      detached[prop] = objProp
    }
  }
  return detached
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
