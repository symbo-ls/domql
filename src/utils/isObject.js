'use strict'

var isObject = arg => {
  return Object.prototype.toString
    .call(arg).indexOf('Object') !== -1
}

export default isObject
