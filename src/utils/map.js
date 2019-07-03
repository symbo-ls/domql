'use strict'

var mapProperty = (obj, extention) => {
  for (let e in extention) {
    obj[e] = extention[e]
  }
}

export default mapProperty
