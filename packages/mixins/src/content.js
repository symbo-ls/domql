'use strict'

import set from '@domql/element'

/**
 * Appends anything as content
 * an original one as a child
 */
export const content = (param, element, node) => {
  if (param && element) {
    if (param.__hash === element.content.__hash && element.content.update) {
      element.content.update(param)
    } else {
      set.call(element, param)
    }
  }
}
