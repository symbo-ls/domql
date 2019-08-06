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
      node.setAttribute(attr, exec(params[attr], element))
    }
  }
}
