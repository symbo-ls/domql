'use strict'

import { NODE_REGISTRY } from '@domql/node'
import { report } from '@domql/report'

export const render = (element) => {
  const tag = element.tag || 'div'
  const isValid = NODE_REGISTRY.body.indexOf(tag) > -1
  return isValid || report('HTMLInvalidTag')
}
