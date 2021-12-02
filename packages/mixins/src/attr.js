'use strict'

import { exec, report } from '@domql/utils'

/**
 * Recursively add attributes to a DOM node
 */
export const attr = (params, element, node) => {
  if (params) {
    if (!(typeof params === 'object')) report('HTMLInvalidAttr', params)
    for (const attr in params) {
      // if (!node) node = element.node
      const val = exec(params[attr], element)
      if (val && node.setAttribute) node.setAttribute(attr, val)
      else if (node.removeAttribute) node.removeAttribute(attr)
    }
  }
}
