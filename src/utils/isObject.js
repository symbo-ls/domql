'use strict'

// var isObject = arg => {
//   return Object.prototype.toString
//     .call(arg).indexOf('Object') !== -1
// }

var isObject = arg => {
  if (arg === null) { return false }
  return ((typeof arg === 'function') || (typeof arg === 'object'))
}

export default isObject
