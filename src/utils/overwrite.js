'use strict'

var overwrite = (obj, params) => {
  for (const e in params) {
    const objProp = obj[e]
    const paramsProp = params[e]
    if (typeof objProp === 'object') {
      overwrite(objProp, paramsProp)
    } else obj[e] = paramsProp
  }
  return obj
}

export default overwrite
