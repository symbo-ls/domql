'use strict'

var get = function (param) {
  var element = this
  console.log(element)
  return element[param]
}

export default get
