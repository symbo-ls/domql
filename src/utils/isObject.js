'use strict'

var isObject = (arg) =>
  Object.prototype.toString.call(arg).indexOf('Object') !== -1

export default isObject
