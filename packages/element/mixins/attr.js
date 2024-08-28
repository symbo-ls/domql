'use strict'

import { exec, isNot, isNull, isUndefined } from '@domql/utils'
import { report } from '@domql/report'

/**
 * Recursively add attributes to a DOM node
 */
export default (params, element, node) => {
  const { __ref } = element
  const { __attr } = __ref
  if (isNot('object')) report('HTMLInvalidAttr', params)
  if (params) {
    for (const attr in params) {
      const val = exec(params[attr], element)
      // if (__attr[attr] === val) return
      if (!isUndefined(val) && !isNull(val) && node.setAttribute) node.setAttribute(attr, val)
      else if (node.removeAttribute) node.removeAttribute(attr)
      __attr[attr] = val
    }
  }
  console.groupEnd(params, __attr)
}
