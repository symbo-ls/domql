'use strict'

export const cleanWithNode = extend => delete extend.node && extend

export const createID = (function () {
  let index = 0

  function newId () {
    index++
    return index
  }

  return newId
})()

export const createSnapshotId = createID
