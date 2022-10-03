'use strict'

export const measure = (key, func) => {
  const perf = window.performance.now()
  func()
  const diff = window.performance.now() - perf
  if (diff > 1000) console.error(key, diff)
  if (diff > 100) console.warn(key, diff)
  else console.log(key, diff)
}
