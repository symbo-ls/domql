'use strict'

import set from '../set'

/**
 * Appends anything as content
 * an original one as a child
 */
export default (param, element, node) => {
  if (param && element) {
    if (param.__hash === element.content.__hash && element.content.update) {
      element.content.update(param)
    } else {
      set.call(element, param)
    }
  }
}
