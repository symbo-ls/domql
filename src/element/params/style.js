'use strict'

import { isObject, map } from '../../utils'
import Report from '../../utils/report'

/**
 * Recursively add styles to a DOM node
 */
export default (params, element, node) => {
  if (params) {
    if (isObject(params)) map(node.style, params, element)
    else Report('HTMLInvalidStyles', params)
  }
}
