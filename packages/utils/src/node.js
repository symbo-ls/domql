'use strict'

export const cleanWithNode = proto => delete proto.node && proto

export const createID = (function * () {
  let index = 1
  while (index < index + 1) {
    yield index++
  }
}())
