'use strict'

module.exports = {
  mapProperty (obj, extention) {
    for (let e in extention) {
      obj[e] = extention[e]
    }
  }
}
