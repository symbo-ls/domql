'use strict'

import { nodes } from '../element'
import { report } from '../utils'

export const render = (element) => {
  var tag = element.tag || 'div'
  var isValid = nodes.body.indexOf(tag) > -1
  return isValid || report('HTMLInvalidTag')
}
