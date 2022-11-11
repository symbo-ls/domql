'use strict'

export const createID = (function() {
  let index = 1

  function newId() {
    index++
    return index
  }

  return newId
})()

export const createSnapshotId = createID
