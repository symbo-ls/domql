'use strict'

import cloneDeep from 'lodash.clonedeep'

var deepMerge = (obj, original, cloneOriginal = true) => {
  original = cloneOriginal ? cloneDeep(original) : original
  for (const e in original) {
    const objProp = obj[e]
    const originalProp = original[e]
    if (!objProp) {
      obj[e] = originalProp
    } else if (typeof objProp === 'object') {
      deepMerge(objProp, originalProp, true)
    }
  }
  return obj
}

export default deepMerge
