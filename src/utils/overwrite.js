'use strict'

import isObject from './isObject'

var overwrite = (obj, params) => {
  for (const e in params) {
    const objProp = obj[e]
    const paramsProp = params[e]
    if (isObject(objProp) && isObject(paramsProp)) {
      overwrite(objProp, paramsProp)
    } else obj[e] = paramsProp
  }
  return obj
}

export default overwrite
