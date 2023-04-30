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
