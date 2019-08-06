'use strict'

import Err from '../../res/error'
import method from '../method'

/**
 * Creates a text node and appends into
 * an original one as a child
 */
export default (param, element, node) => {
  if (param) {
    if (typeof param === 'string') {
      param = document.createTextNode(param)
      method.appendNode(param, node)
    } else Err('HTMLInvalidText', param)
  }
}
