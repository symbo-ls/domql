'use strict'

import Err from '../../res/error'
import method from '../method'

/**
 * Appends raw HTML as content
 * an original one as a child
 */
export default (params, node) => {
  if (params) {
    node.innerHTML = params
  }
}
