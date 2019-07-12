'use strict'

var setPrototype = (obj, extention) => {
  // for (let e in extention) {
  //   obj.__proto__[e] = extention[e]
  // }
  Object.setPrototypeOf(obj, extention)
  // obj = {
  //   ...extention,
  //   ...obj
  // }
}

export default setPrototype
