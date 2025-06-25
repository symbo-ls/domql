'use strict'

import { isFunction, isObject } from '@domql/utils'

/**
 * Apply data parameters on the DOM nodes
 * this should only work if `showOnNode: true` is passed
 */
export async function scope (params, element, node) {
  if (!isObject(params)) return

  // Apply data params on node
  for (const scopeItem in params) {
    const value = params[scopeItem]
    if (isFunction(value)) {
      element.scope[scopeItem] = value.bind(element)
    } else {
      element.scope[scopeItem] = value
    }
  }
}

export default scope
