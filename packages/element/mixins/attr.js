'use strict'

import { exec, isNot, isNull, isUndefined } from '@domql/utils'
import { report } from '@domql/report'
import { deepMerge } from '../utils/index.js'

/**
 * Recursively add attributes to a DOM node
 */
export function attr(params, element, node) {
  const { __ref: ref, props } = element
  const { __attr } = ref
  if (isNot('object')) report('HTMLInvalidAttr', params)
  if (params) {
    if (props.attr) deepMerge(params, props.attr)
    for (const attr in params) {
      const val = exec(params[attr], element)
      // Skip setting the same attribute value to avoid unnecessary DOM writes
      // and side-effects like <img> refetching the same src
      if (__attr[attr] === val) continue
      if (
        val !== false &&
        !isUndefined(val) &&
        !isNull(val) &&
        node.setAttribute
      )
        node.setAttribute(attr, exec(val, element))
      else if (node.removeAttribute) node.removeAttribute(attr)
      __attr[attr] = val
    }
  }
}

export default attr
