'use strict'

import set from '../set'

/**
 * Appends anything as content
 * an original one as a child
 */
export default (param, element, node) => {
  if (param && element) {
    set.call(element, param)
  }
}
