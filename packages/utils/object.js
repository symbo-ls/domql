'use strict'

import { window } from './globals.js'
import {
  isFunction,
  isObjectLike,
  isObject,
  isArray,
  isString,
  is,
  isUndefined,
  isDate,
  isNull
} from './types.js'
import { mergeAndCloneIfArray, mergeArray } from './array.js'
import { stringIncludesAny } from './string.js'
import { isDOMNode } from './node.js'

const ENV = process.env.NODE_ENV

export const exec = (param, element, state, context) => {
  if (isFunction(param)) {
    return param.call(
      element,
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
    const hasOwnProperty = Object.prototype.hasOwnProperty.call(obj, e)
    if (!hasOwnProperty || excludeFrom.includes(e) || e.startsWith('__')) continue
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
    const hasOwnProperty = Object.prototype.hasOwnProperty.call(extend, e)
    if (!hasOwnProperty || excludeFrom.includes(e) || e.startsWith('__')) continue
    const elementProp = element[e]
    const extendProp = extend[e]
    if (isObjectLike(elementProp) && isObjectLike(extendProp)) {
      deepMerge(elementProp, extendProp, excludeFrom)
    } else if (elementProp === undefined) {
      element[e] = extendProp
    }
  }
  return element
}

export const clone = (obj, excludeFrom = []) => {
  const o = {}
  for (const prop in obj) {
    const hasOwnProperty = Object.prototype.hasOwnProperty.call(obj, prop)
    if (!hasOwnProperty || excludeFrom.includes(prop) || prop.startsWith('__')) continue
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
    const hasOwnProperty = Object.prototype.hasOwnProperty.call(obj, k)
    if (!hasOwnProperty || excludeFrom.includes(k) || k.startsWith('__')) continue

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

// Merge array, but exclude keys listed in 'excl'z
export const mergeArrayExclude = (arr, excl = []) => {
  return arr.reduce((acc, curr) => deepMerge(acc, deepCloneExclude(curr, excl)), {})
}

/**
 * Deep cloning of object
 */
export const deepClone = (obj, exclude = [], cleanUndefined = false, visited = new WeakMap()) => {
  // Handle non-object types, null, and ignored types
  if (!isObjectLike(obj) || isDOMNode(obj)) return obj

  // Check for circular references
  if (visited.has(obj)) return visited.get(obj)

  // Create a new object or array
  const clone = isArray(obj) ? [] : {}

  // Store the clone in the WeakMap to handle circular references
  visited.set(obj, clone)

  // Iterate over the properties of the object
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && !exclude.includes(key)) {
      const value = obj[key]

      if (isDOMNode(value)) {
        // Skip cloning for DOM nodes
        clone[key] = value
      } else if (key === 'extend' && isArray(value)) {
        clone[key] = mergeArray(value, exclude)
      } else if (isObjectLike(value)) {
        clone[key] = deepClone(value, exclude, cleanUndefined, visited)
      } else {
        clone[key] = value
      }
    }
  }

  return clone
}
// export const deepClone = (obj, excludeFrom = [], cleanUndefined = false) => {
//   const o = isArray(obj) ? [] : {}
//   for (const prop in obj) {
//     if (!Object.prototype.hasOwnProperty.call(obj, prop)) continue
//     // if (prop === 'node' || prop === 'parent' || prop === 'root' || prop === '__element') {
//     //   console.warn('recursive clonning is called', obj)
//     //   continue
//     // }
//     if (prop === '__proto__') continue
//     if (excludeFrom.includes(prop) || prop.startsWith('__')) continue
//     let objProp = obj[prop]
//     if (cleanUndefined && isUndefined(objProp)) continue
//     if (prop === 'extend' && isArray(objProp)) {
//       objProp = mergeArray(objProp)
//     }
//     if (isObjectLike(objProp)) {
//       // queueMicrotask(() => {
//       o[prop] = deepClone(objProp, excludeFrom, cleanUndefined)
//       // })
//     } else o[prop] = objProp
//   }
//   return o
// }

/**
 * Deep cloning of object
 */
export const deepCloneWithExtend = (obj, excludeFrom = ['node'], options = {}, visited = new WeakSet()) => {
  // Check if the value is object-like before trying to track it in visited
  if (isObjectLike(obj)) {
    if (visited.has(obj)) {
      return obj // Return the object if it was already cloned
    }
    visited.add(obj) // Add to visited set only if it's an object
  }

  const o = options.window
    ? isArray(obj)
      ? new options.window.Array([])
      : new options.window.Object({})
    : isArray(obj)
      ? []
      : {}

  for (const prop in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, prop)) continue

    const objProp = obj[prop]

    if (
      excludeFrom.includes(prop) ||
      prop.startsWith('__') ||
      (options.cleanUndefined && isUndefined(objProp)) ||
      (options.cleanNull && isNull(objProp))
    ) {
      continue
    }

    if (isObjectLike(objProp)) {
      o[prop] = deepCloneWithExtend(objProp, excludeFrom, options, visited)
    } else if (isFunction(objProp) && options.window) {
      o[prop] = (options.window || window).eval('(' + objProp.toString() + ')')
    } else {
      o[prop] = objProp
    }
  }

  return o
}

/**
 * Stringify object
 */
export const deepStringify = (obj, stringified = {}) => {
  if (obj.node || obj.__ref || obj.parent || obj.__element || obj.parse) {
    console.warn('Trying to clone element or state at', obj)
    obj = obj.parse?.()
  }

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

const MAX_DEPTH = 100 // Adjust this value as needed
export const deepStringifyWithMaxDepth = (obj, stringified = {}, depth = 0, path = '') => {
  if (depth > MAX_DEPTH) {
    console.warn(`Maximum depth exceeded at path: ${path}. Possible circular reference.`)
    return '[MAX_DEPTH_EXCEEDED]'
  }

  for (const prop in obj) {
    const currentPath = path ? `${path}.${prop}` : prop
    const objProp = obj[prop]

    if (isFunction(objProp)) {
      stringified[prop] = objProp.toString()
    } else if (isObject(objProp)) {
      stringified[prop] = {}
      deepStringifyWithMaxDepth(objProp, stringified[prop], depth + 1, currentPath)
    } else if (isArray(objProp)) {
      stringified[prop] = []
      objProp.forEach((v, i) => {
        const itemPath = `${currentPath}[${i}]`
        if (isObject(v)) {
          stringified[prop][i] = {}
          deepStringifyWithMaxDepth(v, stringified[prop][i], depth + 1, itemPath)
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

export const objectToString = (obj = {}, indent = 0) => {
  const spaces = '  '.repeat(indent)
  let str = '{\n'

  for (const [key, value] of Object.entries(obj)) {
    const keyNotAllowdChars = stringIncludesAny(key, ['&', '*', '-', ':', '%', '{', '}', '>', '<', '@', '.', '/', '!', ' '])
    const stringedKey = keyNotAllowdChars ? `'${key}'` : key
    str += `${spaces}  ${stringedKey}: `

    if (isArray(value)) {
      str += '[\n'
      for (const element of value) {
        if (isObject(element) && element !== null) {
          str += `${spaces}    ${objectToString(element, indent + 2)},\n`
        } else if (isString(element)) {
          // if (element.includes('\n')) str += spaces + '    ' + '`' + element + '`,\n'
          str += `${spaces}    '${element}',\n`
        } else {
          str += `${spaces}    ${element},\n`
        }
      }
      str += `${spaces}  ]`
    } else if (isObjectLike(value)) {
      str += objectToString(value, indent + 1)
    } else if (isString(value)) {
      str += stringIncludesAny(value, ['\n', '\'']) ? `\`${value}\`` : `'${value}'`
    } else {
      str += value
    }

    str += ',\n'
  }

  str += `${spaces}}`
  return str
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
export const deepDestringify = (obj, destringified = {}) => {
  for (const prop in obj) {
    const hasOwnProperty = Object.prototype.hasOwnProperty.call(obj, prop)
    if (!hasOwnProperty) continue
    const objProp = obj[prop]
    if (isString(objProp)) {
      if ((
        objProp.includes('(){') ||
        objProp.includes('() {') ||
        objProp.includes('=>') ||
        objProp.startsWith('()') ||
        objProp.startsWith('async') ||
        objProp.startsWith('function') ||
        objProp.startsWith('(')
      ) &&
        !objProp.startsWith('{') && !objProp.startsWith('[')
      ) {
        try {
          const evalProp = window.eval(`(${objProp})`)
          destringified[prop] = evalProp
        } catch (e) { if (e) destringified[prop] = objProp }
      } else {
        destringified[prop] = objProp
      }
    } else if (isArray(objProp)) {
      destringified[prop] = []
      objProp.forEach((arrProp) => {
        if (isString(arrProp)) {
          if (arrProp.includes('=>') || arrProp.includes('function') || arrProp.startsWith('(')) {
            try {
              const evalProp = window.eval(`(${arrProp})`) // use parentheses to convert string to function expression
              destringified[prop].push(evalProp)
            } catch (e) { if (e) destringified[prop].push(arrProp) }
          } else {
            destringified[prop].push(arrProp)
          }
        } else if (isObject(arrProp)) {
          destringified[prop].push(deepDestringify(arrProp))
        } else {
          destringified[prop].push(arrProp)
        }
      })
    } else if (isObject(objProp)) {
      destringified[prop] = deepDestringify(objProp, destringified[prop])
    } else {
      destringified[prop] = objProp
    }
  }
  return destringified
}

export const stringToObject = (str, opts = { verbose: true }) => {
  try {
    return window.eval('(' + str + ')') // eslint-disable-line
  } catch (e) { if (opts.verbose) console.warn(e) }
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

export const hasOwnProperty = (o, ...args) => Object.prototype.hasOwnProperty.call(o, ...args)

export const isEmpty = o => Object.keys(o).length === 0

export const isEmptyObject = (o) => isObject(o) && isEmpty(o)

export const makeObjectWithoutPrototype = () => Object.create(null)

// by mattphillips
// https://github.com/mattphillips/deep-object-diff/blob/main/src/diff.js
export const deepDiff = (lhs, rhs) => {
  if (lhs === rhs) return {}

  if (!isObjectLike(lhs) || !isObjectLike(rhs)) return rhs

  const deletedValues = Object.keys(lhs).reduce((acc, key) => {
    if (!hasOwnProperty(rhs, key)) {
      acc[key] = undefined
    }

    return acc
  }, makeObjectWithoutPrototype())

  if (isDate(lhs) || isDate(rhs)) {
    if (lhs.valueOf() === rhs.valueOf()) return {}
    return rhs
  }

  return Object.keys(rhs).reduce((acc, key) => {
    if (!hasOwnProperty(lhs, key)) {
      acc[key] = rhs[key]
      return acc
    }

    const difference = diff(lhs[key], rhs[key])

    if (isEmptyObject(difference) && !isDate(difference) && (isEmptyObject(lhs[key]) || !isEmptyObject(rhs[key]))) {
      return acc
    }

    acc[key] = difference
    return acc
  }, deletedValues)
}

/**
 * Overwrites object properties with another
 */
export const overwrite = (element, params, excludeFrom = []) => {
  const { ref } = element
  const changes = {}

  for (const e in params) {
    if (excludeFrom.includes(e) || e.startsWith('__')) continue

    const elementProp = element[e]
    const paramsProp = params[e]

    if (paramsProp) {
      ref.__cache[e] = changes[e] = elementProp
      ref[e] = paramsProp
    }
  }

  return changes
}

export const overwriteShallow = (obj, params, excludeFrom = []) => {
  for (const e in params) {
    if (excludeFrom.includes(e) || e.startsWith('__')) continue
    obj[e] = params[e]
  }
  return obj
}

/**
 * Overwrites DEEPLY object properties with another
 */
export const overwriteDeep = (obj, params, excludeFrom = [], visited = new WeakMap()) => {
  if (!isObjectLike(obj) || !isObjectLike(params) || isDOMNode(obj) || isDOMNode(params)) {
    return params
  }

  if (visited.has(obj)) {
    return visited.get(obj)
  }

  visited.set(obj, obj)

  for (const e in params) {
    if (e === '__ref' || excludeFrom.includes(e) || e.startsWith('__')) continue

    const objProp = obj[e]
    const paramsProp = params[e]

    if (isDOMNode(paramsProp)) {
      obj[e] = paramsProp
    } else if (isObjectLike(objProp) && isObjectLike(paramsProp)) {
      obj[e] = overwriteDeep(objProp, paramsProp, excludeFrom, visited)
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

/**
 * Recursively compares two values to determine if they are deeply equal.
 *
 * This function checks for deep equality between two values, including
 * objects, arrays, and nested structures. It handles circular references to
 * prevent infinite loops.
 *
 * @param {*} param - The first value to compare.
 * @param {*} element - The second value to compare.
 * @param {Set} [visited] - (Optional) A set to track visited objects during recursion
 *   to handle circular references. You can omit this parameter when calling
 *   the function; it is used internally for tracking visited objects.
 *
 * @returns {boolean} Returns `true` if the values are deeply equal, `false` otherwise.
 *
 * @example
 * // Comparing primitive values
 * isEqualDeep(42, 42); // true
 * isEqualDeep('hello', 'hello'); // true
 * isEqualDeep(true, true); // true
 * isEqualDeep(42, '42'); // false
 *
 * // Comparing simple objects
 * const obj1 = { a: 1, b: { c: 2 } };
 * const obj2 = { a: 1, b: { c: 2 } };
 * isEqualDeep(obj1, obj2); // true
 *
 * // Handling circular references
 * const circularObj = { prop: null };
 * circularObj.prop = circularObj;
 * const anotherObj = { prop: null };
 * anotherObj.prop = anotherObj;
 * isEqualDeep(circularObj, anotherObj); // true
 */
export const isEqualDeep = (param, element, visited = new Set()) => {
  // Check if both values are non-null objects
  if (typeof param !== 'object' || typeof element !== 'object' || param === null || element === null) {
    return param === element // Compare non-object values directly
  }

  // Check for circular references
  if (visited.has(param) || visited.has(element)) {
    return true // Assume equality to break the circular reference
  }

  visited.add(param)
  visited.add(element)

  const keysParam = Object.keys(param)
  const keysElement = Object.keys(element)

  // Check if both objects have the same number of properties
  if (keysParam.length !== keysElement.length) {
    return false
  }

  // Check if all properties in param also exist in element
  for (const key of keysParam) {
    if (!keysElement.includes(key)) {
      return false
    }

    const paramProp = param[key]
    const elementProp = element[key]

    // Recursively check property values
    if (!isEqualDeep(paramProp, elementProp, visited)) {
      return false
    }
  }

  return true
}

export const deepContains = (obj1, obj2, ignoredKeys = ['node', '__ref']) => {
  if (obj1 === obj2) return true
  if (!isObjectLike(obj1) || !isObjectLike(obj2)) return false
  if (isDOMNode(obj1) || isDOMNode(obj2)) return obj1 === obj2

  const stack = [[obj1, obj2]]
  const visited = new WeakSet()

  while (stack.length > 0) {
    const [current1, current2] = stack.pop()

    if (visited.has(current1)) continue
    visited.add(current1)

    const keys1 = Object.keys(current1).filter(key => !ignoredKeys.includes(key))
    const keys2 = Object.keys(current2).filter(key => !ignoredKeys.includes(key))

    if (keys1.length !== keys2.length) return false

    for (const key of keys1) {
      if (!Object.prototype.hasOwnProperty.call(current2, key)) return false

      const value1 = current1[key]
      const value2 = current2[key]

      if (isDOMNode(value1) || isDOMNode(value2)) {
        if (value1 !== value2) return false
      } else if (isObjectLike(value1) && isObjectLike(value2)) {
        if (value1 !== value2) {
          stack.push([value1, value2])
        }
      } else if (value1 !== value2) {
        return false
      }
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

export const createObjectWithoutPrototype = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj // Return the value if obj is not an object
  }

  const newObj = Object.create(null) // Create an object without prototype

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = createObjectWithoutPrototype(obj[key]) // Recursively copy each property
    }
  }

  return newObj
}

export const createNestedObject = (arr, lastValue) => {
  const nestedObject = {}

  if (arr.length === 0) {
    return lastValue
  }

  arr.reduce((obj, value, index) => {
    if (!obj[value]) {
      obj[value] = {}
    }
    if (index === arr.length - 1 && lastValue) {
      obj[value] = lastValue
    }
    return obj[value]
  }, nestedObject)

  return nestedObject
}

export const removeNestedKeyByPath = (obj, path) => {
  if (!Array.isArray(path)) {
    throw new Error('Path must be an array.')
  }

  let current = obj

  for (let i = 0; i < path.length - 1; i++) {
    if (current[path[i]] === undefined) {
      return // Path does not exist, so nothing to remove.
    }
    current = current[path[i]]
  }

  const lastKey = path[path.length - 1]
  if (current && Object.hasOwnProperty.call(current, lastKey)) {
    delete current[lastKey]
  }
}

export const detectInfiniteLoop = arr => {
  const maxRepeats = 10 // Maximum allowed repetitions
  let pattern = []
  let repeatCount = 0

  for (let i = 0; i < arr.length; i++) {
    if (pattern.length < 2) {
      // Build the initial pattern with two consecutive elements
      pattern.push(arr[i])
    } else {
      // Check if the current element follows the repeating pattern
      if (arr[i] === pattern[i % 2]) {
        repeatCount++
      } else {
        // If there's a mismatch, reset the pattern and repeat counter
        pattern = [arr[i - 1], arr[i]]
        repeatCount = 1 // Reset to 1 because we start a new potential pattern
      }

      // If the pattern repeats more than `maxRepeats`, throw a warning
      if (repeatCount >= maxRepeats * 2) {
        if (ENV === 'test' || ENV === 'development') {
          console.warn('Warning: Potential infinite loop detected due to repeated sequence:', pattern)
        }
        return true
      }
    }
  }
}

export const isCyclic = (obj) => {
  const seenObjects = []

  function detect (obj) {
    if (obj && typeof obj === 'object') {
      if (seenObjects.indexOf(obj) !== -1) {
        return true
      }
      seenObjects.push(obj)
      for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key) && detect(obj[key])) {
          console.log(obj, 'cycle at ' + key)
          return true
        }
      }
    }
    return false
  }

  return detect(obj)
}
