'use strict'

import isObject from '../../utils/isObject'

export default (params, element, node) => {
  if (params) {
    if (isObject(params))
      for (let attr in params) {
        if (attr === 'add') node.classList.add(params[attr])
        if (attr === 'remove') node.classList.remove(params[attr])
      }
    else
      node.classList = params
  }
}
