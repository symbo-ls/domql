'use strict'

import { isFunction } from '@domql/utils'
import { registry } from './mixins'

export const applyParam = (param, element, options) => {
  const { node, context } = element
  const prop = element[param]

  const DOMQLProperty = registry[param]
  const DOMQLPropertyFromContext = context && context.registry && context.registry[param]
  const isGlobalTransformer = DOMQLPropertyFromContext || DOMQLProperty

  const hasDefine = element.define && element.define[param]
  const hasContextDefine = context && context.define && context.define[param]

  if (isGlobalTransformer && !hasContextDefine) {
    if (isFunction(isGlobalTransformer)) {
      isGlobalTransformer(prop, element, node, options)
      return
    }
  }

  return { hasDefine, hasContextDefine }
}
