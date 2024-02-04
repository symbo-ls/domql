'use strict'

import { report } from '@domql/report'
import { isValidHtmlTag } from '@domql/utils'

export const canRenderTag = (tag) => {
  return isValidHtmlTag(tag || 'div') || report('HTMLInvalidTag')
}
