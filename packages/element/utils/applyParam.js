'use strict'

import { exec, isFunction } from '@domql/utils'
import { REGISTRY } from '../mixins/index.js'

export const applyParam = async (param, element, options) => {
  const { node, context, __ref: ref } = element
  const prop = await exec(element[param], element)

  const { onlyUpdate } = options

  const DOMQLProperty = REGISTRY[param]

  const DOMQLPropertyFromContext =
    context && context.registry && context.registry[param]
  const isGlobalTransformer = DOMQLPropertyFromContext || DOMQLProperty

  const hasDefine = element.define && element.define[param]
  const hasContextDefine = context && context.define && context.define[param]

  if (!ref.__if) return

  const hasOnlyUpdate = onlyUpdate
    ? onlyUpdate === param || element.lookup(onlyUpdate)
    : true

  if (isGlobalTransformer && !hasContextDefine && hasOnlyUpdate) {
    if (isFunction(isGlobalTransformer)) {
      const s = element.state || {}
      if (s.value === undefined) s.value = {}
      if (s.key === undefined && element?.key !== undefined) s.key = element.key
      if (s.parent === undefined) s.parent = element?.parent?.state || s.parent || {}
      await isGlobalTransformer(prop, element, node, { ...options, state: s })
    }
    return
  }

  return { hasDefine, hasContextDefine }
}
