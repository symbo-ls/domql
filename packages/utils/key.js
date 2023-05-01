'use strict'

export const createKey = (function () {
  let index = 0

  function newId () {
    index++
    return index
  }

  return newId
})()

export const createSnapshotId = createKey
