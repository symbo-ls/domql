'use strict'

import Err from '../../res/error'

export default (params, node) => {
  if (params) {
    if (typeof params === 'string') params = params.split(' ')
    node.classList.add(...params)
  }
}
