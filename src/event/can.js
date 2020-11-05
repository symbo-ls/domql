'use strict'

import { nodes } from '../element'
import { report } from '../utils'

export const render = (element) => {
  const tag = element.tag || 'div'
  const isValid = nodes.body.indexOf(tag) > -1
  return isValid || report('HTMLInvalidTag')
}
