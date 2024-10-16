'use strict'

import { exec, isObject, deepMerge } from '@domql/utils'
import { report } from '@domql/report'

/**
 * Apply data parameters on the DOM nodes
 * this should only work if `showOnNode: true` is passed
 */
export default (params, element, node) => {
  if (params) {
    if (element.props.attr) deepMerge(params, element.props.attr)
    if (params.showOnNode) {
      if (!isObject(params)) report('HTMLInvalidData', params)

      // Apply data params on node
      for (const dataset in params) {
        if (dataset !== 'showOnNode') {
          node.dataset[dataset] = exec(params[dataset], element)
        }
      }
    }
  }
}
