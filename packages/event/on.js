'use strict'

import { isFunction } from '@domql/utils'

export const applyEvent = (param, element, state, context, options) => {
  return param.call(context?.window || window, element, state || element.state, context || element.context, options)
}

export const triggerEventOn = (param, element, options) => {
  if (element.on && isFunction(element.on[param])) {
    const { state, context } = element
    return applyEvent(element.on[param], element, state, context, options)
  }
}

export const applyEventUpdate = (param, updatedObj, element, state, context, options) => {
  return param.call(context?.window || window, updatedObj, element, state || element.state, context || element.context, options)
}

export const triggerEventOnUpdate = (param, updatedObj, element, options) => {
  if (element.on && isFunction(element.on[param])) {
    const { state, context } = element
    return applyEventUpdate(element.on[param], updatedObj, element, state, context, options)
  }
}

export const applyEventsOnNode = (element, options) => {
  const { node, on } = element
  for (const param in on) {
    if (
      param === 'init' ||
      param === 'beforeClassAssign' ||
      param === 'render' ||
      param === 'renderRouter' ||
      param === 'attachNode' ||
      param === 'stateInit' ||
      param === 'stateCreated' ||
      param === 'beforeStateUpdate' ||
      param === 'stateUpdate' ||
      param === 'beforeUpdate' ||
      param === 'update'
    ) continue

    const appliedFunction = element.on[param]
    if (isFunction(appliedFunction)) {
      node.addEventListener(param, event => {
        const { state, context } = element
        appliedFunction.call(context?.window || window, event, element, state, context, options)
        // appliedFunction(event, element, state, context, options)
      })
    }
  }
}
