'use strict'

import set from '../set'
import { measure } from '@domql/performance'

/**
 * Appends anything as content
 * an original one as a child
 */
export default (param, element, node, options) => {
  if (param && element) {
    if (param.__hash === element.content.__hash && element.content.update) {
      const { define } = element
      // if (define && !define.$setStateCollection)
      element.content.update(param)
    } else {
      measure('CONTENT: set: ' + element.key, () => {
        set.call(element, param, options)
      })
    }
  }
}
