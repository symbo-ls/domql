'use strict'

import Err from '../../res/error'

/**
 * Apply data parameters on the DOM nodes
 * this should only work if `toNode: true` is passed
 */
export default (params, element, node) => {
  if (params && params.toNode) {
    if (!(typeof params === 'object')) Err('HTMLInvalidData', params)

    // Apply data params on node
    for (let dataset in params) {
      if (dataset !== 'toNode')
        node.dataset[dataset] = params[dataset]
    }
  }
}
