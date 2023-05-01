'use strict'

/**
 * Returns a unique key each time it is called.
 * @returns {number} - A unique key value.
 */
export const createKey = (function () {
  let index = 0
  return function () {
    index++
    return index
  }
})()

export const createSnapshotId = createKey
