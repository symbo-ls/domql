'use strict'

import set from '../set'
import { isEqualDeep } from '../../utils'

/**
 * Appends anything as content
 * an original one as a child
 */
export default (param, element, node, options) => {
  if (param && element) {
    if (param.__hash === element.content.__hash && element.content.update) {
      const { define } = element
      element.content.update(param)
    } else {
      set.call(element, param, options)
    }
  }
}
