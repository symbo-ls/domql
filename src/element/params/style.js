'use strict'

import utils from '../../utils'
import Err from '../../res/error'

export default (params, node) => {
  if (params) {
    if (typeof params === 'object') utils.map(node.style, params)
    else Err('HTMLInvalidStyles', params)
  }
}
