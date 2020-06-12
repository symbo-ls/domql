'use strict'

import { isObject, map } from '../../utils'
import Report from '../../utils/report'

import { css } from 'emotion'

/**
 * Recursively add styles to a DOM node
 */
export default (params, element, node) => {
  if (params) {
    var { key } = element
    if (css) {
      var CSSed = css(params)
      if (isObject(element.class)) element.class.style = CSSed
      else if (typeof element.class === 'string') element.class += ` ${CSSed}`
      else if (element.class === true) element.class = { key, style: CSSed }
      else if (element.class === undefined) element.class = CSSed
    } else if (isObject(params)) map(node.style, params, element)
    else Report('HTMLInvalidStyles', params)
  }
}
