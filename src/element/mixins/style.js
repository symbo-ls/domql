'use strict'

import { isObject, map } from '@domql/utils'
import { report } from '@domql/report'

/**
 * Recursively add styles to a DOM node
 */
export default (params, element, node) => {
  if (params) {
    if (isObject(params)) map(node.style, params, element)
    else report('HTMLInvalidStyles', params)
  }
}
