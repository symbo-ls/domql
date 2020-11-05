'use strict'

const createID = function * () {
  let index = 1
  while (index < index + 1) {
    yield index++
  }
}

export default createID()
