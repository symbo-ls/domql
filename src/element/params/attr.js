'use strict'

import Err from '../../res/error'
import exec from './exec'

/**
 * Recursively add attributes to a DOM node
 */
export default (params, element, node) => {
  if (params) {
    if (!(typeof params === 'object')) Err('HTMLInvalidAttr', params)
    for (const attr in params) {
      // if (!node) node = element.node
      var val = exec(params[attr], element)
      if (val) node.setAttribute(attr, val)
      else node.removeAttribute(attr)
    }
  }
}
