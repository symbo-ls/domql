'use strict'

import { exec } from '../../utils'

export default (param, element, node) => {
  if (param) element.state = exec(param, element)
  return element
}
