'use strict'

var deepMerge = (obj, original) => {
  for (let e in original) {
    let objProp = obj[e]
    let originalProp = original[e]
    if (!objProp) {
      obj[e] = originalProp
    } else if (typeof objProp === 'object') {
      deepMerge(objProp, originalProp)
    }
  }
  return obj
}

export default deepMerge
