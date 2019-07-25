'use strict'

import Err from '../../res/error'

export default (params, node) => {
  if (params) {
    node.classList = params
  }
}
