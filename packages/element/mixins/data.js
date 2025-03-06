'use strict'

import { isObject, deepMerge, exec } from '@domql/utils'
import { report } from '@domql/report'

/**
 * Apply data parameters on the DOM nodes
 * this should only work if `showOnNode: true` is passed
 */
export function data (params, element, node) {
  if (params) {
    if (element.props.data) deepMerge(params, element.props.data)
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

export default data
