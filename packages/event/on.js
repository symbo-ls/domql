'use strict'

import { isFunction } from '@domql/utils'

export const applyEvent = (param, element, state, context, updatedObj) => {
  if (updatedObj) return param(updatedObj, element, state || element.state, context || element.context)
  return param(element, state || element.state, context || element.context)
}

export const triggerEventOn = (param, element, updatedObj) => {
  if (element.on && isFunction(element.on[param])) {
    if (updatedObj) {
      const { state, context } = element
      return applyEvent(element.on[param], element, state, context, updatedObj)
    }
    return applyEvent(element.on[param], element)
  }
}

export const applyEventsOnNode = element => {
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
      param === 'initStateUpdated' ||
      param === 'stateUpdated' ||
      param === 'initUpdate' ||
      param === 'update'
    ) continue

    const appliedFunction = element.on[param]
    if (isFunction(appliedFunction)) {
      const { state, context } = element
      node.addEventListener(param, event => appliedFunction(event, element, state, context))
    }
  }
}
