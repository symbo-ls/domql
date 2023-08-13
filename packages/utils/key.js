'use strict'

export const generateKey = (function () {
  let index = 0

  function newId () {
    index++
    return index
  }

  return newId
})()

export const createSnapshotId = generateKey
