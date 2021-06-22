'use strict'

import { exec, isFunction, isObject } from '../../utils'

export default (params, element, node) => {
  element.props = exec(element.props, element)
  return element
}
