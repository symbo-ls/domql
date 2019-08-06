'use strict'

var mapProperty = (obj, extention) => {
  for (const e in extention) {
    obj[e] = extention[e]
  }
}

export default mapProperty
