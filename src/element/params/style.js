'use strict'

import { isObject, map } from '../../utils'
import Err from '../../res/error'

/**
 * Recursively add styles to a DOM node
 */
export default (params, element, node) => {
  if (params) {
    if (isObject(params)) map(node.style, params, element)
    else Err('HTMLInvalidStyles', params)
  }
}
