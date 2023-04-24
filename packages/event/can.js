'use strict'

import { TAGS } from '@domql/registry'
import { report } from '@domql/report'

export const canRender = (element) => {
  const tag = element.tag || 'div'
  const isValid = TAGS.body.indexOf(tag) > -1
  return isValid || report('HTMLInvalidTag')
}
