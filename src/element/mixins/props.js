'use strict'

import { exec } from '../../utils'

export default (params, element, node) => {
  element.props = exec(element.props, element)
  return element
}
