'use strict'

import Err from '../../res/error'

export default (params, node) => {
  if (params) {
    if (!(typeof params === 'object')) Err('HTMLInvalidAttr', params)
    for (let attr in params) {
      node.setAttribute(attr, params[attr])
    }
  }
}
