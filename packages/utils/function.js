'use strict'

/**
 * Creates a debounced function that delays the execution of the input function until the timeout period has elapsed.
 * @param {object} element - The object that the function will be applied to when called.
 * @param {function} func - The function to be debounced.
 * @param {number} [timeout=300] - The timeout period in milliseconds.
 * @returns {function} - A debounced version of the input function.
 */
export const debounce = (element, func, timeout = 300) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => { func.apply(element, args) }, timeout)
  }
}

/**
 * Memoizes a function to improve performance by caching previously computed results.
 * @param {function} fn - The function to be memoized.
 * @returns {function} - A memoized version of the original function.
 */
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

/**
 * Recursively removes all functions from an object.
 * @param {object} obj - The object to detach functions from.
 * @param {object} detached - The detached object.
 * @returns {object} - The object with functions detached.
 */
export const detachFunctionsFromObject = (obj, detached = {}) => {
  for (const key in obj) {
    const value = obj[key]

    if (isFunction(value)) {
      continue
    }

    if (isObject(value)) {
      detached[key] = {}
      detachFunctionsFromObject(value, detached[key])
    } else if (isArray(value)) {
      detached[key] = []

      for (let i = 0 i < value.length i++) {
        const v = value[i]

        if (isFunction(v)) {
          continue
        }

        if (isObject(v)) {
          detached[key][i] = {}
          detachFunctionsFromObject(v, detached[key][i])
        } else {
          detached[key][i] = v
        }
      }
    } else {
      detached[key] = value
    }
  }

  return detached
}
