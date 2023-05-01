'use strict'

import { window } from './globals'

const OPTIONS = { logLevel: 4 }

/**
 * Measures the time it takes to execute a given function and logs the result based on the specified log level.
 * @param {string} key - The identifier for the measurement.
 * @param {function} func - The function to be measured.
 * @param {object} options - The options object specifying the log level (default value: OPTIONS).
 */
export const measure = (key, func, options = OPTIONS) => {
  const start = window.performance.now()
  func(start)
  const end = window.performance.now()
  const diff = end - start
  const logFunc = (level, message) => {
    if (options.logLevel > level) {
      console.group(`measure ${key}`)
      console[level](message)
      console.groupEnd(`measure ${key}`)
    }
  }
  logFunc(0, diff)
  logFunc(1, diff)
  logFunc(2, diff)
  logFunc(3, diff)
  logFunc(4, diff)
}
