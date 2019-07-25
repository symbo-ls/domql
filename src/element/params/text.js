'use strict'

import Err from '../../res/error'
import method from '../method'

/**
 * Creates a text node and appends into 
 * an original one as a child
 */
export default (params, node) => {
  if (params) {
    if (typeof params === 'string') {
      params = document.createTextNode(params)
      method.appendNode(params, node)
    } else Err('HTMLInvalidText', params)
  }
}
