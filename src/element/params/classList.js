'use strict'

import Err from '../../res/error'

export default (param, element, node) => {
  if (param) {
    node.classList = param
  }
}
