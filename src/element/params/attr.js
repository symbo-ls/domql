'use strict'

import Err from '../../res/error'

export default (params, node) => {
  if (params) {
    if (!(typeof params === 'object')) Err('HTMLInvalidAttr', params)
    for (let a in params) {
      node.setAttribute(a, params[a])
    }
  }
}
