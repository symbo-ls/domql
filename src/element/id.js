'use strict'

var createID = function * () {
  var index = 1
  while (index < index + 1) {
    yield index++
  }
}

export default createID()
