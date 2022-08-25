'use strict'

export const cleanWithNode = extend => delete extend.node && extend

export const createID = (function * () {
  let index = 1
  while (index < index + 1) {
    yield index++
  }
}())
