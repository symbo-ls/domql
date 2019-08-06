'use strict'

var deepMerge = (obj, original) => {
  for (const e in original) {
    // if (e === 'proto') return
    const objProp = obj[e]
    const originalProp = original[e]
    if (!objProp) {
      obj[e] = originalProp
    } else if (typeof objProp === 'object') {
      deepMerge(objProp, originalProp)
    }
  }
  return obj
}

export default deepMerge
