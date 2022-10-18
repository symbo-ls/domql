'use strict'

export const cleanWithNode = extend => delete extend.node && extend

export const createSnapshotId = function * () {
  let index = 1
  while (index < index + 1) {
    yield index++
  }
}

export const createID = (createSnapshotId())
