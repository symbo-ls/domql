'use strict'

import cloneDeep from 'lodash.clonedeep'
import isObject from './isObject'

var deepMerge = (obj, original, cloneOriginal = true) => {
  original = cloneOriginal ? cloneDeep(original) : original
  for (const e in original) {
    const objProp = obj[e]
    const originalProp = original[e]
    if (objProp === undefined) {
      obj[e] = originalProp
    } else if (isObject(objProp)) {
      deepMerge(objProp, originalProp)
    }
  }
  return obj
}

export default deepMerge
