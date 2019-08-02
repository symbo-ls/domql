'use strict'

import utils from '../../utils'
import Err from '../../res/error'

/**
 * Recursively add styles to a DOM node
 */
export default (params, element, node) => {
  if (params) {
    if (typeof params === 'object') utils.map(node.style, params)
    else Err('HTMLInvalidStyles', params)
  }
}
