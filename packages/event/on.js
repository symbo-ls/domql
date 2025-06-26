'use strict'

import { DOMQL_EVENTS } from './keys.js'
import { isFunction } from './types.js'

const getOnOrPropsEvent = (param, element) => {
  const onEvent = element.on?.[param]
  const onPropEvent =
    element.props?.['on' + param.slice(0, 1).toUpperCase() + param.slice(1)]
  return onEvent || onPropEvent
}

export const applyEvent = (param, element, state, context, options) => {
  if (!isFunction(param)) return
  const result = param.call(
    element,
    element,
    state || element.state,
    context || element.context,
    options
  )
  if (result && typeof result.then === 'function') {
    result.then(() => {})
  }
  return result
}

export const triggerEventOn = (param, element, options) => {
  if (!element) {
    throw new Error('Element is required')
  }
  const appliedFunction = getOnOrPropsEvent(param, element)
  if (appliedFunction) {
    const { state, context } = element
    return applyEvent(appliedFunction, element, state, context, options)
  }
}

export const applyEventUpdate = (
  param,
  updatedObj,
  element,
  state,
  context,
  options
) => {
  if (!isFunction(param)) return
  const result = param.call(
    element,
    updatedObj,
    element,
    state || element.state,
    context || element.context,
    options
  )
  if (result && typeof result.then === 'function') {
    result.then(() => {})
  }
  return result
}

export const triggerEventOnUpdate = (param, updatedObj, element, options) => {
  const appliedFunction = getOnOrPropsEvent(param, element)
  if (appliedFunction) {
    const { state, context } = element
    return applyEventUpdate(
      appliedFunction,
      updatedObj,
      element,
      state,
      context,
      options
    )
  }
}

export const applyEventsOnNode = (element, options) => {
  const { node, on } = element
  for (const param in on) {
    if (DOMQL_EVENTS.includes(param)) continue

    const appliedFunction = getOnOrPropsEvent(param, element)
    if (isFunction(appliedFunction)) {
      node.addEventListener(param, event => {
        const { state, context } = element
        const result = appliedFunction.call(
          element,
          event,
          element,
          state,
          context,
          options
        )
        if (result && typeof result.then === 'function') {
          result.then(() => {})
        }
      })
    }
  }
}
