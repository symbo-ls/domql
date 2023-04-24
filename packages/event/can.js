'use strict'

import { report } from '@domql/report'
import { isValidHtmlTag } from '@domql/utils'

export const canRender = (element) => {
  const tag = element.tag || 'div'
  return isValidHtmlTag(tag) || report('HTMLInvalidTag')
}
