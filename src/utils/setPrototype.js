'use strict'

var setPrototype = (obj, extention) => {
  // obj = {
  //   ...extention,
  //   ...obj
  // }

  // for (let e in extention) {
  //   obj.__proto__[e] = extention[e]
  // }

  // Object.setPrototypeOf(obj, extention)

  for (let e in extention) {
    if (!obj[e]) obj[e] = extention[e]
  }
}

export default setPrototype
