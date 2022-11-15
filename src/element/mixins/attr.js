'use strict'

import { exec, report, isNot } from '../../utils'

/**
 * Recursively add attributes to a DOM node
 */
export default (params, element, node) => {
  const { __attr } = element
  if (isNot('object')) report('HTMLInvalidAttr', params)
  if (params) {
    for (const attr in params) {
      const val = exec(params[attr], element)
      // if (__attr[attr] === val) return
      if (val && node.setAttribute) node.setAttribute(attr, val)
      else if (node.removeAttribute) node.removeAttribute(attr)
      __attr[attr] = val
    }
  }
  console.groupEnd(params, __attr)
}
