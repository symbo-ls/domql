'use strict'

import isObject from '../../utils/isObject'

export default (params, element) => {
  if (params) {
    var { node } = element
    if (isObject(params)) {
      for (const attr in params) {
        if (attr === 'add') node.classList.add(params[attr])
        if (attr === 'remove') node.classList.remove(params[attr])
      }
    } else { node.classList = params === true ? element.key : params.trim() }
  }
}
