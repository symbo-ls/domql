'use strict'

import { exec, isObject } from '../../utils'
import Report from '../../utils/report'

/**
 * Apply data parameters on the DOM nodes
 * this should only work if `showOnNode: true` is passed
 */
export default (params, element, node) => {
  if (params && params.showOnNode) {
    if (!isObject(params)) Report('HTMLInvalidData', params)

    // Apply data params on node
    for (const dataset in params) {
      if (dataset !== 'showOnNode') {
        node.dataset[dataset] = exec(params[dataset], element)
      }
    }
  }
}
