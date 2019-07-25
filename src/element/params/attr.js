'use strict'

import Err from '../../res/error'

/**
 * Recursively add attributes to a DOM node
 */
export default (params, node) => {
  if (params) {
    if (!(typeof params === 'object')) Err('HTMLInvalidAttr', params)
    for (let attr in params) {
      node.setAttribute(attr, params[attr])
    }
  }
}
