'use strict'

export const debounce = (element, func, timeout = 300) => {
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
