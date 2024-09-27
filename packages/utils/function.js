'use strict'

/**
 * Debounces a function, ensuring that it is only executed after a specified timeout
 * period has elapsed since the last invocation.
 *
 * @param {function} func - The function to be debounced.
 * @param {number} [timeout=300] - The time (in milliseconds) to wait after the last call to
 *     `debounce` before executing the `func`.
 * @returns {function} - A debounced version of the input function `func`.
 * @example
 * // Usage example:
 * const debouncedFunction = debounce(this, myFunction, 500);
 * window.addEventListener('resize', debouncedFunction);
 */
export function debounce (func, wait, immediate) {
  let timeout
  return function () {
    const context = this; const args = arguments
    const later = function () {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}

/**
 * Debounces a function, ensuring that it is only executed after a specified timeout
 * period has elapsed since the last invocation.
 *
 * @param {Object} element - The context (this) to which the debounced function will be applied.
 * @param {function} func - The function to be debounced.
 * @param {number} [timeout=300] - The time (in milliseconds) to wait after the last call to
 *     `debounce` before executing the `func`.
 * @returns {function} - A debounced version of the input function `func`.
 * @example
 * // Usage example:
 * const debouncedFunction = debounce(this, myFunction, 500);
 * window.addEventListener('resize', debouncedFunction);
 */
export const debounceOnContext = (element, func, timeout = 300) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => { func.apply(element, args) }, timeout)
  }
}

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

export const isStringFunction = inputString => {
  // Regular expression to match both regular and arrow function declarations
  const functionRegex = /^((function\s*\([^)]*\)\s*\{[^}]*\})|(\([^)]*\)\s*=>))/

  // Use the regex to test if the inputString matches the function pattern
  return functionRegex.test(inputString)
}

export function cloneFunction (fn, win = window) {
  const temp = function () {
    return fn.apply(win, arguments)
  }

  // Copy properties from original function
  for (const key in fn) {
    if (Object.hasOwnProperty.call(fn, key)) {
      temp[key] = fn[key]
    }
  }
  return temp
}
