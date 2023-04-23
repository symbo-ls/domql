'use strict'

import set from '../set'

/**
 * Appends anything as content
 * an original one as a child
 */
export default (param, element, node, options) => {
  if (param && element) {
    if (element.content.update) {
      // if (!element.content.__ref) element.content.__ref = {}
      element.content.update(param)
    } else {
      // if (element.$setCollection || element.$setStateCollection || element.$setPropsCollection) return
      set.call(element, param, options)
    }
  }
}
