'use strict'

import { DOMQL_EVENTS, isFunction } from '@domql/utils'

const getOnOrPropsEvent = (param, element) => {
  const onEvent = element.on?.[param]
  const onPropEvent =
    element.props?.['on' + param.slice(0, 1).toUpperCase() + param.slice(1)]
  return onEvent || onPropEvent
}

export const applyEvent = async (param, element, state, context, options) => {
  if (!isFunction(param)) return
  return await param.call(
    element,
    element,
    state || element.state,
    context || element.context,
    options
  )
}

export const triggerEventOn = async (param, element, options) => {
  if (!element) {
    throw new Error('Element is required')
  }
  const appliedFunction = getOnOrPropsEvent(param, element)
  if (appliedFunction) {
    const { state, context } = element
    return await applyEvent(appliedFunction, element, state, context, options)
  }
}

export const applyEventUpdate = async (
  param,
  updatedObj,
  element,
  state,
  context,
  options
) => {
  if (!isFunction(param)) return
  return await param.call(
    element,
    updatedObj,
    element,
    state || element.state,
    context || element.context,
    options
  )
}

export const triggerEventOnUpdate = async (
  param,
  updatedObj,
  element,
  options
) => {
  const appliedFunction = getOnOrPropsEvent(param, element)
  if (appliedFunction) {
    const { state, context } = element
    return await applyEventUpdate(
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
      node.addEventListener(param, async event => {
        const { state, context } = element
        await appliedFunction.call(
          element,
          event,
          element,
          state,
          context,
          options
        )
      })
    }
  }
}
